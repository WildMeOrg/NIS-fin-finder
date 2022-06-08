const jwt = require('jsonwebtoken');
const models = require('../models');
const AppConstant = require('./appConstant');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const utils= require('../utils.js');
const isValidUser = (req)=>{
    return new Promise( async (resolve,reject)=>{
        try {
            if(req.headers.authorization){
                const userDetail = {};
                const token = req.headers.authorization;
                const authToken = token.split(' ')[1];
                var decoded = jwt.verify(authToken, AppConstant.C.JWTTokenSecret);
                const queryFilter = {};
                queryFilter.where={};
                queryFilter.where.email=decoded.userName;
                queryFilter.attributes=['id', 'first_name', 'last_name', 'full_name', 'email'];
                queryFilter.include = [
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
                ];
                const userData = await models.user.findOne(queryFilter);
                let userRoles = [];
                if(userData.rolesDetail){
                    for (const obj of userData.rolesDetail) {
                        userRoles.push(obj.id);
                    }
                }                
                userDetail.userId = userData.id;
                userDetail.firstName = userData.first_name;
                userDetail.lastName = userData.last_name;
                userDetail.fullName = userData.full_name;
                userDetail.email = userData.email;
                userDetail.organizationName = userData.organizationDetail?userData.organizationDetail.name:'';
                userDetail.organizationId = userData.organizationDetail?userData.organizationDetail.id:0;
                userDetail.userRoles = userRoles;
                req.userDetail = userDetail;
                req.requestFrom = req.headers.isMobile?req.headers.isMobile:0;
                // Senitize request params
                if(req.body && Object.keys(req.body).length){
                    req.body = utils.senitizeObj(req.body);
                }
                if(req.query && Object.keys(req.query).length){
                    req.query = utils.senitizeObj(req.query);
                }                
                resolve(userDetail);
            } else {
                throw 'Authorization token is missing!!!'
            }
        } catch (error) {
            reject(error);           
        }
    });
    
}

module.exports = {isValidUser}
