const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_frais', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    date_visite: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    secteur_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    del_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    frais: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    valider_del: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    valider_sup: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    add_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    validation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    validation_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    date_validation_sup: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    autre: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'note_frais',
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
      {
        name: "unique_note",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "date_visite" },
          { name: "secteur_id" },
          { name: "del_id" },
        ]
      },
    ]
  });
};
