"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _get = _interopRequireDefault(require("lodash/get"));

var _babelParseToAst = require("gatsby/dist/utils/babel-parse-to-ast");

var _gatsbyNode = require("gatsby-source-graphql/gatsby-node");

var _utils = require("./utils");

var _gatsbySourceFilesystem = require("gatsby-source-filesystem");

var _pathToRegexp = require("path-to-regexp");

var _querystring = _interopRequireDefault(require("querystring"));

exports.onCreateWebpackConfig = function (_ref) {
  var stage = _ref.stage,
      actions = _ref.actions,
      getConfig = _ref.getConfig;
  var config = getConfig();

  if (stage.indexOf('html') >= 0) {
    return;
  }

  var replaceRule = function replaceRule(ruleUse) {
    if (ruleUse.loader && ruleUse.loader.indexOf("gatsby/dist/utils/babel-loader.js") >= 0) {
      ruleUse.loader = require.resolve("./babel-loader.js");
    }
  };

  var traverseRule = function traverseRule(rule) {
    if (rule.oneOf && Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach(traverseRule);
    }

    if (rule.use) {
      if (Array.isArray(rule.use)) {
        rule.use.forEach(replaceRule);
      } else {
        replaceRule(rule.use);
      }
    }
  };

  config.module.rules.forEach(traverseRule);
  actions.replaceWebpackConfig(config);
};

function getRootQuery(componentPath) {
  try {
    var content = _fs.default.readFileSync(componentPath, 'utf-8');

    var ast = (0, _babelParseToAst.babelParseToAst)(content, componentPath);
    var exported = (0, _get.default)(ast, 'program.body', []).filter(function (n) {
      return n.type === 'ExportNamedDeclaration';
    });
    var exportedQuery = exported.find(function (exp) {
      return (0, _get.default)(exp, 'declaration.declarations.0.id.name') === 'query';
    });

    if (exportedQuery) {
      var query = (0, _get.default)(exportedQuery, 'declaration.declarations.0.init.quasi.quasis.0.value.raw');

      if (query) {
        return query;
      }
    }
  } catch (err) {
    console.error('gatsby-source-prismic-universal: Could not parse component path: ', componentPath);
    console.error(err);
  }

  return null;
}

;
var accessToken;

exports.onPreInit = function (_, options) {
  accessToken = options.accessToken;

  if (!options.previews) {
    delete options.accessToken;
  }
};

exports.onCreatePage = function (_ref2) {
  var page = _ref2.page,
      actions = _ref2.actions;
  var rootQuery = getRootQuery(page.componentPath);
  page.context = page.context || {};

  if (rootQuery) {
    page.context.rootQuery = rootQuery;
    actions.createPage(page);
  }
};

exports.sourceNodes = function (ref, options) {
  var opts = (0, _objectSpread2.default)({
    fieldName: _utils.fieldName,
    typeName: _utils.typeName,
    createLink: function createLink() {
      return (0, _utils.PrismicLink)({
        uri: "https://".concat(options.repositoryName, ".prismic.io/graphql"),
        credentials: 'same-origin',
        accessToken: accessToken,
        customRef: options.prismicRef
      });
    }
  }, options);
  return (0, _gatsbyNode.sourceNodes)(ref, opts);
};

