// État du jeu
let etatJeu = {
  elementCourant: null,
  type: null,
  elementsDecouverts: [],
  aDecouvrir: [],
  tousElementsDecouverts: new Set(),
  noeudActif: null,
  score: 0,
  tempsDebut: null,
  profondeursExtension: 0,
  genresMemoises: {}
};

// Variables système de bonus
let decouvertesConsecutives = 0;
const BONUS_COMBO = 5;

// INITIALISATION
document.addEventListener('DOMContentLoaded', function() {
  // Initialisation du graphe
  graphe.init();
  graphe.onNodeClick = gererClicNoeud;
  
  // Configuration des navigations
  configurerNavigation();
  
  // Ajouter les écouteurs d'événements aux boutons
  document.getElementById('btn-jouer').addEventListener('click', function() {
    afficherSection('jeu');
    commencerNouvellePartie();
  });
  
  document.getElementById('nouveau-jeu').addEventListener('click', commencerNouvellePartie);
  document.getElementById('save-score').addEventListener('click', demanderSauvegardeScore);
});

// NAVIGATION
function configurerNavigation() {
  const liens = document.querySelectorAll('nav a[data-section]');
  
  liens.forEach(lien => {
    lien.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      afficherSection(section);
      window.location.hash = section;
    });
  });
  
  // Vérifier si une section est spécifiée dans l'URL
  if(window.location.hash) {
    afficherSection(window.location.hash.substring(1));
  }
}

