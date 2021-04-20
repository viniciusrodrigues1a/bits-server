const { describe, it, expect } = require('@jest/globals');
const api = require('../helpers/server');
const authorizationHeader = require('../helpers/authToken');

describe('Category creation endpoint', () => {
  it('should be able to create a category', async () => {
    const response = await api
      .post('/categories')
      .set(authorizationHeader)
      .send({
        name: 'My category',
        iconPath: 'bell',
      });

    expect(response.statusCode).toEqual(201);
  });

  it('should NOT be able to create a category if name is missing', async () => {
    const response = await api
      .post('/categories')
      .set(authorizationHeader)
      .send({
        iconPath: 'car',
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to create a category if icon_path is missing', async () => {
    const response = await api
      .post('/categories')
      .set(authorizationHeader)
      .send({
        name: 'Another category',
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it('should NOT be able to create a category if one of same icon_path already exists', async () => {
    const response = await api
      .post('/categories')
      .set(authorizationHeader)
      .send({
        name: 'Restaurant',
        iconPath: 'coffee',
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Category already exists');
  });

  it('should NOT be able to create a category if one of same name already exists', async () => {
    const response = await api
      .post('/categories')
      .set(authorizationHeader)
      .send({
        name: 'Technology',
        iconPath: 'monitor',
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Category already exists');
  });
});

describe('Category update endpoint', () => {
  it('should be able to update a category', async () => {
    const response = await api
      .put('/categories/1001')
      .set(authorizationHeader)
      .send({
        name: 'Updated name',
        iconPath: 'updated-icon',
      });

    expect(response.statusCode).toEqual(200);
  });

  it('should NOT be able to update a category if required fields are provided', async () => {
    const response = await api.put('/categories/1001').set(authorizationHeader);

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Validation failed!');
  });

  it("should NOT be able to update a category that doesn't exist", async () => {
    const response = await api
      .put('/categories/14881481')
      .set(authorizationHeader)
      .send({
        name: 'Updated name',
        iconPath: 'updated-icon',
      });

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Category not found');
  });
});

describe('Category deletion endpoint', () => {
  it('should be able to delete a category', async () => {
    const response = await api
      .delete('/categories/1002')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it("should be able to delete a category that doesn't exist", async () => {
    const response = await api
      .delete('/categories/18948678')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Category not found');
  });
});

describe('Category show endpoint', () => {
  it('should be able to show a category', async () => {
    const response = await api.get('/categories/999').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });

  it("should NOT be able to show a category that doesn't exist", async () => {
    const response = await api
      .get('/categories/1291291')
      .set(authorizationHeader);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Category not found');
  });
});
describe('Category index endpoint', () => {
  it('should be able to list all cateogires', async () => {
    const response = await api.get('/categories').set(authorizationHeader);

    expect(response.statusCode).toEqual(200);
  });
});
