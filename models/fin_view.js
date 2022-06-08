module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "fin_view",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      fin_type_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
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
      tableName: "fin_view",
      timestamps: false,
      underscored: true,
    }
  );
};
