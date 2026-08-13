const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('affectation', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_prospect: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "prospect",
        key: "id",
      }
    },
    id_deleg: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      }
    },
    affecter_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    de: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    a: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    year: {
     
      type: DataTypes.INTEGER,
      allowNull: false
     
    },
  }, {
    sequelize,
    tableName: 'affectation',
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
        name: "id_prospect",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_prospect" },
          { name: "id_deleg" },
          { name: "year" },
        ]
      },
    ]
  });
};
