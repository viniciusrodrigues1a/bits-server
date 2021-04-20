const crypto = require('crypto');
const hashAndSalt = require('../../utils/hashAndSalt');

exports.seed = function (knex) {
  const name = 'User';
  const password = 'pa55word';
  const salt = crypto.randomBytes(8).toString('hex').slice(0, 16);
  const hashedPassword = hashAndSalt(password, salt);

  return knex('user')
    .del()
    .then(() =>
      knex('user').insert([
        {
          id: 999,
          name,
          email: 'user1@gmail.com',
          password_hash: hashedPassword,
          salt,
        },
        {
          id: 1000,
          name,
          email: 'user2@gmail.com',
          password_hash: hashedPassword,
          salt,
        },
      ])
    );
};
