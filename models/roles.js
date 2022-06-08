module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "roles",
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
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      super_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('now'),
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('now')
      }
    },
    {
      tableName: "roles",
      timestamps: false,
      underscored: true,
    }
  );
};
