const { sequelize, models } = require("../database");
const express = require("express");
const { Sequelize, Op } = require("sequelize");
const { Products, ProdObj, ProdGamme, Aire,ProdZone,Zone } = models;
const { getFilteredProducts } = require("../midelware/helpers");
const router = express.Router();
const validator = require("../midelware/validator");

const getUniqueValues = (items, key) => {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (value && !seen.has(value)) {
      seen.add(value);
      return true;
    }
    return false;
  });
};
router.post("/getProductList", async (req, res) => {

  try {
    const { gamme_id = null, bu = 0, aire_id = null } = req.body;

    const products = await getFilteredProducts({
      gamme_id: gamme_id ? Number(gamme_id) : null,
      bu: Number(bu) || 0,
      aire_id: aire_id ? Number(aire_id) : null,
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error("[POST /getProductList]", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/getProd", validator, async (req, res) => {
  const { year, gamme_id } = req.body;

  const whereCondition = {};

  if (gamme_id !== null && gamme_id) {
    whereCondition.gamme_id = gamme_id;
  }

  try {
    const allProspects = await Products.findAll({
      where: whereCondition,
      include: [
        {
          model: ProdObj,
          required: false,
          attributes: ["annee", "objUnit", "objCa", "prix"],
          // Matches the alias in the association
          where: { annee: year },
        },
        {
          model: ProdGamme,
          required: false,
          attributes: ["nom", "id"],
          // Matches the alias in the association
        },
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllProd", validator, async (req, res) => {
  const { year, gamme_id } = req.body;

  const whereCondition = {};

  if (gamme_id !== null && gamme_id) {
    whereCondition.gamme_id = gamme_id;
  }

  try {
    const allProspects = await Products.findAll({
      where: whereCondition,
      include: [
        {
          model: ProdObj,

          required: false,
          attributes: ["annee", "objUnit", "objCa", "prix"],
          // Matches the alias in the association
          where: { annee: year },
        },
        {
          model: ProdGamme,
          required: false,
          attributes: ["nom", "id"],
          // Matches the alias in the association
        },
        {
          model: Aire,
          as: 'airet',
          required: false,
          attributes: ["nom", "id"],
          // Matches the alias in the association
         
        },
         {
            model: ProdZone,
            required: false,
            include: {
              model: Zone,
              as: 'zoneInfo',
              attributes: ['id', 'nom'],
            },
            attributes: ['zone'],
            where: {
              year: year,
            },
        },
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProdGamme", validator, async (req, res) => {
  try {
    const allProspects = await ProdGamme.findAll({
      order: [["nom", "ASC"]],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAire", validator, async (req, res) => {
  try {
    const allProspects = await Aire.findAll({
      order: [["nom", "ASC"]],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/updateObjPrd", validator, async (req, res) => {
  const { id, qte, ca, prix, user, year } = req.body;

  try {
    const allProspects = await ProdObj.findOne({
      where: {
        idPrd: id,

        annee: year,
      }, // Match the id
    });

    if (allProspects) {
      console.log("update");
      const update = await ProdObj.update(
        {
          objUnit: id,
          objCa: ca,
          objUnit: qte,
          prix: prix,
          created_by: user.id,
        },
        {
          where: {
            idPrd: id,

            annee: year,
          }, // Match the id ggfgfgfddd
        },
      );

      ////ddddddddddddddd

      res.status(200).json(update);
    } else {
      console.log("create");
      const update = await ProdObj.create({
        idPrd: id,
        objCa: ca,
        objUnit: qte,
        prix: prix,
        created_by: user.id,
        annee: year,
      });
      res.status(200).json(update);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
