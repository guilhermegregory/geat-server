const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/processors';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA3MDAsIm5hbWUiOiJVc2VyICM5IiwiZW1haWwiOiJ1c2VyOUBlbWFpbC5jb20ifQ.PLoGfdKk4vlznBjjFBK4JDea1MEuwiEEAotC4Jkvh9Q';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os processadores', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar um processador específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um processador com sucesso', () => {
  let processorBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Processor Save' })
      .then((res) => {
        expect(res.status).toBe(201);
        processorBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do processador', () => {
    expect(processorBodyResponse).toHaveProperty('id');
    expect(processorBodyResponse).toHaveProperty('name');
    expect(processorBodyResponse.name).toBe('Processor Save');
  });
});

describe('Ao tentar salvar um processador inválido', () => {
  const validProcessor = { name: 'Processor Invalid' };

  const processorTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validProcessor, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => processorTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir com nome existente', () => processorTestTemplate({ name: 'Processor #1' }, 'Já existe um processador com esse nome'));
});

describe('Ao alterar um processador com sucesso', () => {
  let processorBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Processor #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        processorBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name do processador', () => {
    expect(processorBodyResponse).toHaveProperty('id');
    expect(processorBodyResponse).toHaveProperty('name');
    expect(processorBodyResponse.name).toBe('Processor #1 Updated');
  });
});

describe('Ao tentar alterar um processador inválido', () => {
  const processorTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de ID', () => processorTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => processorTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => processorTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para nome existente', () => processorTestTemplate({ name: 'Processor #1 Updated' }, 'Já existe um processador com esse nome'));

  test('Não deve alterar processador inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Processor Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar processador inexistente');
      });
  });
});

describe('Ao remover um processador com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O processador deve ter sido removido do banco', () => {
    return app.db('processors').where({ id: 10001 })
      .then((processors) => {
        expect(processors).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um processador inválido', () => {
  test('Não deve remover processador que já possua hardware', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem hardwares para esse processador');
      });
  });

  test('Não deve remover processador inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um processador inexistente');
      });
  });
});
