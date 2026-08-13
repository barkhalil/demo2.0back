const { sequelize, sequelize3, models } = require("../database");
const express = require("express");
const { Sequelize, Op, or, QueryTypes } = require("sequelize");
const { getDaysBetween } = require("../routes/helpers");
const {
  Prospect,
  Specialite,
  Delegation,
  Activite,
  Gouvernerat,
  Potentiel,
  Visite,
  Users,
  VisiteProducts,
  Products,
  TypeVisite,
  Prdspec,
  DateJouv,
  Pointage,
  ProgVsite,
  NoteFrais,
  Liste,
  Zone,
  ProgTours,
  Rapport,

  TypePointage,
} = models;

const router = express.Router();
const validator = require("../midelware/validator");
const {
  CLIENT_IGNORE_SIGPIPE,
} = require("mysql/lib/protocol/constants/client");
const note_frais = require("../models/note_frais");

router.post("/getProspectVisite", validator, async (req, res) => {
  const { id } = req.body;

  try {
    const allVisite = await Visite.findAll({
      where: {
        public: "1",
        id_pros: id,
      },
      include: [
        {
          model: Users,
          as: "users",
          attributes: ["nom", "prenom"],
        },
      ],
      order: [
        ["date_visite", "DESC"],
        ["id", "DESC"],
      ],
    });

    res.json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getProdPresented", validator, async (req, res) => {
  const { id } = req.body;

  try {
    const productsPresented = await VisiteProducts.findAll({
      where: {
        id_visite: id,
      },
      include: [
        {
          model: Products,
        },
      ],
    });

    res.json(productsPresented);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllVisite", validator, async (req, res) => {
  const { de, a, user } = req.body;

  try {
    if (user.type == 1001 || user.type == 1) {
      //console.log("type 1001");
      const allVisite = await Visite.findAll({
        where: {
          public: "1",

          date_visite: {
            [Sequelize.Op.between]: [de, a],
          },
        },
        include: [
          {
            model: Users,
            as: "users",
          },
          {
            model: Prospect,
            as: "prospect",
            include: [
              {
                model: Specialite,
                as: "specialite", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Delegation,
                as: "delegation_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Gouvernerat,
                as: "gouvernerat_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Activite,
                as: "activite_name", // Utilisation de l'alias
              },
              {
                model: Potentiel,
                as: "potentiel_name", // Utilisation de l'alias
              },
            ],
          },
          {
            model: TypeVisite,
            as: "type_visite",
          },
        ],
        order: [["date_visite", "DESC"]],
      });
      res.status(200).json(allVisite);
    } else if (user.type == 2 && user.sup == 1) {
      //console.log("in sup 1");
      const allVisite = await Visite.findAll({
        where: {
          public: "1",

          date_visite: {
            [Sequelize.Op.between]: [de, a],
          },
        },
        include: [
          {
            model: Users,
            as: "users",
            where: {
              zone2: user.zone2,
            },
          },
          {
            model: Prospect,
            as: "prospect",
            include: [
              {
                model: Specialite,
                as: "specialite", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Delegation,
                as: "delegation_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Gouvernerat,
                as: "gouvernerat_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Activite,
                as: "activite_name", // Utilisation de l'alias
              },
              {
                model: Potentiel,
                as: "potentiel_name", // Utilisation de l'alias
              },
            ],
          },
          {
            model: TypeVisite,
            as: "type_visite",
          },
        ],
        order: [["date_visite", "DESC"]],
      });
      res.status(200).json(allVisite);
    } else if (user.type == 2 && user.sup == 0) {
      // console.log("in sup 0");
      const allVisite = await Visite.findAll({
        where: {
          public: "1",

          date_visite: {
            [Sequelize.Op.between]: [de, a],
          },
        },
        include: [
          {
            model: Users,
            as: "users",
            where: {
              [Sequelize.Op.or]: [
                {
                  id: {
                    [Sequelize.Op.in]: Sequelize.literal(
                      `(SELECT user_id FROM liste WHERE supID = ${req.body.user.id})`,
                    ),
                  },
                },
                {
                  id: req.body.user.id, // Directly include the user's visits
                },
              ],
            },
          },
          {
            model: Prospect,
            as: "prospect",
            include: [
              {
                model: Specialite,
                as: "specialite", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Delegation,
                as: "delegation_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Gouvernerat,
                as: "gouvernerat_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Activite,
                as: "activite_name", // Utilisation de l'alias
              },
              {
                model: Potentiel,
                as: "potentiel_name", // Utilisation de l'alias
              },
            ],
          },
          {
            model: TypeVisite,
            as: "type_visite",
          },
        ],
        order: [["date_visite", "DESC"]],
      });
      res.status(200).json(allVisite);
    } else {
      const allVisite = await Visite.findAll({
        where: {
          public: "1",
          id_visiteur: user.id,
          date_visite: {
            [Sequelize.Op.between]: [de, a],
          },
        },
        include: [
          {
            model: Users,
            as: "users",
          },
          {
            model: Prospect,
            as: "prospect",
            include: [
              {
                model: Specialite,
                as: "specialite", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Delegation,
                as: "delegation_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Gouvernerat,
                as: "gouvernerat_name", // Utilisation de l'alias
                attributes: ["nom"],
              },
              {
                model: Activite,
                as: "activite_name", // Utilisation de l'alias
              },
              {
                model: Potentiel,
                as: "potentiel_name", // Utilisation de l'alias
              },
            ],
          },
          {
            model: TypeVisite,
            as: "type_visite",
          },
        ],
        order: [["date_visite", "DESC"]],
      });
      res.status(200).json(allVisite);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getJouOuv", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    //console.log("in sup 1");
    const allVisite = await DateJouv.findAll({
      where: {
        date_j: {
          [Sequelize.Op.between]: [de, a],
        },
      },

      order: [["date_j", "DESC"]],
    });
    res.status(200).json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllVisiteGroup", validator, async (req, res) => {
  const { selectedDate, selectedDate2, DlgSelected } = req.body;


  try {
    //console.log("type 1001");
    const allVisite = await Visite.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("visite.id")), "visit_count"],
        [Sequelize.col("prospect.gouvernerat_name.nom"), "gouvernerat_name"],
        "date_visite",
      ],
      where: {
        type: 1,
        id_visiteur: DlgSelected,
        date_visite: {
          [Sequelize.Op.between]: [selectedDate, selectedDate2],
        },
      },
      include: [
        {
          model: Prospect,
          as: "prospect",
          attributes: [],
          include: [
            {
              model: Gouvernerat,
              as: "gouvernerat_name", // Make sure this matches your association alias
              attributes: [],
            },
          ],
        },
      ],
      group: ["prospect.gouvernerat_name.nom", "visite.date_visite"],
      order: [["date_visite", "DESC"]],
      raw: true,
      subQuery: false,
    });
    res.status(200).json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllVisiteStat", validator, async (req, res) => {
  const {
    zoneSelected,
    typeDlgSelected,
    typeVisiteSelected,
    DlgSelected,
    sepecialiteSelected,
    activiteSelected,
    potenetielSelected,
    selectedDate,
    selectedDate2,
  } = req.body;

 // console.log(DlgSelected);
  // Build 'where' conditions cleanly
  const userWhere = {};
  if (DlgSelected?.length) userWhere.id = { [Sequelize.Op.in]: DlgSelected };
  if (zoneSelected?.length)
    userWhere.zone2 = { [Sequelize.Op.in]: zoneSelected };
  if (typeDlgSelected?.length)
    userWhere.type = { [Sequelize.Op.in]: typeDlgSelected };

  const typeVisiteWhere = {};
  if (typeVisiteSelected?.length)
    typeVisiteWhere.id = { [Sequelize.Op.in]: typeVisiteSelected };

  const prospectWhere = { public: "1" };
  if (sepecialiteSelected?.length)
    prospectWhere.spec = { [Sequelize.Op.in]: sepecialiteSelected };
  if (activiteSelected?.length)
    prospectWhere.activite = { [Sequelize.Op.in]: activiteSelected };
  if (potenetielSelected?.length)
    prospectWhere.potentiel = { [Sequelize.Op.in]: potenetielSelected };

  // Validate date inputs
  if (!selectedDate || !selectedDate2) {
    return res.status(400).json({ error: "Both date ranges are required" });
  }

  try {
    // First get all visites with their related data
    const allVisite = await Visite.findAll({
      where: {
        public: "1",
        date_visite: {
          [Sequelize.Op.between]: [
            new Date(selectedDate),
            new Date(selectedDate2),
          ],
        },
      },
      include: [
        {
          model: Users,
          as: "users",
          where: userWhere,
          required: true,
        },
        {
          model: TypeVisite,
          as: "type_visite",
          where: typeVisiteWhere,
          required: true,
        },
        {
          model: Prospect,
          as: "prospect",
          where: prospectWhere,
          required: true,
        },
      ],
      order: [["date_visite", "DESC"]],
    });

    // Get all programmed visits with the same filters
    const allProgVisite = await ProgVsite.findAll({
      where: {
        weekStart: {
          [Sequelize.Op.lte]: new Date(selectedDate2),
        },
        weekEnd: {
          [Sequelize.Op.gte]: new Date(selectedDate),
        },
      },
      include: [
        {
          model: Users,
          where: userWhere,
          required: true,
        },
        {
          model: Prospect,
          where: prospectWhere,
          required: true,
        },
      ],
      order: [["weekStart", "DESC"]],
    });

    // Create a map for quick lookup of visites by user-prospect-date
    const visiteMap = new Map();
    allVisite.forEach((v) => {
      const visitDate =
        v.date_visite instanceof Date ? v.date_visite : new Date(v.date_visite);
      const dateKey = visitDate.toISOString().split("T")[0];
      const key = `${v.id_visiteur}-${v.id_pros}-${dateKey}`;
      visiteMap.set(key, v);
    });

    // Add isVisited attribute to each progVisite
    const progVisitesWithStatus = allProgVisite.map((pv) => {
      const weekStart = new Date(pv.weekStart);
      const weekEnd = new Date(pv.weekEnd);

      // Check if there's a visite for this user-prospect within the programmed week
      let isVisited = false;
      for (const [key, visite] of visiteMap.entries()) {
        if (key.startsWith(`${pv.user_id}-${pv.pros_id}-`)) {
          const visiteDate = new Date(visite.date_visite);
          if (visiteDate >= weekStart && visiteDate <= weekEnd) {
            isVisited = true;
            break;
          }
        }
      }

      return {
        ...pv.toJSON(),
        isVisited,
      };
    });

    // Add isProgrammed attribute to each visite
    const visitesWithStatus = allVisite.map((v) => {
      const visiteDate = new Date(v.date_visite);
      const matchingProgVisite = allProgVisite.find(
        (pv) =>
          pv.user_id === v.id_visiteur &&
          pv.pros_id === v.id_pros &&
          visiteDate >= new Date(pv.weekStart) &&
          visiteDate <= new Date(pv.weekEnd),
      );

      return {
        ...v.toJSON(),
        isProgrammed: !!matchingProgVisite,
      };
    });

    return res.status(200).json({
      visites: visitesWithStatus,
      progVisites: progVisitesWithStatus,
    });
  } catch (err) {
    console.error("Error fetching visites:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/searchVisite", validator, async (req, res) => {
  const { de, a, typeVisite, user, vad } = req.body;

  try {
    const whereConditions = {
      public: "1",
      date_visite: {
        [Sequelize.Op.between]: [de, a],
      },
    };

    // Add user filter if it's not 99999 (fetch all users if user is 99999)
    if (user !== 99999) {
      whereConditions["id_visiteur"] = user; // Assuming the user field in the `Visite` model is `user_id`
    }

    // Add typeVisite filter if provided
    if (typeVisite !== 99999) {
      whereConditions["type"] = typeVisite; // Assuming the type of visite is stored in `type_visite_id`
    }

    // Add vad filter if provided
    if (vad !== 99999) {
      whereConditions["vad"] = vad; // Replace 'vad_field' with the correct field in your `Visite` model for `vad`
    }

    const allVisite = await Visite.findAll({
      where: whereConditions,
      include: [
        {
          model: Users,
          as: "users",
        },
        {
          model: Prospect,
          as: "prospect",
          include: [
            {
              model: Specialite,
              as: "specialite", // Utilisation de l'alias
              attributes: ["nom"],
            },
            {
              model: Delegation,
              as: "delegation_name", // Utilisation de l'alias
              attributes: ["nom"],
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name", // Utilisation de l'alias
              attributes: ["nom"],
            },
            {
              model: Activite,
              as: "activite_name", // Utilisation de l'alias
            },
            {
              model: Potentiel,
              as: "potentiel_name", // Utilisation de l'alias
            },
          ],
        },
        {
          model: TypeVisite,
          as: "type_visite",
        },
      ],
      order: [["date_visite", "DESC"]],
    });

    res.status(200).json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/freeDay", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    const allVisite = await DateJouv.count({
      where: {
        date_j: {
          [Sequelize.Op.between]: [de, a],
        },
      },
    });

    res.status(200).json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/freeDayList", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    const allVisite = await DateJouv.findAll({
      where: {
        date_j: {
          [Sequelize.Op.between]: [de, a],
        },
      },
    });

    res.status(200).json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/fraisDlg", validator, async (req, res) => {
  const { de, a, dlg } = req.body;

  try {
    const allVisite = await NoteFrais.findAll({
      where: {
        del_id: dlg,
        
        frais: { [Op.gt]: 1 },
        date_visite: {
          [Sequelize.Op.between]: [de, a],
        },
      },
    });

    res.status(200).json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/dayOff", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    // Convert `de` and `a` to Date objects
    const from = new Date(de);
    const to = new Date(a);

    // Query all users
    const users = await Users.findAll({
      where: {
        active: 1,
        // Filter for supervisor ID
      },
      attributes: ["id"],
    });

    // Prepare an array to store results
    const results = [];

    for (const user of users) {
      // Query for records for the current user that overlap with the provided date range
      const records = await Pointage.findAll({
        where: {
          user_id: user.id,
          type: 1, // Assuming `type = 1` denotes a free day
          [Op.or]: [
            {
              date_debut: { [Op.between]: [from, to] },
            },
            {
              date_fin: { [Op.between]: [from, to] },
            },
            {
              date_debut: { [Op.lte]: from },
              date_fin: { [Op.gte]: to },
            },
          ],
        },
      });

      // Initialize total free days counter for this user
      let totalFreeDays = 0;

      // Iterate over each record to calculate overlapping days
      records.forEach((record) => {
        const overlapStart = new Date(
          Math.max(new Date(record.date_debut), from),
        );
        const overlapEnd = new Date(Math.min(new Date(record.date_fin), to));

        // Calculate the difference in days between overlapStart and overlapEnd
        const diffInTime = overlapEnd - overlapStart;
        const daysOfOverlap =
          Math.floor(diffInTime / (1000 * 60 * 60 * 24)) + 1;

        // Only add days if the overlap period is valid (non-negative)
        if (daysOfOverlap > 0) {
          totalFreeDays += daysOfOverlap;
        }
      });

      // Add user and their free days to the results array
      results.push({ user_id: user.id, daysOff: totalFreeDays });
    }

    // Send the results

    res.status(200).json(results);
  } catch (error) {
    console.error("Error calculating free days for all users:", error);
    res.status(500).json({ error: error.message });
  }

  // res.status(200).json(totalFreeDays);
  // res.status(500).json({ error: error.message });
});

