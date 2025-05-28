const authHelper = require('../helper/authHelper');
var models = require('../models');
var utils = require('../utils.js');
const constants = require('../config/constants');
const observationControllerObj = require('../controllers/observationController.js');

module.exports = async function (context, req) {
    try {
        let errArr = [];
        const reqQuery = req.query;
        //await authHelper.isValidUser(req);
        if (reqQuery.type === 'training') {

            //const data = models.training.findOne({where:{request_id:reqQuery.requestId}});

            // "https://nisportalapi.blob.core.windows.net/training-images/1648483106795_1628149024092.jpg"

            const https = require('https'); // or 'https' for https:// URLs
            const fs = require('fs');
            console.log("1==========");
            const file = fs.createWriteStream("file.jpg");
            const request = https.get("https://nisportalapi.blob.core.windows.net/training-images/1648483106795_1628149024092.jpg", function (response) {
                response.pipe(file);
                console.log("2==========");
                // after download completed close filestream
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed");
                });
            });
            console.log("3==========");
            utils.sendResponse(context, req, 200, {});
        } else if (req.method == 'POST') {
            await authHelper.isValidUser(req);
            await observationControllerObj.uploadObservationMultipart(context, req);
        } else {
            errArr.push(utils.errorObject('DF001', constants.MESSAGES.INVALI_VALUE, constants.MESSAGES.INVALI_VALUE));
            let finalErr = utils.errorFormater(400, errArr);
            utils.sendResponse(context, req, 400, finalErr);
        }
    } catch (error) {
        utils.sendResponse(context, req, 400, false, error);
    }
}
