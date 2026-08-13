const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('note_frais_animatrices', {
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
    del_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    frais: {
      type: DataTypes.STRING(150),
      allowNull: true
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
    tableName: 'note_frais_animatrices',
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
          { name: "del_id" },
        ]
      },
    ]
  });
};
