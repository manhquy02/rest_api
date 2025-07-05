const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const authenticateToken = require('../middlewares/authenticateToken');
const productController = require('../controllers/productController');
const upload = require('../middlewares/uploads');

router.get('/products',productController.getAllProducts);

router.get('/products/show',productController.getProductByReq);

router.get('/products/:id',productController.getProductById);

router.post('/products',authenticateToken, upload.single('image'),productController.createProduct);

router.put('/products/:id',authenticateToken,upload.single('image'),productController.updateProduct);

router.delete('/products/:id',authenticateToken,productController.deleteProduct);

module.exports = router;
