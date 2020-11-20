exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10800, name: 'User #10', email: 'user10@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('memorytypes').insert([
      { id: 10000, name: 'Memory Type #1' },
      { id: 10001, name: 'Memory Type #2' },
    ]));
};
