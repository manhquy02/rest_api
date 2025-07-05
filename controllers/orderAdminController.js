const connection = require('../models/db');

// exports.createOrder = async (req ,res )=>{
//     try{

//         const {user_id,phone,city,district,detail_address,items} = req.body;
//         console.log(req.body);

//         const [result]= await connection.execute('insert into orders (user_id,phone,city,district,detail_address) values (?,?,?,?,?)',[user_id,phone,city,district,detail_address]);
//         if(!user_id || !phone || !city || !district || !detail_address || !items || items.length === 0 || !Array.isArray(items) ) return res.status(200).json({result:0,message:'fill in the information or wrong information'});
//         if(phone.length !==10 || isNaN(phone)) return res.status(200).json({ result: 0, message: 'phone number must be 10 digits' });
//         const orderId = result.insertId;
//         for(const item of items){
//             await connection.execute('insert into order_items (order_id,product_id,quantity) values (?,?,?)',[orderId,item.product_id,item.quantity]);

//         }
//         res.status(200).json({result:1,order:{order_id:orderId,user_id,phone,city,district,detail_address,items}})


//         } catch(err){
//             console.log(err)
//             res.status(200).json({result:0,message:'error'})

//         }
// }
exports.createOrder = async (req, res) => {
    try {
        const { receiver_Name, phone, province_code, district_code, ward_code, detail_address, items } = req.body;
        const user_id = req.user?.id;
        console.log(req.body);

        // Kiểm tra dữ liệu đầu vào
        if (!receiver_Name) {
            return res.status(200).json({ result: 0, message: 'Chưa điền tên người nhận' });
        }
        if (!phone) {
            return res.status(200).json({ result: 0, message: 'Chưa điền số điện thoại' });
        }
        if (phone.length !== 10) {
            return res.status(200).json({ result: 0, message: 'Số điện thoại phải gồm 10 chữ số' });
        }
        if (!province_code) {
            return res.status(200).json({ result: 0, message: 'Chưa điền mã code tỉnh/thành phố' });
        }

        if (!district_code) {
            return res.status(200).json({ result: 0, message: 'Chưa điền mã code quận/huyện' });
        }

        if (!ward_code) {
            return res.status(200).json({ result: 0, message: 'Chưa điền mã code phường/xã' });
        }

        if (!detail_address) {
            return res.status(200).json({ result: 0, message: 'Chưa điền địa chỉ cụ thể' });
        }
        if (!user_id) {
            return res.status(200).json({ result: 0, message: 'user_id chưa được xác thực' });
        }

        if (!Array.isArray(items)) {
            return res.status(200).json({ result: 0, message: 'Mặt hàng phải là một mảng' });
        }

        if (items.length === 0) {
            return res.status(200).json({ result: 0, message: 'Danh sách mặt hàng không được để trống' });
        }
        const [check_province_code] = await connection.execute('select * from provinces where code = ? ', [province_code]);
        if (check_province_code.length === 0) {
            return res.status(200).json({ result: 0, message: 'Mã code tỉnh/thành phố không hợp lệ' });
        }
        const [check_district_code] = await connection.execute('select * from districts where code = ? ', [district_code]);
        if (check_district_code.length === 0) {
            return res.status(200).json({ result: 0, message: 'Mã code quận/huyện không hợp lệ' });
        }
        const [check_ward_code] = await connection.execute('select * from wards where code = ? ', [ward_code]);
        if (check_ward_code.length === 0) {
            return res.status(200).json({ result: 0, message: 'Mã code phường/xã không hợp lệ' });
        }

        // Tạo đơn hàng
        let total_price = 0;
        const orderItems = [];
        for (const item of items) {
            if (!item.product_id || !item.quantity || typeof item.quantity !== 'number') {
                return res.status(200).json({ result: 0, message: 'Mã sản phẩm hoặc giá trong đơn hàng không hợp lệ' });
            }
            if (item.quantity <= 0) {
                return res.status(200).json({ result: 0, message: 'Số lượng phải lớn hơn 0' });
            }


            const [productRows] = await connection.execute('select price from products where id = ?', [item.product_id]);

            if (productRows.length === 0) return res.status(200).json({ result: 0, message: `Không tìm thấy mã sản phẩm` });

            const [stockRows] = await connection.execute('select stock from products where id = ?', [item.product_id]);
            if (stockRows.length === 0 || stockRows[0].stock < item.quantity) return res.status(200).json({ result: 0, message: `Số lượng sản phẩm không đủ bán` });

            await connection.execute('update products set stock  = stock - ? where id = ?', [item.quantity, item.product_id]);

            const productPrice = productRows[0].price;
            const itemTotal = productPrice * item.quantity;
            total_price += itemTotal;
            orderItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: productPrice
            })

        }
        const [result] = await connection.execute(
            'INSERT INTO orders (receiver_Name,phone, province_code, district_code,ward_code,total_price, detail_address,user_id) VALUES (?, ?, ?, ?, ?,?,?,?)',
            [receiver_Name, phone, province_code, district_code, ward_code, total_price, detail_address, user_id]
        );
        if (!result || !result.insertId) {
            return res.status(500).json({ result: 0, message: 'Tạo đơn hàng thất bại' });
        }

        console.log(result)
        const orderId = result.insertId;

        // Thêm từng sản phẩm
        for (const item of orderItems) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity,price) VALUES (?, ?, ?,?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        res.status(200).json({
            result: 1,
            order: { order_id: orderId, receiver_Name, phone, province_code, district_code, ward_code, total_price, detail_address, user_id, items: orderItems }
        });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'Lỗi' });
    }
};

