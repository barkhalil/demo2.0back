const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products_prix', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_prod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "id_prod"
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    prix_public: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    prix_ph: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    prix_gros: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    qte: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qte_alerte: {
      type: DataTypes.INTEGER,
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
    system_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'products_prix',
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
        name: "id_prod",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_prod" },
        ]
      },
    ]
  });
};
