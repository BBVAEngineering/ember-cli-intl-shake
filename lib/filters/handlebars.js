const glimmer = require('@glimmer/syntax');
const stripBom = require('strip-bom');

module.exports = function handlebars(content) {
  const list = [];

  content = stripBom(content);

  const ast = glimmer.preprocess(content);

  glimmer.traverse(ast, {
    StringLiteral({ value }) {
      list.push(value);
    },
  });

  return list;
};
