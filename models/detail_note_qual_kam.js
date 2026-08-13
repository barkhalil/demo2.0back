const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('detail_note_qual_kam', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_sup: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    prime: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.DECIMAL(5,2),
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
    tableName: 'detail_note_qual_kam',
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
