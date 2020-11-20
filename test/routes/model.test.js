const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/models';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA2MDAsIm5hbWUiOiJVc2VyICM4IiwiZW1haWwiOiJ1c2VyOEBlbWFpbC5jb20ifQ.AvDawimG1_-K8A3cqKasRs8odcV1h4J7YlVs0wSLRG4';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os modelos', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve buscar um modelo específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um modelo com sucesso', () => {
  let modelBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Model Save', brand_id: 10100 })
      .then((res) => {
        expect(res.status).toBe(201);
        modelBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, name e brand_id do modelo', () => {
    expect(modelBodyResponse).toHaveProperty('id');
    expect(modelBodyResponse).toHaveProperty('name');
    expect(modelBodyResponse.name).toBe('Model Save');
    expect(modelBodyResponse).toHaveProperty('brand_id');
    expect(modelBodyResponse.brand_id).toBe(10100);
  });
});

describe('Ao tentar salvar um modelo inválido', () => {
  const validModel = { name: 'Model Invalid', brand_id: 10100 };

  const modelTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validModel, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => modelTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir sem marca', () => modelTestTemplate({ brand_id: null }, 'Marca é um atributo obrigatório'));
  test('Não deve inserir com par nome e marca existentes', () => modelTestTemplate({ name: 'Model #1', brand_id: 10100 }, 'Já existe um modelo para essa marca'));
  test('Não deve inserir com marca inexistente', () => modelTestTemplate({ brand_id: 10102 }, 'Esta marca nao está cadastrada'));
});

describe('Ao alterar um modelo com sucesso', () => {
  let modelBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Model #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  test('Deve permitir alteração de marca', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ brand_id: 10101 })
      .then((res) => {
        expect(res.status).toBe(200);
        modelBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, name, brand_id do modelo', () => {
    expect(modelBodyResponse).toHaveProperty('id');
    expect(modelBodyResponse).toHaveProperty('name');
    expect(modelBodyResponse.name).toBe('Model #1 Updated');
    expect(modelBodyResponse).toHaveProperty('brand_id');
    expect(modelBodyResponse.brand_id).toBe(10101);
  });
});

describe('Ao tentar alterar um modelo inválido', () => {
  const modelTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de id', () => modelTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => modelTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => modelTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de marca para nulo', () => modelTestTemplate({ brand_id: null }, 'Marca é um atributo obrigatório'));
  test('Não deve permitir alteração de marca para vazio', () => modelTestTemplate({ brand_id: '' }, 'Marca é um atributo obrigatório'));
  test('Não deve permitir alteração do par name e brand_id para existentes', () => modelTestTemplate({ name: 'Model #1 Updated', brand_id: 10101 }, 'Já existe um modelo para essa marca'));
  test('Não deve permitir alteração de marca para marca inexistente', () => modelTestTemplate({ brand_id: 10102 }, 'Esta marca nao está cadastrada'));

  test('Não deve alterar modelo inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Model Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar modelo inexistente');
      });
  });
});

describe('Ao remover um modelo com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O modelo deve ter sido removido do banco', () => {
    return app.db('models').where({ id: 10001 }).select()
      .then((models) => {
        expect(models).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um modelo inválido', () => {
  test('Não deve remover modelo que já possua hardware', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem hardwares para esse modelo');
      });
  });

  test('Não deve remover modelo inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um modelo inexistente');
      });
  });
});
