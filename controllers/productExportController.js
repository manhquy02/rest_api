const connection = require('../models/db');
const ExcelJs = require('exceljs');

exports.getAllProduct = async (req, res) => {
    try {
        const [product] = await connection.execute('select p.*,c.name as category_name from products p join categories c on p.category_id = c.id');

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Product');

        worksheet.columns = [
            { header: 'Id', key: 'id', width: 10 },
            { header: 'Ảnh', key: 'image', width: 30 },
            { header: 'Tên sản phẩm', key: 'name_product', width: 40 },
            { header: 'Danh mục', key: 'category_name', width: 30 },
            { header: 'Giá', key: 'price', width: 20 },
            { header: 'Số lượng', key: 'stock', width: 10 },
        ]

        product.forEach(product => {
            worksheet.addRow(product)
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ result: 0, message: 'Lỗi hệ thống' })
    }
}