function afficherSection(idSection) {
  // Cacher toutes les sections
  document.querySelectorAll('section.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Afficher la section cible
  const sectionCible = document.getElementById(idSection);
  if (sectionCible) {
    sectionCible.classList.add('active');
    
    // Mettre à jour la navigation
    document.querySelectorAll('nav a').forEach(lien => {
      lien.classList.remove('active');
      if (lien.getAttribute('data-section') === idSection) {
        lien.classList.add('active');
      }
    });
  }
}

// GESTION DE JEU
async function commencerNouvellePartie() {
  try {
    // Afficher message de chargement
    const alerteChargement = Swal.fire({
      title: 'Chargement...',
      text: 'Préparation du graphe en cours',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Réinitialiser l'état du jeu
    reinitialiserEtatJeu();
    
    // Choisir aléatoirement entre commencer par un film ou un acteur
    const commencerParFilm = Math.random() > 0.5;
    
    if (commencerParFilm) {
      // Récupérer un film aléatoire
      const film = window.modesThematiques && modesThematiques.genreSelectionne ? 
        await modesThematiques.obtenirFilmAleatoire() : 
        await api.getRandomFilm();
      
      etatJeu.elementCourant = film;
      etatJeu.type = 'film';
      
      // Texte d'objectif avec genre si disponible
      let texteObjectif = `Explorez le graphe en commençant par le film "${film.title}". `;
      
      // Ajouter info de genre si disponible
      if (modesThematiques && modesThematiques.genreSelectionne) {
        const infoGenre = modesThematiques.genresDisponibles.find(g => 
          g.id === modesThematiques.genreSelectionne);
        
        if (infoGenre) {
          texteObjectif += `(Genre: ${infoGenre.genre}) `;
        }
      }
      
      texteObjectif += "Cliquez sur les nœuds pour répondre aux questions.";
      document.getElementById('objectif').textContent = texteObjectif;
      
      // Récupérer les acteurs liés au film
      const acteurs = await api.getActeursByFilmId(film.id);
      etatJeu.aDecouvrir = acteurs;
      
      // Récupérer les genres du film
      try {
        const genres = await api.getGenresByFilmId(film.id);
        if (genres && genres.length > 0) {
          etatJeu.genresMemoises[film.id] = genres;
        }
      } catch (erreur) {
        console.log("Erreur lors du chargement des genres du film initial", erreur);
      }
      
      // Initialiser le graphe avec le film
      initialiserGraphe(film, 'film');
      
    } else {
      // Récupérer un acteur aléatoire
      const acteur = await api.getRandomActeur();
      etatJeu.elementCourant = acteur;
      etatJeu.type = 'acteur';
      
      // Récupérer les films liés à l'acteur
      const films = await api.getFilmsByActeurId(acteur.id);
      etatJeu.aDecouvrir = films;
      
      // Récupérer les genres des films
      for (let i = 0; i < Math.min(films.length, 5); i++) {
        try {
          const genres = await api.getGenresByFilmId(films[i].id);
          if (genres && genres.length > 0) {
            etatJeu.genresMemoises[films[i].id] = genres;
          }
        } catch (erreur) {
          console.log(`Erreur genres film ${films[i].id}`, erreur);
        }
      }
      
      // Texte d'objectif
      document.getElementById('objectif').textContent = 
        `Explorez le graphe en commençant par l'acteur "${acteur.name}". Cliquez sur les nœuds pour répondre aux questions.`;
      
      // Initialiser le graphe avec l'acteur
      initialiserGraphe(acteur, 'acteur');
    }
    
    // Enregistrer l'heure de début
    etatJeu.tempsDebut = new Date();
    
    // Sauvegarder l'état et mettre à jour l'affichage
    storage.saveGameState(etatJeu);
    mettreAJourScore();
    
    // Fermer l'alerte de chargement
    alerteChargement.close();
    
  } catch (erreur) {
    console.error('Erreur nouvelle partie:', erreur);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Impossible de démarrer une nouvelle partie'
    });
  }
}

// GESTION DU GRAPHE
function initialiserGraphe(element, type) {
  // Réinitialiser le graphe
  graphe.reset();
  
  // Créer le nœud central
  const noeudCentral = {
    id: element.id,
    name: type === 'film' ? (element.title || element.name || '') : (element.name || ''),
    title: type === 'film' ? (element.title || element.name || '') : '',
    type: type,
    central: true,
    discovered: true,
    year: type === 'film' ? element.year : null
  };
  
  // Marquer l'élément comme découvert
  etatJeu.tousElementsDecouverts.add(element.id);
  
  // Vérifier si on a des éléments à découvrir
  if (!etatJeu.aDecouvrir || etatJeu.aDecouvrir.length === 0) {
    console.error("Aucun élément à découvrir");
    return;
  }
  
  // Limiter le nombre initial de nœuds à 3
  const nombreNoeudsInitiaux = Math.min(3, etatJeu.aDecouvrir.length);
  const elementsInitiaux = etatJeu.aDecouvrir.slice(0, nombreNoeudsInitiaux);
  etatJeu.aDecouvrir = elementsInitiaux;
  
  // Créer les nœuds inconnus
  const noeudsInconnus = elementsInitiaux.map(item => {
    return {
      id: item.id,
      name: type === 'film' ? (item.name || '') : (item.title || item.name || ''),
      title: type === 'film' ? '' : (item.title || item.name || ''),
      type: type === 'film' ? 'acteur' : 'film',
      discovered: false,
      year: type === 'acteur' ? item.year : null
    };
  });
  
  // Créer les liens entre le nœud central et les nœuds inconnus
  const liens = noeudsInconnus.map(noeud => {
    return {
      source: noeudCentral.id,
      target: noeud.id
    };
  });
  
  // Charger les données dans le graphe
  graphe.loadData([noeudCentral, ...noeudsInconnus], liens);
  
  // Mettre à jour le graphe après un court délai
  setTimeout(() => {
    graphe.updateGraph();
  }, 500);
}

// INTERACTION AVEC LE GRAPHE
async function gererClicNoeud(noeud) {
  // Ignorer les nœuds déjà découverts ou centraux
  if (noeud.discovered || noeud.central) {
    return;
  }
  
  // Définir le nœud actif
  etatJeu.noeudActif = noeud;
  
  // Trouver le nœud parent (celui qui a mené à ce nœud)
  const noeudParent = noeud.parentNode ? 
    graphe.nodes.find(n => n.id === noeud.parentNode) : 
    { 
      id: etatJeu.elementCourant.id,
      name: etatJeu.type === 'film' ? etatJeu.elementCourant.title : etatJeu.elementCourant.name,
      type: etatJeu.type,
      year: etatJeu.type === 'film' ? etatJeu.elementCourant.year : null
    };
  
  // Générer une question aléatoire
  let texteQuestion = '';
  const varieteQuestion = Math.floor(Math.random() * 3);
  
  if (noeud.type === 'acteur') {
    // Questions pour un acteur
    switch(varieteQuestion) {
      case 0:
        texteQuestion = `Quel est le nom de cet acteur qui joue dans "${noeudParent.name || noeudParent.title}" ?`;
        break;
      case 1:
        texteQuestion = `Cet acteur a un rôle dans "${noeudParent.name || noeudParent.title}". Qui est-ce ?`;
        break;
      case 2:
        texteQuestion = `"${noeudParent.name || noeudParent.title}" met en vedette cet acteur. Pouvez-vous nommer cet acteur ?`;
        break;
    }
  } else {
    // Questions pour un film
    let infoGenre = "";
    try {
      if (noeud.id) {
        const genres = await api.getGenresByFilmId(noeud.id);
        if (genres && genres.length > 0) {
          const nomsGenres = genres.map(g => g.genre).join(', ');
          infoGenre = ` de genre ${nomsGenres}`;
        }
      }
    } catch (erreur) {
      console.log("Impossible d'obtenir le genre du film", erreur);
    }
    
    const infoAnnee = noeud.year ? ` sorti en ${noeud.year}` : "";
    
    switch(varieteQuestion) {
      case 0:
        texteQuestion = `Quel est le titre de ce film${infoGenre}${infoAnnee} dans lequel joue "${noeudParent.name}" ?`;
        break;
      case 1:
        texteQuestion = `"${noeudParent.name}" apparaît dans ce film${infoGenre}${infoAnnee}. Quel est son titre ?`;
        break;
      case 2:
        texteQuestion = `Pouvez-vous nommer ce film${infoGenre}${infoAnnee} avec "${noeudParent.name}" ?`;
        break;
    }
  }
  
  // Obtenir le coût d'indice selon le niveau actuel
  const coutIndice = window.niveauxDifficulte ? niveauxDifficulte.obtenirCoutIndice() : 5;
  const texteIndice = coutIndice === 0 ? 'Indice (gratuit)' : `Indice (-${coutIndice} pts)`;

  // Afficher la question dans une boîte de dialogue avec le coût d'indice dynamique
  let contenuHTML = `
    <div class="modal-question">
      <p>${texteQuestion}</p>
      <input id="swal-input" class="swal2-input" placeholder="Votre réponse...">
    </div>
  `;

  Swal.fire({
    title: 'Question',
    html: contenuHTML,
    showCancelButton: true,
    confirmButtonText: 'Vérifier',
    cancelButtonText: 'Annuler',
    showDenyButton: true,
    denyButtonText: texteIndice, // Utiliser le texte dynamique ici
    focusConfirm: false,
    preConfirm: () => {
      const valeurInput = document.getElementById('swal-input').value;
      if (!valeurInput.trim()) {
        Swal.showValidationMessage('Veuillez entrer une réponse');
        return false;
      }
      return valeurInput;
    },
    allowOutsideClick: false
  }).then((resultat) => {
    if (resultat.isConfirmed && resultat.value) {
      verifierReponse(resultat.value);
    } else if (resultat.isDenied) {
      montrerIndice();
    }
  });
  
  // Mettre le focus sur le champ de saisie
  setTimeout(() => {
    const champInput = document.getElementById('swal-input');
    if (champInput) champInput.focus();
  }, 300);
}

// VÉRIFICATION DES RÉPONSES
async function verifierReponse(reponse) {
  if (!etatJeu.noeudActif || !reponse) return;
  
  try {
    const idNoeud = etatJeu.noeudActif.id;
    const elementCorrect = etatJeu.aDecouvrir.find(item => item.id === idNoeud);
    
    if (!elementCorrect) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Cet élément n\'existe pas ou a déjà été découvert.'
      });
      return;
    }
    
    // Obtenir le nom correct selon le type (film ou acteur)
    const nomCorrect = etatJeu.type === 'film' ? 
      (elementCorrect.name || elementCorrect.title || '') : 
      (elementCorrect.title || elementCorrect.name || '');
    
    // Normaliser et comparer les réponses
    if (normaliserTexte(reponse) === normaliserTexte(nomCorrect) || 
        normaliserTexte(nomCorrect).includes(normaliserTexte(reponse)) || 
        normaliserTexte(reponse).includes(normaliserTexte(nomCorrect))) {
      
      // Réponse correcte!
      graphe.discoverNode(idNoeud);
      etatJeu.tousElementsDecouverts.add(idNoeud);
      etatJeu.elementsDecouverts.push(elementCorrect);
      etatJeu.aDecouvrir = etatJeu.aDecouvrir.filter(item => item.id !== idNoeud);
      
      // Calcul des bonus
      decouvertesConsecutives++;
      const bonusCombo = (decouvertesConsecutives > 1) ? (decouvertesConsecutives - 1) * BONUS_COMBO : 0;
      
      const maintenant = new Date();
      const tempsDecouvertePrecedente = etatJeu.tempsDerniereTrouvaille || etatJeu.tempsDebut;
      const tempsSinceLastFind = (maintenant - tempsDecouvertePrecedente) / 1000;
      const bonusVitesse = (tempsSinceLastFind < 10) ? Math.round(10 - tempsSinceLastFind) : 0;
      
      etatJeu.tempsDerniereTrouvaille = maintenant;
      
      // Ajouter les points
      const pointsBase = 10;
      etatJeu.score += pointsBase + bonusCombo + bonusVitesse;
      
      mettreAJourScore();
      
      // Récupérer une image pour cet élément
      const urlImage = await obtenirImageWikipedia(nomCorrect, etatJeu.noeudActif.type);
      
      // Préparer le message de bonus
      let messageBonus = '';
      if (bonusCombo > 0) messageBonus += `\nBonus combo: +${bonusCombo} points`;
      if (bonusVitesse > 0) messageBonus += `\nBonus rapidité: +${bonusVitesse} points`;
      
      // Si c'est un film, récupérer ses genres
      if (etatJeu.noeudActif.type === 'film') {
        try {
          const genres = await api.getGenresByFilmId(etatJeu.noeudActif.id);
          if (genres && genres.length > 0) {
            etatJeu.genresMemoises[etatJeu.noeudActif.id] = genres;
          }
        } catch (erreur) {
          console.log("Erreur lors de la récupération des genres du film découvert", erreur);
        }
      }
      
      // Préparer le nœud découvert pour l'expansion du graphe
      const noeudDecouvert = {
        id: idNoeud,
        type: etatJeu.noeudActif.type,
        name: nomCorrect
      };
      
      // Étendre le graphe à partir du nœud découvert
      await etendreGrapheDepuisNoeud(noeudDecouvert);
      
      // Préparer le message HTML
      let messageHTML = `<div>Bravo ! Vous avez trouvé : ${nomCorrect}</div>`;
      messageHTML += `<div>+${pointsBase} points${messageBonus.replace('\n', '<br>')}</div>`;
      
      if (urlImage) {
        messageHTML += `<div class="swal2-image-container"><img src="${urlImage}" class="swal2-image" style="max-height: 150px; margin-top: 10px;"></div>`;
      }
      
      // Afficher le message de succès
      Swal.fire({
        icon: 'success',
        title: 'Correct !',
        html: messageHTML,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
      // Réinitialiser le nœud actif et sauvegarder l'état
      etatJeu.noeudActif = null;
      storage.saveGameState(etatJeu);
      
      // Vérifier si tous les éléments ont été découverts
      if (etatJeu.aDecouvrir.length === 0) {
        const tempsEcoule = Math.floor((new Date() - etatJeu.tempsDebut) / 1000);
        const bonus = Math.max(100 - tempsEcoule, 0);
        etatJeu.score += bonus;
        
        mettreAJourScore();
        storage.saveGameState(etatJeu);
        
        // Afficher le message de victoire
        Swal.fire({
          icon: 'success',
          title: 'Félicitations !',
          text: `Vous avez trouvé tous les ${etatJeu.type === 'film' ? 'acteurs' : 'films'} ! Bonus de temps: +${bonus} points`,
          confirmButtonText: 'Nouvelle partie',
          showCancelButton: true,
          cancelButtonText: 'Fermer'
        }).then((resultat) => {
          if (resultat.isConfirmed) {
            commencerNouvellePartie();
          }
        });
      }
    } else {
      // Réponse incorrecte
      decouvertesConsecutives = 0;
      const typeElement = etatJeu.noeudActif.type;
      
      Swal.fire({
        icon: 'error',
        title: 'Incorrect',
        text: `Ce n'est pas le bon ${typeElement}. Essayez encore.`,
        confirmButtonText: 'Réessayer',
        showCancelButton: true,
        cancelButtonText: 'Annuler'
      }).then((resultat) => {
        if (resultat.isConfirmed) {
          gererClicNoeud(etatJeu.noeudActif);
        }
      });
    }
  } catch (erreur) {
    console.error('Erreur lors de la vérification de la réponse:', erreur);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Une erreur est survenue lors de la vérification'
    });
  }
}

