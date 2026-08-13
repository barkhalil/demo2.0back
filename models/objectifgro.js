const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('objectifgro', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idpros: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    idDlg: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    obj: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    annee: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 2021
    }
  }, {
    sequelize,
    tableName: 'objectifgro',
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
