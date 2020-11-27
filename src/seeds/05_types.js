exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10400, name: 'User #6', avatar: 'Avatar #6', email: 'user6@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('types').insert([
      { id: 10000, name: 'Type #1' },
      { id: 10001, name: 'Type #2' },
    ]));
};