// FONCTIONS AUXILIAIRES

function reinitialiserEtatJeu() {
  etatJeu = {
    elementCourant: null,
    type: null,
    elementsDecouverts: [],
    aDecouvrir: [],
    tousElementsDecouverts: new Set(),
    noeudActif: null,
    score: 0,
    tempsDebut: null,
    profondeursExtension: 0,
    genresMemoises: {}
  };
  
  decouvertesConsecutives = 0;
  mettreAJourScore();
}

function mettreAJourScore() {
  document.getElementById('score').textContent = `Score: ${etatJeu.score}`;
}

function normaliserTexte(texte) {
  if (!texte) return '';
  return texte.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function obtenirIndice(element) {
  if (!element) return "Désolé, indice non disponible.";
  
  const noeudParent = element.parentNode ? 
    graphe.nodes.find(n => n.id === element.parentNode) : null;
  
  const infoParent = noeudParent ? 
    (noeudParent.type === 'film' ? 
      `lié au film "${noeudParent.name || noeudParent.title}"` : 
      `lié à l'acteur "${noeudParent.name}"`) : '';
  
  if (element.type === 'acteur') {
    if (element.name) {
      return `Indice: Cet acteur ${infoParent} a un nom qui commence par "${element.name.charAt(0)}${element.name.charAt(1)}..."`;
    } else {
      return `Indice: C'est un acteur ${infoParent}.`;
    }
  } else if (element.type === 'film') {
    let indiceGenre = '';
    if (element.id) {
      try {
        const genres = etatJeu.genresMemoises?.[element.id];
        if (genres && genres.length > 0) {
          indiceGenre = ` de genre ${genres[0].genre}`;
        }
      } catch (e) {
        console.log("Erreur lors de la récupération du genre pour l'indice", e);
      }
    }
    
    if (element.title) {
      return `Indice: Ce film${indiceGenre} est sorti en ${element.year || '?'} et commence par "${element.title.charAt(0)}${element.title.charAt(1)}..." ${infoParent}`;
    } else if (element.name) {
      return `Indice: Ce film${indiceGenre} commence par "${element.name.charAt(0)}${element.name.charAt(1)}..."${element.year ? ' et est sorti en ' + element.year : ''} ${infoParent}`;
    } else {
      return `Indice: C'est un film${indiceGenre} sorti en ${element.year || '?'} ${infoParent}.`;
    }
  } else {
    return `Indice: La réponse commence par "${(element.name || element.title || '?').charAt(0)}${(element.name || element.title || '?').charAt(1)}..."`;
  }
}

function montrerIndice() {
  // Déboguer le niveau et le coût d'indice actuels
  console.log("DÉBOGAGE - Niveau actuel:", 
    window.niveauxDifficulte ? niveauxDifficulte.niveau : "non défini", 
    "Coût indice:", 
    window.niveauxDifficulte ? niveauxDifficulte.obtenirCoutIndice() : "non défini");

  if (!etatJeu.noeudActif) {
    Swal.fire({
      icon: 'warning',
      title: 'Aucun élément sélectionné',
      text: 'Cliquez d\'abord sur un nœud du graphe pour obtenir un indice.'
    });
    return;
  }
  
  // Remplacer la valeur codée en dur par un appel à la fonction du module niveauxDifficulte
  const penalite = window.niveauxDifficulte ? niveauxDifficulte.obtenirCoutIndice() : 5;
  
  if (etatJeu.score < penalite) {
    Swal.fire({
      icon: 'error',
      title: 'Points insuffisants',
      text: `Vous avez besoin d'au moins ${penalite} points pour utiliser un indice.`
    });
    return;
  }
  
  const idNoeud = etatJeu.noeudActif.id;
  const element = etatJeu.aDecouvrir.find(item => item.id === idNoeud);
  
  if (!element) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Cet élément n\'existe pas ou a déjà été découvert.'
    });
    return;
  }
  
  // Soustraire les points de pénalité (utiliser la variable penalite)
  etatJeu.score -= penalite;
  etatJeu.score = Math.max(0, etatJeu.score);
  mettreAJourScore();
  storage.saveGameState(etatJeu);
  
  // Obtenir l'indice, potentiellement amélioré selon le niveau de difficulté
  const indiceBase = obtenirIndice(element);
  const indice = window.niveauxDifficulte ? 
    niveauxDifficulte.ameliorerIndice(indiceBase, element.name || element.title || '') : 
    indiceBase;
  
  // Afficher l'indice avec le coût correspondant au niveau
  Swal.fire({
    icon: 'info',
    title: penalite === 0 ? 'Indice gratuit' : `Indice (-${penalite} points)`,
    text: indice,
    confirmButtonText: 'OK'
  }).then(() => {
    gererClicNoeud(etatJeu.noeudActif);
  });
}

