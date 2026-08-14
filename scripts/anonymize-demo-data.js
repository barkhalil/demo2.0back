/**
 * One-shot anonymization script for the demo database.
 *
 * Replaces prospect.nom / prospect.prenom / prospect.tel / prospect.gsm,
 * users.Nom / users.Prenom, products.name / products.title, and
 * prod_categorie.nom with fake data, using the DB connection already
 * configured in back_end/.env (DB_DATABASE).
 *
 * Usage:
 *   node scripts/anonymize-demo-data.js            -> dry run (no writes)
 *   node scripts/anonymize-demo-data.js --yes       -> actually apply changes
 */
require("dotenv").config();
const { Sequelize, QueryTypes } = require("sequelize");

const APPLY = process.argv.includes("--yes");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

const PRENOMS = [
  "Mohamed", "Ahmed", "Ali", "Karim", "Sami", "Walid", "Youssef", "Nabil",
  "Hichem", "Riadh", "Slim", "Anis", "Bilel", "Fares", "Rami", "Zied",
  "Adel", "Tarek", "Mehdi", "Amine", "Chokri", "Wassim", "Nizar", "Kais",
  "Ghassen", "Skander", "Aymen", "Yassine", "Marouane", "Hedi", "Nidhal",
  "Oussama", "Rachid", "Sofien", "Taoufik", "Marwen", "Zoubeir", "Bechir",
  "Chedly", "Elyes", "Fathi", "Habib", "Iheb", "Jamel", "Khaled", "Lotfi",
  "Mahdi", "Naceur", "Omar", "Radhouane", "Sabri", "Taher", "Wael",
  "Aziz", "Borhen", "Chekib", "Dhia", "Emad", "Farouk", "Ghazi", "Hafedh",
  "Imed", "Jalel", "Kacem", "Lassaad", "Mokhtar", "Anouar", "Othman",
  "Fatma", "Amira", "Ines", "Sarra", "Nadia", "Rim", "Salma", "Emna",
  "Mouna", "Wafa", "Sonia", "Leila", "Asma", "Yosra", "Hela", "Meriem",
  "Rania", "Dorra", "Khadija", "Sabrine", "Manel", "Nour", "Olfa", "Souad",
  "Imen", "Houda", "Rihab", "Bouthaina", "Chaima", "Aicha", "Amel",
  "Besma", "Chiraz", "Dalila", "Faten", "Ghada", "Hend", "Ibtissem",
  "Jihen", "Khouloud", "Lamia", "Mariem", "Nesrine", "Ons", "Rabeb",
  "Samia", "Takwa", "Wided", "Yasmine", "Zeineb", "Afef", "Basma",
  "Cyrine", "Dorsaf", "Eya", "Farah", "Ghofrane", "Hajer", "Ikram",
  "Jouda", "Kaouther", "Lina", "Marwa", "Narjes", "Oumaima", "Sirine",
];

const NOMS = [
  "Trabelsi", "Gharbi", "Jlassi", "Bouazizi", "Hammami", "Sassi",
  "Mrad", "Cherif", "Khemiri", "Belhadj", "Rekik", "Fki", "Guesmi",
  "Zouari", "Chaabane", "Mejri", "Ayari", "Bouzid", "Hamdi", "Kefi",
  "Toumi", "Nasri", "Jendoubi", "Abidi", "Sfaxi", "Riahi",
  "Baccouche", "Dridi", "Mansouri", "Boukadi", "Chtioui", "Ferjani",
  "Ghanmi", "Hidri", "Kammoun", "Lahmar", "Mestiri", "Naili", "Ouali",
  "Rezgui", "Saidi", "Tlili", "Werghi", "Yahyaoui", "Zaidi", "Amara",
  "Bahri", "Chihi", "Dhaouadi", "Elloumi", "Frini", "Gaddour", "Hosni",
  "Ismail", "Souissi", "Karray", "Cherni", "Marzouki", "Kraiem",
  "Ounaies", "Turki", "Bousbih", "Boughanmi", "Loussaief", "Maaloul",
  "Nefzi", "Ouerghi", "Rjaibi", "Sahli", "Talbi", "Zribi", "Abaab",
  "Baklouti", "Chatti", "Daoud", "Ezzeddine", "Fathallah", "Gaaloul",
  "Hachicha", "Idoudi", "Jaziri", "Kahloun", "Layouni", "Msadek",
  "Nouira", "Oueslati", "Rachdi", "Sboui", "Trimech", "Yacoubi",
  "Zenati", "Abdelli", "Bejaoui", "Chebbi", "Dabbabi", "Ennaifer",
  "Ferchichi", "Ghariani", "Haddad", "Ibrahimi", "Jouini", "Kaabi",
  "Latrach", "Melki", "Nsiri", "Ouertani", "Rebai", "Sallemi", "Tounsi",
  "Yaich", "Zaghdoudi", "Abbes", "Braham", "Chouikha", "Derbal", "Essid",
  "Feki", "Guedri", "Hannachi", "Jomaa", "Khiari", "Loukil", "Mahjoub",
  "Nasraoui", "Othmani", "Rouissi", "Selmi", "Tabbabi", "Wertani",
  "Zayani",
];

