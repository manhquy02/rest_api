const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const authenticateToken = require('../middlewares/authenticateToken');
const productController = require('../controllers/productController');


router.get('/products',productController.getAllProducts);

router.get('/products/search',productController.getProductBySearch);

router.get('/products/:id',productController.getProductById);

router.post('/products',authenticateToken,productController.createProduct);

router.put('/products/:id',authenticateToken,productController.updateProduct);




module.exports = router;



// router.get('/products', async (req,res)=>{
  
//     try{
//         let query = "select * from products";
        
//     const page = parseInt(req.query.page);
//     const limit = parseInt(req.query.limit);
//     const offset = (page-1)*limit;

//     if (limit && paage) {
//        query += ` limit ${limit} offset ${offset}`;
//     }

//     const [result1]= await connection.execute(query);
//     if(!result1 || result1.length === 0) return res.status(200).json({result:0,message:'no products found'})    
//     res.status(200).json({result:1,data:result1});
//     } catch (err){
//         console.log(err)
//         res.status(200).json({result:0,message:'err'})
//     }
//     });
