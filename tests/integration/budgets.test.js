const { describe, it, expect } = require('@jest/globals');
const api = require('../helpers/server');
const authorizationHeader = require('../helpers/authToken');

describe('Budget creation endpoint', () => {
  it('should be able to create a budget', async () => {
    const response = await api
      .post('/budgets')
      .set(authorizationHeader)
      .send({
        amountPaid: 50,
        amountTotal: 3000,
        name: 'Name',
        description: 'Description',
        walletId: 999,
        categoriesId: [999, 1000],
      });

    expect(response.statusCode).toEqual(201);
  });
  it('should be NOT able to create a budget', async () => {
    const response = await api
      .post('/budgets')
      .set(authorizationHeader)
      .send({
        amountTotal: 3000,
        name: 'Name',
        description: 'Description',
        walletId: 999,
        categoriesId: [999],
      });

    expect(response.statusCode).toEqual(400);
  });

  it('should NOT be able to create a budget', async () => {
    const response = await api
      .post('/budgets')
      .set(authorizationHeader)
      .send({
        amountPaid: 50,
        amountTotal: 3000,
        name: 'Name',
        description: 'Description',
        walletId: 99999,
        categoriesId: [999],
      });

    expect(response.statusCode).toEqual(404);
  });
});

describe('Budget update endpoint', () => {
  it('should be able to update a budget', async () => {
    const response = await api
      .put('/budgets/999')
      .set(authorizationHeader)
      .send({
        name: 'My budget',
        amountTotal: 1000,
        categoriesId: [999, 1000],
      });

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to update a budget that doesn't exist", async () => {
    const response = await api
      .put('/budgets/14814818')
      .set(authorizationHeader)
      .send({
        name: 'My budget',
        amountTotal: 1000,
        categoriesId: [999],
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Budget not found');
  });

  it("should NOT be able to update a budget if body doesn't have at least one field specified in the body schema", async () => {
    const response = await api
      .put('/budgets/1001')
      .set(authorizationHeader)
      .send({});

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Error: Empty body');
  });

  it('should NOT be able to update a budget if body is incorrectly formatted', async () => {
    const response = await api
      .put('/budgets/1001')
      .set(authorizationHeader)
      .send({
        name: 'My budget',
        amountTotal: 'amount is not a string',
        categoriesId: 999,
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to update a budget if categoriesId is empty', async () => {
    const response = await api
      .put('/budgets/999')
      .set(authorizationHeader)
      .send({
        name: 'My budget',
        amountTotal: 1000,
        categoriesId: [],
      });

    expect(response.statusCode).toEqual(200);
  });
});

describe('Budget show endpoint', () => {
  it('should be able to show a budget', async () => {
    const response = await api.get('/budgets/999').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('id');
  });

  it("should NOT be able to show a budget that doesn't exist", async () => {
    const response = await api
      .get('/budgets/18919719')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Budget not found');
  });

  it('should NOT be able to show a budget that is not owned by the user making the request', async () => {
    const response = await api.get('/budgets/1000').set(authorizationHeader);

    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual('This budget is not yours');
  });
});

describe('Budget index endpoint', () => {
  it('should be able to show the budgets a user has', async () => {
    const response = await api.get('/budgets').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('budgets');
  });
});
