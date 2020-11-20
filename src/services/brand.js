const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
  const findAll = () => {
    return app.db('brands').select();
  };

  const find = (filter = {}) => {
    return app.db('brands').where(filter).select();
  };

  const save = async (brand) => {
    if (!brand.name) throw new ValidationError('Nome é um atributo obrigatório');
    const brandsDb = await find({ name: brand.name });
    if (brandsDb.length > 0) throw new ValidationError('Já existe uma marca com esse nome');

    return app.db('brands').insert(brand, '*');
  };

  const update = async (id, brand) => {
    if (brand.id) throw new ValidationError('Não é permitido alteração de ID');
    if (brand.name === null || brand.name === '') throw new ValidationError('Nome é um atributo obrigatório');
    const brandsDb = await find({ name: brand.name });
    if (brandsDb.length > 0) throw new ValidationError('Já existe uma marca com esse nome');
    const brandsDb2 = await find({ id });
    if (brandsDb2.length === 0) throw new ValidationError('Não é possível alterar marca inexistente');

    return app.db('brands').where({ id }).update(brand, '*');
  };

  const remove = async (id) => {
    const brandsDb = await find({ id });
    if (brandsDb.length === 0) throw new ValidationError('Não é possível remover uma marca inexistente');
    const modelsDb = await app.services.model.find({ brand_id: id });
    if (modelsDb.length > 0) throw new ValidationError('Existem modelos para essa marca');

    return app.db('brands').where({ id }).del();
  };

  return { findAll, find, save, update, remove };
};
