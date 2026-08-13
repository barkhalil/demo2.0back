const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cible', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    prospect: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gamme_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    valeur: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'cible',
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
