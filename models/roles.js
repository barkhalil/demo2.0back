const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('roles', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    GestUser: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    vueDM: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    vuePros: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    SupPros: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    ModPros: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    Moddemande: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    ModVisite: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'roles',
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
