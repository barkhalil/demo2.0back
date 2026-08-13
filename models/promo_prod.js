const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('promo_prod', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_promo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_prod: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qte: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'promo_prod',
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
