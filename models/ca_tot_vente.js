const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ca_tot_vente', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ttc: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    ht: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    qte: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    art: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cl: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dlg: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fam: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    zone: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    id_crm: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ca_tot_vente',
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
