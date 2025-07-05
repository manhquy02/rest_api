function checkPermission(action = 'read') {
    return (req, res, next) => {
        console.log('🟡 Kiểm tra permission trong token:', req.user);
        const { permission_level } = req.user;

        if (action !== 'read' && permission_level !== 'fix') {
            return res.status(200).json({ return: 0, message: 'Không được phép ' });
        }

        next();
    };
}

module.exports = checkPermission;