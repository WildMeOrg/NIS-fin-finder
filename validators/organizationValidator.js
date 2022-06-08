const joi = require('@hapi/joi');

class OrganizationValidator {
    constructor() {

    }
}
OrganizationValidator.getOrganizationsSchema = joi.object({
    page : joi.number().optional(),
    limit : joi.number().optional(),
    order : joi.string().optional().allow('').valid('ASC','DESC','asc','desc'),
    sort : joi.string().optional().allow(''),
    searchString : joi.string().optional().allow(''),
    id : joi.number().optional(), // Use for detail api
});
OrganizationValidator.createOrganizationSchema = joi.object({
    name: joi.string().required(),
    first_name: joi.string().required(),
    last_name: joi.string().allow(''),
    city:joi.string().allow(''),
    state: joi.string().optional().allow(''),
    postal_code: joi.string().optional().allow(''),
    phone: joi.string().required(),
    email: joi.string().required().email(),
    country_code: joi.string().required(),
    organization_url: joi.string().allow(''),
    active: joi.number().optional().valid(0, 1),
    //country_id: joi.number().required(),
    timeZone: joi.string().optional(),
});
OrganizationValidator.updateOrganizationSchema = OrganizationValidator.createOrganizationSchema.append({
    id: joi.string().required()
});
OrganizationValidator.deleteOrganizationSchema = joi.object({
    id: joi.number().required()
});
OrganizationValidator.orgRegistration = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    org_name: joi.string().required(),
    org_email: joi.string().required().email(),
    org_url : joi.string().optional().allow(''),
});
module.exports = OrganizationValidator;