const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('doublons_prime_superviseur', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pqual: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    moydlg: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    total: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    ratjt: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    pa: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    mntd: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    pf: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    pf2: {
      type: DataTypes.FLOAT(12,6),
      allowNull: true
    },
    usr: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    de: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    a: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'doublons_prime_superviseur',
    timestamps: false
  });
};
