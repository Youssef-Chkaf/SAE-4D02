// Configuration de base pour l'API
const API_URL = 'http://localhost:3000/api';

// Objet contenant toutes les fonctions d'appel à l'API
const api = {
  // Récupérer les statistiques générales
  getStatistiques: async function() {
    try {
      const response = await fetch(`${API_URL}/statistiques`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des statistiques');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erreur API (statistiques):', error);
      throw error;
    }
  },
  
  // FILMS
  
  // Récupérer tous les films
  getAllFilms: async function() {
    try {
      const response = await fetch(`${API_URL}/films`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des films');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erreur API (getAllFilms):', error);
      throw error;
    }
  },
  
  // Récupérer un film aléatoire
  getRandomFilm: async function() {
    try {
      const response = await fetch(`${API_URL}/films/random`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération d\'un film aléatoire');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erreur API (getRandomFilm):', error);
      throw error;
    }
  },
  
  // Récupérer un film par son ID
  getFilmById: async function(filmId) {
    try {
      const response = await fetch(`${API_URL}/films/${filmId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération du film');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getFilmById ${filmId}):`, error);
      throw error;
    }
  },
  
  // Récupérer les acteurs d'un film
  getActeursByFilmId: async function(filmId) {
    try {
      const response = await fetch(`${API_URL}/films/${filmId}/acteurs`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des acteurs du film');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getActeursByFilmId ${filmId}):`, error);
      throw error;
    }
  },

  // Récupérer les genres d'un film
  getGenresByFilmId: async function(filmId) {
    try {
      const response = await fetch(`${API_URL}/films/${filmId}/genres`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des genres du film');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getGenresByFilmId ${filmId}):`, error);
      throw error;
    }
  },
  
  // ACTEURS
  
  // Récupérer tous les acteurs
  getAllActeurs: async function() {
    try {
      const response = await fetch(`${API_URL}/acteurs`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des acteurs');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erreur API (getAllActeurs):', error);
      throw error;
    }
  },
  
  // Récupérer un acteur aléatoire
  getRandomActeur: async function() {
    try {
      const response = await fetch(`${API_URL}/acteurs/random`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération d\'un acteur aléatoire');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erreur API (getRandomActeur):', error);
      throw error;
    }
  },
  
  // Récupérer un acteur par son ID
  getActeurById: async function(acteurId) {
    try {
      const response = await fetch(`${API_URL}/acteurs/${acteurId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération de l\'acteur');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getActeurById ${acteurId}):`, error);
      throw error;
    }
  },
  
  // Récupérer les films d'un acteur
  getFilmsByActeurId: async function(acteurId) {
    try {
      const response = await fetch(`${API_URL}/acteurs/${acteurId}/films`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des films de l\'acteur');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getFilmsByActeurId ${acteurId}):`, error);
      throw error;
    }
  },

  // GENRES
  
  // Récupérer tous les genres
  getAllGenres: async function() {
    try {
      const response = await fetch(`${API_URL}/genres`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des genres');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erreur API (getAllGenres):', error);
      throw error;
    }
  },
  
  // Récupérer un genre par son ID
  getGenreById: async function(genreId) {
    try {
      const response = await fetch(`${API_URL}/genres/${genreId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération du genre');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getGenreById ${genreId}):`, error);
      throw error;
    }
  },
  
  // Récupérer les films d'un genre
  getFilmsByGenreId: async function(genreId) {
    try {
      const response = await fetch(`${API_URL}/genres/${genreId}/films`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des films du genre');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getFilmsByGenreId ${genreId}):`, error);
      throw error;
    }
  },

  // Ajouter cette méthode à l'objet api
  saveScore: async function(playerName, score, gameDuration, itemsDiscovered) {
    try {
      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerName,
          score,
          gameDuration,
          itemsDiscovered
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde du score');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur API (saveScore):', error);
      throw error;
    }
  },

  // Fonction pour récupérer le meilleur score d'un joueur
  getPlayerScore: async function(playerName) {
    try {
      const response = await fetch(`${API_URL}/scores/${encodeURIComponent(playerName)}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération du score');
      }
      
      return data.data;
    } catch (error) {
      console.error(`Erreur API (getPlayerScore ${playerName}):`, error);
      throw error;
    }
  },

  // Fonction pour récupérer le top 10
  getTopScores: async function() {
    try {
      const response = await fetch(`${API_URL}/scores`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des scores');
      }
      
      return data.data;
    } catch (error) {
      console.error('Erreur API (getTopScores):', error);
      throw error;
    }
  }
};