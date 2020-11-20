exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10200, name: 'User #4', email: 'user4@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('sectors').insert([
      { id: 10000, name: 'Sector #1' },
      { id: 10001, name: 'Sector #2' },
    ]));
};
