const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/collaborators';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAzMDAsIm5hbWUiOiJVc2VyICM1IiwiZW1haWwiOiJ1c2VyNUBlbWFpbC5jb20ifQ.EONXx2Rwt9ErHQMZLMDruqK9lsKTBT83P9n07d6Qszc';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os colaboradores', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve buscar um colaborador específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um colaborador com sucesso', () => {
  let collaboratorBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Collaborator Save', email: 'collaboratorSave@email.com', sector_id: 10100 })
      .then((res) => {
        expect(res.status).toBe(201);
        collaboratorBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, name, email e sector_id do colaborador', () => {
    expect(collaboratorBodyResponse).toHaveProperty('id');
    expect(collaboratorBodyResponse).toHaveProperty('name');
    expect(collaboratorBodyResponse.name).toBe('Collaborator Save');
    expect(collaboratorBodyResponse).toHaveProperty('email');
    expect(collaboratorBodyResponse.email).toBe('collaboratorSave@email.com');
    expect(collaboratorBodyResponse).toHaveProperty('sector_id');
    expect(collaboratorBodyResponse.sector_id).toBe(10100);
  });
});

describe('Ao tentar salvar um colaborador inválido', () => {
  const validCollaborator = { name: 'Collaborator Invalid', email: 'collaboratorInvalid@email.com', sector_id: 10100 };

  const collaboratorTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validCollaborator, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => collaboratorTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir sem email', () => collaboratorTestTemplate({ email: null }, 'E-mail é um atributo obrigatório'));
  test('Não deve inserir sem setor', () => collaboratorTestTemplate({ sector_id: null }, 'Setor é um atributo obrigatório'));
  test('Não deve inserir com email existente', () => collaboratorTestTemplate({ email: 'collaborator1@email.com' }, 'Já existe um colaborador com esse e-mail'));
  test('Não deve inserir com setor inexistente', () => collaboratorTestTemplate({ sector_id: 10102 }, 'Este setor nao está cadastrado'));
});

describe('Ao alterar um colaborador com sucesso', () => {
  let collaboratorBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Collaborator Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  test('Deve permitir alteração de setor', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ sector_id: 10101 })
      .then((res) => {
        expect(res.status).toBe(200);
        collaboratorBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, name, email e sector_id do colaborador', () => {
    expect(collaboratorBodyResponse).toHaveProperty('id');
    expect(collaboratorBodyResponse).toHaveProperty('name');
    expect(collaboratorBodyResponse.name).toBe('Collaborator Updated');
    expect(collaboratorBodyResponse).toHaveProperty('email');
    expect(collaboratorBodyResponse.email).toBe('collaborator1@email.com');
    expect(collaboratorBodyResponse).toHaveProperty('sector_id');
    expect(collaboratorBodyResponse.sector_id).toBe(10101);
  });
});

describe('Ao tentar alterar um colaborador inválido', () => {
  const collaboratorTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de id', () => collaboratorTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de email', () => collaboratorTestTemplate({ email: 'userUpdatedInvalid@email.com' }, 'Não é permitido alteração de E-mail'));
  test('Não deve permitir alteração de nome para nulo', () => collaboratorTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => collaboratorTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de setor para nulo', () => collaboratorTestTemplate({ sector_id: null }, 'Setor é um atributo obrigatório'));
  test('Não deve permitir alteração de setor para vazio', () => collaboratorTestTemplate({ sector_id: '' }, 'Setor é um atributo obrigatório'));
  test('Não deve permitir alteração de setor para setor inexistente', () => collaboratorTestTemplate({ sector_id: 10102 }, 'Este setor nao está cadastrado'));

  test('Não deve alterar colaborador inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'Collaborator Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar colaborador inexistente');
      });
  });
});

describe('Ao remover um colaborador com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O colaborador deve ter sido removido do banco', () => {
    return app.db('collaborators').where({ id: 10001 }).select()
      .then((collaborators) => {
        expect(collaborators).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um colaborador inválido', () => {
  test('Não deve remover colaborador que já possua movimentação', () => {
    return request(app).delete(`${MAIN_ROUTE}/10100`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem movimentações para esse colaborador');
      });
  });

  test('Não deve remover colaborador inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um colaborador inexistente');
      });
  });
});
