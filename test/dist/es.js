/******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _xhrHook = __webpack_require__(1);

Object.defineProperty(exports, "hook", {
  enumerable: true,
  get: function get() {
    return _xhrHook.hook;
  }
});
Object.defineProperty(exports, "unHook", {
  enumerable: true,
  get: function get() {
    return _xhrHook.unHook;
  }
});

var _xhrProxy = __webpack_require__(3);

Object.defineProperty(exports, "proxy", {
  enumerable: true,
  get: function get() {
    return _xhrProxy.proxy;
  }
});
Object.defineProperty(exports, "unProxy", {
  enumerable: true,
  get: function get() {
    return _xhrProxy.unProxy;
  }
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.configEvent = configEvent;
exports.hook = hook;
exports.unHook = unHook;
/*
 * author: wendux
 * email: 824783146@qq.com
 * source code: https://github.com/wendux/Ajax-hook
 */

// Save original XMLHttpRequest as _rxhr
var realXhr = "_rxhr";

var events = exports.events = ['load', 'loadend', 'timeout', 'error', 'readystatechange', 'abort'];

function configEvent(event, xhrProxy) {
  var e = {};
  for (var attr in event) {
    e[attr] = event[attr];
  } // xhrProxy instead
  e.target = e.currentTarget = xhrProxy;
  return e;
}

function hook(proxy, win) {
  win = win || window;
  // Avoid double hookAjax
  win[realXhr] = win[realXhr] || win.XMLHttpRequest;

  win.XMLHttpRequest = function () {

    // We shouldn't hookAjax XMLHttpRequest.prototype because we can't
    // guarantee that all attributes are on the prototype。
    // Instead, hooking XMLHttpRequest instance can avoid this problem.

    var xhr = new win[realXhr]();

    // Generate all callbacks(eg. onload) are enumerable (not undefined).
    for (var i = 0; i < events.length; ++i) {
      if (xhr[events[i]] === undefined) xhr[events[i]] = null;
    }

    for (var attr in xhr) {
      var type = "";
      try {
        type = _typeof(xhr[attr]); // May cause exception on some browser
      } catch (e) {}
      if (type === "function") {
        // hookAjax methods of xhr, such as `open`、`send` ...
        this[attr] = hookFunction(attr);
      } else {
        Object.defineProperty(this, attr, {
          get: getterFactory(attr),
          set: setterFactory(attr),
          enumerable: true
        });
      }
    }
    var that = this;
    xhr.getProxy = function () {
      return that;
    };
    this.xhr = xhr;
  };

  Object.assign(win.XMLHttpRequest, { UNSENT: 0, OPENED: 1, HEADERS_RECEIVED: 2, LOADING: 3, DONE: 4 });

  // Generate getter for attributes of xhr
  function getterFactory(attr) {
    return function () {
      var v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
      var attrGetterHook = (proxy[attr] || {})["getter"];
      return attrGetterHook && attrGetterHook(v, this) || v;
    };
  }

  // Generate setter for attributes of xhr; by this we have an opportunity
  // to hookAjax event callbacks （eg: `onload`） of xhr;
  function setterFactory(attr) {
    return function (v) {
      var xhr = this.xhr;
      var that = this;
      var hook = proxy[attr];
      // hookAjax  event callbacks such as `onload`、`onreadystatechange`...
      if (attr.substring(0, 2) === 'on') {
        that[attr + "_"] = v;
        xhr[attr] = function (e) {
          e = configEvent(e, that);
          var ret = proxy[attr] && proxy[attr].call(that, xhr, e);
          ret || v.call(that, e);
        };
      } else {
        //If the attribute isn't writable, generate proxy attribute
        var attrSetterHook = (hook || {})["setter"];
        v = attrSetterHook && attrSetterHook(v, that) || v;
        this[attr + "_"] = v;
        try {
          // Not all attributes of xhr are writable(setter may undefined).
          xhr[attr] = v;
        } catch (e) {}
      }
    };
  }

  // Hook methods of xhr.
  function hookFunction(fun) {
    return function () {
      var args = [].slice.call(arguments);
      if (proxy[fun]) {
        var ret = proxy[fun].call(this, args, this.xhr);
        // If the proxy return value exists, return it directly,
        // otherwise call the function of xhr.
        if (ret) return ret;
      }
      return this.xhr[fun].apply(this.xhr, args);
    };
  }

  // Return the real XMLHttpRequest
  return win[realXhr];
}

