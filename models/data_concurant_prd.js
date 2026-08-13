const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('data_concurant_prd', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idprd: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unitEch: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    unitnatreconts: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    unitReel: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    margeErr: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    canatreceonst: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    careelht: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    margeErrca: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    t: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'data_concurant_prd',
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
