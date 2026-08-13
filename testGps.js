require("dotenv").config();
const {
  getGpsAuthToken,
  fetchGpsStopsData,
} = require("./service/fleetService");

async function testGpsIntegration() {
  console.log("🚀 Starting GPS API Integration Test...\n");

  try {
    // 1. Test Authentication
    console.log("🔑 Testing Authentication...");
    console.time("Auth Time");
    const token = await getGpsAuthToken();
    console.timeEnd("Auth Time");

    if (!token) {
      throw new Error("No token received!");
    }
    console.log(
      `✅ Authentication Successful! Token received (length: ${token.length})`,
    );
    console.log("----------------------------------------\n");

    // 2. Test Data Fetching
    const today = new Date();
    // Use yesterday to ensure data availability if running early in the morning
    // or use today if preferred. Let's use today.

    console.log(
      `📡 Fetching data for date: ${today.toISOString().split("T")[0]}...`,
    );
    console.time("Fetch Time");
    const gpsData = await fetchGpsStopsData(today, today, token);
    console.timeEnd("Fetch Time");

    if (!gpsData || !gpsData.vehicles) {
      throw new Error("Invalid data structure received from API");
    }

    const vehicleCount = gpsData.vehicles.length;
    console.log(
      `✅ Data Fetched Successfully! Found ${vehicleCount} vehicles.`,
    );
    console.log("----------------------------------------\n");

    // 3. Analyze Data (Filtering Logic)
    console.log('🔍 Analyzing Data (Filtering for Type "A" stops)...');

    let totalStops = 0;
    let typeAStops = 0;
    let vehiclesWithTypeA = 0;

    // Inspect first 3 vehicles to show sample data
    const sampleLimit = 3;
    let samplesShown = 0;

    gpsData.vehicles.forEach((vehicle) => {
      if (vehicle.arrets) {
        totalStops += vehicle.arrets.length;
        const aStops = vehicle.arrets.filter((node) => node.type === "A");
        typeAStops += aStops.length;

        if (aStops.length > 0) {
          vehiclesWithTypeA++;

          // Show sample of first few vehicles with Type A stops
          if (samplesShown < sampleLimit) {
            console.log(`\n🚙 Vehicle: ${vehicle.matricule}`);
            console.log(`   Total Stops: ${vehicle.arrets.length}`);
            console.log(`   Type 'A' Stops: ${aStops.length}`);
            console.log(
              `   First Type 'A' Stop: ${JSON.stringify(aStops[0], null, 2)}`,
            );
            samplesShown++;
          }
        }
      }
    });

    console.log("\n----------------------------------------");
    console.log("📊 SUMMARY STATS:");
    console.log(`   Total Vehicles:      ${vehicleCount}`);
    console.log(`   Vehicles with Stops: ${vehiclesWithTypeA}`);
    console.log(`   Total Stops (All):   ${totalStops}`);
    console.log(`   Type 'A' Stops:      ${typeAStops}`);
    console.log("----------------------------------------");

    if (typeAStops === 0) {
      console.log(
        '⚠️  WARNING: No Type "A" stops found. This might be normal if vehicles haven\'t moved or data is sparse.',
      );
    } else {
      console.log(
        "✅ TEST PASSED: GPS data retrieval and filtering logic verified.",
      );
    }
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    if (error.response) {
      console.error(
        "API Response:",
        error.response.status,
        error.response.data,
      );
    }
  }
}

testGpsIntegration();
