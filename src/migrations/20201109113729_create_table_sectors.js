exports.up = (knex) => {
  return knex.schema.createTable('sectors', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable().unique();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('sectors');
};
