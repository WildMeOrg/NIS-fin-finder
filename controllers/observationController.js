const observationServiceObj = require('../services/observationService.js');
const utils = require('../utils.js');
const models = require('../models');
const constants = require('../config/constants');
const observationValidator = require('../validators/observationValidator.js');
const validationHelper 	= require('../helper/validationHelper.js');
const moment = require('moment');
class ObservationController{
    constructor(){

    }
}
ObservationController.uploadObservationMultipart = async (context,req) => {
    try {
        const reqBody = req.body;
        const fileDetail = await observationServiceObj.uploadObservationImageUsingMultipart(req);
        const jobIdDetail = await observationServiceObj.getJobId(req,fileDetail);
        if(jobIdDetail && jobIdDetail.response && jobIdDetail.status && jobIdDetail.status.code && jobIdDetail.status.code == 200){
            fileDetail.cv_jobid = jobIdDetail.response;
        }
        fileDetail.user_id = (req.userDetail && req.userDetail.userId)?req.userDetail.userId:0;
        await observationServiceObj.saveObservation(req,fileDetail);
        const resData = {
            request_id:fileDetail.request_id,
            file_name: fileDetail.display_file_name,
            file_url: fileDetail.storage_file_url,
            cv_status: 0,
            cv_status_name: "Pending",
            cv_result: null,
            created_at:utils.utcToTimeZone(req,fileDetail.created_at)
        };
        const result = utils.successFormater(200,resData,constants.MESSAGES.FILE_UPLOAD_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result);
    } catch (err) {
        utils.sendResponse(context,req,400,false,err);
    }
}
ObservationController.uploadObservation = async (context,req) => {
    try {
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(observationValidator.uploadObservationSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        //const fileDetail = await observationServiceObj.uploadObservationImage(req);
        const fileDetail = await observationServiceObj.uploadObservationImageUsingContent(req);
        const jobIdDetail = await observationServiceObj.getJobId(req,fileDetail);
        if(jobIdDetail && jobIdDetail.response && jobIdDetail.status && jobIdDetail.status.code && jobIdDetail.status.code == 200){
            fileDetail.cv_jobid = jobIdDetail.response;
        }
        fileDetail.user_id = (req.userDetail && req.userDetail.userId)?req.userDetail.userId:0;
        await observationServiceObj.saveObservation(req,fileDetail);
        const resData = {
            request_id:fileDetail.request_id,
            file_name: fileDetail.display_file_name,
            file_url: fileDetail.storage_file_url,
            cv_status: 0,
            cv_status_name: "Pending",
            cv_result: null,
            created_at:utils.utcToTimeZone(req,fileDetail.created_at)
        };
        const result = utils.successFormater(200,resData,constants.MESSAGES.FILE_UPLOAD_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result);
    } catch (err) {
        utils.sendResponse(context,req,400,false,err);
    }
}
ObservationController.observationCallbackHandler = async(context,req) => {
    try {
        /* const obj={
            query:req.query?req.query:{},
            body:req.body?req.body:{},
            typeofbody:req.body?typeof req.body:'abcd',
        }
        const ddata = await observationServiceObj.saveObservation(req,{cv_result:obj}); */
        let jobId = '';
        let status = 'Awaited'
        if(typeof req.body == 'string'){
            let reqBodyStr = req.body;
            let reqBodyArr = reqBodyStr.split('&');
            if(reqBodyArr.length){
                let jobIdArr = reqBodyArr[0].split('=');
                jobId = jobIdArr[1];
                let statusArr = reqBodyArr[1].split('=');
                status = statusArr[1];
            }
        }
        if(jobId && status=='completed'){
            observationServiceObj.observationCron(context,jobId).catch(e=>{
                context.log('uploadObservation observationCron error ======= ', e);
            });
            /* const data = await models.observation.findOne({where:{cv_jobid:jobId}});
            console.log("data.id ==========",data.id);
            if(data.id){
                const updatedData = await observationServiceObj.fetchAndUpdateObservationResult(context,req,data);
                console.log("updatedData==================",updatedData);
            } */
        }
        const result = utils.successFormater(200,req.body,constants.MESSAGES.RECORD_UPDATED_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result);
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }


}
ObservationController.getObservation = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(observationValidator.getObservationSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await observationServiceObj.getObservation(context,req);
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

ObservationController.observationCron = (context) => {
    try {
        observationServiceObj.observationCron(context).then(res=>{
            context.log('observationCron then', res);
        }).catch(e=>{
            context.log('observationCron catch', e);
        });
    } catch (error) {
        context.log('observationCron error', error);
    }
}

ObservationController.deleteObservation = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(observationValidator.deleteObservationSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const requestId = reqQuery.requestId;
        const result = await models.observation.destroy({where:{request_id:requestId}});
        if(result){
            const result = utils.successFormater(200,{},constants.MESSAGES.RECORD_DELETE_SUCCESSFULLY);
            utils.sendResponse(context,req,200,result);
        }
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
ObservationController.observationReport = async(context,req) => {
    try {
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(observationValidator.observationReportSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const preparedParams = observationServiceObj.prepareReportData(req);
        const data = await observationServiceObj.observationReport(req,preparedParams);
        const result = utils.successFormater(200,data,constants.MESSAGES.REPORT_SUCCESSFULLY);
        utils.sendResponse(context,req,200,result);
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
ObservationController.getObservationReport = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(observationValidator.getObservationReportSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await observationServiceObj.getObservationReport(context,req);
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
module.exports = ObservationController
