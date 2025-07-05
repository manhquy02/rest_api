const express = require('express');
const router = express.Router();
const connection = require('../models/db')
const orderAdminController = require('../controllers/orderAdminController');
const authenticateToken = require('../middlewares/authenticateToken');


router.post('/orders', authenticateToken, orderAdminController.createOrder);

router.get('/orders', authenticateToken, orderAdminController.getOrders);
router.get('/orders/history', authenticateToken, orderAdminController.getOrderHistory);
router.get('/orders/:id', authenticateToken, orderAdminController.getOrderById);

module.exports = router;