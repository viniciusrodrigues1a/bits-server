exports.up = function (knex) {
  return knex.schema.createTable('budget_categories', table => {
    table.increments('id').primary();
    table.integer('budget_id').references('id').inTable('budget');
    table.integer('category_id').references('id').inTable('category');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('budget_categories');
};