router.post("/dayOffAutre", validator, async (req, res) => {
  const { de, a } = req.body;

  try {
    // Convert `de` and `a` to Date objects
    const from = new Date(de);
    const to = new Date(a);

    // Query all users
    const users = await Users.findAll({
      where: {
       
        active: {
          [Sequelize.Op.gt]: 1, // Ensures validation is greater than 0
        },
        // Filter for supervisor ID
      },
      attributes: ["id"],
    });

    // Prepare an array to store results
    const results = [];

    for (const user of users) {
      // Query for records for the current user that overlap with the provided date range
      const records = await Pointage.findAll({
        where: {
          user_id: user.id,
          type: {
          [Sequelize.Op.gt]: 1, // Ensures validation is greater than 0
        }, // Assuming `type = 1` denotes a free day
          [Op.or]: [
            {
              date_debut: { [Op.between]: [from, to] },
            },
            {
              date_fin: { [Op.between]: [from, to] },
            },
            {
              date_debut: { [Op.lte]: from },
              date_fin: { [Op.gte]: to },
            },
          ],
        },
      });

      // Initialize total free days counter for this user
      let totalFreeDays = 0;

      // Iterate over each record to calculate overlapping days
      records.forEach((record) => {
        const overlapStart = new Date(
          Math.max(new Date(record.date_debut), from),
        );
        const overlapEnd = new Date(Math.min(new Date(record.date_fin), to));

        // Calculate the difference in days between overlapStart and overlapEnd
        const diffInTime = overlapEnd - overlapStart;
        const daysOfOverlap =
          Math.floor(diffInTime / (1000 * 60 * 60 * 24)) + 1;

        // Only add days if the overlap period is valid (non-negative)
        if (daysOfOverlap > 0) {
          totalFreeDays += daysOfOverlap;
        }
      });

      // Add user and their free days to the results array
      results.push({ user_id: user.id, daysOff: totalFreeDays });
    }

    // Send the results

    res.status(200).json(results);
  } catch (error) {
    console.error("Error calculating free days for all users:", error);
    res.status(500).json({ error: error.message });
  }

  // res.status(200).json(totalFreeDays);
  // res.status(500).json({ error: error.message });
});



