const express = require('express');

const RegisterController = require('./controllers/RegisterController');
const SessionController = require('./controllers/SessionController');
const WalletController = require('./controllers/WalletController');
const TransactionsController = require('./controllers/TransactionsController');
const ScheduledTransactionsController = require('./controllers/ScheduledTransactionsController');
const CategoriesController = require('./controllers/CategoriesController');
const BudgetsController = require('./controllers/BudgetsController');
const CreditController = require('./controllers/CreditController');
const auth = require('./middleware/auth');
const DebtController = require('./controllers/DebtController');

function Routes(database) {
  const routes = express.Router();

  routes.post('/signup', RegisterController(database).store);

  const sessionController = SessionController(database);
  routes.post('/session', sessionController.store);
  routes.get('/session', auth, sessionController.validateToken);

  const walletController = WalletController(database);
  routes.post('/wallet', auth, walletController.store);
  routes.put('/wallet/:id', auth, walletController.update);
  routes.get('/wallet/:id', auth, walletController.show);
  routes.delete('/wallet/:id', auth, walletController.destroy);
  routes.get('/wallet', auth, walletController.index);

  const transactionsController = TransactionsController(database);
  routes.post('/transactions', auth, transactionsController.store);
  routes.put('/transactions/:id', auth, transactionsController.update);
  routes.delete('/transactions/:id', auth, transactionsController.destroy);
  routes.get('/transactions/:id', auth, transactionsController.show);
  routes.get('/transactions', auth, transactionsController.index);
  routes.get(
    '/transactions/index/month',
    auth,
    transactionsController.getExpensesAndIncomes
  );

  const scheduledTransactionsController =
    ScheduledTransactionsController(database);
  routes.post('/scheduled', auth, scheduledTransactionsController.store);
  routes.delete(
    '/scheduled/:id',
    auth,
    scheduledTransactionsController.destroy
  );
  routes.get('/scheduled', auth, scheduledTransactionsController.index);
  routes.get('/scheduled/:id', auth, scheduledTransactionsController.show);
  routes.put('/scheduled/:id', auth, scheduledTransactionsController.update);

  const categoriesController = CategoriesController(database);
  routes.post('/categories', auth, categoriesController.store);
  routes.put('/categories/:id', auth, categoriesController.update);
  routes.delete('/categories/:id', auth, categoriesController.destroy);
  routes.get('/categories/:id', auth, categoriesController.show);
  routes.get('/categories', auth, categoriesController.index);

  const budgetsController = BudgetsController(database);
  routes.post('/budgets', auth, budgetsController.store);
  routes.put('/budgets/:id', auth, budgetsController.update);
  routes.get('/budgets/:id', auth, budgetsController.show);
  routes.get('/budgets', auth, budgetsController.index);

  const creditController = CreditController(database);
  routes.post('/credit', auth, creditController.store);
  routes.get('/credit', auth, creditController.index);
  routes.get('/credit/:id', auth, creditController.show);
  routes.put('/credit/:id', auth, creditController.update);
  routes.delete('/credit/:id', auth, creditController.destroy);

  routes.post('/credit/transaction', auth, creditController.storeTransaction);
  routes.put(
    '/credit/transaction/:id',
    auth,
    creditController.updatedTransaction
  );

  const debtController = new DebtController(database);
  routes.post('/debt', auth, debtController.store);
  routes.get('/debt', auth, debtController.index);
  routes.get('/debt/:id', auth, debtController.show);
  routes.post('/debt/transaction', auth, debtController.storeTransaction);
  routes.put('/debt/transaction/:id', auth, debtController.updatedTransaction);
  routes.put('/debt/:id', auth, debtController.update);
  routes.delete('/debt/:id', auth, debtController.destroy);
  return routes;
}

module.exports = Routes;
