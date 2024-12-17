// models/OrderModel.ts

import mongoose, { Schema, Document } from 'mongoose';

interface OrderItem {
    productId: string;      // ID của sản phẩm chính (String)
    subProductId?: string;  // ID của sản phẩm phụ (String)
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    count: number;
    grandTotal:number
}

export interface OrderDocument extends Document {
    user: string;           // UID của người dùng (String)
    address: string;        // ID địa chỉ giao hàng (String)
    paymentMethod: string;
    items: OrderItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
    productId: { type: String, required: true },
    subProductId: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    size: { type: String },
    color: { type: String },
    count: { type: Number, required: true, min: 1 },

});

const OrderSchema: Schema = new Schema(
    {
        user: { type: String, required: true, ref: 'User' },
        address: { type: String, required: true, ref: 'Address' },
        paymentMethod: { type: String, required: true },
        items: { type: [OrderItemSchema], required: true },
        totalAmount: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
);

const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema);
export default OrderModel;
