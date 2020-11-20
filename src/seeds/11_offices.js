exports.seed = (knex) => {
  return knex('users').insert([
    { id: 11000, name: 'User #12', email: 'user12@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('offices').insert([
      { id: 10000, name: 'Office #1' },
      { id: 10001, name: 'Office #2' },
    ]));
};
