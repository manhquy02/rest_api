const Joi = require('joi');

const getUserByIdSchema = Joi.object({
    id : Joi.number().integer().min(1).required()
});

module.exports = {getUserByIdSchema}