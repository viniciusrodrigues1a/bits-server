const crypto = require('crypto');

module.exports = {
  generateString(size = 8) {
    return crypto.randomBytes(size).toString('base64');
  },
  generateInt(min = -100, max = 100) {
    return crypto.randomInt(min, max);
  },
};
