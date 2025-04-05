document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Récupérer les données des scores depuis l'API
    await chargerClassement();
    
    // Récupérer et afficher les statistiques globales
    await chargerStatistiquesGlobales();
    
    // Commentez ou supprimez cette ligne
    // await chargerGraphiques();
    
  } catch (erreur) {
    console.error('Erreur lors du chargement des données:', erreur);
    afficherErreur('Une erreur est survenue lors du chargement des données.');
  }
});

// Fonction pour charger le classement
async function chargerClassement() {
  try {
    const scores = await api.getTopScores();
    
    if (!scores || scores.length === 0) {
      document.getElementById('corps-tableau').innerHTML = 
        '<tr><td colspan="6" class="chargement">Aucun score enregistré pour le moment.</td></tr>';
      return;
    }
    
    const corpsTableau = document.getElementById('corps-tableau');
    corpsTableau.innerHTML = '';
    
    scores.forEach((score, index) => {
      const ligne = document.createElement('tr');
      
      // Date formatée
      const objDate = new Date(score.date_created);
      const dateFormatee = objDate.toLocaleDateString();
      
      // Durée formatée
      const duree = formaterDuree(score.game_duration);
      
      ligne.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.player_name}</td>
        <td>${score.score}</td>
        <td>${score.items_discovered}</td>
        <td>${duree}</td>
        <td>${dateFormatee}</td>
      `;
      
      corpsTableau.appendChild(ligne);
    });
    
  } catch (erreur) {
    console.error('Erreur lors du chargement du classement:', erreur);
    afficherErreur('Impossible de récupérer le classement des joueurs.');
  }
}

// Fonction pour charger les statistiques globales
async function chargerStatistiquesGlobales() {
  try {
    // Récupérer tous les scores pour calculer les statistiques
    const scores = await api.getTopScores();
    
    if (!scores || scores.length === 0) {
      document.getElementById('score-total').textContent = '0';
      document.getElementById('total-parties').textContent = '0';
      document.getElementById('score-moyen').textContent = '0';
      document.getElementById('duree-moyenne').textContent = '0m 0s';
      return;
    }
    
    // Calcul des statistiques
    const totalParties = scores.length;
    const scoreTotal = scores.reduce((somme, score) => somme + score.score, 0);
    const scoreMoyen = Math.round(scoreTotal / totalParties);
    
    const dureeTotal = scores.reduce((somme, score) => somme + (score.game_duration || 0), 0);
    const dureeMoyenne = Math.round(dureeTotal / totalParties);
    
    // Affichage des statistiques
    document.getElementById('score-total').textContent = scoreTotal;
    document.getElementById('total-parties').textContent = totalParties;
    document.getElementById('score-moyen').textContent = scoreMoyen;
    document.getElementById('duree-moyenne').textContent = formaterDuree(dureeMoyenne);
    
  } catch (erreur) {
    console.error('Erreur lors du chargement des statistiques globales:', erreur);
    afficherErreur('Impossible de récupérer les statistiques globales.');
  }
}

// Fonction utilitaire pour formater la durée
function formaterDuree(secondes) {
  if (!secondes) return '0m 0s';
  
  const minutes = Math.floor(secondes / 60);
  const secondesRestantes = secondes % 60;
  return `${minutes}m ${secondesRestantes}s`;
}

// Fonction pour afficher une erreur
function afficherErreur(message) {
  const container = document.querySelector('.container');
  const divErreur = document.createElement('div');
  divErreur.className = 'message-erreur';
  divErreur.innerHTML = `
    <p><strong>Erreur :</strong> ${message}</p>
    <p>Veuillez rafraîchir la page ou réessayer plus tard.</p>
  `;
  
  // Insérer le message d'erreur au début du container
  container.insertBefore(divErreur, container.firstChild);
}

const express = require("express");
const router = express.Router();
const { Film, Acteur, Genre, Score } = require("../sgbd/models.js");
const myDB = require("../sgbd/config.js");
const { QueryTypes } = require("sequelize");

// Récupérer les statistiques générales
router.get("/", async (req, res) => {
  try {
    // Nombre total de films
    const totalFilms = await Film.count();
    
    // Nombre total d'acteurs
    const totalActeurs = await Acteur.count();
    
    // Nombre total de relations film-acteur
    const [relationResults] = await myDB.query(
      "SELECT COUNT(*) as total FROM FilmActeur",
      { type: QueryTypes.SELECT }
    );
    const totalRelations = relationResults.total;
    
    // Moyenne d'acteurs par film
    const moyenneActeursParFilm = totalFilms > 0 ? totalRelations / totalFilms : 0;
    
    // Distribution des films par année
    const filmsParAnnee = await myDB.query(
      "SELECT year, COUNT(*) as count FROM films GROUP BY year ORDER BY year",
      { type: QueryTypes.SELECT }
    );
    
    // Statistiques sur les scores
    const totalScores = await Score.count();
    const scoreMoyen = totalScores > 0 
      ? (await Score.sum('score')) / totalScores 
      : 0;
    const topScore = await Score.max('score') || 0;
    
    res.json({
      success: true,
      data: {
        totalFilms,
        totalActeurs,
        totalRelations,
        moyenneActeursParFilm,
        filmsParAnnee,
        statistiquesScores: {
          totalParties: totalScores,
          scoreMoyen,
          topScore
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
});

module.exports = router;