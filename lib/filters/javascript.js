const parse = require('@babel/parser').parse;
const traverse = require('@babel/traverse').default;

module.exports = function javascript(content) {
	const list = [];
	const ast = parse(content, {
		sourceType: 'module',
		plugins: [
			'classProperties',
			['decorators', { decoratorsBeforeExport: true }],
			'objectRestSpread'
		]
	});

	traverse(ast, {
		Literal({ node: { value } }) {
			list.push(value);
		}
	});

	return list;
};
