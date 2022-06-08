module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "training",
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
      fin_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      side_id: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
      },
      taxon_id: {
        type: DataTypes.STRING(255),
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        unique: true
      },
      fin_state: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      fin_type_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      fin_view_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      geographic_location_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue:0
      },
      dermal_denticle: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      date_of_image_taken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_file_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_storage_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_storage_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      request_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_owner: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_license_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      image_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image_resolution: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      device_model: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      macrolens_model: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      macrolens_magnification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      external_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      dna_verification: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      external_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      width: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },      
      height: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_occluded: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_source: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_xtl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_ytl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_xbr: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_ybr: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_rotation: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      box_z_order: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      tableName: "training",
      timestamps: false,
      underscored: true,
    }
  );
};
