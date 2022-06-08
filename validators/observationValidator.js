const joi = require('@hapi/joi');

class ObservationValidator {
    constructor() {

    }
}
ObservationValidator.getObservationSchema = joi.object({
    page : joi.number().optional(),
    limit : joi.number().optional(),
    order : joi.string().optional().allow('').valid('ASC','DESC','asc','desc'),
    sort : joi.string().optional().allow(''),
    requestId : joi.string().optional(), // Use for detail api
    searchString : joi.string().optional().allow(''),
    timeZone : joi.string().optional(),
    isDownload : joi.number().optional().valid(0,1),
    type : joi.string().optional().valid('csv'),
});
ObservationValidator.uploadObservationSchema = joi.object({
    fileName:joi.string().required(),
    fileType:joi.string().required(),
    fileContent:joi.string().required(),
    latitude:joi.any().optional(),
    longitude:joi.any().optional(),
    timeZone: joi.string().optional(),
});
ObservationValidator.deleteObservationSchema = joi.object({
    requestId: joi.string().required()
});
ObservationValidator.observationReportSchema = joi.object({
    observationId: joi.number().required()
});
ObservationValidator.getObservationReportSchema = joi.object({
    page : joi.number().optional(),
    limit : joi.number().optional(),
    order : joi.string().optional().allow('').valid('ASC','DESC','asc','desc'),
    sort : joi.string().optional().allow(''),
    observationId : joi.number().allow('').optional(), // Use for detail api
    reportId : joi.number().allow('').optional(), // Use for detail api
    userId : joi.number().allow('').optional(), // Use for detail api
    searchString : joi.string().optional().allow(''),
    timeZone : joi.string().optional(),
    //isDownload : joi.number().optional().valid(0,1),
    //type : joi.string().optional().valid('csv'),
});
module.exports = ObservationValidator;