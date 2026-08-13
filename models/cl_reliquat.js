const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cl_reliquat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    mnt: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    cl: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fam: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nom_cl: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cl_reliquat',
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
