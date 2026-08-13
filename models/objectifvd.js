const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('objectifvd', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idDlg: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    obj: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    annee: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2021
    }
  }, {
    sequelize,
    tableName: 'objectifvd',
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
