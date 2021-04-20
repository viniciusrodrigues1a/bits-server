const cron = require('node-cron');

class TransactionCron {
  constructor(database, type, timeSpan) {
    this.database = database;
    this.type = type;
    this.timeSpan = timeSpan;
    this.repeatedCron = 0;
    this.done = false;
    this.setSchedule();
    this.createJob();
  }

  setSchedule() {
    if (this.type.toLowerCase() === 'month') {
      const dayOfMonth = new Date().getDate();
      // `00 00 ${dayOfMonth} */${value} *`
      this.schedule = `02 11 ${dayOfMonth} */${this.timeSpan} *`;
    } else if (this.type.toLowerCase() === 'week') {
      const dayOfWeek = new Date().getDay();
      // `00 00 */${timeSpan} * ${dayOfWeek}`
      this.schedule = `50 10 */${this.timeSpan}  * ${dayOfWeek}`;
    } else if (this.type.toLowerCase() === 'day') {
      // `00 00 */${timeSpan} * *`
      this.schedule = `41 10 */${this.timeSpan} * *`;
    } else if (this.type.toLowerCase() === 'minute') {
      this.schedule = '*/40 * * * * *';
    }
    this.checkScheduleValidity();
  }

  checkScheduleValidity() {
    console.log(this.schedule);
    if (!cron.validate(this.schedule)) {
      throw new Error('Invalid cron expression');
    }
  }

  createJob() {
    this.job = cron.schedule(
      this.schedule,
      async () => {
        const tr = await this.database('scheduled_transaction')
          .select('times_repeated')
          .where({ id: 6 })
          .first();

        const timesRepeated = tr.times_repeated;

        console.log(this.repeatedCron, timesRepeated);
        if (this.repeatedCron === timesRepeated) {
          // await this.database.schema.raw('CALL make_payment(6)');
          console.log('ta rodando mano');
          await this.database('scheduled_transaction')
            .where({ id: 6 })
            .update({ times_repeated: timesRepeated + 1 });
        } else {
          console.log('n ta rodando');
        }

        this.repeatedCron += 1;
        console.log('created job is running');
      },
      {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
      }
    );
  }
}

module.exports = TransactionCron;
