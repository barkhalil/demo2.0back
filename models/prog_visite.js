const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "prog_visite",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      pros_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "prospect",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      etat: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      date_prog_visite: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      weekStart: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      weekEnd: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn("current_timestamp"),
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn("current_timestamp"),
      },
    },
    {
      sequelize,
      tableName: "prog_visite",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "id",
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
