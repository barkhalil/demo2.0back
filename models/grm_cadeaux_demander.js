const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_cadeaux_demander', {
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
    },
    type_cdx: {
      type: DataTypes.TINYINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'grm_cadeaux_demander',
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
