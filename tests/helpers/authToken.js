const token = require('../../src/utils/token');

const authToken = token.sign({ id: 999, username: 'User' });
const authorizationHeader = { Authorization: `Bearer ${authToken}` };

module.exports = authorizationHeader;
