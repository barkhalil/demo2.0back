const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stock_prd_site', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    article: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    qte: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true,
      defaultValue: 0.000
    },
    site: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    statut: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'stock_prd_site',
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
