const crypto = require('crypto');
const database = require('../../src/database/connection');
const { generateString, generateInt } = require('./random');
const hashAndSalt = require('../../src/utils/hashAndSalt');

function databaseHelper() {
  return {
    database,
    async insertUser(data = {}) {
      const name = data.name || generateString();
      const email = data.email || generateString();
      const password = data.password || generateString();

      const salt = crypto.randomBytes(8).toString('hex').slice(0, 16);

      const [user] = await database('user')
        .insert({
          name,
          email,
          salt,
          password_hash: hashAndSalt(password, salt),
        })
        .returning('*');

      return user;
    },

    async insertWallet(data = {}) {
      const name = data.name || generateString();
      const balance = data.balance || generateInt(10, 1000);
      const { userId } = data;

      const { id: newUserId } = this.insertUser();

      const [wallet] = await database('wallet')
        .insert({
          user_id: userId || newUserId,
          currency: 'BRL',
          name,
          balance,
        })
        .returning('*');

      return wallet;
    },

    async insertCategory(data = {}) {
      const name = data.name || generateString();
      const iconPath = data.iconPath || generateString(4);

      const [category] = await database('category')
        .insert({
          name,
          icon_path: iconPath,
        })
        .returning('*');

      return category;
    },

    async insertTransaction(data = {}) {
      const description = data.description || generateString();
      const amount = data.amount || generateInt();
      const { walletId } = data;
      const { categoryId } = data;

      const { id: newWalletId } = await this.insertWallet();
      const { id: newCategoryId } = await this.insertCategory();

      const [transaction] = await database('transaction')
        .insert({
          wallet_id: walletId || newWalletId,
          category_id: categoryId || newCategoryId,
          amount,
          description,
        })
        .returning('*');
      return transaction;
    },
  };
}

module.exports = {
  databaseHelper: databaseHelper(),
};
