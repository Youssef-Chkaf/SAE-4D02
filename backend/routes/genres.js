const express = require("express");
const router = express.Router();
const { Genre, Film } = require("../sgbd/models.js");
const myDB = require("../sgbd/config.js");

// Récupérer tous les genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.json({
      success: true,
      count: genres.length,
      data: genres,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des genres",
      error: error.message,
    });
  }
});

// Récupérer un genre par ID
router.get("/:id", async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Genre non trouvé",
      });
    }
    
    res.json({
      success: true,
      data: genre,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du genre",
      error: error.message,
    });
  }
});

// Récupérer les films d'un genre
router.get("/:id/films", async (req, res) => {
  try {
    const genreId = req.params.id;
    
    // Utiliser une requête SQL brute via Sequelize pour éviter les problèmes d'association
    const films = await myDB.query(
      `SELECT m.* FROM movies m 
       JOIN moviesgenres mg ON m.id = mg.id_movie 
       WHERE mg.id_genre = :genreId`,
      {
        replacements: { genreId },
        type: myDB.QueryTypes.SELECT,
        model: Film,
        mapToModel: true
      }
    );
    
    res.json({
      success: true,
      count: films.length,
      data: films,
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des films du genre",
      error: error.message,
    });
  }
});

module.exports = router;