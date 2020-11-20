const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/brands';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA1MDAsIm5hbWUiOiJVc2VyICM3IiwiZW1haWwiOiJ1c2VyN0BlbWFpbC5jb20ifQ.R3OJtohhkWFZLcKZc5PwE04PBzRG_LXfR4Okba6N-U8';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos as marcas', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve listar uma marca específica por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar uma marca com sucesso', () => {
  let brandBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Brand Save' })
      .then((res) => {
        expect(res.status).toBe(201);
        brandBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name da marca', () => {
    expect(brandBodyResponse).toHaveProperty('id');
    expect(brandBodyResponse).toHaveProperty('name');
    expect(brandBodyResponse.name).toBe('Brand Save');
  });
});

describe('Ao tentar salvar uma marca inválida', () => {
  const validBrand = { name: 'Brand Invalid' };

  const brandTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validBrand, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => brandTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir com nome existente', () => brandTestTemplate({ name: 'Brand #1' }, 'Já existe uma marca com esse nome'));
});

describe('Ao alterar uma marca com sucesso', () => {
  let brandBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Brand #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        brandBodyResponse = res.body;
      });
  });

  test('Deve retornar o id e name da marca', () => {
    expect(brandBodyResponse).toHaveProperty('id');
    expect(brandBodyResponse).toHaveProperty('name');
    expect(brandBodyResponse.name).toBe('Brand #1 Updated');
  });
});

describe('Ao tentar alterar uma marca inválida', () => {
  const brandTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de ID', () => brandTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de nome para nulo', () => brandTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => brandTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para nome existente', () => brandTestTemplate({ name: 'Brand #1 Updated' }, 'Já existe uma marca com esse nome'));

  test('Não deve alterar marca inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Brand Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar marca inexistente');
      });
  });
});

describe('Ao remover uma marca com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('A marca deve ter sido removida do banco', () => {
    return app.db('brands').where({ id: 10001 })
      .then((brands) => {
        expect(brands).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover uma marca inválida', () => {
  test('Não deve remover marca que já possua modelo', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem modelos para essa marca');
      });
  });

  test('Não deve remover marca inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover uma marca inexistente');
      });
  });
});
