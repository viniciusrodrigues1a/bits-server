const express = require('express');

const RegisterController = require('./controllers/RegisterController');
const SessionController = require('./controllers/SessionController');
const WalletController = require('./controllers/WalletController');
const TransactionsController = require('./controllers/TransactionsController');
const ScheduledTransactionsController = require('./controllers/ScheduledTransactionsController');
const CategoriesController = require('./controllers/CategoriesController');
const BudgetsController = require('./controllers/BudgetsController');
const auth = require('./middleware/auth');

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

  const transactionsController = TransactionsController(database);
  routes.post('/transactions', auth, transactionsController.store);
  routes.put('/transactions/:id', auth, transactionsController.update);
  routes.delete('/transactions/:id', auth, transactionsController.destroy);
  routes.get('/transactions/:id', auth, transactionsController.show);
  routes.get('/transactions', auth, transactionsController.index);

  const scheduledTransactionsController = ScheduledTransactionsController(
    database
  );
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

  return routes;
}

module.exports = Routes;
