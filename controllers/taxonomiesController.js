const taxonomiesServiceObj = require('../services/taxonomiesService.js');
const utils = require('../utils.js');
const models = require('../models');
const { Op } = require("sequelize");
const constants = require('../config/constants');
const taxonomiesValidator = require('../validators/taxonomiesValidator.js');
const validationHelper 	= require('../helper/validationHelper.js');
class taxonomiesController{
    constructor(){

    }
}
taxonomiesController.gettaxonomies = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(taxonomiesValidator.getTaxonomiesSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await taxonomiesServiceObj.gettaxonomies(context,req);
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
taxonomiesController.deleteTaxonomies = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(taxonomiesValidator.deleteTaxonomiesSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const taxonId = reqQuery.taxonId;
        const result = await models.taxonomies.destroy({where:{taxon_id:taxonId}});
        if(result){
            const result = utils.successFormater(200,{},AppConstant.EC.RECORD_DELETE_SUCCESSFULLY);
            utils.sendResponse(context,req,200,result);
        }
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
taxonomiesController.createTaxonomies = async(context,req) => {
    try {
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(taxonomiesValidator.createTaxonomiesSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const preparedData = taxonomiesServiceObj.prepareSaveData(req);
        await taxonomiesServiceObj.saveTaxonomies(context,req,preparedData);
        const result = utils.successFormater(200,{},constants.MESSAGES.RECORD_CREATE_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result);
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
taxonomiesController.updateTaxonomies = async(context,req) => {
    try {
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(taxonomiesValidator.updateTaxonomiesSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const preparedData = taxonomiesServiceObj.prepareSaveData(req);
        await taxonomiesServiceObj.updateTaxonomies(req.body.taxon_id,preparedData);
        const result = utils.successFormater(200,{},constants.MESSAGES.RECORD_UPDATED_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result);
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
taxonomiesController.importTaxonomies = async (context,req) => {
    try {
        const jsonArray = await utils.getCSVToJSON(context,req);
        if(Array.isArray(jsonArray) && jsonArray.length){
            const insertedData = await taxonomiesServiceObj.saveTaxonomiesTrans(jsonArray);
            if(!insertedData.invalidDataCnt){
                const result = utils.successFormater(200,insertedData,constants.MESSAGES.FILE_UPLOAD_SUCCESSFULLY);
                utils.sendResponse(context,req,200,result);
            } else {
                let responseData = utils.errorFormater(400,insertedData,constants.MESSAGES.INVALID_FILE_DATA);
                utils.sendResponse(context,req,400,responseData);
            }
        } else {
            let error = utils.errorObject('TC002',constants.MESSAGES.EMPTY_FILE,constants.MESSAGES.TECH_ERROR);
            let errArr = new Array(error);
            let responseData = utils.errorFormater(400,errArr);
            utils.sendResponse(context,req,400,responseData);
        }

    } catch (err) {
        utils.sendResponse(context,req,400,false,err);
    }
}
module.exports = taxonomiesController
