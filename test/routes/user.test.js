const request = require('supertest');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMDAwIiwibmFtZSI6IlVzZXIgIzEiLCJlbWFpbCI6InVzZXIxQGVtYWlsLmNvbSJ9.f_B0kS836FSZTjdaJhGTqp5WqJ-bLYxH9AyUWdm45ZA';

beforeAll(async () => {
  await app.db.seed.run();
});

test('Deve listar todos os usuários', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
    });
});

test('Deve buscar um usuário específico por ID', () => {
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(10000);
    });
});

describe('Ao salvar um usuário com sucesso', () => {
  let userBodyResponse;

  test('Deve retornar o status 201', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'User Save', email: 'userSave@email.com', password: '123456' })
      .then((res) => {
        expect(res.status).toBe(201);
        userBodyResponse = res.body;
      });
  });

  test('Deve retornar o id, name, e email do usuário', () => {
    expect(userBodyResponse).toHaveProperty('id');
    expect(userBodyResponse).toHaveProperty('name');
    expect(userBodyResponse.name).toBe('User Save');
    expect(userBodyResponse).toHaveProperty('email');
    expect(userBodyResponse.email).toBe('userSave@email.com');
  });

  test('Não deve retornar a senha do usuário', () => {
    expect(userBodyResponse).not.toHaveProperty('password');
  });

  test('Deve armazenar senha criptograda', async () => {
    const userDb = await app.services.user.find({ id: userBodyResponse.id });
    expect(userDb[0].password).not.toBe('123456');
  });
});

describe('Ao tentar salvar um usuário inválido', () => {
  const validUser = { name: 'User Invalid', email: 'userInvalid@email.com', password: '123456' };

  const userTestTemplate = (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validUser, ...newData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve inserir sem nome', () => userTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve inserir sem email', () => userTestTemplate({ email: null }, 'E-mail é um atributo obrigatório'));
  test('Não deve inserir sem senha', () => userTestTemplate({ password: null }, 'Senha é um atributo obrigatório'));
  test('Não deve inserir com email existente', () => userTestTemplate({ email: 'user1@email.com' }, 'Já existe um usuário com esse e-mail'));
});

describe('Ao alterar um usuário com sucesso', () => {
  let userBodyResponse;

  test('Deve permitir alteração de nome', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'User #1 Updated' })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('User #1 Updated');
        userBodyResponse = res.body;
      });
  });

  test('Deve permitir alteração de senha', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ password: '654321' })
      .then((res) => {
        expect(res.status).toBe(200);
      });
  });

  test('Deve armazenar senha criptografada', () => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ password: '654321' })
      .then(async (res) => {
        expect(res.status).toBe(200);

        const userDb = await app.services.user.find({ id: 10000 });
        expect(userDb[0].password).not.toBe('654321');
      });
  });

  test('Deve retornar o id, name e email do usuário', () => {
    expect(userBodyResponse).toHaveProperty('id');
    expect(userBodyResponse).toHaveProperty('name');
    expect(userBodyResponse.name).toBe('User #1 Updated');
    expect(userBodyResponse).toHaveProperty('email');
    expect(userBodyResponse.email).toBe('user1@email.com');
  });

  test('Não deve retornar a senha do usuário', () => {
    expect(userBodyResponse).not.toHaveProperty('password');
  });
});

describe('Ao tentar alterar um usuário inválido', () => {
  const userTestTemplate = (updatedData, errorMessage) => {
    return request(app).put(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...updatedData })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      });
  };

  test('Não deve permitir alteração de id', () => userTestTemplate({ id: 10002 }, 'Não é permitido alteração de ID'));
  test('Não deve permitir alteração de email', () => userTestTemplate({ email: 'userUpdatedInvalid@email.com' }, 'Não é permitido alteração de E-mail'));
  test('Não deve permitir alteração de nome para nulo', () => userTestTemplate({ name: null }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de nome para vazio', () => userTestTemplate({ name: '' }, 'Nome é um atributo obrigatório'));
  test('Não deve permitir alteração de senha para nulo', () => userTestTemplate({ password: null }, 'Senha é um atributo obrigatório'));
  test('Não deve permitir alteração de senha para vazio', () => userTestTemplate({ password: '' }, 'Senha é um atributo obrigatório'));

  test('Não deve alterar usuário inexistente', () => {
    return request(app).put(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ name: 'User Updated Invalid' })
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível alterar usuário inexistente');
      });
  });
});

describe('Ao remover um usuário com sucesso', () => {
  test('Deve retornar o status 204', () => {
    return request(app).delete(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });

  test('O usuário deve ter sido removido do banco', () => {
    return app.db('users').where({ id: 10001 }).select()
      .then((users) => {
        expect(users).toHaveLength(0);
      });
  });
});

describe('Ao tentar remover um usuário inválido', () => {
  test('Não deve remover o mesmo usuário que está autenticado', () => {
    return request(app).delete(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Você não pode excluir você mesmo!');
      });
  });

  test('Não deve remover usuário que já possua movimentação', () => {
    return request(app).delete(`${MAIN_ROUTE}/11200`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Existem movimentações para esse usuário');
      });
  });

  test('Não deve remover usuário inexistente', () => {
    return request(app).delete(`${MAIN_ROUTE}/10002`)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Não é possível remover um usuário inexistente');
      });
  });
});
