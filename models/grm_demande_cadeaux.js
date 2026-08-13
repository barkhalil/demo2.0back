const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_demande_cadeaux', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ref: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    id_pros: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_demandeur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_remise: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    point_bonus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    point_bonus_reel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ponitsByType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pointsRealByType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    rest_point: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    pointage: {
      type: DataTypes.TINYINT,
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
    date_pointage: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    famille: {
      type: DataTypes.TINYINT.UNSIGNED,
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
    },
    date_pro: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    isCart: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    grmuser: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    suivi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    etat_bs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rendu_le: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'grm_demande_cadeaux',
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
