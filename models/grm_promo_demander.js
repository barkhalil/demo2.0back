const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_promo_demander', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_demande: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_cadeaux: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qte: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "0"
    }
  }, {
    sequelize,
    tableName: 'grm_promo_demander',
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