// exports.getAllOrder = async (req,res)=>{
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit)|| 3;
//     const offset = (page-1)*limit;

//    try{
//     const [result] = await connection.execute(`select * from orders limit ${limit} offset ${offset}`);
//     if(!result ||  result === 0 ) return res.status(200).json({result:0,message:'not found'})

//     const [[countResult]]= await connection.execute(`select count(*) as total from orders `)
//     const totalOrders = countResult.total;
//     const totalPages = Math.ceil(totalOrders/limit);
//     res.status(200).json({result:1,order:result})
//    } catch(err){
//     console.log(err)
//     res.status(200).json({result:0,message:'error'})
// }
// }

// exports.getOrderBySearch = async (req,res)=>{
//     const {key} = req.query;
//     try{
//         const [result] = await connection.execute(`select * from orders where id=? or phone LIKE ? or city LIKE ? or district LIKE ? or detail_address LIKE ?`,[key,`%${key}%`,`%${key}%`,`%${key}%`,`%${key}%`]);
//         if(!result || result.length === 0 ) return res.status(200).json({result:0,message:'not found'})
//             res.status(200).json({result:1,order:result})
//     }catch(err){
//         console.log(err)
//         res.status(200).json({result:0,message:'error'})
//     }
// }

// exports.getOrderById = async (req,res)=>{
//     const {id,user_id} = req.params;
//     const{phone,city,district,detail_address} = req.query;

//     try{
//         const [result] = await connection.execute('select * from orders where id = ?',[id]);
//         if(!result || result.length === 0 ) return res.status(200).json({result:0,message:'not found'})
//           const order = result[0];
//           const [result1] = await connection.execute(`select oi.product_id,oi.quantity,p.name_product,p.price from order_items oi join products p on oi.product_id = p.id where oi.order_id = ?` , [id]);
//             res.status(200).json({result:1,order:{ ...order,items: result1}  })
//     }catch(err){
//         console.log(err)
//         res.status(200).json({result:0,message:'error'})
//     }
// }



// exports.getOrders = async (req, res) => {
// //   const { id, key } = req.query;
//   const page = parseInt(req.query.page) ;
//   const limit = parseInt(req.query.limit) ;


//   try {
//     // 🟦 Trường hợp 1: Lấy chi tiết đơn theo ID (kèm sản phẩm)
//     if (id) {
//       const [orderResult] = await connection.execute('SELECT * FROM orders WHERE id = ?', [id]);
//       if (!orderResult || orderResult.length === 0)
//         return res.status(200).json({ result: 0, message: 'not found' });

//       const order = orderResult[0];
//       const [itemsResult] = await connection.execute(
//         `SELECT oi.product_id, oi.quantity, p.name_product, p.price
//          FROM order_items oi
//          JOIN products p ON oi.product_id = p.id
//          WHERE oi.order_id = ?`,
//         [id]
//       );

//       return res.status(200).json({ result: 1, order: { ...order, items: itemsResult } });
//     }

// 🟨 Trường hợp 2: Tìm kiếm theo key
// if (key) {
//   const [searchResult] = await connection.execute(
//     `SELECT * FROM orders 
//      WHERE id = ? OR phone LIKE ? OR city LIKE ? OR district LIKE ? OR detail_address LIKE ?`,
//     [key, `%${key}%`, `%${key}%`, `%${key}%`, `%${key}%`]
//   );
//   if (!searchResult || searchResult.length === 0)
//     return res.status(200).json({ result: 0, message: 'not found' });

//   return res.status(200).json({ result: 1, order: searchResult });
// }

// 🟩 Trường hợp 3: Lấy danh sách đơn hàng (có phân trang)
//     const [orders] = await connection.execute(`SELECT * FROM orders LIMIT ? OFFSET ?`, [limit, offset]);
//     const [[countResult]] = await connection.execute(`SELECT COUNT(*) as total FROM orders`);
//     const totalPages = Math.ceil(countResult.total / limit);

