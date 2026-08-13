var DataTypes = require("sequelize").DataTypes;
var _user_bu = require("./user_bu");

function initModels(sequelize) {
  var user_bu = _user_bu(sequelize, DataTypes);


  return {
    user_bu,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
