const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_promotionnel', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_demandeur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    observation_client: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_remise_point: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_pro: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    oberservation_admin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_validation: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    etat: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    date_livraison: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modifier_par: {
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
    tableName: 'grm_promotionnel',
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
