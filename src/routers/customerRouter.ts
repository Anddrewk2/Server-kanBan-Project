/** @format */

import { Router } from 'express';
import {
	create,
	getVerifiCode,
	resendCode,
	login,
	getProfile,
	update,
} from '../controllers/customers';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post('/add-new', create);
router.put('/verify', getVerifiCode);
router.get('/resend-verify', resendCode);
router.post('/login', login);
router.get('/getProfile', getProfile)

router.use(verifyToken);
router.put('/update', update);
export default router;