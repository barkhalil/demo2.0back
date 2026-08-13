// helpers/getFilteredProducts.js
const { models } = require("../database");
const { Products, ProdObj, ProdGamme, ProdZone } = models;


async function getFilteredProducts({
  gamme_id = null,
  bu = 0,
  aire_id = null,
} = {}) {
  const currentYear = new Date().getFullYear();

  const whereCondition = {};
  if (gamme_id) whereCondition.gamme_id = gamme_id;
  if (aire_id) whereCondition.aire = aire_id;

  try {
    const allProducts = await Products.findAll({
      where: whereCondition,
      attributes: ["id", "code_article", "name", "bu", "gamme_id"],
      include: [
        {
          model: ProdObj,
          required: false,
          attributes: ["annee", "objUnit", "objCa", "prix"],
          where: { annee: currentYear },
        },
        {
          model: ProdGamme,
          required: false,
          attributes: ["nom", "id"],
        },
        {
          model: ProdZone,
          required: true,
          attributes: ["zone"],
          where: {
            year: currentYear,
            ...(bu != 0 && { zone: bu }),
          },
        },
      ],
      order: [["id", "ASC"]],
      raw: false,
    });

    return allProducts.map((p) => ({
      id: p.id,
      code_article: p.code_article,
      name: p.name,
      bu: p.ProdZones?.[0]?.zone ?? p.bu,
      gamme: p.ProdGamme?.nom ?? null,
      gamme_id: p.gamme_id,
    }));
  } catch (error) {
    console.error("[getFilteredProducts] Error:", error);
    throw error;
  }
}

module.exports = { getFilteredProducts };
