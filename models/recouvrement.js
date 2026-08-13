const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recouvrement', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_pros: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    promesse: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    numReglement: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    dateEcheance: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    banque: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    montant: {
      type: DataTypes.FLOAT(10,3),
      allowNull: false,
      defaultValue: 0.000
    },
    idUniges: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    emailPros: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    information: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'recouvrement',
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
