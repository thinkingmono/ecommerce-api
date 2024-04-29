const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');


const createReview = async (req, res) => {
    const { product: productId } = req.body
    const { userId } = req.user

    if (!productId) {
        throw new CustomError.NotFoundError('Please send product id')
    }

    const isValidProduct = await Product.findOne({ _id: productId });

    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    const alreadySubmitted = await Review.findOne({ product: productId, user: userId })

    if (alreadySubmitted) {
        throw new CustomError.BadRequestError('Already submitted review for this product');
    }

    req.body.user = req.user.userId;

    const review = await Review.create(req.body);

    res.status(StatusCodes.CREATED).json({ review });
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate({
        path: 'product',
        select: 'name price'
    }).populate({
        path: 'user',
        select: 'name email'
    });;
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
}

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        throw new CustomError.NotFoundError(`Review with id ${id} not found`);
    }

    res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        throw new CustomError.NotFoundError(`Review with id ${id} not found`);
    }

    checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    review.save();

    res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        throw new CustomError.NotFoundError(`Review with id ${id} not found`);
    }

    checkPermissions(req.user, review.user);

    review.remove();

    res.status(StatusCodes.OK).json({ review, msg: 'Review Removed' })
}

const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;

    const reviews = await Review.find({ 'product': productId });

    res.status(StatusCodes.OK).json({ reviews });
}

module.exports = { createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleProductReviews };