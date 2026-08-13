const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "products",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      bare_code: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      code_article: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: "code_article",
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
        references: {
          model: "prod_categorie",
          key: "id",
        },
      },
      bu: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ext: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      ss: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      public: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 1,
      },
      cree_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      modifier_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn("current_timestamp"),
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      aire: {
        type: DataTypes.INTEGER,
        allowNull: true,
         references: {
          model: "airet",
          key: "id",
        },
      },
    },
    {
      sequelize,
      tableName: "products",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "code_article",
          unique: true,
          using: "BTREE",
          fields: [{ name: "code_article" }],
        },
      ],
    }
  );
};
