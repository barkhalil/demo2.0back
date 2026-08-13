const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('annimation_concurrent', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_fiche: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    value: {
      type: DataTypes.STRING(300),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'annimation_concurrent',
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
