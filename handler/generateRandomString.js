
// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module.exports.forgetString = async function generateString() {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < 12; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log("random token ", result);

    return result;
}