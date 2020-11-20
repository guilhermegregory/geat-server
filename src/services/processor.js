const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('processors').select();
  };

  const find = (filter = {}) => {
    return app.db('processors').where(filter).select();
  };

  const save = async (processor) => {
    if (!processor.name) throw new ValidationError('Nome é um atributo obrigatório');
    const processorsDb = await find({ name: processor.name });
    if (processorsDb.length > 0) throw new ValidationError('Já existe um processador com esse nome');

    return app.db('processors').insert(processor, '*');
  };

  const update = async (id, processor) => {
    if (processor.id) throw new ValidationError('Não é permitido alteração de ID');
    if (processor.name === null || processor.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    const processorsDb = await find({ name: processor.name });
    if (processorsDb.length > 0) throw new ValidationError('Já existe um processador com esse nome');
    const processorsDb2 = await find({ id });
    if (processorsDb2.length === 0) throw new ValidationError('Não é possível alterar processador inexistente');

    return app.db('processors').where({ id }).update(processor, '*');
  };

  const remove = async (id) => {
    const processorsDb = await find({ id });
    if (processorsDb.length === 0) throw new ValidationError('Não é possível remover um processador inexistente');
    const hardwaresDb = await app.services.hardware.find({ processor_id: id });
    if (hardwaresDb.length > 0) throw new ValidationError('Existem hardwares para esse processador');

    return app.db('processors').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
