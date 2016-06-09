var acorn = require("acorn"),
    jsesc = require("jsesc"),
    walk = require("estree-walker").walk,
    MagicString = require("magic-string"),
    createFilter = require("rollup-pluginutils").createFilter,
    extname = require("path").extname;

module.exports = function(options) {
  if (options == null) options = {};
  var filter = createFilter(options.include, options.exclude);
  return {
    transform: function(code, id) {
      if (!filter(id) || extname(id) !== ".js") return;

      var magic, ast;

      try {
        ast = acorn.parse(code, {ecmaVersion: 6, sourceType: "module"});
      } catch (error) {
        error.message += " in " + id;
        throw error;
      }

      walk(ast, {
        enter: function(node, parent) {
          if (node.type === "Literal" && typeof node.value === "string") {
            if (!magic) magic = new MagicString(code);
            var quote = node.raw[0],
                value = jsesc(node.value, {quotes: quote === "'" ? "single" : "double"});
            magic.overwrite(node.start, node.end, quote + value + quote);
          }
        }
      });

      return magic && {code: magic.toString()};
    }
  };
};
