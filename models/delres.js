const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('delres', {
    id_Del: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    res: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'delres',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_Del" },
        ]
      },
    ]
  });
};
