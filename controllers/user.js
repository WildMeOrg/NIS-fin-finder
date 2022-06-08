var models = require('../models');
var utils= require('../utils.js');
var jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const AppConstant = require('../helper/appConstant');
const userServiceObj = require('../services/userService.js');
const userValidator = require('../validators/userValidator.js');
const validationHelper 	= require('../helper/validationHelper.js');
const emailHelper = require('../helper/emailHelper.js');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

class UserController{
    constructor(){
        
    }
}

UserController.getUsers = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(userValidator.getUsersSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await userServiceObj.getUsers(context,req);
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

UserController.createUser = async (context, req) => {
    let errArr = [];
    try{
        let reqBody = req.body;
        let errors = await validationHelper.joiValidate(userValidator.createUserSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await models.user.findOne({where : {[Op.or]:[{ phone:reqBody.phone }, { email: reqBody.email }]}});   
        if(result && result.phone == reqBody.phone){
            errArr.push(utils.errorObject('UC009',AppConstant.EC.PHONE_EXIST,AppConstant.EC.PHONE_EXIST));
        }
        if(result && result.email == reqBody.email){
            errArr.push(utils.errorObject('UC010',AppConstant.EC.EMAIL_EXIST,AppConstant.EC.EMAIL_EXIST));
        }
        if(!utils.isEmpty(errArr)){
            let finalErr = utils.errorFormater(400,errArr);
            return utils.sendResponse(context,req,400,finalErr);
        }
        
        const userResult = await UserController.addUserAndRoles(context, req);
        if(userResult){
            const userDetail = await models.user.findOne({where : {email: reqBody.email }});
            emailHelper.sendTemplateEmail({
                to:[{email:userDetail.email}],
                templateId:AppConstant.C.emailTemplateID.accountCreated,
                dynamicTemplateData:{
                    fullname:userDetail.full_name,
                    setPasswordURL:`${AppConstant.C.webAppUrl}/setpassword/${userDetail.token}`,
                    domainURL:AppConstant.C.webAppUrl,
                    feedbackURL:'info@wildlifedetection.org',
                }
            });
        }
        
        const resultFormat = utils.successFormater(200,{},AppConstant.EC.RECORD_CREATE_SUCCESSFULLY);
        utils.sendResponse(context,req,200,resultFormat);  
          
    }catch(err){
        utils.sendResponse(context,req,500,false,err);        
    }
       
}

UserController.userLogin = async (context,req) => {
    let errArr = [];
        try {
            const reqBody = req.body;
            let errors = await validationHelper.joiValidate(userValidator.loginSchema, reqBody);
            if (errors.length) {
                utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
            }
            const userName = reqBody.userName;
            const [results, metadata] = await models.sequelize.query(`select * from user where BINARY email = '${userName}' and BINARY password = '${reqBody.password}'`);
            if(utils.isEmpty(results)){
                errArr.push(utils.errorObject('UC001',AppConstant.EC.INVALID_CREDENTIAL,AppConstant.EC.INVALID_CREDENTIAL));
            } else if(!utils.isEmpty(results) && results[0].active != 1) {
                errArr.push(utils.errorObject('UC002',AppConstant.EC.INACTIVE_USER,AppConstant.EC.INACTIVE_USER));
            }
            if(!utils.isEmpty(errArr)){
                let finalErr = utils.errorFormater(400,errArr);
                utils.sendResponse(context,req,400,finalErr);
            }

            const userResult = await models.user.findOne({ 
                where: { 
                    email: userName,
                    password: reqBody.password
                },
                attributes:['id', 'first_name', 'last_name', 'full_name', 'email', 'active'], 
                include:[
                    {
                        model:models.roles,
                        as:'rolesDetail',
                        attributes:['id','name','slug'],
                        through:{attributes:[]},
                        required:true
                    },
                    {
                        model:models.organizations,
                        as:'organizationDetail',
                        attributes:['id','name'],
                        required:true
                    }
                ] });
            var token = jwt.sign(
                { 
                    userName: userName, 
                    roles: userResult.rolesDetail, 
                }, AppConstant.C.JWTTokenSecret);
            const data = [{
                id: userResult.id,
                userName: userResult.email,
                name: userResult.full_name,
                roles : userResult.rolesDetail,
                orgDetail : userResult.organizationDetail,
            }];
            context.res = {
                status: 200,
                body:  {
                    statusCode:200,
                    data,
                    message:AppConstant.EC.VALID_USER,
                    token,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            context.done();
            /* const finalData = {
                userData,
                token,
            };
            const result = utils.successFormater(200,finalData,AppConstant.EC.VALID_USER);
            utils.sendResponse(context,req,200,result); */
    
        } catch (error) {
            utils.sendResponse(context,req,400,false,error);
        }    

}

UserController.checkPassToken = async (context,req) => {
    let errArr = [];
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(userValidator.checkPassTokenSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const token = reqQuery.token;
        const userResult = await models.user.findOne({ where: { token: token} });
        if(!userResult){
            errArr.push(utils.errorObject('UC003',AppConstant.EC.NO_RECORD_FOUND,AppConstant.EC.NO_RECORD_FOUND));
        } else if(userResult && userResult.is_set_password == 1) {
            errArr.push(utils.errorObject('UC004',AppConstant.EC.PASSWORD_HAS_SET_ALREADY,AppConstant.EC.PASSWORD_HAS_SET_ALREADY));
        }
        if(!utils.isEmpty(errArr)){
            let finalErr = utils.errorFormater(400,errArr);
            utils.sendResponse(context,req,400,finalErr);
        } else {
            const result = utils.successFormater(200,{},AppConstant.EC.VALID_PASS_TOKEN);
            utils.sendResponse(context,req,200,result);
        }  

    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }    

}

UserController.setPassword = async (context,req) => {
    let errArr = [];
    try {
        const reqBody = req.body;
        let errors = await validationHelper.joiValidate(userValidator.setPasswordSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const userResult = await models.user.findOne({ where: { token: reqBody.token} });
        if(!userResult){
            errArr.push(utils.errorObject('UC005',AppConstant.EC.NO_RECORD_FOUND,AppConstant.EC.NO_RECORD_FOUND));
        } else if(userResult && userResult.is_set_password == 1) {
            errArr.push(utils.errorObject('UC006',AppConstant.EC.PASSWORD_HAS_SET_ALREADY,AppConstant.EC.PASSWORD_HAS_SET_ALREADY));
        }
        if(!utils.isEmpty(errArr)){
            let finalErr = utils.errorFormater(400,errArr);
            utils.sendResponse(context,req,400,finalErr);
        } else {
            const res = await models.user.update({
                is_set_password:1,
                active:1,
                password:reqBody.password
            },{
                where : {token: reqBody.token}
            })
            if(res){
                if(reqBody.isFP){
                    emailHelper.sendTemplateEmail({
                        to:[{email:userResult.email}],
                        templateId:AppConstant.C.emailTemplateID.forgotPasswordConfirmation,
                        dynamicTemplateData:{
                            fullname:userResult.full_name,
                            dateTime:moment().format(AppConstant.C.dateFormat.momentDateTimeFormat),
                            feedbackURL:'info@wildlifedetection.org',
                        }
                    });
                } else {
                    emailHelper.sendTemplateEmail({
                        to:[{email:userResult.email}],
                        templateId:AppConstant.C.emailTemplateID.accountActivated,
                        dynamicTemplateData:{
                            fullname:userResult.full_name,
                            domainURL:AppConstant.C.webAppUrl,
                            finFinderUrl:AppConstant.C.finFinderUrl,
                            feedbackURL:'info@wildlifedetection.org',
                        }
                    });
                }
                const result = utils.successFormater(200,{},`Your account has been created, Please <a href="${AppConstant.C.webAppUrl}">Click Here<a/> to login.`);
                utils.sendResponse(context,req,200,result);
            }            
        }  

    } catch (error) {
        utils.sendResponse(context,req,400,false,error);
    }    

}

UserController.updateUser = async (context, req) => {
    let errArr = [];
    try{
        let reqBody = req.body;
        let errors = await validationHelper.joiValidate(userValidator.updateUserSchema, reqBody);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const result = await models.user.findOne({where : {[Op.or]:[{ phone:req.body.phone }, { email: req.body.email }],id:{[Op.ne]: req.body.id}}});
        if(result && result.phone == req.body.phone){
            errArr.push(utils.errorObject('UC007',AppConstant.EC.PHONE_EXIST,AppConstant.EC.PHONE_EXIST));
        }
        if(result && result.email == req.body.email){
            errArr.push(utils.errorObject('UC008',AppConstant.EC.EMAIL_EXIST,AppConstant.EC.EMAIL_EXIST));
        }
        if(!utils.isEmpty(errArr)){
            let finalErr = utils.errorFormater(400,errArr);
            return utils.sendResponse(context,req,400,finalErr);
        }
        await UserController.updateUserAndRoles(context, req);   
        const resultFormat = utils.successFormater(200,{},AppConstant.EC.RECORD_UPDATED_SUCCESSFULLY);
        utils.sendResponse(context,req,200,resultFormat);   
          
    }catch(err){
        utils.sendResponse(context,req,500,false,err);        
    }
       
}
UserController.addUserAndRoles = (context, req)=>{
    return new Promise( async (resolve,reject)=>{
        try {
            models.sequelize.transaction(function (t) {
                // chain all your queries here. make sure you return them.
                return models.user.create({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    full_name:(req.body.first_name.concat(' ',req.body.last_name)).trim(),
                    title: req.body.title,
                    phone: req.body.phone,
                    street_address: req.body.street_address,
                    city:req.body.city,
                    state: req.body.state,
                    country_code: req.body.country_code,
                    postal_code: req.body.postal_code,
                    //remarks: req.body.remarks,
                    email: req.body.email,
                    password: AppConstant.C.defaultUserPassword,
                    //use_common_names: req.body.use_common_names,
                    //logged: req.body.logged,           
                    organization_id: req.body.organization_id,
                    active: req.body.active,
                    added_by: req.userDetail.userId,
                    country_id: req.body.country_id?req.body.country_id:null,
                    created_at:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat),
                    updated_at:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)
                    }, {transaction: t}).then(function (user) {
                        const roleIds = (req.body.role_id).split(',').map(val=>{ return {user_id:user.id,role_id:val}});
                        return models.user_roles.bulkCreate(roleIds, {transaction: t});
                });
              
              }).then(function (result) {
                  resolve(result);
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback
              }).catch(function (err) {
                  reject(err);
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
              });
        } catch (error) {
            reject(error);           
        }
    });    
}
UserController.updateUserAndRoles = (context, req)=>{
    return new Promise( async (resolve,reject)=>{
        try {
            models.sequelize.transaction(function (t) {
                // chain all your queries here. make sure you return them.
                return models.user.update({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    full_name:(req.body.first_name.concat(' ',req.body.last_name)).trim(),
                    title: req.body.title,
                    phone: req.body.phone,
                    city:req.body.city,
                    state: req.body.state,
                    country_code: req.body.country_code,
                    postal_code: req.body.postal_code,
                    email: req.body.email,     
                    organization_id: req.body.organization_id,
                    active: req.body.active,
                    country_id: req.body.country_id?req.body.country_id:null,
                    updated_at:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)
                    },{where : {id:req.body.id}}, {transaction: t}).then(function (user) {
                        return models.user_roles.destroy({where : {user_id:req.body.id}}, {transaction: t});
                }).then(function (affectedRows) {
                        const roleIds = (req.body.role_id).split(',').map(val=>{ return {user_id:req.body.id,role_id:val}});
                        return models.user_roles.bulkCreate(roleIds, {transaction: t});
                });
              
              }).then(function (result) {
                  resolve(result);
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback
              }).catch(function (err) {
                  reject(err);
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
              });
        } catch (error) {
            reject(error);           
        }
    });    
}
UserController.deleteUser = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(userValidator.deleteUserSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const userId = reqQuery.id;
        const result = await models.user.destroy({where:{id:userId}});
        const roleResult = await models.user_roles.destroy({where:{user_id:userId}});
        if(result){
            const res = utils.successFormater(200,{},AppConstant.EC.RECORD_DELETE_SUCCESSFULLY);
            utils.sendResponse(context,req,200,res);
        } else {
            const res = utils.successFormater(200,{},AppConstant.EC.RECORD_ALREADY_DELETE);
            utils.sendResponse(context,req,200,res);
        }
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}
UserController.sendForgotPasswordEmail = async(context,req) => {
    try {
        const reqQuery = req.query;
        let errors = await validationHelper.joiValidate(userValidator.forgotPasswordSchema, reqQuery);
        if (errors.length) {
            return utils.sendResponse(context,req,400,utils.errorFormater(400,errors));
        }
        const userEmail = reqQuery.email.trim();
        const result = await models.user.findOne({where:{email:userEmail}});
        if(result){
            const token = uuidv4();
            const res = await models.user.update({
                is_set_password:0,
                token:token
            },{
                where : {id: result.id}
            })
            if(res){
                emailHelper.sendTemplateEmail({
                    to:[{email:result.email}],
                    templateId:AppConstant.C.emailTemplateID.forgotPassword,
                    dynamicTemplateData:{
                        fullname:result.full_name,
                        setPasswordURL:`${AppConstant.C.webAppUrl}/setpassword/${token}/1`,
                        feedbackURL:'info@wildlifedetection.org',
                    }
                });
            }
            const resMsg = utils.successFormater(200,{},'A password reset link has been sent to your registered email address.');
            utils.sendResponse(context,req,200,resMsg);
        } else {
            const res = utils.successFormater(200,{},'No user registered with this email id');
            utils.sendResponse(context,req,200,res);
        }
    } catch (error) {
        utils.sendResponse(context,req,500,false,error);
    }
}

module.exports = UserController;
