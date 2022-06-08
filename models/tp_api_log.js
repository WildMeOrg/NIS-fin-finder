module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "tp_api_log",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      api_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      api_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      api_method: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      request_data: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      response_data: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      request_time: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('now')
      },
      response_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "tp_api_log",
      timestamps: false,
      underscored: true,
    }
  );
};
