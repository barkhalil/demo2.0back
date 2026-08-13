const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prog_tourne', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    delid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    secteurs: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    weekStart: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    weekEnd: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    creer_par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    da: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'prog_tourne',
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
