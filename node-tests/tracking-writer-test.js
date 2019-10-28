'use strict';

const { assert } = require('chai');
const { createBuilder, createTempDir } = require('broccoli-test-helper');
const Funnel = require('broccoli-funnel');
const TrackingWriter = require('../lib/tracking-writer');
const sinon = require('sinon');

describe('TrackingWriter', () => {
	let input, builder;

	beforeEach(async() => {
		input = await createTempDir();
		input.write({
			'a.txt': 'a',
			'b.txt': 'b'
		});
	});

	afterEach(async() => {
		await input.dispose();
		await builder.dispose();
	});

	context('when processFiles is not overriden', () => {
		it('throws an error on build', async() => {
			class Dummy extends TrackingWriter {}

			const tree = new Funnel(input.path());
			const plugin = new Dummy([tree]);

			builder = createBuilder(plugin);

			try {
				await builder.build();
			} catch (e) {
				assert.instanceOf(e, Error);
				assert.match(e.message, /processFiles/);
			}
		});
	});

	context('when built for first time', () => {
		it('calls processFiles with all files', async() => {
			const spy = sinon.spy();

			class Dummy extends TrackingWriter {}

			Dummy.prototype.processFiles = spy;

			const tree = new Funnel(input.path());
			const plugin = new Dummy([tree]);

			builder = createBuilder(plugin);

			await builder.build();

			assert.lengthOf(spy.args[0][0], 2);
			assert.propertyVal(spy.args[0][0][0], 'relativePath', 'a.txt');
			assert.propertyVal(spy.args[0][0][1], 'relativePath', 'b.txt');
		});
	});

	context('when rebuilt', () => {
		it('calls processFiles with changed files', async() => {
			const spy = sinon.spy();

			class Dummy extends TrackingWriter {}

			Dummy.prototype.processFiles = spy;

			const tree = new Funnel(input.path());
			const plugin = new Dummy([tree]);

			builder = createBuilder(plugin);

			await builder.build();

			input.write({
				'a.txt': 'b'
			});

			await builder.build();

			assert.lengthOf(spy.args[1][0], 1);
			assert.propertyVal(spy.args[1][0][0], 'relativePath', 'a.txt');
		});
	});
});

