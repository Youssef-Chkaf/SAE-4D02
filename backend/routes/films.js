const express = require("express");
const router = express.Router();
const { Film, Acteur, Genre } = require("../sgbd/models.js");
const { Op } = require("sequelize");
const myDB = require("../sgbd/config.js");

// Récupérer tous les films
router.get("/", async (req, res) => {
  try {
    const films = await Film.findAll();
    res.json({
      success: true,
      count: films.length,
      data: films,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
});

// Récupérer un film aléatoire
router.get("/random", async (req, res) => {
  try {
    const film = await Film.findOne({ order: myDB.random() });
    res.json({
      success: true,
      data: film,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération d'un film aléatoire",
      error: error.message,
    });
  }
});

// Récupérer un film par ID
router.get("/:id", async (req, res) => {
  try {
    const film = await Film.findByPk(req.params.id);
    
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouvé",
      });
    }
    
    res.json({
      success: true,
      data: film,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du film",
      error: error.message,
    });
  }
});

// Récupérer les acteurs d'un film
router.get("/:id/acteurs", async (req, res) => {
  try {
    const filmId = req.params.id;
    
    // Utiliser une requête SQL brute via Sequelize pour éviter les problèmes d'association
    const acteurs = await myDB.query(
      `SELECT a.* FROM actors a 
       JOIN moviesactors ma ON a.id = ma.id_actor 
       WHERE ma.id_movie = :filmId`,
      {
        replacements: { filmId },
        type: myDB.QueryTypes.SELECT,
        model: Acteur,
        mapToModel: true
      }
    );
    
    res.json({
      success: true,
      count: acteurs.length,
      data: acteurs,
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des acteurs du film",
      error: error.message,
    });
  }
});

// Récupérer les genres d'un film
router.get("/:id/genres", async (req, res) => {
  try {
    const filmId = req.params.id;
    
    // Utiliser une requête SQL brute via Sequelize pour éviter les problèmes d'association
    const genres = await myDB.query(
      `SELECT g.* FROM genres g 
       JOIN moviesgenres mg ON g.id = mg.id_genre 
       WHERE mg.id_movie = :filmId`,
      {
        replacements: { filmId },
        type: myDB.QueryTypes.SELECT,
        model: Genre,
        mapToModel: true
      }
    );
    
    res.json({
      success: true,
      count: genres.length,
      data: genres,
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des genres du film",
      error: error.message,
    });
  }
});

module.exports = router;