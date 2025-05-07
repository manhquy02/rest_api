const express = require('express');
const connection = require('./db');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 5555;
const validator = require('validator')


app.use(bodyParser.json());
app.use(express.json());

app.get('/users',async (req,res)=>{
    try{
        const [results] = await connection.execute('select username,email from users');
        res.status(200).json({result:1,data:results});

    } catch (err) {
        console.error(err);
        res.status(200).json({result:0,message:'error'});
    }
    
});



app.get('/users/:id',async (req,res)=>{
    const {id}= req.params;
    try{
        const [results] = await connection.execute('select username,email from users where id = ?',[id]);
        if(results.length === 0) return res.status(200).json({result:0,message:'user not found'})
        res.status(200).json({result:1,data:results[0]});

    } catch (err) {
        console.error(err);
        res.status(200).json({result:0,message:'error'});
    }
    
});

app.post('/users', async (req,res)=>{
    const {username,email,password} = req.body;
    try{
        const [result] = await connection.execute('insert into users (username,email,password) values(?,?,?)',[username,email,password]);
    
    res.status(200).json({result:1,data:{id:result.insertId,username,email,password}});
    } catch (err){
        console.error(err);
        res.status(200).json({result:0,message:'error'})
    }
});



// app.post('/users',authenticateToken, async (req,res)=>{
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

app.put('/users/:id', async (req,res)=>{
    const {id} = req.params;
    const {username,email,password} = req.body;
    try{
        const [result] = await connection.execute('update users set username = ? , email = ? , password = ? where id = ?',[username,email,password,id]);
  
    if(result.affectedRows ===0) return res.status(200).json({result:0,message:'user not found'});
    res.json({result:1,message:'user updated successfully'});
    } catch (err){
        res.status(200).json({result:0,message:'error'})
    }
})


// app.put('/users/:id',authenticateToken, async (req,res)=>{
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


app.delete('/users/:id', async (req,res)=>{
    const {id} = req.params;
    try{
        const [result] = await connection.execute('delete from users where id = ? ',[id]);
        if(result.affectedRows === 0) return res.status(200).json({result:0,message:'user not found'});
        res.json({result:1,message:'user deleted'})
    } catch (err){
        res.status(200).json({result:0,message:'error'})
    }
})


app.post('/register', async(req,res)=>{
    const {username,email,password} = req.body;

    if(!username || !email || !password){
        return res.status(200).json({result:0,message:"All fields (username, email, password) are required"})
    }
    if (!validator.isEmail(email)){
        return res.status(200).json({result:0,message:"Invalid email"})
    }
    if (!validator.isStrongPassword(password)){
        return res.status(200).json({result:0,message:"Password is not strong enough"})
    }
    try{
        const[exitsting] = await connection.execute('select * from users where email = ?',[email]);
        if(exitsting.length > 0 ) return res.status(200).json({result:0,message:"Email already exits"});
        const hashedPassword = await bcrypt.hash(password,10);

        await connection.execute('insert into users (username,email,password) values(?,?,?)',[username,email,hashedPassword]
        );
        res.status(200).json({result:1,message:"User registered successfully"})
    } catch (err){
        res.status(200).json({result:0,message:"Error"})
    }
})



const jwt = require('jsonwebtoken');
const jwt_secret = 'ad9a4q$#%#$^#avwen8an4vaHDKD857&&RR';

app.post('/login', async (req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(200).json({result:0,message:"email and password are required"})
    }
    try{
        const[users]= await connection.execute('select * from users where email = ?',[email]);
        const user = users[0];
        if(!user) return res.status(200).json({result:0,message:"invalid email or password"});

        const match = await bcrypt.compare(password,user.password);
        if(!match) return res.status(200).json({result:0,message:"invalid email or password"});

        const token = jwt.sign({id:user.id, email: user.email},jwt_secret,{expiresIn:'1h'});
        res.status(200).json({result:1,message:'login successful',token});
    } catch (err){
        res.status(200).json({result:0,message:"error"});
    }
})


function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token,jwt_secret,(err,user)=>{
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    })
}

