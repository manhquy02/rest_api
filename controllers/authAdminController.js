const connection = require('../models/db');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
const refresh_secret = process.env.REFRESH_SECRET;


exports.register = async (req, res) => {
    const { username, email, password,role,permission_level } = req.body;
    const finalPermission = permission_level || 'read'

    if (!username || !email || !password) {
        return res.status(200).json({ result: 0, message: "Điền đầy đủ thông tin" })
    }
    if (!validator.isEmail(email)) {
        return res.status(200).json({ result: 0, message: "Email không hợp lệ" })
    }
    if (!validator.isStrongPassword(password)) {
        return res.status(200).json({ result: 0, message: "Mật khẩu cần bao gồm ít nhất 8 kí tự, có chữ in hoa , in thường, số,kí tự đặc biệt " })
    }
    try {
        const [exitsting] = await connection.execute('select * from users where email = ?', [email]);
        if (exitsting.length > 0) {
            if (exitsting[0].role.split(',').includes('admin')) {
                return res.status(200).json({ result: 0, message: "Email đã tồn tại" });
            } else {
                const updatedRole = exitsting[0].role === 'user' ? 'user,admin' : 'admin'
                await connection.execute('update users set role = ? where email = ?', [updatedRole, email])
                return res.status(200).json({ result: 1, message: "Đăng ký thành công" });
            }

        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.execute('insert into users (username,email,password,role,permission_level) values(?,?,?,?,?)', [username, email, hashedPassword, 'admin',finalPermission]
            );
            res.status(200).json({ result: 1, message: "Đăng ký thành công" })
        }
    } catch (err) {
        console.log(err)
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

        if (!user.role.split(',').includes('admin')) {
            return res.status(200).json({ result: 0, message: "Email hoặc mật khẩu không hợp lệ" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(200).json({ result: 0, message: "Email hoặc mật khẩu không hợp lệ" });

        const token = jwt.sign({ id: user.id, email: user.email,role:user.role, permission_level:user.permission_level }, jwt_secret, { expiresIn: '7d' });

        // const refreshToken = jwt.sign({ id: user.id, email: user.email }, refresh_secret, { expiresIn: '7d' })

        // await connection.execute('insert into refresh_tokens(user_id,token,expires_at) values (?,?,date_add(now(),interval 7 day))', [user.id, refreshToken])

        // res.cookie('refreshToken', refreshToken, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: 'Lax',
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // })

        res.status(200).json({ result: 1, message: 'Đăng nhập thành công', token: token, email: user.email, id: user.id,role: user.role,permission_level:user.permission_level });
    } catch (err) {
        console.log(err)

        res.status(200).json({ result: 0, message: "Lỗi" });
    }
}

// exports.refreshToken = async (req, res) => {
//     try {
//         const refreshToken = req.cookies.refreshToken;
//         if (!refreshToken) {
//             return res.status(200).json({ result: 0, message: "Không có refersh token" });
//         }
//         const [result] = await connection.execute('select * from refresh_tokens where token = ?', [refreshToken]);
//         if (result.length === 0) {
//             return res.status(200).json({ result: 0, message: "Không tồn tại token trong hệ thống" });
//         }
//         jwt.verify(refreshToken, refresh_secret, (err, decode) => {
//             if (err) {
//                 return res.status(200).json({ result: 0, message: 'Token không hợp lệ hoặc hết hạn' });
//             }
//             const token = jwt.sign(
//                 {id:decode.id,email:decode.email},
//                 jwt_secret,
//                 {expiresIn:'15m'}
//             );
//             return res.status(200).json({ result: 1, message: 'Tạo lại token thành công',token:token });
//         })
//     } catch (err) {
//         res.status(200).json({ result: 0, message: 'lỗi hệ thống' });
//     }

// }