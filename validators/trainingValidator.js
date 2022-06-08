const joi = require('@hapi/joi');

class TrainingValidator {
    constructor() {

    }
}
TrainingValidator.getTrainingSchema = joi.object({
    page : joi.number().optional(),
    limit : joi.number().optional(),
    order : joi.string().optional().allow('').valid('ASC','DESC','asc','desc'),
    sort : joi.string().optional().allow(''),
    requestId : joi.string().optional(), // Use for detail api
    searchString : joi.string().optional().allow(''),
    is_eguide : joi.number().optional().valid(0,1),
    timeZone : joi.string().optional(),
    isDownload : joi.number().optional().valid(0,1),
    type : joi.string().optional().valid('csv'),
});
TrainingValidator.uploadTrainingSchema = joi.object({
    taxonId:joi.string().required(),
    finState:joi.string().required(),
    finTypeId:joi.number().required(),
    finViewId:joi.number().required(),
    geographicLocationId:joi.number().required(),
    //imageLicenseId:joi.number().required(),
    dnaVerification:joi.string().required(),
    imageOwner:joi.string().optional(),
    remarks:joi.string().allow('',null),
    imageName:joi.string().required(),
    imageType:joi.string().required(),
    imageContent:joi.string().required(),
    latitude:joi.any().optional(),
    longitude:joi.any().optional(),
    timeZone: joi.string().optional(),
});
TrainingValidator.updateTrainingSchema = joi.object({
    requestId:joi.string().required(),
    taxonId:joi.string().required(),
    finState:joi.string().required(),
    finTypeId:joi.number().required(),
    finViewId:joi.number().required(),
    geographicLocationId:joi.number().required(),
    //imageLicenseId:joi.number().required(),
    dnaVerification:joi.string().required(),
    imageOwner:joi.string().optional(),
    remarks:joi.string().allow('',null),
    latitude:joi.any().optional(),
    longitude:joi.any().optional(),
    timeZone: joi.string().optional(),
});
TrainingValidator.deleteTrainingSchema = joi.object({
    requestId: joi.string().required()
});
module.exports = TrainingValidator;