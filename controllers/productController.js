const connection = require('../models/db');

exports.getAllProducts = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    try {
        let result1;
        let totalPages = 1;

        if (!page || !limit) {
            // console.log("bbbbbbbb");
            [result1] = await connection.execute('select * from products');
        } else {
            // console.log("aaaaaaaaasa");

            const offset = (page - 1) * limit;
            [result1] = await connection.execute(`select * from products limit ${limit} offset ${offset}`);
        }
        // const [result1]= await connection.execute(select * from product limit ? offset ?, [limit, offset]);
        if (!result1 || result1.length === 0)
            return res.status(200).json({ result: 0, message: 'no products found' })

        const [[countResult]] = await connection.execute('select count(*) as total from products ')
        const total_items = countResult.total;


        if (limit) totalPages = Math.ceil(total_items / limit);
        res.status(200).json({ result: 1, data: result1, pagination: { per_page: limit || total_items, total_pages: totalPages, total_items: total_items, current_page: page || 1 } });
    } catch (err) {
        res.status(200).json({ result: 0, message: 'err' })
    }
}

exports.getAllProducts1 = async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    try {
        let result1;
        let totalPages = 1;

        if (!page || !limit) {
            [result1] = await connection.execute('select * from products');
        } else {

            const offset = (page - 1) * limit;
            [result1] = await connection.execute(`select * from products limit ${limit} offset ${offset}`);
        }
        // const [result1]= await connection.execute(select * from product limit ? offset ?, [limit, offset]);
        if (!result1 || result1.length === 0)
            return res.status(200).json({ result: 0, message: 'no products found' })

        const [[countResult]] = await connection.execute('select count(*) as total from products ')
        const total_items = countResult.total;


        if (limit) totalPages = Math.ceil(total_items / limit);
        res.status(200).json({
            result: 1,
            data: result1,
            pagination: {
                per_page: limit || total_items,
                total_pages: totalPages,
                total_items: total_items,
                current_page: page || 1
            }
        });
    } catch (err) {
        res.status(200).json({ result: 0, message: 'err' })
    }
}


exports.getProductBySearch = async (req,res) => {
    const{name_product}=req.query;
    console.log(name_product)
    try{
        const [result] = await connection.execute('select * from products where name_product like ?',[`%${name_product}%`]);
        if( result.length === 0){
            console.log(result)
         return res.status(200).json({ result: 0, message: 'not found' })
        }
        res.status(200).json({result:1,data:result})
    }catch(err){
        console.log(err)
         res.status(200).json({ result: 0, message: 'err' })
    }
}

exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [result2] = await connection.execute('select * from products where id = ?', [id]);
        if (!result2 || result2.length === 0) return res.status(200).json({ result: 0, message: 'not found' })
        res.status(200).json({ result: 1, data: result2 })
    } catch (err) {
        res.status(200).json({ result: 0, message: 'err' })
    }
}


exports.createProduct = async (req, res) => {
    const { name_product, price } = req.body;

    if (price < 0 || price > 10000000) {
        return res.status(200).json({ result: 0, message: 'price must than to 0 ' })
    }
    try {
        const [exiting] = await connection.execute('select * from products where name_product = ?', [name_product]);
        if (exiting.length > 0) return res.status(200).json({ result: 0, message: 'product exit' })

        const [result3] = await connection.execute('insert into products(name_product,price) values (?,?)', [name_product, price]);
        res.status(200).json({ result: 1, data: { id: result3.insertId, name_product, price } });

    } catch (err) {
        res.status(200).json({ result: 0, message: 'err' })
    }
}

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name_product, price } = req.body;

    if (!name_product || !price) {
        return res.status(200).json({ result: 0, message: 'Product name and price are required' })
    }
    if (price < 0) {
        return res.status(200).json({ result: 0, message: 'price must than to 0 ' })
    }

    try {

        const [checkname] = await connection.execute('select * from products where name_product = ? and id !=?', [name_product, id]);

        if (checkname.length > 0) { return res.status(200).json({ result: 0, message: 'Product name already exists' }); }

        const [exit2] = await connection.execute('select * from products where id = ?', [id]);
        if (exit2.length === 0) { return res.status(200).json({ result: 0, message: 'not found' }) }

        const [updateResult] = await connection.execute('update products set name_product = ?, price= ? where id= ?', [name_product, price, id]);
        if (updateResult.affectedRows === 0) { return res.status(200).json({ result: 0, message: 'failed update ' }) }


        res.status(200).json({ result: 1, data: { id: updateResult.insertId, name_product, price } })

    } catch (err) {
        console.log(err)
        res.status(200).json({ result: 0, message: 'err' })
    }
}