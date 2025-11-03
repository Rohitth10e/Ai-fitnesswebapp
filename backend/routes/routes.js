const express = require('express');
const router = express.Router();
const { generatePlan, showPlans } = require('../controllers/controller');

router.post('/generate-plan', generatePlan);
router.get('/plans', showPlans);

module.exports = router;