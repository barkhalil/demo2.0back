const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('edit_prospect_dmd', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_pros: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    prenom: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    potentiel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // ✅ Champs manquants ajoutés
    tel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tel_2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gsm: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gsm_2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fax: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etablissement: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    spec: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gouvernorat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    delegation: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    service: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code_postal: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    phyto: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    dermo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    type_fid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // ── Champs existants ──────────────────────────────
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    validated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    validated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    validate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'edit_prospect_dmd',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id" }]
      }
    ]
  });
};