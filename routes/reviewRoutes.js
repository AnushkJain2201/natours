const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');

const {getAllReviews, createReview} = reviewController;
const { protect, restrictTo } = authController;

// Here, we are giving options of mergeParams to true in order for reviewRoutes to get access to the tourId param in the nested URL
const router = express.Router({ mergeParams: true });

router.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);
router.route('/create').post(protect, restrictTo('user'), createReview);

router.route('/:id').delete(reviewController.deleteReview);


module.exports = router;