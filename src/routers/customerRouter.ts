/** @format */

import { Router } from 'express';
import {
	create,
	getVerifiCode,
	resendCode,
	login,
	getProfile,
} from '../controllers/customers';

const router = Router();

router.post('/add-new', create);
router.put('/verify', getVerifiCode);
router.get('/resend-verify', resendCode);
router.post('/login', login);
router.get('/getProfile', getProfile)
export default router;