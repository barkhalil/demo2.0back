const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cl_reglement_enc', {
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
    db: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cl_reglement_enc',
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
