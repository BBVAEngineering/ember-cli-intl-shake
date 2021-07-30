const parseJson = require('json-to-ast');
const estreeWalk = require('estree-walker').walk;

module.exports = function json(content) {
  const list = [];
  const ast = parseJson(content, { loc: false });

  estreeWalk(ast, {
    enter({ type, value }) {
      if (type === 'Literal') {
        list.push(value);
      }
    },
  });

  return list;
};
