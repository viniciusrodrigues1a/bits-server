const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

function sign(payload) {
  return jwt.sign(payload, config.privateKey, config.signOptions);
}

function verify(token) {
  return new Promise((resolve, reject) =>
    jwt.verify(token, config.publicKey, (error, data) =>
      error ? reject(error) : resolve(data)
    )
  );
}

module.exports = {
  sign,
  verify,
};
