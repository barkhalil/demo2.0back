const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prospect_r', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    potentiel: {
      type: DataTypes.STRING(11),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'prospect_r',
    timestamps: false
  });
};
