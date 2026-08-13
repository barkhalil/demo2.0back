const { models } = require("../database");
const express = require("express");
const { Sequelize, Op } = require("sequelize");
const {
  Prospect,
  Demande,
  TypeDemande,
  Grm_budget_annuel,
  Commentaire,
  ProspectsDemande,
  Users,
  BA,
  TypePay,
  Grm_budget_annuel_zone,
} = models;
const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
const router = express.Router();
const validator = require("../midelware/validator");
const { USE } = require("sequelize/lib/index-hints");

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

async function getDemandeDetail(id) {
  try {
    const demandeDetail = await Demande.findOne({
      where: {
        id: id, // Add conditions here
      },
      include: [
        {
          model: Users,
          as: "user", // Use the alias from the association
          attributes: ["nom", "prenom", "id", "zone", "zone2"],
        },
        {
          model: TypeDemande,
          as: "type_demande", // Use the alias from the association
          attributes: ["id", "name", "departement"],
        },
      ],
    });

    return { success: true, data: demandeDetail };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
async function getTypeBudgetAlloue(year, zone, type) {
  try {
    // Build the `where` clause dynamically
    const whereClause = {
      years: year,
      ...(zone && { zone }), // Add `zone` condition if it's not null
      ...(type && { type }), // Add `type` condition if it's not null
    };

    const allTypeDemande = await Grm_budget_annuel_zone.findAll({
      attributes: [
        "years", // Group by year
        "zone", // Group by zone
        "type", // Group by type
        [Sequelize.fn("SUM", Sequelize.col("sold")), "totalSold"], // Sum of sold
      ],
      group: ["years", "zone", "type"], // Group by year, zone, and type
      where: whereClause,
    });

    return { success: true, data: allTypeDemande };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}
async function getTypeBudgetType(year, zone, type) {
  try {
    // Define the `where` clause for `Demande`
    const whereClause = {
      budget_year: year,
      type,
    };

    // Define the `where` clause for `Users`
    const userWhereClause = zone ? { zone2: zone } : {};

    const allTypeDemande = await Demande.findAll({
      attributes: [
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN (budget_investi IS NULL OR budget_investi = '') and validation=1 THEN budget_demander*court ELSE 0 END",
            ),
          ),
          "demande",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN validation=1 THEN budget_investi*court ELSE 0 END",
            ),
          ),
          "investi",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN validation=0 and  (budget_investi IS NULL OR budget_investi = '') THEN budget_demander*court ELSE 0 END",
            ),
          ),
          "encours",
        ],
      ],
      include: [
        {
          model: Users,
          as: "user", // Ensure this matches the alias in your association
          attributes: [], // Exclude user attributes from the result
          where: userWhereClause, // Apply filtering by user.zone2
        },
      ],
      where: whereClause, // Apply conditions on Demande
    });

    // Extract the calculated sums
    const demande = allTypeDemande[0]?.get("demande") ?? 0;
    const investi = allTypeDemande[0]?.get("investi") ?? 0;
    const encours = allTypeDemande[0]?.get("encours") ?? 0;

    return { success: true, data: { demande, investi, encours } };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

