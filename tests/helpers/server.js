const supertest = require('supertest');
const App = require('../../src/server');
const connection = require('../../src/database/connection');

const app = App(connection);
const api = supertest(app);

module.exports = api;
