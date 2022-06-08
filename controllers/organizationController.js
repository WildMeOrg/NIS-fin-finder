var models = require('../models');
var utils= require('../utils.js');
const { Op } = require("sequelize");
const AppConstant = require('../helper/appConstant');
const organizationServiceObj = require('../services/organizationService.js');
const organizationValidator = require('../validators/organizationValidator.js');
const validationHelper 	= require('../helper/validationHelper.js');
const emailHelper = require('../helper/emailHelper.js');
const moment = require('moment');

class OrganizationController{
    constructor(){
        
    }
}

OrganizationController.getOrganizations = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(organizationValidator.getOrganizationsSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await organizationServiceObj.getOrganizations(context,req);
        context.res = {
            status: 200,
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

OrganizationController.createOrganization = async (context, req) => {
    let errArr = [];
    try{
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(organizationValidator.createOrganizationSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await models.organizations.findOne({where : {[Op.or]:[{ name:reqBody.name }, { email: reqBody.email }]}});
        if(result && result.name == reqBody.name){
            errArr.push(utils.errorObject('ORGC001',AppConstant.EC.NAME_EXIST,AppConstant.EC.NAME_EXIST));
        } 
        if(result && result.email == reqBody.email){
            errArr.push(utils.errorObject('ORGC002',AppConstant.EC.EMAIL_EXIST,AppConstant.EC.EMAIL_EXIST));
        }
        if(!utils.isEmpty(errArr)){
            let finalErr = utils.errorFormater(400,errArr);
            return utils.sendResponse(context,req,400,finalErr);
        }
        const preparedData = organizationServiceObj.prepareSaveData(context,req);
        const qryData = await organizationServiceObj.saveData(context,req,preparedData);
        const resultFormat = utils.successFormater(200,{},AppConstant.EC.RECORD_CREATE_SUCCESSFULLY);
        utils.sendResponse(context,req,200,resultFormat);   
          
    }catch(err){
        utils.sendResponse(context,req,500,false,err);        
    }
       
}

OrganizationController.updateOrganization = async (context, req) => {
    let errArr = [];
    try{
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(organizationValidator.updateOrganizationSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const orgResult = await models.organizations.findOne({where : {[Op.or]:[{ name:reqBody.name }, { email: reqBody.email }],id:{[Op.ne]: reqBody.id}}});
        if(orgResult && orgResult.name == reqBody.name){
            errArr.push(utils.errorObject('ORGC003',AppConstant.EC.NAME_EXIST,AppConstant.EC.NAME_EXIST));
        } 
        if(orgResult && orgResult.email == reqBody.email){
            errArr.push(utils.errorObject('ORGC004',AppConstant.EC.EMAIL_EXIST,AppConstant.EC.EMAIL_EXIST));
        }
        if(!utils.isEmpty(errArr)){
            let finalErr = utils.errorFormater(400,errArr);
            return utils.sendResponse(context,req,400,finalErr);
        } 
        const preparedData = organizationServiceObj.prepareSaveData(context,req);
        const qryData = await organizationServiceObj.updateData(context,req,reqBody.id,preparedData);
        await organizationServiceObj.updateUserData(context,req,reqBody);
        const resultFormat = utils.successFormater(200,qryData,AppConstant.EC.RECORD_UPDATED_SUCCESSFULLY);
        utils.sendResponse(context,req,200,resultFormat);
          
    }catch(err){
        utils.sendResponse(context,req,500,false,err);        
    }
       
}
OrganizationController.deleteOrganization = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(organizationValidator.deleteOrganizationSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const qryData = await organizationServiceObj.deleteOrganiztion(context,req,reqQuery);
        const resultFormat = utils.successFormater(200,{},AppConstant.EC.RECORD_DELETE_SUCCESSFULLY);
        utils.sendResponse(context,req,200,resultFormat);
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
OrganizationController.orgRegistration = async (context, req) => {
    let errArr = [];
    try{
        if(req.body && Object.keys(req.body).length){
            req.body = utils.senitizeObj(req.body);
        }
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(organizationValidator.orgRegistration, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await models.user.findOne({where:{id:1}});
        let toArr = [{email:'dmunasinghe@conservation.org'}];
        if(result){
            toArr.push({email:result.email});
        }
        emailHelper.sendTemplateEmail({
            //to:[{email:'ambrish.singh@rsystems.com'},{email:'shivani.sharma@rsystems.com'},{email:'dmunasinghe@conservation.org'}],
            to:toArr,
            //cc:[{email:'efegraus@conservation.org'},{email:'dmunasinghe@conservation.org'}],
            templateId:AppConstant.C.emailTemplateID.orgRegistration,
            dynamicTemplateData:{
                fullname:`${reqBody.first_name} ${reqBody.last_name}`,
                firstName:reqBody.first_name,
                lastName:reqBody.last_name,
                orgName:reqBody.org_name,
                orgEmail:reqBody.org_email,
                orgUrl:reqBody.org_url,
                feedbackURL:'info@wildlifedetection.org',
            }
        });
        const resultFormat = utils.successFormater(200,{},AppConstant.EC.EMAIL_SEND_SUCCESSFULLY);
        utils.sendResponse(context,req,200,resultFormat);  
    }catch(err){
        utils.sendResponse(context,req,500,false,err);        
    }
       
}
module.exports = OrganizationController;
