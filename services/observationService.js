const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');
const axios = require('axios');
const models = require('../models');
const moment = require('moment');
const utils = require('../utils.js');
const { Op } = require("sequelize");
const { Parser } = require('json2csv');
const path = require('path');
const AppConstant = require('../helper/appConstant');
const emailHelper = require('../helper/emailHelper.js');
class ObservationService{
    constructor(){

    }
}

ObservationService.uploadObservationImageUsingMultipart = (req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqBody = req.body;
            const fileDetail = {};
            // Create the BlobServiceClient object which will be used to create a container client
            const blobServiceClient = BlobServiceClient.fromConnectionString(AppConstant.C.blobConnectionString);
            //const createContainerResponse = await containerClient.create().catch(err=>console.log("container create error ===== ",err));
            // Get a reference to a container
            console.log("reqBody============",reqBody);
            const containerClient = blobServiceClient.getContainerClient('observation-images');
            var bodyBuffer = Buffer.from(reqBody);
            var boundary = multipart.getBoundary(req.headers['content-type']);
            var parts = multipart.Parse(bodyBuffer, boundary);
            console.log("parts============",parts);
            const extArr = path.extname(parts[0].filename).split('.');
            const ext = extArr[extArr.length - 1];
            const baseName = `${path.parse(parts[0].filename).name}_${Date.now()}.${ext}`;
            const blobName = `${utils.getFolderPathFromReq(req)}${baseName}`;

            fileDetail.storage_file_name = baseName;
            fileDetail.display_file_name = parts[0].filename;
            fileDetail.file_type = parts[0].type;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const options = { blobHTTPHeaders: { blobContentType: fileDetail.file_type } };
            fileDetail.storage_file_url = blockBlobClient.url;
            const uploadblobResponse = await blockBlobClient.upload(parts[0].data, parts[0].data.length,options);
            fileDetail.request_id = uploadblobResponse.requestId;
            fileDetail.created_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
            fileDetail.updated_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
            fileDetail.request_from = req.requestFrom;
            if(!utils.isEmpty(reqBody.latitude) && !utils.isEmpty(reqBody.longitude)){
                const point = { type: 'Point', coordinates: [reqBody.longitude, reqBody.latitude]}; // GeoJson format: [lng, lat]
                fileDetail.location = point;
            }
            resolve(fileDetail);
        } catch (error) {
            console.log("error=======",error);
            reject("Issue in upload file, Please try latar!!!");
        } 
    });
}
ObservationService.uploadObservationImageUsingContent = (req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqBody = req.body;
            const fileDetail = {};
            // Create the BlobServiceClient object which will be used to create a container client
            const blobServiceClient = BlobServiceClient.fromConnectionString(AppConstant.C.blobConnectionString);
            // Get a reference to a container
            const containerClient = blobServiceClient.getContainerClient('observation-images');
            //const createContainerResponse = await containerClient.create().catch(err=>console.log("container create error ===== ",err));
            let buff = new Buffer(reqBody.fileContent, 'base64');
            /* const fs = require('fs');
            const file = fs.createWriteStream("obsrCheck.jpg");
            file.write(buff); */
            const extArr = path.extname(reqBody.fileName).split('.');
            const ext = extArr[extArr.length - 1];
            const baseName = `${path.parse(reqBody.fileName).name}_${Date.now()}.${ext}`;
            const blobName = `${utils.getFolderPathFromReq(req)}${baseName}`;
            fileDetail.storage_file_name = baseName;
            fileDetail.display_file_name = reqBody.fileName;
            fileDetail.file_type = reqBody.fileType;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            const options = { blobHTTPHeaders: { blobContentType: reqBody.fileType } };
            fileDetail.storage_file_url = blockBlobClient.url;
            const uploadblobResponse = await blockBlobClient.upload(buff, buff.length,options);
            fileDetail.request_id = uploadblobResponse.requestId;
            fileDetail.created_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
            fileDetail.updated_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
            fileDetail.request_from = req.requestFrom;
            if(!utils.isEmpty(reqBody.latitude) && !utils.isEmpty(reqBody.longitude)){
                const point = { type: 'Point', coordinates: [reqBody.longitude, reqBody.latitude]}; // GeoJson format: [lng, lat]
                fileDetail.location = point;
            }
            resolve(fileDetail);
        } catch (error) {
            console.log("error=======",error);
            reject("Issue in upload file, Please try latar!!!");
        } 
    });
}
ObservationService.getJobId = (req,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        const tpData = await models.tp_api_log.create({api_name:'cv_lightnet',api_url:`${AppConstant.C.wildMeBaseUrl}/detect/cnn/lightnet/`,api_method:'POST',request_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)});
        try {
            var data = JSON.stringify({
            "model_tag": "fins_enforcement_v0",
            "nms_thresh": 0.4,
            "sensitivity": 0.63,
            "labeler_algo": "densenet",
            "labeler_model_tag": "fins_enforcement_v0",
            "use_labeler_species": true,
            "callback_url":AppConstant.C.observationCallbackURL,
            "callback_detailed":true,
            "image_uuid_list": [
                fileDetail.storage_file_url  //"https://www.flukebook.org/wildbook_data_dir/0/3/03546226-3cc9-4c19-928f-d6cd85ac282a/3271.JPG"
            ]
            });
            models.tp_api_log.update({request_data:JSON.stringify(data)},{where : {id: tpData.id}})
            var config = {
            method: 'post',
            url: `${AppConstant.C.wildMeBaseUrl}/detect/cnn/lightnet/`,
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
            };

            axios(config)
            .then(function (response) {
                models.tp_api_log.update({response_data:JSON.stringify(response.data),response_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)},{where : {id: tpData.id}})
                if(response && response.data.response && response.data.status && response.data.status.code && response.data.status.code != 200){
                    emailHelper.sendEmail({to:AppConstant.C.defaultAppAlert,subject:'CV Lightnet API Invalid Response',html:JSON.stringify(response.data)});
                }
                resolve(response.data);
            })
            .catch(function (error) {
                models.tp_api_log.update({response_data:JSON.stringify(error),response_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)},{where : {id: tpData.id}})
                emailHelper.sendEmail({to:AppConstant.C.defaultAppAlert,subject:'CV lightnet API down',html:JSON.stringify(error)});
                reject(error);
            });

        } catch (error) {
            models.tp_api_log.update({response_data:JSON.stringify(error),response_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)},{where : {id: tpData.id}})
            emailHelper.sendEmail({to:AppConstant.C.defaultAppAlert,subject:'CV lightnet API down',html:JSON.stringify(error)});
            reject(error);
        } 
    });
}

