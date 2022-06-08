module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "observation",
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
      storage_file_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      display_file_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      file_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      request_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      storage_file_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cv_jobid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cv_status: {
        type: DataTypes.INTEGER(1),
        defaultValue: 0,
        allowNull: false,
      },
      cv_result: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      /* cv_prepared_result: {
        type: DataTypes.JSON,
        allowNull: true,
      },   */
      retry_attempted: {
        type: DataTypes.INTEGER(1),
        defaultValue: 0,
        allowNull: false,
      },
      location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: true,
      },
      request_from: {
        type: DataTypes.INTEGER(1),
        defaultValue: 0,
        allowNull: false,
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
      tableName: "observation",
      timestamps: false,
      underscored: true,
    }
  );
};
