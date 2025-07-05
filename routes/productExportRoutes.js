const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const productExportController = require('../controllers/productExportController');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/products',productExportController.getAllProduct);



module.exports = router;