// Fonction simplifiée pour récupérer une image depuis Wikipedia
async function obtenirImageWikipedia(terme, type) {
  if (!terme) return null;
  
  try {
    let termeRecherche = type === 'film' ? `${terme} film` : `${terme} actor`;
    
    // Essai avec l'API Wikipedia
    try {
      const reponse = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termeRecherche)}`);
      if (reponse.ok) {
        const donnees = await reponse.json();
        if (donnees.thumbnail && donnees.thumbnail.source) {
          return donnees.thumbnail.source;
        }
      }
    } catch (erreur) {
      console.log('Erreur API Wikipedia française, tentative avec API anglaise');
    }
    
    // Essai avec l'API anglaise
    const reponseEN = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termeRecherche)}`);
    if (reponseEN.ok) {
      const donneesEN = await reponseEN.json();
      if (donneesEN.thumbnail && donneesEN.thumbnail.source) {
        return donneesEN.thumbnail.source;
      }
    }
    
    return null;
  } catch (erreur) {
    console.error('Erreur lors de la récupération de l\'image:', erreur);
    return null;
  }
}

// EXPANSION DU GRAPHE
async function etendreGrapheDepuisNoeud(noeudDecouvert) {
  try {
    console.log("Expansion du graphe à partir du nœud:", noeudDecouvert);
    
    let nouveauxElements = [];
    
    // Récupérer les nouveaux éléments selon le type
    if (noeudDecouvert.type === 'film') {
      const acteurs = await api.getActeursByFilmId(noeudDecouvert.id);
      nouveauxElements = acteurs.filter(acteur => !etatJeu.tousElementsDecouverts.has(acteur.id));
    } else {
      const films = await api.getFilmsByActeurId(noeudDecouvert.id);
      nouveauxElements = films.filter(film => !etatJeu.tousElementsDecouverts.has(film.id));
    }
    
    // Limiter le nombre de nouveaux éléments à 3
    if (nouveauxElements.length > 3) {
      nouveauxElements = nouveauxElements.sort(() => 0.5 - Math.random()).slice(0, 3);
    }
    
    if (nouveauxElements.length > 0) {
      // Ajouter les éléments au jeu
      etatJeu.aDecouvrir = [...etatJeu.aDecouvrir, ...nouveauxElements];
      
      // Créer les nouveaux nœuds
      const nouveauxNoeuds = nouveauxElements.map(element => ({
        id: element.id,
        name: noeudDecouvert.type === 'film' ? (element.name || '') : (element.title || element.name || ''),
        title: noeudDecouvert.type === 'film' ? '' : (element.title || element.name || ''),
        type: noeudDecouvert.type === 'film' ? 'acteur' : 'film',
        discovered: false,
        year: noeudDecouvert.type === 'acteur' ? element.year : null,
        parentNode: noeudDecouvert.id
      }));
      
      // Ajouter les références parentNode aux éléments à découvrir
      etatJeu.aDecouvrir = etatJeu.aDecouvrir.map(element => {
        const noeudCorrespondant = nouveauxNoeuds.find(n => n.id === element.id);
        return noeudCorrespondant ? {...element, parentNode: noeudCorrespondant.parentNode} : element;
      });
      
      // Ajouter les nœuds au graphe
      for (const noeud of nouveauxNoeuds) {
        graphe.addNode(noeud, []);
      }
      
      // Ajouter les liens
      for (const noeud of nouveauxNoeuds) {
        graphe.addLink({source: noeudDecouvert.id, target: noeud.id});
      }
      
      // Mettre à jour la profondeur d'expansion
      etatJeu.profondeursExtension++;
      
      // Mettre à jour le graphe
      setTimeout(() => {
        graphe.updateGraph();
      }, 100);
      
      return nouveauxElements.length;
    }
    
    return 0;
  } catch (erreur) {
    console.error("Erreur lors de l'expansion du graphe:", erreur);
    return 0;
  }
}