// Some family names carry a "Ben " prefix (very common in Tunisia), applied
// to ~1/4 of rows via a hashed flag so it doesn't correlate with the name index.
const NOM_PREFIXES = ["", "", "", "Ben "];

const PREFIXES = [
  "20", "21", "22", "23", "24", "25", "27", "28", "29", "31", "36", "40",
  "41", "42", "44", "45", "50", "52", "53", "54", "55", "56", "58", "90",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
];

// Generic medical-supply catalog used as a name pool for products.name/title
// (replaces real brand/product names such as "Pédiakids", "laboratoires demo").
const PRODUCT_NAMES = [
  "Stéthoscope Premium", "Tensiomètre automatique de bras",
  "Thermomètre infrarouge sans contact", "Oxymètre de pouls digital",
  "Otoscope à fibres optiques", "Draps d'examen ouatés (lot de 12)",
  "Gants en nitrile non poudrés (boîte de 100)",
  "Masques chirurgicaux Type IIR (boîte de 50)",
  "Gel hydroalcoolique 500ml avec pompe",
  "Compresses stériles 10x10 cm (boîte de 50)",
  "Seringues 3 pièces 5ml (boîte de 100)",
  "Aiguilles hypodermiques 21G (boîte de 100)",
  "Pansements adhésifs assortis (boîte de 100)",
  "Spatules abaisse-langue en bois (boîte de 250)",
  "Bandes de crêpe 4m x 10cm (lot de 10)",
  "Sparadrap microporeux avec dévidoir", "Ciseaux de Lister (dauphin) 14cm",
  "Pince de Halsted courbe 12cm", "Porte-aiguille de Mayo-Hegar 14cm",
  "Bistouris stériles jetables (boîte de 10)", "Marteau à réflexes Babinski",
  "Négatoscope mural 1 plage", "Lampe de diagnostic stylo LED",
  "Pèse-personne médical électronique", "Toise médicale murale à ruban",
  "Lecteur de glycémie avec 50 bandelettes",
  "Lancettes stériles pour autopiqueur (boîte de 100)",
  "Bandelettes urinaires 10 paramètres (boîte de 100)",
  "Gel de contact pour échographie 250ml",
  "Électrodes autocollantes ECG (paquet de 50)",
  "Défibrillateur automatisé externe (DAE)", "Sac de premiers secours garni",
  "Couverture de survie stérile", "Insufflateur manuel adulte (BAVU)",
  "Masque à oxygène haute concentration adulte",
  "Lunettes à oxygène PVC (lot de 5)", "Collier cervical réglable adulte",
  "Attelle de cheville de type orthèse",
  "Écharpe d'immobilisation de l'épaule",
  "Ceinture de soutien lombaire ergonomique",
  "Genouillère rotulienne élastique", "Paire de cannes anglaises (béquilles)",
  "Fauteuil roulant manuel standard", "Déambulateur articulé en aluminium",
  "Table d'examen médical 2 plans", "Tabouret de soin à roulettes réglable",
  "Guéridon médical en inox 2 plateaux",
  "Pied à sérum télescopique sur roulettes",
  "Collecteur de déchets perforants (DASRI) 2L",
  "Nettoyant désinfectant surfaces 750ml",
  "Tensiomètre manopoire professionnel",
  "Spéculums auriculaires jetables (boîte de 250)",
  "Lampe de Wood pour dermatologie", "Dermatoscope LED haute précision",
  "Électrocardiographe 3 pistes portable",
  "Spiromètre de poche électronique", "Audiomètre de dépistage portable",
  "Doppler fœtal de poche", "Échelle optométrique de Monoyer 3m",
  "Test d'Ishihara pour le daltonisme", "Miroir laryngien avec manche",
  "Pince de Magill pour adulte", "Laryngoscope 3 lames Macintosh",
  "Sonde endotrachéale stérile (lot de 5)",
  "Canules de Guedel (boîte de 8 tailles)", "Aspirateur de mucosités manuel",
  "Sonde d'aspiration trachéale (lot de 50)",
  "Cathéter intraveineux sécurisé 20G (boîte de 50)",
  "Perfuseur par gravité avec site (lot de 20)",
  "Poche de sérum physiologique 0,9% 500ml",
  "Robinet à 3 voies pour perfusion (boîte de 50)",
  "Rallonge de perfusion 150cm (lot de 20)",
  "Pince hémostatique de Kocher droite 14cm",
  "Pince à dissection sans griffes 14cm",
  "Pince à dissection avec griffes 14cm",
  "Ciseaux chirurgicaux droits pointus 14cm",
  "Ciseaux chirurgicaux courbes mousse 14cm", "Pince à mèche fine",
  "Pince emporte-pièce dermatologique",
  "Curette dermatologique stérile 4mm (lot de 10)",
  "Stylet à bouton argenté", "Sonde cannelée chirurgicale",
  "Fil de suture monofilament non résorbable (3-0)",
  "Fil de suture tressé résorbable (2-0)",
];

