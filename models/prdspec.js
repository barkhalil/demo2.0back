const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "prdspec",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      spec: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      actv: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      idr: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "zone",
          key: "id",
        },
      },
      prd: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
      fte: {
        type: DataTypes.DECIMAL(6, 4),
        allowNull: false,
      },
      de: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: "2021-01-01",
      },
      a: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: "2021-12-31",
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "prdspec",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
