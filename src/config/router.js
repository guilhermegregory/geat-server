const express = require('express');

module.exports = (app) => {
  app.use('/auth', app.routes.auths);

  const protectedRouter = express.Router();

  protectedRouter.use('/users', app.routes.users);
  protectedRouter.use('/sectors', app.routes.sectors);
  protectedRouter.use('/collaborators', app.routes.collaborators);
  protectedRouter.use('/types', app.routes.types);
  protectedRouter.use('/brands', app.routes.brands);
  protectedRouter.use('/models', app.routes.models);
  protectedRouter.use('/processors', app.routes.processors);
  protectedRouter.use('/memorytypes', app.routes.memoryTypes);
  protectedRouter.use('/operationalsystems', app.routes.operationalSystems);
  protectedRouter.use('/offices', app.routes.offices);
  protectedRouter.use('/hardwares', app.routes.hardwares);
  protectedRouter.use('/moves', app.routes.moves);

  app.use('/v1', app.config.passport.authenticate(), protectedRouter);
  app.use('/v2', protectedRouter);
};
