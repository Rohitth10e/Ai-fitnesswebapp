const express = require('express');
const router = express.Router();
const { generatePlan, showPlans, generateNarration } = require('../controllers/controller');

router.post('/generate-plan', generatePlan);
router.get('/plans', showPlans);
router.post('/generate-narration', generateNarration);

module.exports = router;