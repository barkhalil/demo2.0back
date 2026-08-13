const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('parc_auto', {
    code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codeCrm: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mat_rh: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'parc_auto',
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
