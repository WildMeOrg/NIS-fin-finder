const utils = require('../utils.js');
const constants = require('../config/constants');

class ValidationHelper {
    constructor() {

    }
}

ValidationHelper.joiValidate = function (schema, params) {
    try {
        const result = [];
        const validationResult = schema.validate(params, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (validationResult.error) {
            validationResult.error.details.map((detail) => {
                const message = detail.message.replace(/\"/g, "");
                const error = utils.errorObject('VALIERR', detail.context.key, message);
                result.push(error);
            });
            return Promise.resolve(result);
        }
        return Promise.resolve(result);
    } catch (e) {
        return Promise.reject(constants.MESSAGES.INVALID_VALIDATION_SCHEMA);
    }
}

module.exports = ValidationHelper;
