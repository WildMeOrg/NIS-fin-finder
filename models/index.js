'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = require('../config');
const db = {};

let sequelize;

sequelize = new Sequelize(
    config.mysql.database,
    config.mysql.user,
    config.mysql.password,
    {
      host: config.mysql.host,
      dialect: config.mysql.dialect,
      logging: config.mysql.logging,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
);

fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) &&
          (file !== basename) &&
          (file.slice(-3) === '.js');
    })
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// --- Associations ---

db.user.belongsTo(db.user, { foreignKey: "added_by", as:'addedBy' });

db.organizations.hasMany(db.user, { foreignKey: "organization_id" });
db.user.belongsTo(db.organizations, { foreignKey: "organization_id", as:'organizationDetail' });

db.organizations.belongsTo(db.geographic_location, { foreignKey: "country_id", as:'countryDetail' });
db.user.belongsTo(db.geographic_location, { foreignKey: "country_id", as:'countryDetail' });

db.user.belongsToMany(db.roles,{through:'user_roles', as:'rolesDetail',foreignKey: "user_id"});
db.roles.belongsToMany(db.user,{through:'user_roles', as:'usersDetail',foreignKey: "role_id" });

db.observation_report.belongsTo(db.observation, { foreignKey: "observation_id", as:'reportObservationDetail' });
db.observation_report.belongsTo(db.user, { foreignKey: "user_id", as:'reportUserDetail' });

db.observation.belongsToMany(db.user,{through:'observation_report', as:'reportUserDetail', foreignKey: "observation_id"});
db.user.belongsToMany(db.observation,{through:'observation_report', as:'observationReportDetail', foreignKey: "user_id" });

db.observation.belongsToMany(db.taxonomies,{through:'observation_taxon', as:'taxonDetail', foreignKey: "observation_id"});
db.taxonomies.belongsToMany(db.observation,{through:'observation_taxon', as:'observationDetail', foreignKey: "taxon_id" });

db.user.hasMany(db.observation,{foreignKey:"user_id"});
db.observation.belongsTo(db.user, { foreignKey: "user_id", as:'userDetail' });

db.user.hasMany(db.training, { foreignKey: "user_id" });
db.training.belongsTo(db.user, { foreignKey: "user_id", as:'userDetail' });

db.fin_type.hasMany(db.training, { foreignKey: "fin_type_id" });
db.training.belongsTo(db.fin_type, { foreignKey: "fin_type_id", as:'finTypeDetail' });

db.fin_view.hasMany(db.training, { foreignKey: "fin_view_id" });
db.training.belongsTo(db.fin_view, { foreignKey: "fin_view_id", as:'finViewDetail' });

db.geographic_location.hasMany(db.training, { foreignKey: "geographic_location_id" });
db.training.belongsTo(db.geographic_location, { foreignKey: "geographic_location_id", as:'geographicLocationDetail' });

db.image_license.hasMany(db.training, { foreignKey: "image_license_id" });
db.training.belongsTo(db.image_license, { foreignKey: "image_license_id", as:'imageLicenseDetail' });

db.taxonomies.hasMany(db.training, { foreignKey: "taxon_id" });
db.training.belongsTo(db.taxonomies, { foreignKey: "taxon_id", as:'taxonDetail' });

db.fin_type.hasMany(db.fin_view, { foreignKey: "fin_type_id", as :'finViewDetail' });
db.fin_view.belongsTo(db.fin_type, { foreignKey: "fin_type_id", as :'finTypeDetail' });

module.exports = db;
