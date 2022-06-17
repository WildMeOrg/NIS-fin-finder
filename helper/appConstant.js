class AppConstant{
    constructor(){

    }
}
AppConstant.C = {
    dateFormat:{
        defaultDateFormat:"%b %d %Y",
        defaultDateTimeFormat:"%b %d %Y %H:%i:%s",
        momentDateFormat:"MMM DD YYYY",
        momentDateTimeFormat:"MMM DD YYYY HH:mm:ss",
        DBDateTimeFormat:"YYYY-MM-DD HH:mm:ss"
    },
    superAdminRoleId:1,
    orgAdminRoleId:2,
    trainingRoleId:5,
    defaultAppAlert:['Girish.Jaisinghani@rsystems.com','Yashasavi.Mittal@rsystems.com','Ambrish.Singh@rsystems.com','Mahendra.Gurjar@rsystems.com','efegraus@conservation.org','dmunasinghe@conservation.org'],
    defaultLimit:10,
    defaultOrder:'DESC',
    defaultUserPassword:'nis@1234',
    blobConnectionString:'DefaultEndpointsProtocol=https;AccountName=nisportalapi;AccountKey=k/vUKOLDcGKi9JarGssKvJOIHTv+31xbm4u/5l7H99devtoblDEsbyJDKyTMoLsd6HD9OfhQaRbSHfzNj+9jig==;EndpointSuffix=core.windows.net',
    observationCallbackURL:'https://niswebservices.azurewebsites.net/api/observation-callback',
    wildMeBaseUrl:'https://ci.dyn.wildme.io/api/engine',
    JWTTokenSecret:'c9cc2a36daebd600b8e53ad1b11c901d180d85223e6c0499ac68ae1ab4b27aeaa7558b27260bf45cf5da4be0b8a101c2c55448a5f9074837e3f0a0fcdbc5fc0e',//shhhhh  //'c9cc2a36daebd600b8e53ad1b11c901d180d85223e6c0499ac68ae1ab4b27aeaa7558b27260bf45cf5da4be0b8a101c2c55448a5f9074837e3f0a0fcdbc5fc0e'
    webAppUrl:'https://webapp.wildlifedetection.org',
    finFinderUrl:'https://wildlifedetection.org/fin-finder',
    sendGridKey:'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',
    emailTemplateID:{
        accountCreated:'d-3ebb67fb7cac4ce9952aec15826884b1',
        accountActivated:'d-f9875456e5294b8cb4ca502b9abdcec2',
        forgotPassword:'d-728dd6f45ba544e3963fdfac92846245',
        forgotPasswordConfirmation:'d-9dcbad4a1ed740ceb94c5ab283a83a69',
        orgRegistration:'d-e5cce11c272645d3a86f42496bc98124'
    }
}
AppConstant.EC = {
    INVALID_CREDENTIAL:'Invalid Credential',
    INACTIVE_USER:'User is inactive',
    VALID_USER:'User login successfully',
    NAME_EXIST:'Name already exists',
    EMAIL_EXIST:'Email already exists',
    PHONE_EXIST:'Phone already exists',
    TECH_ERROR:'Technical error. Please try again after some time.',
    NO_RECORD_FOUND:'No record found',
    PASSWORD_HAS_SET_ALREADY:'Password has set already',
    PASSWORD_HAS_SET:'Password has set successfully',
    VALID_PASS_TOKEN:'Token is valid',
    FILE_UPLOAD_SUCCESSFULLY:'File upload successfully',
    RECORD_DELETE_SUCCESSFULLY:'Record deleted successfully',
    RECORD_ALREADY_DELETE:'Record Already deleted',
    RECORD_CREATE_SUCCESSFULLY:'Record created successfully',
    RECORD_UPDATED_SUCCESSFULLY:'Record updated successfully',
    INVALI_VALUE:'Invalid Value',
    FILE_CREATED_SUCCESSFULLY:'File Created successfully',
    EMPTY_FILE:'File is Empty',
    INVALID_FILE_DATA:'Invalid File Data',
    INVALID_VALIDATION_SCHEMA: 'Invalid validation schema',
    EMAIL_SEND_SUCCESSFULLY: 'Email sent successfully',
    ERROR_IN_SENDING_EMAIL: 'Error in sending email',
    REPORT_SUCCESSFULLY:'Thank you for your feedback'
  }

  module.exports = AppConstant;
