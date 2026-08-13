const SequelizeAuto = require('sequelize-auto');
const path = require('path');

// Create a new SequelizeAuto instance
const auto = new SequelizeAuto('crm', 'crm', 'CrmVit@17', {
  host: 'localhost',
  dialect: 'mysql', // or 'postgres', 'sqlite', 'mssql'
  directory: path.join(__dirname, 'models'), // Output directory for models
  caseModel: 'pascal', // Model naming style: 'pascal', 'camel', 'snake', etc.
  additional: {
    timestamps: false // Disable timestamps if your tables don't use them
  },
  tables: ['user_bu'], // Specify the table(s) to generate models for
});

// Generate models
auto.run(function (err) {
  if (err) throw err;

  console.log('Model for table "demande" generated successfully!');
});