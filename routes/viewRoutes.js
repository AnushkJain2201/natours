const express = require('express');
const veiwController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();


router.use(authController.isLoggedIn);
router.get('/', veiwController.getOverview);

router.get('/tour/:slug', veiwController.getTour);

router.get('/login', veiwController.getLoginForm);

module.exports = router;



