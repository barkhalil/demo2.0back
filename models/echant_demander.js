const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('echant_demander', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pour: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    etat: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    observation_admin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valider_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_validation: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    sysDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    date_livraison: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'echant_demander',
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
