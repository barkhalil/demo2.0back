const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ca_pdc_dlg', {
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
    caph: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    cagro: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    obj: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prime: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 0.000
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'ca_pdc_dlg',
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
        name: "id",
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
