const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('./../controllers/authController');


const { protect, restrictTo } = authController;

const router = express.Router();

router.get('/checkout-session/:tourID', protect, bookingController.getCheckoutSession);


module.exports = router;