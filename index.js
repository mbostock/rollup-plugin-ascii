var acorn = require("acorn"),
    jsesc = require("jsesc"),
    walk = require("estree-walker").walk,
    MagicString = require("magic-string"),
    createFilter = require("rollup-pluginutils").createFilter,
    extname = require("path").extname;

module.exports = function(options) {
  if (options == null) options = {};
  var filter = createFilter(options.include, options.exclude),
      map = options.sourceMap !== false;
  return {
    transform: function(code, id) {
      if (!filter(id) || extname(id) !== ".js") return;

      var ast, magic = new MagicString(code), modified;

      try {
        ast = acorn.parse(code, {ecmaVersion: 6, sourceType: "module"});
      } catch (error) {
        error.message += " in " + id;
        throw error;
      }

      walk(ast, {
        enter: function(node, parent) {
          if (map) {
            magic.addSourcemapLocation(node.start);
            magic.addSourcemapLocation(node.end);
          }
          if (node.type === "Literal" && typeof node.value === "string") {
            var raw0 = node.raw,
                raw1 = jsesc(node.value, {wrap: true, quotes: raw0[0] === "'" ? "single" : "double"});
            if (raw0 !== raw1) {
              modified = true;
              magic.overwrite(node.start, node.end, raw1);
            }
          }
        }
      });

      return modified && {
        code: magic.toString(),
        map: map && magic.generateMap()
      };
    }
  };
};
