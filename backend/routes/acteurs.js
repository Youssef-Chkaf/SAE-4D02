const express = require('express');
const router = express.Router();
const { Acteur, Film } = require('../sgbd/models.js');
const { Op } = require('sequelize');
const myDB = require('../sgbd/config.js');

// Route pour récupérer tous les acteurs
router.get('/', async (req, res) => {
  try {
    const acteurs = await Acteur.findAll();
    
    res.json({
      success: true,
      count: acteurs.length,
      data: acteurs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des acteurs',
      error: error.message
    });
  }
});

// Route pour récupérer un acteur aléatoire
router.get('/random', async (req, res) => {
  try {
    const acteur = await Acteur.findOne({ 
      order: myDB.random() // Nécessite de définir cette fonction dans config.js
    });
    
    res.json({
      success: true,
      data: acteur
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération d\'un acteur aléatoire',
      error: error.message
    });
  }
});

// Route pour récupérer un acteur par son ID
router.get('/:id', async (req, res) => {
  try {
    const acteur = await Acteur.findByPk(req.params.id);
    
    if (!acteur) {
      return res.status(404).json({
        success: false,
        message: 'Acteur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: acteur
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération de l\'acteur',
      error: error.message
    });
  }
});

// Route pour récupérer les films d'un acteur
router.get('/:id/films', async (req, res) => {
  try {
    const acteurId = req.params.id;
    
    // Utiliser une requête SQL brute via Sequelize pour éviter les problèmes d'association
    const films = await myDB.query(
      `SELECT m.* FROM movies m 
       JOIN moviesactors ma ON m.id = ma.id_movie 
       WHERE ma.id_actor = :acteurId`,
      {
        replacements: { acteurId },
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
      message: 'Erreur lors de la récupération des films de l\'acteur',
      error: error.message
    });
  }
});

module.exports = router;