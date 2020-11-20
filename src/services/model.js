const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('models').select();
  };

  const find = (filter) => {
    return app.db('models').where(filter).select();
  };

  const save = async (model) => {
    if (!model.name) throw new ValidationError('Nome é um atributo obrigatório');
    if (!model.brand_id) throw new ValidationError('Marca é um atributo obrigatório');
    const modelsDb = await find({ name: model.name, brand_id: model.brand_id });
    if (modelsDb.length > 0) throw new ValidationError('Já existe um modelo para essa marca');
    const brandsDb = await app.services.brand.find({ id: model.brand_id });
    if (brandsDb.length === 0) throw new ValidationError('Esta marca nao está cadastrada');

    return app.db('models').insert(model, '*');
  };

  const update = async (id, model) => {
    if (model.id) throw new ValidationError('Não é permitido alteração de ID');
    if (model.name === null || model.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    if (model.brand_id === null || model.brand_id === '') throw new ValidationError('Marca é um atributo obrigatório');
    if (model.name && model.brand_id) {
      const modelsDb = await find({ name: model.name, brand_id: model.brand_id });
      if (modelsDb.length > 0) throw new ValidationError('Já existe um modelo para essa marca');
    }
    if (model.brand_id) {
      const brandsDb = await app.services.brand.find({ id: model.brand_id });
      if (brandsDb.length === 0) throw new ValidationError('Esta marca nao está cadastrada');
    }
    const modelsDb = await find({ id });
    if (modelsDb.length === 0) throw new ValidationError('Não é possível alterar modelo inexistente');

    return app.db('models').where({ id }).update(model, '*');
  };

  const remove = async (id) => {
    const modelsDb = await find({ id });
    if (modelsDb.length === 0) throw new ValidationError('Não é possível remover um modelo inexistente');
    const hardwaresDb = await app.services.hardware.find({ model_id: id });
    if (hardwaresDb.length > 0) throw new ValidationError('Existem hardwares para esse modelo');

    return app.db('models').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