function createGeneralPreviewPage(createPage, allPaths, options) {
  var previewPath = options.previewPath || '/preview';
  createPage({
    path: previewPath.replace(/^\//, ''),
    component: _path.default.resolve(_path.default.join(__dirname, 'components', 'PreviewPage.js')),
    context: {
      prismicPreviewPage: true,
      prismicAllPagePaths: allPaths
    }
  });
}

function createDocumentPreviewPage(createPage, options, page) {
  var rootQuery = getRootQuery(page.component);
  createPage({
    path: (0, _utils.getPagePreviewPath)(page),
    component: page.component,
    context: {
      rootQuery: rootQuery,
      id: '',
      uid: '',
      lang: options.defaultLang,
      paginationPreviousUid: '',
      paginationPreviousLang: '',
      paginationNextUid: '',
      paginationNextLang: ''
    }
  });
}
/**
 * Create URL paths interpolating `:uid` and `:lang` or `:lang?` with actual values.
 * @param pageOptions - Returned paths are based on the `match` property of the `pageOptions` object.
 * @param node - Document node metadata provide the `lang` and `uid` values for the returned path.
 * @param options - The plugin's global options.
 * @param options.defaultLang - `defaultLang` as declared in `PluginOptions`. If `lang` segment is
 * marked optional (`:lang?`) in the page `match` and `defaultLang` matches the
 * document's actual language, the language segment of the path will be omitted in the returned path.
 * @param options.shortenUrlLangs - When truthy, the lang used for the path will be limited to 2 characters.
 * @return The path for the document's URL with `lang` and `uid` interpolated as necessary.
 */


function createDocumentPath(pageOptions, node, _ref3) {
  var defaultLang = _ref3.defaultLang,
      shortenUrlLangs = _ref3.shortenUrlLangs;
  var pathKeys = [];
  var pathTemplate = pageOptions.match;
  (0, _pathToRegexp.pathToRegexp)(pathTemplate, pathKeys);
  var langKey = pathKeys.find(function (key) {
    return key.name === 'lang';
  });
  var isLangOptional = !!(langKey && langKey.modifier === '?');
  var toPath = (0, _pathToRegexp.compile)(pathTemplate);
  var documentLang = node._meta.lang;
  var isDocumentLangDefault = documentLang === defaultLang;
  var shouldExcludeLangInPath = isLangOptional && isDocumentLangDefault;
  var displayedLang = shortenUrlLangs ? documentLang.slice(0, 2) : documentLang;
  var lang = shouldExcludeLangInPath ? null : displayedLang;
  var params = (0, _objectSpread2.default)({}, node._meta, {
    lang: lang
  });
  var path = decodeURI(toPath(params));
  return path === '' ? '/' : path;
}

function createDocumentPages(createPage, edges, options, page) {
  var paths = []; // Cycle through each document returned from query...

  edges.forEach(function (_ref4, index) {
    var cursor = _ref4.cursor,
        node = _ref4.node;
    var previousNode = edges[index - 1] && edges[index - 1].node;
    var nextNode = edges[index + 1] && edges[index + 1].node;
    var path = createDocumentPath(page, node, options);
    paths.push(path); // ...and create the page

    createPage({
      path: path,
      component: page.component,
      context: (0, _objectSpread2.default)({
        rootQuery: getRootQuery(page.component)
      }, node._meta, {
        cursor: cursor,
        paginationPreviousMeta: previousNode ? previousNode._meta : null,
        paginationPreviousUid: previousNode ? previousNode._meta.uid : '',
        paginationPreviousLang: previousNode ? previousNode._meta.lang : '',
        paginationNextMeta: nextNode ? nextNode._meta : null,
        paginationNextUid: nextNode ? nextNode._meta.uid : '',
        paginationNextLang: nextNode ? nextNode._meta.lang : '',
        // pagination helpers for overcoming backwards pagination issues cause by Prismic's 20-document query limit
        lastQueryChunkEndCursor: edges[index - 1] ? edges[index - 1].endCursor : ''
      })
    });
  });
  return paths;
}

var getDocumentsQuery = function getDocumentsQuery(_ref5) {
  var documentType = _ref5.documentType,
      sortType = _ref5.sortType,
      extraPageFields = _ref5.extraPageFields;
  return "\n  query AllPagesQuery ($after: String, $lang: String, $sortBy: ".concat(sortType, ") {\n    prismic {\n      ").concat(documentType, " (\n        first: 20\n        after: $after\n        sortBy: $sortBy\n        lang: $lang\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        edges {\n          cursor\n          node {\n            ").concat(extraPageFields, "\n            _meta {\n              id\n              lang\n              uid\n              type\n              alternateLanguages {\n                id\n                lang\n                type\n                uid\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n");
};

exports.createPages = /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(_ref6, options) {
    var graphql, createPage, getPrismicEdges, _getPrismicEdges, createPagesForType, _createPagesForType, pages, pageCreators, allPaths;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _createPagesForType = function _createPagesForType3() {
              _createPagesForType = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(page, lang) {
                var edges;
                return _regenerator.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return getPrismicEdges(page, lang);

                      case 2:
                        edges = _context2.sent;
                        createDocumentPreviewPage(createPage, options, page);
                        return _context2.abrupt("return", createDocumentPages(createPage, edges, options, page));

                      case 5:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));
              return _createPagesForType.apply(this, arguments);
            };

            createPagesForType = function _createPagesForType2(_x5, _x6) {
              return _createPagesForType.apply(this, arguments);
            };

            _getPrismicEdges = function _getPrismicEdges3() {
              _getPrismicEdges = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(page, lang) {
                var endCursor,
                    documents,
                    documentType,
                    sortType,
                    extraPageFields,
                    query,
                    _yield$graphql,
                    data,
                    errors,
                    response,
                    edges,
                    newEndCursor,
                    _args = arguments;

                return _regenerator.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        endCursor = _args.length > 2 && _args[2] !== undefined ? _args[2] : '';
                        documents = _args.length > 3 && _args[3] !== undefined ? _args[3] : [];
                        // Prepare and execute query
                        documentType = "all".concat(page.type, "s");
                        sortType = "PRISMIC_Sort".concat(page.type, "y");
                        extraPageFields = options.extraPageFields || '';
                        query = getDocumentsQuery({
                          documentType: documentType,
                          sortType: sortType,
                          extraPageFields: extraPageFields
                        });
                        _context.next = 8;
                        return graphql(query, {
                          after: endCursor,
                          lang: lang || null,
                          sortBy: page.sortBy
                        });

                      case 8:
                        _yield$graphql = _context.sent;
                        data = _yield$graphql.data;
                        errors = _yield$graphql.errors;

                        if (!(errors && errors.length)) {
                          _context.next = 13;
                          break;
                        }

                        throw errors[0];

                      case 13:
                        response = data.prismic[documentType];
                        edges = page.filter ? response.edges.filter(page.filter) : response.edges; // Add last end cursor to all edges to enable pagination context when creating pages

                        edges.forEach(function (edge) {
                          return edge.endCursor = endCursor;
                        }); // Stage documents for page creation

                        documents = [].concat((0, _toConsumableArray2.default)(documents), (0, _toConsumableArray2.default)(edges));

                        if (!response.pageInfo.hasNextPage) {
                          _context.next = 24;
                          break;
                        }

                        newEndCursor = response.pageInfo.endCursor;
                        _context.next = 21;
                        return getPrismicEdges(page, lang, newEndCursor, documents);

                      case 21:
                        return _context.abrupt("return", _context.sent);

                      case 24:
                        return _context.abrupt("return", Promise.resolve(documents));

                      case 25:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));
              return _getPrismicEdges.apply(this, arguments);
            };

            getPrismicEdges = function _getPrismicEdges2(_x3, _x4) {
              return _getPrismicEdges.apply(this, arguments);
            };

            graphql = _ref6.graphql, createPage = _ref6.actions.createPage;
            // Create pageCreator promises for each page/language combination
            pages = options.pages || [];
            pageCreators = (0, _utils.flatten)(pages.map(function (page) {
              var langs = page.langs || options.langs || options.defaultLang && [options.defaultLang];

              if (langs) {
                return langs.map(function (lang) {
                  return createPagesForType(page, lang);
                });
              } else {
                return [createPagesForType(page)];
              }
            })); // Run all pageCreators simultaneously

            _context3.t0 = _utils.flatten;
            _context3.next = 10;
            return Promise.all(pageCreators);

          case 10:
            _context3.t1 = _context3.sent;
            allPaths = (0, _context3.t0)(_context3.t1);
            createGeneralPreviewPage(createPage, allPaths, options);

          case 13:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x, _x2) {
    return _ref7.apply(this, arguments);
  };
}();