app.get('/test-token', authenticateToken,async (req, res) => {
    const userId = req.user.id;
    try{
        const [result] = await connection.execute('select id,username,email from users where id = ?',[userId]);
        res.json(result[0]);
    } catch (err){
        console.log(err);
        res.status(500).send('error')
    }
  });


  app.get('/product', async (req,res)=>{
  
    try{
    const [result1]= await connection.execute(`select * from product `);
    if(!result1 || result1.length === 0) return res.status(200).json({result:0,message:'no products found'})    
    res.status(200).json({result:1,data:result1});
    } catch (err){
        res.status(200).json({result:0,message:'err'})
    }
    });


app.get('/product1', async (req,res)=>{
   
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const offset = (page-1)*limit;
    try{
    const [result1]= await connection.execute(`select * from product limit ${limit} offset ${offset}`);
    if(!result1 || result1.length === 0) return res.status(200).json({result:0,message:'no products found'})    
    res.status(200).json({result:1,data:result1});
    } catch (err){
        res.status(200).json({result:0,message:'err'})
    }
    });

app.get('/product/:id',async (req,res)=>{
    const {id} = req.params;
    try{
        const[result2] = await connection.execute('select * from product where id = ?',[id]);
        if(!result2 || result2.length === 0 ) return res.status(200).json({result:0,message:'not found'})
            res.status(200).json({result:1,data:result2})
    } catch(err){
        res.status(200).json({result:0,message:'err'})
    }
});

app.post('/product',authenticateToken, async (req,res)=>{
    const {name_product,price} = req.body;

    if(price < 0 || price > 10000000){
        return res.status(200).json({result:0,message:'price must than to 0 '})
    }
    try{
        const[exiting]= await connection.execute('select * from product where name_product = ?',[name_product]);
        if(exiting.length > 0 ) return res.status(200).json({result:0,message:'product exit'})
     
    const[result3]=await connection.execute('insert into product(name_product,price) values (?,?)',[name_product,price]);
        res.status(200).json({result:1,data:{id:result3.insertId,name_product,price}});
        
        }catch(err){
            res.status(200).json({result:0,message:'err'})
        }
})
app.put('/product/:id',authenticateToken, async (req,res)=>{
    const {id} = req.params;
    const {name_product,price}= req.body;

    if(!name_product || !price){
        return res.status(200).json({result:0,message:'Product name and price are required'})
    }
    if(price < 0){
        return res.status(200).json({result:0,message:'price must than to 0 '})
    }

    try{

        const [checkname] = await connection.execute('select * from product where name_product = ? and id !=?',[name_product,id]);

        if(checkname.length > 0){ return res.status(200).json({ result: 0, message: 'Product name already exists' });}

        const[exit2] = await connection.execute('select * from product where id = ?', [id]);
        if(exit2.length === 0) { return res.status(200).json({result:0,message:'not found'})}

        const[updateResult] = await connection.execute('update product set name_product = ?, price= ? where id= ?',[name_product,price,id]);
        if(updateResult.affectedRows === 0 ){ return res.status(200).json({result:0,message:'failed update '})}

    
    res.status(200).json({result:1,message:'updated successfully ',data:{id:updateResult.insertId,name_product,price}})

    }catch(err){
        console.log(err)
        res.status(200).json({result:0,message:'err'})
    }
})



app.get('/orders',async (req,res)=>{
    try{
        const [result] = await connection.execute('select * from product');
        if(result.length === 0 ) return res.status(200).json({result:0,message:'không tìm thấy dữ liệu'})
            res.status(200).json({result:1,data:result});
    }catch(err){
       res.status(200).json({result:0,message:'lỗi'})
    }
})
app.get('/orders/:id', async (req,res)=>{
    const {id}=req.params;
    try{
        const [result]= await connection.execute('select * from product where id = ?',[id]);
        if(result.length === 0) return res.status(200).json({result:0,message:'không tìm thấy dữ liệu'})
            res.status(200).json({result:1,data:result});
        
    }catch(err){
        res.status(200).json({result:0,message:'lỗi'})
    }
})



app.listen(port,()=>{
    console.log(`running at:${port}`)
})

