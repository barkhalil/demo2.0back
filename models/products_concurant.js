const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products_concurant', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    form: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categorie: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prix: {
      type: DataTypes.DECIMAL(8,3),
      allowNull: true
    },
    contenance: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prodV: {
      type: DataTypes.STRING(5000),
      allowNull: true
    },
    ss: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    public: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
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
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    aire: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'products_concurant',
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