exports.createResolvers = function (_ref8, _ref9) {
  var actions = _ref8.actions,
      cache = _ref8.cache,
      createNodeId = _ref8.createNodeId,
      createResolvers = _ref8.createResolvers,
      store = _ref8.store,
      reporter = _ref8.reporter;
  var _ref9$sharpKeys = _ref9.sharpKeys,
      sharpKeys = _ref9$sharpKeys === void 0 ? [/image|photo|picture/] : _ref9$sharpKeys;
  var createNode = actions.createNode;
  var state = store.getState();

  var _state$schemaCustomiz = (0, _slicedToArray2.default)(state.schemaCustomization.thirdPartySchemas, 1),
      _state$schemaCustomiz2 = _state$schemaCustomiz[0],
      prismicSchema = _state$schemaCustomiz2 === void 0 ? {} : _state$schemaCustomiz2;

  var typeMap = prismicSchema._typeMap;
  var resolvers = {};

  for (var _typeName in typeMap) {
    var typeEntry = typeMap[_typeName];
    var typeFields = typeEntry && typeEntry.getFields && typeEntry.getFields() || {};
    var typeResolver = {};

    var _loop = function _loop(_fieldName) {
      var field = typeFields[_fieldName];

      if (field.type === typeMap.PRISMIC_Json && sharpKeys.some(function (re) {
        return re instanceof RegExp ? re.test(_fieldName) : re === _fieldName;
      })) {
        typeResolver["".concat(_fieldName, "Sharp")] = {
          type: 'File',
          args: {
            crop: {
              type: typeMap.String
            }
          },
          resolve: function resolve(source, args) {
            var obj = source && source[_fieldName] || {};
            var url = args.crop ? obj[args.crop] && obj[args.crop].url : obj.url;

            if (url) {
              return (0, _gatsbySourceFilesystem.createRemoteFileNode)({
                url: _querystring.default.unescape(url).replace(/\?.*$/g, ''),
                store: store,
                cache: cache,
                createNode: createNode,
                createNodeId: createNodeId,
                reporter: reporter
              });
            }

            return null;
          }
        };
      }
    };

    for (var _fieldName in typeFields) {
      _loop(_fieldName);
    }

    if (Object.keys(typeResolver).length) {
      resolvers[_typeName] = typeResolver;
    }
  }

  if (Object.keys(resolvers).length) {
    createResolvers(resolvers);
  }
};