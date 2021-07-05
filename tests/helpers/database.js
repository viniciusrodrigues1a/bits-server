const crypto = require('crypto');
const Dinero = require('dinero.js');
const database = require('../../src/infra/database/connection');
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
      const { walletId, categoryId, debt_or_credit_id } = data;

      let newTransaction_belongs = null;
      if (debt_or_credit_id) {
        const [transaction] = await database(
          'create_credit_or_debt_transaction'
        )
          .insert({ debt_or_credit_id })
          .returning('id');

        newTransaction_belongs = transaction;
      }

      const { id: newWalletId } = await this.insertWallet();
      const { id: newCategoryId } = await this.insertCategory();

      const [transaction] = await database('transaction')
        .insert({
          wallet_id: walletId || newWalletId,
          category_id: categoryId || newCategoryId,
          amount,
          description,
          transaction_belongs: newTransaction_belongs,
        })
        .returning('*');

      const { balance, currency } = await database('wallet')
        .where({ id: walletId || newWalletId })
        .select('*')
        .first();

      const newBalance = Dinero({
        amount: balance,
        currency,
      }).add(Dinero({ amount, currency }));

      await database('wallet')
        .where({ id: walletId || newWalletId })
        .update({ balance: newBalance.getAmount() });

      return transaction;
    },

    async insertBudget(data = {}) {
      const { walletId } = data;

      const { id: newWalletId } = await this.insertWallet();

      const [budget] = await database('budget')
        .insert({
          amount_paid: data.amountPaid || generateInt(10, 100),
          amount_total: data.amountTotal || generateInt(200, 400),
          name: data.name || generateString(),
          description: data.description || generateString(),
          wallet_id: walletId || newWalletId,
        })
        .returning('*');

      return budget;
    },

    async insertCredit(data = {}) {
      const { walletId, amount } = data;

      const { id: newWalletId } = await this.insertWallet();

      const [credit] = await database('credit')
        .insert({
          dateNow: new Date(),
          deadline: new Date(),
          from: 'Julin',
          description: 'my payment',
          wallet_id: walletId || newWalletId,
          amount_necessary: amount || generateInt(200, 400),
        })
        .returning('*');

      return credit;
    },

    async insertDebt(data = {}) {
      const { walletId, amount } = data;

      const { id: newWalletId } = await this.insertWallet();

      const [debt] = await database('debt')
        .insert({
          dateNow: new Date(),
          deadline: new Date(),
          from: 'Julin',
          description: 'my payment',
          wallet_id: walletId || newWalletId,
          amount_necessary: amount || generateInt(200, 400),
        })
        .returning('*');

      return debt;
    },
  };
}

module.exports = {
  databaseHelper: databaseHelper(),
};
