const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('unigesids_2', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idCrm: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    iduniges: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'unigesids_2',
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
        name: "idCrm",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idCrm" },
        ]
      },
    ]
  });
};
