const { BlobServiceClient } = require('@azure/storage-blob');
const axios = require('axios');
const models = require('../models');
const moment = require('moment');
const utils = require('../utils.js');
const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const AppConstant = require('../helper/appConstant');

class TaxonomiesService{
    constructor(){

    }
}
TaxonomiesService.updateDetail = (imageId,imageDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.taxonomies.update(imageDetail,{where : {id:imageId}});
            resolve(data);
        } catch (error) {
            reject(error);
        } 
    });
}
TaxonomiesService.gettaxonomies = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const queryFilter = await TaxonomiesService.prepareQueryFilter(context,req);
            if(queryFilter.where.taxon_id){
                const data = await models.taxonomies.findOne(queryFilter);
                if(!data){
                    const result = utils.successFormater(200,{},AppConstant.EC.NO_RECORD_FOUND);
                    utils.sendResponse(context,req,200,result);
                } else{
                    const modifiedResults = utils.modifiedResult(req, data);
                    resolve({data:modifiedResults,dataCount:0});
                }
            } else {
                const { count, rows:results } = await models.taxonomies.findAndCountAll(queryFilter);
                const modifiedResults = utils.modifiedResult(req, results);
                if(count>0 && reqQuery.isDownload && reqQuery.type === 'csv'){
                    const uploadFileDetail = await TaxonomiesService.downloadDataAsCSV(context,req,modifiedResults);
                    const result = utils.successFormater(200,uploadFileDetail,AppConstant.EC.FILE_CREATED_SUCCESSFULLY);
                    utils.sendResponse(context,req,200,result);
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

TaxonomiesService.prepareQueryFilter = (context,req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const reqQuery = req.query;
            const searchString = reqQuery.searchString || (req.body && req.body.searchString);
            const queryFilter = {};
            queryFilter.where={};
            const order = reqQuery.order || (req.body && req.body.order);
            const sort = reqQuery.sort || (req.body && req.body.sort);
            const orderBy = order && sort?true:false;
            if(orderBy) {
                queryFilter.order = orderBy?[[`${sort}`, `${order}`]]:[['id', AppConstant.C.defaultOrder]]
            }
            /* if(utils.isOrgAdmin(context,req)){
                userWhere.organization_id = req.userDetail.organizationId; // loggedin user org ID
            } else if(!utils.isSuperAdmin(context,req)){
                queryFilter.where.user_id = req.userDetail.userId;
            } */
            if(!utils.isEmpty(reqQuery.taxonId)){
                queryFilter.where.taxon_id = reqQuery.taxonId;
            } 
            queryFilter.where = searchString ? {...queryFilter.where,
                [Op.or]: [
                    (moment(new Date(searchString)).isValid())?{ created_at: {[Op.gte]: utils.convertToUTC(req,`${searchString} 00:00:00`),[Op.lte]: utils.convertToUTC(req,`${searchString} 23:59:59`)} }:{},
                    { scientific_name: {[Op.like]: `%${searchString}%`} },
                    { common_name_english: {[Op.like]: `%${searchString}%`} },
                    { cites_status: {[Op.like]: `%${searchString}%`} },
                    { order: {[Op.like]: `%${searchString}%`} },
                    { family: {[Op.like]: `%${searchString}%`} },
                    { taxon_id: {[Op.like]: `%${searchString}%`} }
                ]
                } : {...queryFilter.where};
            queryFilter.attributes = ['taxon_id','kingdom','phylum','class','subclass','order','family','genus','species','scientific_name','taxon_level','authority','common_name_english','other_common_names_english','taxonomic_notes','spanish_names','french_names','iucn_id','iucn_assessment','cites_id','cites_status','geographical_distribution','geographical_distribution_iso','iucn_reference_url','gbif_reference_url','cites_reference_url','created_at']
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

TaxonomiesService.prepareSaveData = (req) => {
    const reqBody = req.body;
    const preparedData = {};
    preparedData.kingdom = reqBody.kingdom?reqBody.kingdom:'';
    preparedData.phylum = reqBody.phylum?reqBody.phylum:'';
    preparedData.class = reqBody.class?reqBody.class:'';
    preparedData.subclass = reqBody.subclass?reqBody.subclass:'';
    preparedData.order = reqBody.order?reqBody.order:'';
    preparedData.family = reqBody.family?reqBody.family:'';
    preparedData.genus = reqBody.genus?reqBody.genus:'';
    preparedData.species = reqBody.species?reqBody.species:'';
    preparedData.scientific_name = reqBody.scientific_name?reqBody.scientific_name:'';
    preparedData.taxon_level = reqBody.taxon_level?reqBody.taxon_level:'';
    preparedData.authority = reqBody.authority?reqBody.authority:'';
    preparedData.common_name_english = reqBody.common_name_english?reqBody.common_name_english:'';
    preparedData.other_common_names_english = reqBody.other_common_names_english?reqBody.other_common_names_english:'';
    preparedData.taxonomic_notes = reqBody.taxonomic_notes?reqBody.taxonomic_notes:'';
    preparedData.spanish_names = reqBody.spanish_names?reqBody.spanish_names:'';
    preparedData.french_names = reqBody.french_names?reqBody.french_names:'';
    preparedData.iucn_id = reqBody.iucn_id?reqBody.iucn_id:'';
    preparedData.iucn_assessment = reqBody.iucn_assessment?reqBody.iucn_assessment:'';
    preparedData.cites_id = reqBody.cites_id?reqBody.cites_id:'';
    preparedData.cites_status = reqBody.cites_status?reqBody.cites_status:'';
    preparedData.geographical_distribution = reqBody.geographical_distribution?reqBody.geographical_distribution:'';
    preparedData.geographical_distribution_iso = reqBody.geographical_distribution_iso?reqBody.geographical_distribution_iso:'';
    preparedData.iucn_reference_url = reqBody.iucn_reference_url?reqBody.iucn_reference_url:'';
    preparedData.gbif_reference_url = reqBody.gbif_reference_url?reqBody.gbif_reference_url:'';
    preparedData.cites_reference_url = reqBody.cites_reference_url?reqBody.cites_reference_url:'';
    if(reqBody.taxon_id){
        preparedData.updated_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
    } else {
        preparedData.created_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
        preparedData.updated_at = moment().format(AppConstant.C.dateFormat.DBDateTimeFormat);
    }
    return preparedData;
}
TaxonomiesService.saveTaxonomies = (context,req,preparedData) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.taxonomies.create(preparedData);
            resolve(data);
        } catch (error) {

            reject(error);
        } 
    });
}
TaxonomiesService.updateTaxonomies = (taxonId,preparedData) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.taxonomies.update(preparedData,{where : {taxon_id:taxonId}});
            resolve(data);
        } catch (error) {
            reject(error);
        } 
    });
}
TaxonomiesService.downloadDataAsCSV = (context,req,rows) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const dataRows = rows.map(obj=>{
                return {
                    "Taxon Id":obj.taxon_id,
                    "kingdom":obj.kingdom,
                    "Phylum":obj.phylum,
                    "Class":obj.class,
                    "Sub Class":obj.subclass,
                    "Order":obj.order,
                    "Family":obj.family,
                    "Genus":obj.genus,
                    "Species":obj.species,
                    "Scientific Name":obj.scientific_name,
                    "Taxon Level":obj.taxon_level,
                    "Authority":obj.authority,
                    "Common Name English":obj.common_name_english,
                    "Other Common Names English":obj.other_common_names_english,
                    "Taxonomic Notes":obj.taxonomic_notes,
                    "Spanish Names":obj.spanish_names,
                    "French Names":obj.french_names,
                    "IUCN Id":obj.iucn_id,
                    "IUCN Assessment":obj.iucn_assessment,
                    "Cites ID":obj.cites_id,
                    "Cites Status":obj.cites_status,
                    "Geographical Distribution":obj.geographical_distribution,
                    "Geographical Distribution ISO":obj.geographical_distribution_iso,
                    "IUCN Reference URL":obj.iucn_reference_url,
                    "GBIF Reference URL":obj.gbif_reference_url,
                    "Cites Reference URL":obj.cites_reference_url,
                    "Added Date":obj.created_at
                };
            })
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(dataRows);
            const fileObj = {
                fileName:`Taxonomies_${Date.now()}.csv`,
                fileContent:csv
            }
            /* let writer = fs.createWriteStream(`Taxonomies_${Date.now()}.csv`); 
            writer.write(csv); */
            const fileDetail = await TaxonomiesService.uploadTmpFiles(fileObj);   
            resolve(fileDetail);                   
        } catch (error) {
            reject(error);
        } 
    });
}
TaxonomiesService.uploadTmpFiles = (imageObj) => {
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
            imageDetail.taxon_id = uploadblobResponse.taxonId;
            resolve(imageDetail);
        } catch (error) {
            reject(error);
        } 
    });
}
TaxonomiesService.saveTaxonomiesTrans = (arrOfObj)=>{
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
                    const user = await models.taxonomies.create(obj, { transaction: t });
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
module.exports = TaxonomiesService;
