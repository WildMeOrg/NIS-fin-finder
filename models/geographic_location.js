module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "geographic_location",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
    },
    {
      tableName: "geographic_location",
      timestamps: false,
      underscored: true,
    }
  );
};
