const connection = require('../models/db');

exports.getAllProvinces = async (req, res) => {

     try {
        const [results] = await connection.execute('select * from provinces');
        res.status(200).json({ result: 1, data: results });

    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, message: 'error' });
    }
}

exports.getAllDistricts = async (req,res) => {
    const province_id = parseInt(req.query.province_id);

    try{
        let query;
        if (province_id) {
            query = `select * from districts where province_id = ${province_id}`;
        } else {
            query = `select * from districts`;
        }
        const [result] = await connection.execute(query);
        
        if(!result || result.length == 0) {
            res.status(200).json({result:0,message:'not found'})
        }
        res.status(200).json({result:1,data:result})
    } catch (err) {
        console.log(err)
        res.status(200).json({result:0,message:'error'})
    }
}

exports.getAllWards = async (req,res) => {
    

    try{
        const { district_id } = req.query; 
        let query;
        if(district_id){
            query = `select * from wards where district_id=${district_id}`;
        }else{
            query = 'select * from wards'
        }
        const [result] = await connection.execute (query);
        if(!result || result.length == 0) {
            return res.status(200).json({result:0,message:'not found'})
        }
        res.status(200).json({result:1,data:result})
    }catch(err){
        console.log(err)
        res.status(200).json({result:0,message:'error'})
    }
}