const organizationControllerObj = require("../controllers/organizationController.js");
const utils= require('../utils.js');
const authHelper = require('../helper/authHelper');

module.exports = async function (context, req) {

    try {
        await authHelper.isValidUser(req);
        if(req.method == 'POST'){
            await organizationControllerObj.createOrganization(context, req)
        } else if(req.method == 'DELETE'){
            await organizationControllerObj.deleteOrganization(context,req);
        } else if(req.method=="PUT"){
            await organizationControllerObj.updateOrganization(context, req)
        } else {
            await organizationControllerObj.getOrganizations(context,req);
        } 
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
}