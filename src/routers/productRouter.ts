
import { Router } from 'express';
import {
	
	addProduct,
	addSubProduct,
	filterProducts,
	getBestSellers,
	getFilterValues,
	getProductDetail,
	getProducts,
	removeProduct,
	removeSubProduct,
	updateProduct,
	updateSubProduct,
} from '../controllers/products';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.get('/detail', getProductDetail);
router.get('/', getProducts);
router.get('/get-filter-values', getFilterValues);


router.use(verifyToken);
router.use('/get-best-seller' , getBestSellers)
router.post('/add-new', addProduct);
router.post('/add-sub-product', addSubProduct);
router.delete('/delete', removeProduct);
router.put('/update', updateProduct);
router.delete('/remove-sub-product', removeSubProduct);
router.put('/update-sub-product', updateSubProduct);
router.post('/filter-products', filterProducts);

export default router;