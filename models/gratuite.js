const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gratuite', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nbrProd: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    valGrat: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    etat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    disabled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    disabled_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'gratuite',
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
