const { describe, it, expect } = require('@jest/globals');
const api = require('../helpers/server');
const authorizationHeader = require('../helpers/authToken');

describe('Scheduled transactions creation endpoint', () => {
  it('should be able to create a scheduled transaction', async () => {
    const response = await api
      .post('/scheduled')
      .set(authorizationHeader)
      .send({
        categoriesId: [999],
        walletId: 999,
        amount: 10,
        timesToRepeat: 10,
        timeSpan: 1,
        type: 'day',
      });

    expect(response.statusCode).toEqual(201);
  });

  it("should NOT be able to create a scheduled transaction if timeSpan doesn't coincide with timesToRepeat", async () => {
    const response = await api
      .post('/scheduled')
      .set(authorizationHeader)
      .send({
        categoriesId: [999],
        walletId: 999,
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
    const response = await api
      .post('/scheduled')
      .set(authorizationHeader)
      .send({
        categoriesId: [1848548],
        walletId: 999,
        amount: 10,
        timesToRepeat: 10,
        timeSpan: 1,
        type: 'day',
      });

    expect(response.statusCode).toEqual(404);
  });
});
