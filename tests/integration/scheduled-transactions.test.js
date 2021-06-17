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

describe('Scheduled transactions creation endpoint', () => {
  it('should be able to create a scheduled transaction', async () => {
    const { id: categoryId } = await databaseHelper.insertCategory();
    const { id: walletId } = await databaseHelper.insertWallet({ userId });

    const response = await api
      .post('/scheduled')
      .set(authorizationHeader)
      .send({
        categoriesId: [categoryId],
        walletId,
        amount: 10,
        timesToRepeat: 10,
        timeSpan: 1,
        type: 'day',
      });

    expect(response.statusCode).toEqual(201);
  });

  it("should NOT be able to create a scheduled transaction if timeSpan doesn't coincide with timesToRepeat", async () => {
    const { id: categoryId } = await databaseHelper.insertCategory();
    const { id: walletId } = await databaseHelper.insertWallet({ userId });

    const response = await api
      .post('/scheduled')
      .set(authorizationHeader)
      .send({
        categoriesId: [categoryId],
        walletId,
        amount: 30,
        timesToRepeat: 10,
        timeSpan: 48,
        type: 'day',
      });

    expect(response.statusCode).toEqual(400);
  });

  it('should NOT be able to create a scheduled transaction if required fields are missing', async () => {
    const response = await api
      .post('/scheduled')
      .set(authorizationHeader)
      .send({
        amount: 100,
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it("should NOT be able to create a scheduled transaction if wallet or category doesn't exist", async () => {
    const { id: walletId } = await databaseHelper.insertWallet({ userId });

    const response = await api
      .post('/scheduled')
      .set(authorizationHeader)
      .send({
        categoriesId: [1848548],
        walletId,
        amount: 10,
        timesToRepeat: 10,
        timeSpan: 1,
        type: 'day',
      });

    expect(response.statusCode).toEqual(404);
  });
});
