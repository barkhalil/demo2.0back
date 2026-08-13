const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_fournisseur', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    contact: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fax: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
    tel: {
      type: DataTypes.STRING(75),
      allowNull: true
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    etat: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'grm_fournisseur',
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
