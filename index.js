"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.typeName = exports.fieldName = exports.linkResolver = exports.registerLinkResolver = exports.getDocumentIndexFromCursor = exports.getCursorFromDocumentIndex = exports.getCookies = exports.PrismicLink = exports.withPreview = exports.WrapPage = exports.PreviewPage = void 0;

var _PreviewPage = _interopRequireDefault(require("./components/PreviewPage"));

exports.PreviewPage = _PreviewPage.default;

var _WrapPage = require("./components/WrapPage");

exports.WrapPage = _WrapPage.WrapPage;

var _withPreview = require("./components/withPreview");

exports.withPreview = _withPreview.withPreview;

var _utils = require("./utils");

exports.PrismicLink = _utils.PrismicLink;
exports.getCookies = _utils.getCookies;
exports.getCursorFromDocumentIndex = _utils.getCursorFromDocumentIndex;
exports.getDocumentIndexFromCursor = _utils.getDocumentIndexFromCursor;
exports.registerLinkResolver = _utils.registerLinkResolver;
exports.linkResolver = _utils.linkResolver;
exports.fieldName = _utils.fieldName;
exports.typeName = _utils.typeName;