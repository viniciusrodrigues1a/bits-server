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
  await databaseHelper.database('credit').del();
  await databaseHelper.database('wallet').del();
  await databaseHelper.database('user').del();
});

describe('Credit creation endpoint', () => {
  let walletId;

  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet()).id;
  });

  it('should be able to create a new credit', async () => {
    const response = await api.post('/credit').set(authorizationHeader).send({
      amount: 100,
      dateNow: new Date(),
      deadline: new Date(),
      from: 'Boss',
      description: 'payment',
      walletId: walletId,
    });
    expect(response.statusCode).toEqual(201);
  });

  it('should NOT be able to create a new credit', async () => {
    const response = await api.post('/credit').set(authorizationHeader).send({
      amount: 100,
      dateNow: new Date(),
      deadline: new Date(),
      from: 'Boss',
      description: 'payment',
    });
    expect(response.statusCode).toEqual(400);
  });

  it('should NOT be able to create a new credit because amount ins negative', async () => {
    const response = await api.post('/credit').set(authorizationHeader).send({
      amount: -100,
      dateNow: new Date(),
      deadline: new Date(),
      from: 'Boss',
      description: 'payment',
    });
    expect(response.statusCode).toEqual(400);
  });
});

describe('store transaction creation endpoint', () => {
  let walletId;
  let creditId;
  beforeEach(async () => {
    creditId = (await databaseHelper.insertCredit()).id;
    walletId = (await databaseHelper.insertWallet()).id;
  });

  it('should be able to create a new transaction in credit', async () => {
    const response = await api
      .post('/credit/transaction')
      .set(authorizationHeader)
      .send({
        dateNow: new Date(),
        description: 'My boss paying me 50 dolars',
        walletId,
        creditId,
        amount: 50,
      });

    expect(response.statusCode).toEqual(201);
  });
});
