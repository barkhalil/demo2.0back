const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rh_personel', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    matricule: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: "matricule"
    },
    prenom: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    fonction: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rh_personel',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "matricule",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "matricule" },
        ]
      },
    ]
  });
};
