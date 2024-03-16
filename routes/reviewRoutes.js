const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');

const {getAllReviews, createReview} = reviewController;
const { protect, restrictTo } = authController;

const router = express.Router();

router.route('/').get(getAllReviews);
router.route('/create').post(protect, restrictTo('user'), createReview);

module.exports = router;