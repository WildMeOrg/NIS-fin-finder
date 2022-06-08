module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "user",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(255),
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
      country_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      postal_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
      ,
      remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      }
      ,
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      }
      ,
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      }
      ,
      active: {
        type: DataTypes.INTEGER(1),
        defaultValue: 0,
        allowNull: false,
      },
      use_common_names: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      logged: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      organization_id: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      is_set_password: {
        type: DataTypes.INTEGER(1),
        defaultValue: 0,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        unique: true,
        comment: "Use for set or reset password"
      },
      country_id: {
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
      tableName: "user",
      timestamps: false,
      underscored: true,
    }
  );
};
