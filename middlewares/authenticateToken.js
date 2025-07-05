const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(200).json({
            result: 0,
            message: 'Chưa có token'
        })
    }

    jwt.verify(token, jwt_secret, (err, user) => {
        if (err) {
            return res.status(200).json({
                result: 0,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            })
        }
        req.user = user;
                console.log(req.user)

        next();
    })
}

module.exports = authenticateToken;