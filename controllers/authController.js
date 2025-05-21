const connection = require('../models/db');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;


exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(200).json({ result: 0, message: "All fields (username, email, password) are required" })
    }
    if (!validator.isEmail(email)) {
        return res.status(200).json({ result: 0, message: "Invalid email" })
    }
    if (!validator.isStrongPassword(password)) {
        return res.status(200).json({ result: 0, message: "Password is not strong enough" })
    }
    try {
        const [exitsting] = await connection.execute('select * from users where email = ?', [email]);
        if (exitsting.length > 0) return res.status(200).json({ result: 0, message: "Email already exits" });
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.execute('insert into users (username,email,password) values(?,?,?)', [username, email, hashedPassword]
        );
        res.status(200).json({ result: 1, message: "User registered successfully" })
    } catch (err) {
        res.status(200).json({ result: 0, message: "Error" })
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(200).json({ result: 0, message: "email and password are required" })
    }
    try {
        const [users] = await connection.execute('select * from users where email = ?', [email]);
        const user = users[0];
        if (!user) return res.status(200).json({ result: 0, message: "invalid email or password" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(200).json({ result: 0, message: "invalid email or password" });

        const token = jwt.sign({ id: user.id, email: user.email }, jwt_secret, { expiresIn: '1h' });
        res.status(200).json({ result: 1, message: 'login successful', token });
    } catch (err) {
        console.log(err)
        console.log(err)
        res.status(200).json({ result: 0, message: "error" });
    }
}