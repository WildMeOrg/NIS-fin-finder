const trainingControllerObj = require('../controllers/trainingController.js');
const authHelper = require('../helper/authHelper');
var utils= require('../utils.js');

module.exports = async function (context, req) {
    try {
        await authHelper.isValidUser(req);
        if(req.method == 'POST'){
            await trainingControllerObj.importTraining(context,req);
        }
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
}