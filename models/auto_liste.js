const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('auto_liste', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    matricule: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: "matricule"
    },
    type_usage: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    marque: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'auto_liste',
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
        name: "matricule",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "matricule" },
        ]
      },
    ]
  });
};
