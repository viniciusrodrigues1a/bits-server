exports.up = function (knex) {
  return knex.schema.createTable('credit', table => {
    table.increments('id').primary();
    table
      .integer('wallet_id')
      .references('id')
      .inTable('wallet')
      .onDelete('CASCADE');

    table.integer('amount');
    table.string('dateNow');
    table.string('deadline');
    table.string('from');
    table.string('description');
    table.integer('type').defaultTo(1);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('credit');
};
