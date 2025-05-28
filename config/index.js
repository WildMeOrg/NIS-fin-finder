module.exports = {
    mysql: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        dialect: 'mysql',
        logging: false,
    },
    blob: {
        connectionString: process.env.BLOB_CONNECTION_STRING,
    },
    urls: {
        observationCallback: process.env.OBSERVATION_CALLBACK_URL,
        wildMeBase: process.env.WILDME_BASE_URL,
        webApp: process.env.WEBAPP_URL,
        finFinder: process.env.FINFINDER_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    email: {
        sendGridKey: process.env.SENDGRID_KEY,
        templates: {
            accountCreated: process.env.TEMPLATE_ACCOUNT_CREATED,
            accountActivated: process.env.TEMPLATE_ACCOUNT_ACTIVATED,
            forgotPassword: process.env.TEMPLATE_FORGOT_PASSWORD,
            forgotPasswordConfirmation: process.env.TEMPLATE_FORGOT_PASSWORD_CONFIRMATION,
            orgRegistration: process.env.TEMPLATE_ORG_REGISTRATION,
        },
        defaultRecipients: process.env.DEFAULT_ALERT_EMAILS?.split(',') || [],
        contactEmail: process.env.CONTACT_EMAIL,
    },
    user: {
        defaultPassword: process.env.DEFAULT_PASSWORD,
    }
};
