module.exports.verifyPasswordResetToken = async function (token){
    console.log("Verifying tokennnnnnnnnnnnnnnn", token)

    redisUserToken = '0000'

    if(token === redisUserToken){
        return true;
    }
    else {
        return false;
    }
}