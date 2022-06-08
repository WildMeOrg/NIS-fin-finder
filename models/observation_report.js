module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "observation_report",
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
      user_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('now')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('now')
      },
    },
    {
      tableName: "observation_report",
      timestamps: false,
      underscored: true,
    }
  );
};
