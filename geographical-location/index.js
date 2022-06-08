var models = require('../models');
var utils= require('../utils.js');
const authHelper = require('../helper/authHelper');

module.exports = async function (context, req) {
    try {
        await authHelper.isValidUser(req);
        const responseMessage = await models.geographic_location.findAll({ where: {status: true} });
        const modifiedResults = utils.modifiedResult(req, responseMessage);
        context.res = {
            body: utils.commonApiResponse(modifiedResults),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
    
}