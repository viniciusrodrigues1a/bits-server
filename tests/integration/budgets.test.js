const {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} = require('@jest/globals');
const api = require('../helpers/server');
const { createToken } = require('../helpers/token');
const { databaseHelper } = require('../helpers/database');

let authorizationHeader;
let userId;

beforeEach(async () => {
  const { id } = await databaseHelper.insertUser();

  userId = id;
  authorizationHeader = createToken(id);
});

afterEach(async () => {
  await databaseHelper.database('scheduled_transaction_category').del();
  await databaseHelper.database('budget_categories').del();
  await databaseHelper.database('budget').del();
  await databaseHelper.database('transaction').del();
  await databaseHelper.database('category').del();
  await databaseHelper.database('scheduled_transaction').del();
  await databaseHelper.database('credit').del();
  await databaseHelper.database('wallet').del();
  await databaseHelper.database('user').del();
});

describe('Budget creation endpoint', () => {
  let categoriesId;
  let walletId;

  beforeEach(async () => {
    const categoryId = (await databaseHelper.insertCategory()).id;
    categoriesId = [categoryId];
    walletId = (await databaseHelper.insertWallet({ userId })).id;
  });

  it('should be able to create a budget', async () => {
    const response = await api.post('/budgets').set(authorizationHeader).send({
      amountPaid: 50,
      amountTotal: 3000,
      name: 'Name',
      description: 'Description',
      walletId,
      categoriesId,
    });

    expect(response.statusCode).toEqual(201);
  });

  it('should be NOT able to create a budget if there are fields missing', async () => {
    const response = await api.post('/budgets').set(authorizationHeader).send({
      amountTotal: 3000,
      name: 'Name',
      description: 'Description',
      walletId,
      categoriesId,
    });

    expect(response.statusCode).toEqual(400);
  });

  it("should NOT be able to create a budget if wallet doesn't exist", async () => {
    const response = await api.post('/budgets').set(authorizationHeader).send({
      amountPaid: 50,
      amountTotal: 3000,
      name: 'Name',
      description: 'Description',
      walletId: 1971391,
      categoriesId,
    });

    expect(response.statusCode).toEqual(404);
  });
});

describe('Budget update endpoint', () => {
  it('should be able to update a budget', async () => {
    const { id: categoryId } = await databaseHelper.insertCategory();
    const { id } = await databaseHelper.insertBudget();

    const response = await api
      .put(`/budgets/${id}`)
      .set(authorizationHeader)
      .send({
        name: 'My budget',
        amountTotal: 1000,
        categoriesId: [categoryId],
      });

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to update a budget that doesn't exist", async () => {
    const { id: categoryId } = await databaseHelper.insertCategory();

    const response = await api
      .put('/budgets/14814818')
      .set(authorizationHeader)
      .send({
        name: 'My budget',
        amountTotal: 1000,
        categoriesId: [categoryId],
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Budget not found');
  });

  it("should NOT be able to update a budget if body doesn't have at least one field specified in the body schema", async () => {
    const { id } = await databaseHelper.insertBudget();

    const response = await api
      .put(`/budgets/${id}`)
      .set(authorizationHeader)
      .send({});

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Error: Empty body');
  });

  it('should NOT be able to update a budget if body is incorrectly formatted', async () => {
    const { id: categoryId } = await databaseHelper.insertCategory();
    const { id } = await databaseHelper.insertBudget();

    const response = await api
      .put(`/budgets/${id}`)
      .set(authorizationHeader)
      .send({
        name: 'My budget',
        amountTotal: 'amount is not a string',
        categoriesId: categoryId,
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to update a budget if categoriesId is empty', async () => {
    const { id } = await databaseHelper.insertBudget();

    const response = await api
      .put(`/budgets/${id}`)
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
    const { id: walletId } = await databaseHelper.insertWallet({ userId });
    const { id, description } = await databaseHelper.insertBudget({ walletId });

    const response = await api.get(`/budgets/${id}`).set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.description).toEqual(description);
  });

  it("should NOT be able to show a budget that doesn't exist", async () => {
    const response = await api
      .get('/budgets/18919719')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Budget not found');
  });

  it('should NOT be able to show a budget that is not owned by the user making the request', async () => {
    const { id } = await databaseHelper.insertBudget();

    const response = await api.get(`/budgets/${id}`).set(authorizationHeader);

    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual('This budget is not yours');
  });
});

describe('Budget index endpoint', () => {
  it('should be able to list the budgets a user has', async () => {
    const { id: walletId } = await databaseHelper.insertWallet({ userId });
    await databaseHelper.insertBudget();
    await databaseHelper.insertBudget({ walletId });

    const response = await api.get('/budgets').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
    expect(response.body.budgets.length).toEqual(1);
  });
});
