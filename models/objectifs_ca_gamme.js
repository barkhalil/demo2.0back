const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('objectifs_ca_gamme', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    month_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ca: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false
    },
    ca_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gamme: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'objectifs_ca_gamme',
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
