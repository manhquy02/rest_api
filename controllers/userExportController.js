const connection = require('../models/db');
const ExcelJs = require('exceljs');

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await connection.execute('select id,username,email,role,permission_level from users');
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('user');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Role', key: 'role', width: 10 },
            { header: 'Permission Level', key: 'permission_level', width: 20 },
        ];

        users.forEach((user) => {
            worksheet.addRow(user)
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

        await workbook.xlsx.write(res);
        res.end();
        

    } catch (err) {
        console.log(err)
        res.status(500).json({ result: 0, message: 'Lỗi xuất file' })
    }

}

