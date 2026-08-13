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
    origin: ["http://localhost:3000"],

    allowedHeaders: ["Authorization", "Content-Type"],
  })
);
app.use(cookieParse());
setupRoutes(app);
app.listen(process.env.NODE_PORT, () => {
  console.log("serveur is working on " + process.env.NODE_PORT + " ......");
});
