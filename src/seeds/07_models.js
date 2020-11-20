exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10600, name: 'User #8', email: 'user8@email.com', password: '$2a$10$ngFCjFgKsgwYo3zgpfScJexUBc6lF7AbnNdWz4WwnAKJ5AvVUy61y' },
  ])
    .then(() => knex('brands').insert([
      { id: 10100, name: 'Brand #3' },
      { id: 10101, name: 'Brand #4' },
    ]))
    .then(() => knex('models').insert([
      { id: 10000, name: 'Model #1', brand_id: 10100 },
      { id: 10001, name: 'Model #2', brand_id: 10100 },
    ]));
};
