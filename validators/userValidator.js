const joi = require('@hapi/joi');

class UserValidator {
    constructor() {

    }
}
UserValidator.loginSchema = joi.object({
    userName: joi.string().required().email(),
    password: joi.string().required(),
});
UserValidator.createUserSchema = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    title: joi.string().allow(''),
    phone: joi.string().required(),
    city: joi.string().allow(''),
    state: joi.string().allow(''),
    country_code: joi.string().required(),
    postal_code: joi.string().allow(''),
    //remarks: joi.string().optional(),
    email: joi.string().required().email(),
    //use_common_names: joi.string().optional(),
    //logged: joi.string().required(),
    organization_id: joi.number().required(),
    role_id:joi.string().required(),
    active: joi.number().optional().valid(1, 2),
    //country_id: joi.number().required(),
});
UserValidator.updateUserSchema = UserValidator.createUserSchema.append({
    id: joi.string().required()
});
UserValidator.deleteUserSchema = joi.object({
    id: joi.number().required()
});
UserValidator.getUsersSchema = joi.object({
    page : joi.number().optional(),
    limit : joi.number().optional(),
    order : joi.string().optional().allow('').valid('ASC','DESC','asc','desc'),
    sort : joi.string().optional().allow(''),
    searchString : joi.string().optional().allow(''),
    id : joi.number().optional(), // Use for detail api
    orgId : joi.number().optional().allow(''), // Use for detail api by orgId
});
UserValidator.checkPassTokenSchema = joi.object({
    token: joi.string().required()
});
UserValidator.setPasswordSchema = joi.object({
    token: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.any().valid(joi.ref('password')).required().label('Confirm password').messages({ 'any.only': '{{#label}} does not match' })
});
UserValidator.forgotPasswordSchema = joi.object({
    email: joi.string().required().email(),
});
module.exports = UserValidator;