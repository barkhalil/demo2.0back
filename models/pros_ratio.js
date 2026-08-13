const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pros_ratio', {
    id_pros: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nord_ratio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    centre_ratio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sud_ratio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'pros_ratio',
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
