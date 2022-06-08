const { Op } = require("sequelize");
var models = require('../models');
var utils= require('../utils.js');
const fs = require('fs');
const path = require('path');
const trainingControllerObj = require('../controllers/trainingController.js');
const authHelper = require('../helper/authHelper');

module.exports = async function (context, req) {
    try {
        await authHelper.isValidUser(req);
        if(req.method == 'POST'){
            await trainingControllerObj.uploadTraining(context,req);
        } else if(req.method == 'DELETE'){
            await trainingControllerObj.deleteTraining(context,req);
        } else if(req.method == 'PUT'){
            await trainingControllerObj.updateTraining(context,req);
        } else {
            await trainingControllerObj.gettraining(context,req);
        }
    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }

    /* if(req.method == 'OTHER'){
        try {
            //const data = await models.training.bulkCreate(trainingData2);
            const Path = require("path");
            let Files  = [];

            function ThroughDirectory(Directory) {
                fs.readdirSync(Directory).forEach(File => {
                    const Absolute = Path.join(Directory, File);
                    if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
                    else {
                        const basename = path.basename(File);
                        const lowerName = basename.toLowerCase();
                        if(lowerName.endsWith(".jpg")){
                            const fileName = path.parse(File).name;
                            const imageDetail = {filePath:Absolute,fileName:basename,fileNameWithoutExt:fileName};                        
                            Files.push(imageDetail);
                        }
                        return Files;
                    }
                });
            }
            console.log(__dirname);
            ThroughDirectory(__dirname+ '/' + 'FAO');
            //trainingControllerObj.uploadImageAndUpdateDetail(context,req,Files);
            context.res = {
                status: 200, //Defaults to 200
                body: Files,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            context.done();
        } catch (error) {
            console.log('error==========',error);
            utils.sendResponse(context,req,400,false,error); 
        }
    } */
    
}
