const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rat_prd_gro', {
    cl: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Article: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    qte: {
      type: DataTypes.DECIMAL(8,3),
      allowNull: true
    },
    ca: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rat_prd_gro',
    timestamps: false
  });
};
