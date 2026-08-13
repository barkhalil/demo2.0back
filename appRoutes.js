const accessRoute = require("./routes/access");
const accessProspects = require("./routes/prospect");
const accessVisite = require("./routes/visite");
const accessUsers = require("./routes/users");
const accessDemande = require("./routes/demande");
const acessProducts = require("./routes/products");
const acessCA = require("./routes/ca");
const acessPDC = require("./routes/pdc");
const accessFleet = require("./routes/fleetRoutes");
const accessFrais = require("./routes/frais");
const verifyToken = require("./midelware/validator");

const setupRoutes = (app) => {
  app.use("/api", accessRoute);
  app.use("/prospect", accessProspects);
  app.use("/visite", accessVisite);
  app.use("/users", accessUsers);
  app.use("/demande", accessDemande);
  app.use("/products", acessProducts);
  app.use("/ca", acessCA);
  app.use("/pdc", acessPDC);
  app.use("/fleet", verifyToken, accessFleet);
  app.use("/frais", accessFrais);
};

module.exports = setupRoutes;
