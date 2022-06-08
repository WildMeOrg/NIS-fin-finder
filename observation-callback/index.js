const observationControllerObj = require('../controllers/observationController.js');
const models = require('../models');
module.exports = async function (context, req) {
    if(req.method == 'POST'){
            await observationControllerObj.observationCallbackHandler(context,req);
    } else {
        context.res = {
            status: 405,
            body:"Method not allow",
            headers: {
                'Content-Type': 'application/json'
            }
        }; 
        context.done();
    }
}