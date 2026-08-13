const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('delegation', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    gouv_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    poids: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 0.000
    }
  }, {
    sequelize,
    tableName: 'delegation',
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