ObservationService.getJobIdResult = (req,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        const tpData = await models.tp_api_log.create({api_name:'cv_result',api_url:`${AppConstant.C.wildMeBaseUrl}/job/result/?jobid=${fileDetail.cv_jobid}&__format__=false`,api_method:'GET',request_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)});

        try {

            var config = {
            method: 'get',
            url: `${AppConstant.C.wildMeBaseUrl}/job/result/?jobid=${fileDetail.cv_jobid}&__format__=false`
            };
            await models.tp_api_log.update({request_data:`${AppConstant.C.wildMeBaseUrl}/job/result/?jobid=${fileDetail.cv_jobid}&__format__=false`},{where : {id: tpData.id}})
            axios(config)
            .then(function (response) {
                models.tp_api_log.update({response_data:JSON.stringify(response.data),response_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)},{where : {id: tpData.id}})
                if(response && response.data.response && response.data.status && response.data.status.code && response.data.status.code != 200){
                    emailHelper.sendEmail({to:AppConstant.C.defaultAppAlert,subject:'CV result API invalid Response',html:JSON.stringify(response.data)});
                }
                resolve(response.data);
            })
            .catch(function (error) {
                models.tp_api_log.update({response_data:JSON.stringify(error),response_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)},{where : {id: tpData.id}})
                emailHelper.sendEmail({to:AppConstant.C.defaultAppAlert,subject:'CV result API down',html:JSON.stringify(error)});
                reject(error);
            });

        } catch (error) {
            models.tp_api_log.update({response_data:JSON.stringify(error),response_time:moment().format(AppConstant.C.dateFormat.DBDateTimeFormat)},{where : {id: tpData.id}})
            emailHelper.sendEmail({to:AppConstant.C.defaultAppAlert,subject:'CV result API down',html:JSON.stringify(error)});
            reject(error);
        } 
    });
}

