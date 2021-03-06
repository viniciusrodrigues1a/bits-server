require('dotenv').config();

module.exports = {
  privateKey: process.env.JWT_PRIVATE_KEY,
  publicKey: process.env.JWT_PUBLIC_KEY,
  signOptions: {
    algorithm: 'RS256',
    expiresIn: '7d',
  },
};
