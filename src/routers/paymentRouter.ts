import { Router } from 'express';
import { handleSendMail } from '../utils/handleSendMail';
import { handlePayment } from '../controllers/paymentController';
import path from 'path';
import { readFileSync } from 'fs';


const htmlFile = path.join(__dirname, '../../mails/paymentdone.html');

const html = readFileSync(htmlFile, 'utf-8');

const router = Router();

router.post('/charge', handlePayment);

export default router;
