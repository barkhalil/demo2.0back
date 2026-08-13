const { sequelize, sequelize2 } = require("../database");
const express = require("express");
const { Sequelize } = require("sequelize");
const router = express.Router();
const validator = require("../midelware/validator");

router.post("/getRecapFrais", validator, async (req, res) => {
  const { de, a } = req.body;

  // Year-start for cumulative calcs (year derived from de)
  const yearStart = `${de.substring(0, 4)}-01-01`;
  // Month number from end date (used for supervisor forfait cumul)
  const nbMonth = parseInt(a.substring(5, 7));

  try {
    // 1. All active delegates/supervisors/animatrices
    const users = await sequelize.query(
      `SELECT u.id, u.Nom, u.Prenom, u.type, ut.name as typeName
       FROM users u
       LEFT JOIN user_type ut ON ut.id = u.type
       WHERE u.active = 1 AND u.type IN (2, 3, 4, 5)
       ORDER BY u.type ASC, u.Nom ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const result = await Promise.all(
      users.map(async (user) => {
        const userId = user.id;
        const userType = parseInt(user.type);

        // matricule from parc_auto
        const parcRows = await sequelize.query(
          `SELECT mat_rh FROM parc_auto WHERE codeCrm = :id LIMIT 1`,
          {
            replacements: { id: userId },
            type: Sequelize.QueryTypes.SELECT,
          }
        );
        const matricule =
          parcRows.length > 0 ? String(parcRows[0].mat_rh) : "";

        // frais forfaitaire
        const forfRows = await sequelize.query(
          `SELECT mnt FROM frais_forf WHERE id = :id LIMIT 1`,
          {
            replacements: { id: userId },
            type: Sequelize.QueryTypes.SELECT,
          }
        );
        const frais_forf =
          forfRows.length > 0 ? parseFloat(forfRows[0].mnt) || 0 : 0;

        // frais CRM for the selected period
        let frais_crm = 0;
        if (userType === 5) {
          const rows = await sequelize.query(
            `SELECT COALESCE(SUM(frais), 0) AS total
             FROM note_frais_animatrices
             WHERE del_id = :id AND date_visite >= :de AND date_visite <= :a`,
            {
              replacements: { id: userId, de, a },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          frais_crm = parseFloat(rows[0]?.total) || 0;
        } else if (userType === 2 && userId !== 556) {
          frais_crm = frais_forf;
        } else {
          const rows = await sequelize.query(
            `SELECT COALESCE(SUM(frais), 0) AS total
             FROM note_frais
             WHERE del_id = :id
               AND date_visite >= :de AND date_visite <= :a
              
               AND secteur_id = 0`,
            {
              
              replacements: { id: userId, de, a },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          frais_crm = parseFloat(rows[0]?.total) || 0;
        }

        const frais_50_1 = frais_crm * 0.5;
        const frais_50_2 = frais_crm * 0.5;

        // cumul frais (year-to-date from yearStart to a)
        let cumul_frais = 0;
        if (userType === 2 && userId !== 556) {
          cumul_frais = frais_forf * nbMonth * 0.5;
        } else if (userType === 5) {
          const rows = await sequelize.query(
            `SELECT COALESCE(SUM(frais), 0) AS total
             FROM note_frais_animatrices
             WHERE del_id = :id AND date_visite >= :yearStart AND date_visite <= :a`,
            {
              replacements: { id: userId, yearStart, a },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          cumul_frais = (parseFloat(rows[0]?.total) || 0) * 0.5;
        } else {
          const rows = await sequelize.query(
            `SELECT COALESCE(SUM(frais), 0) AS total
             FROM note_frais
             WHERE del_id = :id AND date_visite >= :yearStart AND date_visite <= :a`,
            {
              replacements: { id: userId, yearStart, a },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          cumul_frais = (parseFloat(rows[0]?.total) || 0) * 0.5;
        }

        // cumul virement — kb_frais_dlg_virement (UNIGES), year-to-date by mat
        let cumul_virement = 0;
        // cumul facture — kb_frais_dlg_facture (UNIGES), full year by matricule
        let cumul_facture = 0;

        if (matricule) {
          const year = de.substring(0, 4);

          const virRows = await sequelize2.query(
            `SELECT COALESCE(SUM(mnt), 0) AS ttc
             FROM kb_frais_dlg_virement
             WHERE date >= :yearStart AND date <= :a AND mat = :mat`,
            {
              replacements: { yearStart, a, mat: matricule },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          cumul_virement = parseFloat(virRows[0]?.ttc) || 0;

          const factRows = await sequelize2.query(
            `SELECT COALESCE(SUM(ttc), 0) AS ttc
             FROM kb_frais_dlg_facture
             WHERE YEAR(date) >= :year AND matricule = :mat`,
            {
              replacements: { year, mat: matricule },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          cumul_facture = parseFloat(factRows[0]?.ttc) || 0;
        }

        return {
          id: userId,
          Nom: user.Nom,
          Prenom: user.Prenom,
          type: userType,
          typeName: user.typeName || "",
          matricule,
          frais_forf,
          frais_crm,
          frais_50_1,
          frais_50_2,
          cumul_frais,
          cumul_virement,
          cumul_facture,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getRecapFrais:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
