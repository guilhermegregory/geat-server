exports.up = (knex) => {
  return knex.schema.table('users', (t) => {
    t.string('avatar');
  });
};

exports.down = (knex) => {
  return knex.schema.table('users', () => {
    t.dropColumn('avatar');
  });
};
