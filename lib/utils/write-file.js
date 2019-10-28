'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');

const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

module.exports = async function ensureWriteFile(file, data, options) {
	const dir = path.dirname(file);

	await mkdir(dir, { recursive: true });
	await writeFile(file, data, options);
};
