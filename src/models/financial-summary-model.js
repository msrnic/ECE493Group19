function mapSnapshot(row) {
  if (!row) {
    return null;
  }

  return {
    accountId: row.account_id,
    balanceDueCents: row.balance_due_cents,
    createdAt: row.created_at,
    id: row.id,
    lastConfirmedAt: row.last_confirmed_at,
    outstandingFeesCents: row.outstanding_fees_cents,
    paymentStatus: row.payment_status,
    sourceState: row.source_state
  };
}

function createFinancialSummaryModel(db) {
  const selectLatestSnapshot = db.prepare(`
    SELECT
      id,
      account_id,
      balance_due_cents,
      outstanding_fees_cents,
      payment_status,
      source_state,
      last_confirmed_at,
      created_at
    FROM financial_summary_snapshots
    WHERE account_id = ?
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT 1
  `);
  const insertSnapshot = db.prepare(`
    INSERT INTO financial_summary_snapshots (
      account_id,
      balance_due_cents,
      outstanding_fees_cents,
      payment_status,
      source_state,
      last_confirmed_at,
      created_at
    ) VALUES (
      @account_id,
      @balance_due_cents,
      @outstanding_fees_cents,
      @payment_status,
      @source_state,
      @last_confirmed_at,
      @created_at
    )
  `);

  return {
    getLatestSnapshotByAccountId(accountId) {
      return mapSnapshot(selectLatestSnapshot.get(accountId));
    },
    saveSnapshot(snapshot) {
      const result = insertSnapshot.run({
        account_id: snapshot.accountId,
        balance_due_cents: snapshot.balanceDueCents,
        created_at: snapshot.createdAt,
        last_confirmed_at: snapshot.lastConfirmedAt,
        outstanding_fees_cents: snapshot.outstandingFeesCents,
        payment_status: snapshot.paymentStatus,
        source_state: snapshot.sourceState
      });

      return this.getLatestSnapshotByAccountId(snapshot.accountId, Number(result.lastInsertRowid));
    }
  };
}

module.exports = { createFinancialSummaryModel };