router.post("/dayOffList", validator, async (req, res) => {
  const { de, a } = req.body;
  try {
    const from = new Date(de);
    const to   = new Date(a);

    // ── Single query for ALL users, type = 1 ──────────────────────────────
    const records = await Pointage.findAll({
      where: {
        type: 1,
        [Op.or]: [
          { date_debut: { [Op.between]: [from, to] } },
          { date_fin:   { [Op.between]: [from, to] } },
          { date_debut: { [Op.lte]: from }, date_fin: { [Op.gte]: to } },
        ],
      },
      // Only join active users — keeps the result set clean
      include: [
        {
          model: Users,
          as: "user",               // adjust alias to match your association
          where: { active: 1 },
          attributes: [],           // we only need user_id from Pointage
          required: true,
        },
      ],
      attributes: ["user_id", "date_debut", "date_fin", "type", "nbreJours"],
    });

    const results = [];

    for (const record of records) {
      const overlapStart = new Date(Math.max(new Date(record.date_debut), from));
      const overlapEnd   = new Date(Math.min(new Date(record.date_fin),   to));

      const nbreJours = parseFloat(record.nbreJours);
      const diffDays  = Math.round(
        (new Date(record.date_fin) - new Date(record.date_debut)) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        results.push({
          user_id:   record.user_id,
          date:      overlapStart.toISOString().split("T")[0],
          typeConge: record.type,
          nbreJours,
        });
      } else {
        const current = new Date(overlapStart);
        while (current <= overlapEnd) {
          results.push({
            user_id:   record.user_id,
            date:      current.toISOString().split("T")[0],
            typeConge: record.type,
            nbreJours: 1,
          });
          current.setDate(current.getDate() + 1);
        }
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching day-off list:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post('/checkDuplicate', async (req, res) => {
  const { id_pros, id_visiteur, date_visite } = req.body;

  try {
    const existing = await Visite.findOne({
      where: {
        id_pros:     id_pros,
        id_visiteur: id_visiteur,
        date_visite: date_visite,
        public:      1
      }
    });

    return res.status(200).json({ exists: !!existing });

  } catch (error) {
    console.error('checkDuplicate error:', error);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post("/dayOffAutreList", validator, async (req, res) => {
  const { de, a } = req.body;
  try {
    const from = new Date(de);
    const to   = new Date(a);

    // ── Single query for ALL users, type > 1 ─────────────────────────────
    const records = await Pointage.findAll({
      where: {
        type: { [Op.gt]: 1 },
        [Op.or]: [
          { date_debut: { [Op.between]: [from, to] } },
          { date_fin:   { [Op.between]: [from, to] } },
          { date_debut: { [Op.lte]: from }, date_fin: { [Op.gte]: to } },
        ],
      },
      include: [
        {
          model: Users,
          as: "user",               // adjust alias to match your association
          where: { active: 1 },
          attributes: [],
          required: true,
        },
      ],
      attributes: ["user_id", "date_debut", "date_fin", "type", "nbreJours"],
    });

    const results = [];

    for (const record of records) {
      const overlapStart = new Date(Math.max(new Date(record.date_debut), from));
      const overlapEnd   = new Date(Math.min(new Date(record.date_fin),   to));

      const nbreJours = parseFloat(record.nbreJours);
      const diffDays  = Math.round(
        (new Date(record.date_fin) - new Date(record.date_debut)) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        results.push({
          user_id:   record.user_id,
          date:      overlapStart.toISOString().split("T")[0],
          typeConge: record.type,
          nbreJours,
        });
      } else {
        const current = new Date(overlapStart);
        while (current <= overlapEnd) {
          results.push({
            user_id:   record.user_id,
            date:      current.toISOString().split("T")[0],
            typeConge: record.type,
            nbreJours: 1,
          });
          current.setDate(current.getDate() + 1);
        }
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching day-off autre list:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/dayOffDLG", validator, async (req, res) => {
  const { de, a, dlg } = req.body;

  try {
    // Convert `de` and `a` to Date objects
    const from = new Date(de);
    const to = new Date(a);

    // Query all users
    const users = await Users.findAll({
      where: {
        active: 1,
        id: dlg,
        // Filter for supervisor ID
      },
      attributes: ["id"],
    });

    // Prepare an array to store results
    const results = [];

    for (const user of users) {
      // Query for records for the current user that overlap with the provided date range
      const records = await Pointage.findAll({
        where: {
          user_id: user.id,
          type: 1, // Assuming `type = 1` denotes a free day
          [Op.or]: [
            {
              date_debut: { [Op.between]: [from, to] },
            },
            {
              date_fin: { [Op.between]: [from, to] },
            },
            {
              date_debut: { [Op.lte]: from },
              date_fin: { [Op.gte]: to },
            },
          ],
        },
      });

      // Initialize total free days counter for this user
      let totalFreeDays = 0;

      // Iterate over each record to calculate overlapping days
      records.forEach((record) => {
        const overlapStart = new Date(
          Math.max(new Date(record.date_debut), from),
        );
        const overlapEnd = new Date(Math.min(new Date(record.date_fin), to));

        // Calculate the difference in days between overlapStart and overlapEnd
        const diffInTime = overlapEnd - overlapStart;
        const daysOfOverlap =
          Math.floor(diffInTime / (1000 * 60 * 60 * 24)) + 1;

        // Only add days if the overlap period is valid (non-negative)
        if (daysOfOverlap > 0) {
          totalFreeDays += daysOfOverlap;
        }
      });

      // Add user and their free days to the results array
      results.push({ user_id: user.id, daysOff: totalFreeDays });
    }

    // Send the results

    res.status(200).json(results);
  } catch (error) {
    console.error("Error calculating free days for all users:", error);
    res.status(500).json({ error: error.message });
  }

  // res.status(200).json(totalFreeDays);
  // res.status(500).json({ error: error.message });
});
router.post("/dayOff2", validator, async (req, res) => {
  const { de, a, user } = req.body;

  try {
    // Convert `fromDate` and `toDate` to Date objects
    const from = new Date(de);
    const to = new Date(a);

    // Query for records that overlap with the provided date range
    const records = await Pointage.findAll({
      where: {
        user_id: user,
        type: 1, // Assuming `type = 1` denotes a free day
        [Op.or]: [
          {
            date_debut: { [Op.between]: [from, to] },
          },
          {
            date_fin: { [Op.between]: [from, to] },
          },
          {
            date_debut: { [Op.lte]: from },
            date_fin: { [Op.gte]: to },
          },
        ],
      },
    });

    // Initialize total free days counter
    let totalFreeDays = 0;

    // Iterate over each record to calculate overlapping days
    records.forEach((record) => {
      // Determine the maximum start date and the minimum end date for overlap
      const overlapStart = new Date(
        Math.max(new Date(record.date_debut), from),
      );
      const overlapEnd = new Date(Math.min(new Date(record.date_fin), to));

      // Calculate the difference in days between overlapStart and overlapEnd
      const diffInTime = overlapEnd - overlapStart;
      const daysOfOverlap = Math.floor(diffInTime / (1000 * 60 * 60 * 24)) + 1;

      // Only add days if the overlap period is valid (non-negative)
      if (daysOfOverlap > 0) {
        totalFreeDays += daysOfOverlap;
      }

      // console.log(`Record: ${record.id}, Overlap Days: ${daysOfOverlap}`);
    });

    // console.log(`Total free days for user ${userId} between ${fromDate} and ${toDate}: ${totalFreeDays}`);
    res.status(200).json(totalFreeDays);
  } catch (error) {
    console.error("Error calculating free days:", error);
    res.status(500).json({ error: error.message });
    throw new Error("Failed to calculate free days");
  }

  // res.status(200).json(totalFreeDays);
  // res.status(500).json({ error: error.message });
});

router.post("/dayOffDlg", validator, async (req, res) => {
  const { de, a, user } = req.body;

  try {
    // Convert `de` and `a` to Date objects
    const from = new Date(de);
    const to = new Date(a);

    // Query for records for the current user that overlap with the provided date range
    const records = await Pointage.findAll({
      where: {
        user_id: user,

        [Op.or]: [
          {
            date_debut: { [Op.between]: [from, to] },
          },
          {
            date_fin: { [Op.between]: [from, to] },
          },
          {
            date_debut: { [Op.lte]: from },
            date_fin: { [Op.gte]: to },
          },
        ],
      },
      include: [
        {
          model: TypePointage,
          as: "type_conger",
        },
      ],
    });

    // Initialize total free days counter for this user
    let totalFreeDays = 0;

    // Iterate over each record to calculate overlapping days
    records.forEach((record) => {
      const overlapStart = new Date(
        Math.max(new Date(record.date_debut), from),
      );
      const overlapEnd = new Date(Math.min(new Date(record.date_fin), to));

      // Calculate the difference in days between overlapStart and overlapEnd
      const diffInTime = overlapEnd - overlapStart;
      const daysOfOverlap = Math.floor(diffInTime / (1000 * 60 * 60 * 24)) + 1;

      // Only add days if the overlap period is valid (non-negative)
      if (daysOfOverlap > 0) {
        totalFreeDays += daysOfOverlap;
      }
    });

    // Add user and their free days to the results array
    results.push({ user_id: user.id, daysOff: totalFreeDays });

    // Send the results

    res.status(200).json(results);
  } catch (error) {
    console.error("Error calculating free days for all users:", error);
    res.status(500).json({ error: error.message });
  }

  // res.status(200).json(totalFreeDays);
  // res.status(500).json({ error: error.message });
});

router.post("/getAllTypeVisite", validator, async (req, res) => {
  try {
    const allTypeVisite = await TypeVisite.findAll({
      order: [["id", "asc"]],
    });

    res.json(allTypeVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProdForVisite", validator, async (req, res) => {
  // console.log(req.body);

  try {
    const allProducts = await Prdspec.findAll({
      where: {
        idr: req.body.zone,
        actv: req.body.actv,
        spec: req.body.spec,

        [Op.and]: [
          {
            de: {
              [Op.lte]: req.body.today, // Date is less than or equal to 'de'
            },
          },
          {
            a: {
              [Op.gte]: req.body.today, // Date is greater than or equal to 'a'
            },
          },
        ],
      },
      include: [
        {
          model: Products,
        },
      ],
      order: [["fte", "DESC"]],
    });

    res.status(200).json(allProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/addVisite", async (req, res) => {
  try {
    // Extracting data from the request body
    const visite = {
      id_pros: req.body.pros,
      id_visiteur: req.body.visiteur,
      date_visite: req.body.date,
      commentaire: req.body.comment,
      type: req.body.typeVisite,
      public: 1,
      vad: req.body.vad,
    };

    // console.log(visite);
    // Creating a new entry in the "visite" table
    const newVisite = await Visite.create(visite);

    // Respond with success, including the new visite ID
    res.status(200).json({
      message: "Visite created successfully!",
      visiteId: newVisite.id, // Return the id of the created visite
    });
  } catch (error) {
    console.error("Error creating visite:", error);
    res.status(500).json({
      message: "Failed to create visite",
      error: error.message,
    });
  }
});
router.post("/addVisiteProd", async (req, res) => {
  try {
    const { id, prod } = req.body;
    let ProdValues = [];
    if (prod.length > 0) {
      ProdValues = prod.map((option) => option.value);

      for (const ProdValue of ProdValues) {
        const dataToInsert = {
          id_visite: id,
          produits: ProdValue,
        };

        await VisiteProducts.create(dataToInsert);
      }
    }

    res.status(200).json({
      message: "produits ajouter ",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error insert visite products:",
      error: error.message,
    });
  }
});
router.post("/getTypeVisite", validator, async (req, res) => {
  try {
    const typeVsite = await TypeVisite.findAll();

    res.json(typeVsite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/addFrais", async (req, res) => {
  const { date, frais, dlg, user } = req.body;
  let vdlg = 0;
  let vsup = 0;
  let vadmin = 0;
  let date_validation_sup = null;
  let validation_date = null;
  let add_date = null;
  const today = new Date().toISOString().split("T")[0];
  if (user.type == 3 || user.type == 4) {
    vdlg = 1;
    add_date = today;
  } else if (user.type == 2) {
    vsup = 1;
    date_validation_sup = today;
  } else {
    validation_date = today;
   // console.log("here in v admin")
    vadmin = 1;
  }

  try {
    // Search by del_id and date_visite
    const existing = await NoteFrais.findOne({
      where: {
        del_id: dlg,
        date_visite: date,
      },
    });

    if (existing) {
      //console.log("here in existing")
      // Update if exists
      await existing.update({
        frais: frais,
        modifier_par: user.id, // add your user id here
        valider_del: vdlg,
        valider_sup: vsup,
        validation_admin: vadmin,
        date_validation_sup: date_validation_sup,
        validation_date: validation_date,
      });
     
      return res.status(200).json({
        message: "ok",
      });
    } else {
      await sequelize.query(
        `INSERT INTO note_frais
           (date_visite, secteur_id, del_id, frais, valider_del, valider_sup,
            add_date, validation_date, validation_admin, date_validation_sup,
            autre, cree_par)
         VALUES (:date, 0, :dlg, :frais, :vdlg, :vsup,
                 :add_date, :validation_date, :vadmin, :date_validation_sup,
                 0, :cree_par)`,
        {
          replacements: {
            date,
            dlg,
            frais,
            vdlg,
            vsup,
            add_date,
            validation_date,
            vadmin,
            date_validation_sup,
            cree_par: user.id,
          },
          type: Sequelize.QueryTypes.INSERT,
        }
      );

      return res.status(200).json({ message: "ok" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "error",
    });
  }
});
router.post("/progTourDLG", validator, async (req, res) => {
  const { de, a, dlg } = req.body;

  try {
    // Convert `de` and `a` to Date objects
    const from = new Date(de);
    const to = new Date(a);
    const progTournes = await ProgTours.findAll({
      where: {
        delid: dlg,
        [Op.or]: [
          {
            weekStart: {
              [Op.between]: [from, to],
            },
          },
          {
            weekEnd: {
              [Op.between]: [from, to],
            },
          },

          {
            [Op.and]: [
              { weekStart: { [Op.lte]: to } },
              { weekEnd: { [Op.gte]: from } },
            ],
          },
        ],
      },
    });

    const gouvernoratIds = new Set();
    progTournes.forEach((prog) => {
      if (prog.secteurs) {
        const ids = prog.secteurs.split(",").map((id) => parseInt(id.trim()));
        ids.forEach((id) => gouvernoratIds.add(id));
      }
    });

    // Step 3: Fetch gouvernorat details
    const gouvernorats = await Gouvernerat.findAll({
      where: {
        id: {
          [Op.in]: Array.from(gouvernoratIds),
        },
      },
    });

    // Step 4: Map prog_tourne with their gouvernorats
    const result = progTournes.map((prog) => {
      const secteurIds = prog.secteurs
        ? prog.secteurs.split(",").map((id) => parseInt(id.trim()))
        : [];

      const secteurDetails = gouvernorats.filter((gouv) =>
        secteurIds.includes(gouv.id),
      );

      return {
        delid: prog.delid,
        weekStart: prog.weekStart,
        weekEnd: prog.weekEnd,

        gouvernorats: secteurDetails,
      };
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error calculating free days for all users:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/rapport", async (req, res) => {
  //const { date, frais, dlg, user } = req.body;

  try {
    // Extracting data from the request body
    const rapportData = {
      dm_id: req.body.DlgSelected,
      semaine_debut: req.body.selectedDate,
      semaine_fin: req.body.selectedDate2,
      com_general: req.body.cmntG,
      com_pros: req.body.cmnt,
      com_act: req.body.bilan,
      cree_par: req.body.userTrans.id,
    };
    // console.log(visite);
    // Creating a new entry in the "visite" table
    const newVisite = await Rapport.create(rapportData);

    // Respond with success, including the new visite ID
    res.status(200).json({
      message: "Rapport created successfully!",
      visiteId: newVisite.id, // Return the id of the created visite
    });
  } catch (error) {
    console.error("Error creating visite:", error);
    res.status(500).json({
      message: "Failed to create visite",
      error: error.message,
    });
  }
});

router.post("/getRapport", validator, async (req, res) => {
  const { selectedDate, selectedDate2, DlgSelected } = req.body;
  //console.log(req.body)
  try {
    //console.log("in sup 1");
    const allVisite = await Rapport.findAll({
      where: {
        semaine_debut: selectedDate,
        semaine_fin: selectedDate2,
        dm_id: DlgSelected,
      },
    });
    res.status(200).json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/* ────────────────────────────────────────────────────────────
   POINTAGE (congés / absences)
──────────────────────────────────────────────────────────── */

router.post("/getTypeConger", validator, async (req, res) => {
  try {
   
    const types = await TypePointage.findAll({ order: [["id", "asc"]] });

    res.status(200).json(types);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/getPointageUser", validator, async (req, res) => {
  const { user_id } = req.body;
  try {
    const records = await Pointage.findAll({
      where: { user_id },
      include: [{ model: TypePointage, as: "type_conger" }],
      order: [["date_debut", "DESC"]],
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/addPointage", validator, async (req, res) => {
  const { user_id, date_debut, date_fin, type, nbreJours } = req.body;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;
  const maxYear = currentYear + 2;
  const isValidDate = (value) => {
    if (!dateRegex.test(value)) return false;
    const year = parseInt(value.slice(0, 4), 10);
    if (year < minYear || year > maxYear) return false;
    return !isNaN(new Date(value).getTime());
  };

  if (!isValidDate(date_debut) || !isValidDate(date_fin)) {
    return res.status(400).json({
      error: `Date invalide. L'année doit être comprise entre ${minYear} et ${maxYear}.`,
    });
  }
  if (date_fin < date_debut) {
    return res.status(400).json({
      error: "La date de fin doit être postérieure ou égale à la date de début.",
    });
  }

  try {
    const record = await Pointage.create({ user_id, date_debut, date_fin, type, nbreJours });
    const withType = await Pointage.findByPk(record.id, {
      include: [{ model: TypePointage, as: "type_conger" }],
    });
    res.status(200).json(withType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/deletePointage", validator, async (req, res) => {
  const { id } = req.body;
  try {
    await Pointage.destroy({ where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ────────────────────────────────────────────────────────────
   GPS pour Note de Frais
──────────────────────────────────────────────────────────── */

router.post("/getGpsForFrais", validator, async (req, res) => {
  const { dlg, de, a } = req.body;

  try {
    const { GpsStops, PostalCode, Delegation, Gouvernerat, ParcAuto } = models;

    // 1. Get the parc_auto code linked to this delegate
    const parcAuto = await ParcAuto.findOne({
      where: { codeCrm: dlg },
      attributes: ["code"],
    });
console.log(parcAuto)
    const idparc = parcAuto?.code;

    if (!parcAuto || !idparc) {
      console.log(`[GPS] No parc_auto link found for dlg=${dlg} (code=${idparc})`);
      return res.status(200).json([{ noLink: true }]);
    }

    // 2. Get all assignment intervals for this parc overlapping the date range.
    //    debut may be a date/datetime; fin is stored as DD/MM/YYYY (style 103).
    const assignments = await sequelize3.query(
      `SELECT mat,
              debut,
              CONVERT(varchar(10), CONVERT(date, fin, 103), 120) AS fin_iso
       FROM   bi_Affectation
       WHERE  id = :idparc
         AND  debut <= :a
         AND  CONVERT(varchar(10), CONVERT(date, fin, 103), 120) >= :de`,
      { replacements: { idparc, de, a }, type: QueryTypes.SELECT }
    );

    if (!assignments || assignments.length === 0) return res.status(200).json([]);

    // Normalise debut to YYYY-MM-DD regardless of what SQL Server returns
    // (Date object, ISO string, or 'YYYY-MM-DD HH:mm:ss' string).
    const toYMD = (v) => {
      if (!v) return null;
      if (v instanceof Date) return v.toISOString().split("T")[0];
      return String(v).split("T")[0].split(" ")[0];
    };

    // 3. Build a day → matricule map for every day in the requested range.
    const dayMatriculeMap = {};
    const cur = new Date(de);
    const endDate = new Date(a);
    while (cur <= endDate) {
      const dayStr = cur.toISOString().split("T")[0];
      const match = assignments.find((r) => {
        const debutYMD = toYMD(r.debut);
        return r.mat && debutYMD && dayStr >= debutYMD && dayStr <= r.fin_iso;
      });
      if (match) dayMatriculeMap[dayStr] = match.mat;
      cur.setDate(cur.getDate() + 1);
    }

    const allDays      = Object.keys(dayMatriculeMap);
    const matricules   = [...new Set(Object.values(dayMatriculeMap))];

    if (matricules.length === 0) return res.status(200).json([]);

    // 4. Fetch GPS stops for the matched matricules across the range.
    const allStops = await GpsStops.findAll({
      where: {
        matricule:     { [Op.in]: matricules },
        stop_duration: { [Op.gt]: 130 },
        stop_start: {
          [Op.gte]: new Date(`${de}T00:00:00`),
          [Op.lte]: new Date(`${a}T23:59:59`),
        },
      },
    });

    // 5. Batch-enrich stops with delegation / gouvernerat names via postal code.
    const codes   = [...new Set(allStops.map((s) => s.code).filter((c) => c != null))];
    const codeMap = {};

    if (codes.length > 0) {
      const postalCodes = await PostalCode.findAll({
        where: { nom: { [Op.in]: codes.map(String) } },
      });
      const delIds = [...new Set(postalCodes.map((p) => p.id_del).filter(Boolean))];
      const delegations = delIds.length > 0
        ? await Delegation.findAll({ where: { id: { [Op.in]: delIds } } })
        : [];
      const gouvIds = [...new Set(delegations.map((d) => d.gouv_id).filter(Boolean))];
      const gouvernerats = gouvIds.length > 0
        ? await Gouvernerat.findAll({ where: { id: { [Op.in]: gouvIds } } })
        : [];

      const delMap  = Object.fromEntries(delegations.map((d) => [d.id, d]));
      const gouvMap = Object.fromEntries(gouvernerats.map((g) => [g.id, g]));
      postalCodes.forEach((p) => {
        const del  = delMap[p.id_del];
        const gouv = del ? gouvMap[del.gouv_id] : null;
        codeMap[String(p.nom)] = {
          delegation:  del  ? del.nom  : null,
          gouvernerat: gouv ? gouv.nom : null,
        };
      });
    }

    // 6. Build per-day response.
    //    - Days WITH stops  → one entry per stop (only if the stop's matricule matches
    //                          the car assigned that day).
    //    - Days WITHOUT stops → one placeholder entry so the frontend still knows
    //                           which car was assigned even when GPS didn't record.
    const stopsByDate = {};
    allStops.forEach((stop) => {
      const day = stop.stop_start
        ? new Date(stop.stop_start).toISOString().split("T")[0]
        : null;
      if (!day) return;
      if (!stopsByDate[day]) stopsByDate[day] = [];
      stopsByDate[day].push(stop);
    });

    const result = [];
    allDays.forEach((day) => {
      const assignedMat = dayMatriculeMap[day];
      const dayStops    = (stopsByDate[day] || []).filter(
        (s) => s.matricule === assignedMat
      );

      if (dayStops.length === 0) {
        result.push({ date: day, matricule: assignedMat, noGps: true });
        return;
      }

      dayStops.forEach((stop) => {
        const location = stop.code ? codeMap[String(stop.code)] || {} : {};
        result.push({
          date:          day,
          matricule:     assignedMat,
          code:          stop.code,
          latitude:      stop.latitude,
          longitude:     stop.longitude,
          stop_duration: stop.stop_duration,
          delegation:    location.delegation  || null,
          gouvernerat:   location.gouvernerat || null,
        });
      });
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getGpsForFrais:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
