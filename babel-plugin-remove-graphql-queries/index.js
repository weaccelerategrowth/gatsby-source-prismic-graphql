"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = _default;
exports.getGraphQLTag = getGraphQLTag;
exports.GraphQLSyntaxError = exports.EmptyGraphQLTagError = exports.StringInterpolationNotAllowedError = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/*  eslint-disable new-cap */
var graphql = require("gatsby/graphql");

var murmurhash = require("./murmur");

var nodePath = require("path");

var isGlobalIdentifier = function isGlobalIdentifier(tag) {
  return tag.isIdentifier({
    name: "graphql"
  }) && tag.scope.hasGlobal("graphql");
};

function getGraphqlExpr(t, queryHash, source) {
  return t.objectExpression([t.objectProperty(t.identifier('id'), t.stringLiteral(queryHash)), t.objectProperty(t.identifier('source'), t.stringLiteral(source)), t.objectMethod('method', t.identifier('toString'), [], t.blockStatement([t.returnStatement(t.memberExpression(t.identifier('this'), t.identifier('id')))]))]);
}

var StringInterpolationNotAllowedError = /*#__PURE__*/function (_Error) {
  (0, _inherits2.default)(StringInterpolationNotAllowedError, _Error);

  var _super = _createSuper(StringInterpolationNotAllowedError);

  function StringInterpolationNotAllowedError(interpolationStart, interpolationEnd) {
    var _this;

    (0, _classCallCheck2.default)(this, StringInterpolationNotAllowedError);
    _this = _super.call(this, "BabelPluginRemoveGraphQLQueries: String interpolations are not allowed in graphql " + "fragments. Included fragments should be referenced " + "as `...MyModule_foo`.");
    _this.interpolationStart = JSON.parse(JSON.stringify(interpolationStart));
    _this.interpolationEnd = JSON.parse(JSON.stringify(interpolationEnd));
    Error.captureStackTrace((0, _assertThisInitialized2.default)(_this), StringInterpolationNotAllowedError);
    return _this;
  }

  return StringInterpolationNotAllowedError;
}( /*#__PURE__*/(0, _wrapNativeSuper2.default)(Error));

exports.StringInterpolationNotAllowedError = StringInterpolationNotAllowedError;

var EmptyGraphQLTagError = /*#__PURE__*/function (_Error2) {
  (0, _inherits2.default)(EmptyGraphQLTagError, _Error2);

  var _super2 = _createSuper(EmptyGraphQLTagError);

  function EmptyGraphQLTagError(locationOfGraphqlString) {
    var _this2;

    (0, _classCallCheck2.default)(this, EmptyGraphQLTagError);
    _this2 = _super2.call(this, "BabelPluginRemoveGraphQLQueries: Unexpected empty graphql tag.");
    _this2.templateLoc = locationOfGraphqlString;
    Error.captureStackTrace((0, _assertThisInitialized2.default)(_this2), EmptyGraphQLTagError);
    return _this2;
  }

  return EmptyGraphQLTagError;
}( /*#__PURE__*/(0, _wrapNativeSuper2.default)(Error));

exports.EmptyGraphQLTagError = EmptyGraphQLTagError;

var GraphQLSyntaxError = /*#__PURE__*/function (_Error3) {
  (0, _inherits2.default)(GraphQLSyntaxError, _Error3);

  var _super3 = _createSuper(GraphQLSyntaxError);

  function GraphQLSyntaxError(documentText, originalError, locationOfGraphqlString) {
    var _this3;

    (0, _classCallCheck2.default)(this, GraphQLSyntaxError);
    _this3 = _super3.call(this, "BabelPluginRemoveGraphQLQueries: GraphQL syntax error in query:\n\n".concat(documentText, "\n\nmessage:\n\n").concat(originalError));
    _this3.documentText = documentText;
    _this3.originalError = originalError;
    _this3.templateLoc = locationOfGraphqlString;
    Error.captureStackTrace((0, _assertThisInitialized2.default)(_this3), GraphQLSyntaxError);
    return _this3;
  }

  return GraphQLSyntaxError;
}( /*#__PURE__*/(0, _wrapNativeSuper2.default)(Error));

exports.GraphQLSyntaxError = GraphQLSyntaxError;

function getTagImport(tag) {
  var name = tag.node.name;
  var binding = tag.scope.getBinding(name);
  if (!binding) return null;
  var path = binding.path;
  var parent = path.parentPath;
  if (binding.kind === "module" && parent.isImportDeclaration() && parent.node.source.value === "gatsby") return path;

  if (path.isVariableDeclarator() && path.get("init").isCallExpression() && path.get("init.callee").isIdentifier({
    name: "require"
  }) && path.get("init").node.arguments[0].value === "gatsby") {
    var id = path.get("id");

    if (id.isObjectPattern()) {
      return id.get("properties").find(function (path) {
        return path.get("value").node.name === name;
      });
    }

    return id;
  }

  return null;
}

