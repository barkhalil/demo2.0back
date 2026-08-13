const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ratiogro', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
       references: {
        model: "prospect",
        key: "id",
      }
    },
    ratio: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ratiogro',
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
