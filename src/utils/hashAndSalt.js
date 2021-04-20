const crypto = require('crypto');

function hashAndSalt(string, salt) {
  let hash = crypto.createHmac('sha512', salt);
  hash.update(string);
  hash = hash.digest('hex');

  return hash;
}

module.exports = hashAndSalt;
