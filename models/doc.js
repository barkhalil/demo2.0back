const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('doc', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cat_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    titre: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    public: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'doc',
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
