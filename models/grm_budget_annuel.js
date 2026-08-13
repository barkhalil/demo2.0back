const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_budget_annuel', {
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
    type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sold: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    q1: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    q2: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    q3: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    years: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'grm_budget_annuel',
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
