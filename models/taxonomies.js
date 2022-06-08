module.exports = function (sequelize, DataTypes) {
  return sequelize.define(  
    "taxonomies",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
      },
      taxon_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        // type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        unique: true
      },
      kingdom: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phylum: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      class: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      subclass: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      family: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      genus: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      species: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      scientific_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      taxon_level: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      authority: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      common_name_english: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      other_common_names_english: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true,
      },
      taxonomic_notes: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true,
      },
      spanish_names: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true,
      },
      french_names: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true,
      },
      iucn_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      iucn_assessment: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cites_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cites_status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      geographical_distribution: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true,
      },
      geographical_distribution_iso: {
        type: DataTypes.TEXT('tiny'),
        allowNull: true,
      },
      iucn_reference_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gbif_reference_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cites_reference_url: {
        type: DataTypes.STRING(255),
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
    /* {
      hooks: {
        beforeValidate: (taxonom, options) => {
          taxonom.taxon_id = DataTypes.UUIDV4();
        }
      }
    }, */
    {
      tableName: "taxonomies",
      timestamps: false,
      underscored: true,
    }
  );
};
