const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('objdlgrect', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_del: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    objGro: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false
    },
    objVd: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false
    },
    an: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'objdlgrect',
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
