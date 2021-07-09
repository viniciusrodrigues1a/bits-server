import { App } from './server';

// const { CronJobsHandler } = require('../cronJobsHandler');
// const cronJobsHandler = new CronJobsHandler(connection);
// cronJobsHandler.initializeAll();

App().listen(3333, () => console.log('Running on port 3333'));
