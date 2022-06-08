const observationControllerObj = require('../controllers/observationController.js');
const authHelper = require('../helper/authHelper');
const utils = require('../utils.js');
module.exports = async function (context, req) {
    try {
        await authHelper.isValidUser(req);
        if(req.method == 'POST'){
            await observationControllerObj.observationReport(context,req);
        } else if(req.method == 'GET'){
            await observationControllerObj.getObservationReport(context,req);
        }
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }
}