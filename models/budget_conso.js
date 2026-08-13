const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('budget_conso', {
    reg_num: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tiers: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rs: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type_reg: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_ech: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    statut: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bank: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    budgetCodeD: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ht: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    ttc: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    mnt_budget: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    budgetCode: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    budget: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'budget_conso',
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
