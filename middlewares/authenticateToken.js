// const jwt = require('jsonwebtoken');
// const jwt_secret = 'ad9a4q$#%#$^#avwen8an4vaHDKD857&&RR';

// function authenticateToken(req,res,next){
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if(!token) return res.sendStatus(401);

//     jwt.verify(token,jwt_secret,(err,user)=>{
//         if(err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     })
// }

// module.exports = authenticateToken;