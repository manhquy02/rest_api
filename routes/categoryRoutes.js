const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const categoryController = require('../controllers/categoryController');


router.get('/categories', categoryController.getCategory);




module.exports = router;