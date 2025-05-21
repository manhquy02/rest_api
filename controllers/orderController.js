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
        const { phone, province_code, district_code, ward_code, detail_address, items } = req.body;
        console.log(req.body);

        // Kiểm tra dữ liệu đầu vào
        if (!phone) {
            return res.status(200).json({ result: 0, message: 'Phone number is required' });
        }
        if (phone.length !== 10) {
            return res.status(200).json({ result: 0, message: 'phone number must be 10 digits' });
        }
        if (!province_code) {
            return res.status(200).json({ result: 0, message: 'province_code is required' });
        }

        if (!district_code) {
            return res.status(200).json({ result: 0, message: 'district_code is required' });
        }

        if (!ward_code) {
            return res.status(200).json({ result: 0, message: 'ward_code is required' });
        }

        if (!detail_address) {
            return res.status(200).json({ result: 0, message: 'Detail address is required' });
        }

        if (!Array.isArray(items)) {
            return res.status(200).json({ result: 0, message: 'Items must be an array' });
        }

        if (items.length === 0) {
            return res.status(200).json({ result: 0, message: 'Items list cannot be empty' });
        }
        const [check_province_code] = await connection.execute('select * from provinces where code = ? ', [province_code]);
        if (check_province_code.length === 0) {
            return res.status(200).json({ result: 0, message: 'Invalid province_code' });
        }
        const [check_district_code] = await connection.execute('select * from districts where code = ? ', [district_code]);
        if (check_district_code.length === 0) {
            return res.status(200).json({ result: 0, message: 'Invalid district_code' });
        }
        const [check_ward_code] = await connection.execute('select * from wards where code = ? ', [ward_code]);
        if (check_ward_code.length === 0) {
            return res.status(200).json({ result: 0, message: 'Invalid ward_code' });
        }

        // Tạo đơn hàng
        let total_price = 0;
        const orderItems = [];
        for (const item of items) {
            if (!item.product_id || !item.quantity || typeof item.quantity !== 'number') {
                return res.status(200).json({ result: 0, message: 'Invalid product_id or quantity in items' });
            }
            if (item.quantity <= 0) {
                return res.status(200).json({ result: 0, message: 'quantity must be >0' });
            }
            const [productRows] = await connection.execute('select price from products where id = ?', [item.product_id]);

            if (productRows.length === 0) return res.status(200).json({ result: 0, message: `Product ID not found` });


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
            'INSERT INTO orders (phone, province_code, district_code,ward_code,total_price, detail_address) VALUES (?, ?, ?, ?, ?,?)',
            [phone, province_code, district_code, ward_code, total_price, detail_address]
        );
        if (!result || !result.insertId) {
            return res.status(500).json({ result: 0, message: 'Failed to create order' });
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
            order: { order_id: orderId, phone, province_code, district_code, ward_code, total_price, detail_address, items: orderItems }
        });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'error' });
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


exports.getOrders = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    if (req.query.page && (isNaN(page) || page <= 0)) {
        return res.status(400).json({ result: 0, message: 'Invalid page number' });
    }
    if (req.query.limit && (isNaN(limit) || limit <= 0)) {
        return res.status(400).json({ result: 0, message: 'Invalid limit value' });
    }

    const { id } = req.query;
    const { key, phone, province_code, district_code, ward_code, detail_address, from_date, to_date } = req.query;
    let result1;
    let totalPages = 1;
    try {

        let whereClause = 'WHERE  1=1 ';
        const params = [];


        if (key) {
            whereClause += `and (phone LIKE ? or province_code LIKE ? or district_code LIKE ? or ward_code LIKE ? or detail_address LIKE ?)`;

            params.push(
                key,
                `%${key}%`,
                `%${key}%`,
                `%${key}%`,
                `%${key}%`,
                `%${key}%`
            );
        } else {
            if (phone) {
                whereClause += 'and phone like ?';
                params.push(`%${phone}%`);
            }
            if (province_code) {
                whereClause += ' AND province_code = ?';
                params.push(province_code);
            }

            if (district_code) {
                whereClause += ' AND district_code = ?';
                params.push(district_code);
            }

            if (ward_code) {
                whereClause += ' AND ward_code = ?';
                params.push(ward_code);
            }
            if (detail_address) {
                whereClause += ' AND detail_address LIKE ?';
                params.push(`%${detail_address}%`);
            }
            if (from_date && to_date) {
                whereClause += ' AND created_at between ? and ?';
                params.push(from_date, to_date);
            } else if (from_date) {
                whereClause += ' AND created_at >= ? ';
                params.push(from_date);
            } else if (to_date) {
                whereClause += ' AND created_at <= ?';
                params.push(to_date)
            }

        }
        if (id) {
            whereClause += 'AND id = ?';
            params.push(id);
        }
        // if (id) {

        //     const [result0] = await connection.execute('select * from orders where id = ?', [id]);
        //     if (!result0 || result0.length === 0) return res.status(200).json({ result0: 0, message: 'not found' })
        //     const order = result0[0];
        //     const [result00] = await connection.execute(`select oi.product_id,oi.quantity,p.name_product,p.price from order_items oi join products p on oi.product_id = p.id where oi.order_id = ?`, [id]);
        //     console.log('order items:', result00);
        //     return res.status(200).json({ result: 1, order: { ...order, items: result00 } })
        // }

        const usePagination = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;
        if (usePagination) {
            const offset = (page - 1) * limit;

            // [result1] = await connection.execute(`SELECT * FROM orders ${whereClause}`, params);
            // return res.status(200).json({ result: 1, data: result1 });



            [result1] = await connection.execute(`SELECT * FROM orders ${whereClause} LIMIT ${limit} OFFSET ${offset}`,
                [...params, limit, offset]
            );

            if (!result1 || result1.length === 0) return res.status(200).json({ result: 0, message: 'no orders found' })

            const [[countResult]] = await connection.execute(`select count(*) as total from orders ${whereClause}`,
                params)
            const total_items = countResult.total;


            if (limit) totalPages = Math.ceil(total_items / limit);
            return res.status(200).json({ result: 1, data: result1, pagination: { per_page: limit || total_items, total_pages: totalPages, total_items: total_items, current_page: page || 1 } });

        } else {
            const [result1] = await connection.execute(
                `SELECT * FROM orders ${whereClause}`,
                params
            );
            return res.status(200).json({ result: 1, result1 });
        }

    } catch (err) {
        console.log(err)

        return res.status(200).json({ result: 0, message: 'err' })
    }
}

exports.getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await connection.execute('select * from orders where id = ?', [id]);
        if (!result || result.length === 0) return res.status(200).json({ result: 0, message: 'not found' })
        res.status(200).json({ result: 1, data: result })
    } catch (err) {
        console.log(err)
        res.status(200).json({ result: 0, message: 'err' })
    }
}