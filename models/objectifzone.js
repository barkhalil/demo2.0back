const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('objectifzone', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    gro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gro_adr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    phar: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    zone: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    annee: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'objectifzone',
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
