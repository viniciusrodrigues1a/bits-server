exports.up = function (knex) {
  return knex.schema.createTable('budget', table => {
    table.increments('id').primary();
    table.string('name');
    table.string('description');
    table
      .integer('wallet_id')
      .references('id')
      .inTable('wallet')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('amount_paid');
    table.integer('amount_total');
  });
};
exports.down = function (knex) {
  return knex.schema.dropTable('budget');
};
