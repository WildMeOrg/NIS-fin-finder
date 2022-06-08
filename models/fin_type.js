module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "fin_type",
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
      tableName: "fin_type",
      timestamps: false,
      underscored: true,
    }
  );
};
