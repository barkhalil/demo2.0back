const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prod_cmd', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    client: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Facture: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    etat: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    isPrinted: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_cmd: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_liv: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    type: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    pb: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    changed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    echeance: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pay: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    remise: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'prod_cmd',
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
