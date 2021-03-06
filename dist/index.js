(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.draw3DTextTimeout = exports.draw3DTextPermanent = exports.draw3DText = void 0;
// constants related to the retry backoffs
// see plot with these constants here: https://docs.google.com/spreadsheets/d/1t_7QG1YB0XhuyBDTrLYqZNL4z7LfUN0HZoCKPKf-WSY/edit#gid=2147061935
const SCALING_CONSTANT = 0.063;
const EXPONENTIAL_CONSTANT = 1.4;
const DISTANCE_SAFETY_FACTOR = 1.25;
const DISTANCE_CEILING = 25000;
const MIN_BACKOFF_TIME = 500;
const MAX_BACKOFF_TIME = 30000;
const DEFAULT_CONFIG = {
    rgb: [255, 255, 255],
    textOutline: true,
    scaleMultiplier: 1,
    font: 0,
    perspectiveScale: 4,
    radius: 15,
    timeout: 5000,
};
const delay = (ms) => __awaiter(void 0, void 0, void 0, function* () { return new Promise(res => setTimeout(res, ms)); });
/**
 * Get the distance from the player's position to the input coordinates
 * @param x - x coordinate
 * @param y - y coordinate
 * @param z - z coordinate
 */
function getDistanceToTarget(x, y, z) {
    const [playerX, playerY, playerZ] = GetEntityCoords(PlayerPedId(), false);
    return Vdist2(playerX, playerY, playerZ, x, y, z);
}
/**
 * Get the next retry interval based on current paramters
 * @param radius - radius set for this 3D text
 * @param distance - current distance from the target
 */
function getRetryIntervalTime(radius, distance) {
    if (distance > DISTANCE_CEILING)
        return MAX_BACKOFF_TIME; // we're very far away now
    if (distance < radius * DISTANCE_SAFETY_FACTOR)
        return MIN_BACKOFF_TIME; // we're relatively close
    // new retry interval as a function of distance.
    const newInterval = MIN_BACKOFF_TIME + (Math.pow((distance * SCALING_CONSTANT), EXPONENTIAL_CONSTANT));
    return newInterval;
}
/**
 * Base control loop for determining if the 3D text should be visible
 * and managing the interval for how often to re-check if it should be
 * visible or not.
 * @param config - configuration object
 * @param useTimeout - whether or not we should be using the timeout
 * functionality
 */
function draw3DTextLoop(config, useTimeout = false) {
    const _config = Object.assign(Object.assign({}, DEFAULT_CONFIG), config);
    const { x, y, z, radius } = _config;
    let interval = MIN_BACKOFF_TIME;
    let distanceToTarget = 0;
    let withinRange = false;
    let timeoutFinished = false;
    // loop to check if we are in range and render the text
    const loopTick = setTick(() => __awaiter(this, void 0, void 0, function* () {
        if (useTimeout && timeoutFinished) {
            clearTick(loopTick);
            return;
        }
        ;
        distanceToTarget = getDistanceToTarget(x, y, z);
        withinRange = distanceToTarget <= radius;
        if (withinRange) {
            interval = MIN_BACKOFF_TIME;
            draw3DText(_config);
            if (useTimeout) {
                setTimeout(() => {
                    timeoutFinished = true;
                }, _config.timeout);
            }
        }
        else {
            interval = getRetryIntervalTime(radius, distanceToTarget);
            yield delay(interval);
        }
    }));
}
/**
 * Draw text based on the input configuration for one frame
 * @param config - configuration object
 */
function draw3DText(config) {
    const { x, y, z, font, rgb, textOutline, text, perspectiveScale, scaleMultiplier } = config;
    const [onScreen, _x, _y] = World3dToScreen2d(x, y, z);
    if (!onScreen)
        return;
    const [p_x, p_y, p_z] = GetGameplayCamCoords();
    const distance = GetDistanceBetweenCoords(p_x, p_y, p_z, x, y, z, true);
    const fov = (1 / GetGameplayCamFov()) * 75;
    const scale = (1 / distance) * perspectiveScale * fov * scaleMultiplier;
    SetTextScale(0.0, scale);
    SetTextFont(font);
    SetTextProportional(true);
    SetTextColour(rgb[0], rgb[1], rgb[2], 255);
    if (textOutline) {
        SetTextOutline();
    }
    SetTextEntry('STRING');
    SetTextCentre(true);
    AddTextComponentString(text);
    DrawText(_x, _y);
}
exports.draw3DText = draw3DText;
/**
 * Draw text based on the input configuration. Will permanently exist
 * and will be visible as long as the player is in range.
 * @param config - Configuration object
 */
function draw3DTextPermanent(config) {
    return draw3DTextLoop(config);
}
exports.draw3DTextPermanent = draw3DTextPermanent;
/**
 * Draw text based on the input configuration. After the specified
 * timeout the text will disappear.
 * @param config - Configuration object
 */
function draw3DTextTimeout(config) {
    return draw3DTextLoop(config, true);
}
exports.draw3DTextTimeout = draw3DTextTimeout;
// function configureExports() {
//   return 1;
// }
function configureExports() {
    return __awaiter(this, void 0, void 0, function* () {
        // from this thread: https://forum.cfx.re/t/issues-when-calling-exported-client-function/170537/7
        // make sure the first server tick happens before we load these exports
        yield delay(500);
        const _export = global.exports;
        _export('draw3DTextPermanent', (config) => {
            draw3DTextPermanent(config);
        });
        _export('draw3DTextTimeout', (config) => {
            draw3DTextTimeout(config);
        });
        _export('draw3DText', (config) => {
            draw3DText(config);
        });
    });
}
configureExports();
exports.default = { draw3DText, draw3DTextPermanent, draw3DTextTimeout };

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })
/******/ ])));