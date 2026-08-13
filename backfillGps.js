require("dotenv").config();
const { fetchAndInsertFleetDataForDateRange } = require("./service/fleetService");

const START_DATE = process.argv[2] || "2026-03-08";
const END_DATE   = process.argv[3] || new Date().toISOString().split("T")[0];

async function run() {
  console.log(`\n📅 Backfill GPS data from ${START_DATE} to ${END_DATE}\n`);

  const result = await fetchAndInsertFleetDataForDateRange(
    new Date(START_DATE),
    new Date(END_DATE),
    "08:00:00",
    "19:00:00"
  );

  console.log("\n✅ Done!");
  console.log(`   Dates processed : ${result.results?.length ?? 0}`);
  result.results?.forEach((r) => {
    const d = r.result;
    console.log(
      `   ${r.date} — Fleet: +${d?.fleetTn?.inserted ?? 0} | GPS: +${d?.gpsApi?.inserted ?? 0} | errors: ${d?.totalErrors ?? 0}`
    );
  });
}

run().catch((err) => {
  console.error("❌ Backfill failed:", err.message);
  process.exit(1);
});
