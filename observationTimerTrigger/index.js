const observationControllerObj = require('../controllers/observationController.js');
module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);   
    observationControllerObj.observationCron(context);
    context.log('JavaScript timer trigger function ran!2222222', timeStamp);
};