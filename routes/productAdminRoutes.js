const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const authenticateToken = require('../middlewares/authenticateToken');
const productAdminController = require('../controllers/productAdminController');
const upload = require('../middlewares/uploads');

router.get('/products',productAdminController.getAllProducts);

router.get('/products/show',productAdminController.getProductByReq);

router.get('/products/:id',productAdminController.getProductById);

router.post('/products',authenticateToken, upload.single('image'),productAdminController.createProduct);

router.put('/products/:id',authenticateToken,upload.single('image'),productAdminController.updateProduct);

router.delete('/products/:id',authenticateToken,productAdminController.deleteProduct);

module.exports = router;
