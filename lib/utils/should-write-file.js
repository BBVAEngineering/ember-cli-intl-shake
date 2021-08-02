'use strict';

const checksumFile = require('./checksum-file');
const readFile = require('./read-file');

module.exports = async function shouldWrite(filepath, content) {
  let lastContent;

  try {
    lastContent = await readFile(filepath);
  } catch (e) {
    return true;
  }

  const sum = checksumFile(filepath, content);
  const lastSum = checksumFile(filepath, lastContent);

  return sum !== lastSum;
};
