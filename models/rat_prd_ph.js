const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rat_prd_ph', {
    Article: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    qte: {
      type: DataTypes.DECIMAL(9,3),
      allowNull: true
    },
    ca: {
      type: DataTypes.DECIMAL(11,3),
      allowNull: true
    },
    zone: {
      type: DataTypes.STRING(17),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rat_prd_ph',
    timestamps: false
  });
};
