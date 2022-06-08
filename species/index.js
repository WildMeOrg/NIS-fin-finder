var models = require('../models');
var utils= require('../utils.js');
const authHelper = require('../helper/authHelper');

module.exports = async function (context, req) {
    try {
        //models.Sequelize.fn("concat", Sequelize.col("firstname"), Sequelize.col("lastname"))
        //[models.Sequelize.literal(`CASE cv_status WHEN 1 THEN 'Completed' ELSE 'Pending' END`), 'cv_status_name']
        await authHelper.isValidUser(req);
        const data = await models.taxonomies.findAll({attributes:['taxon_id','scientific_name','common_name_english','cites_status'],order:[['scientific_name', 'ASC']]});
        //const modifiedResults = utils.modifiedResult(req, resdata);
        context.res = {
            body: utils.commonApiResponse(data),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
    
}