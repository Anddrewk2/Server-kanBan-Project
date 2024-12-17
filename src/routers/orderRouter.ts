// routes/orderRoutes.ts

import express from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/orderController';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// Route để tạo đơn hàng
router.post('/create', verifyToken, createOrder);

// Route để lấy danh sách đơn hàng của người dùng
router.get('/', verifyToken, getUserOrders);

// Route để lấy chi tiết một đơn hàng cụ thể
router.get('/:orderId', verifyToken, getOrderById);

export default router;
