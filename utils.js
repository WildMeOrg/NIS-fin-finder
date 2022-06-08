
// const res = require("express/lib/response");

const AppConstant = require('./helper/appConstant');
const csv=require('csvtojson');
const multipart = require('parse-multipart');
const moment = require('moment');

class Utils{
  constructor(){

  }
}
Utils.commonApiResponse = (rows, count=0) => {
  // console.log("rows response for ", rows)
  // console.log("Creating response for ", count)
  var responseData = {
    statusCode: '',
    data: []
  }
  try {
    if(Array.isArray(rows)){
      if(rows.length === 0){
        responseData.statusCode=200;        
        responseData.message="Data Not Available !";

        return responseData;
      }else{
        responseData.totalCount=count?count:rows.length;
        responseData.statusCode=200;        
        responseData.message="Data Available !";
        responseData.data=rows;
        return responseData;
      }
    } else {
      if(Object.keys(rows).length === 0){
        responseData.statusCode=200;
        responseData.data={};
        responseData.message="Data Not Available !";
        return responseData;
      }else{
        responseData.statusCode=200;        
        responseData.message="Data Available !";
        responseData.data=rows;
        return responseData;
      }
    }
  } catch (error) {
    responseData.statusCode=400;
    responseData.message="Bad request !";
    return responseData;
    
  }
}

Utils.commonSingleApiResponse = (rows) => {
  var responseData = {
    statusCode: '',
    data: {}
  }
  try {
    if(!rows){
        responseData.statusCode=200;        
        responseData.message="Data Not Available !";

        return responseData;
    }else{
      // responseData.totalCount=count?count:rows.length;
      responseData.statusCode=200;        
      responseData.message="Data Available !";
      responseData.data=rows;
      return responseData;
    }
  } catch (error) {
    responseData.statusCode=400;
    responseData.message="Bad request !";
    return responseData;
    
  }
}
/* Delete Api Response */

Utils.commonDeleteApiResponse = (count) => {
  var responseData = {
    statusCode: '',
    data: []
  }
  try {
    if(count === 0){
        responseData.statusCode=204;        
        responseData.message="Data Not Available !";

        return responseData;
    }else{
      responseData.statusCode=204;        
      responseData.message="Data Deleted !";
      responseData.data=[];

      return responseData;
    }
  } catch (error) {
    responseData.statusCode=400;
    responseData.message="Bad request !";
    return responseData;
    
  }
}

Utils.isEmpty = (data, zeroIsNotEmpty = false) => {

  if (typeof data !== "object" && (data === null || data === "" || typeof data === "undefined")) {
      return true;
  } else if (data === null) {
      return true;
  } else if (typeof data === "string" && data === "0" && !zeroIsNotEmpty) {
      return true;
  } else if (typeof data.length !== "undefined") {
      if (data.length > 0) {
          return false;
      } else {
          return true;
      }
  } else {
      if (Object.keys(data).length > 0) {
          return false;
      } else if (typeof data === "number" && (data !== 0 || zeroIsNotEmpty)) {
          return false;
      } else {
          if (data === true) {
              return false;
          }
          return true;
      }
  }
}

