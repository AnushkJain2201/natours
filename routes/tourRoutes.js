const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');

const reviewRouter = require("./reviewRoutes");

// destructuring to get all the exported handlers
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan } = tourController;
const { protect, restrictTo } = authController;
// const {createReview} = reviewController;

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

// Here we are getting distances of a particular point from all the tours starting point
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);

router.route('/').get(getAllTours).post(protect, restrictTo('admin', 'lead-guide'), createTour);

router.route('/:id').get(getTour).patch(protect, restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, updateTour).delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// router.route('/:tourId/reviews').post(protect, restrictTo('user'), createReview);

module.exports = router;