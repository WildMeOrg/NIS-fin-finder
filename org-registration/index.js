const organizationControllerObj = require("../controllers/organizationController.js");
const utils= require('../utils.js');
//const authHelper = require('../helper/authHelper');

module.exports = async function (context, req) {
    try {
        //await authHelper.isValidUser(req);
        if(req.method == 'POST'){
            await organizationControllerObj.orgRegistration(context, req)
        } 
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
}