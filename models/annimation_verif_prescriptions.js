const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('annimation_verif_prescriptions', {
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
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    commentaire_annimatrice: {
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
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'annimation_verif_prescriptions',
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
