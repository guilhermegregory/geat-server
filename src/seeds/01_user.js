exports.seed = (knex) => {
  return knex('moves').del()
    .then(() => knex('hardwares').del())
    .then(() => knex('offices').del())
    .then(() => knex('operationalsystems').del())
    .then(() => knex('memorytypes').del())
    .then(() => knex('processors').del())
    .then(() => knex('models').del())
    .then(() => knex('brands').del())
    .then(() => knex('types').del())
    .then(() => knex('collaborators').del())
    .then(() => knex('sectors').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
      { id: 10000, name: 'User #1', avatar: 'Avatar #1', email: 'user1@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
      { id: 10001, name: 'User #2', avatar: 'Avatar #2', email: 'user2@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
    ]));
};
