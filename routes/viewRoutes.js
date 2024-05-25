const express = require('express');
const veiwController = require('../controllers/viewController');
const router = express.Router();



router.get('/', veiwController.getOverview);

router.get('/tour/:slug', veiwController.getTour);

router.get('/login', veiwController.getLoginForm);

module.exports = router;



