const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('annimation_fiches_prescriptions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_fiche: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_prescripteur: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    potentiel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pour: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    produits_concurent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    systemdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'annimation_fiches_prescriptions',
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
