const trainingServiceObj = require('../services/trainingService.js');
const utils = require('../utils.js');
const models = require('../models');
const { Op } = require("sequelize");
const AppConstant = require('../helper/appConstant');
const trainingValidator = require('../validators/trainingValidator.js');
const validationHelper 	= require('../helper/validationHelper.js');
class trainingController{
    constructor(){

    }
}
trainingController.uploadImageAndUpdateDetail = async (context,req,Files) => {
    try {
        for (const obj of Files) {
            //if(obj.fileName === '1635837252626.jpg'){
                const imageObj = await models.training.findOne({
                    where: {
                        image_file_name:obj.fileNameWithoutExt,
                        request_id:{
                            [Op.eq]: null
                        }
                    }
                });
                if(imageObj){
                    const imageDetail = await trainingServiceObj.uploadImageUsingUrl(obj);
                    //imageDetail.user_id = (req.userDetail && req.userDetail.userId)?req.userDetail.userId:0;
                    const imageId = imageObj.id;
                    const updateDetail = await trainingServiceObj.updateDetail(imageId,imageDetail);
                }
                const result = utils.successFormater(200,Files,AppConstant.EC.FILE_UPLOAD_SUCCESSFULLY);
                utils.sendResponse(context,req,200,result);
            //}
        }      
    } catch (err) {
        utils.sendResponse(context,req,400,false,err); 
    }
}
trainingController.gettraining = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(trainingValidator.getTrainingSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await trainingServiceObj.gettraining(context,req);
        context.res = {
            status: 200, //Defaults to 200
            body: utils.commonApiResponse(result.data,result.dataCount),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        context.done();
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}

trainingController.uploadTraining = async(context,req) => {
    try {
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(trainingValidator.uploadTrainingSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        let fileDetail = await trainingServiceObj.uploadTraining(req);
        fileDetail = trainingServiceObj.prepareSaveData(req,fileDetail);
        await trainingServiceObj.saveTraining(req,fileDetail);
        req.query.requestId = fileDetail.request_id;
        await trainingController.gettraining(context,req);
        /* const result = utils.successFormater(200,fileDetail,AppConstant.EC.RECORD_CREATE_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result); */
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
trainingController.deleteTraining = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(trainingValidator.deleteTrainingSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const requestId = reqQuery.requestId;
        const result = await models.training.destroy({where:{request_id:requestId}});
        if(result){
            const result = utils.successFormater(200,{},AppConstant.EC.RECORD_DELETE_SUCCESSFULLY);
            utils.sendResponse(context,req,200,result);
        }
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
trainingController.updateTraining = async(context,req) => {
    try {
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(trainingValidator.updateTrainingSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const fileDetail = trainingServiceObj.prepareSaveData(req);
        await trainingServiceObj.updateTraining(reqBody.requestId,fileDetail);
        const data = await models.training.findOne({where:{request_id:reqBody.requestId}});
        const modifiedResults = utils.modifiedResult(req, data);
        const result = utils.successFormater(200,modifiedResults,AppConstant.EC.RECORD_UPDATED_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result);
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
trainingController.importTraining = async (context,req) => {
    try {
        let jsonArray = await utils.getCSVToJSON(context,req);
        const validationRes = await trainingServiceObj.validateCSVData(jsonArray);
        jsonArray = validationRes.jsonArray;
        if(Array.isArray(validationRes.error.invalidData) && validationRes.error.invalidData.length){
            let responseData = utils.errorFormater(400,validationRes.error,AppConstant.EC.INVALID_FILE_DATA);
            utils.sendResponse(context,req,400,responseData);
        } else if(Array.isArray(jsonArray) && jsonArray.length){
            const insertedData = await trainingServiceObj.saveTrainingTrans(jsonArray);
            if(!insertedData.invalidDataCnt){
                const result = utils.successFormater(200,insertedData,AppConstant.EC.FILE_UPLOAD_SUCCESSFULLY);
                utils.sendResponse(context,req,200,result);
            } else {
                let responseData = utils.errorFormater(400,insertedData,AppConstant.EC.INVALID_FILE_DATA);
                utils.sendResponse(context,req,400,responseData);
            }            
        } else {
            let error = utils.errorObject('TC002',AppConstant.EC.EMPTY_FILE,AppConstant.EC.TECH_ERROR);
            let errArr = new Array(error);
            let responseData = utils.errorFormater(400,errArr);
            utils.sendResponse(context,req,400,responseData); 
        }
    } catch (err) {
        utils.sendResponse(context,req,400,false,err); 
    }
}
module.exports = trainingController