const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('listpersopros', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idPros: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    gsm: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mail: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fb: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    invifb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    image: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    idDlg: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    com: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'listpersopros',
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
        name: "id",
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "id_2",
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
