const express = require('express');
const { getAllProducts, getSingleProduct, deleteProduct, updateProduct, createProduct, uploadImage } = require('../controllers/productController');
const { authorizePermissions, authenticateUser } = require('../middleware/authentication');
const { getSingleProductReviews } = require('../controllers/reviewController');
const router = express.Router();

router.route('/').get(getAllProducts).post(authenticateUser, authorizePermissions('admin'), createProduct);
router.route('/:id').get(getSingleProduct).patch(authenticateUser, authorizePermissions('admin'), updateProduct).delete(authenticateUser, authorizePermissions('admin'), deleteProduct);
router.route('/uploadImage').post(authenticateUser, authorizePermissions('admin'), uploadImage);
router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;