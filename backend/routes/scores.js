const express = require("express");
const router = express.Router();
const { Score } = require("../sgbd/models.js");

// Récupérer tous les scores (top 10)
router.get("/", async (req, res) => {
  try {
    const scores = await Score.findAll({
      order: [["score", "DESC"]],
      limit: 10,
    });
    
    res.json({
      success: true,
      count: scores.length,
      data: scores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des scores",
      error: error.message,
    });
  }
});

// Récupérer le score d'un joueur spécifique
router.get("/:playerName", async (req, res) => {
  try {
    const score = await Score.findOne({
      where: { player_name: req.params.playerName },
    });
    
    if (!score) {
      return res.status(404).json({
        success: false,
        message: "Score non trouvé pour ce joueur",
      });
    }
    
    res.json({
      success: true,
      data: score,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du score",
      error: error.message,
    });
  }
});

// Enregistrer un score
router.post("/", async (req, res) => {
  try {
    const { playerName, score, gameDuration, itemsDiscovered } = req.body;
    
    // Modification ici pour accepter un score de 0
    if (!playerName || score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: "Le nom du joueur et le score sont requis",
      });
    }
    
    // Vérifier si le joueur existe déjà
    const existingScore = await Score.findOne({
      where: { player_name: playerName },
    });
    
    if (existingScore) {
      // Mettre à jour seulement si le nouveau score est meilleur
      if (score > existingScore.score) {
        await existingScore.update({
          score,
          game_duration: gameDuration,
          items_discovered: itemsDiscovered,
          date_created: new Date(),
        });
        
        return res.json({
          success: true,
          message: "Score mis à jour avec succès",
          data: { playerName, score, updated: true },
        });
      } else {
        return res.json({
          success: true,
          message: "Le score existant est meilleur, pas de mise à jour",
          data: { playerName, score, updated: false },
        });
      }
    }
    
    // Créer un nouveau score
    const newScore = await Score.create({
      player_name: playerName,
      score,
      game_duration: gameDuration,
      items_discovered: itemsDiscovered,
    });
    
    res.status(201).json({
      success: true,
      message: "Score enregistré avec succès",
      data: { playerName, score, updated: true },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement du score",
      error: error.message,
    });
  }
});

module.exports = router;