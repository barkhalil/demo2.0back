const express = require("express");
const cors = require("cors");
const cookieParse = require("cookie-parser");
//const sequelize = require('./database');
require("dotenv").config();
const setupRoutes = require("./appRoutes");

app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000","http://192.168.1.185:3000"],

    allowedHeaders: ["Authorization", "Content-Type", 'Cache-Control',  // Add this
    'Pragma',          // Add this
    'Expires' ],
  })
  
);


// Handle graceful shutdown
function setupGracefulShutdown() {
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down...');
        shutdown();
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down...');
        shutdown();
    });

    function shutdown() {
        console.log('👋 Server shutting down gracefully');
        process.exit(0);
    }
}
app.use(cookieParse());

setupRoutes(app);

// ── Dashboard Export Afrique (auto-ajouté) ──────────────────────────
const countryDashboardRoutes = require('./routes/countryDashboard');
app.use('/api/country-dashboard', countryDashboardRoutes);
// ────────────────────────────────────────────────────────────────────

app.listen(process.env.NODE_PORT, () => {
  console.log("serveur is working on " + process.env.NODE_PORT + " ......");

    // Setup graceful shutdown
    setupGracefulShutdown();

});

