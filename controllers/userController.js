const connection = require('../models/db');
const {getUserByIdSchema} = require('../schemas/userSchema');

exports.getAllUsers = async (req, res) => {
    try {
        const [results] = await connection.execute('select username,email,role,permission_level from users');
        res.status(200).json({ result: 1, data: results });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'Lỗi' });
    }
}


exports.getUserByEmail = async (req, res) => {
    const { email } = req.query;
    try {
        const [results] = await connection.execute('select username,email from users where email = ?', [email]);
        if (results.length === 0) return res.status(200).json({ result: 0, message: 'Không thấy người dùng' })
        res.status(200).json({ result: 1, data: results[0] });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'Lỗi' });
    }
}

// exports.getUserByEmail = async (req,res) => {
//     const schema = Joi.object({
//         email : Joi.string().email().required()
//     })
//     try{
//         const {email} = await schema.validateAsync(req.query)
//         const [result] = await connection.execute('select * from users where email = ?',[email]);
//         if(result.length === 0){
//             return res.status(404).json({result:0,message:'khong tim thay'})
//         }
//         res.status(200).json({result:1,data:result[0]})

//     }catch(err){
//         if(err.isJoi){
//             return res.status(400).json({result:0,message: err.details[0].message})
//         }
//         res.status(500).json({result:0,message:'Loi'})
//     }
// }

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await connection.execute('select username,email,role from users where id = ?', [id]);
        if (results.length === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy người dùng' })
        res.status(200).json({ result: 1, data: results[0] });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'Lỗi' });
    }
}

// exports.getUserById = async (req,res) => {
 
//     try{
//         const {id} = await getUserByIdSchema.validateAsync(req.params)
//         const [result] = await connection.execute('select * from users where id = ?',[id]);
//         if(result.length === 0){
//             return res.status(404).json({result:0,message:'khong tim thay'})

//         }
//         res.status(200).json({result:1,data:result[0]})
//     }catch(err){
//         if(err.isJoi){
//             return res.status(400).json({result:0,message:err.details[0].message})
//         }
//          return res.status(500).json({result:0,message:'Loi he thong'})
//     }
// }

exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const [result] = await connection.execute('insert into users (username,email,password) values(?,?,?)', [username, email, password]);

        res.status(200).json({ result: 1, data: { id: result.insertId, username, email, password } });
    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password,role } = req.body;
    
    try {
        const [result] = await connection.execute('update users set username = ? , email = ? , password = ? , role= ?  where id = ?', [username, email, password,role, id]);

        if (result.affectedRows === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy người dùng' });
        res.json({ result: 1, data: { id, username, email, password,role } });
    } catch (err) {
        console.log(err)
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.execute('delete from users where id = ? ', [id]);
        if (result.affectedRows === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy người dùng' });
        res.json({ result: 1, message: 'Người dùng đã được xóa' })
    } catch (err) {
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}