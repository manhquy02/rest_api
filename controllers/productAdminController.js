const { compareSync } = require('bcrypt');
const connection = require('../models/db');

// exports.getAllProducts = async (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit);
//     const sort = req.query.sort;
//     try {
//         console.log({ page, limit, sort });
//         let sortClause = '';
//         if (sort && (sort.toLowerCase() === 'asc' || sort.toLowerCase() === 'desc')) {
//             sortClause = ` ORDER BY price ${sort.toUpperCase()}`;
//         }

//         let sql = `SELECT * FROM products${sortClause}`;
//         if (page && limit) {
//             const offset = (page - 1) * limit;
//             sql += ` LIMIT ${limit} OFFSET ${offset}`;
//         }
//         const [result] = await connection.execute(sql);

//         if (!result || result.length === 0)
//             return res.status(200).json({ result: 0, message: 'no products found' })

//         const [[countResult]] = await connection.execute('select count(*) as total from products ')
//         const total_items = countResult.total;


//         const totalPages = Math.ceil(total_items / limit);

//         res.status(200).json({ result: 1, data: result, pagination: { per_page: limit || total_items, total_pages: totalPages, total_items: total_items, current_page: page || 1 } });
//     } catch (err) {
//         console.log(err)
//         res.status(200).json({ result: 0, message: 'err' })
//     }
// }

// exports.getProductBySearch = async (req, res) => {
//     const { name_product } = req.query;
//     console.log(name_product)
//     try {
//         const [result] = await connection.execute('select * from products where name_product like ?', [`%${name_product}%`]);
//         if (result.length === 0) {
//             console.log(result)
//             return res.status(200).json({ result: 0, message: 'not found' })
//         }
//         res.status(200).json({ result: 1, data: result })
//     } catch (err) {
//         console.log(err)
//         res.status(200).json({ result: 0, message: 'err' })
//     }
// }

// exports.getProductByPrice = async (req, res) => {
//     const { min_price, max_price } = req.query;

//     if (!min_price || !max_price) {
//         return res.status(200).json({ result: 0, message: 'min_price and max_price are required' });
//     }
//     try {
//         const [result] = await connection.execute('select * from products where price between ? and ?', [min_price, max_price])
//         if (result.length === 0) {
//             console.log(result)
//             return res.status(200).json({ result: 0, message: 'not found' })
//         }
//         res.status(200).json({ result: 1, data: result })
//     } catch (err) {
//         console.log(err)
//         res.status(200).json({ result: 0, message: 'err' })
//     }

// }

exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [result2] = await connection.execute('select * from products where isDelete = 0 and id = ?', [id]);
        if (!result2 || result2.length === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy' })
        res.status(200).json({ result: 1, data: result2 })
    } catch (err) {
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}


