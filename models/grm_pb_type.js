const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_pb_type', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    value: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    etat: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_crea: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_stop: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'grm_pb_type',
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
