const userControllerObj = require('../controllers/user.js');
const utils= require('../utils.js');
const authHelper = require('../helper/authHelper');

module.exports = async function (context, req) {
    try {
        await authHelper.isValidUser(req);
        if(req.method == 'POST'){
            await userControllerObj.createUser(context, req)
        } else if(req.method == 'DELETE'){
            await userControllerObj.deleteUser(context,req);
        } else if(req.method=="PUT"){
            await userControllerObj.updateUser(context, req)
        } else {
            await userControllerObj.getUsers(context,req);
        } 
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
}