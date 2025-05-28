const models = require('../models');
const moment = require('moment');
const utils = require('../utils.js');
const { Op } = require("sequelize");
const constants = require('../config/constants');

class OrganizationService{
    constructor(){

    }
}
OrganizationService.getOrganizations = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const queryFilter = await OrganizationService.prepareQueryFilter(context,req);
            if(queryFilter.where.id){
                const data = await models.organizations.findOne(queryFilter);
                if(!data){
                    const result = utils.successFormater(200,{},constants.MESSAGES.NO_RECORD_FOUND);
                    utils.sendResponse(context,req,200,result);
                } else{
                    const modifiedResults = utils.modifiedResult(req, data);
                    resolve({data:modifiedResults,dataCount:0});
                }
            } else {
                const { count, rows:results } = await models.organizations.findAndCountAll(queryFilter);
                const modifiedResults = utils.modifiedResult(req, results);
                resolve({data:modifiedResults,dataCount:count});
            }
        } catch (error) {
            reject(error);
        }
    });
}

OrganizationService.prepareQueryFilter = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const searchString = reqQuery.searchString || (req.body && req.body.searchString);
            const queryFilter = {};
            queryFilter.where={};
            const order = reqQuery.order || (req.body && req.body.order);
            const sort = reqQuery.sort || (req.body && req.body.sort);
            const orderBy = order && sort?true:false;
            if(orderBy && ['country_name'].includes(sort)){
                queryFilter.order = [[{model:models.geographic_location,as:'countryDetail'},'name', `${order}`]]
            } else {
                queryFilter.order = orderBy?[[`${sort}`, `${order}`]]:[['id', constants.DEFAULTS.ORDER]]
            }
            if(utils.isOrgAdmin(context,req)){
                queryFilter.where.id = req.userDetail.organizationId;
            }
            if(!utils.isEmpty(reqQuery.id)){
                queryFilter.where.id = reqQuery.id;
            }
            queryFilter.where = searchString ? {...queryFilter.where,
                [Op.or]: [
                    (moment(new Date(searchString)).isValid())?{ created_at: {[Op.gte]: utils.convertToUTC(req,`${searchString} 00:00:00`),[Op.lte]: utils.convertToUTC(req,`${searchString} 23:59:59`)} }:{},
                    { first_name: {[Op.like]: `%${searchString}%`}},
                    { last_name: {[Op.like]: `%${searchString}%`} },
                    { name: {[Op.like]: `%${searchString}%`} },
                    { email: {[Op.like]: `%${searchString}%`} },
                    { phone: {[Op.like]: `%${searchString}%`} },
                    { postal_code: {[Op.like]: `%${searchString}%`} }
                ]
                } : {...queryFilter.where};

            queryFilter.attributes = ['id','first_name','last_name','name','street_address','city','state','postal_code','phone','email','country_code','organization_url','active','status','created_at']
            queryFilter.include=[
                {
                    model:models.geographic_location,
                    as:'countryDetail',
                    attributes:['id','name']
                }
            ];
            queryFilter.distinct = true;
            const page = reqQuery.page?parseInt(reqQuery.page):1;
            const limit = reqQuery.limit?parseInt(reqQuery.limit):constants.DEFAULTS.LIMIT;
            const offset = (page - 1) * limit;
            queryFilter.offset = offset;
            queryFilter.limit = limit;
            resolve(queryFilter);
        } catch (error) {
            reject(error);
        }
    });
}
OrganizationService.prepareSaveData = (context,req) => {
    const reqBody = req.body;
    const preparedData = {};
    preparedData.name = reqBody.name;
    preparedData.first_name = reqBody.first_name;
    preparedData.last_name = reqBody.last_name;
    preparedData.street_address = reqBody.street_address;
    preparedData.city = reqBody.city;
    preparedData.state = reqBody.state;
    preparedData.postal_code = reqBody.postal_code;
    preparedData.phone = reqBody.phone;
    preparedData.email = reqBody.email;
    preparedData.country_code = reqBody.country_code;
    preparedData.country_id = reqBody.country_id?reqBody.country_id:null;
    preparedData.organization_url = reqBody.organization_url;
    preparedData.remarks = reqBody.remarks;
    preparedData.active = reqBody.active;
    if(reqBody.id){
        preparedData.updated_at = moment().format(constants.DATE_FORMAT.DB);
    } else {
        preparedData.created_at = moment().format(constants.DATE_FORMAT.DB);
        preparedData.updated_at = moment().format(constants.DATE_FORMAT.DB);
        preparedData.request_from = req.requestFrom;
    }
    return preparedData;
}
OrganizationService.saveData = (context,req,preparedData) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.organizations.create(preparedData);
            resolve(data);
        } catch (error) {

            reject(error);
        }
    });
}
OrganizationService.updateData = (context,req,orgId,preparedData) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.organizations.update(preparedData,{where : {id:orgId}});
            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}
OrganizationService.updateUserData = (context,req,reqBody) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const update = await models.user.update({
                active:reqBody.active
            },{
                where : {
                    organization_id:reqBody.id,
                    active: {[Op.ne]: 2}
                }
            })
            resolve(update);
        } catch (error) {
            reject(error);
        }
    });
}
OrganizationService.deleteOrganiztion = (context,req,reqQuery) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const deleted = await models.organizations.update(
                {
                    active : 0
                },
                {
                    where : {id:reqQuery.id}
                }
            );
            const update = await models.user.update({
                active:0,
                updated_at:moment().format(constants.DATE_FORMAT.DB)
            },{
                where : {
                    organization_id:reqQuery.id,
                    active: {[Op.ne]: 2}
                }
            })
            resolve(deleted);
        } catch (error) {
            reject(error);
        }
    });
}
module.exports = OrganizationService;
