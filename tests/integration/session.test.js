const { describe, it, expect } = require('@jest/globals');
const api = require('../helpers/server');

describe('Account creation endpoint', () => {
  it('should be able to login', async () => {
    const response = await api.post('/session').send({
      password: 'pa55word',
      email: 'user1@gmail.com',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should NOT be able to login if required fields are missing', async () => {
    const response = await api.post('/session').send({
      email: 'everton@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to login if password is wrong', async () => {
    const response = await api.post('/session').send({
      password: 'wrongpa55',
      email: 'user1@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Wrong password!');
  });

  it('should NOT be able to login if email is wrong', async () => {
    const response = await api.post('/session').send({
      password: 'pa55word',
      email: 'wrong@gmail.com',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Wrong email!');
  });
});
