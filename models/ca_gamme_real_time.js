const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ca_gamme_real_time', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    gamme: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    obj: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    rea: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false
    },
    de: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    a: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'ca_gamme_real_time',
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
