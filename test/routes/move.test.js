const request = require('supertest');
const { DateTime } = require('luxon');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/moves';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEyMDAsIm5hbWUiOiJVc2VyICMxNCIsImVtYWlsIjoidXNlcjE0QGpyY29udGFiaWx0ci5jb20uYnIifQ.qYw-9mUCNOHzE2z6J8HPXGbtpz7ablHeQIJ17ce1hks';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todas as movimentações', () => {
  return request(app).get(`${MAIN_ROUTE}`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar uma movimentação específica por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0].id).toBe(10000);
    });
});

test('Deve listar movimentações de um hardware específico', () => {
  return request(app).get(`${MAIN_ROUTE}?hardware_id=10100`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
});

test('Deve listar movimentações de um colaborador específico', () => {
  return request(app).get(`${MAIN_ROUTE}?collaborator_id=10100`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
});

describe('Ao salvar uma movimentação com sucesso', () => {
  let moveBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ hardware_id: 10100, collaborator_id: 10100, date: DateTime.local(), user_id: 11200, deadline: DateTime.local().plus({ days: 2 }) })
      .then((res) => {
        expect(res.status).toBe(201);
        moveBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, hardware_id, collaborator_id, date e user_id da movimentação', () => {
    expect(moveBodyResponse).toHaveProperty('id');
    expect(moveBodyResponse).toHaveProperty('hardware_id');
    expect(moveBodyResponse.hardware_id).toBe(10100);
    expect(moveBodyResponse).toHaveProperty('collaborator_id');
    expect(moveBodyResponse.collaborator_id).toBe(10100);
    expect(moveBodyResponse).toHaveProperty('date');
    expect(moveBodyResponse).toHaveProperty('user_id');
    expect(moveBodyResponse.user_id).toBe(11200);
    expect(moveBodyResponse).toHaveProperty('deadline');
  });
});

describe('Ao tentar salvar uma movimentação inválida', () => {
  const validMove = { hardware_id: 10100, collaborator_id: 10100, date: DateTime.local(), user_id: 11200, deadline: DateTime.local().plus({ days: 2 }) };

  const modelTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validMove, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem hardware', () => modelTestTemplate({ hardware_id: null }, 'Hardware é um atributo obrigatório'));
  test('Não deve inserir sem colaborador', () => modelTestTemplate({ collaborator_id: null }, 'Colaborador é um atributo obrigatório'));
  test('Não deve inserir sem data', () => modelTestTemplate({ date: null }, 'Data é um atributo obrigatório'));
  test('Não deve inserir sem usuário', () => modelTestTemplate({ user_id: null }, 'Usuário é um atributo obrigatório'));
  test('Não deve inserir com hardware inexistente', () => modelTestTemplate({ hardware_id: 10102 }, 'Este hardware nao está cadastrado'));
  test('Não deve inserir com colaborador inexistente', () => modelTestTemplate({ collaborator_id: 10102 }, 'Este colaborador nao está cadastrado'));
  test('Não deve inserir com usuário inexistente', () => modelTestTemplate({ user_id: 11202 }, 'Este usuário nao está cadastrado'));
});

describe('Ao remover uma movimentação com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10101`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('A movimentação deve ter sido removida do banco', () => {
    return app.db('moves').where({ id: 10101 }).select()
      .then((moves) => {
        expect(moves).toHaveLength(0);
      });
  });
});
