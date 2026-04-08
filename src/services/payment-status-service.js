function toIdentifierKey(value) {
  return String(value || '').trim().toLowerCase();
}

function formatCurrencyAmount(amountCents) {
  return Number(amountCents || 0) / 100;
}

function mapTransactionStatus(status) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'succeeded':
      return 'Succeeded';
    case 'failed':
      return 'Failed';
    case 'reversed':
      return 'Reversed';
    default:
      return 'Pending';
  }
}

function maskMethodIdentifier(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes('*') || /^acct /i.test(trimmed)) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `**** ${digits.slice(-4)}`;
  }

  return '****';
}

function mapDependencyError(error) {
  if (error?.code === 'transaction_history_unavailable') {
    return {
      code: 'transaction_history_unavailable',
      message: 'Transaction history is temporarily unavailable. Please retry.',
      retryable: true,
      statusCode: 503
    };
  }

  throw error;
}

function createPaymentStatusService(options) {
  function shouldFailRetrieval(student) {
    const configuredIdentifiers = options.transactionHistoryTestState?.retrievalFailureIdentifiers;
    const failingIdentifiers = new Set(
      (Array.isArray(configuredIdentifiers) ? configuredIdentifiers : []).map(toIdentifierKey)
    );

    return (
      failingIdentifiers.has(toIdentifierKey(student.email)) ||
      failingIdentifiers.has(toIdentifierKey(student.studentId))
    );
  }

  return {
    createDependencyErrorPayload(error) {
      return mapDependencyError(error);
    },
    createTransactionHistoryResponse(student) {
      if (shouldFailRetrieval(student)) {
        const error = new Error('Transaction history is temporarily unavailable.');
        error.code = 'transaction_history_unavailable';
        throw error;
      }

      return {
        generatedAt: options.now().toISOString(),
        records: options.financialTransactionModel.listFeeTransactionsForAccount(student.accountId).map((record) => ({
          amount: formatCurrencyAmount(record.amountCents),
          currency: record.currency,
          maskedMethodIdentifier: maskMethodIdentifier(record.maskedMethodIdentifier),
          paymentMethodLabel: record.paymentMethodLabel,
          postedAt: record.postedAt,
          referenceNumber: record.referenceNumber,
          status: mapTransactionStatus(record.status),
          transactionId: record.referenceNumber
        })),
        sortOrder: 'newest_first',
        studentId: student.studentId
      };
    }
  };
}

module.exports = {
  createPaymentStatusService,
  mapDependencyError,
  mapTransactionStatus,
  maskMethodIdentifier
};
