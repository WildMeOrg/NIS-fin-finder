const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');
const axios = require('axios');
const models = require('../models');
const moment = require('moment');
const utils = require('../utils.js');
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const AppConstant = require('../helper/appConstant');

class UserService{
    constructor(){

    }
}
UserService.getUsers = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const queryFilter = await UserService.prepareQueryFilter(context,req);
            if(!utils.isEmpty(reqQuery.id)){
                const data = await models.user.findOne(queryFilter);
                if(!data){
                    const result = utils.successFormater(200,{},AppConstant.EC.NO_RECORD_FOUND);
                    utils.sendResponse(context,req,200,result);
                } else{
                    const modifiedResults = utils.modifiedResult(req, data);
                    resolve({data:modifiedResults,dataCount:0});
                }
            } else {
                const { count, rows:results } = await models.user.findAndCountAll(queryFilter);
                const modifiedResults = utils.modifiedResult(req, results);
                if(reqQuery.isDownload && reqQuery.type === 'csv'){
                    //await UserService.downloadUserDataAsCSV(context,modifiedResults);
                } else {
                    resolve({data:modifiedResults,dataCount:count});
                }
            }                        
        } catch (error) {
            console.log("error===========",error);
            reject(error);
        } 
    });
}

UserService.prepareQueryFilter = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const searchString = reqQuery.searchString || (req.body && req.body.searchString);
            const queryFilter = {};
            queryFilter.where={};
            const order = reqQuery.order || (req.body && req.body.order);
            const sort = reqQuery.sort || (req.body && req.body.sort);
            const orderBy = order && sort?true:false;
            if(!reqQuery.view){
                const adminRoleUsers = await models.user_roles.findAll({where:{role_id:AppConstant.C.superAdminRoleId}});
                let adminRoleUserArr = [];
                adminRoleUsers.map(obj=>{
                    adminRoleUserArr.push(obj.user_id);
                });
                if(adminRoleUserArr.length){
                    queryFilter.where.id = {[Op.notIn]: adminRoleUserArr};
                }      
            }                  
            if(orderBy && ['country_name'].includes(sort)){
                queryFilter.order = [[{model:models.geographic_location,as:'countryDetail'},'name', `${order}`]]
            } else if(orderBy && ['org_name'].includes(sort)){
                queryFilter.order = [[{model:models.organizations,as:'organizationDetail'},'name', `${order}`]]
            } else if(orderBy && ['role_name'].includes(sort)){
                queryFilter.order = [[{model:models.roles,as:'rolesDetail'},'name', `${order}`]]                
            } else {
                queryFilter.order = orderBy?[[`${sort}`, `${order}`]]:[['id', AppConstant.C.defaultOrder]]
            }
            if(utils.isOrgAdmin(context,req) && !utils.isSuperAdmin(context,req)){
                queryFilter.where.organization_id = req.userDetail.organizationId;
            }
            if(!utils.isEmpty(reqQuery.id)){
                queryFilter.where.id = reqQuery.id;
            } 
            if(!utils.isEmpty(reqQuery.orgId)){
                queryFilter.where.organization_id = reqQuery.orgId;
            }
            queryFilter.where = searchString ? {...queryFilter.where,
                [Op.or]: [
                    (moment(new Date(searchString)).isValid())?{ created_at: {[Op.gte]: utils.convertToUTC(req,`${searchString} 00:00:00`),[Op.lte]: utils.convertToUTC(req,`${searchString} 23:59:59`)} }:{},
                    { full_name: {[Op.like]: `%${searchString}%`}},
                    { email: {[Op.like]: `%${searchString}%`} },
                    { phone: {[Op.like]: `%${searchString}%`} },
                    { title: {[Op.like]: `%${searchString}%`} },
                    //{ '$organizationDetail.name$': {[Op.like]: `%${searchString}%`} },
                    //{ '$rolesDetail.name$': {[Op.like]: `%${searchString}%`} }
                ]
                } : {...queryFilter.where};
            
            queryFilter.attributes = ['id', 'first_name', 'last_name', 'full_name', 'phone', 'street_address', 'city', 'state', 'country_code','postal_code', 'email', 'active', 'title','created_at','updated_at']
            queryFilter.include = [
                {
                    model:models.user,
                    as:'addedBy',
                    attributes:['first_name','last_name', 'full_name'],
                    required:false
                },
                {
                    model:models.roles,
                    as:'rolesDetail',
                    attributes:['id','name','slug'],
                    through:{attributes:[]},
                    required:false
                },
                {
                    model:models.organizations,
                    as:'organizationDetail',
                    attributes:['id','name'],
                    required:false
                },
                {
                    model:models.geographic_location,
                    as:'countryDetail',
                    attributes:['id','name']
                }
            ];
            queryFilter.distinct = true;
            //queryFilter.subQuery = false;
            if(!reqQuery.isDownload && !reqQuery.view){
                const page = reqQuery.page?parseInt(reqQuery.page):1;
                const limit = reqQuery.limit?parseInt(reqQuery.limit):AppConstant.C.defaultLimit;
                const offset = (page - 1) * limit;
                queryFilter.offset = offset;
                queryFilter.limit = limit;
            }
            resolve(queryFilter);
        } catch (error) {
            reject(error);
        } 
    });
}
module.exports = UserService;
