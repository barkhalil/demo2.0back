const {Sequelize} = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('prospect', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    code_client: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    prenom: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    
    spec: {
      type: DataTypes.INTEGER,  // Foreign key to Specialite
      allowNull: true,
      references: {
        model: 'specialite',
        key: 'id'
      }
    }
    ,
    tel: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tel_2: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    gsm: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gsm_2: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fax: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    gouvernorat: {
      type: DataTypes.STRING(200),
      allowNull: true,
      references: {
        model: 'gouvernerat',
        key: 'id'
      }
    },
    delegation: {
      type: DataTypes.STRING(200),
      allowNull: true,
      references: {
        model: 'delegation',
        key: 'id'
      }
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code_postal: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    etablissement: {
      type: DataTypes.TEXT,
      allowNull: true,
       references: {
        model: 'etablissement',
        key: 'id'
      }
    },
    service: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activite: {
      type: DataTypes.STRING(200),
      allowNull: true,
      references: {
        model: 'activite',
        key: 'id'
      }
    },
    secteur_ims: {
      type: DataTypes.STRING(255),
      allowNull: true
      
    },
    potentiel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'potentiel',
        key: 'id'
      }
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pkr: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    public: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "1"
    },
    cree_par: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    modifier_par: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IdFact: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nord_ratio: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    centre_ratio: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    sud_ratio: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    phyto: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    mf: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    dermo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    type_fid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    }
  }
  
  ,{
    sequelize,
    tableName: 'prospect',
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
      {
        name: "IdFact",
        using: "BTREE",
        fields: [
          { name: "IdFact" },
        ]
      },
    ]
  });
};
