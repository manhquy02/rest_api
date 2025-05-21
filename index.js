    require('dotenv').config();
    const express = require('express');
    const connection = require('./models/db');
    const bodyParser = require('body-parser');
    const bcrypt = require('bcrypt');
    const app = express();
    const cors = require('cors');

    const port = 5555;

    const userRoutes = require('./routes/userRoutes');
    const productRoutes = require('./routes/productRoutes');
    const authRoutes = require('./routes/authRoutes');
    const orderRoutes = require('./routes/orderRoutes');
    const addressRoutes = require('./routes/addressRoutes');

    app.use(bodyParser.json());
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('frontend'));

    app.use('/', userRoutes);
    app.use('/', productRoutes);
    app.use('/', authRoutes);
    app.use('/', orderRoutes);
    app.use('/', addressRoutes);



    app.listen(port, () => {
        console.log(`running at:${port}`)
    })