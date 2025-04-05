require("dotenv").config();

const express = require("express");
const cors = require("cors");
const myDB = require("./backend/sgbd/config.js");
const { Score } = require("./backend/sgbd/models.js");

const routerFilms = require("./backend/routes/films.js");
const routerActeurs = require("./backend/routes/acteurs.js");
const routerGenres = require("./backend/routes/genres.js");
const routerScores = require("./backend/routes/scores.js");

const app = express();

// Active CORS pour les requêtes du frontend
app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.json({
    message: "API CinéExplore - Découverte interactive de films",
    version: "1.0.0"
  });
});

app.use("/api/films", routerFilms);
app.use("/api/acteurs", routerActeurs);
app.use("/api/genres", routerGenres);
app.use("/api/scores", routerScores);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  Score.sync({ force: false })
    .then(() => {
      console.log("Table Score synchronisée");
      
      app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Échec de la synchronisation de la table Score:", error);
      app.listen(PORT, () => {
        console.log(`Serveur démarré sans synchronisation sur http://localhost:${PORT}`);
      });
    });
}

module.exports = app; // Pour les tests