router.post("/getDemande", validator, async (req, res) => {
  const { year, zone } = req.body;

  const userWhereConditions = zone ? { zone2: zone } : {};
  try {
    const allDemande = await Demande.findAll({
      where: {
        budget_year: year,
        validation: {
          [Sequelize.Op.gt]: -1, // Ensures validation is greater than 0
        },
      },
      include: [
        {
          model: TypeDemande,

          attributes: ["name", "id", "departement"],
        },
        {
          model: Users,
          where: userWhereConditions,
        },
      ],
    });

    res.status(200).json(allDemande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllDemandeFilter", validator, async (req, res) => {
  const { year, type, date1, date2, dep, user } = req.body;

  try {
    const whereClause = {
      budget_year: year,
      date: {
        [Sequelize.Op.between]: [date1, date2],
      },
    };

    // Add type condition only if type is not 0
    if (type !== "0") {
      whereClause.type = type;
    }
    if (user.type == 1001 || (user.type == 1 && user.zone2 == 0)) {
      const allDemande = await Demande.findAll({
        where: whereClause,
        include: [
          {
            model: TypeDemande,

            attributes: ["id", "name"],
            where: {
              departement: dep,
            },
          },

          {
            model: Users,

            attributes: ["id", "nom", "prenom"],
          },
        ],
        order: [
          // Tri par le nom en ordre ascendant
          ["id", "DESC"],
        ],
      });
      res.status(200).json(allDemande);
    } else if (user.type == 1 && user.zone2 != 0) {
      const allDemande = await Demande.findAll({
        where: whereClause,
        include: [
          {
            model: TypeDemande,

            attributes: ["id", "name"],
            where: {
              departement: dep,
            },
          },

          {
            model: Users,
            where: {
              zone2: user.zone2,
            },
            attributes: ["id", "nom", "prenom"],
          },
        ],
        order: [
          // Tri par le nom en ordre ascendant
          ["id", "DESC"],
        ],
      });
      res.status(200).json(allDemande);
    } else if (user.type == 2 || user.sup == 1) {
      const allDemande = await Demande.findAll({
        where: whereClause,
        include: [
          {
            model: TypeDemande,

            attributes: ["id", "name"],
            where: {
              departement: dep,
            },
          },

          {
            model: Users,
            where: {
              zone2: user.zone2,
            },
            attributes: ["id", "nom", "prenom"],
          },
        ],
        order: [
          // Tri par le nom en ordre ascendant
          ["id", "DESC"],
        ],
      });
      res.status(200).json(allDemande);
    } else if (user.type == 2 && user.sup == 0) {
      const users = await Liste.findAll({
        where: {
          supID: user.id,
        },
        attributes: ["user_id"],
      });

      // Extract user IDs from the Liste results
      const userIds = users.map((u) => u.user_id);

      const allDemande = await Demande.findAll({
        where: whereClause,
        include: [
          {
            model: TypeDemande,
            attributes: ["id", "name"],
            where: {
              departement: dep,
            },
          },
          {
            model: Users,
            where: {
              id: {
                [Op.in]: userIds, // Use Op.in for IN clause
              },
            },
            attributes: ["id", "nom", "prenom"],
          },
        ],
        order: [["id", "DESC"]],
      });

      res.status(200).json(allDemande);
    } else {
      const allDemande = await Demande.findAll({
        where: whereClause,
        include: [
          {
            model: TypeDemande,

            attributes: ["id", "name"],
            where: {
              departement: dep,
            },
          },

          {
            model: Users,
            where: {
              id: user.id,
            },
            attributes: ["id", "nom", "prenom"],
          },
        ],
        order: [
          // Tri par le nom en ordre ascendant
          ["id", "DESC"],
        ],
      });
      res.status(200).json(allDemande);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getTypeDemande", validator, async (req, res) => {
  const { departement } = req.body;

  try {
    const allTypeDemande = await TypeDemande.findAll({
      where: departement ? { departement: departement } : {},
      order: [
        // Tri par le nom en ordre ascendant
        ["name", "ASC"],
      ],
    });

    res.status(200).json(allTypeDemande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getTypeBudgetAlloue", validator, async (req, res) => {
  const { year } = req.body;

  const result = await getTypeBudgetAlloue(year, null, null);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});
router.post("/getBudgetAlloue", validator, async (req, res) => {
  const { year, zone } = req.body;

  const result = await getTypeBudgetAlloue(year, zone, null);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});
router.post("/getTypeDAxeZone", validator, async (req, res) => {
  const { id } = req.body;

  const result = await getDemandeDetail(id);
  if (result.success) {
    const zoneDm = result.data.user.zone;
    const zone2Dm = result.data.user.zone2;
    const TypeDm = result.data.type;
    const yearDm = result.data.budget_year;
    const DepartementDm = result.data.type_demande.departement;
    if (DepartementDm == 1) {
      const result = await getTypeBudgetAlloue(yearDm, null, TypeDm);
      const result1 = await getTypeBudgetType(yearDm, null, TypeDm);
      const totalSold = result.data[0]?.get("totalSold") ?? 0;

      res.status(200).json({
        sold: totalSold,
        demande: result1.data.demande,
        investi: result1.data.investi,
        encours: result1.data.encours,
      });
    } else {
      const result = await getTypeBudgetAlloue(yearDm, zone2Dm, TypeDm);
      const result1 = await getTypeBudgetType(yearDm, zone2Dm, TypeDm);
      const totalSold = result.data[0]?.get("totalSold") ?? 0;

      res.status(200).json({
        sold: totalSold,
        demande: result1.data.demande,
        investi: result1.data.investi,
        encours: result1.data.encours,
      });
    }
  }
});

router.post("/addDm", validator, async (req, res) => {
  const { cmnt, obj, lieu, budg, court, date, year, prospects, id_user, type } =
    req.body;

  try {
    const response = await Demande.create({
      id_user: id_user,
      type: type,
      date: date,
      lieu: lieu,
      budget_demander: budg,
      objectif: obj,
      cree_par: id_user,
      budget_year: year,
      court: court,
    });

    if (response.id) {
      const responseCom = await Commentaire.create({
        demande_id: response.id,
        cree_par: id_user,
        com: cmnt,
      });
    }

    if (response.id) {
      const prosdm = prospects.map((prospectId) => ({
        id_demande: response.id,
        id_prospect: prospectId,
      }));

      // Insert the affectations
      await ProspectsDemande.bulkCreate(prosdm);
    }
    res.status(200).json(response.id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/addCmnt", validator, async (req, res) => {
  const { cmnt, user, id } = req.body;

  try {
    const response = await Commentaire.create({
      cree_par: user,
      com: cmnt,
      demande_id: id,
    });

    res.status(200).json(response.id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getDemandeDetail", validator, async (req, res) => {
  const { id } = req.body;

  const result = await getDemandeDetail(id);

  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.post("/getDemandeBADetail", validator, async (req, res) => {
  const { id } = req.body;

  try {
    const allProspects = await BA.findOne({
      where: {
        demande_id: id, // Add conditions here
      },
      include: [
        {
          model: Users,
          as: "user_create", // Use the alias from the association
          attributes: ["nom", "prenom", "id"],
        },
        {
          model: TypePay,
          as: "modeP", // Use the alias from the association
          attributes: ["id", "nom"],
        },
        {
          model: Demande,
          include: [
            {
              model: Users,
              as: "user", // Use the alias from the association
              attributes: ["nom", "prenom", "id"],
            },
            {
              model: TypeDemande,
              as: "type_demande", // Use the alias from the association
              attributes: ["id", "name", "departement"],
            },
          ],
        },
      ],
    });

    res.json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProsDemande", validator, async (req, res) => {
  const { id } = req.body;

  try {
    const allProspects = await ProspectsDemande.findAll({
      where: {
        id_demande: id, // Add conditions here
      },
      include: [
        {
          model: Prospect,
        },
      ],
    });

    res.json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getCmntDemande", validator, async (req, res) => {
  const { id } = req.body;

  try {
    const allProspects = await Commentaire.findAll({
      where: {
        demande_id: id, // Add conditions here
      },
      include: [
        {
          model: Users,
        },
      ],
      order: [
        // Tri par le nom en ordre ascendant
        ["created_at", "DESC"],
      ],
    });

    res.json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/updateDMEtat", validator, async (req, res) => {
  const { id, etat, user_id } = req.body;

  try {
    const allProspects = await Demande.update(
      {
        validation: etat,
        modifier_par: user_id,
        validation_date: getCurrentDate(),
      }, // Update the 'etat' field
      {
        where: { id }, // Match the id
      },
    );

    res.json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/updateDMBudg", validator, async (req, res) => {
  const { id, budget_investi, user_id } = req.body;

  try {
    const allProspects = await Demande.update(
      {
        budget_investi: budget_investi,
      }, // Update the 'etat' field
      {
        where: { id }, // Match the id
      },
    );

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/updateAxeSold", validator, async (req, res) => {
  const { id, sold, year, departement, zone } = req.body;

  try {
    const allProspects = await Grm_budget_annuel_zone.findOne({
      where: {
        type: id,
        departement: departement,
        zone: zone,
        years: year,
      }, // Match the id
    });

    if (allProspects) {
      const update = await Grm_budget_annuel_zone.update(
        { sold: sold },
        {
          where: {
            type: id,
            departement: departement,
            zone: zone,
            years: year,
          }, // Match the id
        },
      );
      res.status(200).json(update);
    } else {
      const update = await Grm_budget_annuel_zone.create({
        sold: sold,
        type: id,
        departement: departement,
        zone: zone,
        years: year,
      });
      res.status(200).json(update);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getTypePay", validator, async (req, res) => {
  const { id } = req.body;

  try {
    const allProspects = await TypePay.findAll({
      order: [
        // Tri par le nom en ordre ascendant
        ["nom"],
      ],
    });

    res.json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/addBA", validator, async (req, res) => {
  const { user, typeP, cmnt, idDm, lib } = req.body;

  try {
    const response = await BA.create({
      cree_par: user.id,
      valider_par: user.id,
      type_pay: typeP,
      commentaire: cmnt,
      demande_id: idDm,
      label: lib,
    });
    console.log(response);
    res.status(200).json(response.id);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
