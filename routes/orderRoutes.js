const express = require('express');
const router = express.Router();
const connection = require('../models/db')
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/authenticateToken');


router.post('/orders', authenticateToken, orderController.createOrder);

router.get('/orders', authenticateToken, orderController.getOrders);
router.get('/orders/history', authenticateToken, orderController.getOrderHistory);
router.get('/orders/:id', authenticateToken, orderController.getOrderById);

module.exports = router;