// GESTION DES SCORES
async function demanderSauvegardeScore() {
  if (!etatJeu.tempsDebut) {
    Swal.fire({
      icon: 'warning',
      title: 'Aucune partie en cours',
      text: 'Vous devez commencer une partie avant de sauvegarder votre score.'
    });
    return;
  }
  
  const dureePartie = Math.floor((new Date() - etatJeu.tempsDebut) / 1000);
  
  const { value: nomJoueur } = await Swal.fire({
    title: 'Enregistrer votre score',
    input: 'text',
    inputLabel: 'Entrez votre nom',
    inputPlaceholder: 'Nom du joueur',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return 'Vous devez entrer un nom!';
    }
  });
  
  if (!nomJoueur) return;
  
  try {
    const alerteChargement = Swal.fire({
      title: 'Enregistrement...',
      text: 'Sauvegarde de votre score',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const resultat = await api.saveScore(
      nomJoueur, 
      etatJeu.score, 
      dureePartie, 
      etatJeu.elementsDecouverts.length
    );
    
    alerteChargement.close();
    
    if (resultat.data.updated) {
      Swal.fire({
        icon: 'success',
        title: 'Score enregistré!',
        text: `Votre score de ${etatJeu.score} points a été sauvegardé.`,
        confirmButtonText: 'Nouvelle partie',
        showCancelButton: true,
        cancelButtonText: 'Continuer'
      }).then((result) => {
        if (result.isConfirmed) {
          commencerNouvellePartie();
        }
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Score non sauvegardé',
        text: `Votre meilleur score de ${resultat.data.previousScore} points est supérieur à votre score actuel de ${resultat.data.newScore} points.`,
        confirmButtonText: 'OK'
      });
    }
  } catch (erreur) {
    console.error('Erreur lors de la sauvegarde du score:', erreur);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Impossible d\'enregistrer votre score. Veuillez réessayer.'
    });
  }
}

// Fonction pour formater la durée
function formaterDuree(secondes) {
  const minutes = Math.floor(secondes / 60);
  const secondesRestantes = secondes % 60;
  return `${minutes}m ${secondesRestantes}s`;
}