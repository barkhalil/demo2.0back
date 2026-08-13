const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('primeanim', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pqual: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    cavital: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    gdiet: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    dermo: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    cum: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    ratjt: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    pa: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    mntd: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    pf: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: true
    },
    pf2: {
      type: DataTypes.DECIMAL(12,3),
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
    tableName: 'primeanim',
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
