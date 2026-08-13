const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rapportcong', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dateR: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    nom: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    nb: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stand: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    conc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    produit: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    creer_par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'rapportcong',
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
