const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ventes_articles', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    bare_code: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    code_article: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    titre: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gamme: {
      type: DataTypes.STRING(300),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ventes_articles',
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
      {
        name: "code_article",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code_article" },
        ]
      },
    ]
  });
};
