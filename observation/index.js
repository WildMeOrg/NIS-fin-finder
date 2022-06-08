const observationControllerObj = require('../controllers/observationController.js');
const authHelper = require('../helper/authHelper');
const utils = require('../utils.js');
module.exports = async function (context, req) {
    try {
        await authHelper.isValidUser(req);
        if(req.method == 'POST'){
            await observationControllerObj.uploadObservation(context,req);
        } else if(req.method == 'DELETE'){
            await observationControllerObj.deleteObservation(context,req);
        } else {
            await observationControllerObj.getObservation(context,req);
        }
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }    
}