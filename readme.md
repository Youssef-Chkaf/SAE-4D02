# CinéExplore
Ce projet est une application web permettant de découvrir des films et acteurs à travers un jeu interactif utilisant une représentation en graphe.

# Prérequis
Node.js
MySQL ou MariaDB
NPM

# Installation

Clonez ce dépôt sur votre machine locale :
git clone [URL_DU_REPOSITORY]
cd SAE

Installez les dépendances :
npm install

# Important
La base de données "sae" doit déjà exister dans votre système MySQL/MariaDB.

# Lancement de l'application
Démarrez le serveur backend :
npm start

ou en mode développement : 
npm run dev

Accédez à l'application frontend :
Ouvrez le fichier index.html dans votre navigateur
Ou utilisez un serveur local comme Live Server dans VS Code pour le dossier frontend

# Structure du projet
SAE/
├── backend/         # Code serveur
│   ├── routes/      # Routes de l'API
│   └── sgbd/        # Configuration et modèles de la base de données
├── frontend/        # Interface utilisateur
│   ├── assets/      # Ressources (CSS, JS, images)
│   ├── index.html   # Page principale
│   └── classement.html # Page de classement
├── docs/            # Documentation (Swagger)
├── .env             # Variables d'environnement (déjà configuré)
└── index.js         # Point d'entrée du serveur

# Fonctionnalités principales
Exploration interactive d'un graphe de films et d'acteurs
Différents niveaux de difficulté
Système de score et classement
Sauvegarde de la progression
Mode thématique par genre de film
Mode chronomètre

# Technologies utilisées
Backend: Node.js, Express, Sequelize
Frontend: HTML5, CSS3, JavaScript, D3.js (pour les graphes)
Base de données: MySQL/MariaDB

# Auteur
Chkaf Youssef

