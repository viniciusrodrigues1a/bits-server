const knex = require('knex');
const knexfile = require('../../knexfile');

const configuration = knexfile[process.env.NODE_ENV] || knexfile.development;
const connection = knex(configuration);

module.exports = connection;
