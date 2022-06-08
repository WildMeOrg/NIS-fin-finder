const models = require('../models');
const utils= require('../utils.js');
const authHelper = require('../helper/authHelper');

module.exports = async function (context, req) {
    try {
        await authHelper.isValidUser(req);
        const responseMessage = await models.fin_type.findAll({
            where: {status: true},
            attributes:['id','name'],
            include:{
                model:models.fin_view,
                as:'finViewDetail',
                where: {status: true},
                attributes:['id','name'],
                required:true
            }
         });
        const modifiedResults = utils.modifiedResult(req, responseMessage);
        context.res = {
            body: utils.commonApiResponse(modifiedResults),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.log("error============",error);
        utils.sendResponse(context,req,400,false,error);
    }
}