const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('frn_reglement', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cl: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mnt: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    statut: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dateech: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fam: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    bank: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    rs: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'frn_reglement',
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
