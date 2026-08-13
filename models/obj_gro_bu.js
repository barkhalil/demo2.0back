const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "obj_gro_bu",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_gro: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "prospect",
          key: "id",
        },
      },
      bu1: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      bu2: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      bu3: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      bu4: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "obj_gro_bu",
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
