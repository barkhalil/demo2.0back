const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rapport_dm', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dm_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    semaine_debut: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    semaine_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    nbr_pros: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    com_pros: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    com_act: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    com_general: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    validate: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    validation_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rapport_dm',
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
