const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "0091varunsingh@gmail.com",
        pass: "varun@4056"
    }
});
 
var message = {
    from: "",
    to: "",
    subject: "",
    html: ""
}

var response = {
    success :"",
    message : ""
}

module.exports.forgetPasswordEmail =  function (to, reqToken){
    resetLink = "http://abc.com/forgot-password?email="+to+"&token="+reqToken;
    tempResetLink = "http://abc.com/forgot-password?email="+to+"&token=0000";
    message.from="noreply@nis.com";
    message.to=to;
    message.subject="Reset Password Request"
    message.html="Reset your password now, click on this link to reset your password "+resetLink +" or <br>"+tempResetLink;

    return new Promise((resolve, reject)=>{
        transporter.sendMail(message, function(err, info) {
            if (err) {
              console.log("Got error while sending forgot email", err);
              response.success=false;
              response.message=err;
    
              resolve(false);
            } else {
              console.log("Got success", info);
              response.success=true;
              response.message=info;
              resolve(true);
            }
        })
    })

    // transporter.sendMail(message, function(err, info) {
    //     if (err) {
    //       console.log("Got error while sending forgot email", err);
    //       response.success=false;
    //       response.message=err;

    //       return message;
    //     } else {
    //       console.log("Got success", info);
    //       response.success=true;
    //       response.message=info;
    //       return message;
    //     }
    // })

    //  return message
 }