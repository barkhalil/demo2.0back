const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prod_cmd_details', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    prod_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cmd_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prix_ph: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    prix_public: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    prix_gros: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    qte: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    gratuite: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'prod_cmd_details',
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
