const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const setupRoutes = require("./appRoutes");

const app = express();
app.use(express.json());

// Dynamic CORS configuration
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        // Allow non-browser clients like Postman
        return callback(null, true);
      }
      const allowedDomains = [
       "http://v2.demo-crm.com:453",
        "http://192.168.1.110","http://localhost","http://api.demo-crm.com",
      ];
      const isAllowed = allowedDomains.some((pattern) =>
        typeof pattern === "string" ? pattern === origin : pattern.test(origin)
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type",'Cache-Control',  
    'Pragma',          // Add this
    'Expires'],
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
// Parse cookies
app.use(cookieParser());

// API Routes
setupRoutes(app);
// Start server
const PORT = process.env.NODE_PORT || 4200;
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT + "...");

  // Setup graceful shutdown
  setupGracefulShutdown();
});
