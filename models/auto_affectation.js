const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('auto_affectation', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_auto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_emp: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_affecatation: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_fin_affectation: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    etat: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    etat_changement: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'auto_affectation',
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
