const { getState, copy } = require("../data/memoryStore");

function get() {
  return copy(getState().settings);
}

function update(changes) {
  Object.assign(getState().settings, changes, {
    updatedAt: new Date().toISOString(),
  });
  return get();
}

module.exports = {
  get,
  update,
};
