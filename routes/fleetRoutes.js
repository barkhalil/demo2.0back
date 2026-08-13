const express = require("express");
const axios = require("axios");
const router = express.Router();
const fleetService = require("../service/fleetService");
function formatMatricule(matricule) {
    if (!matricule || typeof matricule !== 'string') return '';
    return matricule
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
}
// Manual sync endpoint - TODAY's data by default
router.post("/syncFleetData", async (req, res) => {
    try {
        const { 
            startHour = '08:00:00', 
            endHour = '19:00:00',
            targetDate // Optional, defaults to today
        } = req.body;
        
        let result;
        
        if (targetDate) {
            const dateObj = new Date(targetDate);
            result = await fleetService.fetchAndInsertFleetDataForDate(dateObj, startHour, endHour);
        } else {
            // Default: TODAY's data
            result = await fleetService.fetchAndInsertFleetData({
                startHour,
                endHour
            });
        }
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: "Fleet data synced successfully",
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Sync date range endpoint
router.post("/syncFleetDateRange", async (req, res) => {
    try {
        const { 
            startDate,
            endDate,
            startHour = '08:00:00', 
            endHour = '19:00:00'
        } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: "startDate and endDate are required"
            });
        }
        
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        const result = await fleetService.fetchAndInsertFleetDataForDateRange(
            startDateObj, 
            endDateObj, 
            startHour, 
            endHour
        );
        
        res.status(200).json({
            success: true,
            message: "Fleet data range synced successfully",
            data: result
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Replace your existing syncHistoricalRoute with this:
// Add this route to your fleetRoutes.js
router.post("/syncHistoricalRange", async (req, res) => {
    try {
        const { 
            startDate,
            endDate,
            startHour = '08:00:00',
            endHour = '19:00:00'
        } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: "startDate and endDate are required"
            });
        }
        
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        const result = await fleetService.fetchAndInsertHistoricalData(
            startDateObj,
            endDateObj,
            { startHour, endHour }
        );
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: "Historical fleet data synced successfully",
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Manual GPS stops sync endpoint - TODAY's data by default
// Body: {} or { "date": "2026-07-14" } for one day,
//       or { "startDate": "2026-06-10", "endDate": "2026-07-14" } for a period
router.post("/syncGpsData", async (req, res) => {
    try {
        const { date, startDate, endDate } = req.body;

        if ((startDate && !endDate) || (!startDate && endDate)) {
            return res.status(400).json({
                success: false,
                error: "startDate and endDate are both required for a period"
            });
        }

        const start = startDate ? new Date(startDate) : (date ? new Date(date) : new Date());
        const end = endDate ? new Date(endDate) : start;

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                error: "Invalid date format - use YYYY-MM-DD"
            });
        }
        if (start > end) {
            return res.status(400).json({
                success: false,
                error: "startDate must be before endDate"
            });
        }

        let token = await fleetService.getGpsAuthToken();

        const days = [];
        let totalInserted = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        const cur = new Date(start);
        cur.setHours(0, 0, 0, 0);
        const endMid = new Date(end);
        endMid.setHours(0, 0, 0, 0);

        while (cur <= endMid) {
            const dayStr = fleetService.getFormattedDate(cur);

            try {
                const gpsData = await fleetService.fetchGpsStopsData(cur, cur, token);
                const result = await fleetService.processAndInsertGpsStops(gpsData);
                days.push({ date: dayStr, ...result });
                totalInserted += result.inserted;
                totalSkipped += result.skipped;
                totalErrors += result.errors;
            } catch (dayError) {
                if (/401|unauthorized|token/i.test(dayError.message)) {
                    try {
                        token = await fleetService.getGpsAuthToken();
                        const gpsData = await fleetService.fetchGpsStopsData(cur, cur, token);
                        const result = await fleetService.processAndInsertGpsStops(gpsData);
                        days.push({ date: dayStr, ...result });
                        totalInserted += result.inserted;
                        totalSkipped += result.skipped;
                        totalErrors += result.errors;
                    } catch (retryError) {
                        days.push({ date: dayStr, error: retryError.message });
                        totalErrors++;
                    }
                } else {
                    days.push({ date: dayStr, error: dayError.message });
                    totalErrors++;
                }
            }

            cur.setDate(cur.getDate() + 1);
            if (cur <= endMid) await new Promise((r) => setTimeout(r, 400));
        }

        res.status(200).json({
            success: true,
            message: "GPS stops synced successfully",
            data: { totalInserted, totalSkipped, totalErrors, days }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;