const express = require('express');
const router = express.Router();
const { getUserData } = require('../controllers/controller');

router.post('/user-data', getUserData);

export default router;