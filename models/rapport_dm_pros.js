const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rapport_dm_pros', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rapport_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pros: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    hosp: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    gsm: {
      type: DataTypes.STRING(300),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'rapport_dm_pros',
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
