const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');
const axios = require('axios');
const models = require('../models');
const moment = require('moment');
const utils = require('../utils.js');
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const AppConstant = require('../helper/appConstant');
const { v4: uuidv4 } = require('uuid');

class TrainingService{
    constructor(){

    }
}
TrainingService.readFileContent = (imageObj) => {
    return new Promise( async (resolve,reject)=>{
        try {
            fs.readFile(imageObj.filePath, function(err, content) {
                if (err) return reject(err);
                return resolve(content);
            });
        } catch (error) {
            reject(error);
        } 
    });
}
TrainingService.uploadImageUsingUrl = (imageObj) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const imageDetail = {};
            // Create the BlobServiceClient object which will be used to create a container client
            const blobServiceClient = BlobServiceClient.fromConnectionString(AppConstant.C.blobConnectionString);
            // Get a reference to a container
            const containerClient = blobServiceClient.getContainerClient('training-data');
            //let buff = imageObj.fileContent;
            const blobName = `${Date.now()}_${imageObj.fileName}`;
            imageDetail.image_storage_name = blobName;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            imageDetail.image_storage_url = blockBlobClient.url;
            let buff = await TrainingService.readFileContent(imageObj);
            const uploadblobResponse = await blockBlobClient.upload(buff, buff.length);
            imageDetail.request_id = uploadblobResponse.requestId;
            resolve(imageDetail);
        } catch (error) {
            reject(error);
        } 
    });
}

TrainingService.updateDetail = (imageId,imageDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.training.update(imageDetail,{where : {id:imageId}});
            resolve(data);
        } catch (error) {
            reject(error);
        } 
    });
}
TrainingService.gettraining = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const queryFilter = await TrainingService.prepareQueryFilter(context,req);
            if(queryFilter.where.request_id){
                const data = await models.training.findOne(queryFilter);
                if(!data){
                    const result = utils.successFormater(200,{},AppConstant.EC.NO_RECORD_FOUND);
                    utils.sendResponse(context,req,200,result);
                } else{
                    const modifiedResults = utils.modifiedResult(req, data);
                    resolve({data:modifiedResults,dataCount:0});
                }
            } else {
                const { count, rows:results } = await models.training.findAndCountAll(queryFilter);
                const modifiedResults = utils.modifiedResult(req, results);
                if(count>0 && reqQuery.isDownload && reqQuery.type === 'csv'){
                    const uploadFileDetail = await TrainingService.downloadDataAsCSV(context,req,modifiedResults);
                    const result = utils.successFormater(200,uploadFileDetail,AppConstant.EC.FILE_CREATED_SUCCESSFULLY);
                    utils.sendResponse(context,req,200,result);
                } else {
                    resolve({data:modifiedResults,dataCount:count});
                }                
            }                        
        } catch (error) {
            reject(error);
        } 
    });
}

