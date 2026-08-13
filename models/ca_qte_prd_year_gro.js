const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ca_qte_prd_year_gro', {
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
    ca: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    ht: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    qte: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ca_qte_prd_year_gro',
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
