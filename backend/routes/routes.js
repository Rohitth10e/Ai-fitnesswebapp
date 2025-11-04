const express = require('express');
const router = express.Router();
const { generatePlan, showPlans, generateNarration, generateImage, deletePlan } = require('../controllers/controller');

router.post('/generate-plan', generatePlan);
router.get('/plans', showPlans);
router.post('/generate-narration', generateNarration);
router.post('/generate-image', generateImage);
router.delete('/plans/:id', deletePlan);

module.exports = router;