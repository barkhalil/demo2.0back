const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "prospects_demandes",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_demande: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_prospect: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "prospect",
          key: "id",
        },
      },
    },
    {
      sequelize,
      tableName: "prospects_demandes",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "prosp_demande",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id_demande" }, { name: "id_prospect" }],
        },
      ],
    }
  );
};