function isGraphqlTag(tag) {
  var isExpression = tag.isMemberExpression();
  var identifier = isExpression ? tag.get("object") : tag;
  var importPath = getTagImport(identifier);
  if (!importPath) return isGlobalIdentifier(tag);

  if (isExpression && (importPath.isImportNamespaceSpecifier() || importPath.isIdentifier())) {
    return tag.get("property").node.name === "graphql";
  }

  if (importPath.isImportSpecifier()) return importPath.node.imported.name === "graphql";
  if (importPath.isObjectProperty()) return importPath.get("key").node.name === "graphql";
  return false;
}

function removeImport(tag) {
  var isExpression = tag.isMemberExpression();
  var identifier = isExpression ? tag.get("object") : tag;
  var importPath = getTagImport(identifier);

  var removeVariableDeclaration = function removeVariableDeclaration(statement) {
    var declaration = statement.findParent(function (p) {
      return p.isVariableDeclaration();
    });

    if (declaration) {
      declaration.remove();
    }
  };

  if (!importPath) return;
  var parent = importPath.parentPath;

  if (importPath.isImportSpecifier()) {
    if (parent.node.specifiers.length === 1) parent.remove();else importPath.remove();
  }

  if (importPath.isObjectProperty()) {
    if (parent.node.properties.length === 1) {
      removeVariableDeclaration(importPath);
    } else importPath.remove();
  }

  if (importPath.isIdentifier()) {
    removeVariableDeclaration(importPath);
  }
}

function getGraphQLTag(path) {
  var tag = path.get("tag");
  var isGlobal = isGlobalIdentifier(tag);
  if (!isGlobal && !isGraphqlTag(tag)) return {};
  var quasis = path.node.quasi.quasis;

  if (quasis.length !== 1) {
    throw new StringInterpolationNotAllowedError(quasis[0].loc.end, quasis[1].loc.start);
  }

  var text = quasis[0].value.raw;
  var hash = murmurhash(text, "abc");

  try {
    var ast = graphql.parse(text);

    if (ast.definitions.length === 0) {
      throw new EmptyGraphQLTagError(quasis[0].loc);
    }

    return {
      ast: ast,
      text: text,
      hash: hash,
      isGlobal: isGlobal
    };
  } catch (err) {
    throw new GraphQLSyntaxError(text, err, quasis[0].loc);
  }
}

function isUseStaticQuery(path) {
  return path.node.callee.type === "MemberExpression" && path.node.callee.property.name === "useStaticQuery" && path.get("callee").get("object").referencesImport("gatsby") || path.node.callee.name === "useStaticQuery" && path.get("callee").referencesImport("gatsby");
}

