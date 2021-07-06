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
  await databaseHelper.database('wallet').del();
  await databaseHelper.database('user').del();
});

describe('Credit creation endpoint', () => {
  let walletId;
  beforeEach(async () => {
    walletId = (await databaseHelper.insertWallet()).id;
  });

  const genericInformation = {
    dateNow: new Date(),
    deadline: new Date(),
    from: 'Boss',
    description: 'payment',
    walletId,
  };

  it('should be able to create a new credit', async () => {
    const response = api
      .post('/credit')
      .set(authorizationHeader)
      .send({
        amount: 100,
        ...genericInformation,
      });

    expect(response.statusCode).toEqual(201);
  });
});