//     return res.status(200).json({
//       result: 1,
//       orders,
//       totalPages,
//       currentPage: page
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(200).json({ result: 0, message: 'error' });
//   }
//     try{
//         let result;
//             let totalPages= 1;
//             if(!page || !limit){
//                 [result]= await connection.execute('select * from orders');
//             }else{
//                   const offset = (page - 1) * limit;

//    [result] = await connection.execute(`select * from orders limit ${limit} offset ${offset}`);
//     if(!result ||  result === 0 ) return res.status(200).json({result:0,message:'not found'})

//    const [[countResult]]= await connection.execute(`select count(*) as total from orders `)
//     const totalOrders = countResult.total;
//     if(limit) totalPages = Math.ceil(totalOrders/limit);
//     res.status(200).json({result:1,data:result,pagination:{per_page:limit || totalOrders,total_pages:totalPages,total_items:totalOrders,current_page:page ||1}});
//             }
//    } catch(err){
//     console.log(err)
//     res.status(200).json({result:0,message:'error'})
//    }
// };


// exports.getOrders = async (req, res) => {
//     const page = parseInt(req.query.page);
//     const limit = parseInt(req.query.limit);
//     if (req.query.page && (isNaN(page) || page <= 0)) {
//         return res.status(400).json({ result: 0, message: 'Invalid page number' });
//     }
//     if (req.query.limit && (isNaN(limit) || limit <= 0)) {
//         return res.status(400).json({ result: 0, message: 'Invalid limit value' });
//     }

//     const { id } = req.query;
//     const { key, receiver_Name, phone, province_code, district_code, ward_code, detail_address, from_date, to_date } = req.query;
//     let result1;
//     let totalPages = 1;
//     try {

//         let whereClause = 'WHERE  1=1 ';
//         const params = [];


//         if (key) {
//             whereClause += `and ( receiver_Name LIKE ? or phone LIKE ? or province_code LIKE ? or district_code LIKE ? or ward_code LIKE ? or detail_address LIKE ?)`;

//             params.push(
//                 key,
//                 `%${key}%`,
//                 `%${key}%`,
//                 `%${key}%`,
//                 `%${key}%`,
//                 `%${key}%`,
//                 `%${key}%`
//             );
//         } else {
//             if (receiver_Name) {
//                 whereClause += ' AND receiver_Name LIKE ?';
//                 params.push(`%${receiver_Name}%`);
//             }
//             if (phone) {
//                 whereClause += 'and phone like ?';
//                 params.push(`%${phone}%`);
//             }
//             if (province_code) {
//                 whereClause += ' AND province_code = ?';
//                 params.push(province_code);
//             }

//             if (district_code) {
//                 whereClause += ' AND district_code = ?';
//                 params.push(district_code);
//             }

//             if (ward_code) {
//                 whereClause += ' AND ward_code = ?';
//                 params.push(ward_code);
//             }
//             if (detail_address) {
//                 whereClause += ' AND detail_address LIKE ?';
//                 params.push(`%${detail_address}%`);
//             }


//             if (from_date && to_date) {
//                 whereClause += ' AND created_at between ? and ?';
//                 params.push(from_date, to_date);
//             } else if (from_date) {
//                 whereClause += ' AND created_at >= ? ';
//                 params.push(from_date);
//             } else if (to_date) {
//                 whereClause += ' AND created_at <= ?';
//                 params.push(to_date)
//             }

//         }
//         if (id) {
//             whereClause += 'AND id = ?';
//             params.push(id);
//         }
//         // if (id) {

//         //     const [result0] = await connection.execute('select * from orders where id = ?', [id]);
//         //     if (!result0 || result0.length === 0) return res.status(200).json({ result0: 0, message: 'not found' })
//         //     const order = result0[0];
//         //     const [result00] = await connection.execute(`select oi.product_id,oi.quantity,p.name_product,p.price from order_items oi join products p on oi.product_id = p.id where oi.order_id = ?`, [id]);
//         //     console.log('order items:', result00);
//         //     return res.status(200).json({ result: 1, order: { ...order, items: result00 } })
//         // }

//         const usePagination = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;
//         if (usePagination) {
//             const offset = (page - 1) * limit;

//             // [result1] = await connection.execute(`SELECT * FROM orders ${whereClause}`, params);
//             // return res.status(200).json({ result: 1, data: result1 });



//             [result1] = await connection.execute(`SELECT * FROM orders ${whereClause} LIMIT ${limit} OFFSET ${offset}`,
//                 [...params, limit, offset]
//             );

//             if (!result1 || result1.length === 0) return res.status(200).json({ result: 0, message: 'no orders found' })

//             const [[countResult]] = await connection.execute(`select count(*) as total from orders ${whereClause}`,
//                 params)
//             const total_items = countResult.total;


//             if (limit) totalPages = Math.ceil(total_items / limit);
//             return res.status(200).json({ result: 1, data: result1, pagination: { per_page: limit || total_items, total_pages: totalPages, total_items: total_items, current_page: page || 1 } });

