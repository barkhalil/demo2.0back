const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    login: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Civilite: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    Nom: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Prenom: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(800),
      allowNull: false
    },
    Tel: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    pass: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Img: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    active: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    SysDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'grm_users',
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
