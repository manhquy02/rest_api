const { date } = require('joi');
const connection = require('../models/db');

exports.getAllUsers = async (req, res) => {
    const{username,page,limit}=req.query;
    let query = `select id,username,email,role,permission_level from users where 1 = 1`
    let countQuery = `select count(*) as total from users where 1 = 1`
    let params = [];
    let countParams = [];
    try {
        if(username){
            query += ` and username like ?`
            countQuery += ` and username like ?`
            params.push(`%${username}%`)
            countParams.push(`%${username}%`)
        }
        if(limit && page && !isNaN(page) && !isNaN(limit)){
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const offset = (pageNum - 1) * limitNum;
             
            query += ` limit ${limitNum} offset ${offset}`;
            const [[{total}]] = await connection.execute(countQuery,countParams);
            const totalPages = Math.ceil(total / limitNum);
            const [result] = await connection.execute(query,params)
            return res.status(200).json({result:1,data:result,pagination:{page:pageNum,limit:limitNum,totalPages,total_items:total}})
        }
        const [results] = await connection.execute(query,params);
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

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await connection.execute('select username,email,role,permission_level from users where id = ?', [id]);
        if (results.length === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy người dùng' })
        res.status(200).json({ result: 1, data: results[0] });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'Lỗi' });
    }
}

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
    const {role, permission_level } = req.body;

    try {
        const [users] = await connection.execute('select * from users where id = ?', [id]);
        if (users.length === 0) {
            res.status(200).json({ result: 0, message: 'Không tìm thấy người dùng' })
        }
        const currentUser = users[0];
        const finalRole = role || currentUser.role;
        const finalPermission = permission_level || currentUser.permission_level;


        const [result] = await connection.execute('update users set  role= ? , permission_level = ? where id = ?', [finalRole, finalPermission, id]);

        if (result.affectedRows === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy người dùng' });
        res.json({ result: 1,message:('Cập nhật thành công '), data: { id,role:finalRole, permission_level:finalPermission } });

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