const { sequelize, models } = require("../database");
const express = require("express");
const { Sequelize, Op } = require("sequelize");
const { Products, Prdspec, Zone, Users, ProdZone, UsersZone } = models;

const router = express.Router();
const validator = require("../midelware/validator");

router.post("/getPdcDlg", validator, async (req, res) => {
  // console.log(req.body);
  const { de, a, id } = req.body;
  const d = new Date(de);
  let year = d.getFullYear();
  try {
    const userBu = await UsersZone.findAll({
      where: {
        user: id,
        year: year,
      },

      attributes: ["bu"],
    });
    //console.log(userBu);

    const buIds = userBu.map((ub) => ub.bu);
    const allProducts = await Prdspec.findAll({
      where: {
        [Op.and]: [
          {
            de: {
              [Op.gte]: de, // Date is less than or equal to 'de'
            },
          },
          {
            a: {
              [Op.lte]: a, // Date is greater than or equal to 'a'
            },
          },
        ],
      },
      include: [
        {
          model: Products,
          attributes: ["id", "name", "code_article"],
        },
        {
          model: Zone,
          where: {
            id: {
              [Op.in]: buIds, // ← Filter Zone by the bu IDs
            },
          },
        },
      ],
      order: [["fte", "DESC"]],
      group: ["product.id"],
    });

    res.status(200).json(allProducts);
    //console.log(allProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProdBuDlg", validator, async (req, res) => {
  // console.log(req.body);
  const { year, id } = req.body;

  try {
    const userBu = await UsersZone.findAll({
      where: {
        user: id,
        year: year,
      },

      attributes: ["bu"],
    });
    //console.log(userBu);

    const buIds = userBu.map((ub) => ub.bu);
    const allProducts = await Products.findAll({
      include: [
        {
          model: ProdZone,

          where: {
            zone: {
              [Op.in]: buIds,
              // ← Filter Zone by the bu IDs
            },
            year: year,
          },
        },
      ],
    });

    res.status(200).json(allProducts);
    // console.log(allProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getBuDlg", validator, async (req, res) => {
  // console.log(req.body);
  const { year, id } = req.body;

  try {
    const userBu = await UsersZone.findAll({
      where: {
        user: id,
        year: year,
      },

      attributes: ["bu"],
    });
    //  console.log(userBu);

    /* const buIds = userBu.map((ub) => ub.bu);
    const allProducts = await Products.findAll({
      include: [
        {
          model: ProdZone,
          
          where: {
            zone: {
              [Op.in]: buIds, 
              // ← Filter Zone by the bu IDs
            },
            year:year
          },
        },
      ],
    });*/

    res.status(200).json(userBu);
    console.log(userBu);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getPrimeQual", validator, async (req, res) => {
  // console.log(req.body);
  const { de, a, id } = req.body;

  try {
    const primeQual = await sequelize.query(
      "SELECT SUM (note) as note  FROM detail_note_qual WHERE de=:de and  a=:a and id_del=:id and   prime!=37",
      {
        replacements: { de, a, id },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    res.status(200).json(primeQual);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
