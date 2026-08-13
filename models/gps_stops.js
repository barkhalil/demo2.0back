const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gps_stops', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    matricule: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stop_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    stop_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    latitude: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    longitude: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    stop_duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    frs: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'gps_stops',
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
