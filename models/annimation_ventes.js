const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('annimation_ventes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_fiche: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_prod: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    conseil: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    vente: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    formation: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'annimation_ventes',
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
