const { models } = require("../database");
const express = require("express");
const { DataTypes } = require("sequelize");
const { Sequelize, Op, where } = require("sequelize");
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
  Affectation,
  ProgVsite,
  RatioGro,
  ObjectifGroBu,
  Etablisement,
  PostalCode,
  EditProspectDmd,
  Liste,
  Zone,
  GrmCadeauxDemander,
  GrmDemandeCadeaux,
  GrmGift,
} = models;

const router = express.Router();
const validator = require("../midelware/validator");
const zone = require("../models/zone");
const { getUsers } = require("../routes/helpers");

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
router.post("/getAllActiveProspectDlg", validator, async (req, res) => {
  const {
    nom,
    prenom,
    year,
    secteurs,
    delegation,
    specialite,
    potentiel,
    activite,
    etablissement,
    idpros,
    Liste,
  } = req.body;

  const iddlg = parseInt(req.body.dataUser.id);

  let specialiteValues = [];
  let secteursValues = [];
  let delegationValues = [];
  let potentielValues = [];
  let etabValues = [];
  let actvValues = [];

  if (etablissement && etablissement.length > 0) {
    etabValues = etablissement.map((option) => option.value);
  }

  if (activite && activite.length > 0) {
    actvValues = activite.map((option) => option.value);
  }

  if (specialite && specialite.length > 0) {
    specialiteValues = specialite.map((option) => option.value);
  }
  if (secteurs && secteurs.length > 0) {
    secteursValues = secteurs.map((option) => option.value);
  }
  if (delegation && delegation.length > 0) {
    delegationValues = delegation.map((option) => option.value);
  }
  if (potentiel && potentiel.length > 0) {
    potentielValues = potentiel.map((option) => option.value);
  }

  try {
    const allProspects = await Affectation.findAll({
      where: {
        "$prospect.public$": "1",
        id_deleg: iddlg,
        year: year,

        ...(nom && {
          "$prospect.nom$": {
            [Op.like]: `%${nom}%`, // `nom` is the variable you want to search for
          },
        }),
        ...(prenom && {
          "$prospect.prenom$": {
            [Op.like]: `%${prenom}%`, // `nom` is the variable you want to search for
          },
        }),
        ...(idpros && {
          "$prospect.id$": {
            [Op.eq]: idpros,
          },
        }),
        // Add conditions here
        ...(specialite &&
          specialite.length > 0 && {
            "$prospect.specialite.id$": { [Op.in]: specialiteValues },
          }), // Use Op.in for array values
        ...(secteurs &&
          secteurs.length > 0 && {
            "$prospect.gouvernerat_name.id$": { [Op.in]: secteursValues },
          }), // Use Op.in for array values
        ...(delegation &&
          delegation.length > 0 && {
            "$prospect.delegation_name.id$": { [Op.in]: delegationValues },
          }), // Use Op.in for array values
        ...(potentiel &&
          potentiel.length > 0 && {
            "$prospect.potentiel_name.id$": { [Op.in]: potentielValues },
          }), // Use Op.in for array values
        ...(activite &&
          activite.length > 0 && {
            "$prospect.activite_name.id$": { [Op.in]: actvValues },
          }),
        ...(etablissement &&
          etablissement.length > 0 && {
            "$prospect.etablissement_name.id$": { [Op.in]: etabValues },
          }),
      },

      include: [
        {
          model: Prospect,
          required: true,
          include: [
            {
              model: Specialite,
              as: "specialite", // Utilisation de l'alias
              attributes: ["nom", "id"],
            },
            {
              model: Delegation,
              as: "delegation_name", // Utilisation de l'alias
              attributes: ["nom", "id"],
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name", // Utilisation de l'alias
              attributes: ["nom", "id"],
            },
            {
              model: Activite,
              as: "activite_name", // Utilisation de l'alias
            },
            {
              model: Etablisement,
              as: "etablissement_name", // Utilisation de l'alias
              required: false,
            },
            {
              model: Potentiel,
              as: "potentiel_name", // Utilisation de l'alias
            },
          ],
        },
      ],
      order: [
        // Tri par le nom en ordre ascendant
        ["id_prospect", "ASC"],
      ],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/*********addd public */
router.post("/getAllDetProsDlg", validator, async (req, res) => {
  const id = req.body.dataUser.id;
  const year = req.body.year;

  try {
    const allProspects = await Affectation.findAll({
      where: {
        id_deleg: id,
        year: year,
      },
      include: [
        {
          model: Prospect,
          required: true,
          where: {
            public: 1,
          },
          include: [
            {
              model: Specialite,
              as: "specialite", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Delegation,
              as: "delegation_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Activite,
              as: "activite_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Etablisement,
              as: "etablissement_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Potentiel,
              as: "potentiel_name", // Use alias
              attributes: ["valeur", "id"],
            },
          ],
        },
      ],
      order: [["id_prospect", "ASC"]], // Order by prospect ID
    });

    // Extract unique secteurs
    const secteurs = allProspects
      .map((prospect) => prospect.prospect.gouvernerat_name)
      .filter(
        (gouvernerat) => gouvernerat !== null && gouvernerat !== undefined,
      )
      .map((gouvernerat) => gouvernerat.dataValues); // Access dataValues

    const secteursArray = [
      ...new Map(
        secteurs.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];

    // Extract unique delegations
    const deleg = allProspects
      .map((prospect) => prospect.prospect.delegation_name)
      .filter((delegation) => delegation !== null && delegation !== undefined)
      .map((delegation) => delegation.dataValues); // Access dataValues

    const delegationArray = [
      ...new Map(
        deleg.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];

    // Extract unique specialites
    const specialites = allProspects
      .map((prospect) => prospect.prospect.specialite)
      .filter((specialite) => specialite !== null && specialite !== undefined)
      .map((specialite) => specialite.dataValues); // Access dataValues

    const specialitesArray = [
      ...new Map(
        specialites.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];
    const etablissements = allProspects
      .map((prospect) => prospect.prospect.etablissement_name)
      .filter(
        (etablissement) =>
          etablissement !== null && etablissement !== undefined,
      )
      .map((etablissement) => etablissement.dataValues); // Access dataValues

    const etablissementsArray = [
      ...new Map(
        etablissements.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];
    // Extract unique activites
    const activites = allProspects
      .map((prospect) => prospect.prospect.activite_name)
      .filter((activite) => activite !== null && activite !== undefined)
      .map((activite) => activite.dataValues); // Access dataValues

    const activitesArray = [
      ...new Map(
        activites.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];

    // Extract unique potentiels
    const potentiels = allProspects
      .map((prospect) => prospect.prospect.potentiel_name)
      .filter((potentiel) => potentiel !== null && potentiel !== undefined)
      .map((potentiel) => potentiel.dataValues); // Access dataValues

    const potentielsArray = [
      ...new Map(
        potentiels.map((s) => [s.id, { value: s.id, label: s.valeur }]),
      ).values(),
    ];

    res.status(200).json({
      secteursArray,
      delegationArray,
      specialitesArray,
      activitesArray,
      etablissementsArray,
      potentielsArray,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/****liste prospect  */
router.post("/getAllDelegationProsDlg", validator, async (req, res) => {
  const id = req.body.dataUser.id;
  const year = req.body.year;

  try {
    const allProspects = await Affectation.findAll({
      where: {
        id_deleg: id,
        year: year,
      },
      include: [
        {
          model: Prospect,
          required: true,
          include: [
            {
              model: Specialite,
              as: "specialite", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Delegation,
              as: "delegation_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Activite,
              as: "activite_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Potentiel,
              as: "potentiel_name", // Use alias
              attributes: ["valeur", "id"],
            },
          ],
        },
      ],
      order: [["id_prospect", "ASC"]], // Order by prospect ID
    });

    // Extract unique secteurs

    // Extract unique delegations
    const deleg = allProspects
      .map((prospect) => prospect.prospect.delegation_name)
      .filter((delegation) => delegation !== null && delegation !== undefined)
      .map((delegation) => delegation.dataValues); // Access dataValues

    const delegationArray = [
      ...new Map(
        deleg.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];

    // Extract unique specialites

    // Extract unique activites

    // Extract unique potentiels

    res.status(200).json({
      delegationArray,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllActiveProspect", validator, async (req, res) => {
  try {
    const allProspects = await Prospect.findAll({
      where: {
        public: "1", // Conditions supplémentaires
        // Ajoute la condition si userTrans.type n'est pas 4
      },

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
          model: Etablisement,
          as: "etablissement_name", // Utilisation de l'alias
          required: false,
        },
        {
          model: Potentiel,
          as: "potentiel_name", // Utilisation de l'alias
        },
      ],
      order: [
        // Tri par le nom en ordre ascendant
        ["nom", "ASC"],
      ],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
/*router.post("/affectation", validator, async (req, res) => {
  const { id, userId, pros, year } = req.body;
  //console.log(id, userId, pros);
  // Validate input
  if (!id || !userId || !pros || !Array.isArray(pros) || pros.length === 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Loop through the `pros` array and create an affectation for each prospect
    const affectations = pros.map((prospectId) => ({
      id_deleg: id,
      year: year,
      affecter_par: userId,
      id_prospect: prospectId,
      year: year,
    }));

    // Insert the affectations
    await Affectation.bulkCreate(affectations);

    return res
      .status(200)
      .json({ message: "Affectations created successfully" });
  } catch (error) {
    console.error("Error creating affectations:", error);
    return res.status(500).json({ message: "Server error" });
  }
});*/
/**************new affectation  */
router.post("/affectation", validator, async (req, res) => {
  const { id, userId, pros, year } = req.body;
  /*console.log("in affectation");
  console.log(pros.length);*/
  // Validate input
  if (!id || !userId || !pros || !Array.isArray(pros) || pros.length === 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // Remove duplicate prospect IDs from the input array
    const uniquePros = [...new Set(pros)];

    // Check which prospects already have an affectation for this year
    const existingAffectations = await Affectation.findAll({
      where: {
        id_deleg: id,
        id_prospect: uniquePros,
        year: year,
      },
      attributes: ["id_prospect"],
    });

    // Extract the IDs that already exist
    const existingProspectIds = existingAffectations.map(
      (affectation) => affectation.id_prospect,
    );

    // Filter out prospects that are already assigned
    const newProspects = uniquePros.filter(
      (prospectId) => !existingProspectIds.includes(prospectId),
    );

    // If no new prospects to add, return early
    if (newProspects.length === 0) {
      return res.status(400).json({
        message: "All prospects are already assigned for this year",
      });
    }

    // Create affectations only for new prospects
    const affectations = newProspects.map((prospectId) => ({
      id_deleg: id,
      year: year,
      affecter_par: userId,
      id_prospect: prospectId,
    }));

    // Insert the affectations
    await Affectation.bulkCreate(affectations);

    return res.status(200).json({
      message: "Affectations created successfully",
      created: newProspects.length,
      skipped: existingProspectIds.length,
    });
  } catch (error) {
    console.error("Error creating affectations:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/daffectation", validator, async (req, res) => {
  const { id, userId, pros, year } = req.body;

  // 1. Validation des entrées
  if (!id || !userId || !Array.isArray(pros) || pros.length === 0 || !year) {
    return res.status(400).json({
      message:
        "Invalid input: id, userId, pros (array), and year are required.",
    });
  }

  try {
    // 2. Supprimer les doublons
    const uniqueProsIds = [...new Set(pros)];

    // 3. Utiliser `destroy` avec l'opérateur `Op.in` pour la suppression en masse
    const deletedCount = await Affectation.destroy({
      where: {
        id_deleg: id,
        year: year,
        // Syntaxe correcte pour "WHERE id_prospect IN (...)":
        id_prospect: {
          [Op.in]: uniqueProsIds,
        },
      },
    });
    //console.log("deletedCount", uniqueProsIds);
    // 4. Gérer le cas où rien n'a été supprimé
    // `destroy` retourne directement le nombre de lignes supprimées.
    if (deletedCount === 0) {
      return res.status(404).json({
        message: "No affectations found matching the criteria to delete.",
        deleted: 0,
      });
    }

    // 5. Succès
    return res.status(200).json({
      message: `${deletedCount} affectation(s) deleted successfully.`,
      deleted: deletedCount,
    });
  } catch (error) {
    // 6. Gestion des erreurs
    console.error("Error during bulk destroy of affectations:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/getProspectDetail", validator, async (req, res) => {
  const { id } = req.body;

  try {
    const allProspects = await Prospect.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Specialite,
          as: "specialite", // Use the alias from the association
          attributes: ["nom", "id"],
        },
        {
          model: Delegation,
          as: "delegation_name", // Use the alias from the association
          attributes: ["nom", "id"],
        },
        {
          model: Gouvernerat,
          as: "gouvernerat_name", // Use the alias from the association
          attributes: ["nom", "id"],
        },
        {
          model: Activite,
          as: "activite_name", // Use the alias from the association
          attributes: ["nom", "id"],
        },
        {
          model: Potentiel,
          as: "potentiel_name", // Use the alias from the association
          attributes: ["valeur", "id"],
        },
      ],
      order: [
        // Order by a single column (ascending):
        ["nom", "ASC"],
      ],
    });

    res.json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

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
      order: [["date_visite", "DESC"]],
    });
    // console.log(allVisite);
    res.json(allVisite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

/*router.post("/getAllProspectSearch", validator, async (req, res) => {
  const { nom, prenom, specialite, secteurs, delegation, potentiel } = req.body;
  let specialiteValues = [];
  let secteursValues = [];
  let delegationValues = [];
  let potentielValues = [];
  if (specialite.length > 0) {
    specialiteValues = specialite.map((option) => option.value);
  }
  if (secteurs.length > 0) {
    secteursValues = secteurs.map((option) => option.value);
  }
  if (delegation.length > 0) {
    delegationValues = delegation.map((option) => option.value);
  }
  if (potentiel.length > 0) {
    potentielValues = potentiel.map((option) => option.value);
  }

  try {
    const allProspects = await Prospect.findAll({
      where: {
        public: "1", // Add conditions here

        ...(nom && {
          "$prospect.nom$": {
            [Op.like]: `%${nom}%`, // `nom` is the variable you want to search for
          },
        }),
        ...(prenom && {
          "$prospect.prenom$": {
            [Op.like]: `%${prenom}%`, // `nom` is the variable you want to search for
          },
        }),
        ...(specialite &&
          specialite.length > 0 && { spec: { [Op.in]: specialiteValues } }), // Use Op.in for array values
        ...(secteurs &&
          secteurs.length > 0 && { gouvernorat: { [Op.in]: secteursValues } }), // Use Op.in for array values
        ...(delegation &&
          delegation.length > 0 && {
            delegation: { [Op.in]: delegationValues },
          }), // Use Op.in for array values
        ...(potentiel &&
          potentiel.length > 0 && { potentiel: { [Op.in]: potentielValues } }), // Use Op.in for array values
      },
      include: [
        {
          model: Specialite,
          as: "specialite", // Use the alias from the association
          attributes: ["nom"],
        },
        {
          model: Delegation,
          as: "delegation_name", // Use the alias from the association
          attributes: ["nom"],
        },
        {
          model: Gouvernerat,
          as: "gouvernerat_name", // Use the alias from the association
          attributes: ["nom"],
        },
        {
          model: Activite,
          as: "activite_name", // Use the alias from the association
        },
        {
          model: Potentiel,
          as: "potentiel_name", // Use the alias from the association
        },
      ],
      order: [
        // Order by a single column (ascending):
        ["nom", "ASC"],
      ],
    });

    res.json(allProspects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});old prospect search*/

router.post("/getAllProspectSearch", validator, async (req, res) => {
  const {
    nom,
    prenom,
    specialite,
    secteurs,
    delegation,
    potentiel,
    etablissement,
    activite,
    id,
  } = req.body;
  let specialiteValues = [];
  let secteursValues = [];
  let delegationValues = [];
  let potentielValues = [];
  let etabValues = [];
  let actvValues = [];

  if (etablissement && etablissement.length > 0) {
    etabValues = etablissement.map((option) => option.value);
  }

  if (activite && activite.length > 0) {
    actvValues = activite.map((option) => option.value);
  }

  if (specialite && specialite.length > 0) {
    specialiteValues = specialite.map((option) => option.value);
  }
  if (secteurs && secteurs.length > 0) {
    secteursValues = secteurs.map((option) => option.value);
  }
  if (delegation && delegation.length > 0) {
    delegationValues = delegation.map((option) => option.value);
  }
  if (potentiel && potentiel.length > 0) {
    potentielValues = potentiel.map((option) => option.value);
  }

  try {
    const allProspects = await Prospect.findAll({
      distinct: true, // THIS IS THE KEY FIX - prevents duplicates
      subQuery: false, // Helps with complex queries
      where: {
        public: "1",

        ...(nom && {
          nom: {
            [Op.like]: `%${nom}%`,
          },
        }),
        ...(prenom && {
          prenom: {
            [Op.like]: `%${prenom}%`,
          },
        }),
        ...(id && {
          id: {
            [Op.eq]: id,
          },
        }),
        ...(specialite &&
          specialite.length > 0 && { spec: { [Op.in]: specialiteValues } }),
        ...(secteurs &&
          secteurs.length > 0 && { gouvernorat: { [Op.in]: secteursValues } }),
        ...(delegation &&
          delegation.length > 0 && {
            delegation: { [Op.in]: delegationValues },
          }),
        ...(potentiel &&
          potentiel.length > 0 && { potentiel: { [Op.in]: potentielValues } }),

        ...(etablissement &&
          etablissement.length > 0 && {
            etablissement: { [Op.in]: etabValues },
          }),
        ...(activite &&
          activite.length > 0 && { activite: { [Op.in]: actvValues } }),
      },
      include: [
        {
          model: Specialite,
          as: "specialite",
          attributes: ["nom"],
        },
        {
          model: Delegation,
          as: "delegation_name",
          attributes: ["nom"],
        },
        {
          model: Gouvernerat,
          as: "gouvernerat_name",
          attributes: ["nom"],
        },
        {
          model: Activite,
          as: "activite_name",
        },
        {
          model: Etablisement,
          as: "etablissement_name",
          required: false,
        },
        {
          model: Potentiel,
          as: "potentiel_name",
        },
      ],
      order: [["nom", "ASC"]],
    });
    //console.log(allProspects.length);
    res.json(allProspects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllSecteur", validator, async (req, res) => {
  try {
    const allSecteurs = await Gouvernerat.findAll({
      where: {
        id: { [Op.ne]: 75 },
      },
      include:[
        {
          model: Zone,
          as: "zoneInfo",
          attributes: ["nom"],
        }
      ],
      order: [
        // Order by a single column (ascending):
        ["nom", "ASC"], ["zone", "ASC"]
      ],
    });

    res.status(200).json(allSecteurs);
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllSpecialite", validator, async (req, res) => {
  try {
    const allSecteurs = await Specialite.findAll({
      order: [
        // Order by a single column (ascending):
        ["nom", "ASC"],
      ],
    });

    res.status(200).json(allSecteurs);
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllEtablissement", validator, async (req, res) => {
  try {
    const allSecteurs = await Etablisement.findAll({
      order: [
        // Order by a single column (ascending):
        ["nom", "ASC"],
      ],
    });

    res.status(200).json(allSecteurs);
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllActivite", validator, async (req, res) => {
  try {
    const allActivite = await Activite.findAll({
      order: [
        // Order by a single column (ascending):
        ["nom", "ASC"],
      ],
    });

    res.status(200).json(allActivite);
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message });
  }
});
router.post("/getAllPotentiel", validator, async (req, res) => {
  try {
    const allPotentiel = await Potentiel.findAll({
      order: [
        // Order by a single column (ascending):
        ["valeur", "ASC"],
      ],
    });

    res.status(200).json(allPotentiel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getUserDLG", validator, async (req, res) => {
  const { id } = req.body;
  try {
    const userSectors = await Users.findOne({
      where: { id: id },
      include: {
        model: Prospect,
        as: "prospects", // Specify the alias here
        include: [
          {
            model: Gouvernerat,
            as: "gouvernerat_name", // Or Secteur if that is the correct model for sectors
          },
        ],
      },
    });

    /*  const secteurs = userSectors.Prospects.map(prospect => prospect.Secteur);
    const uniqueSecteurs = [...new Map(secteurs.map(s => [s.id, s])).values()];
*/

    const secteurs = userSectors.prospects.map(
      (prospect) => prospect.gouvernerat_name,
    );
    const uniqueSecteurs = [
      ...new Map(secteurs.map((s) => [s.id, s])).values(),
    ];
    res.json(secteurs);

    // Return an empty array if no sectors are found
  } catch (error) {
    console.error("Error fetching sectors for user:", error);
  }
});
router.post("/getAllPotentiel", validator, async (req, res) => {
  try {
    const allSecteurs = await Potentiel.findAll({
      order: [
        // Order by a single column (ascending):
        ["valeur", "ASC"],
      ],
    });

    res.status(200).json(allSecteurs);
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllDelegation", validator, async (req, res) => {
  //const { gouverneratIds } = req.body; // Supposons que 'gouverneratIds' soit un tableau ou une seule valeur
  //console.log(req.body.secteurs.length)

  try {
    let selectedValues = [];
    if (req.body.secteurs.length > 0) {
      selectedValues = req.body.secteurs.map((option) => option.value);
      const allDelegation = await Delegation.findAll({
        where: {
          gouv_id: selectedValues, // Filtrer par les ids de gouvernorat
        },
        order: [
          ["nom", "ASC"], // Trier par nom en ordre croissant
        ],
      });

      res.status(200).json(allDelegation);
    } else {
      const allDelegation = await Delegation.findAll({
        order: [
          ["nom", "ASC"], // Trier par nom en ordre croissant
        ],
      });

      res.status(200).json(allDelegation);
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getProgVisite", validator, async (req, res) => {
  const { start, end, user } = req.body;
  try {
    const allDelegation = await ProgVsite.findAll({
      where: {
        weekStart: {
          [Op.gte]: start,
        },
        weekEnd: {
          [Op.lte]: end,
        },
        user_id: user,
      },
      include: [
        {
          model: Prospect,
          required: true, // Ensures only ProgVsite entries with matching Prospect are included
          include: [
            {
              model: Specialite,
              as: "specialite",
              attributes: ["nom", "id"],
            },
            {
              model: Delegation,
              as: "delegation_name",
              attributes: ["nom", "id"],
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name",
              attributes: ["nom", "id"],
            },
            {
              model: Activite,
              as: "activite_name",
            },
            {
              model: Potentiel,
              as: "potentiel_name",
            },
            {
              model: Visite, // Include the Visite model

              required: false, // Allow null if no matching Visite
              as: "prospect",
              where: {
                type: 1,
                public: 1,
                id_visiteur: user,
                date_visite: {
                  [Op.between]: [start, end],
                },
              },
              attributes: ["id", "date_visite"], // Include relevant Visite fields
            },
          ],
        },
      ],
      order: [["pros_id", "ASC"]], // Sort by pros_id in ascending order
    });

    res.status(200).json(allDelegation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getProgVisiteStatistics", validator, async (req, res) => {
  const { start, end, user } = req.body;
  try {
    // First count the total number of prospects in ProgVsite for the given user and date range
    const totalProspects = await ProgVsite.count({
      where: {
        weekStart: {
          [Op.gte]: start,
        },
        weekEnd: {
          [Op.lte]: end,
        },
        user_id: user,
      },
    });

    // Then count the number of prospects in ProgVsite that also have a visit in the date range
    const visitedProspects = await ProgVsite.count({
      where: {
        weekStart: {
          [Op.gte]: start,
        },
        weekEnd: {
          [Op.lte]: end,
        },
        user_id: user,
      },
      include: [
        {
          model: Prospect,
          required: true,
          include: [
            {
              model: Visite,
              required: true,
              as: "prospect",
              where: {
                type: 1,
                public: 1,
                id_visiteur: user,
                date_visite: {
                  [Op.between]: [start, end],
                },
              },
            },
          ],
        },
      ],
    });

    // Return the statistics
    /*res.status(200).json({
      totalProspects, // Total number of prospects
      visitedProspects, // Number of prospects that have a visit
    });*/
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProgVisiteStatisticsAllUsers", validator, async (req, res) => {
  const { start, end } = req.body;
  try {
    // Retrieve all users
    const users = await User.findAll();

    // Create an array of promises to fetch statistics for each user
    const statisticsPromises = users.map(async (user) => {
      const userId = user.id;

      // Count the total number of prospects
      const totalProspects = await ProgVsite.count({
        where: {
          weekStart: {
            [Op.gte]: start,
          },
          weekEnd: {
            [Op.lte]: end,
          },
          user_id: userId,
        },
      });

      // Count the number of prospects with visits in the given date range
      const visitedProspects = await ProgVsite.count({
        where: {
          weekStart: {
            [Op.gte]: start,
          },
          weekEnd: {
            [Op.lte]: end,
          },
          user_id: userId,
        },
        include: [
          {
            model: Prospect,
            required: true,
            include: [
              {
                model: Specialite,
                as: "specialite", // Ensure the alias is correct based on your model definition
                attributes: ["nom", "id"],
              },
              {
                model: Potentiel,
                as: "potentiel_name", // Ensure the alias is correct based on your model definition
                attributes: ["nom", "id"],
              },
              {
                model: Visite,
                required: true,
                where: {
                  type: 1,
                  public: 1,
                  id_visiteur: userId,
                  date_visite: {
                    [Op.between]: [start, end],
                  },
                },
              },
            ],
          },
        ],
      });

      // Fetch detailed prospect data
      const prospectsDetails = await ProgVsite.findAll({
        where: {
          weekStart: {
            [Op.gte]: start,
          },
          weekEnd: {
            [Op.lte]: end,
          },
          user_id: userId,
        },
        include: [
          {
            model: Prospect,
            required: true,
            include: [
              {
                model: Specialite,
                as: "specialite", // Ensure the alias is correct based on your model definition
                attributes: ["nom", "id"],
              },
              {
                model: Potentiel,
                as: "potentiel_name", // Ensure the alias is correct based on your model definition
                attributes: ["nom", "id"],
              },
            ],
          },
        ],
      });

      // Return the statistics along with the detailed prospect information
      return {
        userId,
        userName: user.username, // Replace with the appropriate field
        totalProspects,
        visitedProspects,
        prospectDetails: prospectsDetails.map((prog) => {
          return {
            prospectId: prog.prospect.id,
            specialite: prog.prospect.specialite.nom,
            potentiel: prog.prospect.potentiel_name.nom,
          };
        }),
      };
    });

    // Wait for all statistics to be calculated
    const statistics = await Promise.all(statisticsPromises);

    // Return the statistics for all users
    res.status(200).json(statistics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/AddProgVisite", validator, async (req, res) => {
  const { start, end, user, pros, userCreate } = req.body;

  try {
    const prosdm = pros.map((item) => ({
      pros_id: item.id,
      user_id: user,
      weekStart: start,
      weekEnd: end,
      created_by: userCreate.id,
      date_prog_visite: start + "_" + end,
    }));

    //console.log(prosdm);
    const data = await ProgVsite.bulkCreate(prosdm);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Rapport de planification : liste des prospects planifiés sur un intervalle
// de semaines, avec statut d'affectation et date de visite réelle par semaine.
router.post("/getPlanificationReport", validator, async (req, res) => {
  const { DlgSelected, selectedDate, selectedDate2, year } = req.body;

  if (!selectedDate || !selectedDate2) {
    return res
      .status(400)
      .json({ error: "La période (de/à) est requise" });
  }

  const yearFilter = year || new Date(selectedDate).getFullYear();
  const userWhere = {};
  if (DlgSelected?.length) userWhere.id = { [Op.in]: DlgSelected };

  try {
    const progVisites = await ProgVsite.findAll({
      where: {
        weekStart: { [Op.gte]: selectedDate },
        weekEnd: { [Op.lte]: selectedDate2 },
      },
      include: [
        {
          model: Users,
          where: userWhere,
          required: true,
          attributes: {
            exclude: ["password", "pass", "login", "pwd_hashed"],
          },
        },
        {
          model: Prospect,
          required: true,
          include: [
            { model: Specialite, as: "specialite", attributes: ["id", "nom"] },
            {
              model: Delegation,
              as: "delegation_name",
              attributes: ["id", "nom"],
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name",
              attributes: ["id", "nom"],
            },
            { model: Activite, as: "activite_name" },
            { model: Potentiel, as: "potentiel_name" },
          ],
        },
      ],
      order: [
        ["weekStart", "ASC"],
        ["pros_id", "ASC"],
      ],
    });

    const prosIds = [...new Set(progVisites.map((pv) => pv.pros_id))];

    // Toutes les visites réalisées par le(s) délégué(s) filtré(s) durant la
    // période, indépendamment de la planification (nécessaire pour détecter
    // les visites faites sur des prospects absents de la planification).
    const [visites, affectations] = await Promise.all([
      Visite.findAll({
        where: {
          public: "1",
          type: 1,
          ...(DlgSelected?.length && {
            id_visiteur: { [Op.in]: DlgSelected },
          }),
          date_visite: { [Op.between]: [selectedDate, selectedDate2] },
        },
        attributes: ["id", "id_pros", "id_visiteur", "date_visite"],
      }),
      Affectation.findAll({
        where: {
          year: yearFilter,
          id_prospect: { [Op.in]: prosIds.length ? prosIds : [0] },
          ...(DlgSelected?.length && { id_deleg: { [Op.in]: DlgSelected } }),
        },
        attributes: ["id_prospect", "id_deleg"],
      }),
    ]);

    const affectSet = new Set(
      affectations.map((a) => `${a.id_prospect}-${a.id_deleg}`)
    );

    const result = progVisites.map((pv) => {
      const weekStart = new Date(pv.weekStart);
      const weekEnd = new Date(pv.weekEnd);
      const matchingVisite = visites.find(
        (v) =>
          v.id_visiteur === pv.user_id &&
          v.id_pros === pv.pros_id &&
          new Date(v.date_visite) >= weekStart &&
          new Date(v.date_visite) <= weekEnd
      );

      return {
        ...pv.toJSON(),
        isAffecte: affectSet.has(`${pv.pros_id}-${pv.user_id}`),
        dateVisite: matchingVisite ? matchingVisite.date_visite : null,
      };
    });

    // Visites réalisées sur des prospects absents de la planification
    // (aucune ligne de planification pour ce couple délégué + prospect)
    const visitesNonPlanifiees = visites.filter(
      (v) =>
        !progVisites.some(
          (pv) => pv.user_id === v.id_visiteur && pv.pros_id === v.id_pros
        )
    );

    res.status(200).json({
      planifications: result,
      nbVisites: visites.length,
      nbVisitesNonPlanifiees: visitesNonPlanifiees.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Planification par prospect : reprend les filtres de la liste des prospects
// et ajoute, pour un intervalle de semaines donné, les compteurs de visites /
// planifications ainsi que la liste des semaines où le prospect est planifié.
router.post("/getPlanificationProspects", validator, async (req, res) => {
  const {
    nom,
    prenom,
    id,
    specialite,
    secteurs,
    delegation,
    potentiel,
    etablissement,
    activite,
    selectedDate,
    selectedDate2,
  } = req.body;

  if (!selectedDate || !selectedDate2) {
    return res
      .status(400)
      .json({ error: "La période (de/à) est requise" });
  }

  const specialiteValues = specialite?.length
    ? specialite.map((option) => option.value)
    : [];
  const secteursValues = secteurs?.length
    ? secteurs.map((option) => option.value)
    : [];
  const delegationValues = delegation?.length
    ? delegation.map((option) => option.value)
    : [];
  const potentielValues = potentiel?.length
    ? potentiel.map((option) => option.value)
    : [];
  const etabValues = etablissement?.length
    ? etablissement.map((option) => option.value)
    : [];
  const actvValues = activite?.length
    ? activite.map((option) => option.value)
    : [];

  try {
    const prospects = await Prospect.findAll({
      where: {
        public: "1",
        ...(nom && { nom: { [Op.like]: `%${nom}%` } }),
        ...(prenom && { prenom: { [Op.like]: `%${prenom}%` } }),
        ...(id && { id: { [Op.eq]: id } }),
        ...(specialiteValues.length && {
          spec: { [Op.in]: specialiteValues },
        }),
        ...(secteursValues.length && {
          gouvernorat: { [Op.in]: secteursValues },
        }),
        ...(delegationValues.length && {
          delegation: { [Op.in]: delegationValues },
        }),
        ...(potentielValues.length && {
          potentiel: { [Op.in]: potentielValues },
        }),
        ...(etabValues.length && {
          etablissement: { [Op.in]: etabValues },
        }),
        ...(actvValues.length && { activite: { [Op.in]: actvValues } }),
      },
      include: [
        { model: Specialite, as: "specialite", attributes: ["nom"] },
        { model: Delegation, as: "delegation_name", attributes: ["nom"] },
        { model: Gouvernerat, as: "gouvernerat_name", attributes: ["nom"] },
        { model: Activite, as: "activite_name" },
        { model: Potentiel, as: "potentiel_name" },
      ],
      order: [["nom", "ASC"]],
    });

    const prosIds = prospects.map((p) => p.id);
    if (prosIds.length === 0) return res.status(200).json([]);

    const [visites, progVisites] = await Promise.all([
      Visite.findAll({
        where: {
          public: "1",
          type: 1,
          id_pros: { [Op.in]: prosIds },
          date_visite: { [Op.between]: [selectedDate, selectedDate2] },
        },
        attributes: ["id", "id_pros", "id_visiteur", "date_visite"],
      }),
      ProgVsite.findAll({
        where: {
          pros_id: { [Op.in]: prosIds },
          weekStart: { [Op.gte]: selectedDate },
          weekEnd: { [Op.lte]: selectedDate2 },
        },
        attributes: ["id", "pros_id", "user_id", "weekStart", "weekEnd"],
        order: [["weekStart", "ASC"]],
      }),
    ]);

    const result = prospects.map((p) => {
      const prosVisites = visites.filter((v) => v.id_pros === p.id);
      const prosPlanifs = progVisites.filter((pv) => pv.pros_id === p.id);

      const semaines = prosPlanifs.map((pv) => {
        const weekStart = new Date(pv.weekStart);
        const weekEnd = new Date(pv.weekEnd);
        const matchingVisite = prosVisites.find(
          (v) =>
            v.id_visiteur === pv.user_id &&
            new Date(v.date_visite) >= weekStart &&
            new Date(v.date_visite) <= weekEnd
        );
        return {
          weekStart: pv.weekStart,
          weekEnd: pv.weekEnd,
          isVisitee: !!matchingVisite,
          dateVisite: matchingVisite ? matchingVisite.date_visite : null,
        };
      });

      const nbPlanificationsVisitees = semaines.filter(
        (s) => s.isVisitee
      ).length;

      // Une visite est "planifiée" si ce prospect a une planification
      // existante pour le même délégué (peu importe la semaine exacte).
      const nbVisitesPlanifiees = prosVisites.filter((v) =>
        prosPlanifs.some((pv) => pv.user_id === v.id_visiteur)
      ).length;

      return {
        ...p.toJSON(),
        nbVisites: prosVisites.length,
        nbVisitesPlanifiees,
        nbVisitesNonPlanifiees: prosVisites.length - nbVisitesPlanifiees,
        nbPlanifications: prosPlanifs.length,
        nbPlanificationsVisitees,
        semaines,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllGrossiste", validator, async (req, res) => {
  const { year } = req.body;
  try {
    const allProspects = await Prospect.findAll({
      where: {
        public: 1,
        spec: { [Op.in]: [37, 38] }, // Use an array for Op.in
      },
      include: [
        {
          model: RatioGro,
          // Use the alias from the association
          attributes: ["ratio"],
        },
        {
          model: ObjectifGroBu,
          as: "obj_gro_bu",
          where: {
            year: year,
          },
          required: false,
        },
      ],
      attributes: ["nom", "prenom", "id", "IdFact"],
      order: [
        // Sort by id in ascending order
        ["nom", "ASC"],
      ],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.error(error); // Use console.error for better error visibility
    res.status(500).json({ error: error.message });
  }
});
router.post("/updateObjGro", validator, async (req, res) => {
  const { id, bu, year, obj } = req.body;
  let fieldToUpdate;
  switch (bu) {
    case "1":
      fieldToUpdate = "bu1";
      break;
    case "2":
      fieldToUpdate = "bu2";
      break;
    case "3":
      fieldToUpdate = "bu3";
      break;
    case "4":
      fieldToUpdate = "bu4";
      break;
    default:
      fieldToUpdate = null; // or handle the default case as needed
  }
  // console.log(id + " " + fieldToUpdate + " " + year + " " + obj);
  try {
    const allProspects = await ObjectifGroBu.findOne({
      where: {
        id_gro: id,

        year: year,
      }, // Match the id
    });

    if (allProspects) {
      const update = await ObjectifGroBu.update(
        { [fieldToUpdate]: obj },
        {
          where: {
            id_gro: id,

            year: year,
          }, // Match the id
        },
      );
      res.status(200).json(update);
    } else {
      const update = await ObjectifGroBu.create({
        [fieldToUpdate]: obj,
        id_gro: id,

        year: year,
      });
      res.status(200).json(update);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getProgVisiteWithFilter", validator, async (req, res) => {
  const {
    userTrans,
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
  try {
    const allDelegation = await ProgVsite.findAll({
      where: {
        weekStart: {
          [Op.gte]: selectedDate,
        },
        weekEnd: {
          [Op.lte]: selectedDate2,
        },
      },
      include: [
        {
          model: Prospect,
          as: "prospect",
          where: {
            public: "1",
            ...(sepecialiteSelected &&
              sepecialiteSelected.length > 0 && {
                spec: { [Sequelize.Op.in]: sepecialiteSelected },
              }),
            ...(activiteSelected &&
              activiteSelected.length > 0 && {
                activite: { [Sequelize.Op.in]: activiteSelected },
              }),
            ...(potenetielSelected &&
              potenetielSelected.length > 0 && {
                potentiel: { [Sequelize.Op.in]: potenetielSelected },
              }),
          },
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
          model: Users,

          ...(DlgSelected &&
            DlgSelected.length > 0 && {
              where: {
                id: { [Sequelize.Op.in]: DlgSelected },
              },
            }),

          ...(zoneSelected &&
            zoneSelected.length > 0 && {
              where: {
                zone2: { [Sequelize.Op.in]: zoneSelected },
              },
            }),
          ...(typeDlgSelected &&
            typeDlgSelected.length > 0 && {
              where: {
                type: { [Sequelize.Op.in]: typeDlgSelected },
              },
            }),
        },
        {
          model: Prospect,
          as: "prospect",
          where: {
            public: "1",
            ...(sepecialiteSelected &&
              sepecialiteSelected.length > 0 && {
                spec: { [Sequelize.Op.in]: sepecialiteSelected },
              }),
            ...(activiteSelected &&
              activiteSelected.length > 0 && {
                activite: { [Sequelize.Op.in]: activiteSelected },
              }),
            ...(potenetielSelected &&
              potenetielSelected.length > 0 && {
                potentiel: { [Sequelize.Op.in]: potenetielSelected },
              }),
          },
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
      ],
      order: [["pros_id", "ASC"]], // Sort by pros_id in ascending order
    });

    res.status(200).json(allDelegation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllProgVisite", validator, async (req, res) => {
  const {
    userTrans,
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
  try {
    const allDelegation = await ProgVsite.findAll({
      where: {
        weekStart: {
          [Op.gte]: selectedDate,
        },
        weekEnd: {
          [Op.lte]: selectedDate2,
        },
      },

      include: [
        {
          model: Users,

          ...(DlgSelected &&
            DlgSelected.length > 0 && {
              where: {
                id: { [Sequelize.Op.in]: DlgSelected },
              },
            }),

          ...(zoneSelected &&
            zoneSelected.length > 0 && {
              where: {
                zone2: { [Sequelize.Op.in]: zoneSelected },
              },
            }),
          ...(typeDlgSelected &&
            typeDlgSelected.length > 0 && {
              where: {
                type: { [Sequelize.Op.in]: typeDlgSelected },
              },
            }),
          attributes: {
            exclude: ["password", "pass", "login", "pwd_hashed"],
          },
        },
        {
          model: Prospect,
          as: "prospect",
          where: {
            public: "1",
            ...(sepecialiteSelected &&
              sepecialiteSelected.length > 0 && {
                spec: { [Sequelize.Op.in]: sepecialiteSelected },
              }),
            ...(activiteSelected &&
              activiteSelected.length > 0 && {
                activite: { [Sequelize.Op.in]: activiteSelected },
              }),
            ...(potenetielSelected &&
              potenetielSelected.length > 0 && {
                potentiel: { [Sequelize.Op.in]: potenetielSelected },
              }),
          },
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
      ],
      order: [["pros_id", "ASC"]], // Sort by pros_id in ascending order
    });

    res.status(200).json(allDelegation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getAllDetProsDlgs", validator, async (req, res) => {
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

  const dateObj = new Date(selectedDate);

  // Option 2: Using string manipulation (faster if you know the exact format)
  const year = selectedDate.split("-")[0]; // For "YYYY-MM-DD" format
  const prospectWhere = { public: "1" };
  if (sepecialiteSelected?.length)
    prospectWhere.spec = { [Sequelize.Op.in]: sepecialiteSelected };
  if (activiteSelected?.length)
    prospectWhere.activite = { [Sequelize.Op.in]: activiteSelected };
  if (potenetielSelected?.length)
    prospectWhere.potentiel = { [Sequelize.Op.in]: potenetielSelected };
  const userWhere = {};
  if (DlgSelected?.length) userWhere.id = { [Sequelize.Op.in]: DlgSelected };
  if (zoneSelected?.length)
    userWhere.zone2 = { [Sequelize.Op.in]: zoneSelected };
  if (typeDlgSelected?.length)
    userWhere.type = { [Sequelize.Op.in]: typeDlgSelected };

  try {
    const allProspects = await Affectation.findAll({
      where: {
        ...(year && {
          year: year,
        }),
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
          include: [
            {
              model: Specialite,
              as: "specialite",
              attributes: ["id", "nom"],
              required: false,
            },
            {
              model: Delegation,
              as: "delegation_name",
              attributes: ["id", "nom"],
              required: false,
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name",
              attributes: ["id", "nom"],
              required: false,
            },
          ],
        },
      ],
      order: [["id_prospect", "ASC"]],
    });

    res.status(200).json(allProspects);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getDetDlgAff", validator, async (req, res) => {
  const id = req.body.id;
  //const year = req.body.year;
  const de = req.body.de;
  const a = req.body.a;

  const d = new Date(de);
  let year = d.getFullYear();

  try {
    const allProspects = await Affectation.findAll({
      where: {
        id_deleg: id,
        year: year,
      },
      include: [
        {
          model: Prospect,
          required: true,
          where: {
            public: 1,
          },
          include: [
            {
              model: Specialite,
              as: "specialite", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Delegation,
              as: "delegation_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Gouvernerat,
              as: "gouvernerat_name", // Use alias
              attributes: ["nom", "id", "poids", "zone"],
            },
            {
              model: Activite,
              as: "activite_name", // Use alias
              attributes: ["nom", "id"],
            },
            {
              model: Potentiel,
              as: "potentiel_name", // Use alias
              attributes: ["valeur", "id"],
            },
          ],
        },
      ],
      order: [["id_prospect", "ASC"]], // Order by prospect ID
    });

    // Extract unique secteurs
    const secteurs = allProspects
      .map((prospect) => prospect.prospect.gouvernerat_name)
      .filter(
        (gouvernerat) => gouvernerat !== null && gouvernerat !== undefined,
      )
      .map((gouvernerat) => gouvernerat.dataValues); // Access dataValues

    const secteursArray = [
      ...new Map(
        secteurs.map((s) => [
          s.id,
          { value: s.id, label: s.nom, poids: s.poids, zone: s.zone },
        ]),
      ).values(),
    ];

    // Extract unique delegations
    const deleg = allProspects
      .map((prospect) => prospect.prospect.delegation_name)
      .filter((delegation) => delegation !== null && delegation !== undefined)
      .map((delegation) => delegation.dataValues); // Access dataValues

    const delegationArray = [
      ...new Map(
        deleg.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];

    // Extract unique specialites
    const specialites = allProspects
      .map((prospect) => prospect.prospect.specialite)
      .filter((specialite) => specialite !== null && specialite !== undefined)
      .map((specialite) => specialite.dataValues); // Access dataValues

    const specialitesArray = [
      ...new Map(
        specialites.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];

    // Extract unique activites
    const activites = allProspects
      .map((prospect) => prospect.prospect.activite_name)
      .filter((activite) => activite !== null && activite !== undefined)
      .map((activite) => activite.dataValues); // Access dataValues

    const activitesArray = [
      ...new Map(
        activites.map((s) => [s.id, { value: s.id, label: s.nom }]),
      ).values(),
    ];

    // Extract unique potentiels
    const potentiels = allProspects
      .map((prospect) => prospect.prospect.potentiel_name)
      .filter((potentiel) => potentiel !== null && potentiel !== undefined)
      .map((potentiel) => potentiel.dataValues); // Access dataValues

    const potentielsArray = [
      ...new Map(
        potentiels.map((s) => [s.id, { value: s.id, label: s.valeur }]),
      ).values(),
    ];

    res.status(200).json({
      secteursArray,
      delegationArray,
      specialitesArray,
      activitesArray,
      potentielsArray,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/getCodePostal", validator, async (req, res) => {
  const { id_del } = req.body;

  if (!id_del) {
    return res.status(400).json({ message: "ID délégation requis" });
  }

  try {
    const codePostal = await PostalCode.findOne({
      where: { id_del: id_del },
    });

    if (codePostal) {
      res.status(200).json(codePostal);
    } else {
      res.status(200).json({ nom: "" });
    }
  } catch (error) {
    console.error("Error fetching code postal:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add new prospect
router.post("/addProspect", validator, async (req, res) => {
  const {
    nom,
    prenom,
    tel,
    tel_2,
    gsm,
    gsm_2,
    fax,
    email,
    mf,
    adresse,
    code_postal,
    service,
    commentaire,
    spec,
    gouvernorat,
    delegation,
    activite,
    etablissement,
    potentiel,
    phyto,
    dermo,
    type_fid,
    cree_par,
    addVisite,
  } = req.body;

  try {
    // Check if prospect with same MF already exists (if MF is provided and not default)
    /*if (mf && mf !== '0000') {
      const existingProspect = await Prospect.findOne({
        where: { mf: mf }
      });

      if (existingProspect) {
        return res.status(409).json({
          message: "Un prospect avec ce matricule fiscale existe déjà"
        });
      }
    }*/

    // Create prospect data object
    const prospectData = {
      nom: nom?.trim() || null,
      prenom: prenom?.trim() || null,
      tel: tel?.trim() || null,
      tel_2: tel_2?.trim() || null,
      gsm: gsm?.trim() || null,
      gsm_2: gsm_2?.trim() || null,
      fax: fax?.trim() || null,
      email: email?.trim() || null,
      mf: mf || "0000",
      adresse: adresse?.trim() || null,
      code_postal: code_postal || null,
      service: service?.trim() || null,
      commentaire: commentaire?.trim() || null,
      spec: spec || null,
      gouvernorat: gouvernorat || null,
      delegation: delegation || null,
      activite: activite || null,
      etablissement: etablissement || null,
      potentiel: potentiel || null,
      phyto: phyto || 0,
      dermo: dermo || 0,
      type_fid: type_fid || 3,
      public: 0, // Default to private (0)
      cree_par: cree_par || 0,
      modifier_par: 0,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    // Create the prospect
    const newProspect = await Prospect.create(prospectData);

    if (!newProspect) {
      return res.status(500).json({
        message: "Erreur lors de la création du prospect",
      });
    }

    // Return success response
    return res.status(200).json({
      message: `Le prospect ${nom} ${prenom} a été ajouté avec succès`,
      id: newProspect.id,
      prospect: newProspect,
      addVisite: addVisite || false,
    });
  } catch (error) {
    console.error("Error adding prospect:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'ajout du prospect",
      error: error.message,
    });
  }
});

// Update an existing prospect
router.put("/updateProspect/:id", validator, async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    prenom,
    tel,
    tel_2,
    gsm,
    gsm_2,
    fax,
    email,
    mf,
    adresse,
    code_postal,
    service,
    commentaire,
    spec,
    gouvernorat,
    delegation,
    activite,
    etablissement,
    potentiel,
    phyto,
    dermo,
    type_fid,
    modifier_par,
  } = req.body;

  try {
    const prospect = await Prospect.findByPk(id);

    if (!prospect) {
      return res.status(404).json({
        message: "Prospect non trouvé",
      });
    }

    // Check if updating MF and if it already exists for another prospect
    if (mf && mf !== "0000" && mf !== prospect.mf) {
      const existingProspect = await Prospect.findOne({
        where: {
          mf: mf,
          id: { [Op.ne]: id },
        },
      });

      if (existingProspect) {
        return res.status(409).json({
          message: "Un autre prospect avec ce matricule fiscale existe déjà",
        });
      }
    }

    // Update prospect data
    const updateData = {
      nom: nom?.trim() || null,
      prenom: prenom?.trim() || null,
      tel: tel?.trim() || null,
      tel_2: tel_2?.trim() || null,
      gsm: gsm?.trim() || null,
      gsm_2: gsm_2?.trim() || null,
      fax: fax?.trim() || null,
      email: email?.trim() || null,
      mf: mf || "0000",
      adresse: adresse?.trim() || null,
      code_postal: code_postal || null,
      service: service?.trim() || null,
      commentaire: commentaire?.trim() || null,
      spec: spec || null,
      gouvernorat: gouvernorat || null,
      delegation: delegation || null,
      activite: activite || null,
      etablissement: etablissement || null,
      potentiel: potentiel || null,
      phyto: phyto || 0,
      dermo: dermo || 0,
      type_fid: type_fid || 3,
      modifier_par: modifier_par || 0,
      updated_at: new Date(),
    };

    await prospect.update(updateData);

    return res.status(200).json({
      message: `Le prospect ${nom} ${prenom} a été modifié avec succès`,
      prospect: prospect,
    });
  } catch (error) {
    console.error("Error updating prospect:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la modification du prospect",
      error: error.message,
    });
  }
});

// Delete a prospect (soft delete by setting public to 0)
router.delete("/deleteProspect/:id", validator, async (req, res) => {
  const { id } = req.params;
  const { modifier_par } = req.body;

  try {
    const prospect = await Prospect.findByPk(id);

    if (!prospect) {
      return res.status(404).json({
        message: "Prospect non trouvé",
      });
    }

    // Soft delete - set public to 0
    await prospect.update({
      public: 0,
      modifier_par: modifier_par || 0,
      updated_at: new Date(),
    });

    return res.status(200).json({
      message: "Prospect supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression du prospect",
      error: error.message,
    });
  }
});
router.post("/getPendingProspects", validator, async (req, res) => {
  const { userTrans } = req.body;

  const usersIds = await getUsers(userTrans);
  console.log(usersIds);
  // const userIds = allProspects.map(u => u.id);

  try {
    const allProspects = await Prospect.findAll({
      where: {
        public: {
          [Op.in]: [0], // Get all: pending (0), validated (1), rejected (-1)
        },
      },
      include: [
        {
          model: Specialite,
          as: "specialite",
          attributes: ["nom", "id"],
        },
        {
          model: Delegation,
          as: "delegation_name",
          attributes: ["nom", "id"],
        },
        {
          model: Gouvernerat,
          as: "gouvernerat_name",
          attributes: ["nom", "id"],
        },
        {
          model: Activite,
          as: "activite_name",
          attributes: ["nom", "id"],
        },
        {
          model: Etablisement,
          as: "etablissement_name",
          attributes: ["nom", "id"],
          required: false,
        },
        {
          model: Potentiel,
          as: "potentiel_name",
          attributes: ["valeur", "id"],
        },
        {
          model: Users,
          as: "user_creator", // You need to create this association
          attributes: ["nom", "prenom", "id"],
          required: false,
          foreignKey: "cree_par",
        },
      ],
      order: [
        ["created_at", "DESC"], // Most recent first
        ["nom", "ASC"],
      ],
    });

    // Transform data to include user info
    const transformedProspects = allProspects.map((prospect) => {
      const prospectData = prospect.toJSON();
      return {
        ...prospectData,
        user: prospectData.user_creator || null,
      };
    });

    res.status(200).json(transformedProspects);
  } catch (error) {
    console.error("Error fetching pending prospects:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get prospects filtered by creator (cree_par)
router.post("/getProspectsByCreator", validator, async (req, res) => {
  const { cree_par } = req.body;

  if (!cree_par) {
    return res.status(400).json({ message: "ID créateur requis" });
  }

  try {
    const allProspects = await Prospect.findAll({
      where: {
        cree_par: cree_par,
        public: {
          [Op.in]: [0, 1, -1],
        },
      },
      include: [
        {
          model: Specialite,
          as: "specialite",
          attributes: ["nom", "id"],
        },
        {
          model: Delegation,
          as: "delegation_name",
          attributes: ["nom", "id"],
        },
        {
          model: Gouvernerat,
          as: "gouvernerat_name",
          attributes: ["nom", "id"],
        },
        {
          model: Activite,
          as: "activite_name",
          attributes: ["nom", "id"],
        },
        {
          model: Etablisement,
          as: "etablissement_name",
          attributes: ["nom", "id"],
          required: false,
        },
        {
          model: Potentiel,
          as: "potentiel_name",
          attributes: ["valeur", "id"],
        },
        {
          model: Users,
          as: "user_creator",
          attributes: ["nom", "prenom", "id"],
          required: false,
          foreignKey: "cree_par",
        },
      ],
      order: [
        ["created_at", "DESC"],
        ["nom", "ASC"],
      ],
    });

    const transformedProspects = allProspects.map((prospect) => {
      const prospectData = prospect.toJSON();
      return {
        ...prospectData,
        user: prospectData.user_creator || null,
      };
    });

    res.status(200).json(transformedProspects);
  } catch (error) {
    console.error("Error fetching prospects by creator:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/getLastRestPoint", validator, async (req, res) => {
  const { idPros } = req.body;
  if (!idPros) return res.status(400).json({ rest_point: null });
  try {
    const last = await GrmDemandeCadeaux.findOne({
      where: { id_pros: idPros },
      attributes: ["id", "rest_point", "point_bonus", "date_remise_point"],
      order: [["id", "DESC"]],
    });
    res.status(200).json(last ? last.toJSON() : { rest_point: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// routes/bonus.js
router.post("/getCadeauxPros", async (req, res) => {
  const { idPros, year } = req.body;

  if (!idPros) {
    return res.status(400).json({ message: "idPros est requis" });
  }

  const targetYear = year || new Date().getFullYear();

  // ✅ Replace sequelize.fn('YEAR',...) with a simple date range
  const startDate = `${targetYear}-01-01`;
  const endDate = `${targetYear}-12-31`;

  try {
    const demandes = await GrmDemandeCadeaux.findAll({
      where: {
        id_pros: idPros,
        date_validation: {
          [Op.between]: [startDate, endDate], // ✅ no sequelize.fn needed
        },
      },
      include: [
        {
          model: Users,
          as: "demandeur",
          attributes: ["id", "Nom", "Prenom"],
        },
        {
          model: GrmCadeauxDemander,
          as: "cadeaux",
          include: [
            {
              model: Products,
              as: "product",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: GrmGift,
              as: "gift",
              attributes: ["id", "titre"],
              required: false,
            },
          ],
        },
      ],
      order: [["date_validation", "ASC"]],
    });

    const result = demandes.map((d) => {
      const plain = d.toJSON();
      return {
        id: plain.id,
        date_remise_point: plain.date_remise_point,
        point_bonus: plain.point_bonus,
        etat: plain.etat,
        rest_point: plain.rest_point,
        date_livraison: plain.date_livraison,
        delegue_nom: plain.demandeur?.Nom || "—",
        delegue_prenom: plain.demandeur?.Prenom || "",
        cadeaux: (plain.cadeaux || []).slice(0, 6).map((c) => ({
          qte: c.qte,
          nom: c.type_cdx === 1 ? c.product?.name || "—" : c.gift?.titre || "—",
        })),
        cadeaux_total: (plain.cadeaux || []).length,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching cadeaux:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Validate or reject a prospect
router.put("/validateProspect/:id", validator, async (req, res) => {
  const { id } = req.params;
  const {
    public: publicStatus,
    modifier_par,
    commentaire_refus,
    id_deleg, // Optional: specific delegate to assign to
    year, // Optional: specific year, defaults to current year
  } = req.body;

  // Validate public status
  if (![0, 1, -1].includes(publicStatus)) {
    return res.status(400).json({
      message:
        "Statut invalide. Utilisez 0 (en attente), 1 (validé) ou -1 (refusé)",
    });
  }

  try {
    const prospect = await Prospect.findByPk(id);

    if (!prospect) {
      return res.status(404).json({
        message: "Prospect non trouvé",
      });
    }

    // Update prospect status
    const updateData = {
      public: publicStatus,
      modifier_par: modifier_par || 0,
      updated_at: new Date(),
    };

    // If rejected, add rejection comment to the main commentaire
    if (publicStatus === -1 && commentaire_refus) {
      const existingComment = prospect.commentaire || "";
      const rejectionNote = `\n\n--- REFUSÉ ---\nRaison: ${commentaire_refus}\nDate: ${new Date().toLocaleString("fr-FR")}`;
      updateData.commentaire = existingComment + rejectionNote;
    }

    await prospect.update(updateData);

    // If validated, create affectation automatically
    if (publicStatus === 1) {
      // Determine delegate: use provided id_deleg, or fall back to creator
      const delegateId = id_deleg || prospect.cree_par;

      // Determine year: use provided year, or current year
      const affectationYear = new Date().getFullYear();

      if (!delegateId) {
        return res.status(400).json({
          message:
            "Impossible de créer l'affectation: aucun délégué spécifié et le prospect n'a pas de créateur",
        });
      }

      // Check if affectation already exists
      const existingAffectation = await Affectation.findOne({
        where: {
          id_deleg: delegateId,
          id_prospect: id,
          year: affectationYear,
        },
      });

      if (!existingAffectation) {
        // Create new affectation
        await Affectation.create({
          id_deleg: delegateId,
          id_prospect: id,
          year: affectationYear,
          affecter_par: modifier_par || 0,
        });
      }
    }

    const statusText =
      publicStatus === 1
        ? "validé et affecté"
        : publicStatus === -1
          ? "refusé"
          : "mis en attente";

    return res.status(200).json({
      message: `Le prospect a été ${statusText} avec succès`,
      prospect: prospect,
    });
  } catch (error) {
    console.error("Error validating prospect:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la validation du prospect",
      error: error.message,
    });
  }
});

// Get statistics for pending prospects
router.post("/getProspectsStats", validator, async (req, res) => {
  try {
    const [pending, validated, rejected] = await Promise.all([
      Prospect.count({ where: { public: 0 } }),
      Prospect.count({ where: { public: 1 } }),
      Prospect.count({ where: { public: -1 } }),
    ]);

    res.status(200).json({
      pending,
      validated,
      rejected,
      total: pending + validated + rejected,
    });
  } catch (error) {
    console.error("Error fetching prospects stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get prospects statistics by user
router.post("/getProspectsStatsByUser", validator, async (req, res) => {
  try {
    const stats = await Prospect.findAll({
      attributes: [
        "cree_par",
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN public = 0 THEN 1 ELSE 0 END"),
          ),
          "pending",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN public = 1 THEN 1 ELSE 0 END"),
          ),
          "validated",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN public = -1 THEN 1 ELSE 0 END"),
          ),
          "rejected",
        ],
      ],
      include: [
        {
          model: Users,
          as: "user_creator",
          attributes: ["nom", "prenom", "id"],
          required: false,
        },
      ],
      group: ["cree_par", "user_creator.id"],
      raw: false,
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching prospects stats by user:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/addEditRequest", async (req, res) => {
  try {
    const {
      id_pros,
      nom,
      prenom,
      potentiel,
      tel,
      tel_2,
      gsm,
      gsm_2,
      fax,
      email,
      activite,
      etablissement,
      spec,
      gouvernorat,
      delegation,
      adresse,
      service,
      code_postal,
      phyto,
      dermo,
      type_fid,
      created_by,
    } = req.body;
   // console.log(req.body);
    if (!id_pros) {
      return res.status(400).json({ message: "id_pros est requis" });
    }

    const newRequest = await EditProspectDmd.create({
      id_pros,
      // ✅ String fields → '' au lieu de null
      // Sequelize omet les champs null du INSERT → ER_NO_DEFAULT_FOR_FIELD
      nom: nom || "",
      prenom: prenom || "",
      tel: tel || "",
      tel_2: tel_2 || "",
      gsm: gsm || "",
      gsm_2: gsm_2 || "",
      fax: fax || "",
      email: email || "",
      adresse: adresse || "",
      service: service || "",
      code_postal: code_postal || "",

      potentiel: potentiel || 0,
      activite: activite || 0,
      etablissement: etablissement || 0,
      spec: spec || 0,
      gouvernorat: gouvernorat || 0,
      delegation: delegation || 0,
      type_fid: type_fid || 0,

      phyto: phyto ?? 0,
      dermo: dermo ?? 0,
      created_by,
      created_at: new Date(),
      validate: 0,
    });

    return res
      .status(200)
      .json({ id: newRequest.id, message: "Demande enregistrée" });
  } catch (error) {
    console.error("addEditRequest error:", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /prospect/getPendingEditRequests
// Returns all pending edit requests (validate = 0) with new + old prospect data
// ─────────────────────────────────────────────────────────────────────────────
router.post("/getPendingEditRequests", async (req, res) => {
  try {
    const { userTrans } = req.body;

    // ── Build WHERE for edit_prospect_dmd ────────────────────────
    let whereCreatedBy = {};

    if (
      userTrans.type == 1001 ||
      (userTrans.type == 1 && userTrans.zone2 == 0)
    ) {
      // Admin global → toutes les demandes
      whereCreatedBy = {};
    } else if (
      (userTrans.type == 2 && userTrans.sup == 1) ||
      (userTrans.type == 1 && userTrans.zone2 != 0)
    ) {
      // Chef de zone → demandes des délégués de sa zone
      const usersInZone = await Users.findAll({
        where: {
          active: 1,
          zone2: userTrans.zone2,
          type: { [Op.in]: [2, 3, 4] },
        },
        attributes: ["id"],
      });
      const ids = usersInZone.map((u) => u.id);
      whereCreatedBy = { created_by: { [Op.in]: ids } };
    } else if (userTrans.type == 2 && userTrans.sup == 0) {
      // Superviseur → demandes de ses subordonnés uniquement
      const liste = await Liste.findAll({
        where: { supID: userTrans.id },
        attributes: [],
        include: [
          {
            model: Users,
            as: "user",
            where: { active: 1, type: { [Op.in]: [3, 4] } },
            attributes: ["id"],
          },
        ],
      });
      const ids = liste.map((l) => l.user.id);
      whereCreatedBy = { created_by: { [Op.in]: [userTrans.id, ...ids] } };
    } else {
      // Délégué → seulement ses propres demandes
      whereCreatedBy = { created_by: userTrans.id };
    }

    // ── Fetch requests with new + old labels ─────────────────────
    const requests = await EditProspectDmd.findAll({
      where: { validate: 0, ...whereCreatedBy },
      include: [
        {
          model: Potentiel,
          as: "potentiel_new",
          attributes: ["id", "valeur"],
          required: false,
        },
        {
          model: Specialite,
          as: "spec_new",
          attributes: ["id", "nom"],
          required: false,
        },
        {
          model: Activite,
          as: "activite_new",
          attributes: ["id", "nom"],
          required: false,
        },
        {
          model: Etablisement,
          as: "etablissement_new",
          attributes: ["id", "nom"],
          required: false,
        },
        {
          model: Users,
          as: "creator",
          attributes: ["id", "nom", "prenom"],
          required: false,
        },
        {
          model: Prospect,
          as: "prospect",
          attributes: [
            "id",
            "nom",
            "prenom",
            "tel",
            "tel_2",
            "gsm",
            "gsm_2",
            "fax",
            "email",
            "adresse",
            "service",
            "code_postal",
            "phyto",
            "dermo",
            "type_fid",
            "potentiel",
            "spec",
            "activite",
            "etablissement",
          ],
          required: true,
          include: [
            {
              model: Potentiel,
              as: "potentiel_name",
              attributes: ["id", "valeur"],
              required: false,
            },
            {
              model: Specialite,
              as: "specialite",
              attributes: ["id", "nom"],
              required: false,
            },
            {
              model: Activite,
              as: "activite_name",
              attributes: ["id", "nom"],
              required: false,
            },
            {
              model: Etablisement,
              as: "etablissement_name",
              attributes: ["id", "nom"],
              required: false,
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // ── Reshape response ─────────────────────────────────────────
    const result = requests.map((req) => {
      const r = req.toJSON();
      const old = r.prospect;
      return {
        id: r.id,
        id_pros: r.id_pros,
        validate: r.validate,
        created_by: r.created_by,
        created_by_name: r.creator
          ? `${r.creator.nom} ${r.creator.prenom}`
          : "-",
        created_at: r.created_at,
        // NEW values
        nom: r.nom,
        prenom: r.prenom,
        tel: r.tel,
        tel_2: r.tel_2,
        gsm: r.gsm,
        gsm_2: r.gsm_2,
        fax: r.fax,
        email: r.email,
        adresse: r.adresse,
        service: r.service,
        code_postal: r.code_postal,
        phyto: r.phyto,
        dermo: r.dermo,
        type_fid: r.type_fid,
        gouvernorat: r.gouvernorat,
        delegation: r.delegation,
        potentiel_label: r.potentiel_new?.valeur || null,
        spec_label: r.spec_new?.nom || null,
        activite_label: r.activite_new?.nom || null,
        etablissement_label: r.etablissement_new?.nom || null,
        // OLD values
        old: {
          nom: old?.nom,
          prenom: old?.prenom,
          tel: old?.tel,
          tel_2: old?.tel_2,
          gsm: old?.gsm,
          gsm_2: old?.gsm_2,
          fax: old?.fax,
          email: old?.email,
          adresse: old?.adresse,
          service: old?.service,
          code_postal: old?.code_postal,
          phyto: old?.phyto,
          dermo: old?.dermo,
          type_fid: old?.type_fid,
          potentiel_label: old?.potentiel_name?.valeur || null,
          spec_label: old?.specialite?.nom || null,
          activite_label: old?.activite_name?.nom || null,
          etablissement_label: old?.etablissement_name?.nom || null,
        },
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("getPendingEditRequests error:", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /prospect/validateEditRequest/:id
// validate = 1  → applies changes to prospect + marks request as validated
// validate = -1 → only marks request as rejected, prospect untouched
// ─────────────────────────────────────────────────────────────────────────────
router.put("/validateEditRequest/:id", async (req, res) => {
  const dmdId = parseInt(req.params.id, 10);
  if (!dmdId) return res.status(400).json({ message: "ID invalide" });

  const { validate, validated_by, commentaire_refus } = req.body;

  try {
    // 1. Find the edit request
    const dmd = await EditProspectDmd.findOne({ where: { id: dmdId } });

    if (!dmd) {
      return res.status(404).json({ message: "Demande introuvable" });
    }

    // 2. If validated → apply only non-null/non-empty fields to the prospect
    if (validate === 1) {
      // Text fields that can be intentionally cleared (empty string = clear)
      const clearableTextFields = ["tel", "tel_2", "gsm", "gsm_2", "fax", "email", "adresse", "service"];
      // Required/ID fields: only apply if non-empty
      const requiredFields = [
        "nom", "prenom", "potentiel", "activite", "etablissement",
        "spec", "gouvernorat", "delegation", "code_postal", "phyto", "dermo", "type_fid",
      ];

      const fieldsToUpdate = {};
      // Allow empty string for optional text fields (user intentionally cleared)
      clearableTextFields.forEach(field => {
        if (dmd[field] !== null && dmd[field] !== undefined) {
          fieldsToUpdate[field] = dmd[field];
        }
      });
      // Skip empty for required/ID fields
      requiredFields.forEach(field => {
        const val = dmd[field];
        if (val !== null && val !== undefined && val !== "") {
          fieldsToUpdate[field] = val;
        }
      });

      if (Object.keys(fieldsToUpdate).length > 0) {
        await Prospect.update(
          { ...fieldsToUpdate, modifier_par: validated_by },
          { where: { id: dmd.id_pros } },
        );
      }
    }

    // 3. Mark the edit request as validated or rejected
    await dmd.update({
      validate,
      validated_by,
      validated_at: new Date(),
      commentaire_refus: commentaire_refus || null,
    });

    return res.status(200).json({
      message:
        validate === 1
          ? "Modification appliquée avec succès"
          : "Demande de modification refusée",
    });
  } catch (error) {
    console.error("validateEditRequest error:", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
});
router.post("/fusionProspect", validator, async (req, res) => {
  const { currentId, targetId } = req.body;

  try {
    // Verify target prospect exists and is public
    const target = await Prospect.findOne({
      where: { id: targetId, public: { [Op.gt]: 0 } },
    });
    if (!target) {
      return res
        .status(404)
        .json({ message: "Prospect cible introuvable ou non public" });
    }

    // Count visites of current prospect
    const visitesCount = await Visite.count({ where: { id_pros: currentId } });

    // Move all visites to target prospect
    await Visite.update({ id_pros: targetId }, { where: { id_pros: currentId } });

    // Mark current prospect as merged (public = -1)
    await Prospect.update(
      {
        public: -1,
        pkr: `fusioner avec id : ${targetId} qui a ${visitesCount} visites`,
      },
      { where: { id: currentId } }
    );

    return res.status(200).json({ message: "Fusion effectuée avec succès" });
  } catch (error) {
    console.error("fusionProspect error:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
