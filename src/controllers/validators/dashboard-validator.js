function validateRetryRequest(body, allowedSectionIds = []) {
  if (!body || !Array.isArray(body.sectionIds) || body.sectionIds.length === 0) {
    return {
      errorCode: 'invalid_retry_request',
      isValid: false,
      message: 'Provide one or more unavailable section IDs to retry.'
    };
  }

  const allowedSet = new Set(allowedSectionIds);
  const uniqueSectionIds = [];
  const seenSectionIds = new Set();

  for (const rawSectionId of body.sectionIds) {
    const sectionId = Number(rawSectionId);
    if (!Number.isInteger(sectionId) || sectionId <= 0) {
      return {
        errorCode: 'invalid_retry_request',
        isValid: false,
        message: 'Retry section IDs must be positive integers.'
      };
    }

    if (!allowedSet.has(sectionId)) {
      return {
        errorCode: 'retry_section_unavailable',
        isValid: false,
        message: 'Retry requests may target only sections that are currently unavailable.'
      };
    }

    if (!seenSectionIds.has(sectionId)) {
      seenSectionIds.add(sectionId);
      uniqueSectionIds.push(sectionId);
    }
  }

  return {
    isValid: true,
    sectionIds: uniqueSectionIds
  };
}

module.exports = { validateRetryRequest };
