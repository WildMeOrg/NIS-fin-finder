module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "observation_taxon",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      observation_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      taxon_id: {  //  taxonomies.taxon_id
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      confidence: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
    },
    {
      tableName: "observation_taxon",
      timestamps: false,
      underscored: true,
    }
  );
};
