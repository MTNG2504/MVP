const { getConfig } = require("../config/config");
const { validationError } = require("./validation");

function hasValue(value) {
  return value !== undefined && value !== "";
}

function parsePositiveInteger(value) {
  if (!/^[1-9]\d*$/.test(String(value))) {
    return null;
  }
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function parseNonNegativeInteger(value) {
  if (!/^(0|[1-9]\d*)$/.test(String(value))) {
    return null;
  }
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function parsePagination(query) {
  const { defaultPageSize, maxPageSize, maxOffset } = getConfig();
  const details = [];
  let page = 1;
  let limit = defaultPageSize;
  let offset;

  if (hasValue(query.page)) {
    const parsed = parsePositiveInteger(query.page);
    if (parsed === null) {
      details.push({ field: "page", message: "page must be a positive integer." });
    } else {
      page = parsed;
    }
  }

  if (hasValue(query.limit)) {
    const parsed = parsePositiveInteger(query.limit);
    if (parsed === null) {
      details.push({ field: "limit", message: "limit must be a positive integer." });
    } else if (parsed > maxPageSize) {
      details.push({ field: "limit", message: `limit cannot exceed ${maxPageSize}.` });
    } else {
      limit = parsed;
    }
  }

  if (hasValue(query.offset)) {
    const parsed = parseNonNegativeInteger(query.offset);
    if (parsed === null) {
      details.push({ field: "offset", message: "offset must be a non-negative integer." });
    } else {
      offset = parsed;
    }
  }

  if (!details.length) {
    if (offset === undefined) {
      offset = (page - 1) * limit;
    } else if (!hasValue(query.page)) {
      page = Math.floor(offset / limit) + 1;
    } else if (offset !== (page - 1) * limit) {
      details.push({ field: "offset", message: "offset does not match page and limit." });
    }

    if (offset > maxOffset) {
      details.push({ field: "offset", message: `offset cannot exceed ${maxOffset}.` });
    }
  }

  if (details.length) {
    throw validationError(details);
  }

  return { page, limit, offset };
}

function buildPage(items, total, pageInfo) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageInfo.limit);
  return {
    data: items,
    pagination: {
      page: pageInfo.page,
      limit: pageInfo.limit,
      offset: pageInfo.offset,
      total,
      totalPages,
    },
  };
}

module.exports = {
  parsePagination,
  buildPage,
};
