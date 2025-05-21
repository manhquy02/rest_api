const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(200).json({
            result: 0,
            message: 'token not provinded'
        })
    }

    jwt.verify(token, jwt_secret, (err, user) => {
        if (err) {
            return res.status(200).json({
                result: 0,
                message: 'token is invalid or expired'
            })
        }
        req.user = user;
        next();
    })
}

module.exports = authenticateToken;