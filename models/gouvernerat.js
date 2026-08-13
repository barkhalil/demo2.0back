const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gouvernerat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    nom: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    zone: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    poids: {
      type: DataTypes.FLOAT(10,3),
      allowNull: false
    },
    gouv: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'gouvernerat',
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