Utils.errorObject = (code = 'NISERR', message = "", displayMessage = "") => {

  const errorObject = {
      code,
      message,
      displayMessage: displayMessage !== "" ? displayMessage : message,
  };
  return errorObject;
}
Utils.errorFormater = (statusCode, error, message = "") => {

  const finalError = {
      statusCode,
      error,
      message,
  };
  return finalError;
}
Utils.successFormater = (statusCode, data, message = "") => {

  const succObject = {
      statusCode,
      data,
      message,
  };
  return succObject;
}
Utils.sendResponse = (context,req,statusCode,response,err=false) => {
  let responseData = response;
  if(err){
    let error = {};
    if (typeof err === 'object') {
      if (err.message) {
        error = Utils.errorObject('Utils001',err.message,AppConstant.EC.TECH_ERROR);
      } else if (err.stack) {
        error = Utils.errorObject('Utils002',err.stack,AppConstant.EC.TECH_ERROR);
      }
      if (err[0] && err[0].message) {
        error = Utils.errorObject('Utils003',err[0].message,AppConstant.EC.TECH_ERROR);
      }
    } else if (typeof err === 'string') {
      error = Utils.errorObject('Utils004',err,AppConstant.EC.TECH_ERROR);
    }
    statusCode = statusCode?statusCode:500;
    let errArr = new Array(error);
    responseData = Utils.errorFormater(500,errArr);
  }
  
    context.res = {
      status: statusCode,
      body: !Utils.isEmpty(responseData)?responseData:'',
      headers: {
          'Content-Type': 'application/json'
      }
  }
  context.done();
}
Utils.isSuperAdmin = (context,req) => {
  if(!Utils.isEmpty(req.userDetail.userRoles) && req.userDetail.userRoles.includes(AppConstant.C.superAdminRoleId)){
    return true;
  } else {
    return false;
  }
}
Utils.isOrgAdmin = (context,req) => {

  if(!Utils.isEmpty(req.userDetail.userRoles) && req.userDetail.userRoles.includes(AppConstant.C.orgAdminRoleId) && !Utils.isSuperAdmin(context,req)){
    return true;
  } else {
    return false;
  }
}
Utils.getCSVToJSON = (context,req) => {
  return new Promise( async (resolve,reject)=>{
      try {
          const fileDetail = {};
          var bodyBuffer = Buffer.from(req.body);
          var boundary = multipart.getBoundary(req.headers['content-type']);
          var parts = multipart.Parse(bodyBuffer, boundary);
          const blobName = `${Date.now()}_${parts[0].filename}`;
          fileDetail.storage_file_name = blobName;
          fileDetail.display_file_name = parts[0].filename;
          fileDetail.file_type = parts[0].type;
          //const jsonArray= await csv().fromStream(request.get('https://nisportalapi.blob.core.windows.net/tmp-files/Taxonomy-Table-csv - Copy.csv'));
          const jsonArray= await csv().fromString(parts[0].data.toString());
          /* let spliceArr = [];
          while (jsonArray.length) {
              spliceArr.push(jsonArray.splice(0, 500));
          }
          let result = [];
          for (const arr of spliceArr) {
              const data = await models.taxonomies.bulkCreate(arr);
              result.push(data);
          } */
          for (let [i, obj] of jsonArray.entries()) {
            obj = Utils.senitizeObj(obj);
          }
          resolve(jsonArray);
      } catch (error) {
          reject(error);
      } 
  });
}
Utils.getTimeZone = (req) => {
  return req.query && req.query.timeZone?req.query.timeZone:(req.body && req.body.timeZone?req.body.timeZone:'Asia/Kolkata');
}
Utils.utcToTimeZone = (req,datetime,format=AppConstant.C.dateFormat.momentDateTimeFormat) => {
  var cutoffString = datetime; // in utc
  var utcCutoff = moment.utc(cutoffString, AppConstant.C.dateFormat.DBDateTimeFormat);
  var displayCutoff = utcCutoff.clone().tz(Utils.getTimeZone(req));
 /*  console.log('datetime:', datetime);
  console.log('utcCutoff:', utcCutoff.format(AppConstant.C.dateFormat.DBDateTimeFormat));
  console.log('displayCutoff:', displayCutoff.format(AppConstant.C.dateFormat.DBDateTimeFormat)); */
  return displayCutoff.format(format);
}
Utils.convertToUTC = (req,datetime) => {
  var utcCutoff = moment.utc(new Date(datetime), AppConstant.C.dateFormat.DBDateTimeFormat);
  return utcCutoff.format(AppConstant.C.dateFormat.DBDateTimeFormat);
}
Utils.modifiedResult = (req,dataArrOrObj) => {
  const arrOrObj = JSON.parse(JSON.stringify(dataArrOrObj));
  if(Array.isArray(arrOrObj)){
    for (const [i, obj] of arrOrObj.entries()) {
      if(obj.created_at){
        arrOrObj[i].created_at = Utils.utcToTimeZone(req,obj.created_at);
      }
      if(obj.updated_at){
        arrOrObj[i].updated_at = Utils.utcToTimeZone(req,obj.updated_at);
      }      
    }
  } else {
      if (arrOrObj.hasOwnProperty('created_at')) {
        arrOrObj.created_at = Utils.utcToTimeZone(req,arrOrObj.created_at);
      }
      if (arrOrObj.hasOwnProperty('updated_at')) {
        arrOrObj.updated_at = Utils.utcToTimeZone(req,arrOrObj.updated_at);
      }
  }
  return arrOrObj;
}
Utils.removeMultipleSpace = (str) => {
  return str.replace(/\s\s+/g, ' ');
}
Utils.trimStr = (str) => {
  return str.trim();
}
Utils.getFolderPathFromReq = (req) =>{
  const orgName = req.userDetail && req.userDetail.organizationName?Utils.trimStr(req.userDetail.organizationName):'defaultOrg';
  const userEmail = req.userDetail && req.userDetail.email?Utils.trimStr(req.userDetail.email):'defaultEmail';
  return `${orgName}/${userEmail}/`;
}
Utils.senitizeObj = (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof(value) === 'string')
      obj[key] = Utils.trimStr(value);
  }
  return obj;
}
module.exports = Utils;