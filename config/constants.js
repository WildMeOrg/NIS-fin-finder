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
        ...
    }
};