ObservationService.saveObservation = (req,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.observation.create(fileDetail);
            resolve(data);
        } catch (error) {
            reject(error);
        } 
    });
}
ObservationService.updateObservationTaxon = (req,fileDetail) => {

    return new Promise( async (resolve,reject)=>{
        try {
            let updateObj = {};
            updateObj.updated_at=moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
            if(fileDetail.cv_result){
                updateObj.cv_result = fileDetail.cv_result;
            }
            if(fileDetail.cv_status){
                updateObj.cv_status = fileDetail.cv_status;
            }
            if(fileDetail.retry_attempted){
                updateObj.retry_attempted = fileDetail.retry_attempted;
            }
            if(fileDetail.cv_result && fileDetail.cv_result.results_list && fileDetail.cv_result.results_list[0]){
                let i=0;
                for (const obj of fileDetail.cv_result.results_list[0]) {
                    const taxonoData = await models.taxonomies.findOne({where:{scientific_name:{[Op.substring]:obj.species}}}).catch(e=>console.log(e));
                    if(taxonoData){
                        fileDetail.cv_result.results_list[0][i]['taxonId'] = taxonoData.taxon_id;
                    }
                    i++;
                }
            }
            models.sequelize.transaction(function (t) {
                // chain all your queries here. make sure you return them.
                return models.observation.update(updateObj,{where : {id: fileDetail.id}}, {transaction: t}).then(function (user) {
                        return models.observation_taxon.destroy({where : {observation_id:fileDetail.id}}, {transaction: t});
                }).then(function (affectedRows) {
                    const cvResult = fileDetail.cv_result;
                    if(cvResult && cvResult.results_list && cvResult.results_list[0] && (cvResult.results_list[0]).length){
                        const obsrTaxonArr = cvResult.results_list[0].map(val=>{
                            return {
                                observation_id:fileDetail.id,
                                taxon_id:val.taxonId,
                                confidence:val.confidence
                            }
                        })
                        return models.observation_taxon.bulkCreate(obsrTaxonArr, {transaction: t});
                    } else {
                        return resolve({});
                    }
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
ObservationService.getObservation = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const queryFilter = await ObservationService.prepareQueryFilter(context,req);
            if(queryFilter.where.request_id){
                const data = await models.observation.findOne(queryFilter);
                if(!data){
                    const result = utils.successFormater(200,{},AppConstant.EC.NO_RECORD_FOUND);
                    utils.sendResponse(context,req,200,result);
                } else{
                    const modifiedResults = utils.modifiedResult(req,data);
                    resolve({data:modifiedResults,dataCount:0});
                }
            } else {
                const { count, rows:results } = await models.observation.findAndCountAll(queryFilter);
                const modifiedResults = utils.modifiedResult(req, results);
                if(count>0 && reqQuery.isDownload && reqQuery.type === 'csv'){
                    const uploadFileDetail = await ObservationService.downloadDataAsCSV(context,req,modifiedResults);
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

ObservationService.prepareQueryFilter = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const searchString = reqQuery.searchString || (req.body && req.body.searchString);
            const queryFilter = {};
            queryFilter.where={};
            const userWhere = {};
            const order = req.query.order || (req.body && req.body.order);
            const sort = req.query.sort || (req.body && req.body.sort);
            const orderBy = order && sort?true:false;
            if(orderBy && ['first_name'].includes(sort)){
                queryFilter.order = [[{model:models.user,as:'userDetail'},`${sort}`, `${order}`]]
            } else {
                queryFilter.order = orderBy?[[`${sort}`, `${order}`]]:[['id', 'DESC']]
            }

            if(utils.isOrgAdmin(context,req) && !utils.isSuperAdmin(context,req)){
                userWhere.organization_id = req.userDetail.organizationId; // loggedin user org ID
            } else if(!utils.isSuperAdmin(context,req)){
                queryFilter.where.user_id = req.userDetail.userId;
            }
            if(!utils.isEmpty(reqQuery.requestId)){
                queryFilter.where.request_id = reqQuery.requestId;
            }
            if(!utils.isEmpty(reqQuery.userId)){
                queryFilter.where.user_id = reqQuery.userId;
            }
            if(reqQuery.isHistory){
                if(Number(reqQuery.isHistory) === 1){
                    queryFilter.where.created_at = {[Op.lte] : utils.convertToUTC(req,`${moment().format('YYYY-MM-DD')} 00:00:00`)};
                } else{
                    queryFilter.where.created_at = {[Op.between] : [utils.convertToUTC(req,`${moment().format('YYYY-MM-DD')} 00:00:00`) , utils.convertToUTC(req,`${moment().format('YYYY-MM-DD')} 23:59:59`) ]};
                }
            } else if(!utils.isEmpty(reqQuery.startDate) && !utils.isEmpty(reqQuery.endDate)) {
                queryFilter.where.created_at = {[Op.between] : [utils.convertToUTC(req,`${reqQuery.startDate} 00:00:00`) , utils.convertToUTC(req,`${reqQuery.endDate} 23:59:59`) ]};
            }            
            queryFilter.where = searchString ? {...queryFilter.where,
                [Op.or]: [
                    (moment(new Date(searchString)).isValid())?{ created_at: {[Op.gte]: utils.convertToUTC(req,`${searchString} 00:00:00`),[Op.lte]: utils.convertToUTC(req,`${searchString} 23:59:59`)} }:{},
                    { display_file_name: {[Op.like]: `%${searchString}%`} },
                    { cv_status: {[Op.like]: `%${searchString}%`} },
                    { '$userDetail.full_name$': {[Op.like]: `%${searchString}%`} }
                ]
                } : {...queryFilter.where};
                //[models.sequelize.fn('date_format', models.sequelize.col('observation.created_at'), AppConstant.C.dateFormat.defaultDateFormat), 'created_at']
            queryFilter.attributes = ['id','request_id',['display_file_name','file_name'],['storage_file_url','file_url'],'cv_status',[models.Sequelize.literal(`CASE cv_status WHEN 1 THEN 'Completed' ELSE 'Pending' END`), 'cv_status_name'],'created_at','location']
            queryFilter.include=[
                /* {
                    model:models.observation_report,
                    as:'reportDetail',
                    attributes:['id'],
                    include: {
                        model: models.user,
                        as:'reportUserDetail',
                        attributes:['first_name','last_name'],
                      }
                }, */
                {
                    model:models.user,
                    as:'reportUserDetail',
                    attributes:['first_name','last_name', 'full_name'],
                    through: {attributes: []},
                    required:false
                },
                {
                    model:models.user,
                    as:'userDetail',
                    attributes:['first_name','last_name', 'full_name'],
                    where:userWhere,
                    required:true
                },
                {
                    model:models.taxonomies,
                    as:'taxonDetail',
                    attributes:['class','subclass','order','family','scientific_name','common_name_english','iucn_assessment','cites_status','geographical_distribution','other_common_names_english'],
                    through: { as:'additionalDetail',attributes: ['confidence']},
                    required:false
                }
            ];
            queryFilter.distinct = true;
            //queryFilter.subQuery = false;
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
ObservationService.fetchAndUpdateObservationResult = (context,req,observationObj) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const fileDetail = {
                cv_jobid:observationObj.cv_jobid,
                id:observationObj.id
            }
            const jobIdResult = await ObservationService.getJobIdResult(req,fileDetail);
            if(jobIdResult.response && jobIdResult.response.status && jobIdResult.response.status == 'completed' && jobIdResult.response.json_result){
                fileDetail.cv_status = 1;
                fileDetail.cv_result = jobIdResult.response.json_result;
            }
            fileDetail.retry_attempted = observationObj?Number(observationObj.retry_attempted)+1:0;
            ObservationService.updateObservationTaxon(req,fileDetail).catch(e=>console.log(" fetchAndUpdateObservationResult updateObservationTaxon error ============",e));           
            resolve(fileDetail);
        } catch (error) {
            reject(error);
        } 
    });
}

ObservationService.observationCron = (context,jobId='') => { // use jobId for CV callback handler 
    return new Promise( async (resolve,reject)=>{
        try {
            const req = {};
            /* var timeStamp = new Date().toISOString();
            const obj={
                query:timeStamp,
            }
            
            const ddata = await ObservationService.saveObservation(req,{cv_result:obj}); */
            const where={cv_status:0,user_id:{[Op.gt]: 0},retry_attempted:{[Op.lte]: 10}};
            if(!utils.isEmpty(jobId)){
                where.cv_jobid = jobId;
            }
            const data = await models.observation.findAll({where});
            for (const obj of data) {
                ObservationService.fetchAndUpdateObservationResult(context,req,obj).catch(e=>console.log(e));
            }
            resolve(req);
        } catch (error) {
            console.log("Error in observationCron service =======",error);
            reject(`Error in observationCron service`);
        } 
    });
}
ObservationService.downloadDataAsCSV = (context,req,rows) => {
    return new Promise( async (resolve,reject)=>{
        try {
                const dataRows = rows.map(obj=>{
                    return {
                        "User First Name": obj.userDetail && obj.userDetail.first_name?obj.userDetail.first_name:'',
                        "User Last Name": obj.userDetail && obj.userDetail.last_name?obj.userDetail.last_name:'',
                        "Image Name": obj.file_name,
                        "Image Url": obj.file_url?obj.file_url:'',
                        "Status": obj.cv_status_name?obj.cv_status_name:'',
                        "Class": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].class?obj.taxonDetail[0].class:'',
                        "Subclass": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].subclass?obj.taxonDetail[0].subclass:'',
                        "Order": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].order?obj.taxonDetail[0].order:'',
                        "Family": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].family?obj.taxonDetail[0].family:'',
                        "Scientific Name": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].scientific_name?obj.taxonDetail[0].scientific_name:'',
                        "Common Name English": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].common_name_english?obj.taxonDetail[0].common_name_english:'',
                        "Other Common Names English": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].other_common_names_english?obj.taxonDetail[0].other_common_names_english:'',                        
                        "IUCN Assessment": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].iucn_assessment?obj.taxonDetail[0].iucn_assessment:'',
                        "CITES Status": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].cites_status?obj.taxonDetail[0].cites_status:'',
                        "Geographical Distribution": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].geographical_distribution?obj.taxonDetail[0].geographical_distribution:'',
                        "Confidence": obj.taxonDetail && obj.taxonDetail.length && obj.taxonDetail[0].additionalDetail && obj.taxonDetail[0].additionalDetail.confidence?obj.taxonDetail[0].additionalDetail.confidence:'',
                        "Feedback":obj.reportUserDetail && obj.reportUserDetail.length ?'Flagged for further verification':'',
                        "Added Date": obj.created_at
                    }
                })
                const json2csvParser = new Parser();
                const csv = json2csvParser.parse(dataRows);
                const fileObj = {
                    fileName:`Observation_${Date.now()}.csv`,
                    fileContent:csv
                }
                /* let writer = fs.createWriteStream(`Training_${Date.now()}.csv`); 
                writer.write(csv); */
                const fileDetail = await ObservationService.uploadTmpFiles(fileObj);   
                resolve(fileDetail);                   
        } catch (error) {
            reject(error);
        } 
    });
}
ObservationService.uploadTmpFiles = (imageObj) => {
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
ObservationService.prepareReportData = (req,params={}) => {
    const reqBody = req.body;
    params.user_id = (req.userDetail && req.userDetail.userId)?req.userDetail.userId:0;
    params.observation_id = reqBody.observationId?reqBody.observationId:'';
    params.created_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
    params.updated_at=moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
    return params;
}
ObservationService.observationReport = (req,obj) =>  {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.observation_report.create(obj);
            const modifiedResults = utils.modifiedResult(req, data);
            resolve(modifiedResults);
        } catch (error) {
            reject(error);
        } 
    });
}
ObservationService.getObservationReport = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const queryFilter = await ObservationService.prepareReportQueryFilter(context,req);
            if(queryFilter.where.id){
                const data = await models.observation_report.findOne(queryFilter);
                if(!data){
                    const result = utils.successFormater(200,{},AppConstant.EC.NO_RECORD_FOUND);
                    utils.sendResponse(context,req,200,result);
                } else{
                    const modifiedResults = utils.modifiedResult(req,data);
                    resolve({data:modifiedResults,dataCount:0});
                }
            } else {
                const { count, rows:results } = await models.observation_report.findAndCountAll(queryFilter);
                const modifiedResults = utils.modifiedResult(req, results);
                if(count>0 && reqQuery.isDownload && reqQuery.type === 'csv'){
                    /* const uploadFileDetail = await ObservationService.downloadDataAsCSV(context,req,modifiedResults);
                    const result = utils.successFormater(200,uploadFileDetail,AppConstant.EC.FILE_CREATED_SUCCESSFULLY);
                    utils.sendResponse(context,req,200,result); */
                } else {
                    resolve({data:modifiedResults,dataCount:count});
                }
            }                        
        } catch (error) {
            reject(error);
        } 
    });
}

