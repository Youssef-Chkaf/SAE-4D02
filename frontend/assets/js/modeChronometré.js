/**
 * modeChronometré.js
 * Système de jeu chronométré pour CinéExplore
 */

const modeChronometré = {
  // Paramètres du mode
  actif: false,
  tempsTotal: 180, // 3 minutes par défaut
  tempsRestant: 0,
  intervalle: null,
  tempsOptions: {
    court: 120,    // 2 minutes
    moyen: 180,    // 3 minutes (défaut)
    long: 300      // 5 minutes
  },
  
  /**
   * Initialise le mode chronométré
   */
  initialiser: function() {
    try {
      this.creerInterface();
      console.log("Mode chronométré initialisé");
    } catch (erreur) {
      console.error("Erreur lors de l'initialisation du mode chronométré:", erreur);
    }
  },
  
  /**
   * Crée l'interface pour le mode chronométré
   */
  creerInterface: function() {
    // Trouver le conteneur où placer les contrôles
    const conteneur = document.querySelector('.game-controls') || document.querySelector('.controles-jeu');
    
    if (!conteneur) {
      console.error("Conteneur pour le mode chronométré non trouvé!");
      return;
    }
    
    console.log("Conteneur trouvé, ajout du mode chronométré");
    
    // Créer le HTML pour le mode chronométré
    const chronoHTML = `
      <div class="mode-chrono">
        <label>
          <input type="checkbox" id="activer-chrono"> Mode chronométré
        </label>
        <div id="options-chrono" class="options-chrono" style="display:none;">
          <select id="duree-chrono" class="selecteur">
            <option value="court">Court (2 min)</option>
            <option value="moyen" selected>Moyen (3 min)</option>
            <option value="long">Long (5 min)</option>
          </select>
        </div>
        <div id="compteur-chrono" class="compteur-chrono" style="display:none;">
          Temps: <span id="temps-restant">03:00</span>
        </div>
      </div>
    `;
    
    // Ajouter au DOM en premier enfant
    conteneur.insertAdjacentHTML('afterbegin', chronoHTML);
    
    // Vérifier que les éléments ont été ajoutés
    console.log("Mode chrono ajouté au DOM:", document.querySelector('.mode-chrono') !== null);
    
    // Ajouter les styles CSS
    this.ajouterStyles();
    
    // Ajouter les écouteurs d'événements
    const checkboxChrono = document.getElementById('activer-chrono');
    const selecteurDuree = document.getElementById('duree-chrono');
    
    if (checkboxChrono) {
      checkboxChrono.addEventListener('change', (e) => {
        const optionsChrono = document.getElementById('options-chrono');
        if (optionsChrono) {
          optionsChrono.style.display = e.target.checked ? 'block' : 'none';
        }
        this.actif = e.target.checked;
      });
    }
    
    if (selecteurDuree) {
      selecteurDuree.addEventListener('change', (e) => {
        const duree = e.target.value;
        if (this.tempsOptions[duree]) {
          this.tempsTotal = this.tempsOptions[duree];
          this.afficherTemps(this.tempsTotal);
        }
      });
    }
    
    // Écouter l'événement de début de partie pour démarrer le chronomètre
    document.addEventListener('nouveauJeu', () => {
      if (this.actif) {
        this.demarrerChrono();
      }
    });
  },
  
  /**
   * Ajoute les styles CSS nécessaires
   */
  ajouterStyles: function() {
    const style = document.createElement('style');
    style.textContent = `
      .mode-chrono {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-right: 20px;
        padding: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #f8f9fa;
      }
      
      .options-chrono {
        margin-top: 5px;
      }
      
      .compteur-chrono {
        font-weight: bold;
        font-size: 1.2rem;
        color: #2c3e50;
        text-align: center;
        margin-top: 5px;
      }
      
      .temps-critique {
        color: #e74c3c !important;
        animation: clignoter 1s infinite;
      }
      
      @keyframes clignoter {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  },
  
  /**
   * Démarre le chronomètre
   */
  demarrerChrono: function() {
    // Arrêter le chronomètre s'il est déjà en cours
    if (this.intervalle) {
      clearInterval(this.intervalle);
    }
    
    // Réinitialiser le temps restant
    this.tempsRestant = this.tempsTotal;
    
    // Afficher le compteur
    const compteurChrono = document.getElementById('compteur-chrono');
    if (compteurChrono) {
      compteurChrono.style.display = 'block';
    }
    
    // Afficher le temps initial
    this.afficherTemps(this.tempsRestant);
    
    // Démarrer l'intervalle
    this.intervalle = setInterval(() => {
      this.tempsRestant--;
      
      // Afficher le temps restant
      this.afficherTemps(this.tempsRestant);
      
      // Vérifier si le temps est écoulé
      if (this.tempsRestant <= 0) {
        this.terminerPartie();
      } else if (this.tempsRestant <= 30) {
        // Ajouter une classe pour l'animation de clignotement en fin de temps
        document.getElementById('temps-restant').classList.add('temps-critique');
      }
    }, 1000);
    
    console.log("Chronomètre démarré avec", this.tempsTotal, "secondes");
  },
  
  /**
   * Affiche le temps restant formaté
   */
  afficherTemps: function(secondes) {
    const tempsElement = document.getElementById('temps-restant');
    if (!tempsElement) return;
    
    const minutes = Math.floor(secondes / 60);
    const secondesRestantes = secondes % 60;
    
    // Format MM:SS avec zéros devant si nécessaire
    tempsElement.textContent = 
      `${minutes < 10 ? '0' : ''}${minutes}:${secondesRestantes < 10 ? '0' : ''}${secondesRestantes}`;
  },
  
  /**
   * Arrête le chronomètre et termine la partie
   */
  terminerPartie: function() {
    // Arrêter le chronomètre
    if (this.intervalle) {
      clearInterval(this.intervalle);
      this.intervalle = null;
    }
    
    // Calculer le score final en fonction du temps restant
    const score = window.etatJeu ? window.etatJeu.score : 0;
    
    // Afficher le message de fin
    if (window.Swal) {
      Swal.fire({
        icon: 'info',
        title: 'Temps écoulé !',
        text: `La partie est terminée ! Votre score final est de ${score} points.`,
        confirmButtonText: 'Nouvelle partie',
        showCancelButton: false
      }).then(() => {
        // Démarrer une nouvelle partie
        if (window.commencerNouvellePartie) {
          window.commencerNouvellePartie();
        }
      });
    }
    
    console.log("Partie terminée, temps écoulé");
  },
  
  /**
   * Ajoute du temps supplémentaire (bonus)
   */
  ajouterTemps: function(secondes) {
    if (!this.actif || !this.intervalle) return;
    
    this.tempsRestant += secondes;
    this.afficherTemps(this.tempsRestant);
    
    // Notification
    if (window.Swal) {
      const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      
      toast.fire({
        icon: 'success',
        title: `+${secondes} secondes !`
      });
    }
    
    console.log(`${secondes} secondes ajoutées au chronomètre`);
  },
  
  /**
   * Pause le chronomètre temporairement (par ex. pendant une question)
   */
  pauserChrono: function() {
    if (!this.actif || !this.intervalle) return;
    
    clearInterval(this.intervalle);
    this.intervalle = null;
  },
  
  /**
   * Reprend le chronomètre après une pause
   */
  reprendreChrono: function() {
    if (!this.actif || this.intervalle) return;
    
    this.intervalle = setInterval(() => {
      this.tempsRestant--;
      this.afficherTemps(this.tempsRestant);
      
      if (this.tempsRestant <= 0) {
        this.terminerPartie();
      }
    }, 1000);
  },
  
  /**
   * Obtenir le score bonus basé sur le temps restant
   */
  obtenirBonusTemps: function() {
    if (!this.actif) return 0;
    
    // Calculer un bonus proportionnel au temps restant
    const pourcentageTempsRestant = (this.tempsRestant / this.tempsTotal) * 100;
    const bonus = Math.round(pourcentageTempsRestant);
    
    return bonus;
  }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  modeChronometré.initialiser();
  
  // Surcharger les fonctions du jeu pour intégrer le mode chronométré
  
  // Sauvegarder la fonction originale gererClicNoeud
  const gererClicNoeudOriginal = window.gererClicNoeud;
  
  // Surcharger la fonction pour pauser le chronomètre pendant les questions
  if (window.gererClicNoeud) {
    window.gererClicNoeud = function(noeud) {
      // Pauser le chronomètre pendant la question
      modeChronometré.pauserChrono();
      
      // Appeler la fonction originale
      return gererClicNoeudOriginal(noeud);
    };
  }
  
  // Surcharger la fonction verifierReponse pour reprendre le chronomètre
  const verifierReponseOriginal = window.verifierReponse;
  
  if (window.verifierReponse) {
    window.verifierReponse = function(reponse) {
      // Reprendre le chronomètre quand la question est terminée
      setTimeout(() => {
        modeChronometré.reprendreChrono();
      }, 500);
      
      // Appeler la fonction originale
      return verifierReponseOriginal(reponse);
    };
  }
  
  // Créer un écouteur d'événement personnalisé pour le démarrage d'une nouvelle partie
  const commencerNouvellePartieOriginal = window.commencerNouvellePartie;
  
  if (window.commencerNouvellePartie) {
    window.commencerNouvellePartie = function() {
      // Exécuter la fonction originale
      const resultat = commencerNouvellePartieOriginal();
      
      // Émettre un événement personnalisé
      document.dispatchEvent(new CustomEvent('nouveauJeu'));
      
      return resultat;
    };
  }
  
  // Écouter l'événement click sur le bouton nouveau-jeu directement
  const btnNouveauJeu = document.getElementById('nouveau-jeu');
  if (btnNouveauJeu) {
    btnNouveauJeu.addEventListener('click', function() {
      // Si le mode chronométré est actif, démarrer le chronomètre
      if (modeChronometré.actif) {
        console.log("Démarrage du chronomètre via clic sur nouveau-jeu");
        setTimeout(() => {
          modeChronometré.demarrerChrono();
        }, 1000); // Laisser le temps au jeu de s'initialiser
      }
    });
  }
  
  // Même chose pour le bouton "Commencer à jouer"
  const btnJouer = document.getElementById('btn-jouer');
  if (btnJouer) {
    btnJouer.addEventListener('click', function() {
      // Si le mode chronométré est actif, démarrer le chronomètre
      if (modeChronometré.actif) {
        console.log("Démarrage du chronomètre via clic sur btn-jouer");
        setTimeout(() => {
          modeChronometré.demarrerChrono();
        }, 1000);
      }
    });
  }
});