const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const userExportController = require('../controllers/userExportController');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/users',userExportController.getAllUsers);



module.exports = router;





