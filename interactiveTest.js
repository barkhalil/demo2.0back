const readline = require("readline");
const { fetchAndInsertFleetData } = require("./service/fleetService");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function interactiveTest() {
  console.log("🚗 Fleet Sync Interactive Test\n");

  // Ask for date
  rl.question(
    "Enter date (YYYY-MM-DD) or press Enter for today: ",
    (dateInput) => {
      const targetDate = dateInput ? new Date(dateInput) : new Date();

      // Ask for start hour
      rl.question(
        "Enter start hour (HH:MM:SS) or press Enter for 08:00:00: ",
        (startHour) => {
          const start = startHour || "08:00:00";

          // Ask for end hour
          rl.question(
            "Enter end hour (HH:MM:SS) or press Enter for 19:00:00: ",
            (endHour) => {
              const end = endHour || "19:00:00";

              // Ask for sync mode
              console.log(`\n⚙️  Sync Modes:`);
              console.log(`   1. 🔄 Both APIs (Default)`);
              console.log(`   2. 🚚 Fleet.tn Only`);
              console.log(`   3. 📡 GPS API Only`);

              rl.question(
                "\nSelect mode (1-3) or press Enter for Both: ",
                (modeInput) => {
                  const mode = modeInput.trim() || "1";

                  let syncFleetTn = true;
                  let syncGps = true;

                  if (mode === "2") {
                    syncGps = false;
                    console.log("   👉 Selected: Fleet.tn Only");
                  } else if (mode === "3") {
                    syncFleetTn = false;
                    console.log("   👉 Selected: GPS API Only");
                  } else {
                    console.log("   👉 Selected: Both APIs");
                  }

                  console.log(`\n🧪 Testing with:`);
                  console.log(
                    `   Date: ${targetDate.toISOString().split("T")[0]}`,
                  );
                  console.log(`   Time: ${start} to ${end}`);
                  console.log(`   Fleet.tn: ${syncFleetTn ? "✅" : "❌"}`);
                  console.log(`   GPS API:  ${syncGps ? "✅" : "❌"}`);
                  console.log("\n⏳ Processing...\n");

                  fetchAndInsertFleetData({
                    targetDate,
                    startHour: start,
                    endHour: end,
                    syncFleetTn,
                    syncGps,
                  })
                    .then((result) => {
                      console.log("\n📊 RESULT:");
                      console.log(JSON.stringify(result, null, 2));

                      if (result.success) {
                        console.log("\n✅ SUCCESS!");
                      } else {
                        console.log("\n❌ FAILED!");
                      }

                      rl.close();
                      process.exit(result.success ? 0 : 1);
                    })
                    .catch((error) => {
                      console.error("\n💥 ERROR:", error);
                      rl.close();
                      process.exit(1);
                    });
                },
              );
            },
          ); // Close endHour
        },
      ); // Close startHour
    },
  ); // Close date
}

interactiveTest();
