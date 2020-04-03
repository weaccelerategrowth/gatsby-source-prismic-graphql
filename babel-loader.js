"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var babelLoader = require("babel-loader");

var _require = require("gatsby/dist/utils/babel-loader-helpers"),
    getCustomOptions = _require.getCustomOptions,
    mergeConfigItemOptions = _require.mergeConfigItemOptions;

var _require2 = require("gatsby/dist/utils/babel-loader-helpers"),
    poHelper = _require2.prepareOptions;

var prepareOptions = function prepareOptions(babel) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var resolve = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : require.resolve;
  var items = poHelper(babel, options, resolve);

  if (items.length > 2) {
    items[3].splice(0, 1, babel.createConfigItem([require.resolve('./babel-plugin-remove-graphql-queries.js')], {
      type: 'plugin'
    }));
  }

  return items;
};
/**
 * Gatsby's custom loader for webpack & babel
 *
 * Gatsby allows sites to either use our Babel setup (the default)
 * or to add a .babelrc to take control.
 *
 * Our default setup is defined in the fallbackPlugins/fallbackPresets arrays
 * below.
 *
 * After using either the fallback or user supplied setup, we add on a handful
 * of required plugins and finally merge in any presets/plugins supplied
 * by Gatsby plugins.
 *
 * You can find documentation for the custom loader here: https://babeljs.io/docs/en/next/babel-core.html#loadpartialconfig
 */


module.exports = babelLoader.custom(function (babel) {
  var toReturn = {
    // Passed the loader options.
    customOptions: function customOptions(_ref) {
      var _ref$stage = _ref.stage,
          stage = _ref$stage === void 0 ? "test" : _ref$stage,
          options = (0, _objectWithoutProperties2.default)(_ref, ["stage"]);
      return {
        custom: {
          stage: stage
        },
        loader: (0, _objectSpread2.default)({
          cacheDirectory: true,
          sourceType: "unambiguous"
        }, getCustomOptions(stage), options)
      };
    },
    // Passed Babel's 'PartialConfig' object.
    config: function config(partialConfig, _ref2) {
      var customOptions = _ref2.customOptions;
      var options = partialConfig.options;

      var _prepareOptions = prepareOptions(babel, customOptions),
          _prepareOptions2 = (0, _slicedToArray2.default)(_prepareOptions, 5),
          reduxPresets = _prepareOptions2[0],
          reduxPlugins = _prepareOptions2[1],
          requiredPresets = _prepareOptions2[2],
          requiredPlugins = _prepareOptions2[3],
          fallbackPresets = _prepareOptions2[4]; // If there is no filesystem babel config present, add our fallback
      // presets/plugins.


      if (!partialConfig.hasFilesystemConfig()) {
        options = (0, _objectSpread2.default)({}, options, {
          plugins: requiredPlugins,
          presets: [].concat((0, _toConsumableArray2.default)(fallbackPresets), (0, _toConsumableArray2.default)(requiredPresets))
        });
      } else {
        // With a babelrc present, only add our required plugins/presets
        options = (0, _objectSpread2.default)({}, options, {
          plugins: [].concat((0, _toConsumableArray2.default)(options.plugins), (0, _toConsumableArray2.default)(requiredPlugins)),
          presets: [].concat((0, _toConsumableArray2.default)(options.presets), (0, _toConsumableArray2.default)(requiredPresets))
        });
      } // Merge in presets/plugins added from gatsby plugins.


      reduxPresets.forEach(function (preset) {
        options.presets = mergeConfigItemOptions({
          items: options.presets,
          itemToMerge: preset,
          type: "preset",
          babel: babel
        });
      });
      reduxPlugins.forEach(function (plugin) {
        options.plugins = mergeConfigItemOptions({
          items: options.plugins,
          itemToMerge: plugin,
          type: "plugin",
          babel: babel
        });
      });
      return options;
    }
  };
  return toReturn;
});