const Sequelize = require("sequelize");
const myDB = require("./config.js");

// Modèle Film
const Film = myDB.define(
  "movie",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'movies',
  }
);

const Acteur = myDB.define(
  "actor",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'actors',
  }
);

// Modèle Genre
const Genre = myDB.define(
  "genre",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    genre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'genres',
  }
);

// Modèle Score 
const Score = myDB.define(
  "score",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    player_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    game_duration: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    items_discovered: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    date_created: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: false,
  }
);

// Relations entre les modèles
Film.belongsToMany(Acteur, { 
  through: "moviesactors",
  foreignKey: 'id_movie',
  otherKey: 'id_actor',
  timestamps: false
});

Acteur.belongsToMany(Film, { 
  through: "moviesactors",
  foreignKey: 'id_actor',
  otherKey: 'id_movie',
  timestamps: false
});

Film.belongsToMany(Genre, { 
  through: "moviesgenres",
  foreignKey: 'id_movie',
  otherKey: 'id_genre',
  timestamps: false
});

Genre.belongsToMany(Film, { 
  through: "moviesgenres",
  foreignKey: 'id_genre',
  otherKey: 'id_movie',
  timestamps: false
});

// Exportation des modèles
module.exports = {
  Film,
  Acteur,
  Genre,
  Score,
};