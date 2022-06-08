const userControllerObj = require('../controllers/user.js');
const utils= require('../utils.js');
module.exports = async function (context, req) {
    try {
        if(req.method == 'GET'){
            await userControllerObj.checkPassToken(context, req);
        } else if(req.method == 'POST'){
            await userControllerObj.setPassword(context, req);
        }
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }   
}