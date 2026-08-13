const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grm_gift_save_b', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bare_code: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    code_article: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    titre: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    famille: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    dispo: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    qte: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    point_bonus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qte_utiliser: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    serialisable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    system_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    paht: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    pvht: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    pvttc: {
      type: DataTypes.FLOAT(10,3),
      allowNull: true
    },
    stoc_alert: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    stock_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    etat: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'grm_gift_save_b',
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
