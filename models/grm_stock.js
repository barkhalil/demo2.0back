const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_stock', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fournisseur: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ref: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    prod: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    qte: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: true
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
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    idsect: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'grm_stock',
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
