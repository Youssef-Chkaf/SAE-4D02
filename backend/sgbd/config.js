const Sequelize = require("sequelize");

// Configuration de la connexion à la base de données
const myDB = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

// Fonction pour obtenir un enregistrement aléatoire
myDB.random = function() {
  return Sequelize.literal('RAND()');
};

module.exports = myDB;