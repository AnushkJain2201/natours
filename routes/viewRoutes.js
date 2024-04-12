const express = require('express');
const veiwController = require('../controllers/viewController');
const router = express.Router();



router.get('/', veiwController.getOverview);

router.get('/tour', veiwController.getTour);

module.exports = router;