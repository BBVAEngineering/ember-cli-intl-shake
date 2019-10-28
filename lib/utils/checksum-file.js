'use strict';

const md5hex = require('./md5hex');

module.exports = function checksumFile(filepath, content) {
	return md5hex(content + 0x00 + filepath);
};