TrainingService.prepareQueryFilter = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const searchString = reqQuery.searchString || (req.body && req.body.searchString);
            const queryFilter = {};
            queryFilter.where={};
            const userWhere = {};
            const order = reqQuery.order || (req.body && req.body.order);
            const sort = reqQuery.sort || (req.body && req.body.sort);
            const orderBy = order && sort?true:false;
            if(orderBy && ['common_name_english','scientific_name','cites_status'].includes(sort)){
                queryFilter.order = [[{model:models.taxonomies,as:'taxonDetail'},`${sort}`, `${order}`]]
            } else if(orderBy && sort == 'fin_type'){
                queryFilter.order = [[{model:models.fin_type,as:'finTypeDetail'},'name', `${order}`]]
            } else if(orderBy && sort == 'fin_view'){
                queryFilter.order = [[{model:models.fin_view,as:'finViewDetail'},'name', `${order}`]]
            } else if(orderBy && sort == 'geographic_location'){
                queryFilter.order = [[{model:models.geographic_location,as:'geographicLocationDetail'},'name', `${order}`]]
            } else if(orderBy && sort == 'image_license'){
                queryFilter.order = [[{model:models.image_license,as:'imageLicenseDetail'},'name', `${order}`]]
            } else if(orderBy && ['first_name','last_name'].includes(sort)){
                queryFilter.order = [[{model:models.user,as:'userDetail'},`${sort}`, `${order}`]]
            } else {
                queryFilter.order = orderBy?[[`${sort}`, `${order}`]]:[['id', AppConstant.C.defaultOrder]]
            }
            if(utils.isOrgAdmin(context,req) && !utils.isSuperAdmin(context,req)){
                userWhere.organization_id = req.userDetail.organizationId; // loggedin user org ID
            } else if(!utils.isSuperAdmin(context,req)){
                queryFilter.where.user_id = req.userDetail.userId;
            }
            if(!utils.isEmpty(reqQuery.requestId)){
                queryFilter.where.request_id = reqQuery.requestId;
            }
            if(!utils.isEmpty(reqQuery.eguideData) && Number(reqQuery.eguideData) == 1){
                queryFilter.where.is_eguide = 1;
            }
            if(!utils.isEmpty(reqQuery.userId)){
                queryFilter.where.user_id = reqQuery.userId;
            }
            if(!utils.isEmpty(reqQuery.startDate) && !utils.isEmpty(reqQuery.endDate)) {
                queryFilter.where.created_at = {[Op.between] : [utils.convertToUTC(req,`${reqQuery.startDate} 00:00:00`) , utils.convertToUTC(req,`${reqQuery.endDate} 23:59:59`) ]};
            }  
            queryFilter.where = searchString ? {...queryFilter.where,
                [Op.or]: [
                    (moment(new Date(searchString)).isValid())?{ created_at: {[Op.gte]: utils.convertToUTC(req,`${searchString} 00:00:00`),[Op.lte]: utils.convertToUTC(req,`${searchString} 23:59:59`)} }:{},
                    (moment(new Date(searchString)).isValid())?{ date_of_image_taken: {[Op.gte]: utils.convertToUTC(req,`${searchString} 00:00:00`),[Op.lte]: utils.convertToUTC(req,`${searchString} 23:59:59`)} }:{},
                    { image_file_name: {[Op.like]: `%${searchString}%`} },
                    { '$taxonDetail.scientific_name$': {[Op.like]: `%${searchString}%`} },
                    { '$taxonDetail.common_name_english$': {[Op.like]: `%${searchString}%`} },
                    { '$taxonDetail.cites_status$': {[Op.like]: `%${searchString}%`} },
                    { '$finTypeDetail.name$': reqQuery.eguideData?{[Op.eq]: `%${searchString}%`}:{[Op.like]: `%${searchString}%`} },
                    { '$finViewDetail.name$': {[Op.like]: `%${searchString}%`} },
                    { '$userDetail.full_name$': {[Op.like]: `%${searchString}%`} },
                    { '$geographicLocationDetail.name$': {[Op.like]: `%${searchString}%`} },
                    { '$imageLicenseDetail.name$': {[Op.like]: `%${searchString}%`} }
                ]
                } : {...queryFilter.where};
            queryFilter.attributes = ['request_id','fin_state','dermal_denticle','dna_verification','image_file_name','image_storage_url',
            'image_owner','remarks','date_of_image_taken','created_at','updated_at']
            queryFilter.include=[
                {
                    model:models.user,
                    as:'userDetail',
                    attributes:['first_name','last_name', 'full_name'],
                    where:userWhere,
                    required:false
                },
                {
                    model:models.fin_type,
                    as:'finTypeDetail',
                    attributes:['id','name']
                },
                {
                    model:models.fin_view,
                    as:'finViewDetail',
                    attributes:['id','name']
                },
                {
                    model:models.geographic_location,
                    as:'geographicLocationDetail',
                    attributes:['id','name']
                },
                {
                    model:models.image_license,
                    as:'imageLicenseDetail',
                    attributes:['id','name']
                },
                {
                    model:models.taxonomies,
                    as:'taxonDetail',
                    attributes:['taxon_id','scientific_name','common_name_english','cites_status']
                }
                
            ];
            if(!reqQuery.isDownload){
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

TrainingService.uploadTraining = (req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const organizationName = (req.userDetail && req.userDetail.organizationName)?req.userDetail.organizationName:'default';
            const userName = (req.userDetail && req.userDetail.firstName && req.userDetail.lastName)?`${req.userDetail.firstName}-${req.userDetail.lastName}`:'username';
            const containerName = (organizationName.concat('-', userName)).replace(/(\s)+/g, '-').toLowerCase();
            const reqBody = req.body;
            const fileDetail = {};
            // Create the BlobServiceClient object which will be used to create a container client
            const blobServiceClient = BlobServiceClient.fromConnectionString(AppConstant.C.blobConnectionString);
            // Get a reference to a container
            //const containerClient = blobServiceClient.getContainerClient(containerName);
            const containerClient = blobServiceClient.getContainerClient('training-data');
            //const createContainerResponse = await containerClient.create().catch(err=>console.log("container create error ===== ",err));
            let buff = new Buffer(reqBody.imageContent, 'base64');
            const extArr = path.extname(reqBody.imageName).split('.');
            const ext = extArr[extArr.length - 1];
            const baseName = `${path.parse(reqBody.imageName).name}_${Date.now()}.${ext}`;
            fileDetail.image_file_name = reqBody.imageName;
            fileDetail.image_type = ext;
            const blobName = `${utils.getFolderPathFromReq(req)}${baseName}`;
            fileDetail.image_storage_name = baseName;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const options = { blobHTTPHeaders: { blobContentType: reqBody.imageType } };
            fileDetail.image_storage_url = blockBlobClient.url;
            const uploadblobResponse = await blockBlobClient.upload(buff, buff.length,options);
            fileDetail.request_id = uploadblobResponse.requestId;
            resolve(fileDetail);
        } catch (error) {
            reject(error);
        } 
    });
}

