// Conteneur principal pour les fonctionnalités
const modesThematiques = {
  genresDisponibles: [],
  genreSelectionne: null,

  initialiser: async function() {
    try {
      // Récupérer tous les genres de films
      this.genresDisponibles = await api.getAllGenres();
      
      // Créer le sélecteur de genres
      this.creerInterfaceSelection();
      
      console.log("Modes thématiques initialisés avec", this.genresDisponibles.length, "genres");
    } catch (erreur) {
      console.error("Erreur lors de l'initialisation des modes thématiques:", erreur);
    }
  },
  
  /**
   * Créer l'interface de sélection des genres
   */
  creerInterfaceSelection: function() {
    // Récupérer le conteneur où placer l'élément de sélection
    const conteneur = document.querySelector('.game-controls') || document.querySelector('.controles-jeu');
    
    if (!conteneur) return;
    
    // Créer l'élément de sélection des genres
    const selecteurHTML = `
      <div class="selecteur-genre">
        <label for="selecteur-genre">Thème du jeu :</label>
        <select id="selecteur-genre" class="selecteur">
          <option value="">Tous les genres</option>
          ${this.genresDisponibles.map(genre => 
            `<option value="${genre.id}">${genre.genre}</option>`
          ).join('')}
        </select>
      </div>
    `;
    
    // Insérer l'élément au début du conteneur
    conteneur.insertAdjacentHTML('afterbegin', selecteurHTML);
    
    // Ajouter les écouteurs d'événements
    const selecteur = document.getElementById('selecteur-genre');
    if (selecteur) {
      selecteur.addEventListener('change', (e) => {
        this.genreSelectionne = e.target.value ? parseInt(e.target.value) : null;
        console.log("Genre sélectionné:", this.genreSelectionne);
      });
    }
  },
  
  /**
   * Obtenir un film aléatoire du genre sélectionné
   */
  obtenirFilmAleatoire: async function() {
    try {
      if (!this.genreSelectionne) {
        // Si aucun genre n'est sélectionné, utiliser la fonction standard
        return await api.getRandomFilm();
      }
      
      // Récupérer tous les films du genre spécifié
      const filmsGenre = await api.getFilmsByGenreId(this.genreSelectionne);
      
      if (!filmsGenre || filmsGenre.length === 0) {
        console.log("Aucun film trouvé pour ce genre, utilisation d'un film aléatoire standard");
        return await api.getRandomFilm();
      }
      
      // Choisir un film aléatoire parmi ceux du genre
      const indexAleatoire = Math.floor(Math.random() * filmsGenre.length);
      const filmChoisi = filmsGenre[indexAleatoire];
      
      console.log(`Film aléatoire choisi dans le genre ${this.genreSelectionne}:`, filmChoisi.title);
      return filmChoisi;
    } catch (erreur) {
      console.error("Erreur lors de l'obtention d'un film aléatoire par genre:", erreur);
      // En cas d'erreur, revenir à la méthode standard
      return await api.getRandomFilm();
    }
  },
  
  /**
   * Démarrer une partie thématique
   */
  demarrerPartieThematique: async function() {
    try {
      if (this.genreSelectionne) {
        const genreInfo = this.genresDisponibles.find(g => g.id === this.genreSelectionne);
        
        // Afficher un message de chargement thématique
        Swal.fire({
          title: `Mode thématique : ${genreInfo ? genreInfo.genre : 'Genre spécifique'}`,
          text: 'Préparation du graphe thématique en cours...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
      
      // La fonction de démarrage de jeu sera appelée ensuite
      // par la fonction modifiée startNewGame
    } catch (erreur) {
      console.error("Erreur lors du démarrage de la partie thématique:", erreur);
    }
  },
  
  /**
   * Ajouter des styles CSS spécifiques
   */
  ajouterStyles: function() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .selecteur-genre {
        margin-right: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .selecteur {
        padding: 8px 12px;
        border-radius: 20px;
        border: 1px solid #ddd;
        background-color: white;
        color: #2c3e50;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .selecteur:hover {
        border-color: #3498db;
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
      }
      
      .selecteur:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
      }
    `;
    document.head.appendChild(styleElement);
  }
};

// Ajouter la fonction à l'API pour filtrer les films par genre
api.getFilmsByGenreId = async function(genreId) {
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
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  modesThematiques.ajouterStyles();
  modesThematiques.initialiser();
});