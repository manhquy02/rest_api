const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const authAdminController = require('../controllers/authAdminController');
const jwt_secret = require('../middlewares/authenticateToken')

router.post('/register', authAdminController.register);

router.post('/login', authAdminController.login);




module.exports = router;