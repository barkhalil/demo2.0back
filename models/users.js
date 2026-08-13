const { Sequelize } = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      type: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        references: {
          model: "user_type",
          key: "id",
        },
      },
      login: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Civilite: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      Nom: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      Prenom: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      Email: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(800),
        allowNull: false,
      },
      pwd_hashed: {
        type: DataTypes.STRING(1200),
        allowNull: false,
      },
      Tel: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      pass: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      Img: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      active: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 1,
      },
      zone: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      departement: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      role: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      d_type: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      SysDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      race: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      matricule: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      excluded_from_calcule: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      rang: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      fnc: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      sup: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      date_s: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      acd: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date_bu: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      zone2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
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
