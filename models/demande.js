const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('demande', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fournisseur: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      }
    },
    all_pros: {
      type: DataTypes.STRING(25),
      allowNull: true,
      defaultValue: "0"
    },
    prospects: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    secteur: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    delegation: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    Spec: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "type_demande",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    lieu: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    dis: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    pays: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    budget_demander: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    budget_investi: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    objectif: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    labos: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    prod: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    validation: {
      type: DataTypes.STRING(4),
      allowNull: true,
      defaultValue: "0"
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
      allowNull: true
    },
    VueBySupp: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    validation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    forHow: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    sysDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    budget_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dm_creation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dm_validation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dm_ba_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dm_investi_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fact: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    court: {
      type: DataTypes.DECIMAL(12,3),
      allowNull: false,
      defaultValue: 1.000
    }
  }, {
    sequelize,
    tableName: 'demande',
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
