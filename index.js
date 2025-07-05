require('dotenv').config();
const express = require('express');
const connection = require('./models/db');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 5555;
const multer = require('multer');
const cookieParser = require('cookie-parser');



const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const authAdminRoutes = require('./routes/authAdminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userAdminRoutes = require('./routes/userAdminRoutes');
const productAdminRoutes = require('./routes/productAdminRoutes');
const userExportRoutes = require('./routes/userExportRoutes');
const productExportRoutes = require('./routes/productExportRoutes');
const orderAdminRoutes = require('./routes/orderAdminRoutes');



app.use(bodyParser.json());
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('frontend'));
app.use('/uploads', express.static('uploads'));
app.use(cookieParser());


app.use('/', userRoutes);
app.use('/', productRoutes);
app.use('/', authRoutes);
app.use('/admin', authAdminRoutes);
app.use('/', orderRoutes);
app.use('/', addressRoutes);
app.use('/', categoryRoutes);
app.use('/admin', userAdminRoutes);
app.use('/admin', productAdminRoutes);
app.use('/admin', orderAdminRoutes);

app.use('/export',userExportRoutes);
app.use('/export',productExportRoutes);




app.listen(port, () => {
    console.log(`running at:${port}`)
})