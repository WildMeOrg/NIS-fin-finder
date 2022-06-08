const { Op } = require("sequelize");
const models = require('../models');
const utils= require('../utils.js');
const authHelper = require('../helper/authHelper');
const AppConstant = require('../helper/appConstant');

module.exports = async function (context, req) {
    try{
        await authHelper.isValidUser(req);
        if(req.method=="GET"){
            if(req.query.id){
                const result = await models.roles.findOne({where : {id:req.query.id}});
                const modifiedResults = utils.modifiedResult(req, result);
                context.res = {
                    statusCode: 200, /* Defaults to 200 */
                    body: {
                        success : true,
                        data : modifiedResults
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }else if(req.query.view == "all"){
                const where = {};
                if(!utils.isSuperAdmin(context,req)){
                    where.id = {[Op.ne]: AppConstant.C.trainingRoleId}
                }
                const result = await models.roles.findAll({where});
                const modifiedResults = utils.modifiedResult(req, result);
                context.res = {
                    statusCode: 200, /* Defaults to 200 */
                    body: {
                        statusCode:200,
                        data : modifiedResults
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }else {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page-1)*limit;
                const searchString = req.query.searchString || (req.body && req.body.searchString);
                const order = req.query.order || (req.body && req.body.order);
                const sort = req.query.sort || (req.body && req.body.sort);
                const orderBy = order && sort?true:false;
                const clientWhere = searchString ? {
                    name: {
                        [Op.like]: `%${searchString}%`
                    }
                } : {};
                const count = await models.roles.count({where: clientWhere});
                const result = await models.roles.findAll(
                    {
                        where: clientWhere,
                        order: [
                            orderBy?[`${sort}`, `${order}`]:['id', 'ASC']
                        ],
                        offset: offset, limit: limit 
                    }
                );
                const modifiedResults = utils.modifiedResult(req, result);
                context.res = {
                    status: 200, /* Defaults to 200 */
                    body: utils.commonApiResponse(modifiedResults, count),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
        }
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
}
