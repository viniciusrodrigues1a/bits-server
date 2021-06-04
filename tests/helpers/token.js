const token = require('../../src/utils/token');

module.exports = {
  createToken(userId) {
    const signed = token.sign({ id: userId });
    return { Authorization: `Bearer ${signed}` };
  },
};
