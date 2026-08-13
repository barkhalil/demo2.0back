const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prdspec_bi', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    spec: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "25"
    },
    actv: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    idr: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    prd: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    fte: {
      type: DataTypes.DECIMAL(6,4),
      allowNull: false
    },
    de: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: "2020-07-01"
    },
    a: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: "2020-12-31"
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'prdspec_bi',
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
