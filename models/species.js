module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "species",
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
      tableName: "species",
      timestamps: false,
      underscored: true,
    }
  );
};
