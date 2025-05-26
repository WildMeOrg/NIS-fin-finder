const constants = require('../config/constants');
const config = require('../config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.email.sendGridKey);

class EmailHelper {
    constructor() {

    }
}

EmailHelper.sendEmail = function (emailObj) {
    try {
        const msg = {
            to: emailObj.to ? emailObj.to : 'finfinder@wildme.org',
            from: emailObj.from ? emailObj.from : 'finfinder@wildme.org',
            subject: emailObj.subject ? emailObj.subject : 'Default Subject',
            html: emailObj.html ? emailObj.html : '<h1>Testing!!!</h1>',
        };
        sgMail.send(msg);
        console.log('email sent======================');
        return Promise.resolve(constants.MESSAGES.EMAIL_SEND_SUCCESSFULLY);
    } catch (e) {
        console.log('email err======================', e);
        return Promise.reject(constants.MESSAGES.ERROR_IN_SENDING_EMAIL);
    }
}

EmailHelper.sendTemplateEmail = function (emailObj) {
    try {
        const msg = {
            from: "finfinder@wildme.org",
            template_id: emailObj.templateId,
            personalizations: [{
                to: emailObj.to ? emailObj.to : [{email: 'dmunasinghe@conservation.org'}],
                cc: emailObj.cc ? emailObj.cc : '',
                dynamic_template_data: emailObj.dynamicTemplateData,
            }],
        };
        sgMail.send(msg);
        console.log('email sent======================');
        return Promise.resolve(constants.MESSAGES.EMAIL_SEND_SUCCESSFULLY);
    } catch (e) {
        console.log('email err======================', e);
        return Promise.reject(constants.MESSAGES.ERROR_IN_SENDING_EMAIL);
    }
}

module.exports = EmailHelper;
