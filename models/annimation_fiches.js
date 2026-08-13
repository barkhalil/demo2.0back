const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('annimation_fiches', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_pharmay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_annimatrice: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_annimation: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    etat: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    personnel: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    points_fort: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recommandations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creer_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    systemdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    finalisation: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    etatPharma: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancled_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'annimation_fiches',
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
