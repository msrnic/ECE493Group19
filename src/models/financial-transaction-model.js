function mapRecord(row) {
  return {
    accountId: row.account_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    maskedMethodIdentifier: row.masked_method_identifier,
    paymentMethodLabel: row.payment_method_label,
    postedAt: row.posted_at,
    referenceNumber: row.transaction_reference,
    sourceSystem: row.source_system,
    status: row.status
  };
}

function createFinancialTransactionModel(db) {
  const selectFeeTransactions = db.prepare(`
    WITH ranked_transactions AS (
      SELECT
        account_id,
        transaction_reference,
        posted_at,
        amount_cents,
        currency,
        payment_method_label,
        masked_method_identifier,
        status,
        source_system,
        updated_at,
        ROW_NUMBER() OVER (
          PARTITION BY transaction_reference
          ORDER BY
            CASE status
              WHEN 'reversed' THEN 4
              WHEN 'succeeded' THEN 3
              WHEN 'failed' THEN 2
              ELSE 1
            END DESC,
            datetime(updated_at) DESC,
            id DESC
        ) AS rank_position
      FROM financial_transactions
      WHERE account_id = ?
        AND transaction_scope = 'sis_fee_payment'
    )
    SELECT
      account_id,
      amount_cents,
      currency,
      masked_method_identifier,
      payment_method_label,
      posted_at,
      source_system,
      status,
      transaction_reference
    FROM ranked_transactions
    WHERE rank_position = 1
    ORDER BY datetime(posted_at) DESC, transaction_reference DESC
  `);

  return {
    listFeeTransactionsForAccount(accountId) {
      return selectFeeTransactions.all(accountId).map(mapRecord);
    }
  };
}

module.exports = { createFinancialTransactionModel };
