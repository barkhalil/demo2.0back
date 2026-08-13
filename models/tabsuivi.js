const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tabsuivi', {
    idDemande: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_prod: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_ph: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    debut: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dateCreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    dateMod: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cloturer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'tabsuivi',
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
