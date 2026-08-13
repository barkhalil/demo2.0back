const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stat_notifications_deleg', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_deleg: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    month: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    nbr: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'stat_notifications_deleg',
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
      {
        name: "typeMonth",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "type" },
          { name: "month" },
          { name: "id_deleg" },
        ]
      },
    ]
  });
};
