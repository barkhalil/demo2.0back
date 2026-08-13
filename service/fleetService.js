const axios = require("axios");
const { GpsStops } = require("../database").models;

// Helper function to format matricule
// Helper function to format matricule
function formatMatricule(matricule) {
  if (!matricule || typeof matricule !== "string") return "";

  // Try to match "Part1 TU Part2" format
  const tuMatch = matricule.match(/(\d+)\s*TU\s*(\d+)/i);

  if (tuMatch) {
    const part1 = tuMatch[1];
    const part2 = tuMatch[2];

    // Heuristic:
    // User wants "xxxxTUxxx" (Number TU Series)
    // GPS sends "xxx TU xxxx" (Series TU Number)

    // If Part1 is shorter than Part2 (e.g. 255 < 2578), it's Series TU Number -> SWAP
    if (part1.length < part2.length) {
      return `${part2}TU${part1}`;
    }

    // If Part1 is longer than Part2 (e.g. 2578 > 255), it's Number TU Series -> KEEP
    if (part1.length > part2.length) {
      return `${part1}TU${part2}`;
    }

    // If lengths are equal?
    // Assume Standard Display Format (Series TU Number) and swap?
    // Or check if there are spaces (GPS Format)?
    if (matricule.includes(" ")) {
      return `${part2}TU${part1}`;
    }

    // Default to condensed NumberTUSeries if ambiguous but looks already formatted
    return `${part1}TU${part2}`;
  }

  return matricule
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

// Function to format date in YYYY-MM-DD format
function getFormattedDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

// Fleet.tn expects the calendar day in business (Africa/Tunis) time.
// Using toISOString() here would shift the day when the incoming
// timestamp already encodes a local-time boundary (e.g. a frontend
// date-range picker sending "2026-07-11T22:00:00.000Z" for local
// midnight of the 12th), causing stops/code requests for the wrong day.
function getFleetTnDateStr(date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" }).format(date);
}

// Function to get authentication token
async function getAuthToken() {
  const tokenResponse = await axios.post(
    "https://fleet.tn/ws_rimtrack_all/signin",
    {
      username: "vital",
      password: "vital*2022",
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 1800000, // 30 minutes
    },
  );

  return tokenResponse.data.token;
}

// GPS API: Function to get authentication token
async function getGpsAuthToken() {
  try {
    const response = await axios.post(
      `${process.env.GPS_API_BASE_URL}/api/auth/login`,
      {
        clientId: parseInt(process.env.GPS_API_CLIENT_ID),
        secret: process.env.GPS_API_SECRET,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 1800000, // 30 minutes
      },
    );

    return response.data.token;
  } catch (error) {
    console.error("❌ GPS API authentication failed:", error.message);
    throw error;
  }
}

// GPS API: Function to fetch stops data (only type "A")
async function fetchGpsStopsData(startDate, endDate, token) {
  try {
    // Format dates as DD/MM/YYYY for GPS API
    const formatDateForGps = (date) => {
      const d = typeof date === "string" ? new Date(date) : date;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const dateDebut = formatDateForGps(startDate);
    const dateFin = formatDateForGps(endDate);

    console.log(`📡 Fetching GPS stops from ${dateDebut} to ${dateFin}...`);

    const response = await axios.get(
      `${process.env.GPS_API_BASE_URL}/api/vehiclestops/client-stops`,
      {
        params: {
          DateDebut: dateDebut,
          DateFin: dateFin,
        },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 1800000, // 30 minutes
      },
    );

    return response.data;
  } catch (error) {
    console.error("❌ GPS API data fetch failed:", error.message);
    throw error;
  }
}


// GPS API: Process and insert GPS stops data (only type "A")
async function processAndInsertGpsStops(gpsData) {
  if (!gpsData?.vehicles?.length) {
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  const { Op } = require("sequelize");

  // Step 1: collect all type-A stops from all vehicles
  const allStops = [];
  for (const vehicle of gpsData.vehicles) {
    if (!vehicle.arrets?.length) continue;
    const matricule = formatMatricule(vehicle.matricule);
    for (const arret of vehicle.arrets) {
      if (arret.type !== "A") continue;
      allStops.push({
        matricule,
        device_id: null,
        stop_start: arret.dateHeureDebut,
        stop_end: arret.dateHeureFin,
        latitude: arret.latitude != null ? String(arret.latitude) : null,
        longitude: arret.longitude != null ? String(arret.longitude) : null,
        stop_duration: arret.dureeMinutes,
        code: arret.address?.postcode ?? null,
        frs: "gps_api",
      });
    }
  }

  if (!allStops.length) return { inserted: 0, skipped: 0, errors: 0 };

  // Step 2: one query to find all existing records for these stop_start values
  const startDates = [...new Set(allStops.map((s) => s.stop_start))];
  const existing = await GpsStops.findAll({
    where: { frs: "gps_api", stop_start: { [Op.in]: startDates } },
    attributes: ["matricule", "stop_start", "stop_end"],
    raw: true,
  });

  const seen = new Set(
    existing.map((r) => `${r.matricule}||${r.stop_start}||${r.stop_end}`)
  );
  const toInsert = allStops.filter(
    (s) => !seen.has(`${s.matricule}||${s.stop_start}||${s.stop_end}`)
  );
  const skipped = allStops.length - toInsert.length;

  if (!toInsert.length) {
    console.log(`[GPS] Nothing new — skipped: ${skipped}`);
    return { inserted: 0, skipped, errors: 0 };
  }

  // Step 3: bulk insert
  try {
    await GpsStops.bulkCreate(toInsert, { ignoreDuplicates: true });
    console.log(`[GPS] inserted: ${toInsert.length}  skipped: ${skipped}`);
    return { inserted: toInsert.length, skipped, errors: 0 };
  } catch (bulkErr) {
    // fallback: row-by-row on bulk failure
    console.warn("[GPS] bulkCreate failed, falling back to row-by-row:", bulkErr.message);
    let inserted = 0;
    let errors = 0;
    for (const row of toInsert) {
      try { await GpsStops.create(row); inserted++; }
      catch (_) { errors++; }
    }
    console.log(`[GPS] (fallback) inserted: ${inserted}  skipped: ${skipped}  errors: ${errors}`);
    return { inserted, skipped, errors };
  }
}

// NEW: Function to fetch and insert historical data day by day
async function fetchAndInsertHistoricalData(startDate, endDate, options = {}) {
  try {
    const { startHour = "08:00:00", endHour = "19:00:00" } = options;

    console.log(`🚗 Starting historical fleet data sync...`);
    console.log(
      `📅 Date range: ${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`,
    );
    console.log(`⏰ Time range per day: ${startHour} to ${endHour}\n`);

    // Get authentication token once
    const token = await getAuthToken();
    console.log("✅ Authentication successful\n");

    let totalInserted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    const results = [];

    // Calculate total days for progress tracking
    const totalDays =
      Math.ceil((endDateObj - currentDate) / (1000 * 60 * 60 * 24)) + 1;
    let daysProcessed = 0;

    console.log(`📊 Will process ${totalDays} days total\n`);

    // Process each day individually
    while (currentDate <= endDateObj) {
      const dateStr = getFleetTnDateStr(currentDate);
      daysProcessed++;

      console.log(
        `[${daysProcessed}/${totalDays}] 📅 Processing ${dateStr}...`,
      );

      try {
        // Fetch data for this day
        const response = await axios.post(
          "https://www.fleet.tn/ws_rimtrack_all/stops/code",
          {
            startDate: `${dateStr}T${startHour}.000Z`,
            endDate: `${dateStr}T${endHour}.000Z`,
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: token,
            },
            timeout: 1800000, // 30 minutes
          },
        );

        const stopsData = response.data;
        let dayInserted = 0;
        let daySkipped = 0;
        let dayErrors = 0;

        // Check if we got data
        if (!stopsData || Object.keys(stopsData).length === 0) {
          console.log(`   ⚠️  No data returned for ${dateStr}`);
          results.push({
            date: dateStr,
            inserted: 0,
            skipped: 0,
            errors: 0,
            note: "No data returned by API",
          });
        } else {
          console.log(
            `   📊 API returned ${Object.keys(stopsData).length} vehicles`,
          );

          // Process each vehicle
          for (const [originalMatricule, stops] of Object.entries(stopsData)) {
            const formattedMatricule = formatMatricule(originalMatricule);

            if (!stops || stops.length === 0) continue;

            // Process each stop
            for (const stop of stops) {
              try {
                // Check if record already exists
                const existingRecord = await GpsStops.findOne({
                  where: {
                    matricule: formattedMatricule,
                    device_id: stop.deviceId,
                    stop_start: stop.beginStopDate,
                    stop_end: stop.endStopDate,
                    code: stop.code,
                  },
                });

                if (existingRecord) {
                  daySkipped++;
                  continue;
                }

                // Insert new record
                await GpsStops.create({
                  matricule: formattedMatricule,
                  device_id: stop.deviceId,
                  stop_start: stop.beginStopDate,
                  stop_end: stop.endStopDate,
                  latitude: stop.stopLatitude
                    ? stop.stopLatitude.toString()
                    : null,
                  longitude: stop.stopLongitude
                    ? stop.stopLongitude.toString()
                    : null,
                  stop_duration: stop.stopDuration,
                  code: stop.code,
                  frs: 'fleet.tn',
                });

                dayInserted++;
              } catch (insertError) {
                dayErrors++;
                console.error(
                  `   ❌ Error inserting for ${formattedMatricule}:`,
                  insertError.message,
                );
              }
            }
          }

          totalInserted += dayInserted;
          totalSkipped += daySkipped;
          totalErrors += dayErrors;

          results.push({
            date: dateStr,
            inserted: dayInserted,
            skipped: daySkipped,
            errors: dayErrors,
            vehicles: Object.keys(stopsData).length,
          });

          console.log(
            `   ✅ ${dateStr}: ${dayInserted} inserted, ${daySkipped} skipped, ${dayErrors} errors`,
          );
        }
      } catch (dailyError) {
        console.error(
          `   ❌ Failed to process ${dateStr}:`,
          dailyError.message,
        );
        results.push({
          date: dateStr,
          error: dailyError.message,
          inserted: 0,
          skipped: 0,
          errors: 1,
        });
        totalErrors++;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);

      // Add delay between days to avoid rate limiting
      if (currentDate <= endDateObj) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("\n🎯 Historical sync completed!");
    console.log(`✅ Total inserted: ${totalInserted}`);
    console.log(`➖ Total skipped: ${totalSkipped}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    console.log(`📊 Days processed: ${daysProcessed}/${totalDays}`);

    return {
      success: true,
      inserted: totalInserted,
      skipped: totalSkipped,
      errors: totalErrors,
      dateRange: `${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`,
      timeRange: `${startHour} to ${endHour}`,
      dailyResults: results,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("💥 Historical sync error:", error.message);

    if (error.response) {
      console.error("📡 API Response Status:", error.response.status);
      console.error(
        "📡 API Response Data:",
        JSON.stringify(error.response.data),
      );
    }

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Main function to get data from API and insert into database
async function fetchAndInsertFleetData(options = {}) {
  try {
    console.log("🚗 Starting fleet data sync...");

    // Default options for TODAY
    const {
      startHour = "08:00:00",
      endHour = "19:00:00",
      targetDate = new Date(), // Default to TODAY
      syncFleetTn = true, // Default to true
      syncGps = true, // Default to true
    } = options;

    // Format the target date (Fleet.tn business day)
    const dateStr = getFleetTnDateStr(targetDate);

    console.log(`📅 Processing date: ${dateStr}`);
    console.log(`⏰ Time range: ${startHour} to ${endHour}`);
    console.log(
      `⚙️  Modes: Fleet.tn=${syncFleetTn ? "ON" : "OFF"}, GPS API=${syncGps ? "ON" : "OFF"}`,
    );

    // ==========================================
    // 1. FLEET.TN API SYNC
    // ==========================================
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let totalFleetVehicles = 0;

    if (syncFleetTn) {
      // Step 1: Get authentication token
      const token = await getAuthToken();
      console.log("✅ Authentication successful");

      // Step 2: Get stops data with specified time range
      console.log("📡 Fetching Fleet.tn stops data...");

      const stopsResponse = await axios.post(
        "https://www.fleet.tn/ws_rimtrack_all/stops/code",
        {
          startDate: `${dateStr}T${startHour}.000Z`,
          endDate: `${dateStr}T${endHour}.000Z`,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token,
          },
          timeout: 1800000, // 30 minutes
        },
      );

      const stopsData = stopsResponse.data;
      totalFleetVehicles = Object.keys(stopsData).length;
      console.log(`📊 Fetched data for ${totalFleetVehicles} vehicles`);

      // Process each vehicle
      for (const [originalMatricule, stops] of Object.entries(stopsData)) {
        const formattedMatricule = formatMatricule(originalMatricule);

        // Skip if no stops
        if (!stops || stops.length === 0) {
          console.log(`➖ Skipping ${formattedMatricule}: No stops found`);
          continue;
        }

        console.log(
          `🔧 Processing ${formattedMatricule} (${stops.length} stops)`,
        );

        // Process each stop
        for (const stop of stops) {
          try {
            // Check if record already exists
            const existingRecord = await GpsStops.findOne({
              where: {
                matricule: formattedMatricule,
                device_id: stop.deviceId,
                stop_start: stop.beginStopDate,
                stop_end: stop.endStopDate,
                code: stop.code,
              },
            });

            if (existingRecord) {
              skippedCount++;
              continue;
            }

            // Insert new record
            await GpsStops.create({
              matricule: formattedMatricule,
              device_id: stop.deviceId,
              stop_start: stop.beginStopDate,
              stop_end: stop.endStopDate,
              latitude: stop.stopLatitude ? stop.stopLatitude.toString() : null,
              longitude: stop.stopLongitude
                ? stop.stopLongitude.toString()
                : null,
              stop_duration: stop.stopDuration,
              code: stop.code,
              frs: 'fleet.tn',
            });

            insertedCount++;
          } catch (insertError) {
            errorCount++;
            console.error(
              `❌ Error inserting for ${formattedMatricule}:`,
              insertError.message,
            );
          }
        }
      }

      console.log("\n🎯 Fleet.tn sync completed!");
      console.log(`✅ Records inserted: ${insertedCount}`);
      console.log(`➖ Records skipped (duplicates): ${skippedCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      console.log(`🚗 Total vehicles processed: ${totalFleetVehicles}`);
    } else {
      console.log("\n⏭️  Skipping Fleet.tn sync (disabled via options)");
    }

    // ==========================================
    // 2. GPS API SYNC (Type "A" Stops)
    // ==========================================
    let gpsInserted = 0;
    let gpsSkipped = 0;
    let gpsErrors = 0;

    if (syncGps) {
      try {
        console.log("\n📡 Starting GPS stops sync...");

        // Authenticate with GPS API
        const gpsToken = await getGpsAuthToken();
        console.log("✅ GPS API authentication successful");

        // Fetch GPS stops data for the same date
        const gpsData = await fetchGpsStopsData(
          targetDate,
          targetDate,
          gpsToken,
        );
        console.log(
          `📊 GPS API returned data for ${gpsData.totalVehicles || (gpsData.vehicles ? gpsData.vehicles.length : 0)} vehicles`,
        );

        // Process and insert GPS stops (only type "A")
        const gpsResult = await processAndInsertGpsStops(gpsData);
        gpsInserted = gpsResult.inserted;
        gpsSkipped = gpsResult.skipped;
        gpsErrors = gpsResult.errors;
      } catch (gpsError) {
        console.error(
          "⚠️  GPS API sync failed (continuing with Fleet.tn data):",
          gpsError.message,
        );
        gpsErrors = 1;
      }
    } else {
      console.log("\n⏭️  Skipping GPS API sync (disabled via options)");
    }

    return {
      success: true,
      fleetTn: {
        inserted: insertedCount,
        skipped: skippedCount,
        errors: errorCount,
        totalVehicles: totalFleetVehicles,
      },
      gpsApi: {
        inserted: gpsInserted,
        skipped: gpsSkipped,
        errors: gpsErrors,
      },
      totalInserted: insertedCount + gpsInserted,
      totalSkipped: skippedCount + gpsSkipped,
      totalErrors: errorCount + gpsErrors,
      dateProcessed: dateStr,
      timeRange: `${startHour} to ${endHour}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("💥 Sync error:", error.message);

    // Log detailed error info
    if (error.response) {
      console.error("📡 API Response Status:", error.response.status);
      console.error(
        "📡 API Response Data:",
        JSON.stringify(error.response.data),
      );
    }

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Function to process data for a specific date
async function fetchAndInsertFleetDataForDate(
  targetDate,
  startHour = "08:00:00",
  endHour = "19:00:00",
) {
  console.log(`📅 Processing specific date: ${getFormattedDate(targetDate)}`);

  return await fetchAndInsertFleetData({
    targetDate,
    startHour,
    endHour,
  });
}

// Function to process a date range
async function fetchAndInsertFleetDataForDateRange(
  startDate,
  endDate,
  startHour = "08:00:00",
  endHour = "19:00:00",
) {
  console.log(
    `📅 Processing date range: ${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`,
  );

  const results = [];
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Process each day in the range
  while (currentDate <= endDateObj) {
    const dateStr = getFormattedDate(currentDate);
    console.log(`\n📅 Processing ${dateStr}...`);

    const result = await fetchAndInsertFleetData({
      targetDate: new Date(currentDate),
      startHour,
      endHour,
    });

    results.push({
      date: dateStr,
      result,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    success: true,
    dateRange: `${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`,
    results,
    timestamp: new Date().toISOString(),
  };
}

// Export the service
module.exports = {
  fetchAndInsertFleetData,
  fetchAndInsertFleetDataForDate,
  fetchAndInsertFleetDataForDateRange,
  fetchAndInsertHistoricalData, // NEW function
  formatMatricule,
  getFormattedDate,
  getAuthToken,
  getGpsAuthToken, // GPS API
  fetchGpsStopsData, // GPS API
  processAndInsertGpsStops, // GPS API
};
