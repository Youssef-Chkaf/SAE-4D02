// Clé utilisée pour le stockage local
const STORAGE_KEY = 'cine_explore_game';

// Objet pour gérer le stockage local
const storage = {
  // Sauvegarder l'état du jeu
  saveGameState: function(gameState) {
    try {
      const gameData = JSON.stringify(gameState);
      localStorage.setItem(STORAGE_KEY, gameData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du jeu:', error);
      return false;
    }
  },
  
  // Charger l'état du jeu
  loadGameState: function() {
    try {
      const gameData = localStorage.getItem(STORAGE_KEY);
      if (!gameData) {
        return null;
      }
      return JSON.parse(gameData);
    } catch (error) {
      console.error('Erreur lors du chargement du jeu:', error);
      return null;
    }
  },
  
  // Vérifier si une partie sauvegardée existe
  hasGameState: function() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },
  
  // Supprimer la partie sauvegardée
  clearGameState: function() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la sauvegarde:', error);
      return false;
    }
  }
};