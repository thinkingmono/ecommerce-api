const { StatusCodes } = require('http-status-codes');
const Product = require('../models/Product')
const CustomError = require('../errors');
const path = require('path');

const createProduct = async (req, res) => {
    const { user } = req;
    req.body.user = user.userId;

    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
}

const getAllProducts = async (req, res) => {
    const products = await Product.find();
    let msg = ""
    if (products.length === 0) {
        msg = "There are no products created"
    } else {
        msg = "Success!"
    }
    res.status(StatusCodes.OK).json({ products, count: products.length, msg });
}

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId }).populate('reviews')

    if (!product) {
        throw new CustomError.NotFoundError(`Product with id ${id} not found`);
    }

    res.status(StatusCodes.OK).json({ product, msg: 'Success!' });
}

const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findByIdAndUpdate({ _id: productId }, req.body, { new: true, runValidators: true });

    if (!product) {
        throw new CustomError.NotFoundError(`Product with id ${id} not found`);
    }

    res.status(StatusCodes.OK).json({ product });
}

//findByIdAndRemove
// const deleteProduct = async (req, res) => {
//     const { id: productId } = req.params;
//     const product = await Product.findByIdAndRemove({ _id: productId });

//     if (!product) {
//         throw new CustomError.NotFoundError(`Product with id ${id} not found`);
//     }

//     res.status(StatusCodes.OK).json({ product, msg: "Product Deleted" });
// }

//product.remove()
const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
        throw new CustomError.NotFoundError(`Product with id ${id} not found`);
    }

    await product.remove();

    res.status(StatusCodes.OK).json({ product, msg: "Success! Product Deleted" });
}

const uploadImage = async (req, res) => {
    if (!req.files) {
        throw new CustomError.BadRequestError('No file uploaded')
    }

    const productImage = req.files.image;

    if (!productImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError('Please upload an image');
    }

    const maxSize = 1024 * 1024;

    if (productImage.size > maxSize) {
        throw new CustomError.BadRequestError('Please upload image smaller than 1MB');
    }

    const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);
    await productImage.mv(imagePath);

    return res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
}

module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage }