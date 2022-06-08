module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "user_roles",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      }
    },
    {
      tableName: "user_roles",
      timestamps: false,
      underscored: true,
    }
  );
};
