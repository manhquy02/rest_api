const express = require('express');
const router = express.Router();
const connection = require('../models/db')
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/orders', authenticateToken, orderController.createOrder);

// router.get('/orders',orderController.getAllOrder);

// router.get('/orders',orderController.getOrderBySearch);


// router.get('/orders/:id', orderController.getOrderById);


router.get('/orders', orderController.getOrders);

router.get('/orders/:id', orderController.getOrderById);


module.exports = router;