// Generic gamme/category labels replacing real brand names in prod_categorie
// (e.g. "CANDEREL", "PEDIAKIDS", "LABORATOIRE demo").
const CATEGORIES = [
  "Diagnostic", "Consommables", "Soins et Pansements", "Instruments",
  "Urgence", "Orthopédie", "Mobilier et Équipement",
];

function sqlList(arr) {
  return arr.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
}

// CRC32-based hashing decorrelates the picked index from `id` far better than
// a linear MOD(id * k, n): consecutive/nearby ids no longer land on the same
// name, which is what made repeats look cyclic/patterned in the first pass.
const hashIdx = (salt, n) => `MOD(CRC32(CONCAT('${salt}', id)), ${n})`;

const PRENOM_EXPR = `ELT(${hashIdx("prenom", PRENOMS.length)} + 1, ${sqlList(PRENOMS)})`;
const NOM_ROOT_EXPR = `ELT(${hashIdx("nom", NOMS.length)} + 1, ${sqlList(NOMS)})`;
const NOM_PREFIX_EXPR = `ELT(${hashIdx("nomprefix", NOM_PREFIXES.length)} + 1, ${sqlList(NOM_PREFIXES)})`;
const NOM_EXPR = `CONCAT(${NOM_PREFIX_EXPR}, ${NOM_ROOT_EXPR})`;
const PREFIX_EXPR = `ELT(${hashIdx("telprefix", PREFIXES.length)} + 1, ${sqlList(PREFIXES)})`;
const SUFFIX_EXPR = `LPAD(${hashIdx("telsuffix", 1000000)}, 6, '0')`;

const PRODUCT_NAME_EXPR = `ELT(${hashIdx("prodname", PRODUCT_NAMES.length)} + 1, ${sqlList(PRODUCT_NAMES)})`;
const CATEGORY_EXPR = `ELT(${hashIdx("category", CATEGORIES.length)} + 1, ${sqlList(CATEGORIES)})`;

