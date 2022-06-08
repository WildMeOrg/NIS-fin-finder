module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "organizations",
    {
      id: {
        type: DataTypes.INTEGER(11), 
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        default : 'Active',
        allowNull: true,
      },
      street_address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      postal_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
      ,
      phone: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      }
      ,
      country_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      organization_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      country_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      active: {
        type: DataTypes.INTEGER(1),
        defaultValue: 0,
        allowNull: false,
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
      tableName: "organizations",
      timestamps: false,
      underscored: true,
    }
  );
};
