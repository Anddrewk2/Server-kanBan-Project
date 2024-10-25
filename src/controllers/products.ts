/** @format */

import CategoryModel from '../models/CategortModel';
import ProductModel from '../models/ProductModel';
import SubProductModel from '../models/SubProductModel';

interface SelectModel {
	label: string;
	value: string;
}
const addProduct = async (req: any, res: any) => {
	const body = req.body;
	try {
		const newProduct = new ProductModel(body);
		console.log(newProduct)
		await newProduct.save();

		res.status(200).json({
			message: 'Products',
			data: newProduct,
		});
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const getProducts = async (req: any, res: any) => {
	const { page, pageSize, title } = req.query;

	await checkDeletedProduct();

	const filter: any = {};

	filter.isDeleted = false;

	if (title) {
		filter.slug = { $regex: title };
	}

	try {
		const skip = (page - 1) * pageSize;

		const products = await ProductModel.find(filter).skip(skip).limit(pageSize);

		const total = await ProductModel.find({
			isDeleted: false,
		});

		const items: any = [];

		if (products.length > 0) {
			products.forEach(async (item: any) => {
				const children = await SubProductModel.find({
					productId: item._id,
					isDeleted: false,
				});

				items.push({
					...item._doc,
					subItems: children,
				});

				items.length === products.length &&
					res.status(200).json({
						message: 'Products',
						data: { items, totalItems: total.length },
					});
			});
		} else {
			res.status(200).json({
				message: 'Products',
				data: [],
			});
		}
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const checkDeletedProduct = async () => {
	// console.log('Get and check deleted product about 30 days from now');
	/*

		const productDeleted = await ProductModel.find({
			isDeleted: true
		})
	

		productDeleted.forEach(product => {


		const users = await userModel.find({
			favouritest: {$all: product_id}
		})

		if(users.length === 0)
			remove product
		})
	*/
};

const getProductDetail = async (req: any, res: any) => {
	const { id } = req.query;
	try {
		const item = await ProductModel.findById(id);
		const subProducts = await SubProductModel.find({
			productId: id,
			isDeleted: false,
		});

		res.status(200).json({
			message: 'Products',
			data: {
				product: item,
				subProducts,
			},
		});
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const removeSubProduct = async (req: any, res: any) => {
	const { id, isSoftDelete } = req.query;
	try {
		if (isSoftDelete) {
			await SubProductModel.findByIdAndUpdate(id, {
				isDeleted: true,
			});
		} else {
			await SubProductModel.findByIdAndDelete(id);
		}

		res.status(200).json({
			message: 'Removed!!!',
		});
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const updateSubProduct = async (req: any, res: any) => {
	const { id } = req.query;
	const body = req.body;
	try {
		await SubProductModel.findByIdAndUpdate(id, body);

		res.status(200).json({
			message: 'Updated!!!',
		});
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const addSubProduct = async (req: any, res: any) => {
	const body = req.body;

	try {
		const subProduct = new SubProductModel(body);

		await subProduct.save();

		res.status(200).json({
			message: 'Add sub product successfully!!!',
			data: subProduct,
		});
		console.log(subProduct)
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const handleRemoveSubProduct = async (items: any[]) => {
	items.forEach(async (item) => {
		await SubProductModel.findByIdAndUpdate(item._id, {
			isDeleted: true,
		});
	});
};

const removeProduct = async (req: any, res: any) => {
	const { id } = req.query;

	try {
		const subItems = await SubProductModel.find({ productId: id });

		if (subItems.length > 0) {
			await handleRemoveSubProduct(subItems);
		}

		await ProductModel.findByIdAndUpdate(id, {
			isDeleted: true,
		});

		res.status(200).json({
			message: 'Product removed!!',
		});
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const updateProduct = async (req: any, res: any) => {
	const { id } = req.query;
	const body = req.body;

	try {
		await ProductModel.findByIdAndUpdate(id, body);

		res.status(200).json({
			message: 'Product updated!!',
		});
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const getFilterValues = async (req: any, res: any) => {
	try {
		const datas = await SubProductModel.find();

		const colors: string[] = [];
		const sizes: SelectModel[] = [];
		const prices: number[] = [];

		if (datas.length > 0) {
			datas.forEach((item) => {
				item.color && !colors.includes(item.color) && colors.push(item.color);
				item.size && sizes.push({ label: item.size, value: item.size });
				prices.push(item.price);
			});
		}

		// console.log(datas);

		res.status(200).json({
			message: 'fafa',
			data: {
				colors,
				prices,
				sizes,
			},
		});
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

const filterProducts = async (req: any, res: any) => {
	const body = req.body;

	const { colors, size, price, categories } = body;
	let filter: any = {};

	if (colors && colors.length > 0) {
		filter.color = { $all: colors };
	}

	if (size) {
		filter.size = { $eq: size };
	}

	if (price && price.length > 0) {
		filter['$and'] = [
			{
				price: { $lte: price[1] },
			},
			{
				price: {
					$gte: price[0],
				},
			},
		];
	}



	try {
		const subProducts = await SubProductModel.find(filter);

		if (categories) {
		} else {
		}

		const productIds: string[] = [];
		const products: any = [];
		if (subProducts.length > 0) {
			subProducts.forEach(
				(item) =>
					!productIds.includes(item.productId) &&
					productIds.push(item.productId)
			);

			productIds.forEach(async (id) => {
				const product: any = await ProductModel.findById(id);
				const children = subProducts.filter(
					(element) => element.productId === id
				);
				const items = { ...product._doc, subItems: children };

				products.push(items);

				if (products.length === productIds.length) {
					res.status(200).json({
						data: {
							items: products,
							totalItems: products.length,
						},
					});
				}
			});
		} else {
			res.status(200).json({ data: [] });
		}
	} catch (error: any) {
		res.status(404).json({
			message: error.message,
		});
	}
};

export {
	getProducts,
	addProduct,
	addSubProduct,
	removeProduct,
	getProductDetail,
	updateProduct,
	getFilterValues,
	filterProducts,
	removeSubProduct,
	updateSubProduct,
};