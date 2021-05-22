const { describe, it, expect } = require('@jest/globals');
const api = require('../helpers/server');
const token = require('../../src/utils/token');
const authorizationHeader = require('../helpers/authToken');

describe('Wallet creation endpoint', () => {
  it('should be able to create a wallet', async () => {
    const response = await api.post('/wallet').set(authorizationHeader).send({
      name: 'Despesas',
      balance: 100,
      currency: 'BRL',
    });

    expect(response.statusCode).toEqual(201);
  });

  it('should NOT be able to create a wallet with a balance less than 0', async () => {
    const response = await api.post('/wallet').set(authorizationHeader).send({
      name: 'Despesas',
      balance: -1,
      currency: 'BRL',
    });

    expect(response.statusCode).toEqual(400);
  });

  it('should NOT be able to create a wallet if required fields are missing', async () => {
    const response = await api.post('/wallet').set(authorizationHeader).send({
      name: 'Despesas',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to create a wallet if one of same name already exists', async () => {
    const response = await api.post('/wallet').set(authorizationHeader).send({
      name: 'My wallet',
      balance: 100,
      currency: 'BRL',
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Wallet of same name already exists');
  });
});

describe('Wallet update endpoint', () => {
  it("should be able to update a wallet's balance", async () => {
    const response = await api
      .put('/wallet/999')
      .set(authorizationHeader)
      .send({
        balance: 110,
      });

    expect(response.statusCode).toEqual(200);
  });

  it("should be able to update a wallet's name", async () => {
    const response = await api
      .put('/wallet/999')
      .set(authorizationHeader)
      .send({
        balance: 110,
      });

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to update a wallet that doesn't exist", async () => {
    const response = await api
      .put('/wallet/194418')
      .set(authorizationHeader)
      .send({
        balance: 110,
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wallet not found');
  });

  it('should NOT be able to update a wallet if no field is present', async () => {
    const response = await api
      .put('/wallet/999')
      .set(authorizationHeader)
      .send({});

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });
});

describe('Wallet show endpoint', () => {
  it('should be able to show a wallet', async () => {
    const response = await api.get('/wallet/999').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('currency');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('description');
  });

  it("should NOT be able to show a wallet if it doesn't exist", async () => {
    const response = await api.get('/wallet/1941914').set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wallet not found');
  });

  it('should NOT be able to show a wallet that is not owned by the user making the request', async () => {
    const response = await api.get('/wallet/1000').set(authorizationHeader);

    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual('This wallet is not yours');
  });
});

describe('Wallet deletion', () => {
  it('should be able to delete a wallet', async () => {
    const response = await api.delete('/wallet/1001').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to delete a wallet that doesn't exist", async () => {
    const response = await api
      .delete('/wallet/1941914')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Wallet not found');
  });

  it('should NOT be able to delete a wallet that is not owned by the user making the request', async () => {
    const response = await api.delete('/wallet/1002').set(authorizationHeader);

    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual('This wallet is not yours');
  });
});

describe('Wallet index endpoint', () => {
  it("should be able to list all user's wallets", async () => {
    const response = await api.get('/wallet').set(authorizationHeader);
    expect(response.statusCode).toEqual(200);
  });

  it('should return 2 wallets for user id 999', async () => {
    const response = await api.get('/wallet').set(authorizationHeader);
    expect(response.body.length).toEqual(2);
  });

  it('should return 404 if no wallet is found', async () => {
    const authToken = token.sign({ id: 1001, username: 'User' });
    const response = await api
      .get('/wallet')
      .set({ Authorization: `Bearer ${authToken}` });

    expect(response.statusCode).toEqual(404);
  });
});
