const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "productsobj",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      idPrd: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
      code_article: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      categorie: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      gamme_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      annee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      objUnit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      objCa: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prix: {
        type: DataTypes.DOUBLE(12, 3),
        allowNull: false,
        defaultValue: 1.0,
      },
      com: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      update_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("current_timestamp"),
      },
    },
    {
      sequelize,
      tableName: "productsobj",
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
