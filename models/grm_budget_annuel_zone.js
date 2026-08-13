const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_budget_annuel_zone', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    departement: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    zone: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sold: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    years: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    s1: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 0.000
    },
    s2: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 0.000
    },
    q1: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 0.000
    },
    q2: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 0.000
    },
    q3: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 0.000
    }
  }, {
    sequelize,
    tableName: 'grm_budget_annuel_zone',
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
