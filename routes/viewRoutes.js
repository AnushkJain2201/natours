const express = require('express');
const veiwController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, veiwController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, veiwController.getTour);

router.get('/login', authController.isLoggedIn, veiwController.getLoginForm);

router.get('/me', authController.protect, veiwController.getAccount);

module.exports = router;



