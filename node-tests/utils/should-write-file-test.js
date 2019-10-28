'use strict';

const { assert } = require('chai');
const path = require('path');
const { createTempDir } = require('broccoli-test-helper');
const shouldWriteFile = require('../../lib/utils/should-write-file');

describe('shouldWriteFile', () => {
	let input;

	beforeEach(async() => {
		input = await createTempDir();
	});

	afterEach(async() => {
		await input.dispose();
	});

	context('when file does not exist', () => {
		it('returns true', async() => {
			const filepath = path.join(input.path(), 'a.txt');
			const ret = await shouldWriteFile(filepath, 'a');

			assert.ok(ret);
		});
	});

	context('when file exists and content is the same', () => {
		beforeEach(() => {
			input.write({
				'a.txt': 'a'
			});
		});

		it('returns false', async() => {
			const filepath = path.join(input.path(), 'a.txt');
			const ret = await shouldWriteFile(filepath, 'a');

			assert.notOk(ret);
		});
	});

	context('when file exists and content is different', () => {
		beforeEach(() => {
			input.write({
				'a.txt': 'a'
			});
		});

		it('returns true', async() => {
			const filepath = path.join(input.path(), 'a.txt');
			const ret = await shouldWriteFile(filepath, 'b');

			assert.ok(ret);
		});
	});
});
