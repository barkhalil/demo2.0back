module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'country_dashboard',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      countryCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true,
        field: 'country_code',
      },
      countryName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'country_name',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'updated_by',
      },

      // ── Sections stockées en JSON ────────────────────────────────────────────
      fichePays:       { type: DataTypes.JSON, allowNull: true, defaultValue: {}, field: 'fiche_pays' },
      produits:        { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'produits' },
      partenaires:     { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'partenaires' },
      premiereCommande:{ type: DataTypes.JSON, allowNull: true, defaultValue: {}, field: 'premiere_commande' },
      budgetMarketing: { type: DataTypes.JSON, allowNull: true, defaultValue: {}, field: 'budget_marketing' },
      jalons:          { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'jalons' },
      stock:           { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'stock' },
      formations:      { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'formations' },
      missions:        { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'missions' },
      objectifs:       { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'objectifs' },
      actions:         { type: DataTypes.JSON, allowNull: true, defaultValue: [], field: 'actions' },
    },
    {
      sequelize,
      tableName: 'country_dashboard',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'id' }],
        },
        {
          name: 'uq_country_code',
          unique: true,
          fields: [{ name: 'country_code' }],
        },
      ],
    }
  );
};
