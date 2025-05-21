const express = require('express');
const router = express.Router();
const connection = require('../models/db');
const userController = require('../controllers/userController');


router.get('/users',userController.getAllUsers);

router.get('/users/:id',userController.getUserById);

router.post('/users', userController.createUser);

router.put('/users/:id',userController.updateUser);

router.delete('/users/:id',userController.deleteUser);

module.exports = router;


// router.post('/users',authenticateToken, async (req,res)=>{
//     const {username,email,password} = req.body;
//     try{
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const [result] = await connection.execute(
//             'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
//             [username, email, hashedPassword]
//           );
//     res.status(201).send({id: result.insertId,username,email});
//     } catch (err){
//         console.error(err);
//         res.status(500).send('error')
//     }
// });

// {result:0,message:'error'}
// json({result:1,data:results});

// router.put('/users/:id',authenticateToken, async (req,res)=>{
//     const {id} = req.params;
//     const {username,email} = req.body;


//     console.log("req.user.id --- ", req.user.id);
//     console.log("parseInt(id) --- ", parseInt(id));


//     if(req.user.id !== parseInt(id)){
//         return res.status(403).send('you do not have permission211')
//     }

//     try {

//         const [result] = await connection.execute('update users set username = ? , email = ?  where id = ?',[username,email,id]);
  
//     if(result.affectedRows ===0) return res.status(404).send('user not found');
//     res.send('user updated successfully');
//     } catch (err){
//         res.status(500).send('error')
//     }
// })



