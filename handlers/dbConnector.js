const Sequelize = require("sequelize");
const config = require('../config/config.json')


dbProperty = {
    host : config.env.db.host,
    dialect : config.env.db.dialect,
    operatorsAlises : false
}

dbPool = {
    max : 5,
    min : 0,
    acquire : 30000,
    idle : 10000 
}

// {
//     host : config.env.db.host,
//     dialect : config.env.db.dialect,
//     operatorsAlises : false, 
//     pool : dbProperty 
// }
// const sequelize = new Sequelize(config.env.db1.database, config.env.db1.username, config.env.db1.password,
//     {
//         host: config.env.db1.host,
//         dialect : config.env.db1.dialect
//     });

// sequelize.authenticate().then(
// ()=>{
//     console.log("Connection has been established successfully");
// } 
// ).catch((err) => {
//     console.log("Unable to connect to the db", err)
// })

// console.log("Creating connection with ",config.env.db.database, sequelize)


