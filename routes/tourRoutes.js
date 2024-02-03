const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

// destructuring to get all the exported handlers
const {getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan} = tourController;
const {protect} = authController;

const router = express.Router();

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/').get(protect, getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;