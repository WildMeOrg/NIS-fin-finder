const constants = require('./config/constants');
const csv = require('csvtojson');
const multipart = require('parse-multipart');
const moment = require('moment');

class Utils {
    constructor() {
    }
}

Utils.commonApiResponse = (rows, count = 0) => {
    var responseData = {
        statusCode: '',
        data: []
    }
    try {
        if (Array.isArray(rows)) {
            if (rows.length === 0) {
                responseData.statusCode = 200;
                responseData.message = "Data Not Available !";

                return responseData;
            } else {
                responseData.totalCount = count ? count : rows.length;
                responseData.statusCode = 200;
                responseData.message = "Data Available !";
                responseData.data = rows;
                return responseData;
            }
        } else {
            if (Object.keys(rows).length === 0) {
                responseData.statusCode = 200;
                responseData.data = {};
                responseData.message = "Data Not Available !";
                return responseData;
            } else {
                responseData.statusCode = 200;
                responseData.message = "Data Available !";
                responseData.data = rows;
                return responseData;
            }
        }
    } catch (error) {
        responseData.statusCode = 400;
        responseData.message = "Bad request !";
        return responseData;

    }
}

Utils.commonSingleApiResponse = (rows) => {
    var responseData = {
        statusCode: '',
        data: {}
    }
    try {
        if (!rows) {
            responseData.statusCode = 200;
            responseData.message = "Data Not Available !";

            return responseData;
        } else {
            // responseData.totalCount=count?count:rows.length;
            responseData.statusCode = 200;
            responseData.message = "Data Available !";
            responseData.data = rows;
            return responseData;
        }
    } catch (error) {
        responseData.statusCode = 400;
        responseData.message = "Bad request !";
        return responseData;

    }
}

Utils.commonDeleteApiResponse = (count) => {
    var responseData = {
        statusCode: '',
        data: []
    }
    try {
        if (count === 0) {
            responseData.statusCode = 204;
            responseData.message = "Data Not Available !";

            return responseData;
        } else {
            responseData.statusCode = 204;
            responseData.message = "Data Deleted !";
            responseData.data = [];

            return responseData;
        }
    } catch (error) {
        responseData.statusCode = 400;
        responseData.message = "Bad request !";
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
        return data.length <= 0;
    } else {
        if (Object.keys(data).length > 0) {
            return false;
        } else if (typeof data === "number" && (data !== 0 || zeroIsNotEmpty)) {
            return false;
        } else {
            return data !== true;
        }
    }
}

Utils.errorObject = (code = 'NISERR', message = "", displayMessage = "") => {
    return {
        code,
        message,
        displayMessage: displayMessage !== "" ? displayMessage : message,
    };
}

Utils.errorFormater = (statusCode, error, message = "") => {
    return {
        statusCode,
        error,
        message,
    };
}

Utils.successFormater = (statusCode, data, message = "") => {
    return {
        statusCode,
        data,
        message,
    };
}

Utils.sendResponse = (context, req, statusCode, response, err = false) => {
    let responseData = response;
    if (err) {
        let error = {};
        if (typeof err === 'object') {
            if (err.message) {
                error = Utils.errorObject('Utils001', err.message, constants.MESSAGES.TECH_ERROR);
            } else if (err.stack) {
                error = Utils.errorObject('Utils002', err.stack, constants.MESSAGES.TECH_ERROR);
            }
            if (err[0] && err[0].message) {
                error = Utils.errorObject('Utils003', err[0].message, constants.MESSAGES.TECH_ERROR);
            }
        } else if (typeof err === 'string') {
            error = Utils.errorObject('Utils004', err, constants.MESSAGES.TECH_ERROR);
        }
        statusCode = statusCode ? statusCode : 500;
        let errArr = new Array(error);
        responseData = Utils.errorFormater(500, errArr);
    }

    context.res = {
        status: statusCode,
        body: !Utils.isEmpty(responseData) ? responseData : '',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    context.done();
}

Utils.isSuperAdmin = (context, req) => {
    return !Utils.isEmpty(req.userDetail.userRoles) && req.userDetail.userRoles.includes(constants.ROLE_ID.SUPER_ADMIN);
}

Utils.isOrgAdmin = (context, req) => {
    return !Utils.isEmpty(req.userDetail.userRoles) && req.userDetail.userRoles.includes(constants.ROLE_ID.ORG_ADMIN) && !Utils.isSuperAdmin(context, req);
}

Utils.getCSVToJSON = (context, req) => {
    return new Promise(async (resolve, reject) => {
        try {
            const fileDetail = {};
            var bodyBuffer = Buffer.from(req.body);
            var boundary = multipart.getBoundary(req.headers['content-type']);
            var parts = multipart.Parse(bodyBuffer, boundary);
            fileDetail.storage_file_name = `${Date.now()}_${parts[0].filename}`;
            fileDetail.display_file_name = parts[0].filename;
            fileDetail.file_type = parts[0].type;
            const jsonArray = await csv().fromString(parts[0].data.toString());
            for (let [, obj] of jsonArray.entries()) {
                obj = Utils.senitizeObj(obj);
            }
            resolve(jsonArray);
        } catch (error) {
            reject(error);
        }
    });
}

Utils.getTimeZone = (req) => {
    return req.query && req.query.timeZone ? req.query.timeZone : (req.body && req.body.timeZone ? req.body.timeZone : 'Asia/Kolkata');
}

Utils.utcToTimeZone = (req, datetime, format = constants.DATE_FORMAT.MOMENT_DATE_TIME) => {
    var utcCutoff = moment.utc(datetime, constants.DATE_FORMAT.DB);
    var displayCutoff = utcCutoff.clone().tz(Utils.getTimeZone(req));
    return displayCutoff.format(format);
}

Utils.convertToUTC = (req, datetime) => {
    var utcCutoff = moment.utc(new Date(datetime), constants.DATE_FORMAT.DB);
    return utcCutoff.format(constants.DATE_FORMAT.DB);
}

Utils.modifiedResult = (req, dataArrOrObj) => {
    const arrOrObj = JSON.parse(JSON.stringify(dataArrOrObj));
    if (Array.isArray(arrOrObj)) {
        for (const [i, obj] of arrOrObj.entries()) {
            if (obj.created_at) {
                arrOrObj[i].created_at = Utils.utcToTimeZone(req, obj.created_at);
            }
            if (obj.updated_at) {
                arrOrObj[i].updated_at = Utils.utcToTimeZone(req, obj.updated_at);
            }
        }
    } else {
        if (arrOrObj.hasOwnProperty('created_at')) {
            arrOrObj.created_at = Utils.utcToTimeZone(req, arrOrObj.created_at);
        }
        if (arrOrObj.hasOwnProperty('updated_at')) {
            arrOrObj.updated_at = Utils.utcToTimeZone(req, arrOrObj.updated_at);
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

Utils.getFolderPathFromReq = (req) => {
    const orgName = req.userDetail && req.userDetail.organizationName ? Utils.trimStr(req.userDetail.organizationName) : 'defaultOrg';
    const userEmail = req.userDetail && req.userDetail.email ? Utils.trimStr(req.userDetail.email) : 'defaultEmail';
    return `${orgName}/${userEmail}/`;
}

Utils.senitizeObj = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof (value) === 'string')
            obj[key] = Utils.trimStr(value);
    }
    return obj;
}

module.exports = Utils;
