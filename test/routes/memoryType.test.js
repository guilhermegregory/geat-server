const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/memorytypes';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA4MDAsIm5hbWUiOiJVc2VyICMxMCIsImVtYWlsIjoidXNlcjEwQGVtYWlsLmNvbSJ9.0ZJbJHUU1cd1xMRyEktgcU_FQkR1OCQlcjRo7SdhHjw';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os tipos de memória', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar um tipo de memória específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um tipo de memória com sucesso', () => {
  let memoryTypeBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Memory Type Save' })
      .then((res) => {
        expect(res.status).toBe(201);
        memoryTypeBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do tipo de memória', () => {
    expect(memoryTypeBodyResponse).toHaveProperty('id');
    expect(memoryTypeBodyResponse).toHaveProperty('name');
    expect(memoryTypeBodyResponse.name).toBe('Memory Type Save');
  });
});

describe('Ao tentar salvar um tipo de memória inválido', () => {
  const validMemoryType = { name: 'memoryType Invalid' };

  const memoryTypeTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validMemoryType, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => memoryTypeTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir com nome existente', () => memoryTypeTestTemplate({ name: 'Memory Type #1' }, 'Já existe um tipo de memória com esse nome'));
});

describe('Ao alterar um tipo de memória com sucesso', () => {
  let memoryTypeBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Memory Type #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        memoryTypeBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do tipo de memória', () => {
    expect(memoryTypeBodyResponse).toHaveProperty('id');
    expect(memoryTypeBodyResponse).toHaveProperty('name');
    expect(memoryTypeBodyResponse.name).toBe('Memory Type #1 Updated');
  });
});

describe('Ao tentar alterar um tipo de memória inválido', () => {
  const memoryTypeTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de ID', () => memoryTypeTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => memoryTypeTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => memoryTypeTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para nome existente', () => memoryTypeTestTemplate({ name: 'Memory Type #1 Updated' }, 'Já existe um tipo de memória com esse nome'));

  test('Não deve alterar tipo de memória inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Memory Type Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar tipo de memória inexistente');
      });
  });
});

describe('Ao remover um tipo de memória com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O tipo de memória deve ter sido removido do banco', () => {
    return app.db('memorytypes').where({ id: 10001 })
      .then((memoryTypes) => {
        expect(memoryTypes).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um tipo de memória inválido', () => {
  test('Não deve remover tipo de memória que já possua hardware', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem hardwares para esse tipo de memória');
      });
  });

  test('Não deve remover tipo de memória inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um tipo de memória inexistente');
      });
  });
});
