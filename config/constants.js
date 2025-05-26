module.exports = {
    DATE_FORMAT: {
        DEFAULT: "%b %d %Y",
        DEFAULT_DATE_TIME: "%b %d %Y %H:%i:%s",
        MOMENT_DATE: "MMM DD YYYY",
        MOMENT_DATE_TIME: "MMM DD YYYY HH:mm:ss",
        DB: "YYYY-MM-DD HH:mm:ss"
    },
    ROLE_ID: {
        SUPER_ADMIN: 1,
        ORG_ADMIN: 2,
        TRAINING: 5
    },
    DEFAULTS: {
        LIMIT: 10,
        ORDER: 'DESC',
        USER_PASSWORD: 'nis@1234'  // Consider moving this to a secret if dynamic
    },
    MESSAGES: {
        INVALID_CREDENTIAL: 'Invalid Credential',
        INACTIVE_USER: 'User is inactive',
        VALID_USER: 'User login successfully',
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
};
