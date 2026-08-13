const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "liste",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      supID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        
      },
      supID2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      secteur: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      delegation: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      spec: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      etab: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      cree_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      modifier_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("current_timestamp"),
      },
    },
    {
      sequelize,
      tableName: "liste",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
