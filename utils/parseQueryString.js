"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.parseQueryString = parseQueryString;
exports.parseQueryStringAsJson = parseQueryStringAsJson;

var _toArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toArray"));

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function parseQueryString(qs) {
  var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '&';
  if (!qs || qs.length == 0) return new Map();
  return new Map(qs.split(delimiter).map(function (item) {
    var _item$split$map = item.split('=').map(function (part) {
      return decodeURIComponent(part.trim());
    }),
        _item$split$map2 = (0, _toArray2.default)(_item$split$map),
        key = _item$split$map2[0],
        value = _item$split$map2.slice(1);

    return [key, value.join('=')];
  }));
}

function parseQueryStringAsJson() {
  var qs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '&';
  var qsMap = parseQueryString(qs, delimiter);
  var qsMapIterator = qsMap[Symbol.iterator]();
  var qsJSON = {};

  var _iterator = _createForOfIteratorHelper(qsMapIterator),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var item = _step.value;
      var keyJSON = item[0];
      var value = item[1];
      qsJSON[keyJSON] = value;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return qsJSON;
}