const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('operationalsystems').select();
  };

  const find = (filter = {}) => {
    return app.db('operationalsystems').where(filter).select();
  };

  const save = async (operationalSystem) => {
    if (!operationalSystem.name) throw new ValidationError('Nome é um atributo obrigatório');
    const operationalSystemsDb = await find({ name: operationalSystem.name });
    if (operationalSystemsDb.length > 0) throw new ValidationError('Já existe um sistema operacional com esse nome');

    return app.db('operationalsystems').insert(operationalSystem, '*');
  };

  const update = async (id, operationalSystem) => {
    if (operationalSystem.id) throw new ValidationError('Não é permitido alteração de ID');
    if (operationalSystem.name === null || operationalSystem.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    const operationalSystemsDb = await find({ name: operationalSystem.name });
    if (operationalSystemsDb.length > 0) throw new ValidationError('Já existe um sistema operacional com esse nome');
    const operationalSystemsDb2 = await find({ id });
    if (operationalSystemsDb2.length === 0) throw new ValidationError('Não é possível alterar sistema operacional inexistente');

    return app.db('operationalsystems').where({ id }).update(operationalSystem, '*');
  };

  const remove = async (id) => {
    const operationalSystemsDb = await find({ id });
    if (operationalSystemsDb.length === 0) throw new ValidationError('Não é possível remover um sistema operacional inexistente');
    const hardwaresDb = await app.services.hardware.find({ operational_system_id: id });
    if (hardwaresDb.length > 0) throw new ValidationError('Existem hardwares para esse sistema operacional');

    return app.db('operationalsystems').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
