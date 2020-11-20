const passport = require('passport');
const passportJwt = require('passport-jwt');

const secret = process.env.SERVER_SECRET_KEY;

const { Strategy, ExtractJwt } = passportJwt;

module.exports = (app) => {
  const params = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  const strategy = new Strategy(params, (payload, done) => {
    app.services.user.find({ id: payload.id })
      .then((user) => {
        if (user[0]) done(null, { ...payload });
        else done(null, false);
      })
      .catch((err) => next(err));
  });

  passport.use(strategy);

  return { authenticate: () => passport.authenticate('jwt', { session: false }) };
};
