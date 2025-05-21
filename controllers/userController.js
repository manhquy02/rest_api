const connection = require('../models/db');

exports.getAllUsers = async (req, res) => {
    try {
        const [results] = await connection.execute('select username,email from users');
        res.status(200).json({ result: 1, data: results });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'error' });
    }
}

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await connection.execute('select username,email from users where id = ?', [id]);
        if (results.length === 0) return res.status(200).json({ result: 0, message: 'user not found' })
        res.status(200).json({ result: 1, data: results[0] });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'error' });
    }
}

exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const [result] = await connection.execute('insert into users (username,email,password) values(?,?,?)', [username, email, password]);

        res.status(200).json({ result: 1, data: { id: result.insertId, username, email, password } });
    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'error' })
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
        const [result] = await connection.execute('update users set username = ? , email = ? , password = ? where id = ?', [username, email, password, id]);

        if (result.affectedRows === 0) return res.status(200).json({ result: 0, message: 'user not found' });
        res.json({ result: 1, data: { id, username, email, password } });
    } catch (err) {
        res.status(200).json({ result: 0, message: 'error' })
    }
}

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.execute('delete from users where id = ? ', [id]);
        if (result.affectedRows === 0) return res.status(200).json({ result: 0, message: 'user not found' });
        res.json({ result: 1, message: 'user deleted' })
    } catch (err) {
        res.status(200).json({ result: 0, message: 'error' })
    }
}