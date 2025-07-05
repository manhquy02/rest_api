const connection = require('../models/db');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;


exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(200).json({ result: 0, message: "Tất cả các trường (tên người dùng, email, mật khẩu) đều bắt buộc" })
    }
    if (!validator.isEmail(email)) {
        return res.status(200).json({ result: 0, message: "Email không hợp lệ" })
    }
    if (!validator.isStrongPassword(password)) {
        return res.status(200).json({ result: 0, message: "Mật khẩu cần bao gồm ít nhất 8 kí tự, có chữ in hoa , in thường, số,kí tự đặc biệt " })
    }
    try {
        const permission_level = 'none';
        const role = 'user';

        const [exitsting] = await connection.execute('select * from users where email = ?', [email]);
        if (exitsting.length > 0) return res.status(200).json({ result: 0, message: "Email đã tồn tại" });
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.execute('insert into users (username,email,password,role,permission_level) values(?,?,?,?,?)', [username, email, hashedPassword,role,permission_level]
        );
        res.status(200).json({ result: 1, message: "Đăng ký thành công" })
    } catch (err) {
        res.status(200).json({ result: 0, message: "Lỗi" })
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(200).json({ result: 0, message: "Điền đầy đủ email và mật khẩu" })
    }
    try {
        const [users] = await connection.execute('select * from users where email = ?', [email]);
        const user = users[0];
        if (!user) return res.status(200).json({ result: 0, message: "Email hoặc mật khẩu không hợp lệ" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(200).json({ result: 0, message: "Email hoặc mật khẩu không hợp lệ 2" });

        const token = jwt.sign({ id: user.id, email: user.email }, jwt_secret,{expiresIn:'100d'});
        res.status(200).json({ result: 1, message: 'Đăng nhập thành công', token,email: user.email,id:user.id});
    } catch (err) {
        console.log(err)
       
        res.status(200).json({ result: 0, message: "Lỗi" });
    }
}