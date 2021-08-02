module.exports = {
  MAX_CONCURRENT: Math.max(require('os').cpus().length - 1, 1),
};