function _default(_ref) {
  var t = _ref.types;
  return {
    visitor: {
      Program: function Program(path, state) {
        var nestedJSXVistor = {
          JSXIdentifier: function JSXIdentifier(path2) {
            if (["production", "test"].includes(process.env.NODE_ENV) && path2.isJSXIdentifier({
              name: "StaticQuery"
            }) && path2.referencesImport("gatsby") && path2.parent.type !== "JSXClosingElement") {
              var identifier = t.identifier("staticQueryData");
              var filename = state.file.opts.filename;
              var shortResultPath = "public/static/d/".concat(this.queryHash, ".json");
              var resultPath = nodePath.join(process.cwd(), shortResultPath); // Add query

              path2.parent.attributes.push(t.jSXAttribute(t.jSXIdentifier("data"), t.jSXExpressionContainer(identifier))); // Add import

              var importDefaultSpecifier = t.importDefaultSpecifier(identifier);
              var importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral(filename ? nodePath.relative(nodePath.parse(filename).dir, resultPath) : shortResultPath));
              path.unshiftContainer("body", importDeclaration);
            }
          }
        };
        var nestedHookVisitor = {
          CallExpression: function CallExpression(path2) {
            if (["production", "test"].includes(process.env.NODE_ENV) && isUseStaticQuery(path2)) {
              var identifier = t.identifier("staticQueryData");
              var filename = state.file.opts.filename;
              var shortResultPath = "public/static/d/".concat(this.queryHash, ".json");
              var resultPath = nodePath.join(process.cwd(), shortResultPath); // Remove query variable since it is useless now

              if (this.templatePath.parentPath.isVariableDeclarator()) {
                this.templatePath.parentPath.remove();
              } // only remove the import if its like:
              // import { useStaticQuery } from 'gatsby'
              // but not if its like:
              // import * as Gatsby from 'gatsby'
              // because we know we can remove the useStaticQuery import,
              // but we don't know if other 'gatsby' exports are used, so we
              // cannot remove all 'gatsby' imports.


              if (path2.node.callee.type !== "MemberExpression") {
                // Remove imports to useStaticQuery
                var importPath = path2.scope.getBinding("useStaticQuery").path;
                var parent = importPath.parentPath;
                if (importPath.isImportSpecifier()) if (parent.node.specifiers.length === 1) parent.remove();else importPath.remove();
              } // Add query


              path2.replaceWith(getGraphqlExpr(t, this.queryHash, this.query)); // Add siteMetaData query

              path2.replaceWith(t.memberExpression(identifier, t.identifier("data"))); // Add import

              var importDefaultSpecifier = t.importDefaultSpecifier(identifier);
              var importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral(filename ? nodePath.relative(nodePath.parse(filename).dir, resultPath) : shortResultPath));
              path.unshiftContainer("body", importDeclaration);
            }
          }
        };
        var tagsToRemoveImportsFrom = new Set();

        var setImportForStaticQuery = function setImportForStaticQuery(templatePath) {
          var _getGraphQLTag = getGraphQLTag(templatePath),
              ast = _getGraphQLTag.ast,
              text = _getGraphQLTag.text,
              hash = _getGraphQLTag.hash,
              isGlobal = _getGraphQLTag.isGlobal;

          if (!ast) return null;
          var queryHash = hash.toString();
          var query = text;
          var tag = templatePath.get("tag");

          if (!isGlobal) {
            // Enqueue import removal. If we would remove it here, subsequent named exports
            // wouldn't be handled properly
            tagsToRemoveImportsFrom.add(tag);
          } // Replace the query with the hash of the query.


          templatePath.replaceWith(getGraphqlExpr(t, queryHash, text)); // traverse upwards until we find top-level JSXOpeningElement or Program
          // this handles exported queries and variable queries

          var parent = templatePath;

          while (parent && !["Program", "JSXOpeningElement"].includes(parent.node.type)) {
            parent = parent.parentPath;
          } // modify StaticQuery elements and import data only if query is inside StaticQuery


          parent.traverse(nestedJSXVistor, {
            queryHash: queryHash,
            query: query
          }); // modify useStaticQuery elements and import data only if query is inside useStaticQuery

          parent.traverse(nestedHookVisitor, {
            queryHash: queryHash,
            query: query,
            templatePath: templatePath
          });
          return null;
        }; // Traverse for <StaticQuery/> instances


        path.traverse({
          JSXElement: function JSXElement(jsxElementPath) {
            if (jsxElementPath.node.openingElement.name.name !== "StaticQuery") {
              return;
            }

            jsxElementPath.traverse({
              JSXAttribute: function JSXAttribute(jsxPath) {
                if (jsxPath.node.name.name !== "query") {
                  return;
                }

                jsxPath.traverse({
                  TaggedTemplateExpression: function TaggedTemplateExpression(templatePath, state) {
                    setImportForStaticQuery(templatePath);
                  },
                  Identifier: function Identifier(identifierPath) {
                    if (identifierPath.node.name !== "graphql") {
                      var varName = identifierPath.node.name;
                      path.traverse({
                        VariableDeclarator: function VariableDeclarator(varPath) {
                          if (varPath.node.id.name === varName && varPath.node.init.type === "TaggedTemplateExpression") {
                            varPath.traverse({
                              TaggedTemplateExpression: function TaggedTemplateExpression(templatePath) {
                                setImportForStaticQuery(templatePath);
                              }
                            });
                          }
                        }
                      });
                    }
                  }
                });
              }
            });
          }
        });

        function followVariableDeclarations(binding) {
          var _binding$path;

          var node = (_binding$path = binding.path) === null || _binding$path === void 0 ? void 0 : _binding$path.node;

          if (node && node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.init.type === "Identifier") {
            return followVariableDeclarations(binding.path.scope.getBinding(node.init.name));
          }

          return binding;
        } // Traverse once again for useStaticQuery instances


        path.traverse({
          CallExpression: function CallExpression(hookPath) {
            if (!isUseStaticQuery(hookPath)) return;

            function TaggedTemplateExpression(templatePath) {
              setImportForStaticQuery(templatePath);
            } // See if the query is a variable that's being passed in
            // and if it is, go find it.


            if (hookPath.node.arguments.length === 1 && hookPath.node.arguments[0].type === "Identifier") {
              var _hookPath$node$argume = (0, _slicedToArray2.default)(hookPath.node.arguments, 1),
                  varName = _hookPath$node$argume[0].name;

              var binding = hookPath.scope.getBinding(varName);

              if (binding) {
                followVariableDeclarations(binding).path.traverse({
                  TaggedTemplateExpression: TaggedTemplateExpression
                });
              }
            }

            hookPath.traverse({
              // Assume the query is inline in the component and extract that.
              TaggedTemplateExpression: TaggedTemplateExpression
            });
          }
        }); // Run it again to remove non-staticquery versions

        path.traverse({
          TaggedTemplateExpression: function TaggedTemplateExpression(path2, state) {
            var _getGraphQLTag2 = getGraphQLTag(path2),
                ast = _getGraphQLTag2.ast,
                hash = _getGraphQLTag2.hash,
                text = _getGraphQLTag2.text,
                isGlobal = _getGraphQLTag2.isGlobal;

            if (!ast) return null;
            var queryHash = hash.toString();
            var tag = path2.get("tag");

            if (!isGlobal) {
              // Enqueue import removal. If we would remove it here, subsequent named exports
              // wouldn't be handled properly
              tagsToRemoveImportsFrom.add(tag);
            } // Replace the query with the hash of the query.


            path2.replaceWith(getGraphqlExpr(t, queryHash, text));
            return null;
          }
        });
        tagsToRemoveImportsFrom.forEach(removeImport);
      }
    }
  };
}