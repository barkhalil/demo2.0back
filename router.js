const accessRoute = require("./routes/access");
const accessProspects = require("./routes/prospect");
const accessVisite = require("./routes/visite");
const accessUsers = require("./routes/users");
const accesDemande = require("./routes/demande");

module.exports = (app) => {
  app.use("/api", accessRoute);
  app.use("/prospect", accessProspects);
  app.use("/visite", accessVisite);
  app.use("/users", accessUsers);
  app.use("/demande", accesDemande);
};
