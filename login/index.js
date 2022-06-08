const userControllerObj = require('../controllers/user.js');
module.exports = async function (context, req) {
  await userControllerObj.userLogin(context, req);
}