const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('doublons_rh_note_superviseur', {
    note: {
      type: DataTypes.DECIMAL(31,6),
      allowNull: true
    },
    id_del: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    de: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    a: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'doublons_rh_note_superviseur',
    timestamps: false
  });
};
