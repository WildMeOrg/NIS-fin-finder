// var emailHandler = require('../handler/emailer');
// var random = require('../handler/generateRandomString')
// var models = require('../models');
// var tokenHandler = require('../handler/tokenVerification');
const userControllerObj = require('../controllers/user.js');
const utils= require('../utils.js');

module.exports = async function (context, req) {
    try {
        if(req.method == 'GET'){
            await userControllerObj.sendForgotPasswordEmail(context, req);
        }
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
}