ObservationService.prepareReportQueryFilter = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const searchString = reqQuery.searchString || (req.body && req.body.searchString);
            const queryFilter = {};
            queryFilter.where={};
            const userWhere = {};
            const order = req.query.order || (req.body && req.body.order);
            const sort = req.query.sort || (req.body && req.body.sort);
            const orderBy = order && sort?true:false;

            queryFilter.order = orderBy?[[`${sort}`, `${order}`]]:[['id', 'DESC']]

            if(utils.isOrgAdmin(context,req) && !utils.isSuperAdmin(context,req)){
                userWhere.organization_id = req.userDetail.organizationId; // loggedin user org ID
            } else if(!utils.isSuperAdmin(context,req)){
                queryFilter.where.user_id = req.userDetail.userId;
            }
            if(!utils.isEmpty(reqQuery.observationId)){
                queryFilter.where.observation_id = reqQuery.observationId;
            }
            if(!utils.isEmpty(reqQuery.reportId)){
                queryFilter.where.id = reqQuery.reportId;
            }
            if(!utils.isEmpty(reqQuery.userId)){
                queryFilter.where.user_id = reqQuery.userId;
            }       
            queryFilter.where = searchString ? {...queryFilter.where,
                [Op.or]: [
                    (moment(new Date(searchString)).isValid())?{ created_at: {[Op.gte]: utils.convertToUTC(req,`${searchString} 00:00:00`),[Op.lte]: utils.convertToUTC(req,`${searchString} 23:59:59`)} }:{},
                    { '$reportUserDetail.first_name$': {[Op.like]: `%${searchString}%`} },
                    { '$reportUserDetail.last_name$': {[Op.like]: `%${searchString}%`} }
                ]
                } : {...queryFilter.where};
                //[models.sequelize.fn('date_format', models.sequelize.col('observation.created_at'), AppConstant.C.dateFormat.defaultDateFormat), 'created_at']
                queryFilter.attributes = ['id','created_at']
            queryFilter.include=[
                {
                    model:models.observation,
                    as:'reportObservationDetail',
                    attributes:['id','request_id',['display_file_name','file_name'],['storage_file_url','file_url'],'cv_status',[models.Sequelize.literal(`CASE cv_status WHEN 1 THEN 'Completed' ELSE 'Pending' END`), 'cv_status_name'],'created_at','location'],
                    required:false
                },
                {
                    model:models.user,
                    as:'reportUserDetail',
                    attributes:['first_name','last_name', 'full_name'],
                    where:userWhere,
                    required:false
                }
            ];
            queryFilter.distinct = true;
            queryFilter.subQuery = false;
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
module.exports = ObservationService;
