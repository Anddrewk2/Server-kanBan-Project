import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia', // Đảm bảo rằng bạn đang sử dụng đúng phiên bản API
});

// Hàm tạo payment method với type là 'card'
export const createPaymentMethod = async (cardToken: string) => {
  try {
    // Tạo payment method từ token
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card', // Loại phương thức thanh toán là 'card'
      card: {
        token: cardToken, // Dùng token thẻ từ client
      },
    });

    console.log('Payment method created:', paymentMethod);
    return paymentMethod;
  } catch (error: any) {
    console.error('Error creating payment method:', error);
    throw new Error('Lỗi khi tạo payment method');
  }
};

// Xử lý thanh toán với PaymentIntent
export const handleStripePayment = async (amount: number, cardToken: string) => {
  try {
    console.log('Đang gửi yêu cầu thanh toán với token thẻ:', cardToken);

    // Kiểm tra token có hợp lệ không
    if (!cardToken) {
      throw new Error('Token thẻ không hợp lệ');
    }

    // Tạo payment method với token thẻ
    const paymentMethod = await createPaymentMethod(cardToken);

    // Tạo PaymentIntent với payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Số tiền cần thanh toán (đơn vị tiền tệ nhỏ nhất, ví dụ: cents)
      currency: 'vnd', // Đơn vị tiền tệ mặc định
      payment_method: paymentMethod.id, // Gán payment method vào PaymentIntent
      confirm: true, // Xác nhận PaymentIntent ngay lập tức
      return_url: 'http://localhost:3004', // URL để chuyển hướng người dùng sau khi thanh toán
    });

    console.log('Thanh toán thành công:', paymentIntent);
    return paymentIntent;
  } catch (error: any) {
    // Xử lý lỗi từ Stripe API
    console.error('Stripe Error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API Error: ${error.message}`);
    }

    // Xử lý lỗi liên quan đến thẻ thanh toán
    if (error.type === 'StripeCardError') {
      throw new Error(`Lỗi thẻ: ${error.message}`);
    }

    // Xử lý các lỗi khác
    throw new Error('Đã xảy ra lỗi khi xử lý thanh toán');
  }
};

// Xử lý yêu cầu POST để thanh toán cho khách hàng
export const chargeCustomer = async (req: any, res: any) => {
  const { cardToken, amount } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!cardToken || !amount) {
    return res.status(400).json({ error: 'Thiếu token thẻ hoặc số tiền thanh toán.' });
  }

  try {
    // Gọi hàm thanh toán với cardToken và amount
    const paymentIntent = await handleStripePayment(amount, cardToken);

    // Trả về kết quả thanh toán thành công
    res.status(200).json({
      message: 'Thanh toán thành công',
      paymentIntent,
    });
  } catch (error: any) {
    // Trả về lỗi nếu thanh toán không thành công
    console.error('Thanh toán thất bại:', error);
    res.status(500).json({
      error: error.message || 'Đã xảy ra lỗi khi xử lý thanh toán',
    });
  }
};
