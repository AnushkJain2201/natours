const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('./../controllers/authController');

const {getAllReviews, createReview, setTourUserIds, getReview} = reviewController;
const { protect, restrictTo } = authController;

// Here, we are giving options of mergeParams to true in order for reviewRoutes to get access to the tourId param in the nested URL
const router = express.Router({ mergeParams: true });

// Noone can access any route without being authenticated
router.use(protect);

router.route('/').get(getAllReviews).post(restrictTo('user'), setTourUserIds, createReview);
router.route('/create').post(restrictTo('user'), createReview);

router.route('/:id').get(getReview).patch(restrictTo('user', 'admin'), reviewController.updateReview).delete(restrictTo('user', 'admin'), reviewController.deleteReview);


module.exports = router;