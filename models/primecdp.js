const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('primecdp', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    mntd: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    pf: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    pf2: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    usr: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    de: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    a: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    par: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'primecdp',
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
