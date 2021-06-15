const { addTriggersQuery, removeTriggersQuery } = require('../utils/triggers');

exports.up = function (knex) {
  return knex.schema.raw(addTriggersQuery);
};

exports.down = function (knex) {
  return knex.schema.raw(removeTriggersQuery);
};
