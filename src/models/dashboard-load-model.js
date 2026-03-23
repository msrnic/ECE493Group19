function calculatePercentile(values, percentile) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  if (percentile <= 0) {
    return values[0];
  }

  if (percentile >= 100) {
    return values[values.length - 1];
  }

  const index = Math.ceil((percentile / 100) * values.length) - 1;
  return values[Math.max(index, 0)];
}

function createDashboardLoadModel(db) {
  const insertLoadEvent = db.prepare(`
    INSERT INTO dashboard_load_events (
      account_id,
      request_type,
      outcome,
      attempted_sections,
      successful_sections,
      failed_sections,
      duration_ms,
      occurred_at
    ) VALUES (
      @account_id,
      @request_type,
      @outcome,
      @attempted_sections,
      @successful_sections,
      @failed_sections,
      @duration_ms,
      @occurred_at
    )
  `);
  const selectEventsForAccount = db.prepare(`
    SELECT *
    FROM dashboard_load_events
    WHERE account_id = ?
    ORDER BY id ASC
  `);
  const selectDurationsForRequestType = db.prepare(`
    SELECT duration_ms
    FROM dashboard_load_events
    WHERE request_type = ?
    ORDER BY duration_ms ASC
  `);

  return {
    getPerformanceSummary(requestType, percentile = 95) {
      const durations = selectDurationsForRequestType
        .all(requestType)
        .map((row) => row.duration_ms);

      return {
        percentile,
        sampleSize: durations.length,
        valueMs: calculatePercentile(durations, percentile)
      };
    },
    listEventsForAccount(accountId) {
      return selectEventsForAccount.all(accountId);
    },
    recordEvent(details) {
      insertLoadEvent.run({
        account_id: details.accountId,
        request_type: details.requestType,
        outcome: details.outcome,
        attempted_sections: details.attemptedSections,
        successful_sections: details.successfulSections,
        failed_sections: details.failedSections,
        duration_ms: details.durationMs || 0,
        occurred_at: details.occurredAt
      });
    }
  };
}

module.exports = { calculatePercentile, createDashboardLoadModel };
