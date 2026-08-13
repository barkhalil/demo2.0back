const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prdres', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idr: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prd: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    de: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: "2022-01-01"
    },
    a: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: "2022-06-30"
    }
  }, {
    sequelize,
    tableName: 'prdres',
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
