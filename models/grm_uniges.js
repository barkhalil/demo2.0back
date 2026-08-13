const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_uniges', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    prospect_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    uniges_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    val: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    system_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'grm_uniges',
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
