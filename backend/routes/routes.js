const express = require('express');
const router = express.Router();
const { generatePlan, showPlans } = require('../controllers/controller');

router.post('/user-data', generatePlan);
router.get('/plans', showPlans);

module.exports = router;