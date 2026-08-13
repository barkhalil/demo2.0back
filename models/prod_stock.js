const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prod_stock', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idBonEnt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fournisseur: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    prod: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    qte: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qte_ex: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    paht: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    pvht: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    pvttc: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    validation: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'prod_stock',
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
