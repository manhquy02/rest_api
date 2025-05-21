const express = require('express');
const router = express.Router();
const connection = require('../models/db');

const addressController = require('../controllers/addressController');

router.get('/provinces',addressController.getAllProvinces);

router.get('/districts',addressController.getAllDistricts);

router.get('/wards',addressController.getAllWards);

module.exports = router;