// Configuration des différents niveaux
const niveauxDifficulte = {
  // Paramètres des niveaux
  niveau: 'normal', // Par défaut
  
  // Options disponibles
  options: {
    facile: {
      nom: "Facile",
      description: "Indices sans pénalité, temps supplémentaire, plus d'aide",
      coutIndice: 0,       // Pas de pénalité pour les indices
      nombreNoeudsInitiaux: 2,  // Moins de nœuds à découvrir au début
      multiplicateurScore: 0.7, // Score réduit pour compenser la facilité
      pourcentageAideLettre: 40 // % de lettres révélées dans les indices
    },
    normal: {
      nom: "Normal",
      description: "Paramètres standards du jeu",
      coutIndice: 5,       // Coût normal des indices
      nombreNoeudsInitiaux: 3,  // Nombre standard de nœuds
      multiplicateurScore: 1,   // Score normal
      pourcentageAideLettre: 20 // % de lettres révélées dans les indices
    },
    difficile: {
      nom: "Difficile",
      description: "Indices plus chers, plus de nœuds, score augmenté",
      coutIndice: 10,      // Coût élevé des indices
      nombreNoeudsInitiaux: 5,  // Plus de nœuds à découvrir
      multiplicateurScore: 1.5, // Score augmenté pour compenser
      pourcentageAideLettre: 10 // % de lettres révélées dans les indices
    }
  },
  
  /**
   * Initialise le système de difficulté
   */
  initialiser: function() {
    try {
      // Créer l'interface utilisateur
      this.creerInterface();
      
      // Charger le dernier niveau choisi s'il existe
      const niveauSauvegarde = localStorage.getItem('cineexplore_difficulte');
      if (niveauSauvegarde && this.options[niveauSauvegarde]) {
        // Passer false pour ne pas afficher la notification au chargement
        this.changerNiveau(niveauSauvegarde, false);
      }
      
      console.log("Système de niveaux de difficulté initialisé");
    } catch (erreur) {
      console.error("Erreur lors de l'initialisation des niveaux de difficulté:", erreur);
    }
  },
  
  /**
   * Crée l'interface de choix de difficulté
   */
  creerInterface: function() {
    // Créer le conteneur pour le sélecteur de niveaux
    const conteneur = document.querySelector('.game-controls') || document.querySelector('.controles-jeu');
    
    if (!conteneur) return;
    
    // HTML pour le sélecteur
    const selecteurHTML = `
      <div class="selecteur-difficulte">
        <label for="selecteur-niveau">Difficulté :</label>
        <select id="selecteur-niveau" class="selecteur">
          ${Object.keys(this.options).map(niveau => 
            `<option value="${niveau}" ${niveau === this.niveau ? 'selected' : ''}>
              ${this.options[niveau].nom}
            </option>`
          ).join('')}
        </select>
        <div class="info-bulle-difficulte">?
          <span class="texte-info-bulle" id="description-difficulte">
            ${this.options[this.niveau].description}
          </span>
        </div>
      </div>
    `;
    
    // Insérer dans le DOM
    conteneur.insertAdjacentHTML('afterbegin', selecteurHTML);
    
    // Ajout des styles CSS
    this.ajouterStyles();
    
    // Ajouter l'écouteur d'événement
    const selecteur = document.getElementById('selecteur-niveau');
    if (selecteur) {
      selecteur.addEventListener('change', (e) => {
        this.changerNiveau(e.target.value);
      });
    }
  },
  
  /**
   * Change le niveau de difficulté
   * @param {string} niveau - Le niveau à définir
   * @param {boolean} afficherNotification - Si true, affiche une notification
   */
  changerNiveau: function(niveau, afficherNotification = true) {
    // Vérifier si le niveau existe
    if (!this.options[niveau]) {
      console.error(`Niveau de difficulté "${niveau}" inconnu`);
      return;
    }
    
    // Mettre à jour le niveau courant
    this.niveau = niveau;
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('cineexplore_difficulte', niveau);
    
    // Mettre à jour la description dans l'info-bulle
    const descriptionElement = document.getElementById('description-difficulte');
    if (descriptionElement) {
      descriptionElement.textContent = this.options[niveau].description;
    }
    
    console.log(`Niveau de difficulté changé pour: ${this.options[niveau].nom}`);
    
    // Notification uniquement si demandé explicitement
    if (afficherNotification && window.Swal) {
      Swal.fire({
        icon: 'info',
        title: `Difficulté: ${this.options[niveau].nom}`,
        text: this.options[niveau].description,
        timer: 2000,
        showConfirmButton: false
      });
    }
  },
  
  /**
   * Ajoute les styles CSS pour l'interface
   */
  ajouterStyles: function() {
    const style = document.createElement('style');
    style.textContent = `
      .selecteur-difficulte {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-right: 15px;
      }
      
      .info-bulle-difficulte {
        position: relative;
        display: inline-block;
        width: 20px;
        height: 20px;
        background-color: #3498db;
        color: white;
        border-radius: 50%;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        cursor: help;
      }
      
      .info-bulle-difficulte .texte-info-bulle {
        visibility: hidden;
        width: 200px;
        background-color: #34495e;
        color: white;
        text-align: center;
        border-radius: 6px;
        padding: 8px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -100px;
        opacity: 0;
        transition: opacity 0.3s;
        font-weight: normal;
        font-size: 12px;
      }
      
      .info-bulle-difficulte:hover .texte-info-bulle {
        visibility: visible;
        opacity: 1;
      }
      
      .selecteur {
        padding: 8px 12px;
        border-radius: 20px;
        border: 1px solid #ddd;
        background-color: white;
        color: #2c3e50;
        font-size: 0.9rem;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  },
  
  /**
   * Obtenir le coût d'un indice selon le niveau de difficulté
   */
  obtenirCoutIndice: function() {
    return this.options[this.niveau].coutIndice;
  },
  
  /**
   * Obtenir le nombre de nœuds initiaux selon le niveau
   */
  obtenirNombreNoeudsInitiaux: function() {
    return this.options[this.niveau].nombreNoeudsInitiaux;
  },
  
  /**
   * Obtenir le multiplicateur de score selon le niveau
   */
  obtenirMultiplicateurScore: function() {
    return this.options[this.niveau].multiplicateurScore;
  },
  
  /**
   * Obtenir un indice amélioré selon le niveau de difficulté
   */
  ameliorerIndice: function(indiceOriginal, mot) {
    if (!mot || this.niveau === 'difficile') {
      return indiceOriginal;
    }
    
    // En mode facile, on révèle plus de lettres
    const pourcentage = this.options[this.niveau].pourcentageAideLettre;
    if (pourcentage <= 0) return indiceOriginal;
    
    // Extraire la partie "commence par XX..." de l'indice
    const partieDebutOriginal = indiceOriginal.match(/commence par "(.*?)\.\.\."/);
    if (!partieDebutOriginal || !partieDebutOriginal[1]) {
      return indiceOriginal; // Format d'indice non reconnu, retourner l'original
    }
    
    // Calculer combien de lettres révéler (en plus des premières déjà visibles)
    const nbLettres = Math.ceil(mot.length * (pourcentage / 100));
    const debutMot = partieDebutOriginal[1]; // Les premières lettres déjà visibles
    
    // Créer un masque du mot complet avec des underscores
    let motMasque = '';
    for (let i = 0; i < mot.length; i++) {
      // Garder les espaces et la ponctuation visibles
      if (mot[i] === ' ' || mot[i] === '\'' || mot[i] === '-' || mot[i] === ':') {
        motMasque += mot[i];
      }
      // Garder les premières lettres déjà visibles
      else if (i < debutMot.length) {
        motMasque += mot[i];
      }
      // Le reste en underscores
      else {
        motMasque += '_';
      }
    }
    
    // Choisir des positions aléatoires pour révéler des lettres supplémentaires
    const positions = [];
    while (positions.length < nbLettres && positions.length < mot.length) {
      const pos = Math.floor(Math.random() * mot.length);
      // Ne pas révéler les lettres déjà visibles au début
      if (!positions.includes(pos) && pos >= debutMot.length && mot[pos] !== ' ' && mot[pos] !== '\'' && mot[pos] !== '-' && mot[pos] !== ':') {
        positions.push(pos);
      }
    }
    
    // Révéler les lettres supplémentaires dans le mot masqué
    positions.forEach(pos => {
      motMasque = motMasque.substring(0, pos) + mot[pos] + motMasque.substring(pos + 1);
    });
    
    // Remplacer la partie "commence par XX..." par la version améliorée
    return indiceOriginal.replace(/commence par "(.*?)\.\.\."/g, `commence par "${motMasque}"`);
  }
};

// Exposer explicitement l'objet au niveau global
window.niveauxDifficulte = niveauxDifficulte;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  niveauxDifficulte.initialiser();
});