TrainingService.prepareSaveData = (req,fileDetail={}) => {
    const reqBody = req.body;
    if(!reqBody.requestId)
        fileDetail.user_id = (req.userDetail && req.userDetail.userId)?req.userDetail.userId:0;
    fileDetail.taxon_id = reqBody.taxonId?reqBody.taxonId:'';
    fileDetail.fin_state = reqBody.finState?reqBody.finState:'';
    fileDetail.fin_type_id = reqBody.finTypeId?reqBody.finTypeId:0;
    fileDetail.fin_view_id = reqBody.finViewId?reqBody.finViewId:0;
    fileDetail.geographic_location_id = reqBody.geographicLocationId?reqBody.geographicLocationId:0;
    //fileDetail.image_license_id = reqBody.imageLicenseId?reqBody.imageLicenseId:0;
    fileDetail.dna_verification = reqBody.dnaVerification?reqBody.dnaVerification:'no';
    fileDetail.image_owner = reqBody.imageOwner?reqBody.imageOwner:'';
    fileDetail.remarks = reqBody.remarks?reqBody.remarks:'';
    if(!reqBody.requestId){
        fileDetail.date_of_image_taken = moment().format('YYYY-MM-DD');
        fileDetail.created_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
        fileDetail.updated_at=moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
        fileDetail.request_from = req.requestFrom;
    }
    else{
        fileDetail.updated_at=moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
    }        
    if(!utils.isEmpty(reqBody.latitude) && !utils.isEmpty(reqBody.longitude)){
        const point = { type: 'Point', coordinates: [reqBody.longitude, reqBody.latitude]}; // GeoJson format: [lng, lat]
        fileDetail.location = point;
    }
    return fileDetail;
}
TrainingService.saveTraining = (req,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.training.create(fileDetail);
            resolve(data);
        } catch (error) {
            reject(error);
        } 
    });
}
TrainingService.updateTraining = (requestId,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.training.update(fileDetail,{where : {request_id:requestId}});
            resolve(data);
        } catch (error) {
            reject(error);
        } 
    });
}
TrainingService.downloadDataAsCSV = (context,req,rows) => {
    return new Promise( async (resolve,reject)=>{
        try {
                const dataRows = rows.map(obj=>{
                    return {
                        "Image File Name": obj.image_file_name,
                        "Image Storage Url": obj.image_storage_url,
                        "Scientific Name": obj.taxonDetail && obj.taxonDetail.scientific_name?obj.taxonDetail.scientific_name:'',
                        "Common Name English": obj.taxonDetail && obj.taxonDetail.common_name_english?obj.taxonDetail.common_name_english:'',
                        "Fin Type": obj.finTypeDetail && obj.finTypeDetail.name?obj.finTypeDetail.name:'',
                        "Fin View": obj.finViewDetail && obj.finViewDetail.name?obj.finViewDetail.name:'',
                        "Fin State": obj.fin_state,
                        "Cites Status": obj.taxonDetail && obj.taxonDetail.cites_status?obj.taxonDetail.cites_status:'',
                        "User First Name": obj.userDetail && obj.userDetail.first_name?obj.userDetail.first_name:'',
                        "User Last Name": obj.userDetail && obj.userDetail.last_name?obj.userDetail.last_name:'',
                        "Geographic Location": obj.geographicLocationDetail && obj.geographicLocationDetail.name?obj.geographicLocationDetail.name:'',
                        //"image_license": obj.imageLicenseDetail && obj.imageLicenseDetail.name?obj.imageLicenseDetail.name:'',
                        //"Dermal Denticle": obj.dermal_denticle,
                        "DNA Verification": obj.dna_verification,
                        "Image Owner": obj.image_owner,
                        "Date Of Image Taken": obj.date_of_image_taken,
                        "Remarks": obj.remarks,
                        "Added Date": obj.created_at
                    }
                })
                const json2csvParser = new Parser();
                const csv = json2csvParser.parse(dataRows);
                const fileObj = {
                    fileName:`Training_${Date.now()}.csv`,
                    fileContent:csv
                }
                /* let writer = fs.createWriteStream(`Training_${Date.now()}.csv`); 
                writer.write(csv); */
                const fileDetail = await TrainingService.uploadTmpFiles(fileObj);   
                resolve(fileDetail);                   
        } catch (error) {
            reject(error);
        } 
    });
}
TrainingService.uploadTmpFiles = (imageObj) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const imageDetail = {};
            // Create the BlobServiceClient object which will be used to create a container client
            const blobServiceClient = BlobServiceClient.fromConnectionString(AppConstant.C.blobConnectionString);
            // Get a reference to a container
            const containerClient = blobServiceClient.getContainerClient('tmp-files');
            const blobName = imageObj.fileName;
            imageDetail.file_storage_name = blobName;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            imageDetail.file_storage_url = blockBlobClient.url;
            let buff = imageObj.fileContent;
            const uploadblobResponse = await blockBlobClient.upload(buff, buff.length);
            imageDetail.request_id = uploadblobResponse.requestId;
            resolve(imageDetail);
        } catch (error) {
            reject(error);
        } 
    });
}
TrainingService.validateCSVData = (arrOfObj)=>{
    return new Promise( async (resolve,reject)=>{
        try {
            const result = [];
            const finTypeData = await models.fin_type.findAll({where:{status:1}});
            const finViewData = await models.fin_view.findAll({where:{status:1}});
            const geoGraphicLocationData = await models.geographic_location.findAll({where:{status:1}});
            const imageLicenseData = await models.image_license.findAll({where:{status:1}});
            for (const [i, obj] of arrOfObj.entries()) {
                arrOfObj[i].image_storage_name = obj.image_file_name;
                arrOfObj[i].request_id = uuidv4();
                arrOfObj[i].image_storage_url = `https://nisportalapi.blob.core.windows.net/training-data/${obj.image_relative_path}${obj.image_file_name}`;
                //if(!utils.isEmpty(obj.fin_type)){
                    const finTypeMatch = finTypeData.find(ele => ele.name.toLowerCase() == obj.fin_type.toLowerCase());
                    if(!finTypeMatch){
                        result.push({
                            rowNo:i+2,
                            errorMsg:`Invalid fin type name at row no: ${i+2}`
                        })
                    } else {
                        arrOfObj[i].fin_type_id = finTypeMatch.id;
                        //if(!utils.isEmpty(obj.fin_view)){
                            const finViewMatch = finViewData.find(ele => (ele.name.toLowerCase() == obj.fin_view.toLowerCase() && ele.fin_type_id == finTypeMatch.id));
                            if(!finViewMatch){
                                result.push({
                                    rowNo:i+2,
                                    errorMsg:`Invalid fin view name at row no: ${i+2}`
                                })
                            } else {
                                arrOfObj[i].fin_view_id = finViewMatch.id;
                            }
                        //}                        
                    }
                //}
                
                //if(!utils.isEmpty(obj.geographic_location)){
                    const geoGraphicLocationMatch = geoGraphicLocationData.find(ele => ele.name.toLowerCase() == obj.geographic_location.toLowerCase());
                    if(!geoGraphicLocationMatch){
                        result.push({
                            rowNo:i+2,
                            errorMsg:`Invalid geo graphic location name at row no: ${i+2}`
                        })
                    } else {
                        arrOfObj[i].geographic_location_id = geoGraphicLocationMatch.id;
                    }
                //}
                //if(!utils.isEmpty(obj.image_license)){
                    const imageLicenseMatch = imageLicenseData.find(ele => ele.name.toLowerCase() == obj.image_license.toLowerCase());
                    if(!imageLicenseMatch){
                        result.push({
                            rowNo:i+2,
                            errorMsg:`Invalid image license name at row no: ${i+2}`
                        })
                    } else {
                        arrOfObj[i].image_license_id = imageLicenseMatch.id;
                    }
                //}                
            }
            const errResult = {
                validDataCnt:0,
                invalidDataCnt:0,
                invalidData:result
            };
            return resolve({error:errResult,jsonArray:arrOfObj});
        } catch (error) {
            reject(error);           
        }
    });    
}
TrainingService.saveTrainingTrans = (arrOfObj)=>{
    return new Promise( async (resolve,reject)=>{
        try {
            const result = {
                validDataCnt:0,
                invalidDataCnt:0,
                invalidData:[]
            };
            // First, we start a transaction and save it into a variable
            const t = await  models.sequelize.transaction();
            for (const [i, obj] of arrOfObj.entries()) {
                //console.log('%d: %s', i, value);
                try {
                    // Then, we do some calls passing this transaction as an option:
                    obj.date_of_image_taken = moment(new Date(obj.date_of_image_taken)).isValid()?moment(new Date(obj.date_of_image_taken)).format('YYYY-MM-DD'):obj.date_of_image_taken;
                    const user = await models.training.create(obj, { transaction: t });
                    result.validDataCnt+=1;
                } catch (error) {
                    result.invalidDataCnt+=1;
                    result.invalidData.push({
                        rowNo:i+2,
                        errorMsg:error.message?error.message:''
                    })
                }
            }
            if(!result.invalidDataCnt){
                // If the execution reaches this line, no errors were thrown.
                // We commit the transaction.
                await t.commit();
            } else {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                await t.rollback();
            }
            resolve(result);
        } catch (error) {
            reject(error);           
        }
    });    
}
module.exports = TrainingService;
