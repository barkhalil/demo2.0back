const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "ba_demandes",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      demande_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        references: {
          model: "demande",
          key: "id",
        },
      },
      type_pay: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "type_pay",
          key: "id",
        },
      },
      label: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      etat: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      cree_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",

          key: "id",
        },
      },
      valider_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",

          key: "id",
        },
      },
      commentaire: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      system_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("current_timestamp"),
      },
      fournisseur: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ba_demandes",
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
