const App = require('./server');
const connection = require('./infra/database/connection');
const { CronJobsHandler } = require('./cronJobsHandler');

const cronJobsHandler = new CronJobsHandler(connection);
// cronJobsHandler.initializeAll();

App(connection).listen(3333, () => console.log('Running on port 3333'));
