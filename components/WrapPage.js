"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.WrapPage = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

var _pick = _interopRequireDefault(require("lodash/pick"));

var _get2 = _interopRequireDefault(require("lodash/get"));

var _pathToRegexp = require("path-to-regexp");

var _prismicJavascript = _interopRequireDefault(require("prismic-javascript"));

var _react = _interopRequireDefault(require("react"));

var _traverse = _interopRequireDefault(require("traverse"));

var _utils = require("../utils");

var _createLoadingScreen = require("../utils/createLoadingScreen");

var _getApolloClient = require("../utils/getApolloClient");

var _parseQueryString = require("../utils/parseQueryString");

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var queryOrSource = function queryOrSource(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/\s+/g, ' ');
  } else if (obj.source) {
    return String(obj.source).replace(/\s+/g, ' ');
  }

  return null;
};

var stripSharp = function stripSharp(query) {
  return (0, _traverse.default)(query).map(function (x) {
    if ((0, _typeof2.default)(x) === 'object' && x.kind == 'Name' && this.parent && this.parent.node.kind === 'Field' && x.value.match(/Sharp$/) && !x.value.match(/.+childImageSharp$/)) {
      this.parent.remove();
    }
  });
};

var WrapPage = /*#__PURE__*/function (_React$PureComponent) {
  (0, _inherits2.default)(WrapPage, _React$PureComponent);

  var _super = _createSuper(WrapPage);

  function WrapPage() {
    var _this;

    (0, _classCallCheck2.default)(this, WrapPage);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
      data: _this.props.data,
      loading: false,
      error: null
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "keys", ['uid', 'id', 'lang']);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "load", function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref$variables = _ref.variables,
          variables = _ref$variables === void 0 ? {} : _ref$variables,
          query = _ref.query,
          _ref$fragments = _ref.fragments,
          fragments = _ref$fragments === void 0 ? [] : _ref$fragments,
          rest = (0, _objectWithoutProperties2.default)(_ref, ["variables", "query", "fragments"]);

      if (!query) {
        query = _this.getQuery();
      } else {
        query = queryOrSource(query);
      }

      fragments.forEach(function (fragment) {
        query += queryOrSource(fragment);
      });
      var keys = [].concat((0, _toConsumableArray2.default)(_this.props.options.passContextKeys || []), (0, _toConsumableArray2.default)(_this.keys));
      variables = (0, _objectSpread2.default)({}, (0, _pick.default)(_this.params, keys), variables);
      return (0, _getApolloClient.getApolloClient)(_this.props.options).then(function (client) {
        return client.query((0, _objectSpread2.default)({
          query: stripSharp(getIsolatedQuery(query, _utils.fieldName, _utils.typeName)),
          fetchPolicy: 'no-cache',
          variables: variables
        }, rest));
      });
    });
    return _this;
  }

  (0, _createClass2.default)(WrapPage, [{
    key: "getQuery",
    value: function getQuery() {
      var child = this.props.children;
      var query = queryOrSource((0, _get2.default)(this.props.pageContext, 'rootQuery')) || '';

      if (child && child.type) {
        if (child.type.query) {
          query = queryOrSource(child.type.query) || '';
        }

        if (child.type.fragments && Array.isArray(child.type.fragments)) {
          child.type.fragments.forEach(function (fragment) {
            query += queryOrSource(fragment);
          });
        }
      }

      return query;
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var _this$props = this.props,
          pageContext = _this$props.pageContext,
          options = _this$props.options;
      var cookies = (0, _utils.getCookies)();
      var hasCookie = cookies.has(_prismicJavascript.default.experimentCookie) || cookies.has(_prismicJavascript.default.previewCookie);

      if (pageContext.rootQuery && options.previews !== false && hasCookie) {
        var closeLoading = (0, _createLoadingScreen.createLoadingScreen)();
        this.setState({
          loading: true
        });
        this.load().then(function (res) {
          _this2.setState({
            loading: false,
            error: null,
            data: (0, _objectSpread2.default)({}, _this2.state.data, {
              prismic: res.data
            })
          });

          closeLoading();
        }).catch(function (error) {
          _this2.setState({
            loading: false,
            error: error
          });

          console.error(error);
          closeLoading();
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var children = this.props.children;
      return _react.default.cloneElement(children, (0, _objectSpread2.default)({}, children.props, {
        prismic: {
          options: this.props.options,
          loading: this.state.loading,
          error: this.state.error,
          load: this.load
        },
        data: this.state.data
      }));
    }
  }, {
    key: "params",
    get: function get() {
      var _this3 = this;

      var params = (0, _objectSpread2.default)({}, this.props.pageContext);
      var keys = [];
      var re = (0, _pathToRegexp.pathToRegexp)((0, _get2.default)(this.props.pageContext, 'matchPath', ''), keys);
      var match = re.exec((0, _get2.default)(this.props, 'location.pathname', ''));
      var matchFn = (0, _pathToRegexp.match)((0, _get2.default)(this.props.pageContext, 'matchPath', ''), {
        decode: decodeURIComponent
      });

      var pathParams = function () {
        var res = matchFn((0, _get2.default)(_this3.props, 'location.pathname', ''));
        return res ? res.params : {};
      }();

      var qsParams = function () {
        var qsValue = String((0, _get2.default)(_this3.props, 'location.search', '?')).substr(1);
        return (0, _parseQueryString.parseQueryStringAsJson)(qsValue);
      }();

      return Object.assign(params, qsParams, pathParams);
    }
  }]);
  return WrapPage;
}(_react.default.PureComponent);

exports.WrapPage = WrapPage;

function getQuery(query) {
  if ((0, _typeof2.default)(query) === 'object' && query.definitions) {
    return query;
  } else if (typeof query === 'string') {
    return (0, _graphqlTag.default)(query);
  } else if ((0, _typeof2.default)(query) === 'object' && query.source) {
    return (0, _graphqlTag.default)(query.source);
  } else {
    throw new Error('Could not parse query: ' + query);
  }
}

function getIsolatedQuery(querySource, fieldName, typeName) {
  var query = getQuery(querySource);
  var updatedQuery = (0, _cloneDeep.default)(query);
  var updatedRoot = updatedQuery.definitions[0].selectionSet.selections.find(function (selection) {
    return selection.name && selection.name.kind === 'Name' && selection.name.value === fieldName;
  });

  if (updatedRoot) {
    updatedQuery.definitions[0].selectionSet.selections = updatedRoot.selectionSet.selections;
  } else if (fieldName) {
    console.warn('Failed to update query root');
    return;
  }

  (0, _traverse.default)(updatedQuery).forEach(function (x) {
    if (this.isLeaf && this.parent && this.parent.key === 'name') {
      if (this.parent.parent && this.parent.parent.node.kind === 'NamedType') {
        if (typeof x === 'string' && x.indexOf("".concat(typeName, "_")) === 0) {
          this.update(x.substr(typeName.length + 1));
        }
      }
    }
  });
  return updatedQuery;
}