exports.createProduct = async (req, res) => {
    const { name_product, price, category_id, description, stock } = req.body;
    const image = req.file?.filename || null;
    if (!name_product) {
        return res.status(200).json({ result: 0, message: 'Chưa điền tên sản phẩm' });
    }
    if (!price) {
        return res.status(200).json({ result: 0, message: 'Chưa điền giá sản phẩm' });
    }
    if (price < 0) {
        return res.status(200).json({ result: 0, message: 'Giá phải lớn hơn 0 ' })
    }
    if (!category_id) {
        return res.status(200).json({ result: 0, message: 'Chưa điền danh mục sản phẩm' });
    }
    if (!description) {
        return res.status(200).json({ result: 0, message: 'Chưa điền mô tả sản phẩm' });
    }
    if (!image) {
        return res.status(200).json({ result: 0, message: 'Chưa điền ảnh sản phẩm' });
    }
    if (!stock) {
        return res.status(200).json({ result: 0, message: 'Chưa điền số lượng của sản phẩm' });
    }
    if (stock < 0) {
        return res.status(200).json({ result: 0, message: 'Số lượng phải lớn hơn 0 ' })
    }

    try {
        const [categoryRows] = await connection.execute('SELECT id FROM categories WHERE id = ?', [category_id]);

        if (categoryRows.length === 0) {
            return res.status(400).json({ message: 'Category_id không trùng với id có sẵn của categories' });
        }
        const [exiting] = await connection.execute('select * from products where name_product = ?', [name_product]);
        if (exiting.length > 0) return res.status(200).json({ result: 0, message: 'Sản phẩm đã tồn tại' })

        const [result3] = await connection.execute('insert into products(name_product,price,category_id,description,image,stock) values (?,?,?,?,?,?)', [name_product, price, category_id, description, image, stock]);

        res.status(200).json({ result: 1, data: { id: result3.insertId, name_product, price, category_id, description, image, stock } });

    } catch (err) {
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name_product, price, category_id, description, stock } = req.body;
    const image = req.file?.filename || req.body.old_image || null;

    if (!name_product) {
        return res.status(200).json({ result: 0, message: 'Chưa điền tên sản phẩm' });
    }
    if (!price) {
        return res.status(200).json({ result: 0, message: 'Chưa điền giá sản phẩm' });
    }
    if (price < 0) {
        return res.status(200).json({ result: 0, message: 'Giá phải lớn hơn 0 ' })
    }
    if (price > 100000000) {
        return res.status(200).json({ result: 0, message: 'Giá nhập tối đa 100 triệu ' })
    }
    if (!category_id) {
        return res.status(200).json({ result: 0, message: 'Chưa điền danh mục sản phẩm' });
    }
    if (!description) {
        return res.status(200).json({ result: 0, message: 'Chưa điền mô tả sản phẩm' });
    }
    if (!image) {
        return res.status(200).json({ result: 0, message: 'Chưa điền ảnh sản phẩm' });
    }
    if (!stock) {
        return res.status(200).json({ result: 0, message: 'Chưa điền số lượng tồn kho của sản phẩm' });
    }
    if (stock < 0) {
        return res.status(200).json({ result: 0, message: 'Số lượng phải lớn hơn 0 ' })
    }


    try {

        const [checkname] = await connection.execute('select * from products where name_product = ? and id !=?', [name_product, id]);

        if (checkname.length > 0) { return res.status(200).json({ result: 0, message: 'Tên sản phẩm đã tồn tại' }); }

        const [exit2] = await connection.execute('select * from products where id = ?', [id]);
        if (exit2.length === 0) { return res.status(200).json({ result: 0, message: 'Không tìm thấy' }) }

        const [updateResult] = await connection.execute('update products set name_product = ?, price= ?,category_id = ?,description=?,stock=?,image=?  where id= ?', [name_product, price, category_id, description, stock, image, id]);
        if (updateResult.affectedRows === 0) { return res.status(200).json({ result: 0, message: 'Cập nhật không thành công ' }) }


        res.status(200).json({ result: 1, data: { id: updateResult.insertId, name_product, price, category_id, description, stock, image } })

    } catch (err) {
        console.log(err)
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}


exports.getAllProducts = async (req, res) => {
    const { name_product, min_price, max_price, category_id, page, limit, sort_by, sort_order } = req.query;
    let query = `select p.*,c.name as category_name from products p left join categories c on p.category_id = c.id where isDelete = 0 `;
    let countQuery = `select count(*) as total from products p left join categories c on p.category_id = c.id where isDelete = 0`;
    let params = [];
    let countParams = [];
    let sortableFields = ['price', 'name_product']
    try {

        if (name_product) {
            query += ' and name_product like ?';
            countQuery += ' and name_product like ?';
            params.push(`%${name_product}%`);
            countParams.push(`%${name_product}%`);
        }
        if (category_id) {
            query += ' and category_id = ?';
            countQuery += ' and category_id = ?';
            params.push(category_id);
            countParams.push(category_id);
        }
        if (min_price && max_price) {
            query += ' and price between ? and ?';
            countQuery += ' and price between ? and ?';
            params.push(min_price)
            params.push(max_price)
            countParams.push(min_price)
            countParams.push(max_price)
        }

        else if (min_price) {
            query += ` and price >= ?`;
            countQuery += ` and price >= ?`;
            params.push(min_price);
            countParams.push(min_price);
        }
        else if (max_price) {
            query += ` and price <= ?`;
            countQuery += ` and price <= ?`;
            params.push(max_price);
            countParams.push(max_price);
        }


        if (sort_by && sortableFields.includes(sort_by)) {
            const order = (sort_order && sort_order.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
            query += ` order by ${sort_by} ${order}`
        }


        console.log(query);
        if (limit && page && !isNaN(page) && !isNaN(limit)) {
            const pageNum = Number(page);
            const limitNum = Number(limit);
            const offset = (pageNum - 1) * limitNum;

            query += ` LIMIT ${limitNum} OFFSET ${offset} `;


            const [[{ total }]] = await connection.execute(countQuery, countParams);
            const totalPages = Math.ceil(total / limitNum)
            const [result] = await connection.execute(query, params);
            const updatedResult = result.map(product => {
                return {
                    ...product,
                    status: product.stock > 0 ? 'Còn hàng' : 'Hết hàng'
                }
            })
            return res.status(200).json({ data: updatedResult, pagination: { page: pageNum, limit: limitNum, totalPages, total_items: total } });
        }


        const [result] = await connection.execute(query, params);
        const updatedResult = result.map(product => {
            return {
                ...product,
                status: product.stock > 0 ? 'Còn hàng' : 'Hết hàng'
            }
        });
        res.status(200).json({ data: updatedResult });

    } catch (err) {
        console.log(err)
        res.status(200).json({ message: 'Lỗi' })
    }
}

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) {
        return res.status(200).json({ result: 0, message: 'ID không hợp lệ' });
    }
    try {

        const [result] = await connection.execute('update products set isDelete = 1 where id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(200).json({ result: 0, message: 'Không tìm thấy sản phẩm' })
        }
        res.status(200).json({ result: 1, message: 'Sản phẩm đã được xóa' });
    } catch (err) {
        console.log(err)

        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}

exports.getProductByReq = async (req, res) => {
    try {
        const [results] = await connection.execute(
            `with ranked_products as 
            (
            select * ,
            row_number() over(partition by category_id  order by id asc) as rn 
            from products
            )
            select * from ranked_products where rn <= 4; `
        );
        res.status(200).json({ result: 1, data: results });
    } catch (err) {
        res.status(200).json({ message: 'Lỗi' })
    }
}