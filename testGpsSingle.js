require("dotenv").config();
const { getGpsAuthToken, fetchGpsStopsData } = require("./service/fleetService");

const TARGET_MATRICULE = "2578TU255"; // <-- change ici

async function syncSingle() {
  console.log(`🔑 Authentification GPS...`);
  const token = await getGpsAuthToken();

  const today = new Date();
  console.log(`📡 Récupération des données pour le ${today.toISOString().split("T")[0]}...`);
  const raw = await fetchGpsStopsData(today, today, token);

  if (!raw || !raw.vehicles) {
    console.log("❌ Aucune donnée reçue de l'API GPS");
    process.exit(1);
  }

  const vehicle = raw.vehicles.find((v) => {
    const normalized = v.matricule.replace(/\s/g, "").toUpperCase();
    return normalized === TARGET_MATRICULE.toUpperCase();
  });

  if (!vehicle) {
    console.log(`❌ Matricule "${TARGET_MATRICULE}" non trouvé dans les données GPS`);
    console.log(`📋 Matricules disponibles (${raw.vehicles.length}) :`);
    raw.vehicles.forEach((v) => console.log(`   - ${v.matricule}`));
    process.exit(0);
  }

  const stops = (vehicle.arrets || []).filter((a) => a.type === "A");
  console.log(`\n✅ Véhicule trouvé : ${vehicle.matricule}`);
  console.log(`📊 Arrêts type "A" : ${stops.length}`);

  if (stops.length === 0) {
    console.log("⚠️  Aucun arrêt type A pour ce véhicule aujourd'hui");
    process.exit(0);
  }

  console.log("\n🗂️  Détail des arrêts :");
  stops.forEach((stop, i) => {
    console.log(`\n  [${i + 1}] Début  : ${stop.dateHeureDebut}`);
    console.log(`       Fin    : ${stop.dateHeureFin}`);
    console.log(`       Durée  : ${stop.dureeMinutes} min`);
    console.log(`       Lat/Lng: ${stop.latitude}, ${stop.longitude}`);
    console.log(`       Adresse: ${stop.address?.postcode || "N/A"}`);
  });

  process.exit(0);
}

syncSingle().catch((err) => {
  console.error("💥 Erreur :", err.message);
  process.exit(1);
});
