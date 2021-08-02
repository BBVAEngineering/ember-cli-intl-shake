'use strict';

const crypto = require('crypto');

module.exports = function md5sum(input) {
  const hash = crypto.createHash('md5');

  hash.update(input, 'utf8');

  return hash.digest('hex');
};
