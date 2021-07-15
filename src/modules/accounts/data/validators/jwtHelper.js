const jwt = require('jsonwebtoken');
require('dotenv').config();

const config = {
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  signOptions: {
    algorithm: 'RS256',
    expiresIn: '7d',
  },
};

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
