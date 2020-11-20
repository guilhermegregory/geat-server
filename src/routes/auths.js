const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');

const ValidationError = require('../errors/ValidationError');

const secret = process.env.SERVER_SECRET_KEY;

module.exports = (app) => {
  const router = express.Router();

  router.post('/signup', (req, res, next) => {
    app.services.user.save(req.body)
      .then((result) => res.status(201).json(result[0]))
      .catch((err) => next(err));
  });

  router.post('/signin', (req, res, next) => {
    if (!req.body.email) throw new ValidationError('E-mail é um atributo obrigatório');
    if (!req.body.password) throw new ValidationError('Senha é um atributo obrigatório');
    app.services.user.find({ email: req.body.email })
      .then((user) => {
        if (!user[0]) throw new ValidationError('Usuário ou senha inválidos');
        if (bcrypt.compareSync(req.body.password, user[0].password)) {
          const payload = {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
          };
          const token = jwt.encode(payload, secret);
          res.status(200).json({ token });
        } else throw new ValidationError('Usuário ou senha inválidos');
      })
      .catch((err) => next(err));
  });

  return router;
};
