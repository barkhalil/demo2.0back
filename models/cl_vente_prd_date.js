const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cl_vente_prd_date', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cl: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    art: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    qte: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: false
    },
    ttc: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    ht: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'cl_vente_prd_date',
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
