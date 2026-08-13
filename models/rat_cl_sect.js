const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rat_cl_sect', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_cl: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    secteur: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    valeur: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false
    },
    par: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'rat_cl_sect',
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
