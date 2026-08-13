const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pointage', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
        references: {
        model: "users",
        key: "id",
      }
    },
    date_debut: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: true,
     references: {
        model: "type_pointage",
        key: "id"
     }


    },
    nbreJours: {
      type: DataTypes.STRING(3),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'pointage',
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
