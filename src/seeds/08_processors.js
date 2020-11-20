exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10700, name: 'User #9', email: 'user9@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('processors').insert([
      { id: 10000, name: 'Processor #1' },
      { id: 10001, name: 'Processor #2' },
    ]));
};
