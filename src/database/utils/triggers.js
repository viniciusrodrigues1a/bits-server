const addTransactionTrigger = `
  CREATE OR REPLACE FUNCTION update_wallet_balance()
  RETURNS TRIGGER as $BODY$
  BEGIN
    IF (TG_OP = 'INSERT') THEN
      UPDATE wallet SET balance = (balance + NEW.amount) WHERE id = NEW.wallet_id;
      RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
      UPDATE wallet SET balance = ((balance - OLD.amount) + NEW.amount) WHERE id = OLD.wallet_id;
      RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
      UPDATE wallet SET balance = (balance - OLD.amount) WHERE id = OLD.wallet_id;
      RETURN OLD;
    END IF;
    RETURN NULL;
  END;
  $BODY$
  LANGUAGE plpgsql;

  CREATE TRIGGER transaction_trigger
  AFTER INSERT OR UPDATE OR DELETE 
  ON transaction
  FOR EACH ROW
  EXECUTE PROCEDURE update_wallet_balance();
`;

const addScheduledTransactionTrigger = `
  CREATE OR REPLACE FUNCTION set_due_date_trigger()
  RETURNS TRIGGER AS $$
  BEGIN
    CALL set_due_date(NEW.id);
    RETURN NEW;
  END;
  $$
  LANGUAGE plpgsql;

  CREATE TRIGGER due_date_trigger
  AFTER INSERT OR UPDATE
  ON scheduled_transaction
  FOR EACH ROW
  WHEN (pg_trigger_depth() < 1)
  EXECUTE PROCEDURE set_due_date_trigger();
`;

const addTriggersQuery = `
  ${addTransactionTrigger}
`;

const removeTriggersQuery = `
  DROP TRIGGER transaction_trigger on transaction;

  DROP FUNCTION update_wallet_balance;
`;

module.exports = {
  addTriggersQuery,
  removeTriggersQuery,
};
