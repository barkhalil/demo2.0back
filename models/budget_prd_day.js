const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('budget_prd_day', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    mntm: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true,
      defaultValue: 0.000
    },
    mntv: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true,
      defaultValue: 0.000
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    article: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'budget_prd_day',
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
