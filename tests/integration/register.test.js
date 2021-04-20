const { describe, it, expect } = require('@jest/globals');
const api = require('../helpers/server');

describe('Account creation endpoint', () => {
  it('should be able to create a new user', async () => {
    const res = await api.post('/signup').send({
      name: 'Wellington Júnior',
      email: 'wellington53@gmail.com',
      password: 'pa55word',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should NOT be able to create a new user if email is already in use', async () => {
    const response = await api.post('/signup').send({
      name: 'Rodrigo',
      email: 'user1@gmail.com',
      password: 'pa55word',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Email not available!');
  });

  it('should NOT be able to create a new user if required fields are missing', async () => {
    const response = await api.post('/signup').send({
      name: 'Éverton Reis',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to create a new user if password length is less than 8 chars long', async () => {
    const response = await api.post('/signup').send({
      name: 'Éverton Reis',
      password: 'less8',
      email: 'everton_reis@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });
});
