const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('etatph', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idph: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    carte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    par: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    traite_le: {
      type: DataTypes.DATE,
      allowNull: true
    },
    traite_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cmnt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prep: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'etatph',
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
