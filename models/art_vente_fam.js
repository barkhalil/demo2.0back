const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('art_vente_fam', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    qte: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    grat: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ttc: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    tht: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fam: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    article: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'art_vente_fam',
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
