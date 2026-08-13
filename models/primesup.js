const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('primesup', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pqual: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    moydlg: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    ratjt: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    pa: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    mntd: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    pf: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    pf2: {
      type: DataTypes.FLOAT,
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
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'primesup',
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
