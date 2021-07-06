const addProcedures = `
  CREATE OR REPLACE PROCEDURE make_scheduled_payment(scheduledTransactionId INTEGER)
  AS $$
  DECLARE
    amount INTEGER = (SELECT amount FROM scheduled_transaction WHERE id = scheduledTransactionId);
    walletId INTEGER = (SELECT wallet_id FROM scheduled_transaction WHERE id = scheduledTransactionId);
    scheduledTransactionInterval INTERVAL = (SELECT date_interval FROM scheduled_transaction WHERE id = scheduledTransactionId);
  BEGIN
    UPDATE wallet SET balance = balance - amount WHERE id = walletId;
    UPDATE scheduled_transaction SET due_date = CURRENT_TIMESTAMP + scheduledTransactionInterval WHERE id = scheduledTransactionId;
  END;
  $$
  LANGUAGE plpgsql;
`;

const removeProcedures = `
  DROP PROCEDURE make_scheduled_payment;
`;

module.exports = { addProcedures, removeProcedures };
