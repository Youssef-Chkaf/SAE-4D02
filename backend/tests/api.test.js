const request = require('supertest');
const app = require('../server');

describe('API Films et Acteurs', () => {
  // Test de la route d'accueil
  test('GET / - devrait retourner un message de bienvenue', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Bienvenue');
  });

  // Test de la route pour récupérer tous les films
  test('GET /api/films - devrait retourner la liste des films', async () => {
    const response = await request(app).get('/api/films');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Test de la route pour récupérer tous les acteurs
  test('GET /api/acteurs - devrait retourner la liste des acteurs', async () => {
    const response = await request(app).get('/api/acteurs');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Test de la route pour récupérer un film aléatoire
  test('GET /api/films/random - devrait retourner un film aléatoire', async () => {
    const response = await request(app).get('/api/films/random');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('title');
  });

  // Test de la route pour récupérer un acteur aléatoire
  test('GET /api/acteurs/random - devrait retourner un acteur aléatoire', async () => {
    const response = await request(app).get('/api/acteurs/random');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name');
  });
});