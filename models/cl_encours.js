const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cl_encours', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cl: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    reg: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dateech: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mnt: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    fam: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'cl_encours',
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
