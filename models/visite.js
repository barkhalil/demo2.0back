const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "visite",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      id_pros: {
        type: DataTypes.INTEGER, // Foreign key to Specialite
        allowNull: true,
        references: {
          model: "prospect",
          key: "id",
        },
      },
      id_visiteur: {
        type: DataTypes.INTEGER, // Foreign key to Specialite
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      date_visite: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      commentaire: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 1,
        references: {
          model: "type_visite",
          key: "id",
        },
      },
      public: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 1,
      },
      vad: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("current_timestamp"),
      },
      old_pros: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      modifier_par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      update_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      urg: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      avec: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },

    {
      sequelize,
      tableName: "visite",
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
