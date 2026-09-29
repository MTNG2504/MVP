function matchesText(record, fields, search) {
  const needle = String(search).toLowerCase();
  return fields.some((field) => String(record[field] ?? "").toLowerCase().includes(needle));
}

function inDateRange(value, from, to) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    return false;
  }
  if (from && time < Date.parse(from)) {
    return false;
  }
  if (to && time > Date.parse(to)) {
    return false;
  }
  return true;
}

module.exports = {
  matchesText,
  inDateRange,
};
