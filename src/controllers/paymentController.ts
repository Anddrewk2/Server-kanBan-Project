// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import { handleStripePayment } from '../services/stripe';


const handlePayment = async (req: Request, res: Response): Promise<void> => {
  const { amount, token } = req.body;  // Nhận token từ client

  // Kiểm tra dữ liệu đầu vào
  if (!amount || !token) {
    res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ: Thiếu amount hoặc token.',
    });
    return;
  }

  try {
    // Tạo Payment Intent bằng token (không gửi thẻ tín dụng trực tiếp)
    const paymentIntent = await handleStripePayment(amount, token);
    res.status(200).json({
      success: true,
      message: 'Thanh toán thành công!',
      paymentIntent,
    });
  } catch (error: any) {
    console.error('Stripe Error:', error); // Ghi log lỗi chi tiết
    res.status(400).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi.',
    });
  }
};

export { handlePayment }