function unHook(win) {
  win = win || window;
  if (win[realXhr]) win.XMLHttpRequest = win[realXhr];
  win[realXhr] = undefined;
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.testProxy = testProxy;
exports.testHook = testHook;

var _index = __webpack_require__(0);

function testJquery(url) {
    window['jQuery'].get(url).done(function (d) {
        console.log(d);
    }).fail(function (e) {
        console.log('hi world');
    });
}

function testProxy() {
    testJquery('https://aa/');
    testJquery('https://bb/');
    testJquery(location.href);
}

function testHook() {
    $.get().done(function (d) {
        console.log(d.substr(0, 30) + "...");
        //use original XMLHttpRequest
        console.log("unhook");
        (0, _index.unHook)();
        $.get().done(function (d) {
            console.log(d.substr(0, 10));
        });
    });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = proxy;
exports.unProxy = unProxy;

var _xhrHook = __webpack_require__(1);

var eventLoad = _xhrHook.events[0],
    eventLoadEnd = _xhrHook.events[1],
    eventTimeout = _xhrHook.events[2],
    eventError = _xhrHook.events[3],
    eventReadyStateChange = _xhrHook.events[4],
    eventAbort = _xhrHook.events[5]; /*
                                      * author: wendux
                                      * email: 824783146@qq.com
                                      * source code: https://github.com/wendux/Ajax-hook
                                      */

var singleton,
    prototype = 'prototype';

function proxy(proxy) {
  if (singleton) throw "Proxy already exists";
  return singleton = new Proxy(proxy);
}

function unProxy(win) {
  singleton = null;
  (0, _xhrHook.unHook)(win);
}

function trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

function getEventTarget(xhr) {
  return xhr.watcher || (xhr.watcher = document.createElement('a'));
}

function triggerListener(xhr, name) {
  var xhrProxy = xhr.getProxy();
  var callback = 'on' + name + '_';
  var event = (0, _xhrHook.configEvent)({ type: name }, xhrProxy);
  xhrProxy[callback] && xhrProxy[callback](event);
  var evt;
  if (typeof Event === 'function') {
    evt = new Event(name, { bubbles: false });
  } else {
    // https://stackoverflow.com/questions/27176983/dispatchevent-not-working-in-ie11
    evt = document.createEvent('Event');
    evt.initEvent(name, false, true);
  }
  getEventTarget(xhr).dispatchEvent(evt);
}

function Handler(xhr) {
  this.xhr = xhr;
  this.xhrProxy = xhr.getProxy();
}

Handler[prototype] = Object.create({
  resolve: function resolve(response) {
    var xhrProxy = this.xhrProxy;
    var xhr = this.xhr;
    xhrProxy.readyState = 4;
    xhr.resHeader = response.headers;
    xhrProxy.response = xhrProxy.responseText = response.response;
    xhrProxy.statusText = response.statusText;
    xhrProxy.status = response.status;
    triggerListener(xhr, eventReadyStateChange);
    triggerListener(xhr, eventLoad);
    triggerListener(xhr, eventLoadEnd);
  },
  reject: function reject(error) {
    this.xhrProxy.status = 0;
    triggerListener(this.xhr, error.type);
    triggerListener(this.xhr, eventLoadEnd);
  }
});

function makeHandler(next) {
  function sub(xhr) {
    Handler.call(this, xhr);
  }

  sub[prototype] = Object.create(Handler[prototype]);
  sub[prototype].next = next;
  return sub;
}

var RequestHandler = makeHandler(function (rq) {
  var xhr = this.xhr;
  rq = rq || xhr.config;
  xhr.withCredentials = rq.withCredentials;
  xhr.open(rq.method, rq.url, rq.async !== false, rq.user, rq.password);
  for (var key in rq.headers) {
    xhr.setRequestHeader(key, rq.headers[key]);
  }
  xhr.send(rq.body);
});

var ResponseHandler = makeHandler(function (response) {
  this.resolve(response);
});

var ErrorHandler = makeHandler(function (error) {
  this.reject(error);
});

function Proxy(proxy, win) {
  var onRequest = proxy.onRequest,
      onResponse = proxy.onResponse,
      onError = proxy.onError;

  function handleResponse(xhr, xhrProxy) {
    var handler = new ResponseHandler(xhr);
    var ret = {
      response: xhrProxy.response,
      status: xhrProxy.status,
      statusText: xhrProxy.statusText,
      config: xhr.config,
      headers: xhr.resHeader || xhr.getAllResponseHeaders().split('\r\n').reduce(function (ob, str) {
        if (str === "") return ob;
        var m = str.split(":");
        ob[m.shift()] = trim(m.join(':'));
        return ob;
      }, {})
    };
    if (!onResponse) return handler.resolve(ret);
    onResponse(ret, handler);
  }

  function onerror(xhr, xhrProxy, error, errorType) {
    var handler = new ErrorHandler(xhr);
    error = { config: xhr.config, error: error, type: errorType };
    if (onError) {
      onError(error, handler);
    } else {
      handler.next(error);
    }
  }

  function preventXhrProxyCallback() {
    return true;
  }

  function errorCallback(errorType) {
    return function (xhr, e) {
      onerror(xhr, this, e, errorType);
      return true;
    };
  }

  function stateChangeCallback(xhr, xhrProxy) {
    if (xhr.readyState === 4 && xhr.status !== 0) {
      handleResponse(xhr, xhrProxy);
    } else if (xhr.readyState !== 4) {
      triggerListener(xhr, eventReadyStateChange);
    }
    return true;
  }

  return (0, _xhrHook.hook)({
    onload: preventXhrProxyCallback,
    onloadend: preventXhrProxyCallback,
    onerror: errorCallback(eventError),
    ontimeout: errorCallback(eventTimeout),
    onabort: errorCallback(eventAbort),
    onreadystatechange: function onreadystatechange(xhr) {
      return stateChangeCallback(xhr, this);
    },
    open: function open(args, xhr) {
      var _this = this;
      var config = xhr.config = { headers: {} };
      config.method = args[0];
      config.url = args[1];
      config.async = args[2];
      config.user = args[3];
      config.password = args[4];
      config.xhr = xhr;
      var evName = 'on' + eventReadyStateChange;
      if (!xhr[evName]) {
        xhr[evName] = function () {
          return stateChangeCallback(xhr, _this);
        };
      }

      // 如果有请求拦截器，则在调用onRequest后再打开链接。因为onRequest最佳调用时机是在send前，
      // 所以我们在send拦截函数中再手动调用open，因此返回true阻止xhr.open调用。
      //
      // 如果没有请求拦截器，则不用阻断xhr.open调用
      if (onRequest) return true;
    },
    send: function send(args, xhr) {
      var config = xhr.config;
      config.withCredentials = xhr.withCredentials;
      config.body = args[0];
      if (onRequest) {
        // In 'onRequest', we may call XHR's event handler, such as `xhr.onload`.
        // However, XHR's event handler may not be set until xhr.send is called in
        // the user's code, so we use `setTimeout` to avoid this situation
        var req = function req() {
          onRequest(config, new RequestHandler(xhr));
        };
        config.async === false ? req() : setTimeout(req);
        return true;
      }
    },
    setRequestHeader: function setRequestHeader(args, xhr) {
      // Collect request headers
      xhr.config.headers[args[0].toLowerCase()] = args[1];
      return true;
    },
    addEventListener: function addEventListener(args, xhr) {
      var _this = this;
      if (_xhrHook.events.indexOf(args[0]) !== -1) {
        var handler = args[1];
        getEventTarget(xhr).addEventListener(args[0], function (e) {
          var event = (0, _xhrHook.configEvent)(e, _this);
          event.type = args[0];
          event.isTrusted = true;
          handler.call(_this, event);
        });
        return true;
      }
    },
    getAllResponseHeaders: function getAllResponseHeaders(_, xhr) {
      var headers = xhr.resHeader;
      if (headers) {
        var header = "";
        for (var key in headers) {
          header += key + ': ' + headers[key] + '\r\n';
        }
        return header;
      }
    },
    getResponseHeader: function getResponseHeader(args, xhr) {
      var headers = xhr.resHeader;
      if (headers) {
        return headers[(args[0] || '').toLowerCase()];
      }
    }
  }, win);
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(0);

var _test = __webpack_require__(2);

(0, _index.proxy)({
    onRequest: function onRequest(config, handler) {
        if (config.url === 'https://aa/') {
            handler.resolve({
                config: config,
                status: 200,
                headers: { 'content-type': 'text/text' },
                response: 'hi world'

            });
        } else {
            handler.next(config);
        }
    },
    onError: function onError(err, handler) {
        if (err.config.url === 'https://bb/') {
            handler.resolve({
                config: err.config,
                status: 200,
                headers: { 'content-type': 'text/text' },
                response: 'hi world'
            });
        } else {
            handler.next(err);
        }
    },
    onResponse: function onResponse(response, handler) {
        if (response.config.url === location.href) {
            handler.reject({
                config: response.config,
                type: 'error'
            });
        } else {
            handler.next(response);
        }
    }
});

(0, _test.testProxy)();

(0, _index.proxy)({
    onRequest: function onRequest(config, handler) {
        console.log(config.url);
        handler.next(config);
    },
    onError: function onError(err, handler) {
        console.log(err.type);
        handler.next(err);
    },
    onResponse: function onResponse(response, handler) {
        console.log(response.response);
        handler.next(response);
    }
});

/***/ })
/******/ ]);