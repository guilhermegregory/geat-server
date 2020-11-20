exports.up = (knex) => {
  return knex.schema.createTable('processors', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable().unique();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('processors');
};