async function run() {
  await sequelize.authenticate();
  console.log(`Connected to database: ${process.env.DB_DATABASE} @ ${process.env.DB_HOST}`);
  console.log(APPLY ? "Mode: APPLY (writes will happen)" : "Mode: DRY RUN (no writes, preview only)");

  const previewProspect = await sequelize.query(
    `SELECT id, nom, prenom, tel, gsm,
            ${NOM_EXPR} AS new_nom,
            ${PRENOM_EXPR} AS new_prenom,
            CASE WHEN tel IS NOT NULL AND tel <> '' THEN CONCAT(${PREFIX_EXPR}, ${SUFFIX_EXPR}) ELSE tel END AS new_tel,
            CASE WHEN gsm IS NOT NULL AND gsm <> '' THEN CONCAT(${PREFIX_EXPR}, ${SUFFIX_EXPR}) ELSE gsm END AS new_gsm
     FROM prospect ORDER BY id LIMIT 5`,
    { type: QueryTypes.SELECT }
  );
  console.log("\n-- Prospect preview (first 5 rows) --");
  console.table(previewProspect);

  const previewUsers = await sequelize.query(
    `SELECT id, Nom, Prenom,
            ${NOM_EXPR} AS new_nom,
            ${PRENOM_EXPR} AS new_prenom
     FROM users ORDER BY id LIMIT 5`,
    { type: QueryTypes.SELECT }
  );
  console.log("\n-- Users preview (first 5 rows) --");
  console.table(previewUsers);

  const previewProducts = await sequelize.query(
    `SELECT id, name, title,
            ${PRODUCT_NAME_EXPR} AS new_name
     FROM products ORDER BY id LIMIT 5`,
    { type: QueryTypes.SELECT }
  );
  console.log("\n-- Products preview (first 5 rows) --");
  console.table(previewProducts);

  const previewCategories = await sequelize.query(
    `SELECT id, nom,
            ${CATEGORY_EXPR} AS new_nom
     FROM prod_categorie ORDER BY id LIMIT 10`,
    { type: QueryTypes.SELECT }
  );
  console.log("\n-- Prod_categorie preview (first 10 rows) --");
  console.table(previewCategories);

  const [{ c: prospectCount }] = await sequelize.query(
    `SELECT COUNT(*) AS c FROM prospect`, { type: QueryTypes.SELECT }
  );
  const [{ c: usersCount }] = await sequelize.query(
    `SELECT COUNT(*) AS c FROM users`, { type: QueryTypes.SELECT }
  );
  const [{ c: productsCount }] = await sequelize.query(
    `SELECT COUNT(*) AS c FROM products`, { type: QueryTypes.SELECT }
  );
  const [{ c: categoriesCount }] = await sequelize.query(
    `SELECT COUNT(*) AS c FROM prod_categorie`, { type: QueryTypes.SELECT }
  );
  console.log(
    `\nWill affect: ${prospectCount} prospect rows, ${usersCount} users rows, ` +
    `${productsCount} products rows, ${categoriesCount} prod_categorie rows.`
  );

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --yes to apply these changes.");
    await sequelize.close();
    return;
  }

  await sequelize.transaction(async (t) => {
    await sequelize.query(
      `UPDATE prospect SET
         nom = ${NOM_EXPR},
         prenom = ${PRENOM_EXPR},
         tel = CASE WHEN tel IS NOT NULL AND tel <> '' THEN CONCAT(${PREFIX_EXPR}, ${SUFFIX_EXPR}) ELSE tel END,
         gsm = CASE WHEN gsm IS NOT NULL AND gsm <> '' THEN CONCAT(${PREFIX_EXPR}, ${SUFFIX_EXPR}) ELSE gsm END`,
      { transaction: t }
    );
    await sequelize.query(
      `UPDATE users SET
         Nom = ${NOM_EXPR},
         Prenom = ${PRENOM_EXPR}`,
      { transaction: t }
    );
    await sequelize.query(
      `UPDATE products SET
         name = ${PRODUCT_NAME_EXPR},
         title = UPPER(${PRODUCT_NAME_EXPR})`,
      { transaction: t }
    );
    await sequelize.query(
      `UPDATE prod_categorie SET
         nom = ${CATEGORY_EXPR}`,
      { transaction: t }
    );
  });

  console.log(
    "\nDone. prospect.nom/prenom/tel/gsm, users.Nom/Prenom, products.name/title " +
    "and prod_categorie.nom have been anonymized."
  );
  await sequelize.close();
}

run().catch((err) => {
  console.error("Anonymization failed:", err);
  process.exit(1);
});
