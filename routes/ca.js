const { sequelize, sequelize2, models } = require("../database");
const { getFilteredProducts } = require("../midelware/helpers");

const express = require("express");
const router = express.Router();
const { Sequelize, Op } = require("sequelize");
const validator = require("../midelware/validator");
const {
  ProdGamme,
  UsersZone,
  Products,
  ProdObj,
  ProdZone,
  AffectationPh,
  DcrepCode,
  Aire,
  Prospect,
} = models;
const getListGro = (items, key) => {
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
router.post("/getcaProd", validator, async (req, res) => {
  const { de, a } = req.body;
  const deDate = new Date(de);
  const aDate = new Date(a);

  // Subtract one year
  deDate.setFullYear(deDate.getFullYear() - 1);
  aDate.setFullYear(aDate.getFullYear() - 1);

  // Format back to string if needed
  de2 = deDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  a2 = aDate.toISOString().split("T")[0];
  //console.log(de2+" "+a2)
  try {
    const ca = await sequelize.query(
      "SELECT  sum(ttc) as ca , art FROM ca_tot_vente where date>=:de and date<=:a group by art ORDER BY ca DESC",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const caY = await sequelize.query(
      "SELECT  sum(ttc) as ca , art FROM ca_tot_vente where date>=:de2 and date<=:a2 group by art ORDER BY ca DESC",
      {
        replacements: { de2, a2 },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const ca2 = await Products.findAll({
      include: [
        {
          model: ProdGamme,

          attributes: ["nom"],
        },
      ],
    });
    const combinedData = ca2.map((product) => {
      const sale = ca.find((item) => item.art === product.code_article);
      const sale2 = caY.find((item) => item.art === product.code_article);
      return {
        code_article: product.code_article,
        name: product.name,
        gamme: product.prod_categorie.nom,
        ca: sale ? sale.ca : 0, // Default to 0 if no sales data exists
        ca2: sale2 ? sale2.ca : 0, // Default to 0 if no sales data exists
      };
    });

    res.status(200).json({
      combinedData,
    }); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
router.post("/getProductMonthlyCaByYear", validator, async (req, res) => {
  const { product_id = null, gamme_id = null, bu = 0, aire_id = null } = req.body;

  const currentYear = new Date().getFullYear();
  const startYear   = 2019;
  const endYear     = currentYear;

  try {
    // ── 1. Resolve which code_article(s) to query ──────────────────────────
    let codeArticles = [];
    let productMeta  = null; // only populated for single-product mode

    if (product_id) {
      // Single product
      const product = await Products.findOne({
        where: { id: product_id },
        include: [{ model: ProdGamme, attributes: ['nom'] }]
      });

      if (!product) return res.status(404).json({ error: 'Product not found' });

      codeArticles = [product.code_article];
      productMeta  = {
        id:           product.id,
        code_article: product.code_article,
        name:         product.name,
        gamme:        product.prod_categorie?.nom ?? null
      };

    } else {
      // Multiple products — apply gamme / BU / aire filters
      const whereCondition = {};
      if (gamme_id) whereCondition.gamme_id = gamme_id;
      if (aire_id) whereCondition.aire = aire_id;

      const products = await Products.findAll({
        where: whereCondition,
        attributes: ['id', 'code_article', 'name'],
        include: [
          {
            model: ProdGamme,
            required: false,
            attributes: ['nom']
          },
          {
            model: ProdZone,
            required: true,
            attributes: ['zone'],
            where: {
              year: currentYear,
              ...(bu && bu != 0 && { zone: bu })
            }
          }
        ]
      });

      codeArticles = products.map(p => p.code_article);

      // Build a label for the frontend
      const parts = [];
      if (product_id)   parts.push('Produit sélectionné');
      if (gamme_id)     parts.push(`Gamme #${gamme_id}`);
      if (bu && bu != 0) parts.push(`BU ${bu}`);
      if (aire_id)      parts.push(`Aire #${aire_id}`);
      productMeta = { label: parts.length ? parts.join(' · ') : `${products.length} produits` };
    }

    if (codeArticles.length === 0) {
      return res.status(200).json({ product: productMeta, caByYearMonth: {} });
    }

    // ── 2. Fetch monthly CA for all resolved codes in one query ─────────────
    const placeholders = codeArticles.map(() => '?').join(', ');
    const monthlyRows  = await sequelize.query(
      `SELECT
         YEAR(date)  AS year,
         MONTH(date) AS month,
         SUM(ttc)     AS ca
       FROM ca_tot_vente
       WHERE art IN (${placeholders})
         AND YEAR(date) >= ?
         AND YEAR(date) <= ?
       GROUP BY YEAR(date), MONTH(date)
       ORDER BY YEAR(date), MONTH(date)`,
      {
        replacements: [...codeArticles, startYear, endYear],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // ── 3. Build caByYearMonth[year][month] = ca ────────────────────────────
const caByYearMonth = {}; 
    for (let y = startYear; y <= endYear; y++) caByYearMonth[y] = {};

    monthlyRows.forEach((row) => {
      const y = Number(row.year);
      const m = Number(row.month);
      if (!caByYearMonth[y]) caByYearMonth[y] = {};
      caByYearMonth[y][m] = (caByYearMonth[y][m] || 0) + (Number(row.ca) || 0);
    });

    return res.status(200).json({
      product:        productMeta,       // { id, code_article, name, gamme } or { label }
      label:          productMeta?.label ?? null,
      caByYearMonth
    });

  } catch (error) {
    console.error('[getProductMonthlyCaByYear] Error:', error);
    return res.status(500).send('Error executing query');
  }
});

router.post("/getcaExport", validator, async (req, res) => {
  const { de, a } = req.body;
  const deDate = new Date(de);
  const aDate = new Date(a);
  const year1 = deDate.getFullYear() - 1;
  const year2 = deDate.getFullYear();
  // Subtract one year
  deDate.setFullYear(deDate.getFullYear() - 1);
  aDate.setFullYear(aDate.getFullYear() - 1);

  // Format back to string if needed
  de2 = deDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  a2 = aDate.toISOString().split("T")[0];
  // console.log(de2 + " " + a2);
  try {
    const pays = await sequelize2.query(
      "SELECT  distinct(pays) FROM kb_ca_export_pays where year(date)>=:year1 and year(date)<=:year2 order by pays",
      {
        replacements: { year1, year2 },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const ca = await sequelize2.query(
      "SELECT  sum(ttc) as ca , pays FROM kb_ca_export_pays where date>=:de and date<=:a group by pays ORDER BY ca DESC",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const ca2 = await sequelize2.query(
      "SELECT  sum(ttc) as ca , pays FROM kb_ca_export_pays where date>=:de2 and date<=:a2 group by pays ORDER BY ca DESC",
      {
        replacements: { de2, a2 },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const combinedData = pays.map((pays) => {
      const sale = ca.find(
        (item) => item.pays.toUpperCase() === pays.pays.toUpperCase(),
      );
      const sale2 = ca2.find(
        (item) => item.pays.toUpperCase() === pays.pays.toUpperCase(),
      );
      return {
        pays: pays.pays.toUpperCase(),
        ca: sale ? sale.ca : 0,

        ca2: sale2 ? sale2.ca : 0, // Default to 0 if no sales data exists
      };
    });

    res.status(200).json({
      combinedData,
    }); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});

router.post("/getProdCa", validator, async (req, res) => {
  const { de, a, gamme_id, bu } = req.body;
  const year = new Date(de).getFullYear();

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
          model: ProdZone,
          required: true,
          attributes: ["zone"],
          // Matches the alias in the association
          where: {
            year: year,
            ...(bu != 0 && { zone: bu }), // Filter by zone if bu is provided
          },
        },
      ],
      order: [["id", "ASC"]],
    });

    const caProd = await sequelize.query(
      "SELECT  sum(ttc) as ca,sum(qte) as qte ,art  FROM ca_tot_vente where date>=:de and date<=:a   group by art ",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const listPrdCaMap = new Map();
    caProd.forEach((item) => {
      listPrdCaMap.set(item.art, item);
    });

    const combinedData = allProspects.map((gro) => {
      const caPrd = listPrdCaMap.get(gro.code_article);
      if (gro) {
        // If prospect exists, combine the data
        return {
          id: gro.id,
          code_article: gro.code_article,
          name: gro.name,
          prix: gro.prix,
          bu: gro.products_zones[0] ? gro.products_zones[0].zone : 0,
          gamme: gro.prod_categorie.nom,
          objUnit: gro.productsobjs[0] ? gro.productsobjs[0].objUnit : 0,
          objCa: gro.productsobjs[0] ? gro.productsobjs[0].objCa : 0,
          ca: caPrd ? caPrd.ca : 0, // Use caPrd if it exists, otherwise default to 0
          qte: caPrd ? caPrd.qte : 0, // Use caPrd if it exists, otherwise default to 0
        };
      } else {
        // If prospect doesn't exist, keep caGro data and set others to null
        return {
          id: null,
          code_article: null,
          name: null,
          bu: null,
          prix: null,
          gamme: null,
          objUnit: 0,
          objCa: 0,
          ca: caPrd ? caPrd.ca : 0,
          qte: caPrd ? caPrd.qte : 0,
        };
      }
    });
    //console.log(combinedData)
    res.status(200).json(combinedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/getProdCa", validator, async (req, res) => {
  const { de, a, gamme_id, bu } = req.body;
  const year = new Date(de).getFullYear();

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
          model: ProdZone,
          required: true,
          attributes: ["zone"],
          // Matches the alias in the association
          where: {
            year: year,
            ...(bu != 0 && { zone: bu }), // Filter by zone if bu is provided
          },
        },
      ],
      order: [["id", "ASC"]],
    });

    const caProd = await sequelize.query(
      "SELECT  sum(ttc) as ca,sum(qte) as qte ,art  FROM ca_tot_vente where date>=:de and date<=:a   group by art ",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const listPrdCaMap = new Map();
    caProd.forEach((item) => {
      listPrdCaMap.set(item.art, item);
    });

    const combinedData = allProspects.map((gro) => {
      const caPrd = listPrdCaMap.get(gro.code_article);
      if (gro) {
        // If prospect exists, combine the data
        return {
          id: gro.id,
          code_article: gro.code_article,
          name: gro.name,
          prix: gro.prix,
          bu: gro.products_zones[0] ? gro.products_zones[0].zone : 0,
          gamme: gro.prod_categorie.nom,
          objUnit: gro.productsobjs[0] ? gro.productsobjs[0].objUnit : 0,
          objCa: gro.productsobjs[0] ? gro.productsobjs[0].objCa : 0,
          ca: caPrd ? caPrd.ca : 0, // Use caPrd if it exists, otherwise default to 0
          qte: caPrd ? caPrd.qte : 0, // Use caPrd if it exists, otherwise default to 0
        };
      } else {
        // If prospect doesn't exist, keep caGro data and set others to null
        return {
          id: null,
          code_article: null,
          name: null,
          bu: null,
          prix: null,
          gamme: null,
          objUnit: 0,
          objCa: 0,
          ca: caPrd ? caPrd.ca : 0,
          qte: caPrd ? caPrd.qte : 0,
        };
      }
    });
    //console.log(combinedData)
    res.status(200).json(combinedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProdCaSectFam", validator, async (req, res) => {
  const { de, a} = req.body;
  const year = new Date(de).getFullYear();

 
 
  try {
  

    const caProd = await sequelize.query(
      "SELECT  sum(ttc) as ttc ,sum(qte) as qte,art,fam,zone  FROM ca_tot_vente where date>=:de and date<=:a   group by art,fam,zone ",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
 

   
    //console.log(combinedData)
    res.status(200).json(caProd);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getPredictionProducts", validator, async (req, res) => {
  const { gamme_id, bu } = req.body;

  // Prédiction toujours pour l'année en cours
  const currentYear = new Date().getFullYear();
  const predictionYear = currentYear;
  const endHistoryYear = currentYear - 1;
  const startHistoryYear = currentYear - 6;

  const whereCondition = {};
  if (gamme_id !== null && gamme_id) {
    whereCondition.gamme_id = gamme_id;
  }

  try {
    // 1. Récupérer tous les produits
    const allProducts = await Products.findAll({
      where: whereCondition,
      include: [
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
            year: endHistoryYear,
            ...(bu != 0 && { zone: bu }),
          },
        },
      ],
      order: [["id", "ASC"]],
    });

    // 2. Récupérer l'historique des ventes (UNITÉS) incluant l'année en cours
    const salesHistory = await sequelize.query(
      `SELECT 
        art,
        YEAR(date) as year,
        SUM(qte) as qte,
        SUM(ttc) as ca
      FROM ca_tot_vente 
      WHERE YEAR(date) BETWEEN ${startHistoryYear} AND ${currentYear}
      GROUP BY art, YEAR(date)
      ORDER BY art, year`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    // 3. Organiser les données par article
    const salesByProduct = new Map();
    salesHistory.forEach((item) => {
      if (!salesByProduct.has(item.art)) {
        salesByProduct.set(item.art, {});
      }
      salesByProduct.get(item.art)[item.year] = {
        qte: parseFloat(item.qte) || 0,
        ca: parseFloat(item.ca) || 0,
      };
    });

    // 4. Fonction de régression linéaire
    const linearRegression = (years, values) => {
      const n = years.length;
      if (n < 3) return null;

      const sumX = years.reduce((a, b) => a + b, 0);
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = years.reduce((sum, x, i) => sum + x * values[i], 0);
      const sumX2 = years.reduce((sum, x) => sum + x * x, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return { slope, intercept };
    };

    // 5. Fonction de prédiction
    const predict = (regression, year) => {
      if (!regression) return 0;
      return Math.max(0, regression.slope * year + regression.intercept);
    };

    // 6. Fonction de calcul RMSE (Leave-One-Out Cross Validation)
    const calculateRMSE = (years, values, regression) => {
      if (!regression || years.length < 3) return 0;

      let sumSquaredErrors = 0;
      const n = years.length;

      for (let i = 0; i < n; i++) {
        const trainYears = years.filter((_, idx) => idx !== i);
        const trainValues = values.filter((_, idx) => idx !== i);

        const trainRegression = linearRegression(trainYears, trainValues);
        if (trainRegression) {
          const predicted = predict(trainRegression, years[i]);
          const actual = values[i];
          sumSquaredErrors += Math.pow(actual - predicted, 2);
        }
      }

      return Math.sqrt(sumSquaredErrors / n);
    };

    // 7. Calculer les prédictions pour chaque produit
    const predictions = allProducts.map((product) => {
      const code = product.code_article;
      const salesData = salesByProduct.get(code) || {};

      // Extraire les années et quantités/CA disponibles (SANS l'année en cours pour la prédiction)
      const availableYears = [];
      const quantities = [];
      const caValues = [];
      const historicalData = {};

      // Données historiques pour la régression (jusqu'à N-1)
      for (let year = startHistoryYear; year <= endHistoryYear; year++) {
        if (salesData[year]) {
          availableYears.push(year);
          quantities.push(salesData[year].qte);
          caValues.push(salesData[year].ca);
        }
        historicalData[year] = salesData[year] || { qte: 0, ca: 0 };
      }

      // Ajouter le réalisé de l'année en cours
      historicalData[currentYear] = salesData[currentYear] || { qte: 0, ca: 0 };

      let prediction = {
        id: product.id,
        code_article: code,
        name: product.name,
        bu: product.products_zones[0]?.zone || 0,
        gamme: product.prod_categorie?.nom || "",
        predictionYear: predictionYear,
        historicalYears: availableYears,
        historicalData: historicalData,
        currentYearActual: historicalData[currentYear].qte,
        currentYearActualCA: historicalData[currentYear].ca,
        base: 0,
        worst: 0,
        best: 0,
        rmse: 0,
        baseCA: 0,
        worstCA: 0,
        bestCA: 0,
        rmseCA: 0,
        reliability: "INSUFFICIENT_DATA",
        reliabilityScore: 0,
        reliabilityScoreCA: 0,
        canPredict: false,
      };

      if (availableYears.length >= 3) {
        // Prédiction pour les UNITÉS
        const regressionQte = linearRegression(availableYears, quantities);
        // Prédiction pour le CA
        const regressionCA = linearRegression(availableYears, caValues);

        if (regressionQte && regressionCA) {
          // Prédictions UNITÉS
          const baseQte = predict(regressionQte, predictionYear);
          const rmseQte = calculateRMSE(
            availableYears,
            quantities,
            regressionQte,
          );
          const worstQte = Math.max(0, baseQte - rmseQte);
          const bestQte = baseQte + rmseQte;

          // Prédictions CA
          const baseCA = predict(regressionCA, predictionYear);
          const rmseCA = calculateRMSE(availableYears, caValues, regressionCA);
          const worstCA = Math.max(0, baseCA - rmseCA);
          const bestCA = baseCA + rmseCA;

          // Fiabilité UNITÉS
          const reliabilityScoreQte = baseQte > 0 ? 1 - rmseQte / baseQte : 0;
          // Fiabilité CA
          const reliabilityScoreCA = baseCA > 0 ? 1 - rmseCA / baseCA : 0;

          // Utiliser la fiabilité des UNITÉS pour la classification globale
          let reliability = "HIGH";
          if (reliabilityScoreQte < 0.5) reliability = "LOW";
          else if (reliabilityScoreQte < 0.75) reliability = "MEDIUM";

          prediction = {
            ...prediction,
            base: Math.round(baseQte),
            worst: Math.round(worstQte),
            best: Math.round(bestQte),
            rmse: Math.round(rmseQte),
            baseCA: Math.round(baseCA),
            worstCA: Math.round(worstCA),
            bestCA: Math.round(bestCA),
            rmseCA: Math.round(rmseCA),
            reliability: reliability,
            reliabilityScore: Math.round(reliabilityScoreQte * 100) / 100,
            reliabilityScoreCA: Math.round(reliabilityScoreCA * 100) / 100,
            canPredict: true,
            regressionQte: {
              slope: Math.round(regressionQte.slope * 100) / 100,
              intercept: Math.round(regressionQte.intercept * 100) / 100,
            },
            regressionCA: {
              slope: Math.round(regressionCA.slope * 100) / 100,
              intercept: Math.round(regressionCA.intercept * 100) / 100,
            },
          };
        }
      }

      return prediction;
    });

    const validPredictions = predictions.filter((p) => p.canPredict);
    const insufficientData = predictions.filter((p) => !p.canPredict);

    res.status(200).json({
      success: true,
      predictionYear: predictionYear,
      currentYear: currentYear,
      historicalPeriod: {
        start: startHistoryYear,
        end: endHistoryYear,
      },
      statistics: {
        total: predictions.length,
        canPredict: validPredictions.length,
        insufficientData: insufficientData.length,
        highReliability: validPredictions.filter(
          (p) => p.reliability === "HIGH",
        ).length,
        mediumReliability: validPredictions.filter(
          (p) => p.reliability === "MEDIUM",
        ).length,
        lowReliability: validPredictions.filter((p) => p.reliability === "LOW")
          .length,
      },
      predictions: predictions,
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/getPredictionProductsMonthly", validator, async (req, res) => {
  const {
    gamme_id,
    bu = 0,
    scenario = "base",
    granularity = "monthly",
    product_id = null,
  } = req.body;
 // console.log(req.body);
  const currentYear = new Date().getFullYear();
  const predictionYear = currentYear;
  const endHistoryYear = currentYear - 1;
  const startHistoryYear = currentYear - 6;


  const whereCondition = {};

  // Filter by a single product id — takes priority over gamme/bu
  if (product_id !== null && product_id) {
    whereCondition.id = product_id;
  } else {
    // Fall back to gamme filter when no specific product is requested
    if (gamme_id !== null && gamme_id) {
      whereCondition.gamme_id = gamme_id;
    }
  }

  try {
    // 1. Récupérer les produits avec leurs objectifs
    const allProducts = await Products.findAll({
      where: whereCondition,
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
      raw: false, // IMPORTANT: Garder les objets Sequelize intacts
    });

    // 2. Récupérer l'historique MENSUEL des ventes
    const salesHistory = await sequelize.query(
      `SELECT 
        art,
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(qte) as qte,
        SUM(ttc) as ca
      FROM ca_tot_vente 
      WHERE YEAR(date) BETWEEN ${startHistoryYear} AND ${endHistoryYear}
      GROUP BY art, YEAR(date), MONTH(date)
      ORDER BY art, year, month`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    // 3. Récupérer le stock actuel de chaque article
    const artStock = await sequelize.query(
      `SELECT 
        art_code,
        SUM(qte) as stock_qte
      FROM ca_tot_vente
      GROUP BY art_code`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    // 4. Organiser les données par article
    const salesByProduct = new Map();
    salesHistory.forEach((item) => {
      if (!salesByProduct.has(item.art)) {
        salesByProduct.set(item.art, []);
      }
      salesByProduct.get(item.art).push({
        year: item.year,
        month: item.month,
        qte: parseFloat(item.qte) || 0,
        ca: parseFloat(item.ca) || 0,
      });
    });

    // Organiser le stock par article
    const stockByProduct = new Map();
    artStock.forEach((item) => {
      stockByProduct.set(item.art_code, parseFloat(item.stock_qte) || 0);
    });

    // 5. FONCTION PRINCIPALE : Calcul prédictif selon modèle Excel hybride
    const calculateHybridPrediction = (
      monthlySales,
      targetYear,
      scenarioType,
    ) => {
      // Vérifier les données d'entrée
      if (!monthlySales || !Array.isArray(monthlySales)) {
        return {
          canPredict: false,
          error: "Aucune donnée historique disponible",
          errorType: "NO_DATA",
          details: "Données historiques manquantes",
        };
      }

      // Vérifier le nombre minimum de données
      if (monthlySales.length === 0) {
        return {
          canPredict: false,
          error: "Aucune vente historique enregistrée",
          errorType: "NO_SALES_DATA",
          details: "Le produit n'a aucune vente historique",
        };
      }

      // Vérifier le nombre d'années de données
      const uniqueYears = [...new Set(monthlySales.map((s) => s.year))];

      if (uniqueYears.length < 2) {
        return {
          canPredict: false,
          error: "Données historiques insuffisantes",
          errorType: "INSUFFICIENT_HISTORY",
          details: `Seulement ${uniqueYears.length} année(s) de données (minimum 2 années requises)`,
          dataYears: uniqueYears,
        };
      }

      // Calculer le nombre minimum de mois nécessaires
      const totalMonths = monthlySales.length;
      const yearsNeeded = Math.max(2, uniqueYears.length);
      const minDataPoints = yearsNeeded * 6; // Au moins 6 mois par an

      if (totalMonths < minDataPoints) {
        return {
          canPredict: false,
          error: "Données mensuelles insuffisantes",
          errorType: "INSUFFICIENT_MONTHLY_DATA",
          details: `${totalMonths} mois disponibles (minimum ${minDataPoints} mois requis)`,
          dataMonths: totalMonths,
          requiredMonths: minDataPoints,
        };
      }

      // A. Calculer la prédiction annuelle
      const yearsData = {};
      monthlySales.forEach((sale) => {
        if (!yearsData[sale.year]) {
          yearsData[sale.year] = 0;
        }
        yearsData[sale.year] += sale.qte;
      });

      const years = Object.keys(yearsData)
        .map((y) => parseInt(y))
        .sort();
      const quantities = years.map((y) => yearsData[y]);

      if (years.length < 2) {
        return {
          canPredict: false,
          error: "Données annuelles insuffisantes pour la régression",
          errorType: "INSUFFICIENT_YEARS_FOR_REGRESSION",
          details: `${years.length} année(s) seulement`,
        };
      }

      // Régression linéaire simple
      const n = years.length;
      const sumX = years.reduce((a, b) => a + b, 0);
      const sumY = quantities.reduce((a, b) => a + b, 0);
      const sumXY = years.reduce(
        (sum, year, i) => sum + year * quantities[i],
        0,
      );
      const sumX2 = years.reduce((sum, year) => sum + year * year, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Prévision annuelle BASE
      const annualBase = Math.max(
        0,
        Math.round(slope * targetYear + intercept),
      );

      // B. Calcul du RMSE (jackknife method)
      let rmseSum = 0;
      let count = 0;

      for (let i = 0; i < years.length; i++) {
        const currentYear = years[i];
        const currentQty = quantities[i];

        // Exclure l'année courante pour la validation croisée
        const otherYears = years.filter((y, idx) => idx !== i);
        const otherQtys = quantities.filter((q, idx) => idx !== i);

        const n2 = otherYears.length;
        const sumX2_val = otherYears.reduce((a, b) => a + b, 0);
        const sumY2 = otherQtys.reduce((a, b) => a + b, 0);
        const sumXY2 = otherYears.reduce(
          (sum, year, idx) => sum + year * otherQtys[idx],
          0,
        );
        const sumX22 = otherYears.reduce((sum, year) => sum + year * year, 0);

        const slope2 =
          (n2 * sumXY2 - sumX2_val * sumY2) /
          (n2 * sumX22 - sumX2_val * sumX2_val);
        const intercept2 = (sumY2 - slope2 * sumX2_val) / n2;

        const forecast = Math.max(
          0,
          Math.round(slope2 * currentYear + intercept2),
        );
        const error = currentQty - forecast;

        rmseSum += error * error;
        count++;
      }

      const annualRMSE = count > 0 ? Math.round(Math.sqrt(rmseSum / count)) : 0;

      // Scénarios annuels
      const annualWorst = Math.max(0, annualBase - annualRMSE);
      const annualBest = annualBase + annualRMSE;

      // C. Calcul des coefficients de saisonnalité
      const monthlyGroups = {};
      for (let m = 1; m <= 12; m++) {
        monthlyGroups[m] = [];
      }

      monthlySales.forEach((sale) => {
        if (sale.month >= 1 && sale.month <= 12) {
          monthlyGroups[sale.month].push(sale.qte);
        }
      });

      // Moyenne par mois (saisonalité)
      const monthlyAverages = {};
      const monthsWithData = [];

      for (let m = 1; m <= 12; m++) {
        const data = monthlyGroups[m];
        if (data.length > 0) {
          monthlyAverages[m] =
            data.reduce((sum, val) => sum + val, 0) / data.length;
          monthsWithData.push(m);
        } else {
          monthlyAverages[m] = 0;
        }
      }

      // Vérifier la qualité des données saisonnières
      if (monthsWithData.length < 6) {
        return {
          canPredict: false,
          error: "Saisonnalité incomplète",
          errorType: "INCOMPLETE_SEASONALITY",
          details: `Données pour seulement ${monthsWithData.length} mois sur 12`,
          availableMonths: monthsWithData.length,
        };
      }

      // Calcul des erreurs mensuelles (RMSE)
      const monthlyErrors = {};
      for (let m = 1; m <= 12; m++) {
        const monthSales = monthlySales.filter((s) => s.month === m);
        if (monthSales.length > 0) {
          const avg = monthlyAverages[m];
          const squaredErrors = monthSales.map((s) => Math.pow(s.qte - avg, 2));
          monthlyErrors[m] =
            squaredErrors.length > 0
              ? Math.round(
                  Math.sqrt(
                    squaredErrors.reduce((a, b) => a + b, 0) /
                      squaredErrors.length,
                  ),
                )
              : 0;
        } else {
          monthlyErrors[m] = 0;
        }
      }

      // Calcul des totaux mensuels
      const totalBaseMonthly = monthsWithData.reduce(
        (sum, m) => sum + monthlyAverages[m],
        0,
      );
      const totalRmsemonthly = monthsWithData.reduce(
        (sum, m) => sum + monthlyErrors[m],
        0,
      );
      const totalWorstMonthly = monthsWithData.reduce(
        (sum, m) => sum + Math.max(0, monthlyAverages[m] - monthlyErrors[m]),
        0,
      );
      const totalBestMonthly = monthsWithData.reduce(
        (sum, m) => sum + (monthlyAverages[m] + monthlyErrors[m]),
        0,
      );

      // Fonction pour calculer le score de fiabilité
      const calculateReliabilityScore = (base, rmse, monthsWithDataCount) => {
        if (base <= 0) return 0;

        const varianceRatio = (rmse / base) * 100;
        const seasonalityScore = (monthsWithDataCount / 12) * 100;

        // Score basé sur la variance (70% du score)
        let varianceScore = 100;
        if (varianceRatio < 10) varianceScore = 95;
        else if (varianceRatio < 20) varianceScore = 80;
        else if (varianceRatio < 30) varianceScore = 65;
        else if (varianceRatio < 40) varianceScore = 50;
        else if (varianceRatio < 50) varianceScore = 35;
        else varianceScore = 20;

        // Score combiné
        return Math.round(varianceScore * 0.7 + seasonalityScore * 0.3);
      };

      // D. MODÈLE HYBRIDE
      let hybridPredictions = {};
      let hybridRMSE = {};
      let hybridWorst = {};
      let hybridBest = {};

      // Sélectionner le scénario annuel
      let annualTarget, annualTargetWorst, annualTargetBest;
      switch (scenarioType) {
        case "worst":
          annualTarget = annualWorst;
          annualTargetWorst = annualWorst;
          annualTargetBest = annualWorst;
          break;
        case "best":
          annualTarget = annualBest;
          annualTargetWorst = annualBest;
          annualTargetBest = annualBest;
          break;
        default:
          annualTarget = annualBase;
          annualTargetWorst = annualWorst;
          annualTargetBest = annualBest;
      }

      // Pour chaque mois, calculer les prédictions
      for (let m = 1; m <= 12; m++) {
        const monthBaseAvg = monthlyAverages[m];
        const monthRMSE = monthlyErrors[m];

        if (monthBaseAvg === 0 || !monthsWithData.includes(m)) {
          // Pas de données pour ce mois
          hybridPredictions[m] = 0;
          hybridRMSE[m] = 0;
          hybridWorst[m] = 0;
          hybridBest[m] = 0;
        } else {
          // Calculer les valeurs
          hybridPredictions[m] = Math.round(
            (monthBaseAvg / totalBaseMonthly) * annualTarget,
          );

          hybridRMSE[m] = Math.round(
            totalRmsemonthly > 0
              ? (monthRMSE / totalRmsemonthly) * annualRMSE
              : 0,
          );

          hybridWorst[m] = Math.round(
            totalWorstMonthly > 0
              ? (Math.max(0, monthBaseAvg - monthRMSE) / totalWorstMonthly) *
                  annualTargetWorst
              : Math.max(0, hybridPredictions[m] - hybridRMSE[m]),
          );

          hybridBest[m] = Math.round(
            totalBestMonthly > 0
              ? ((monthBaseAvg + monthRMSE) / totalBestMonthly) *
                  annualTargetBest
              : hybridPredictions[m] + hybridRMSE[m],
          );
        }
      }

      // Fonction d'ajustement pour correspondre aux totaux annuels
      const adjustToAnnualTotal = (monthlyValues, annualTotal) => {
        const currentTotal = Object.values(monthlyValues).reduce(
          (a, b) => a + b,
          0,
        );
        if (Math.abs(currentTotal - annualTotal) > 0.01 && currentTotal > 0) {
          const adjustment = annualTotal / currentTotal;
          const adjusted = {};
          for (let m = 1; m <= 12; m++) {
            adjusted[m] = Math.round(monthlyValues[m] * adjustment);
          }
          return adjusted;
        }
        return monthlyValues;
      };

      hybridPredictions = adjustToAnnualTotal(hybridPredictions, annualTarget);
      hybridWorst = adjustToAnnualTotal(hybridWorst, annualTargetWorst);
      hybridBest = adjustToAnnualTotal(hybridBest, annualTargetBest);

      // E. Agrégation selon granularité
      let monthlyData = [];
      let periodData = [];

      // Préparer les données mensuelles complètes
      for (let m = 1; m <= 12; m++) {
        periodData.push({
          period: `${targetYear}-${String(m).padStart(2, "0")}`,
          month: m,
          base: hybridPredictions[m],
          qte:
            scenarioType === "worst"
              ? hybridWorst[m]
              : scenarioType === "best"
                ? hybridBest[m]
                : hybridPredictions[m],
          rmse: hybridRMSE[m],
          worst: hybridWorst[m],
          best: hybridBest[m],
          hasData: monthsWithData.includes(m),
        });
      }

      // Agrégation selon granularité demandée
      if (granularity === "quarterly") {
        monthlyData = [];
        const quarters = [
          { period: `${targetYear}-Q1`, months: [1, 2, 3] },
          { period: `${targetYear}-Q2`, months: [4, 5, 6] },
          { period: `${targetYear}-Q3`, months: [7, 8, 9] },
          { period: `${targetYear}-Q4`, months: [10, 11, 12] },
        ];

        quarters.forEach((q) => {
          const monthsData = periodData.filter((item) =>
            q.months.includes(item.month),
          );
          monthlyData.push({
            period: q.period,
            base: monthsData.reduce((sum, item) => sum + item.base, 0),
            qte: monthsData.reduce((sum, item) => sum + item.qte, 0),
            worst: monthsData.reduce((sum, item) => sum + item.worst, 0),
            best: monthsData.reduce((sum, item) => sum + item.best, 0),
            hasData: monthsData.some((item) => item.hasData),
          });
        });
      } else if (granularity === "semester") {
        monthlyData = [];
        const semesters = [
          { period: `${targetYear}-S1`, months: [1, 2, 3, 4, 5, 6] },
          { period: `${targetYear}-S2`, months: [7, 8, 9, 10, 11, 12] },
        ];

        semesters.forEach((s) => {
          const monthsData = periodData.filter((item) =>
            s.months.includes(item.month),
          );
          monthlyData.push({
            period: s.period,
            base: monthsData.reduce((sum, item) => sum + item.base, 0),
            qte: monthsData.reduce((sum, item) => sum + item.qte, 0),
            worst: monthsData.reduce((sum, item) => sum + item.worst, 0),
            best: monthsData.reduce((sum, item) => sum + item.best, 0),
            hasData: monthsData.some((item) => item.hasData),
          });
        });
      } else if (granularity === "annual") {
        monthlyData = [
          {
            period: `${targetYear}`,
            base: annualTarget,
            qte:
              scenarioType === "worst"
                ? annualTargetWorst
                : scenarioType === "best"
                  ? annualTargetBest
                  : annualTarget,
            worst: annualTargetWorst,
            best: annualTargetBest,
            hasData: monthsWithData.length > 0,
          },
        ];
      } else {
        // monthly par défaut
        monthlyData = periodData;
      }

      // Calculer la fiabilité
      const reliabilityScore = calculateReliabilityScore(
        annualBase,
        annualRMSE,
        monthsWithData.length,
      );

      return {
        canPredict: true,
        scenario: scenarioType,
        granularity: granularity,
        annual: {
          base: annualBase,
          worst: annualWorst,
          best: annualBest,
          selected:
            scenarioType === "worst"
              ? annualWorst
              : scenarioType === "best"
                ? annualBest
                : annualBase,
        },
        rmse: annualRMSE,
        monthlyData: monthlyData,
        seasonalCoefficients: monthlyAverages,
        monthlyDetails: granularity === "monthly" ? periodData : undefined,
        reliability: reliabilityScore,
        dataQuality: {
          years: uniqueYears.length,
          months: totalMonths,
          monthsWithData: monthsWithData.length,
        },
      };
    };

    // 6. Calculer les prédictions pour chaque produit
    const predictions = allProducts.map((product) => {
      const code = product.code_article;
      const salesData = salesByProduct.get(code) || [];
      const stock = stockByProduct.get(code) || 0;

      // CORRECTION ICI: Utiliser productsobjs au lieu de prod_objets
      const objective =
        product.productsobjs && product.productsobjs.length > 0
          ? product.productsobjs[0]
          : null;

      // Structure de base du produit
      const basePrediction = {
        id: product.id,
        code_article: code,
        name: product.name,
        bu: product.products_zones[0]?.zone || 0,
        gamme: product.prod_categorie?.nom || "",
        predictionYear: predictionYear,
        canPredict: false,
        currentStock: stock,
        objective: objective
          ? {
              year: objective.annee,
              targetUnits: parseFloat(objective.objUnit) || 0,
              targetCA: parseFloat(objective.objCa) || 0,
              price: parseFloat(objective.prix) || 0,
            }
          : null,
        stockAlert: stock < 100 ? "LOW" : stock < 500 ? "MEDIUM" : "HIGH",
      };

      // Tenter de calculer la prédiction
      const result = calculateHybridPrediction(
        salesData,
        predictionYear,
        scenario,
      );

      if (result.canPredict) {
        // Calculer la couverture de stock
        const stockCoverage =
          result.annual.selected > 0
            ? Math.round((stock / (result.annual.selected / 12)) * 10) / 10
            : 0;

        // Calculer le taux d'atteinte des objectifs
        const achievementRate =
          objective && objective.objUnit > 0
            ? Math.round((result.annual.selected / objective.objUnit) * 100)
            : 0;

        return {
          ...basePrediction,
          ...result,
          stockCoverage,
          achievementRate,
        };
      } else {
        // Retourner les informations sur les données insuffisantes
        return {
          ...basePrediction,
          canPredict: false,
          error: result.error || "Données insuffisantes",
          errorType: result.errorType || "UNKNOWN_ERROR",
          errorDetails: result.details || "Raison inconnue",
          dataQuality: result.dataQuality || {
            years: 0,
            months: 0,
            monthsWithData: 0,
          },
        };
      }
    });

    const validPredictions = predictions.filter((p) => p.canPredict);

    // 7. Statistiques globales
    const totalStock = predictions.reduce((sum, p) => sum + p.currentStock, 0);
    const totalObjective = predictions.reduce(
      (sum, p) => sum + (p.objective?.targetUnits || 0),
      0,
    );
    const totalPrediction = validPredictions.reduce(
      (sum, p) => sum + (p.annual?.selected || 0),
      0,
    );

    // Calculer les moyennes de fiabilité
    const avgReliability =
      validPredictions.length > 0
        ? validPredictions.reduce((sum, p) => sum + (p.reliability || 0), 0) /
          validPredictions.length
        : 0;

    // Calculer la couverture moyenne de stock uniquement pour les prédictions valides
    const avgStockCoverage =
      validPredictions.length > 0
        ? validPredictions.reduce((sum, p) => sum + (p.stockCoverage || 0), 0) /
          validPredictions.length
        : 0;

    res.status(200).json({
      success: true,
      predictionYear: predictionYear,
      scenario: scenario,
      granularity: granularity,
      historicalPeriod: {
        start: startHistoryYear,
        end: endHistoryYear,
      },
      statistics: {
        total: predictions.length,
        canPredict: validPredictions.length,
        insufficientData: predictions.filter((p) => !p.canPredict).length,
        // Statistiques de stock
        stock: {
          totalStock: totalStock,
          lowStock: predictions.filter((p) => p.stockAlert === "LOW").length,
          mediumStock: predictions.filter((p) => p.stockAlert === "MEDIUM")
            .length,
          highStock: predictions.filter((p) => p.stockAlert === "HIGH").length,
          averageStockCoverage: Math.round(avgStockCoverage * 10) / 10,
        },
        // Statistiques d'objectifs
        objectives: {
          totalTarget: totalObjective,
          averageAchievementRate:
            validPredictions.length > 0
              ? Math.round(
                  validPredictions.reduce(
                    (sum, p) => sum + (p.achievementRate || 0),
                    0,
                  ) / validPredictions.length,
                )
              : 0,
          productsWithObjectives: predictions.filter((p) => p.objective).length,
        },
        // Statistiques de qualité
        quality: {
          averageReliability: Math.round(avgReliability),
          highReliability: validPredictions.filter(
            (p) => (p.reliability || 0) >= 75,
          ).length,
          mediumReliability: validPredictions.filter(
            (p) => (p.reliability || 0) >= 50 && (p.reliability || 0) < 75,
          ).length,
          lowReliability: validPredictions.filter(
            (p) => (p.reliability || 0) < 50,
          ).length,
        },
      },
      predictions: predictions,
    });
  } catch (error) {
    console.error("Monthly prediction error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: "SERVER_ERROR",
    });
  }
});

router.post("/getProdCaALL", validator, async (req, res) => {
  const { de, a, gamme_id, bu } = req.body;
  const year = new Date(de).getFullYear();

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
          where: { annee: year },
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
            year: year,
            ...(bu != 0 && { zone: bu }),
          },
        },
      ],
      order: [["id", "ASC"]],
    });

    // Récupérer le CA par produit et par année

    const caProd = await sequelize.query(
      "SELECT sum(ttc) as ca, sum(qte) as qte, art, year(date) as year FROM ca_tot_vente WHERE year(date) >= 2019 GROUP BY art, year(date)",
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    // Créer une Map avec clé composée: "code_article-année"
    const listPrdCaMap = new Map();
    caProd.forEach((item) => {
      const key = `${item.art}-${item.year}`;
      listPrdCaMap.set(key, item);
    });

    // Obtenir toutes les années disponibles
    const years = [...new Set(caProd.map((item) => item.year))].sort();

    const combinedData = allProspects.map((gro) => {
      // Construire l'objet avec CA et qte par année
      const caByYear = {};
      const qteByYear = {};

      years.forEach((yr) => {
        const key = `${gro.code_article}-${yr}`;
        const caPrd = listPrdCaMap.get(key);
        caByYear[yr] = caPrd ? caPrd.ca : 0;
        qteByYear[yr] = caPrd ? caPrd.qte : 0;
      });

      // CA et qte pour l'année sélectionnée
      const currentYearKey = `${gro.code_article}-${year}`;
      const currentYearData = listPrdCaMap.get(currentYearKey);

      return {
        id: gro.id,
        code_article: gro.code_article,
        name: gro.name,
        prix: gro.prix,
        bu: gro.products_zones[0] ? gro.products_zones[0].zone : 0,
        gamme: gro.prod_categorie.nom,
        objUnit: gro.productsobjs[0] ? gro.productsobjs[0].objUnit : 0,
        objCa: gro.productsobjs[0] ? gro.productsobjs[0].objCa : 0,
        // CA et quantité pour l'année courante
        ca: currentYearData ? currentYearData.ca : 0,
        qte: currentYearData ? currentYearData.qte : 0,
        // CA et quantité par année
        caByYear: caByYear,
        qteByYear: qteByYear,
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProdCaCL", validator, async (req, res) => {
  const { de, a, gamme_id, bu } = req.body;
  const year = new Date(de).getFullYear();

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
          model: ProdZone,
          required: true,
          attributes: ["zone"],
          // Matches the alias in the association
          where: {
            year: year,
            ...(bu != 0 && { zone: bu }), // Filter by zone if bu is provided
          },
        },
      ],
      order: [["id", "ASC"]],
    });

    const caProd = await sequelize.query(
      "SELECT  sum(ttc) as ca,sum(qte) as qte ,art  FROM ca_tot_vente where date>=:de and date<=:a   group by art ",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const listPrdCaMap = new Map();
    caProd.forEach((item) => {
      listPrdCaMap.set(item.art, item);
    });

    const combinedData = allProspects.map((gro) => {
      const caPrd = listPrdCaMap.get(gro.code_article);
      if (gro) {
        // If prospect exists, combine the data
        return {
          id: gro.id,
          code_article: gro.code_article,
          name: gro.name,
          prix: gro.prix,
          bu: gro.products_zones[0] ? gro.products_zones[0].zone : 0,
          gamme: gro.prod_categorie.nom,
          objUnit: gro.productsobjs[0] ? gro.productsobjs[0].objUnit : 0,
          objCa: gro.productsobjs[0] ? gro.productsobjs[0].objCa : 0,
          ca: caPrd ? caPrd.ca : 0, // Use caPrd if it exists, otherwise default to 0
          qte: caPrd ? caPrd.qte : 0, // Use caPrd if it exists, otherwise default to 0
        };
      } else {
        // If prospect doesn't exist, keep caGro data and set others to null
        return {
          id: null,
          code_article: null,
          name: null,
          bu: null,
          prix: null,
          gamme: null,
          objUnit: 0,
          objCa: 0,
          ca: caPrd ? caPrd.ca : 0,
          qte: caPrd ? caPrd.qte : 0,
        };
      }
    });
    //console.log(combinedData)
    res.status(200).json(combinedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getPredictionProductsMonthlyCA", validator, async (req, res) => {
  const {
    gamme_id,
    bu = 0,
    aire_id = null,
    scenario = "base",
    granularity = "monthly",
    product_id = null,
  } = req.body;

  const currentYear      = new Date().getFullYear();
  const predictionYear   = currentYear;
  const endHistoryYear   = currentYear - 1;
  const startHistoryYear = currentYear - 6;

  const whereCondition = {};
  if (product_id !== null && product_id) {
    whereCondition.id = product_id;
  } else {
    if (gamme_id !== null && gamme_id) {
      whereCondition.gamme_id = gamme_id;
    }
    if (aire_id !== null && aire_id) {
      whereCondition.aire = aire_id;
    }
  }

  // ─── Prediction engine (CA) ────────────────────────────────────────────────
  const calculateHybridPrediction = (monthlySales, targetYear, scenarioType) => {

    if (!monthlySales || !Array.isArray(monthlySales)) {
      return { canPredict: false, error: "Aucune donnée historique disponible", errorType: "NO_DATA", details: "Données historiques manquantes" };
    }
    if (monthlySales.length === 0) {
      return { canPredict: false, error: "Aucune vente historique enregistrée", errorType: "NO_SALES_DATA", details: "Le produit n'a aucune vente historique" };
    }

    const uniqueYears = [...new Set(monthlySales.map((s) => s.year))];
    if (uniqueYears.length < 2) {
      return { canPredict: false, error: "Données historiques insuffisantes", errorType: "INSUFFICIENT_HISTORY", details: `Seulement ${uniqueYears.length} année(s) de données (minimum 2 années requises)`, dataYears: uniqueYears };
    }

    const totalMonths    = monthlySales.length;
    const minDataPoints  = Math.max(2, uniqueYears.length) * 6;
    if (totalMonths < minDataPoints) {
      return { canPredict: false, error: "Données mensuelles insuffisantes", errorType: "INSUFFICIENT_MONTHLY_DATA", details: `${totalMonths} mois disponibles (minimum ${minDataPoints} mois requis)`, dataMonths: totalMonths, requiredMonths: minDataPoints };
    }

    // A. Annual regression — using CA
    const yearsData = {};
    monthlySales.forEach((sale) => {
      if (!yearsData[sale.year]) yearsData[sale.year] = 0;
      yearsData[sale.year] += sale.ca;  // 👈 CA
    });

    const years      = Object.keys(yearsData).map((y) => parseInt(y)).sort();
    const quantities = years.map((y) => yearsData[y]);

    if (years.length < 2) {
      return { canPredict: false, error: "Données annuelles insuffisantes pour la régression", errorType: "INSUFFICIENT_YEARS_FOR_REGRESSION", details: `${years.length} année(s) seulement` };
    }

    const n     = years.length;
    const sumX  = years.reduce((a, b) => a + b, 0);
    const sumY  = quantities.reduce((a, b) => a + b, 0);
    const sumXY = years.reduce((sum, year, i) => sum + year * quantities[i], 0);
    const sumX2 = years.reduce((sum, year) => sum + year * year, 0);

    const slope      = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept  = (sumY - slope * sumX) / n;
    const annualBase = Math.max(0, Math.round(slope * targetYear + intercept));

    // B. RMSE jackknife
    let rmseSum = 0, count = 0;
    for (let i = 0; i < years.length; i++) {
      const otherYears = years.filter((_, idx) => idx !== i);
      const otherQtys  = quantities.filter((_, idx) => idx !== i);
      const n2  = otherYears.length;
      const sX  = otherYears.reduce((a, b) => a + b, 0);
      const sY  = otherQtys.reduce((a, b) => a + b, 0);
      const sXY = otherYears.reduce((sum, y, idx) => sum + y * otherQtys[idx], 0);
      const sX2 = otherYears.reduce((sum, y) => sum + y * y, 0);
      const s2       = (n2 * sXY - sX * sY) / (n2 * sX2 - sX * sX);
      const i2       = (sY - s2 * sX) / n2;
      const forecast = Math.max(0, Math.round(s2 * years[i] + i2));
      rmseSum += Math.pow(quantities[i] - forecast, 2);
      count++;
    }

    const annualRMSE  = count > 0 ? Math.round(Math.sqrt(rmseSum / count)) : 0;
    const annualWorst = Math.max(0, annualBase - annualRMSE);
    const annualBest  = annualBase + annualRMSE;

    // C. Seasonality — using CA
    const monthlyGroups = {};
    for (let m = 1; m <= 12; m++) monthlyGroups[m] = [];

    monthlySales.forEach((sale) => {
      if (sale.month >= 1 && sale.month <= 12) {
        monthlyGroups[sale.month].push(sale.ca);  // 👈 CA
      }
    });

    const monthlyAverages = {};
    const monthsWithData  = [];
    for (let m = 1; m <= 12; m++) {
      const data = monthlyGroups[m];
      if (data.length > 0) {
        monthlyAverages[m] = data.reduce((s, v) => s + v, 0) / data.length;
        monthsWithData.push(m);
      } else {
        monthlyAverages[m] = 0;
      }
    }

    if (monthsWithData.length < 6) {
      return { canPredict: false, error: "Saisonnalité incomplète", errorType: "INCOMPLETE_SEASONALITY", details: `Données pour seulement ${monthsWithData.length} mois sur 12`, availableMonths: monthsWithData.length };
    }

    // Monthly RMSE — using CA
    const monthlyErrors = {};
    for (let m = 1; m <= 12; m++) {
      const monthSales = monthlySales.filter((s) => s.month === m);
      if (monthSales.length > 0) {
        const avg = monthlyAverages[m];
        const sq  = monthSales.map((s) => Math.pow(s.ca - avg, 2));  // 👈 CA
        monthlyErrors[m] = Math.round(Math.sqrt(sq.reduce((a, b) => a + b, 0) / sq.length));
      } else {
        monthlyErrors[m] = 0;
      }
    }

    const totalBaseMonthly  = monthsWithData.reduce((s, m) => s + monthlyAverages[m], 0);
    const totalRmsemonthly  = monthsWithData.reduce((s, m) => s + monthlyErrors[m], 0);
    const totalWorstMonthly = monthsWithData.reduce((s, m) => s + Math.max(0, monthlyAverages[m] - monthlyErrors[m]), 0);
    const totalBestMonthly  = monthsWithData.reduce((s, m) => s + (monthlyAverages[m] + monthlyErrors[m]), 0);

    // D. Scenario targets
    let annualTarget, annualTargetWorst, annualTargetBest;
    switch (scenarioType) {
      case "worst": annualTarget = annualWorst; annualTargetWorst = annualWorst; annualTargetBest = annualWorst; break;
      case "best":  annualTarget = annualBest;  annualTargetWorst = annualBest;  annualTargetBest = annualBest;  break;
      default:      annualTarget = annualBase;  annualTargetWorst = annualWorst; annualTargetBest = annualBest;
    }

    // E. Hybrid monthly predictions
    let hybridPredictions = {}, hybridRMSE = {}, hybridWorst = {}, hybridBest = {};
    for (let m = 1; m <= 12; m++) {
      const avg  = monthlyAverages[m];
      const rmse = monthlyErrors[m];
      if (avg === 0 || !monthsWithData.includes(m)) {
        hybridPredictions[m] = hybridRMSE[m] = hybridWorst[m] = hybridBest[m] = 0;
      } else {
        hybridPredictions[m] = Math.round((avg / totalBaseMonthly) * annualTarget);
        hybridRMSE[m]        = Math.round(totalRmsemonthly > 0 ? (rmse / totalRmsemonthly) * annualRMSE : 0);
        hybridWorst[m]       = Math.round(totalWorstMonthly > 0 ? (Math.max(0, avg - rmse) / totalWorstMonthly) * annualTargetWorst : Math.max(0, hybridPredictions[m] - hybridRMSE[m]));
        hybridBest[m]        = Math.round(totalBestMonthly  > 0 ? ((avg + rmse) / totalBestMonthly) * annualTargetBest : hybridPredictions[m] + hybridRMSE[m]);
      }
    }

    const adjustToAnnualTotal = (vals, total) => {
      const cur = Object.values(vals).reduce((a, b) => a + b, 0);
      if (Math.abs(cur - total) > 0.01 && cur > 0) {
        const adj = total / cur;
        const out = {};
        for (let m = 1; m <= 12; m++) out[m] = Math.round(vals[m] * adj);
        return out;
      }
      return vals;
    };

    hybridPredictions = adjustToAnnualTotal(hybridPredictions, annualTarget);
    hybridWorst       = adjustToAnnualTotal(hybridWorst,       annualTargetWorst);
    hybridBest        = adjustToAnnualTotal(hybridBest,        annualTargetBest);

    // F. Build period data — "qte" field now holds CA values (same key, same shape)
    const periodData = [];
    for (let m = 1; m <= 12; m++) {
      periodData.push({
        period:  `${targetYear}-${String(m).padStart(2, "0")}`,
        month:   m,
        base:    hybridPredictions[m],
        qte:     scenarioType === "worst" ? hybridWorst[m] : scenarioType === "best" ? hybridBest[m] : hybridPredictions[m],  // 👈 same key as QTE endpoint
        rmse:    hybridRMSE[m],
        worst:   hybridWorst[m],
        best:    hybridBest[m],
        hasData: monthsWithData.includes(m),
      });
    }

    // G. Aggregation
    let monthlyData = [];
    if (granularity === "quarterly") {
      [
        { period: `${targetYear}-Q1`, months: [1, 2, 3]    },
        { period: `${targetYear}-Q2`, months: [4, 5, 6]    },
        { period: `${targetYear}-Q3`, months: [7, 8, 9]    },
        { period: `${targetYear}-Q4`, months: [10, 11, 12] },
      ].forEach((q) => {
        const d = periodData.filter((item) => q.months.includes(item.month));
        monthlyData.push({
          period:  q.period,
          base:    d.reduce((s, i) => s + i.base,  0),
          qte:     d.reduce((s, i) => s + i.qte,   0),
          worst:   d.reduce((s, i) => s + i.worst, 0),
          best:    d.reduce((s, i) => s + i.best,  0),
          hasData: d.some((i) => i.hasData),
        });
      });
    } else if (granularity === "semester") {
      [
        { period: `${targetYear}-S1`, months: [1, 2, 3, 4, 5, 6]    },
        { period: `${targetYear}-S2`, months: [7, 8, 9, 10, 11, 12] },
      ].forEach((s) => {
        const d = periodData.filter((item) => s.months.includes(item.month));
        monthlyData.push({
          period:  s.period,
          base:    d.reduce((sum, i) => sum + i.base,  0),
          qte:     d.reduce((sum, i) => sum + i.qte,   0),
          worst:   d.reduce((sum, i) => sum + i.worst, 0),
          best:    d.reduce((sum, i) => sum + i.best,  0),
          hasData: d.some((i) => i.hasData),
        });
      });
    } else if (granularity === "annual") {
      monthlyData = [{
        period:  `${targetYear}`,
        base:    annualTarget,
        qte:     scenarioType === "worst" ? annualTargetWorst : scenarioType === "best" ? annualTargetBest : annualTarget,
        worst:   annualTargetWorst,
        best:    annualTargetBest,
        hasData: monthsWithData.length > 0,
      }];
    } else {
      monthlyData = periodData;
    }

    // H. Reliability
    const varianceRatio = annualBase > 0 ? (annualRMSE / annualBase) * 100 : 0;
    const varianceScore =
      varianceRatio < 10 ? 95 :
      varianceRatio < 20 ? 80 :
      varianceRatio < 30 ? 65 :
      varianceRatio < 40 ? 50 :
      varianceRatio < 50 ? 35 : 20;
    const reliability = Math.round(varianceScore * 0.7 + (monthsWithData.length / 12) * 100 * 0.3);

    return {
      canPredict: true,
      scenario:   scenarioType,
      granularity,
      annual: {
        base:     annualBase,
        worst:    annualWorst,
        best:     annualBest,
        selected: scenarioType === "worst" ? annualTargetWorst : scenarioType === "best" ? annualTargetBest : annualTarget,
      },
      rmse:                annualRMSE,
      monthlyData,
      seasonalCoefficients: monthlyAverages,
      monthlyDetails:      granularity === "monthly" ? periodData : undefined,
      reliability,
      dataQuality: {
        years:          uniqueYears.length,
        months:         totalMonths,
        monthsWithData: monthsWithData.length,
      },
    };
  };

  try {
    // 1. Produits
    const allProducts = await Products.findAll({
      where: whereCondition,
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

    // 2. Historique mensuel — on a besoin des deux (qte + ca) dans la query
    const salesHistory = await sequelize.query(
      `SELECT 
        art,
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(qte) as qte,
        SUM(ttc) as ca
      FROM ca_tot_vente 
      WHERE YEAR(date) BETWEEN ${startHistoryYear} AND ${endHistoryYear}
      GROUP BY art, YEAR(date), MONTH(date)
      ORDER BY art, year, month`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 3. Stock
    const artStock = await sequelize.query(
      `SELECT art as art_code, SUM(qte) as stock_qte FROM ca_tot_vente GROUP BY art_code`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 4. Maps
    const salesByProduct = new Map();
    salesHistory.forEach((item) => {
      if (!salesByProduct.has(item.art)) salesByProduct.set(item.art, []);
      salesByProduct.get(item.art).push({
        year:  item.year,
        month: item.month,
        qte:   parseFloat(item.qte) || 0,
        ca:    parseFloat(item.ca)  || 0,  // both available, engine uses .ca
      });
    });

    const stockByProduct = new Map();
    artStock.forEach((item) => {
      stockByProduct.set(item.art_code, parseFloat(item.stock_qte) || 0);
    });

    // 5. Prédictions CA
    const predictions = allProducts.map((product) => {
      const code      = product.code_article;
      const salesData = salesByProduct.get(code) || [];
      const stock     = stockByProduct.get(code)  || 0;

      const objective =
        product.productsobjs && product.productsobjs.length > 0
          ? product.productsobjs[0]
          : null;

      const basePrediction = {
        id:             product.id,
        code_article:   code,
        name:           product.name,
        bu:             product.products_zones[0]?.zone || 0,
        gamme:          product.prod_categorie?.nom     || "",
        predictionYear: predictionYear,
        canPredict:     false,
        currentStock:   stock,
        objective: objective
          ? {
              year:        objective.annee,
              targetUnits: parseFloat(objective.objUnit) || 0,
              targetCA:    parseFloat(objective.objCa)   || 0,
              price:       parseFloat(objective.prix)    || 0,
            }
          : null,
        stockAlert: stock < 100 ? "LOW" : stock < 500 ? "MEDIUM" : "HIGH",
      };

      const result = calculateHybridPrediction(salesData, predictionYear, scenario);

      if (result.canPredict) {
        // Stock coverage vs CA prediction
        const stockCoverage =
          result.annual.selected > 0
            ? Math.round((stock / (result.annual.selected / 12)) * 10) / 10
            : 0;

        // Achievement rate vs CA objective
        const achievementRate =
          objective && objective.objCa > 0          // 👈 objCa not objUnit
            ? Math.round((result.annual.selected / parseFloat(objective.objCa)) * 100)
            : 0;

        return { ...basePrediction, ...result, stockCoverage, achievementRate };
      } else {
        return {
          ...basePrediction,
          canPredict:   false,
          error:        result.error       || "Données insuffisantes",
          errorType:    result.errorType   || "UNKNOWN_ERROR",
          errorDetails: result.details     || "Raison inconnue",
          dataQuality:  result.dataQuality || { years: 0, months: 0, monthsWithData: 0 },
        };
      }
    });

    const validPredictions = predictions.filter((p) => p.canPredict);

    // 6. Statistiques
    const totalStock       = predictions.reduce((sum, p) => sum + p.currentStock, 0);
    const totalObjectiveCA = predictions.reduce((sum, p) => sum + (p.objective?.targetCA || 0), 0);
    const totalPredictionCA = validPredictions.reduce((sum, p) => sum + (p.annual?.selected || 0), 0);
    const avgReliability   = validPredictions.length > 0
      ? validPredictions.reduce((sum, p) => sum + (p.reliability || 0), 0) / validPredictions.length : 0;
    const avgStockCoverage = validPredictions.length > 0
      ? validPredictions.reduce((sum, p) => sum + (p.stockCoverage || 0), 0) / validPredictions.length : 0;

    res.status(200).json({
      success:        true,
      predictionYear: predictionYear,
      scenario:       scenario,
      granularity:    granularity,
      metric:         "ca",   // 👈 so the frontend knows which endpoint it called
      historicalPeriod: { start: startHistoryYear, end: endHistoryYear },
      statistics: {
        total:            predictions.length,
        canPredict:       validPredictions.length,
        insufficientData: predictions.filter((p) => !p.canPredict).length,
        stock: {
          totalStock,
          lowStock:             predictions.filter((p) => p.stockAlert === "LOW").length,
          mediumStock:          predictions.filter((p) => p.stockAlert === "MEDIUM").length,
          highStock:            predictions.filter((p) => p.stockAlert === "HIGH").length,
          averageStockCoverage: Math.round(avgStockCoverage * 10) / 10,
        },
        objectives: {
          totalTargetCA:    totalObjectiveCA,
          totalPredictionCA: totalPredictionCA,
          averageAchievementRate: validPredictions.length > 0
            ? Math.round(validPredictions.reduce((sum, p) => sum + (p.achievementRate || 0), 0) / validPredictions.length)
            : 0,
          productsWithObjectives: predictions.filter((p) => p.objective).length,
        },
        quality: {
          averageReliability: Math.round(avgReliability),
          highReliability:    validPredictions.filter((p) => (p.reliability || 0) >= 75).length,
          mediumReliability:  validPredictions.filter((p) => (p.reliability || 0) >= 50 && (p.reliability || 0) < 75).length,
          lowReliability:     validPredictions.filter((p) => (p.reliability || 0) <  50).length,
        },
      },
      predictions,
    });

  } catch (error) {
    console.error("Monthly CA prediction error:", error);
    res.status(500).json({ success: false, error: error.message, errorType: "SERVER_ERROR" });
  }
});
router.post("/getCaZone", validator, async (req, res) => {
  const de = req.body.selectedDate1;
  const a = req.body.selectedDate2;
  const year = new Date(de).getFullYear();
  let caEcomm = [];
 
  try {

    /*liste des article derma* */
    const listDerma = await sequelize.query(
      "SELECT products.code_article as code_article FROM products,products_zone WHERE products.id=products_zone.id_prd and products_zone.zone in (10,11) and products_zone.year=:year ",
      { replacements: { year }, type: Sequelize.QueryTypes.SELECT },
    );
    const listDermaCodes = listDerma
      .map((item) => item.code_article)
      .filter((code) => code != null);
/**ca grossiste sans produits derma group by clien */
    const caGro = await sequelize.query(
      "SELECT  sum(ttc) as ca,cl FROM ca_tot_vente where date>=:de and date<=:a and fam='Grossistes' and art not in (:listDermaCodes) group by cl ",
      {
        replacements: { de, a, listDermaCodes },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    /**ca grossiste produits derma */
    const caGroDerma = await sequelize.query(
      "SELECT  sum(ttc) as ca,cl FROM ca_tot_vente where date>=:de and date<=:a and fam='Grossistes' and art in (:listDermaCodes) group by cl ",
      {
        replacements: { de, a, listDermaCodes },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    /**ca grossiste produits derma */
   
    

    /**liste des grossiste */
    const listGro = await sequelize.query(
      "SELECT  prospect.id as id,prospect.nom as nom ,prenom,idFact,nord_ratio,centre_ratio,sud_ratio,gouvernorat,gouvernerat.zone FROM prospect,gouvernerat where gouvernerat.id=gouvernorat and  spec in (37,38) and public=1 ",
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    /**liste cl E-commerce */
    const listEcomm = await sequelize.query(
      "SELECT  prospect.id as id,prospect.nom as nom ,prenom,idFact,nord_ratio,centre_ratio,sud_ratio,gouvernorat,gouvernerat.zone FROM prospect,gouvernerat where gouvernerat.id=gouvernorat and  spec in (62) and public=1 ",
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const clientCodesEcomm = listEcomm
      .map((item) => item.idFact)
      .filter((code) => code != null);
/**ca pharmacie sans produits derma group by secteur */
    const caPh = await sequelize.query(
      " SELECT sum(ttc) as ca,gouvernerat.zone FROM `ca_tot_vente`,gouvernerat WHERE art not in (:listDermaCodes) and fam='Pharmacies' and cl!='411200' and gouvernerat.nom=ca_tot_vente.zone and  date>=:de and date<=:a group by gouvernerat.zone",
      {
        replacements: { de, a, listDermaCodes },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    /**ca pharmacie produits derma group by secteur */
    const caPhDermac1 = await sequelize.query(
      " SELECT sum(ttc) as ca FROM `ca_tot_vente`,gouvernerat WHERE art in (:listDermaCodes) and fam='Pharmacies' and cl!='411200' and gouvernerat.nom=ca_tot_vente.zone and gouvernerat.zone=3 and gouvernerat.nom  in ('BEN AROUS','NABEUL','NABEUL 3','SILIANA','ZAGHOUAN','KAIROUAN','MAHDIA','MONASTIR','SOUSSE 1','MONASTIR 1','BEN AROUS 3','SOUSSE 2C','SOUSSE 4','MONASTIR 2','MAHDIA PERI','NABEUL 2','BEN AROUS 4','BEN AROUS 1','BEN AROUS 2','NABEUL 1','SOUSSE 3','SOUSSE 2B','ZAGHOUAN PERI','KAIROUAN PERI','SOUSSE 2A','SILIANA PERI') and  date>=:de and date<=:a ",
      {
        replacements: { de, a, listDermaCodes },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
   
     const caPhDermac2 = await sequelize.query(
      " SELECT sum(ttc) as ca FROM `ca_tot_vente`,gouvernerat WHERE art in (:listDermaCodes) and fam='Pharmacies' and cl!='411200' and gouvernerat.nom=ca_tot_vente.zone and  gouvernerat.zone=3 and gouvernerat.nom  not in ('BEN AROUS','NABEUL','NABEUL 3','SILIANA','ZAGHOUAN','KAIROUAN','MAHDIA','MONASTIR','SOUSSE 1','MONASTIR 1','BEN AROUS 3','SOUSSE 2C','SOUSSE 4','MONASTIR 2','MAHDIA PERI','NABEUL 2','BEN AROUS 4','BEN AROUS 1','BEN AROUS 2','NABEUL 1','SOUSSE 3','SOUSSE 2B','ZAGHOUAN PERI','KAIROUAN PERI','SOUSSE 2A','SILIANA PERI') and  date>=:de and date<=:a ",
      {
        replacements: { de, a, listDermaCodes },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
     

     /**ca pharmacie produits derma group by secteur  centre 1*/
    const caPhDerma = await sequelize.query(
      " SELECT sum(ttc) as ca,gouvernerat.zone FROM `ca_tot_vente`,gouvernerat WHERE art in (:listDermaCodes) and fam='Pharmacies' and cl!='411200' and gouvernerat.nom=ca_tot_vente.zone and  date>=:de and date<=:a group by gouvernerat.zone",
      {
        replacements: { de, a, listDermaCodes },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    /**ca forticare sans produits derma group by secteur */
    const caForti = await sequelize.query(
      " SELECT sum(ttc) as ca,dlg as dlg FROM `ca_tot_vente` WHERE  cl='411200' and   date>=:de and date<=:a group by dlg",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    /**ca parapharmacie sans produits derma group by secteur */
    const caPPH = await sequelize.query(
      " SELECT sum(ttc) as ca,gouvernerat.zone FROM `ca_tot_vente`,gouvernerat WHERE fam='Para Pharmacie' and cl NOT IN (:clientCodes)  and  gouvernerat.nom=ca_tot_vente.zone and  date>=:de and date<=:a group by gouvernerat.zone",
      {
        replacements: { de, a, clientCodes: clientCodesEcomm },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    if (clientCodesEcomm.length === 0) {
      // Handle empty list case
      caEcomm = [];
    } else {
      // Use the list in the second query
      caEcomm = await sequelize.query(
        "SELECT SUM(ttc) as ca, gouvernerat.zone FROM `ca_tot_vente`, gouvernerat WHERE fam='Para Pharmacie' AND gouvernerat.nom=ca_tot_vente.zone AND date>=:de AND date<=:a AND cl IN (:clientCodes) GROUP BY gouvernerat.zone",
        {
          replacements: {
            de,
            a,
            clientCodes: clientCodesEcomm,
          },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
    }

    if (listDermaCodes.length === 0) {
      // Handle empty list case
      caDerma = [];
    } else {
      // Use the list in the second query
      caDerma = await sequelize.query(
        "SELECT SUM(ttc) as ca, gouvernerat.zone FROM `ca_tot_vente`, gouvernerat WHERE  gouvernerat.nom=ca_tot_vente.zone AND date>=:de AND date<=:a AND art IN (:listDermaCodes) GROUP BY gouvernerat.zone",
        {
          replacements: {
            de,
            a,
            listDermaCodes: listDermaCodes,
          },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
    }
    const ObjGro = await sequelize.query(
      "SELECT  sum(bu1+bu2) as nb,idFact as cl FROM obj_gro_bu,prospect where prospect.id=obj_gro_bu.id_gro and prospect.public=1 and  year=:year   group by idFact ",
      {
        replacements: { year },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const ObjGroDerma = await sequelize.query(
      "SELECT  sum(bu3+bu4) as nb,idFact as cl FROM obj_gro_bu,prospect where prospect.id=obj_gro_bu.id_gro and prospect.public=1 and  year=:year   group by idFact ",
      {
        replacements: { year },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const ObjPh = await sequelize.query(
      "SELECT phar as obj,zone FROM `objectifzone` where annee=:year ",
      {
        replacements: { year },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const RatGroSect = await sequelize.query(
      "SELECT sum(valeur) as rat,prospect.id as id ,prospect.IdFact as cl,gouvernerat.zone FROM `rat_cl_sect`,prospect,gouvernerat WHERE prospect.id=id_cl and gouvernerat.id=secteur GROUP by gouvernerat.zone,prospect.id,prospect.IdFact ORDER by prospect.id; ",
      {
        replacements: { year },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const listGroMap = new Map();
    listGro.forEach((item) => {
      listGroMap.set(item.idFact, item);
    });
    const listGroCaMap = new Map();
    caGro.forEach((item) => {
      listGroCaMap.set(item.cl, item);
    });
    const listGroDermaCaMap = new Map();
    caGroDerma.forEach((item) => {
      listGroDermaCaMap.set(item.cl, item);
    });

    const objGroMap = new Map();
    ObjGro.forEach((item) => {
      objGroMap.set(item.cl, item);
    });
    const objGroDermaMap = new Map();
    ObjGroDerma.forEach((item) => {
      objGroDermaMap.set(item.cl, item);
    });
    const ratByProspect = RatGroSect.reduce((acc, item) => {
      if (!acc[item.cl]) {
        acc[item.cl] = {};
      }
      // Map zone numbers to your ratio fields
      if (item.zone === 1) acc[item.cl].nord_ratio = parseFloat(item.rat);
      if (item.zone === 2) acc[item.cl].sud_ratio = parseFloat(item.rat);
      if (item.zone === 3) acc[item.cl].centre_ratio = parseFloat(item.rat);
      return acc;
    }, {});

    const combinedData = listGro.map((gro) => {
      //const prospect = listGroMap.get(gro.cl);
      const caGro = listGroCaMap.get(gro.idFact);

      const obj = objGroMap.get(gro.idFact);
      const ratData = ratByProspect[gro.idFact] || {};
      if (gro) {
        // If prospect exists, combine the data
        return {
          id: gro.id,
          nom: gro.nom,
          prenom: gro.prenom,
          idFact: gro.idFact,

          nord_sect_ratio:
            ratData.nord_ratio !== undefined
              ? ratData.nord_ratio
              : gro.nord_ratio,
          centre_sect_ratio:
            ratData.centre_ratio !== undefined
              ? ratData.centre_ratio
              : gro.centre_ratio,
          sud_sect_ratio:
            ratData.sud_ratio !== undefined ? ratData.sud_ratio : gro.sud_ratio,
          nord_ratio: gro.nord_ratio,
          centre_ratio: gro.centre_ratio,
          sud_ratio: gro.sud_ratio,
          gouvernorat: gro.gouvernorat,
          zone: gro.zone,
          obj: obj ? obj.nb : 0, // Use objGro if it exists, otherwise default to 0
          ca: caGro ? caGro.ca : 0, // Use caGro if it exists, otherwise default to 0
          cl: gro.cl,
          caDerma: listGroDermaCaMap.get(gro.idFact)
            ? listGroDermaCaMap.get(gro.idFact).ca
            : 0,
          objDerma: objGroDermaMap.get(gro.idFact)
            ? objGroDermaMap.get(gro.idFact).nb
            : 0,
        };
      } else {
        // If prospect doesn't exist, keep caGro data and set others to null
        return {
          id: null,
          nom: null,
          prenom: null,
          idFact: null,
          nord_ratio: null,
          centre_ratio: null,
          sud_ratio: null,
          gouvernorat: null,
          zone: null,
          ca: caGro ? caGro.ca : 0,
          cl: caGro.cl,
          caDerma: listGroDermaCaMap.get(caGro.cl)
            ? listGroDermaCaMap.get(caGro.cl).ca
            : 0,
          objDerma: objGroDermaMap.get(caGro.cl)
            ? objGroDermaMap.get(caGro.cl).nb
            : 0,
        };
      }
    });

    /////////derma
    res.status(200).json({
      gro: combinedData, // first array
      ph: caPh,
      objPh: ObjPh,
      caPPH: caPPH, // second array
      caEcomm: caEcomm,
      caForti: caForti,
      caPhDerma: caPhDerma,
      caPhDermac1: caPhDermac1,
      caPhDermac2: caPhDermac2,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});

router.post("/getRatGroSect", validator, async (req, res) => {
  // console.log(de2 + " " + a2);
  try {
    const RatGroSect = await sequelize.query(
      "SELECT valeur as rat,id_cl,secteur,prospect.id as id ,prospect.IdFact as cl,gouvernerat.zone FROM `rat_cl_sect`,prospect,gouvernerat WHERE prospect.id=id_cl and gouvernerat.id=secteur  ORDER by prospect.id; ",
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    res.status(200).json(RatGroSect); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
/*****add ca zone  */
router.post("/getObjZoneMonth", validator, async (req, res) => {
  const { year } = req.body;
  try {
    const result = await sequelize.query(
      "SELECT month, zone, obj FROM obj_month WHERE year = :year",
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { year }   
      }
    );
    res.status(200).json(result);
   // console.log(result)
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
router.post("/getCaGroProd", validator, async (req, res) => {
  const de = req.body.de;
  const a = req.body.a;

  const listProd = req.body.listPrd;

  const year = new Date(de).getFullYear();

  try {
    let caGro = [];

    if (listProd?.length > 0) {
      caGro = await sequelize.query(
        "SELECT sum(ttc) as ca, cl, art FROM ca_tot_vente WHERE date>=:de AND date<=:a AND fam='Grossistes' AND art IN (:listProd) GROUP BY cl, art",
        {
          replacements: { de, a, listProd },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
    }

    res.status(200).json(
      caGro, // first array
      // second array
    );
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
router.post("/getCaPHProd", validator, async (req, res) => {
  const de = req.body.de;
  const a = req.body.a;

  const listProd = req.body.listPrd;

  const year = new Date(de).getFullYear();

  try {
    let caPh = [];

    if (listProd?.length > 0) {
      caPh = await sequelize.query(
        "SELECT sum(ttc) as ca, zone, art FROM ca_tot_vente WHERE date>=:de AND date<=:a AND fam='Pharmacies' AND art IN (:listProd) GROUP BY zone, art",
        {
          replacements: { de, a, listProd },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
    }

    res.status(200).json(
      caPh, // first array
      // second array
    );
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
router.post("/getCA", validator, async (req, res) => {
  const { de, a } = req.body;
  const year = new Date(de).getFullYear();
  try {
    const ca = await sequelize.query(
      "SELECT SUM(ttc) as TotCa FROM ca_tot_vente WHERE date>= :de AND date<= :a and ttc>0",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const obj = await sequelize.query(
      "SELECT SUM (objCa) as obj FROM productsobj WHERE annee=:year ",
      {
        replacements: { year },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const bl = await sequelize.query(
      "SELECT SUM (0) as TotCa FROM ca_tot_vente WHERE date>= :de AND date<= :a",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const avoir = await sequelize.query(
      "SELECT SUM( ttc) as TotAv FROM ca_tot_vente WHERE date>= :de AND date<= :a and ttc<0",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const avoirFi = await sequelize.query(
      "SELECT SUM(ttc) as TotAv  FROM ca_tot_vente WHERE date>= :de AND date<= :a and ttc=0",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const encVS = await sequelize.query(
      "SELECT SUM (0) as TotCa FROM ca_tot_vente WHERE date>= :de AND date<= :a",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    res.json({
      ca: ca[0].TotCa,
      bl: bl[0].TotCa,
      avoir: avoir[0].TotAv,
      avoirFi: avoirFi[0].TotAv,
      encVS: encVS[0].TotCa,
      obj: obj[0].obj,
    }); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
router.post("/getClientFactures", async (req, res) => {
  const { clientId, idFact, years = new Date().getFullYear() } = req.body;

  try {
    let query;
    let replacements;

    if (!idFact) {
      query = `
        SELECT * FROM FactureE 
        WHERE IDCRM = :clientId 
        AND YEAR(Date) = :years 
        ORDER BY Date ASC
      `;
      replacements = { clientId, years };
    } else {
      query = `
        SELECT * FROM FactureE 
        WHERE Client = :idFact 
        AND YEAR(Date) = :years 
        ORDER BY Date ASC
      `;
      replacements = { idFact, years };
    }

    let result = await sequelize2.query(query, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });

    // Fallback: if no results, try with idFact without year filter
    if (result.length === 0 && idFact) {
      result = await sequelize2.query(
        `SELECT * FROM FactureE WHERE Client = :idFact ORDER BY Date ASC`,
        {
          replacements: { idFact },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching factures:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
router.post("/getFactureDetail", async (req, res) => {
  const { numero } = req.body;
  try {
    const result = await sequelize2.query(
      `SELECT * FROM FactureD WHERE Numero = :numero`,
      {
        replacements: { numero },
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching facture detail:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
router.post("/getCADay", validator, async (req, res) => {
  const { de, a } = req.body;
  const deDate = new Date(de);
  const aDate = new Date(a);

  // Subtract one year
  deDate.setFullYear(deDate.getFullYear() - 1);
  aDate.setFullYear(aDate.getFullYear() - 1);

  // Format back to string if needed
  de2 = deDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  a2 = aDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

  try {
    const ca = await sequelize.query(
      "SELECT SUM(ttc) as ca, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM ca_tot_vente WHERE date>= :de AND date<= :a GROUP BY date ORDER BY date",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const ca2 = await sequelize.query(
      "SELECT SUM(ttc) as ca, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM ca_tot_vente WHERE date>= :de2 AND date<= :a2 GROUP BY date ORDER BY date",
      {
        replacements: { de2, a2 },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    res.json({
      ca,
      ca2,
    }); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
router.post("/getCADayFamille", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    const ca = await sequelize.query(
      "SELECT sum(ttc) as ca, fam FROM ca_tot_vente WHERE date>= :de AND date<= :a  group by fam ORDER BY ca DESC",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    res.json({
      ca,
    }); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});

router.post("/getRegDayFamille", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    const ca = await sequelize2.query(
      "SELECT  sum(mnt) as ca , fam FROM kb_reglement_cl_v where date>=:de and date<=:a group by fam ORDER BY ca DESC",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    res.json({
      ca,
    }); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});

router.post("/getcaDayArticle", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    const ca = await sequelize.query(
      "SELECT  sum(ttc) as ca , art FROM ca_tot_vente where date>=:de and date<=:a group by art ORDER BY ca DESC",
      {
        replacements: { de, a },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    res.json({
      ca,
    }); // Optionally send the result as a response
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send("Error executing query");
  }
});
router.post("/getProdCaCLGroDlg", validator, async (req, res) => {
  const { de, a, listGro, prodId, id, year } = req.body;

  try {
    const userBu = await UsersZone.findAll({
      where: {
        user: id,
        year: year,
      },
      attributes: ["bu"],
    });

    const buIds = userBu.map((ub) => ub.bu);

    let ca = [];
    let obj = [];

    if (listGro?.length > 0 && prodId?.length > 0) {
      [ca, obj] = await Promise.all([
        sequelize.query(
          "SELECT sum(ttc) as ca, cl FROM ca_tot_vente WHERE date>=:de AND date<=:a AND art IN (:prodId) AND cl IN (:listGro) GROUP BY cl",
          {
            replacements: { de, a, listGro, prodId },
            type: Sequelize.QueryTypes.SELECT,
          },
        ),
        sequelize.query(
          "SELECT prospect.IdFact, bu1, bu2, bu3, bu4 FROM `prospect`, obj_gro_bu WHERE obj_gro_bu.id_gro=prospect.id AND prospect.IdFact IN (:listGro) AND year=:year",
          {
            replacements: { listGro, year },
            type: Sequelize.QueryTypes.SELECT,
          },
        ),
      ]);
    }

    // Ensure ca and obj are arrays
    const caData = Array.isArray(ca) ? ca : [];
    const objData = Array.isArray(obj) ? obj : [];

    // Create maps for easier lookup
    const caMap = {};
    caData.forEach((item) => {
      caMap[item.cl] = parseFloat(item.ca || 0);
    });

    const objMap = {};
    objData.forEach((item) => {
      objMap[item.IdFact] = item;
    });

    // Get all unique groups from both ca and obj
    const allGroups = new Set([
      ...caData.map((item) => item.cl),
      ...objData.map((item) => item.IdFact),
    ]);

    // Combine data for all groups
    const combined = Array.from(allGroups).map((groupId) => {
      const caValue = caMap[groupId] || 0;
      const objItem = objMap[groupId];

      let totobj = 0;

      if (objItem) {
        // Calculate totobj based on buIds
        if (buIds.includes(8)) totobj += parseFloat(objItem.bu1 || 0);
        if (buIds.includes(9)) totobj += parseFloat(objItem.bu2 || 0);
        if (buIds.includes(10)) totobj += parseFloat(objItem.bu3 || 0);
        if (buIds.includes(11)) totobj += parseFloat(objItem.bu4 || 0);
      }

      return {
        cl: groupId,
        ca: caValue,
        totobj: totobj,
        ...(objItem || {}), // Include obj fields if they exist
      };
    });

    res.status(200).json(combined);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/*router.post("/getCaVdDlg", validator, async (req, res) => {
  const { de, a, prodId, id, year } = req.body;
  
  try {
    const cdeDlgUni = await DcrepCode.findOne({
      where: {
        id: id,
      },
      attributes: ["idUniges"],
    });
   
    let ca = [];
    let obj = [];
    
    if (cdeDlgUni && prodId?.length > 0) {
      const phDlg = await AffectationPh.findAll({
        where: {
          dlg: cdeDlgUni.idUniges,
          //year: year,
        },
        attributes: ["cl"],
      });
      
      const phIds = phDlg.map((ph) => ph.cl);
      
      if (phIds.length > 0) {
        [ca, obj] = await Promise.all([
          sequelize.query(
            "SELECT sum(ttc) as ca FROM ca_tot_vente WHERE cl!='411V001' and date>=:de AND date<=:a AND art IN (:prodId) and cl IN (:phIds)",
            {
              replacements: { de, a, phIds, prodId },
              type: Sequelize.QueryTypes.SELECT,
            }
          ),
          sequelize.query(
            "SELECT obj FROM objectifvd WHERE annee=:year and idDlg=:id",
            {
              replacements: { id, year },
              type: Sequelize.QueryTypes.SELECT,
            }
          ),
        ]);
      }
    }
    
    res.status(200).json([
      {
        ca: ca[0]?.ca || 0,
        obj: obj[0]?.obj || 0,
      },
    ]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
*/
router.post("/getProductLaunchHistoryVF", validator, async (req, res) => {
  const { gamme_id, bu, aire_id } = req.body;

  const whereCondition = {};
  if (gamme_id !== null && gamme_id) {
    whereCondition.gamme_id = gamme_id;
  }
  if (aire_id !== null && aire_id) {
    whereCondition.aire = aire_id;
  }

  try {
    // 1. Récupérer tous les produits
    const allProducts = await Products.findAll({
      where: whereCondition,
      include: [
        {
          model: ProdGamme,
          required: false,
          attributes: ["nom", "id"],
        },
        {
          model: ProdZone,
          required: false,
          attributes: ["zone"],
          where: {
            year: new Date().getFullYear() - 1,
            ...(bu != 0 && { zone: bu }),
          },
        },
        {
          model: Aire,
          required: false, // LEFT JOIN - inclut les produits même sans aire
          attributes: ["id", "nom"],
          as: "airet",
          where: {
            ...(aire_id && aire_id != 0 && { id: aire_id }),
          },
          // Ajoutez les attributs dont vous avez besoin
        },
      ],
      order: [["id", "ASC"]],
    });

    // 2. Récupérer les années de lancement - REQUÊTE DIRECTE
    const launchYears = await sequelize2.query(
      `SELECT Article, MIN(year) as launch_year
       FROM kb_prd_lancement
       GROUP BY Article`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );
    const cogs = await sequelize2.query(
      `SELECT        code, cm, cogs, year
FROM            xkb_cogs_art`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const launchYearMap = new Map();
    launchYears.forEach((item) => {
      launchYearMap.set(item.Article, item.launch_year);
    });

    // 3. Récupérer les ventes historiques par année (2016 à année en cours - 1)
    const currentYear = new Date().getFullYear();
    const startYear = 2019;
    const endYear = currentYear - 1;

    const yearlyHistory = await sequelize.query(
      `SELECT 
        art,
        YEAR(date) as year,
        SUM(qte) as qte,
        SUM(ttc) as ca
      FROM ca_tot_vente 
      WHERE YEAR(date) >= 2016 AND YEAR(date) <= ${endYear}
      GROUP BY art, YEAR(date)
      ORDER BY art, year`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    // 4. Organiser les données par article et année
    const salesByProduct = new Map();
    yearlyHistory.forEach((item) => {
      if (!salesByProduct.has(item.art)) {
        salesByProduct.set(item.art, {});
      }
      salesByProduct.get(item.art)[item.year] = {
        qte: parseFloat(item.qte) || 0,
        ca: parseFloat(item.ca) || 0,
      };
    });

    // 5. Construire les données enrichies
    const enrichedData = allProducts.map((product) => {
      const code = product.code_article;
      const yearlyData = salesByProduct.get(code) || {};
      const launchYear = launchYearMap.get(code) || null;

      // Construire caByYear et qteByYear
      const caByYear = {};
      const qteByYear = {};

      for (let year = startYear; year <= endYear; year++) {
        if (year === startYear) {
          // Pour 2019, sommer toutes les années <= 2019 (de 2016 à 2019)
          let totalQte = 0;
          let totalCa = 0;

          // Sommer de 2016 à 2019
          for (let y = 2016; y <= 2019; y++) {
            if (yearlyData[y]) {
              totalQte += yearlyData[y].qte;
              totalCa += yearlyData[y].ca;
            }
          }

          caByYear[year] = totalCa;
          qteByYear[year] = totalQte;
        } else {
          // Pour les autres années (2020, 2021, etc.), année par année
          caByYear[year] = yearlyData[year]?.ca || 0;
          qteByYear[year] = yearlyData[year]?.qte || 0;
        }
      }

      return {
        id: product.id,
        code_article: code,
        name: product.name,
        bu: product.products_zones[0]?.zone || 0,
        aire: product.airet?.nom || "",
        gamme: product.prod_categorie?.nom || "",
        launch_year: launchYear,
        caByYear: caByYear,
        qteByYear: qteByYear,
      };
    });

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error("Error in getProductLaunchHistory:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
router.post("/getProductLaunchHistory", validator, async (req, res) => {
  const { gamme_id, bu, aire_id } = req.body;

  const whereCondition = {};
  if (gamme_id !== null && gamme_id) {
    whereCondition.gamme_id = gamme_id;
  }
  if (aire_id !== null && aire_id) {
    whereCondition.aire = aire_id;
  }

  try {
    // 1. Récupérer tous les produits
    const allProducts = await Products.findAll({
      where: whereCondition,
      include: [
        {
          model: ProdGamme,
          required: false,
          attributes: ["nom", "id"],
        },
        {
          model: ProdZone,
          required: false,
          attributes: ["zone"],
          where: {
            year: new Date().getFullYear() - 1,
            ...(bu != 0 && { zone: bu }),
          },
        },
        {
          model: Aire,
          required: false, // LEFT JOIN - inclut les produits même sans aire
          attributes: ["id", "nom"],
          as: "airet",
          where: {
            ...(aire_id && aire_id != 0 && { id: aire_id }),
          },
          // Ajoutez les attributs dont vous avez besoin
        },
      ],
      order: [["id", "ASC"]],
    });

    // 2. Récupérer les années de lancement - REQUÊTE DIRECTE
    const launchYears = await sequelize2.query(
      `SELECT Article, MIN(year) as launch_year
       FROM kb_prd_lancement
       GROUP BY Article`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    // Récupérer les données COGS et CM
    const cogs = await sequelize2.query(
      `SELECT code, cm, cogs, year
       FROM xkb_cogs_art`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const launchYearMap = new Map();
    launchYears.forEach((item) => {
      launchYearMap.set(item.Article, item.launch_year);
    });

    // 3. Créer les Maps pour COGS et CM par article et année
    const cogsMap = new Map();
    const cmMap = new Map();
    cogs.forEach((item) => {
      if (!cogsMap.has(item.code)) {
        cogsMap.set(item.code, {});
        cmMap.set(item.code, {});
      }
      cogsMap.get(item.code)[item.year] = parseFloat(item.cogs) || 0;
      cmMap.get(item.code)[item.year] = parseFloat(item.cm) || 0;
    });

    // 4. Récupérer les ventes historiques par année (2016 à année en cours - 1)
    const currentYear = new Date().getFullYear();
    const startYear = 2019;
    const endYear = currentYear - 1;

    const yearlyHistory = await sequelize.query(
      `SELECT 
        art,
        YEAR(date) as year,
        SUM(qte) as qte,
        SUM(ttc) as ca
      FROM ca_tot_vente 
      WHERE YEAR(date) >= 2019 AND YEAR(date) <= ${endYear}
      GROUP BY art, YEAR(date)
      ORDER BY art, year`,
      {
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    // 5. Organiser les données par article et année
    const salesByProduct = new Map();
    yearlyHistory.forEach((item) => {
      if (!salesByProduct.has(item.art)) {
        salesByProduct.set(item.art, {});
      }
      salesByProduct.get(item.art)[item.year] = {
        qte: parseFloat(item.qte) || 0,
        ca: parseFloat(item.ca) || 0,
      };
    });

    // 6. Construire les données enrichies
    const enrichedData = allProducts.map((product) => {
      const code = product.code_article;
      const yearlyData = salesByProduct.get(code) || {};
      const launchYear = launchYearMap.get(code) || null;
      const cogsData = cogsMap.get(code) || {};
      const cmData = cmMap.get(code) || {};

      // Construire caByYear, qteByYear, cogsByYear, cmByYear
      const caByYear = {};
      const qteByYear = {};
      const cogsByYear = {};
      const cmByYear = {};

      for (let year = startYear; year <= endYear; year++) {
        if (year === startYear) {
          // Pour 2019, sommer toutes les années <= 2019 (de 2016 à 2019)
          let totalQte = 0;
          let totalCa = 0;

          // Sommer de 2016 à 2019
          for (let y = 2016; y <= 2019; y++) {
            if (yearlyData[y]) {
              totalQte += yearlyData[y].qte;
              totalCa += yearlyData[y].ca;
            }
          }

          caByYear[year] = totalCa;
          qteByYear[year] = totalQte;
        } else {
          // Pour les autres années (2020, 2021, etc.), année par année
          caByYear[year] = yearlyData[year]?.ca || 0;
          qteByYear[year] = yearlyData[year]?.qte || 0;
        }

        // COGS et CM par année (pas de cumul pour 2019)
        cogsByYear[year] = cogsData[year] || 0;
        cmByYear[year] = cmData[year] || 0;
      }

      return {
        id: product.id,
        code_article: code,
        name: product.name,
        bu: product.products_zones[0]?.zone || 0,
        aire: product.airet?.nom || "",
        gamme: product.prod_categorie?.nom || "",
        launch_year: launchYear,
        caByYear: caByYear,
        qteByYear: qteByYear,
        cogsByYear: cogsByYear,
        cmByYear: cmByYear,
      };
    });

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error("Error in getProductLaunchHistory:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/getVenteDirecte", validator, async (req, res) => {
  const { de, a, idDlg, year } = req.body;

  try {
    // Get DLG's Uniges code
    const dlgCode = await DcrepCode.findOne({
      where: { id: idDlg },
      attributes: ["idUniges"],
    });

    if (!dlgCode) {
      return res.json([]);
    }
    const dlgUniges = dlgCode.idUniges;

    // Get products per BU zone (8=BU1, 9=BU2, 10=BU3, 11=BU4)
    const getBuProducts = async (zone) => {
      const rows = await sequelize.query(
        `SELECT p.code_article FROM products_zone pz
         JOIN products p ON p.id = pz.id_prd
         WHERE pz.zone = :zone AND pz.year = :year`,
        {
          replacements: { zone, year },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
      return rows.map((r) => r.code_article);
    };

    // BU zone mapping: zone ID → BU number (1-4)
    const BU_ZONE_MAP = { 8: 1, 9: 2, 10: 3, 11: 4 };

    const [[bu1Arts, bu2Arts, bu3Arts, bu4Arts], dlgBuRows] = await Promise.all([
      Promise.all([
        getBuProducts(8),
        getBuProducts(9),
        getBuProducts(10),
        getBuProducts(11),
      ]),
      // Get DLG's assigned BU zone IDs for the year
      sequelize.query(
        `SELECT bu FROM user_bu WHERE user = :idDlg AND year = :year`,
        {
          replacements: { idDlg, year },
          type: Sequelize.QueryTypes.SELECT,
        },
      ),
    ]);

    // Map zone IDs to BU numbers (e.g. [8, 10] → [1, 3])
    const dlgBus = dlgBuRows
      .map((r) => BU_ZONE_MAP[r.bu])
      .filter(Boolean);

    // Get pharmacies assigned to this DLG — live from SQL Server view
    const phDlg = await sequelize2.query(
      `SELECT cl FROM kb_affectation_ph WHERE dlg = :dlgUniges`,
      {
        replacements: { dlgUniges },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const phIds = phDlg.map((ph) => ph.cl);

    if (phIds.length === 0) {
      return res.json({ data: [], dlgBus });
    }

    // Query CA per BU — same pattern as getCaVdDlg:
    // cl != '411V001', date range, art IN (buArts), cl IN (phIds)
    const getCaBu = async (buArts) => {
      if (buArts.length === 0) return [];
      return sequelize.query(
        "SELECT cl, sum(ttc) as ca FROM ca_tot_vente WHERE cl!='411V001' AND date>=:de AND date<=:a AND art IN (:buArts) AND cl IN (:phIds) GROUP BY cl",
        {
          replacements: { de, a, buArts, phIds },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
    };

    // Get pharmacy info from SQL Server via kb_VTiers (sequelize2)
    const [caBu1, caBu2, caBu3, caBu4, tiersRows, objRows] = await Promise.all([
      getCaBu(bu1Arts),
      getCaBu(bu2Arts),
      getCaBu(bu3Arts),
      getCaBu(bu4Arts),
      sequelize2.query(
        `SELECT tiers_code, tiers_rs, tiers_zone, tiers_stat3
         FROM kb_VTiers
         WHERE tiers_code IN (:phIds)`,
        {
          replacements: { phIds },
          type: Sequelize.QueryTypes.SELECT,
        },
      ),
      sequelize.query(
        "SELECT obj FROM objectifvd WHERE annee=:year AND idDlg=:idDlg",
        {
          replacements: { year, idDlg },
          type: Sequelize.QueryTypes.SELECT,
        },
      ),
    ]);

    // Build CA maps: { cl → ca }
    const makeCaMap = (rows) =>
      Object.fromEntries(rows.map((r) => [r.cl, Number(r.ca) || 0]));
    const bu1Map = makeCaMap(caBu1);
    const bu2Map = makeCaMap(caBu2);
    const bu3Map = makeCaMap(caBu3);
    const bu4Map = makeCaMap(caBu4);

    // Build tiers map: { tiers_code → tiers row }
    const tiersMap = Object.fromEntries(
      tiersRows.map((t) => [t.tiers_code, t]),
    );

    // One row per assigned pharmacy
    const data = phIds
      .map((cl) => {
        const t = tiersMap[cl] || {};
        return {
          code_uniges: cl,
          nom: t.tiers_rs || cl,
          zone: t.tiers_zone || "",
          tiers_stat3: t.tiers_stat3 || "",
          bu1: bu1Map[cl] || 0,
          bu2: bu2Map[cl] || 0,
          bu3: bu3Map[cl] || 0,
          bu4: bu4Map[cl] || 0,
        };
      })
      .sort((a, b) => a.nom.localeCompare(b.nom));

    res.json({ data, dlgBus, obj: objRows[0]?.obj || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getCaVdDlg", validator, async (req, res) => {
  const { de, a, prodId, id, year } = req.body;

  try {
    const cdeDlgUni = await DcrepCode.findOne({
      where: {
        id: id,
      },
      attributes: ["idUniges"],
    });

    let ca = [];
    let obj = [];

    if (cdeDlgUni && prodId?.length > 0) {
      


      const phDlg = await sequelize2.query(
      `SELECT cl FROM kb_affectation_ph WHERE dlg = :dlgUniges`,
      {
        replacements: { dlgUniges:cdeDlgUni.idUniges },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

      const phIds = phDlg.map((ph) => ph.cl);

      // Always fetch obj since it doesn't depend on phIds
      obj = await sequelize.query(
        "SELECT obj FROM objectifvd WHERE annee=:year and idDlg=:id",
        {
          replacements: { id, year },
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      // Only fetch ca if phIds exists
      if (phIds.length > 0) {
        ca = await sequelize.query(
          "SELECT sum(ttc) as ca FROM ca_tot_vente WHERE cl!='411V001' and date>=:de AND date<=:a AND art IN (:prodId) and cl IN (:phIds)",
          {
            replacements: { de, a, phIds, prodId },
            type: Sequelize.QueryTypes.SELECT,
          },
        );
      }
    }

    // Return the results
    res.json({
      ca: ca[0]?.ca || 0,
      obj: obj[0]?.obj || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/getCaVdDlgPARA", validator, async (req, res) => {
  const { de, a, prodId, id, year } = req.body;

  try {
    const cdeDlgUni = await DcrepCode.findOne({
      where: {
        id: id,
      },
      attributes: ["idUniges"],
    });

    let ca = [];
    let obj = [];

    if (cdeDlgUni && prodId?.length > 0) {
      


      const phDlg = await sequelize2.query(
      `SELECT cl FROM kb_affectation_ph_para WHERE dlg = :dlgUniges`,
      {
        replacements: { dlgUniges:cdeDlgUni.idUniges },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

      const phIds = phDlg.map((ph) => ph.cl);

      // Always fetch obj since it doesn't depend on phIds
      obj = await sequelize.query(
        "SELECT 0 FROM objectifvd WHERE annee=:year and idDlg=:id",
        {
          replacements: { id, year },
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      // Only fetch ca if phIds exists
      if (phIds.length > 0) {
        ca = await sequelize.query(
          "SELECT sum(ttc) as ca FROM ca_tot_vente WHERE cl!='411V001' and date>=:de AND date<=:a AND art IN (:prodId) and cl IN (:phIds)",
          {
            replacements: { de, a, phIds, prodId },
            type: Sequelize.QueryTypes.SELECT,
          },
        );
      }
    }

    // Return the results
    res.json({
      ca: ca[0]?.ca || 0,
      obj: obj[0]?.obj || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.post("/getVenteDirectePARA", validator, async (req, res) => {
  const { de, a, idDlg, year } = req.body;

  try {
    // Get DLG's Uniges code
    const dlgCode = await DcrepCode.findOne({
      where: { id: idDlg },
      attributes: ["idUniges"],
    });
    
    if (!dlgCode) {
      return res.json([]);
    }
    const dlgUniges = dlgCode.idUniges;

    // Get tttttttt products per BU zone (8=BU1, 9=BU2, 10=BU3, 11=BU4)
    const getBuProducts = async (zone) => {
      const rows = await sequelize.query(
        `SELECT p.code_article FROM products_zone pz
         JOIN products p ON p.id = pz.id_prd
         WHERE pz.zone = :zone AND pz.year = :year`,
        {
          replacements: { zone, year },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
      return rows.map((r) => r.code_article);
    };

    // BU zone mapping: zone ID → BU number (1-4)
    const BU_ZONE_MAP = { 8: 1, 9: 2, 10: 3, 11: 4 };

    const [[bu1Arts, bu2Arts, bu3Arts, bu4Arts], dlgBuRows] = await Promise.all([
      Promise.all([
        getBuProducts(8),
        getBuProducts(9),
        getBuProducts(10),
        getBuProducts(11),
      ]),
      // Get DLG's assigned BU zone IDs for the year
      sequelize.query(
        `SELECT bu FROM user_bu WHERE user = :idDlg AND year = :year`,
        {
          replacements: { idDlg, year },
          type: Sequelize.QueryTypes.SELECT,
        },
      ),
    ]);

    // Map zone IDs to BU numbers (e.g. [8, 10] → [1, 3])
    const dlgBus = dlgBuRows
      .map((r) => BU_ZONE_MAP[r.bu])
      .filter(Boolean);

    // Get pharmacies assigned to this DLG — live from SQL Server view
    const phDlg = await sequelize2.query(
      `SELECT cl FROM kb_affectation_ph_para WHERE dlg = :dlgUniges`,
      {
        replacements: { dlgUniges },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    const phIds = phDlg.map((ph) => ph.cl);

    if (phIds.length === 0) {
      return res.json({ data: [], dlgBus });
    }

    // Query CA per BU — same pattern as getCaVdDlg:
    // cl != '411V001', date range, art IN (buArts), cl IN (phIds)
    const getCaBu = async (buArts) => {
      if (buArts.length === 0) return [];
      return sequelize.query(
        "SELECT cl, sum(ttc) as ca FROM ca_tot_vente WHERE cl!='411V001' AND date>=:de AND date<=:a AND art IN (:buArts) AND cl IN (:phIds) GROUP BY cl",
        {
          replacements: { de, a, buArts, phIds },
          type: Sequelize.QueryTypes.SELECT,
        },
      );
    };

    // Get pharmacy info from SQL Server via kb_VTiers (sequelize2)
    const [caBu1, caBu2, caBu3, caBu4, tiersRows, objRows] = await Promise.all([
      getCaBu(bu1Arts),
      getCaBu(bu2Arts),
      getCaBu(bu3Arts),
      getCaBu(bu4Arts),
      sequelize2.query(
        `SELECT tiers_code, tiers_rs, tiers_zone, tiers_stat3
         FROM kb_VTiers
         WHERE tiers_code IN (:phIds)`,
        {
          replacements: { phIds },
          type: Sequelize.QueryTypes.SELECT,
        },
      ),
      sequelize.query(
        "SELECT 0 FROM objectifvd WHERE annee=:year AND idDlg=:idDlg",
        {
          replacements: { year, idDlg },
          type: Sequelize.QueryTypes.SELECT,
        },
      ),
    ]);

    // Build CA maps: { cl → ca }
    const makeCaMap = (rows) =>
      Object.fromEntries(rows.map((r) => [r.cl, Number(r.ca) || 0]));
    const bu1Map = makeCaMap(caBu1);
    const bu2Map = makeCaMap(caBu2);
    const bu3Map = makeCaMap(caBu3);
    const bu4Map = makeCaMap(caBu4);

    // Build tiers map: { tiers_code → tiers row }
    const tiersMap = Object.fromEntries(
      tiersRows.map((t) => [t.tiers_code, t]),
    );

    // One row per assigned pharmacy
    const data = phIds
      .map((cl) => {
        const t = tiersMap[cl] || {};
        return {
          code_uniges: cl,
          nom: t.tiers_rs || cl,
          zone: t.tiers_zone || "",
          tiers_stat3: t.tiers_stat3 || "",
          bu1: bu1Map[cl] || 0,
          bu2: bu2Map[cl] || 0,
          bu3: bu3Map[cl] || 0,
          bu4: bu4Map[cl] || 0,
        };
      })
      .sort((a, b) => a.nom.localeCompare(b.nom));

    res.json({ data, dlgBus, obj: objRows[0]?.obj || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});





router.post("/getVenteGrossiste", validator, async (req, res) => {
  const { de, a, year } = req.body;

  try {
    // Get all grossiste IdFact values (spec 37 & 38)
    const grossistes = await Prospect.findAll({
      where: { public: 1, spec: { [Op.in]: [37, 38] } },
      attributes: ["id", "IdFact", "nom", "prenom"],
    });

    const groIds = grossistes
      .map((g) => g.IdFact)
      .filter(Boolean);

    if (groIds.length === 0) {
      return res.json([]);
    }

    // Get products per BU (zone 8=BU1, 9=BU2, 10=BU3, 11=BU4)
    const getBuProducts = async (zone) => {
      const rows = await sequelize.query(
        `SELECT p.code_article FROM products_zone pz
         JOIN products p ON p.id = pz.id_prd
         WHERE pz.zone = :zone AND pz.year = :year`,
        {
          replacements: { zone, year },
          type: Sequelize.QueryTypes.SELECT,
        }
      );
      return rows.map((r) => r.code_article);
    };

    const [bu1Arts, bu2Arts, bu3Arts, bu4Arts] = await Promise.all([
      getBuProducts(8),
      getBuProducts(9),
      getBuProducts(10),
      getBuProducts(11),
    ]);

    // Query CA per BU for all grossistes
    const getCaBu = async (buArts) => {
      if (buArts.length === 0) return [];
      return sequelize.query(
        `SELECT cl, SUM(ttc) as ca FROM ca_tot_vente
         WHERE cl != '411V001' AND date >= :de AND date <= :a
         AND art IN (:buArts) AND cl IN (:groIds)
         GROUP BY cl`,
        {
          replacements: { de, a, buArts, groIds },
          type: Sequelize.QueryTypes.SELECT,
        }
      );
    };

    const [caBu1, caBu2, caBu3, caBu4] = await Promise.all([
      getCaBu(bu1Arts),
      getCaBu(bu2Arts),
      getCaBu(bu3Arts),
      getCaBu(bu4Arts),
    ]);

    const makeCaMap = (rows) =>
      Object.fromEntries(rows.map((r) => [r.cl, Number(r.ca) || 0]));

    const bu1Map = makeCaMap(caBu1);
    const bu2Map = makeCaMap(caBu2);
    const bu3Map = makeCaMap(caBu3);
    const bu4Map = makeCaMap(caBu4);

    const data = grossistes.map((g) => ({
      cl: g.IdFact,
      bu1: bu1Map[g.IdFact] || 0,
      bu2: bu2Map[g.IdFact] || 0,
      bu3: bu3Map[g.IdFact] || 0,
      bu4: bu4Map[g.IdFact] || 0,
    }));

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

