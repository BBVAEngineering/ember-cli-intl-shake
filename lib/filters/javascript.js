const acorn = require('acorn');
const walk = require('acorn-walk');

module.exports = function javascript(content) {
	const list = [];
	const ast = acorn.parse(content, {
		sourceType: 'module'
	});

	walk.simple(ast, {
		Literal({ value }) {
			list.push(value);
		}
	});

	return list;
};
