const { addProcedures, removeProcedures } = require('../utils/procedures');

exports.up = function (knex) {
  return knex.schema.raw(addProcedures);
};

exports.down = function (knex) {
  return knex.schema.raw(removeProcedures);
};
