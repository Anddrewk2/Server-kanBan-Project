
import { Router } from 'express';
import {
	getCategoryDetail,
    getCategories, 
    addCategory,
    updateCategory,
    deleteCategories,

} from '../controllers/categories';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.get('/categories/detail', getCategoryDetail);
router.get('/get-categories', getCategories);
router.use(verifyToken);
router.post('/add-category', addCategory);
router.delete('/delete-category', deleteCategories);
router.put('/update-category', updateCategory);


export default router;