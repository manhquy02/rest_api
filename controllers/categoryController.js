const connection = require('../models/db');

exports.getCategory = async (req, res) => {
    try {
        const [results] = await connection.execute('select * from categories');
        res.status(200).json({ result: 1, data: results });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'Lỗi' });
    }
}