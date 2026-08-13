const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reglement', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    reg_num: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mnt: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    budget: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    reg_status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    axe: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mnt_axe: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reglement',
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
