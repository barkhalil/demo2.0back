const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('art_zone', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    article: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    zone: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    valeur: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'art_zone',
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
