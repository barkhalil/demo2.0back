const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('liste_details', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    secteur: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    etablissement: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    delegation: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    specialite: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    activite: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    potentiel: {
      type: DataTypes.STRING(300),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'liste_details',
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
