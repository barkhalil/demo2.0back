const express = require('express');
const router = express.Router();
const { sequelize } = require('../database');
const { DataTypes } = require('sequelize');
const CountryDashboard = require('../models/CountryDashboard')(sequelize, DataTypes);
const authMiddleware =require("../midelware/validator");

// Crée la table si elle n'existe pas encore
CountryDashboard.sync({ alter: false }).catch(err =>
  console.error('CountryDashboard sync error:', err.message)
);

const ALLOWED_TABS = [
  'fichePays', 'produits', 'partenaires', 'premiereCommande',
  'budgetMarketing', 'jalons', 'stock', 'formations', 'missions', 'objectifs', 'actions',
];

// ── GET all countries (list for map markers) ─────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const countries = await CountryDashboard.findAll({
      attributes: ['id', 'countryCode', 'countryName', 'updatedAt'],
    });
    res.json({ success: true, data: countries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET single country full data ──────────────────────────────────────────────
router.get('/:countryCode', authMiddleware, async (req, res) => {
  try {
    const doc = await CountryDashboard.findOne({
      where: { countryCode: req.params.countryCode.toUpperCase() },
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Pays non trouvé' });
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST create or initialize country ────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { countryCode, countryName } = req.body;
    const code = countryCode.toUpperCase();

    const existing = await CountryDashboard.findOne({ where: { countryCode: code } });
    if (existing) return res.status(400).json({ success: false, message: 'Pays déjà existant' });

    const doc = await CountryDashboard.create({
      countryCode: code,
      countryName,
      createdBy: req.user?.id || null,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH update a specific tab ────────────────────────────────────────────────
router.patch('/:countryCode/tab/:tab', authMiddleware, async (req, res) => {
  const { tab } = req.params;
  if (!ALLOWED_TABS.includes(tab)) {
    return res.status(400).json({ success: false, message: 'Onglet invalide' });
  }

  try {
    const code = req.params.countryCode.toUpperCase();
    let doc = await CountryDashboard.findOne({ where: { countryCode: code } });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Pays non trouvé' });
    }

    await doc.update({ [tab]: req.body, updatedBy: req.user?.id || null });
    res.json({ success: true, data: doc[tab] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE a country ────────────────────────────────────────────────────────
router.delete('/:countryCode', authMiddleware, async (req, res) => {
  try {
    await CountryDashboard.destroy({
      where: { countryCode: req.params.countryCode.toUpperCase() },
    });
    res.json({ success: true, message: 'Pays supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
