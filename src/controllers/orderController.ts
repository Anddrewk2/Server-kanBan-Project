// controllers/orderController.ts

import OrderModel from '../models/orderModel';
import CartModel from '../models/CartModel';
import AddressModel from '../models/AddressModel';
import mongoose from 'mongoose';
import { handleSendMail } from '../utils/handleSendMail';

/**
 * Controller để tạo và lưu đơn hàng
 */
const createOrder = async (req: any, res: any) => {
    const uid = req.uid;
    const { addressId, paymentMethod } = req.body;

    if (!uid) {
        return res.status(401).json({ message: 'Unauthorized: UID missing' });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Kiểm tra địa chỉ giao hàng
        const address = await AddressModel.findOne({ _id: addressId, createdBy: uid }).session(session);
        if (!address) {
            throw { status: 404, message: 'Địa chỉ giao hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.' };
        }

        // Lấy tất cả các mục giỏ hàng của người dùng
        const cartItems = await CartModel.find({ createdBy: uid }).session(session);
        if (!cartItems || cartItems.length === 0) {
            throw { status: 400, message: 'Giỏ hàng của bạn đang trống.' };
        }

        // Tính tổng số tiền
        const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.count || 0), 0);
        const SumOrder = cartItems.reduce((sum: number , item:any )=>sum + (item.count)|| 0 , 0) 

        // Tạo đơn hàng
        const order = new OrderModel({
            user: uid, // Giả sử uid là string đại diện cho User ID
            address: addressId,
            paymentMethod: paymentMethod,
            items: cartItems.map((item: any) => ({
                productId: item.productId,
                subProductId: item.subProductId,
                quantity: item.qty,
                price: item.price,
                size: item.size,
                color: item.color,
                count: item.count,
            })),
            totalAmount: totalAmount,
        });

        await order.save({ session });
        console.log(cartItems);

        // Làm sạch giỏ hàng sau khi đặt hàng thành công
        await CartModel.deleteMany({ createdBy: uid }).session(session);

        // Commit Transaction
        await session.commitTransaction();
        session.endSession();

       // Gửi email xác nhận cho admin
        const mailData = {
            
            to: 'vu.ha09176@sinhvien.hoasen.edu.vn', // Địa chỉ email của admin
            subject: 'Xác nhận đơn hàng mới',
            html: `
                <p>Đơn hàng mới đã được tạo thành công với mã ID: ${order._id}</p>
                <p>Thông tin chi tiết:</p>
                <ul>
                    <li>Tổng số tiền: ${totalAmount}</li>
                    <li>Phương thức thanh toán: ${paymentMethod}</li>
                    <li>Địa chỉ giao hàng: ${address.address}</li>
                    <li>Số sản phẩm: ${SumOrder}</li>
                </ul>
            `,
        };

        // Gọi hàm gửi email
        await handleSendMail(mailData);

        return res.status(201).json({
            message: 'Đơn hàng đã được tạo thành công và thông báo đã được gửi cho admin.',
            data: order,
        });
    } catch (error: any) {
        // Abort Transaction
        await session.abortTransaction();
        session.endSession();

        console.error('Error creating order:', error);

        return res.status(error.status || 500).json({ message: error.message || 'Đã xảy ra lỗi khi tạo đơn hàng.' });
    }
};

/**
 * Controller để lấy danh sách đơn hàng của người dùng
 */
const getUserOrders = async (req: any, res: any) => {
    const uid = req.uid;

    if (!uid) {
        return res.status(401).json({ message: 'Unauthorized: UID missing' });
    }

    try {
        const orders = await OrderModel.find({ user: uid })
            .populate('address')
            .populate('items.productId')
            .populate('items.subProductId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Lấy danh sách đơn hàng thành công.',
            data: orders,
        });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đơn hàng.' });
    }
};

/**
 * Controller để lấy chi tiết một đơn hàng cụ thể
 */
const getOrderById = async (req: any, res: any) => {
    const uid = req.uid;
    const { orderId } = req.params;

    if (!uid) {
        return res.status(401).json({ message: 'Unauthorized: UID missing' });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ.' });
    }

    try {
        const order = await OrderModel.findOne({ _id: orderId, user: uid })
            .populate('address')
            .populate('items.productId')
            .populate('items.subProductId');

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        return res.status(200).json({
            message: 'Lấy chi tiết đơn hàng thành công.',
            data: order,
        });
    } catch (error: any) {
        console.error('Error fetching order:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết đơn hàng.' });
    }
};

export {
    createOrder,
    getUserOrders,
    getOrderById,
};
