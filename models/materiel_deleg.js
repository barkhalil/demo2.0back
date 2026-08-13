const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('materiel_deleg', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_deleg: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    observation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_dmd: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    etat: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    id_validateur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_validation: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    observation_admin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_livraison: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'materiel_deleg',
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
    ]
  });
};