//         } else {
//             const [result1] = await connection.execute(
//                 `SELECT * FROM orders ${whereClause}`,
//                 params
//             );
//             return res.status(200).json({ result: 1, result1 });
//         }

//     } catch (err) {
//         console.log(err)

//         return res.status(200).json({ result: 0, message: 'err' })
//     }
// }

// exports.getOrderById = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const [result] = await connection.execute('select * from orders where id = ?', [id]);
//         if (!result || result.length === 0) return res.status(200).json({ result: 0, message: 'not found' })
//         res.status(200).json({ result: 1, data: result })
//     } catch (err) {
//         console.log(err)
//         res.status(200).json({ result: 0, message: 'err' })
//     }
// }



exports.getOrders = async (req, res) => {

    const { receiver_Name, phone, detail_address, start_date, end_date, sort_by, sort_order, limit, page } = req.query;
    const userIdFromQuery = req.query.user_id;
    const user_id = userIdFromQuery ? Number(userIdFromQuery) : req.user.id;

    console.log(req.user)
    let query = ` SELECT * from orders WHERE 1 = 1`;
    let countQuery = `SELECT count(*) as total FROM orders WHERE 1=1`
    let params = [];
    let countParams = [];
    let sortableFields = ['total_price']

    try {
        if (req.user.role !== 'admin') {

            query += ' and user_id = ?';
            countQuery += ' AND user_id = ?';
            params.push(user_id);
            countParams.push(user_id);
        }
        if (receiver_Name) {
            query += ' and receiver_Name like ?';
            countQuery += ' AND receiver_Name like ?';
            params.push(`%${receiver_Name}%`);
            countParams.push(`%${receiver_Name}%`);
        }

        if (phone) {
            query += ' and phone = ?';
            countQuery += ' AND phone = ?';
            params.push(phone);
            countParams.push(phone);
        }
        if (detail_address) {
            query += ' and detail_address like ?';
            countQuery += ' AND detail_address LIKE ?';
            params.push(`%${detail_address}%`);
            countParams.push(`%${detail_address}%`);
        }
        if (start_date && end_date) {
            query += ' and created_at between ? and ?'
            countQuery += ' and created_at between ? and ? '
            params.push(start_date, end_date)
            countParams.push(start_date, end_date)
        } else if (start_date) {
            query += ' and created_at >= ?'
            countQuery += ' and created_at >= ?'
            params.push(start_date)
            countParams.push(start_date)
        } else if (end_date) {
            query += ' and created_at <= ?'
            countQuery += ' and created_at <= ?'
            params.push(end_date)
            countParams.push(end_date)
        }
        if (sort_by && sortableFields.includes(sort_by)) {
            const order = (sort_order && sort_order.toLowerCase() === 'desc') ? 'desc' : 'asc';
            query += ` order by  ${sort_by} ${order}`
        } else {
            query += " order by id desc";
        }

        // query += " order by id desc";
        if (limit && page && !isNaN(limit) && !isNaN(page)) {
            const limitNum = Number(limit);
            const pageNum = Number(page);
            const offset = (pageNum - 1) * limitNum;

            query += ` limit ${limitNum} offset ${offset}`;


            const [[{ total }]] = await connection.execute(countQuery, countParams);
            const totalPages = Math.ceil(total / limitNum);
            const [results] = await connection.execute(query, params);

            return res.status(200).json({ result: 1, data: results, pagination: { page: pageNum, limit: limitNum, totalPages, total_items: total } })
        }
        const [results] = await connection.execute(query, params);
        if (!results || results.length === 0) {
            res.status(200).json({ result: 0, message: 'Không tìm thấy' })
        }

        res.status(200).json({ result: 1, data: results })
    } catch (err) {
        console.log(err)
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}

exports.getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.execute('SELECT * from orders where id = ?', [id]);
        if (!result || result.length === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy' })
        res.status(200).json({ result: 1, data: result })
    } catch (err) {

        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}


exports.getOrderHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const [result] = await connection.execute(`
             SELECT o.id ,o.created_at,o.receiver_Name,o.detail_address,o.phone,oi.product_id,p.name_product,oi.quantity,p.price,p.image,u.email,pr.name as name_province,d.name as name_distric,w.name as name_ward
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            join users u on o.user_id = u.id 
			join provinces pr on o.province_code = pr.code
            join districts d on o.district_code = d.code
            join wards w on o.ward_code = w.code
            WHERE o.user_id= ?`, [userId]);
        if (!result || result.length === 0) return res.status(200).json({ result: 0, message: 'Không tìm thấy' })
        res.status(200).json({ result: 1, data: result })
    } catch (err) {
        console.log(err)
        res.status(200).json({ result: 0, message: 'Lỗi' })
    }
}