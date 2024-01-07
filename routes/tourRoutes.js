const express = require('express');
const tourController = require('./../controllers/tourController');

// destructuring to get all the exported handlers
const {getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours, getTourStats} = tourController;

const router = express.Router();

router.route('/tour-stats').get(getTourStats);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;