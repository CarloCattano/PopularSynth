/*!
 * xebra.js - v1.2.2
 * Compiled on Wed, 07 Jun 2017 17:54:18 GMT
 * 
 * xebra.js is licensed under the MIT license
 * 
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Xebra = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash.defaults");

var _lodash2 = _interopRequireDefault(_lodash);

var _events = require("events");

var _url = require("url");

var _constants = require("./constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Communication = function (_EventEmitter) {
	_inherits(Communication, _EventEmitter);

	function Communication(options) {
		_classCallCheck(this, Communication);

		var _this = _possibleConstructorReturn(this, (Communication.__proto__ || Object.getPrototypeOf(Communication)).call(this));

		_this._options = (0, _lodash2.default)(options, {
			secure: false,
			reconnect: true,
			reconnect_attempts: 5,
			reconnect_timeout: 1000,
			auto_connect: true
		});

		_this._ws = null;
		_this._forcedDisconnect = false;
		_this._currentReconnects = 0;
		_this._connectedInitially = false;
		_this._connectionState = _constants.CONNECTION_STATES.INIT;

		if (_this._options.auto_connect) _this.connect();
		return _this;
	}

	/**
  * @readonly
  * @see XebraCommunicator.CONNECTION_STATES
  */


	_createClass(Communication, [{
		key: "_connect",


		/**
   * Connect to XebraServer
   * @private
   */
		value: function _connect() {

			this._ws = new WebSocket(this.url);
			this._ws.onclose = this._onClose.bind(this);
			this._ws.onmessage = this._onMessage.bind(this);
			this._ws.onopen = this._onOpen.bind(this);
		}

		/**
   * Handle onClose event
   * @private
   */

	}, {
		key: "_onClose",
		value: function _onClose() {
			this._ws = null;

			// connection never worked
			if (!this._connectedInitially) {
				this._connectionState = _constants.CONNECTION_STATES.CONNECTION_FAIL;
				this.emit("connection_change", this.connectionState);
				return;
			}

			// user forced disconnect
			if (this._forcedDisconnect) {
				this._connectionState = _constants.CONNECTION_STATES.DISCONNECTED;
				this.emit("connection_change", this.connectionState);
				return;
			}

			if (this._connectedInitially && this._options.reconnect) {
				this._connectionState = _constants.CONNECTION_STATES.RECONNECTING;
				this.emit("connection_change", this.connectionState);

				if (this._currentReconnects++ < this._options.reconnect_attempts) {
					setTimeout(this._reconnect.bind(this), this._options.reconnect_timeout);
				} else {
					this._connectionState = _constants.CONNECTION_STATES.DISCONNECTED;
					this.emit("connection_change", this.connectionState);
				}
			}
		}

		/**
   * Handle incoming Message
   * @private
   */

	}, {
		key: "_onMessage",
		value: function _onMessage(msg) {
			this.emit("message", JSON.parse(msg.data));
		}

		/**
   * Handle connection open event
   * @private
   */

	}, {
		key: "_onOpen",
		value: function _onOpen() {
			this._connectedInitially = true;
			this._currentReconnects = 0;

			this._connectionState = _constants.CONNECTION_STATES.CONNECTED;
			this.emit("connection_change", this.connectionState);
		}

		/**
   * Reconnect
   * @private
   */

	}, {
		key: "_reconnect",
		value: function _reconnect() {
			this._connect();
		}

		/**
   * Close the WebSocket connection
   */

	}, {
		key: "close",
		value: function close() {
			if (this._ws) {
				this._forcedDisconnect = true;
				this._ws.close();
				this._ws = null;
			}
		}

		/**
   * Init the WebSocket connection
   */

	}, {
		key: "connect",
		value: function connect() {
			if (!this._ws) {
				this._connectionState = _constants.CONNECTION_STATES.CONNECTING;
				this.emit("connection_change", this.connectionState);
				this._connect();
			}
		}

		/**
   * Send data to XebraServer
   * @param {object} data - XebraMessage data
   */

	}, {
		key: "send",
		value: function send(data) {
			this._ws.send(JSON.stringify(data));
		}
	}, {
		key: "connectionState",
		get: function get() {
			return this._connectionState;
		}

		/**
   * @readonly
   */

	}, {
		key: "host",
		get: function get() {
			return this._options.hostname;
		}

		/**
   * @readonly
   */

	}, {
		key: "port",
		get: function get() {
			return this._options.port;
		}

		/**
   * @readonly
   */

	}, {
		key: "url",
		get: function get() {
			return (0, _url.format)({
				hostname: this._options.hostname,
				port: this._options.port,
				protocol: this._options.secure ? "wss" : "ws",
				slashes: true
			});
		}
	}]);

	return Communication;
}(_events.EventEmitter);

exports.default = Communication;
module.exports = exports["default"];
},{"./constants.js":2,"events":139,"lodash.defaults":4,"url":149}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Connection States of XebraCommunicator
 * @static
 * @constant
 * @memberof XebraCommunicator
 * @type {object}
 * @property {number} INIT
 * @property {number} CONNECTING
 * @property {number} CONNECTED
 * @property {number} CONNECTION_FAIL
 * @property {number} RECONNECTING
 * @property {number} DISCONNECTED
 */
var CONNECTION_STATES = exports.CONNECTION_STATES = Object.freeze({
  INIT: 1,
  CONNECTING: 2,
  CONNECTED: 4,
  CONNECTION_FAIL: 8,
  RECONNECTING: 16,
  DISCONNECTED: 32
});

/**
 * Xebra Protocol Version
 * @static
 * @constant
 * @memberof XebraCommunicator
 * @type {string}
 */
var XEBRA_VERSION = exports.XEBRA_VERSION = "00.01.07";

/**
 * Xebra Protocol Messages
 * @static
 * @constant
 * @memberof XebraCommunicator
 * @type {object}
 * @property {string} ADD_NODE
 * @property {string} ADD_PARAM
 * @property {string} DELETE_NODE
 * @property {string} HANDLE_RESOURCE_DATA
 * @property {string} HANDLE_RESOURCE_INFO
 * @property {string} INIT_NODE
 * @property {string} MODIFY_NODE
 * @property {string} RESYNC
 * @property {string} SET_UUID
 * @property {string} STATEDUMP
 */
var XEBRA_MESSAGES = exports.XEBRA_MESSAGES = {
  ADD_NODE: "add_node",
  ADD_PARAM: "add_param",
  CHANNEL_MESSAGE: "channel_message",
  CLIENT_PARAM_CHANGE: "client_param_change",
  CONNECTION_CHANGE: "connection_change",
  DELETE_NODE: "delete_node",
  HANDLE_RESOURCE_DATA: "handle_resource_data",
  HANDLE_RESOURCE_INFO: "handle_resource_info",
  INIT_NODE: "init_node",
  MODIFY_NODE: "modify_node",
  RESYNC: "resync",
  SET_UUID: "set_uuid",
  STATEDUMP: "statedump"
};
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _MIRA_FCT_LOOKUP;

var _communicator = require("./communicator.js");

var _communicator2 = _interopRequireDefault(_communicator);

var _events = require("events");

var _constants = require("./constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MIRA_FCT_LOOKUP = (_MIRA_FCT_LOOKUP = {}, _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.ADD_NODE, "_addNode"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.ADD_PARAM, "_addParam"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.CHANNEL_MESSAGE, "_channelMessage"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.DELETE_NODE, "_deleteNode"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.HANDLE_RESOURCE_DATA, "_handleResourceData"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.HANDLE_RESOURCE_INFO, "_handleResourceInfo"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.INIT_NODE, "_initNode"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.MODIFY_NODE, "_modifyNode"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.RESYNC, "_resync"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.SET_UUID, "_setXebraUuid"), _defineProperty(_MIRA_FCT_LOOKUP, _constants.XEBRA_MESSAGES.STATEDUMP, "_statedump"), _MIRA_FCT_LOOKUP);

function maxEquivalentForJS(anything) {
	var mustBeFlatArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	var equivalent = void 0;
	switch (typeof anything === "undefined" ? "undefined" : _typeof(anything)) {
		case "undefined":
			throw new Error("Cannot convert undefined to a Max type");

		case "number":
			if (isNaN(anything)) throw new Error("Cannot convert NaN to a Max type");
			equivalent = anything;
			break;

		case "boolean":
			equivalent = anything ? 1 : 0;
			break;

		case "string":
			if (anything.length === 0) throw new Error("Cannot convert empty string to Max type");
			equivalent = anything;
			break;

		case "symbol":
			throw new Error("Cannot convert symbol to Max type");

		case "object":
			if (anything === null) throw new Error("Cannot convert null to Max type");
			if (Array.isArray(anything)) {
				equivalent = convertArrayToMaxList(anything, mustBeFlatArray);
			} else {
				equivalent = convertObjectToMaxDict(anything);
			}
			break;

		default:
			throw new Error("Could not convert message to Max message");
	}

	return equivalent;
}

function convertArrayToMaxList(array) {
	var mustBeFlat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	if (mustBeFlat) {
		if (array.find(function (elt) {
			return (typeof elt === "undefined" ? "undefined" : _typeof(elt)) === "object";
		}) !== undefined) {
			throw new Error("Xebra can only send a flat array of numbers, strings and booleans to a Max list");
		}
	}

	return array.map(function (elt) {
		return maxEquivalentForJS(elt);
	});
}

function convertObjectToMaxDict(obj) {
	var retObj = {};
	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			retObj[k] = maxEquivalentForJS(obj[k]);
		}
	}

	return retObj;
}

function generateUuid() {
	var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0;
		var v = c === "x" ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
	return id;
}

/**
 * @class
 */

var XebraCommunicator = function (_EventEmitter) {
	_inherits(XebraCommunicator, _EventEmitter);

	/**
  * @param {object} options - TODO
  */
	function XebraCommunicator(options) {
		_classCallCheck(this, XebraCommunicator);

		var _this = _possibleConstructorReturn(this, (XebraCommunicator.__proto__ || Object.getPrototypeOf(XebraCommunicator)).call(this));

		_this._supportedObjects = options.supported_objects || {};

		_this._uuid = generateUuid();
		_this._xebraUuid = null; // server assigned UUID
		_this._name = (options.name || "MiraWeb") + "-" + _this._uuid.slice(0, 6);
		_this._sequenceNumber = 0;

		_this._communicator = new _communicator2.default(options);
		_this._communicator.on("message", _this._dispatchMessage.bind(_this));

		// Connection States
		_this._communicator.on("connection_change", _this._onConnectionChange.bind(_this));
		return _this;
	}

	/**
  * @type {number}
  * @readonly
  * @see XebraCommunicator.CONNECTION_STATES
  */


	_createClass(XebraCommunicator, [{
		key: "_onConnectionChange",


		/**
   * Handle connection change event of the underlying connection
   * @private
   */
		value: function _onConnectionChange(status) {
			switch (status) {
				case _constants.CONNECTION_STATES.CONNECTED:
					if (!this._xebraUuid) {
						this._sendMessage("register", {
							version: _constants.XEBRA_VERSION,
							supported_objects: this._supportedObjects
						});
					} else {
						// resync somehow doesn't work.. For now forcing it
						// this._sendMessage("resync", {
						// 	sequence : this._sequenceNumber
						// });
						this._resync({}, true);
					}
					break;
				case _constants.CONNECTION_STATES.RECONNECTING:
				case _constants.CONNECTION_STATES.DISCONNECTED:
					this._xebraUuid = null;
					break;
				case _constants.CONNECTION_STATES.INIT:
				case _constants.CONNECTION_STATES.CONNECTING:
				case _constants.CONNECTION_STATES.CONNECTION_FAIL:
				default:
					// Nothing specific to do here
					break;
			}

			/**
    * Connection change event
    * @event XebraCommunicator.connection_change
    * @param {number} status - The new connection status
    * @see XebraCommunicator.CONNECTION_STATES
    */
			this.emit(_constants.XEBRA_MESSAGES.CONNECTION_CHANGE, status);
		}

		/**
   * Request statedump from Max
   * @private
   */

	}, {
		key: "_requestStateDump",
		value: function _requestStateDump() {
			this._sendMessage(_constants.XEBRA_MESSAGES.STATEDUMP);
		}

		/**
   * Send Xebra message to Max
   * @private
   * @param {string} message - The message type
   * @param {object} payload - The message payload
   */

	}, {
		key: "_sendMessage",
		value: function _sendMessage(msg) {
			var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			this._communicator.send({
				message: msg,
				payload: payload
			});
		}

		/**
   * Handle and dispatch received message(s)
   * @private
   * @param {object|Array.object} data - the received message(s)
   */

	}, {
		key: "_dispatchMessage",
		value: function _dispatchMessage(data) {
			if (Array.isArray(data)) {
				data.forEach(function (msg) {
					this._handleMessage(msg);
				}.bind(this));
			} else {
				this._handleMessage(data);
			}
		}

		/**
   * Handle received message
   * @private
   * @param {object} data - the received message
   */

	}, {
		key: "_handleMessage",
		value: function _handleMessage(data) {
			// ignore echoed messages
			if (data.payload && data.payload.source === this._xebraUuid) return null;

			var fct = this[MIRA_FCT_LOOKUP[data.message]];
			if (fct) return fct.bind(this)(data);
			return null;
		}

		/**
   * @private
   * @param {object} data - the message data
   */

	}, {
		key: "_addNode",
		value: function _addNode(data) {
			this._sequenceNumber = data.payload.sequence;
			/**
    * ObjectNode add event
    * @event XebraCommunicator.add_node
    * @param {object} payload - The ObjectNode add payload
    */
			this.emit(_constants.XEBRA_MESSAGES.ADD_NODE, data.payload);
		}

		/**
   * @private
   * @param {object} data - the message data
   */

	}, {
		key: "_addParam",
		value: function _addParam(data) {
			this._sequenceNumber = data.payload.sequence;
			/**
    * ParamNode add event
    * @event XebraCommunicator.add_param
    * @param {object} payload - The ParamNode add payload
    */
			this.emit(_constants.XEBRA_MESSAGES.ADD_PARAM, data.payload);
		}
	}, {
		key: "_channelMessage",
		value: function _channelMessage(data) {
			this.emit(_constants.XEBRA_MESSAGES.CHANNEL_MESSAGE, data.payload.channel, data.payload.message);
		}

		/**
   * @private
   * @param {object} data - the message data
   */

	}, {
		key: "_deleteNode",
		value: function _deleteNode(data) {
			this._sequenceNumber = data.payload.sequence;
			/**
    * Delete ObjectNode event
    * @event XebraCommunicator.delete_node
    * @param {object} payload - The ObjectNode delete payload
    */
			this.emit(_constants.XEBRA_MESSAGES.DELETE_NODE, data.payload);
		}

		/**
   * Handle incoming resource data
   * @private
   * @param {object} data - the resource data
   */

	}, {
		key: "_handleResourceData",
		value: function _handleResourceData(data) {
			var j = void 0;
			try {
				j = JSON.parse(data.payload.request);
				data.payload.request = j;
			} catch (e) {
				console.log("JSON parsing error", e);
				console.log(data.payload.request);
				return;
			}
			/**
    * Handle resource data event
    * @event XebraCommunicator.handle_resource_data
    * @param {object} payload - The Resource payload
    */
			this.emit(_constants.XEBRA_MESSAGES.HANDLE_RESOURCE_DATA, data.payload);
		}

		/**
   * Handle incoming resource info
   * @private
   * @param {object} data - the resource info
   */

	}, {
		key: "_handleResourceInfo",
		value: function _handleResourceInfo(data) {
			var j = void 0;
			try {
				j = JSON.parse(data.payload.request);
				data.payload.request = j;
			} catch (e) {
				console.log("JSON parsing error", e);
				console.log(data.payload.request);
				return;
			}
			/**
    * Handle resource info event
    * @event XebraCommunicator.handle_resource_info
    * @param {object} payload - The Resource info payload
    */
			this.emit(_constants.XEBRA_MESSAGES.HANDLE_RESOURCE_INFO, data.payload);
		}

		/**
   * Handle incoming init node data
   * @private
   * @param {object} data - the node data
   */

	}, {
		key: "_initNode",
		value: function _initNode(data) {
			/**
    * Init Node event
    * @event XebraCommunicator.init_node
    * @param {object} payload - The Node init payload
    */
			this.emit(_constants.XEBRA_MESSAGES.INIT_NODE, data.payload);
		}

		/**
   * Handle incoming node modification data
   */

	}, {
		key: "_modifyNode",
		value: function _modifyNode(data) {
			// ignore modification messages if the were actually sent by ourselves
			if (data.payload.source === this._xebraUuid) return;
			/**
    * Modify Node event
    * @event XebraCommunicator.modify_node
    * @param {object} payload - The Node modify payload
    */
			this.emit(_constants.XEBRA_MESSAGES.MODIFY_NODE, data.payload);
		}

		/**
   * Handle resync method call
   * @param {object} data - The Resync data
   * @param {boolean} [force=false] - Force a resync
   */

	}, {
		key: "_resync",
		value: function _resync(data) {
			var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			if (force || data.payload.sequence !== this._sequenceNumber) {
				this.emit(_constants.XEBRA_MESSAGES.RESYNC);
				this._requestStateDump();
			}

			if (data && data.payload && data.payload.sequence) this._sequenceNumber = data.payload.sequence;
		}

		/**
   * Handle UUID settings assigned by Xebra Server
   * @private
   * @param {object} data - Meta Info data
   *
   */

	}, {
		key: "_setXebraUuid",
		value: function _setXebraUuid(data) {
			this._xebraUuid = data.payload.uuid;
			this.emit(_constants.XEBRA_MESSAGES.CLIENT_PARAM_CHANGE, "uuid", this._xebraUuid);
			this._requestStateDump();
			this._sendMessage("set_client_params", {
				xebraUuid: this._xebraUuid,
				name: this._name,
				uid: this._uuid
			});
		}

		/**
   * Handle received statedump
   * @param {object} data - The statedump data
   */

	}, {
		key: "_statedump",
		value: function _statedump(data) {
			/**
    * Statedump Event
    * @event XebraCommunicator.statedump
    * @param {object} payload - The statedump payload
    */
			this.emit(_constants.XEBRA_MESSAGES.STATEDUMP, data.payload);
		}

		/**
   * Connect the Communicator to Xebra Server
   */

	}, {
		key: "connect",
		value: function connect() {
			this._communicator.connect();
		}

		/**
   * Close the connection to the XebraServer
   */

	}, {
		key: "close",
		value: function close() {
			this._communicator.close();
		}

		/**
   * Request ResourceData from XebraServer
   * @param {object} data - Object describing/identifying the needed resource data
   */

	}, {
		key: "getResourceData",
		value: function getResourceData(data) {
			this._sendMessage("get_resource_data", data);
		}

		/**
   * Request ResourceInfo from XebraServer
   * @param {object} data - Object describing/identifying the needed resource info
   */

	}, {
		key: "getResourceInfo",
		value: function getResourceInfo(data) {
			this._sendMessage("get_resource_info", data);
		}

		/**
   * Send a channel message to the Xebra.Server. This will be forwarded to all mira.channel
   * objects with the named channel
   * @param {string} channel - The channel on which to send the message
   * @param {number|string|array|object} message - The data to send
   * @throws Will throw an error if the message cannot be coerced to a Max message
   */

	}, {
		key: "sendChannelMessage",
		value: function sendChannelMessage(channel, message) {
			var payload = maxEquivalentForJS(message, true);

			if (payload !== undefined) {
				var data = {
					channel: channel,
					name: this._name,
					payload: payload
				};
				this._sendMessage("channel_message", data);
			}
		}

		/**
   * Send a Modification Message to XebraServer
   * @param {object} data - The modification message payload
   */

	}, {
		key: "sendModifyMessage",
		value: function sendModifyMessage(data) {
			data.source = this._xebraUuid;
			data.timestamp = Date.now();
			this._sendMessage("modify_node", data);
		}
	}, {
		key: "connectionState",
		get: function get() {
			return this._communicator.connectionState;
		}

		/**
   * @type {string}
   */

	}, {
		key: "name",
		get: function get() {
			return this._name;
		},
		set: function set(name) {
			this._name = name;
			// sjt --- See #87, we shouldn't be setting client params if we haven't received a server-assigned id
			if (this._xebraUuid !== null) {
				this._sendMessage("set_client_params", {
					xebraUuid: this._xebraUuid,
					name: this._name,
					uid: this._uuid
				});
			}
			this.emit(_constants.XEBRA_MESSAGES.CLIENT_PARAM_CHANGE, "name", this._name);
		}

		/**
   * @type {string}
   * @readonly
   */

	}, {
		key: "uuid",
		get: function get() {
			return this._uuid;
		}

		/**
   * @type {string}
   * @readonly
   */

	}, {
		key: "host",
		get: function get() {
			return this._communicator.host;
		}

		/**
   * @type {number}
   * @readonly
   */

	}, {
		key: "port",
		get: function get() {
			return this._communicator.port;
		}

		/**
   * @type {string}
   * @readonly
   */

	}, {
		key: "wsUrl",
		get: function get() {
			return this._communicator.url;
		}

		/**
   * @type {string}
   * @readonly
   */

	}, {
		key: "xebraUuid",
		get: function get() {
			return this._xebraUuid;
		}
	}]);

	return XebraCommunicator;
}(_events.EventEmitter);

XebraCommunicator.XEBRA_MESSAGES = _constants.XEBRA_MESSAGES;
XebraCommunicator.CONNECTION_STATES = _constants.CONNECTION_STATES;
XebraCommunicator.XEBRA_VERSION = _constants.XEBRA_VERSION;

exports.default = XebraCommunicator;
module.exports = exports["default"];
},{"./communicator.js":1,"./constants.js":2,"events":139}],4:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Used by `_.defaults` to customize its `_.assignIn` use.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to assign.
 * @param {Object} object The parent object of `objValue`.
 * @returns {*} Returns the value to assign.
 */
function assignInDefaults(objValue, srcValue, key, object) {
  if (objValue === undefined ||
      (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
    return srcValue;
  }
  return objValue;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * This method is like `_.assignIn` except that it accepts `customizer`
 * which is invoked to produce the assigned values. If `customizer` returns
 * `undefined`, assignment is handled by the method instead. The `customizer`
 * is invoked with five arguments: (objValue, srcValue, key, object, source).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias extendWith
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @see _.assignWith
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   return _.isUndefined(objValue) ? srcValue : objValue;
 * }
 *
 * var defaults = _.partialRight(_.assignInWith, customizer);
 *
 * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
  copyObject(source, keysIn(source), object, customizer);
});

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var defaults = baseRest(function(args) {
  args.push(undefined, assignInDefaults);
  return apply(assignInWith, undefined, args);
});

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = defaults;

},{}],5:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":22}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":23}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":24}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":25}],9:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":26}],10:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":27}],11:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":28}],12:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":29}],13:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/freeze"), __esModule: true };
},{"core-js/library/fn/object/freeze":30}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":31}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":32}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":33}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":34}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/values"), __esModule: true };
},{"core-js/library/fn/object/values":35}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":36}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":37}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":38}],22:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":53,"../../modules/es6.array.from":118,"../../modules/es6.string.iterator":131}],23:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":116,"../modules/es6.string.iterator":131,"../modules/web.dom.iterable":138}],24:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
},{"../modules/core.is-iterable":117,"../modules/es6.string.iterator":131,"../modules/web.dom.iterable":138}],25:[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":53}],26:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
module.exports = require('../modules/_core').Map;
},{"../modules/_core":53,"../modules/es6.map":120,"../modules/es6.object.to-string":129,"../modules/es6.string.iterator":131,"../modules/es7.map.to-json":133,"../modules/web.dom.iterable":138}],27:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;
},{"../../modules/_core":53,"../../modules/es6.object.assign":121}],28:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};
},{"../../modules/_core":53,"../../modules/es6.object.create":122}],29:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":53,"../../modules/es6.object.define-property":123}],30:[function(require,module,exports){
require('../../modules/es6.object.freeze');
module.exports = require('../../modules/_core').Object.freeze;
},{"../../modules/_core":53,"../../modules/es6.object.freeze":124}],31:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key){
  return $Object.getOwnPropertyDescriptor(it, key);
};
},{"../../modules/_core":53,"../../modules/es6.object.get-own-property-descriptor":125}],32:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;
},{"../../modules/_core":53,"../../modules/es6.object.get-prototype-of":126}],33:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;
},{"../../modules/_core":53,"../../modules/es6.object.keys":127}],34:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;
},{"../../modules/_core":53,"../../modules/es6.object.set-prototype-of":128}],35:[function(require,module,exports){
require('../../modules/es7.object.values');
module.exports = require('../../modules/_core').Object.values;
},{"../../modules/_core":53,"../../modules/es7.object.values":134}],36:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
module.exports = require('../modules/_core').Set;
},{"../modules/_core":53,"../modules/es6.object.to-string":129,"../modules/es6.set":130,"../modules/es6.string.iterator":131,"../modules/es7.set.to-json":135,"../modules/web.dom.iterable":138}],37:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":53,"../../modules/es6.object.to-string":129,"../../modules/es6.symbol":132,"../../modules/es7.symbol.async-iterator":136,"../../modules/es7.symbol.observable":137}],38:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');
},{"../../modules/_wks-ext":113,"../../modules/es6.string.iterator":131,"../../modules/web.dom.iterable":138}],39:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],40:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],41:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],42:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":72}],43:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":63}],44:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":105,"./_to-iobject":107,"./_to-length":108}],45:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./_ctx')
  , IObject  = require('./_iobject')
  , toObject = require('./_to-object')
  , toLength = require('./_to-length')
  , asc      = require('./_array-species-create');
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./_array-species-create":47,"./_ctx":55,"./_iobject":69,"./_to-length":108,"./_to-object":109}],46:[function(require,module,exports){
var isObject = require('./_is-object')
  , isArray  = require('./_is-array')
  , SPECIES  = require('./_wks')('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"./_is-array":71,"./_is-object":72,"./_wks":114}],47:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"./_array-species-constructor":46}],48:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":49,"./_wks":114}],49:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],50:[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":41,"./_ctx":55,"./_defined":56,"./_descriptors":57,"./_for-of":63,"./_iter-define":75,"./_iter-step":77,"./_meta":81,"./_object-create":83,"./_object-dp":84,"./_redefine-all":97,"./_set-species":100}],51:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof')
  , from    = require('./_array-from-iterable');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"./_array-from-iterable":43,"./_classof":48}],52:[function(require,module,exports){
'use strict';
var global         = require('./_global')
  , $export        = require('./_export')
  , meta           = require('./_meta')
  , fails          = require('./_fails')
  , hide           = require('./_hide')
  , redefineAll    = require('./_redefine-all')
  , forOf          = require('./_for-of')
  , anInstance     = require('./_an-instance')
  , isObject       = require('./_is-object')
  , setToStringTag = require('./_set-to-string-tag')
  , dP             = require('./_object-dp').f
  , each           = require('./_array-methods')(0)
  , DESCRIPTORS    = require('./_descriptors');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function(target, iterable){
      anInstance(target, C, NAME, '_c');
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        anInstance(this, C, KEY);
        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    if('size' in proto)dP(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":41,"./_array-methods":45,"./_descriptors":57,"./_export":61,"./_fails":62,"./_for-of":63,"./_global":64,"./_hide":66,"./_is-object":72,"./_meta":81,"./_object-dp":84,"./_redefine-all":97,"./_set-to-string-tag":101}],53:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],54:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":84,"./_property-desc":96}],55:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":39}],56:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],57:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":62}],58:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":64,"./_is-object":72}],59:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],60:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":89,"./_object-keys":92,"./_object-pie":93}],61:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":53,"./_ctx":55,"./_global":64,"./_hide":66}],62:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],63:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":42,"./_ctx":55,"./_is-array-iter":70,"./_iter-call":73,"./_to-length":108,"./core.get-iterator-method":115}],64:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],65:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],66:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":57,"./_object-dp":84,"./_property-desc":96}],67:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":64}],68:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":57,"./_dom-create":58,"./_fails":62}],69:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":49}],70:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":78,"./_wks":114}],71:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":49}],72:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],73:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":42}],74:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":66,"./_object-create":83,"./_property-desc":96,"./_set-to-string-tag":101,"./_wks":114}],75:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":61,"./_has":65,"./_hide":66,"./_iter-create":74,"./_iterators":78,"./_library":80,"./_object-gpo":90,"./_redefine":98,"./_set-to-string-tag":101,"./_wks":114}],76:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":114}],77:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],78:[function(require,module,exports){
module.exports = {};
},{}],79:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":92,"./_to-iobject":107}],80:[function(require,module,exports){
module.exports = true;
},{}],81:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":62,"./_has":65,"./_is-object":72,"./_object-dp":84,"./_uid":111}],82:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":62,"./_iobject":69,"./_object-gops":89,"./_object-keys":92,"./_object-pie":93,"./_to-object":109}],83:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":42,"./_dom-create":58,"./_enum-bug-keys":59,"./_html":67,"./_object-dps":85,"./_shared-key":102}],84:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":42,"./_descriptors":57,"./_ie8-dom-define":68,"./_to-primitive":110}],85:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":42,"./_descriptors":57,"./_object-dp":84,"./_object-keys":92}],86:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":57,"./_has":65,"./_ie8-dom-define":68,"./_object-pie":93,"./_property-desc":96,"./_to-iobject":107,"./_to-primitive":110}],87:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":88,"./_to-iobject":107}],88:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":59,"./_object-keys-internal":91}],89:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],90:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":65,"./_shared-key":102,"./_to-object":109}],91:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":44,"./_has":65,"./_shared-key":102,"./_to-iobject":107}],92:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":59,"./_object-keys-internal":91}],93:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],94:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":53,"./_export":61,"./_fails":62}],95:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject')
  , isEnum    = require('./_object-pie').f;
module.exports = function(isEntries){
  return function(it){
    var O      = toIObject(it)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , result = []
      , key;
    while(length > i)if(isEnum.call(O, key = keys[i++])){
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};
},{"./_object-keys":92,"./_object-pie":93,"./_to-iobject":107}],96:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],97:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":66}],98:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":66}],99:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":42,"./_ctx":55,"./_is-object":72,"./_object-gopd":86}],100:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":53,"./_descriptors":57,"./_global":64,"./_object-dp":84,"./_wks":114}],101:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":65,"./_object-dp":84,"./_wks":114}],102:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":103,"./_uid":111}],103:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":64}],104:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":56,"./_to-integer":106}],105:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":106}],106:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],107:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":56,"./_iobject":69}],108:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":106}],109:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":56}],110:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":72}],111:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],112:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":53,"./_global":64,"./_library":80,"./_object-dp":84,"./_wks-ext":113}],113:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":114}],114:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":64,"./_shared":103,"./_uid":111}],115:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":48,"./_core":53,"./_iterators":78,"./_wks":114}],116:[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":42,"./_core":53,"./core.get-iterator-method":115}],117:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').isIterable = function(it){
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || Iterators.hasOwnProperty(classof(O));
};
},{"./_classof":48,"./_core":53,"./_iterators":78,"./_wks":114}],118:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":54,"./_ctx":55,"./_export":61,"./_is-array-iter":70,"./_iter-call":73,"./_iter-detect":76,"./_to-length":108,"./_to-object":109,"./core.get-iterator-method":115}],119:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":40,"./_iter-define":75,"./_iter-step":77,"./_iterators":78,"./_to-iobject":107}],120:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.1 Map Objects
module.exports = require('./_collection')('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./_collection":52,"./_collection-strong":50}],121:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":61,"./_object-assign":82}],122:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":61,"./_object-create":83}],123:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":57,"./_export":61,"./_object-dp":84}],124:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});
},{"./_is-object":72,"./_meta":81,"./_object-sap":94}],125:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = require('./_to-iobject')
  , $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./_object-gopd":86,"./_object-sap":94,"./_to-iobject":107}],126:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":90,"./_object-sap":94,"./_to-object":109}],127:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object')
  , $keys    = require('./_object-keys');

require('./_object-sap')('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./_object-keys":92,"./_object-sap":94,"./_to-object":109}],128:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":61,"./_set-proto":99}],129:[function(require,module,exports){

},{}],130:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.2 Set Objects
module.exports = require('./_collection')('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./_collection":52,"./_collection-strong":50}],131:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":75,"./_string-at":104}],132:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":42,"./_descriptors":57,"./_enum-keys":60,"./_export":61,"./_fails":62,"./_global":64,"./_has":65,"./_hide":66,"./_is-array":71,"./_keyof":79,"./_library":80,"./_meta":81,"./_object-create":83,"./_object-dp":84,"./_object-gopd":86,"./_object-gopn":88,"./_object-gopn-ext":87,"./_object-gops":89,"./_object-keys":92,"./_object-pie":93,"./_property-desc":96,"./_redefine":98,"./_set-to-string-tag":101,"./_shared":103,"./_to-iobject":107,"./_to-primitive":110,"./_uid":111,"./_wks":114,"./_wks-define":112,"./_wks-ext":113}],133:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Map', {toJSON: require('./_collection-to-json')('Map')});
},{"./_collection-to-json":51,"./_export":61}],134:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export')
  , $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it){
    return $values(it);
  }
});
},{"./_export":61,"./_object-to-array":95}],135:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Set', {toJSON: require('./_collection-to-json')('Set')});
},{"./_collection-to-json":51,"./_export":61}],136:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":112}],137:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":112}],138:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":64,"./_hide":66,"./_iterators":78,"./_wks":114,"./es6.array.iterator":119}],139:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],140:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var Symbol = root.Symbol,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property identifiers to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, props) {
  object = Object(object);
  return basePickBy(object, props, function(value, key) {
    return key in object;
  });
}

/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property identifiers to pick from.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, props, predicate) {
  var index = -1,
      length = props.length,
      result = {};

  while (++index < length) {
    var key = props[index],
        value = object[key];

    if (predicate(value, key)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [props] The property identifiers to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = baseRest(function(object, props) {
  return object == null ? {} : basePick(object, arrayMap(baseFlatten(props, 1), toKey));
});

module.exports = pick;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],141:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    Set = getNative(root, 'Set'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
  return new Set(values);
};

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each
 * element is kept.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length)
    ? baseUniq(array)
    : [];
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = uniq;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],142:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":143}],143:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],144:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],145:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],146:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],147:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":145,"./encode":146}],148:[function(require,module,exports){
/* global window, exports, define */

!function() {
    'use strict'

    var re = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    }

    function sprintf(key) {
        // `arguments` is not an array, but should be fine for this call
        return sprintf_format(sprintf_parse(key), arguments)
    }

    function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []))
    }

    function sprintf_format(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, arg, output = '', i, k, match, pad, pad_character, pad_length, is_positive, sign
        for (i = 0; i < tree_length; i++) {
            if (typeof parse_tree[i] === 'string') {
                output += parse_tree[i]
            }
            else if (Array.isArray(parse_tree[i])) {
                match = parse_tree[i] // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor]
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf('[sprintf] property "%s" does not exist', match[2][k]))
                        }
                        arg = arg[match[2][k]]
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]]
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++]
                }

                if (re.not_type.test(match[8]) && re.not_primitive.test(match[8]) && arg instanceof Function) {
                    arg = arg()
                }

                if (re.numeric_arg.test(match[8]) && (typeof arg !== 'number' && isNaN(arg))) {
                    throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg))
                }

                if (re.number.test(match[8])) {
                    is_positive = arg >= 0
                }

                switch (match[8]) {
                    case 'b':
                        arg = parseInt(arg, 10).toString(2)
                        break
                    case 'c':
                        arg = String.fromCharCode(parseInt(arg, 10))
                        break
                    case 'd':
                    case 'i':
                        arg = parseInt(arg, 10)
                        break
                    case 'j':
                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
                        break
                    case 'e':
                        arg = match[7] ? parseFloat(arg).toExponential(match[7]) : parseFloat(arg).toExponential()
                        break
                    case 'f':
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
                        break
                    case 'g':
                        arg = match[7] ? String(Number(arg.toPrecision(match[7]))) : parseFloat(arg)
                        break
                    case 'o':
                        arg = (parseInt(arg, 10) >>> 0).toString(8)
                        break
                    case 's':
                        arg = String(arg)
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 't':
                        arg = String(!!arg)
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 'T':
                        arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase()
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 'u':
                        arg = parseInt(arg, 10) >>> 0
                        break
                    case 'v':
                        arg = arg.valueOf()
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 'x':
                        arg = (parseInt(arg, 10) >>> 0).toString(16)
                        break
                    case 'X':
                        arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase()
                        break
                }
                if (re.json.test(match[8])) {
                    output += arg
                }
                else {
                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
                        sign = is_positive ? '+' : '-'
                        arg = arg.toString().replace(re.sign, '')
                    }
                    else {
                        sign = ''
                    }
                    pad_character = match[4] ? match[4] === '0' ? '0' : match[4].charAt(1) : ' '
                    pad_length = match[6] - (sign + arg).length
                    pad = match[6] ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : ''
                    output += match[5] ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg)
                }
            }
        }
        return output
    }

    var sprintf_cache = Object.create(null)

    function sprintf_parse(fmt) {
        if (sprintf_cache[fmt]) {
            return sprintf_cache[fmt]
        }

        var _fmt = fmt, match, parse_tree = [], arg_names = 0
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree.push(match[0])
            }
            else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree.push('%')
            }
            else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1
                    var field_list = [], replacement_field = match[2], field_match = []
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1])
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            }
                            else {
                                throw new SyntaxError('[sprintf] failed to parse named argument key')
                            }
                        }
                    }
                    else {
                        throw new SyntaxError('[sprintf] failed to parse named argument key')
                    }
                    match[2] = field_list
                }
                else {
                    arg_names |= 2
                }
                if (arg_names === 3) {
                    throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
                }
                parse_tree.push(match)
            }
            else {
                throw new SyntaxError('[sprintf] unexpected placeholder')
            }
            _fmt = _fmt.substring(match[0].length)
        }
        return sprintf_cache[fmt] = parse_tree
    }

    /**
     * export to either browser or node.js
     */
    /* eslint-disable quote-props */
    if (typeof exports !== 'undefined') {
        exports['sprintf'] = sprintf
        exports['vsprintf'] = vsprintf
    }
    if (typeof window !== 'undefined') {
        window['sprintf'] = sprintf
        window['vsprintf'] = vsprintf

        if (typeof define === 'function' && define['amd']) {
            define(function() {
                return {
                    'sprintf': sprintf,
                    'vsprintf': vsprintf
                }
            })
        }
    }
    /* eslint-enable quote-props */
}()

},{}],149:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":150,"punycode":144,"querystring":147}],150:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],151:[function(require,module,exports){
"use strict";

var _iterator3 = require("babel-runtime/core-js/symbol/iterator");

var _iterator4 = _interopRequireDefault2(_iterator3);

var _symbol3 = require("babel-runtime/core-js/symbol");

var _symbol4 = _interopRequireDefault2(_symbol3);

var _typeof2 = typeof _symbol4.default === "function" && typeof _iterator4.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol4.default === "function" && obj.constructor === _symbol4.default && obj !== _symbol4.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _values = require("babel-runtime/core-js/object/values");

var _values2 = _interopRequireDefault(_values);

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _freeze = require("babel-runtime/core-js/object/freeze");

var _freeze2 = _interopRequireDefault(_freeze);

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.VERSION = exports.SUPPORTED_OBJECTS = exports.CONNECTION_STATES = exports.State = undefined;

var _typeof = typeof _symbol2.default === "function" && _typeof2(_iterator2.default) === "symbol" ? function (obj) {
	return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
	return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _constants = require("./lib/constants.js");

(0, _keys2.default)(_constants).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	(0, _defineProperty2.default)(exports, key, {
		enumerable: true,
		get: function get() {
			return _constants[key];
		}
	});
});

var _objectList = require("./lib/objectList.js");

var _resource = require("./lib/resource.js");

var _events = require("events");

var _lodash = require("lodash.pick");

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require("lodash.uniq");

var _lodash4 = _interopRequireDefault(_lodash3);

var _xebraCommunicator = require("xebra-communicator");

var _xebraCommunicator2 = _interopRequireDefault(_xebraCommunicator);

var _index = require("./nodes/index.js");

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof2(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof2(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

function isString(v) {
	return typeof v === "string" || v instanceof String;
}

var RESOURCE_REQUEST_DOMAIN = (0, _freeze2.default)({
	INFO: "info",
	DATA: "data"
});

/**
 * List of objects available for synchronization in Xebra. Use this or a subset of this when setting the
 * supported_objects option in Xebra.State.
 *
 * @static
 * @constant
 * @memberof Xebra
 * @type {string[]}
 */
var SUPPORTED_OBJECTS = (0, _freeze2.default)((0, _from2.default)((0, _values2.default)(_objectList.OBJECTS)));

/**
 * @namespace Xebra
 */

// /////////////////////
// Type Definitions   //
// /////////////////////

/**
 * A string or number based id
 * @typedef {number|string} NodeId
 * @memberof Xebra
 */

/**
 * @typedef {number[]} PatchingRect
 * @memberof Xebra
 * @desc Patching Rectangle attribute consisting of 4 Numbers (x, y, width, height)
 */

/**
 * @typedef {number|string|string[]|number[]|object} ParamValueType
 * @memberof Xebra
 * @desc Generic parameter value type
 */

/**
 * @typedef {number[]} Color
 * @memberof Xebra
 * @desc Color attribute consisting of 4 Numbers in the format of [r, g, b, a]
 */

// /////////////////////


/**
 * @desc State instances wrap the state sync and connection with the Max backend.
 * @class
 */

var State = function (_EventEmitter) {
	_inherits(State, _EventEmitter);

	/**
  * @param  {Object} options
  * @param  {Boolean} options.auto_connect=true - Whether to autoconnect on startup
  * @param  {String} options.hostname - The host of the Xebra backend
  * @param  {Number} options.port - The port of the Xebra backend
  * @param  {Boolean} options.secure=false - Whether to use a secure WS connection or not (ws vs wss)
  * @param  {Boolean} options.reconnect=true - Whether to try auto-reconnecting after the connection closed
  * @param  {Number} options.reconnect_attempts=5 - The amount of retries before considering it a failure
  * @param  {Number} options.reconnect_timeout=1000 - Timeout between reconnects in ms
  * @param  {string[]} options.supported_objects - List of objects to include in the state
  */
	function State(options) {
		_classCallCheck(this, State);

		var _this = _possibleConstructorReturn(this, (State.__proto__ || (0, _getPrototypeOf2.default)(State)).call(this));

		_this._onConnectionChange = function (status) {
			/**
    * This event is emitted when the state of the web socket connection to the Max patch (ConnectionState) changes.
    * @event State.connection_changed
    */
			_this.emit("connection_changed", status);
		};

		_this._onGetResourceInfo = function (resource) {
			_this._makeResourceRequest(resource.objectContext, resource, "info");
		};

		_this._onNodeChange = function (object, param) {
			if (object.type === _objectList.OBJECTS.MIRA_FRAME) {
				/**
     * This event is emitted when a parameter of a frame is changed. This change can come from Max or when the value
     * of the parameter is set directly.
     * @event State.frame_changed
     * @param {FrameNode}				frame     The changed frame
     * @param {ParamNode}		param      The parameter node
     */
				if (object.isReady) _this.emit("frame_changed", object, param);
			}
			if (object.type === _objectList.OBJECTS.PATCHER) {
				/**
     * This event is emitted when a parameter of a patcher is changed. This change can come from Max or when the
     * value of the parameter is set directly.
     * @event State.patcher_changed
     * @param {PatcherNode}    patcher    The changed patcher
     * @param {ParamNode}  param      The parameter node
     */
				if (object.isReady) _this.emit("patcher_changed", object, param);
			}

			/**
    * This event is emitted when a parameter of an object is changed. This change can come from Max or when the value
    * of the parameter is set directly.
    * @event State.object_changed
    * @param {ObjectNode} object     The changed object
    * @param {ParamNode}  param      The parameter node
    */
			if (object.isReady) _this.emit("object_changed", object, param);
		};

		_this._onNodeInitialized = function (object) {
			_this.emit("object_added", object);
		};

		_this._onFrameInitialized = function (frame) {
			_this.emit("frame_added", frame);
		};

		_this._onPatcherInitialized = function (patcher) {
			_this.emit("patcher_added", patcher);
		};

		_this._onModifiyNodeChange = function (object, param) {
			var val = param.value;
			if (!Array.isArray(val)) val = [val];

			_this._communicator.sendModifyMessage({
				id: param.id,
				sequence: param.sequence,
				creation_sequence: param.creationSequence,
				values: val,
				types: param.types
			});
		};

		_this._addNode = function (data) {

			var node = (0, _index.getInstanceForObjectType)(data.id, data.type, data.sequence, data.parent_id);

			// patchers and frames are handled differently as we have to put them into the correct
			// list other than just adding them to the statetree.
			if (node.type === _objectList.OBJECTS.PATCHER) {
				_this._addPatcher(node);

				/**
     * This event is emitted when a patcher is added in Max.
     * @event State.patcher_added
     * @param {PatcherNode} object The added patcher
     */
				if (node.isReady) {
					_this.emit("patcher_added", node);
				} else {
					node.once("initialized", _this._onPatcherInitialized);
				}
			} else if (data.type === _objectList.OBJECTS.MIRA_FRAME) {
				var parentPatcher = _this._getPatcher(data.parent_id);
				parentPatcher.addFrame(node);

				/**
     * This event is emitted when a frame is added in Max.
     * @event State.frame_added
     * @param {FrameNode} object The added frame
     */
				if (node.isReady) {
					_this.emit("frame_added", node);
				} else {
					node.once("initialized", _this._onFrameInitialized);
				}
			} else {
				// object node
				var _parentPatcher = _this._getPatcher(data.parent_id);
				_parentPatcher.addObject(node);

				if (node.type === _objectList.OBJECTS.MIRA_MOTION) _this._addMotion(node);
			}

			_this._doInsertNode(node);

			/**
    * This event is emitted when an object is added in Max.
    * @event State.object_added
    * @param {ObjectNode} object The added object
    */
			if (node.isReady) {
				_this.emit("object_added", node);
			} else {
				node.once("initialized", _this._onNodeInitialized);
			}
		};

		_this._addParam = function (data) {
			var parent = _this._state.get(data.parent_id);
			var param = new _index.ParamNode(data.id, data.type, data.sequence);

			_this._state.set(param.id, param);

			parent.addParam(param);
		};

		_this._channelMessage = function (channel, message) {
			/**
    * This event is emitted when a message is sent to a mira.channel object
    * @event State.channel_message_received
    * @param {String} channel The name of the channel where the message was received
    * @param {Number|String|Array<Number|String>|Object} message The message received from Max
    */
			_this.emit("channel_message_received", channel, message);
		};

		_this._clientParamChange = function (key, value) {
			/**
    * Client param change event
    * @private
    * @event State#client_param_changed
    * @param {String} key
    * @param {String} value
    */
			_this.emit("client_param_changed", key, value);
		};

		_this._deleteNode = function (data) {
			var node = _this._state.get(data.id);
			if (!node) return;

			var parentPatcher = _this._getPatcher(node.patcherId);

			// remove frame from parent patcher
			if (node.type === _objectList.OBJECTS.MIRA_FRAME) {
				if (parentPatcher) parentPatcher.removeFrame(node.id);

				/**
     * This event is emitted when a frame is removed from Max.
     * @event State.frame_removed
     * @param {FrameNode} object The removed frame
     */
				if (node.isReady) _this.emit("frame_removed", node);
			} else if (node.type === _objectList.OBJECTS.PATCHER) {

				/**
     * This event is emitted when a patcher is removed from Max.
     * @event State.patcher_removed
     * @param {PatcherNode} object The removed patcher
     */
				if (node.isReady) _this.emit("patcher_removed", node);
			} else {
				if (parentPatcher) parentPatcher.removeObject(node.id);
			}

			if (node.type === _objectList.OBJECTS.MIRA_MOTION) _this._removeMotion(node);

			_this._destroyNode(node);

			/**
    * This event is emitted when an object is removed from Max.
    * @event State.object_removed
    * @param {ObjectNode} object The removed object
    */
			if (node.isReady) _this.emit("object_removed", node);
		};

		_this._handleResourceData = function (data) {
			if (data.request) {
				var sequence = data.request.sequence;
				var resource = _this._resourceRequests.data.sequenceToResource[sequence];
				if (resource) {
					resource.handleData(data);
					delete _this._resourceRequests.data.resourceToSequence[resource.id];
					delete _this._resourceRequests.data.sequenceToResource[sequence];
				}
			}
		};

		_this._handleResourceInfo = function (data) {
			if (data.request) {
				var sequence = data.request.sequence;
				var resource = _this._resourceRequests.info.sequenceToResource[sequence];
				if (resource) {
					_this._makeResourceRequest(data.request.context, resource, "data");
					delete _this._resourceRequests.info.resourceToSequence[resource.id];
					delete _this._resourceRequests.info.sequenceToResource[sequence];
				}
			} else {
				console.log("Could not handle badly formatted resource info response", data);
			}
		};

		_this._modifyNode = function (data) {
			var node = _this._state.get(data.id);
			if (node) node.modify(data.values, data.types, data.sequence);
		};

		_this._statedump = function (data) {
			/**
    * This event is emitted when the web socket connection is persistently interrupted to the point that the xebra
    * state and Max state fall out of sync. In this case, xebra will attempt to reset and rebuild the state, which
    * fires this event. This should happen very infrequently. A state#loaded event will fire when this event fires.
    * @event State.reset
    */
			if (_this._state) {
				_this.emit("reset");
			}

			_this._resetState();

			for (var i = 0, il = data.messages.length; i < il; i++) {
				var msg = data.messages[i];
				if (msg.message === _xebraCommunicator2.default.XEBRA_MESSAGES.ADD_NODE) {
					_this._addNode(msg.payload);
				} else if (msg.message === _xebraCommunicator2.default.XEBRA_MESSAGES.ADD_PARAM) {
					_this._addParam(msg.payload);
				} else if (msg.message === _xebraCommunicator2.default.XEBRA_MESSAGES.MODIFY_NODE) {
					_this._modifyNode(msg.payload, true);
				}
			}

			/**
    * This event is emitted when the entire Max state has been loaded. At this point, all `frame_added`,
    * `object_added`, and `patcher_added` events will have fired, and all of their parameters will have been
    * loaded. This is analogous to $(document).ready() in jQuery.
    * @event State.loaded
    */
			_this._isStateLoaded = true;
			_this.emit("loaded");
		};

		var commOptions = (0, _lodash2.default)(options, ["auto_connect", "hostname", "port", "secure", "reconnect", "reconnect_attempts", "reconnect_timeout"]);
		if (!options.supported_objects) options.supported_objects = SUPPORTED_OBJECTS;

		commOptions.supported_objects = (0, _assign2.default)({}, _objectList.MANDATORY_OBJECTS);
		options.supported_objects.forEach(function (objDetails) {
			if (isString(objDetails)) {
				var params = _objectList.OBJECT_PARAMETERS[objDetails];
				if (params) {
					commOptions.supported_objects[objDetails] = params;
					return;
				}

				if (!_objectList.MANDATORY_OBJECTS.hasOwnProperty(objDetails)) {
					console.log("WARN: Unsupported or unknown object " + objDetails + ". Please use the { name : \"\"<obj_name>\", parameters: [\"param_1\", \"param_2\"] } syntax for non built-in objects.");
					return;
				}
			} else if ((typeof objDetails === "undefined" ? "undefined" : _typeof(objDetails)) === "object") {
				if (!objDetails.name || !isString(objDetails.name) || !objDetails.parameters || !Array.isArray(objDetails.parameters)) {
					console.log("WARN: Skipping object defintion '" + (0, _stringify2.default)(objDetails) + "' Please declare objects using their name or the { name : \"\"<obj_name>\", parameters: [\"param_1\", \"param_2\"] } syntax.");
					return;
				}

				// make sure that all required parameters are in place
				var _params = _objectList.DEFAULT_PARAMS.concat(objDetails.parameters);
				_params = (0, _lodash4.default)(_params);
				commOptions.supported_objects[objDetails.name] = _params;

				return;
			}

			console.log("WARN: Skipping object defintion '" + objDetails + "' Please declare objects using their name or the { name : \"\"<obj_name>\", parameters: [\"param_1\", \"param_2\"] } syntax.");
			return;
		});

		_this._communicator = new _xebraCommunicator2.default(commOptions);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.CONNECTION_CHANGE, _this._onConnectionChange);

		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.ADD_NODE, _this._addNode);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.ADD_PARAM, _this._addParam);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.CHANNEL_MESSAGE, _this._channelMessage);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.DELETE_NODE, _this._deleteNode);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.HANDLE_RESOURCE_DATA, _this._handleResourceData);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.HANDLE_RESOURCE_INFO, _this._handleResourceInfo);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.INIT_NODE, _this._modifyNode);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.MODIFY_NODE, _this._modifyNode);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.STATEDUMP, _this._statedump);
		_this._communicator.on(_xebraCommunicator2.default.XEBRA_MESSAGES.CLIENT_param_changed, _this._clientParamChange);

		_this._resourceRequests = {
			info: {
				sequence: 0,
				resourceToSequence: {},
				sequenceToResource: {}
			},
			data: {
				sequence: 0,
				resourceToSequence: {},
				sequenceToResource: {}
			}
		};

		_this._isStateLoaded = false;
		_this._rootNode = null;
		_this._state = new _map2.default();
		_this._patchers = new _map2.default();
		_this._motionNodes = new _map2.default();
		_this._resourceController = new _resource.ResourceController();
		_this._resourceController.on("get_resource_info", _this._onGetResourceInfo);
		return _this;
	}

	/**
  * Returns whether motion tracking is currently enabled/disabled.
  * @type {boolean}
  * @readonly
  */

	_createClass(State, [{
		key: "_makeResourceRequest",

		/* Connection related events */

		/**
   * @private
   * @throws throws an Error when the RESOURCE_REQUEST_DOMAIN is invalid
   */
		value: function _makeResourceRequest(context, resource, domain) {
			if (domain !== RESOURCE_REQUEST_DOMAIN.INFO && domain !== RESOURCE_REQUEST_DOMAIN.DATA) {
				throw new Error("Resource request domain must be one of: " + RESOURCE_REQUEST_DOMAIN.DATA + ", " + RESOURCE_REQUEST_DOMAIN.INFO);
			}

			// If there was a previous request from this resource, remove it
			if (this._resourceRequests[domain].resourceToSequence.hasOwnProperty(resource.id)) {
				var oldSequence = this._resourceRequests[domain].resourceToSequence[resource.id];
				delete this._resourceRequests[domain].sequenceToResource[oldSequence];
			}

			var sequence = ++this._resourceRequests[domain].sequence;
			this._resourceRequests[domain].resourceToSequence[resource.id] = sequence;
			this._resourceRequests[domain].sequenceToResource[sequence] = resource;
			var payload = {
				context: context,
				name: resource.filename,
				width: resource.dimensions.width,
				height: resource.dimensions.height,
				sequence: sequence,
				as_png: 1 // This asks Max to render SVG surfaces to PNG instead of raw bytes
			};

			if (domain === RESOURCE_REQUEST_DOMAIN.INFO) {
				this._communicator.getResourceInfo(payload);
			} else if (domain === RESOURCE_REQUEST_DOMAIN.DATA) {
				this._communicator.getResourceData(payload);
			}
		}

		/**
   * @private
   */

		/**
   * @private
   */

		/**
   * @private
   * @fires State.frame_changed
   * @fires State.object_changed
   * @fires State.patcher_changed
   */

		/**
   * @private
   */

		/**
   * @private
   */

		/**
   * @private
   */

		/**
   * @private
   */

	}, {
		key: "_addMotion",

		/**
   * @private
   */
		value: function _addMotion(node) {
			this._motionNodes.set(node.id, node);

			if (this._motionNodes.size === 1) {
				/**
     * This event is emitted when there is at least one mira.motion object in Max.
     * @event State.motion_enabled
     */
				this.emit("motion_enabled");
			}
		}

		/**
   * @private
   */

	}, {
		key: "_getMotion",
		value: function _getMotion(id) {
			return this._motionNodes.get(id) || null;
		}

		/**
   * @private
   */

	}, {
		key: "_removeMotion",
		value: function _removeMotion(node) {
			this._motionNodes.delete(node.id);
			if (this._motionNodes.size === 0) {
				/**
     * This event is emitted when the last mira.motion object is removed from Max. This event is not emitted when
     * xebra first connects to Max, and there are no mira.motion objects in Max.
     * @event State.motion_disabled
     */
				this.emit("motion_disabled");
			}
		}

		/**
   * @private
   */

	}, {
		key: "_addPatcher",
		value: function _addPatcher(node) {
			this._patchers.set(node.id, node);
		}

		/**
   * @private
   */

	}, {
		key: "_getPatcher",
		value: function _getPatcher(id) {
			return this._patchers.get(id) || null;
		}

		/**
   * @private
   */

	}, {
		key: "_removePatcher",
		value: function _removePatcher(node) {
			this._patchers.delete(node.id);
		}

		/**
   * @private
   *
   * @listens ObjectNode.param_changed
   * @listens ObjectNode#param_set
   * @fires State.frame_added
   * @fires State.object_added
   * @fires State.patcher_added
   */

	}, {
		key: "_doInsertNode",

		/**
   * @private
   */
		value: function _doInsertNode(node) {
			this._state.set(node.id, node);
			node.on("param_changed", this._onNodeChange);
			node.on("param_set", this._onModifiyNodeChange);
			if (node.resourceController) node.resourceController.on("get_resource_info", this._onGetResourceInfo);
		}

		/**
   * @private
   */

		/**
   * @private
   */

		/**
   * @private
   */

		/**
   * @private
   * @fires State.frame_removed
   * @fires State.object_removed
   * @fires State.patcher_removed
   */

	}, {
		key: "_destroyNode",
		value: function _destroyNode(node) {
			var _this2 = this;

			node.destroy();

			node.forEachChild(function (child) {
				if (child instanceof _index.ParamNode) _this2._destroyNode(child);
			}, this);

			this._state.delete(node.id);
		}

		/**
   * private
   */

		/**
   * @private
   */

		/**
   * @private
   */

	}, {
		key: "_resetState",

		/**
   * @private
   */
		value: function _resetState() {
			// destroy all old nodes
			if (this._state) {
				this._state.forEach(function (node) {
					node.destroy();
				});
				this._state.clear();
			}

			this._isStateLoaded = false;
			this._state = new _map2.default();
			this._patchers = new _map2.default();

			// reset motion
			this._motionNodes = new _map2.default();
			this.emit("motion_disabled");

			this._rootNode = new _index.ObjectNode(0, "root");
			this._doInsertNode(this._rootNode);
		}

		/**
   * Closes the Xebra connection and resets the state.
   */

	}, {
		key: "close",
		value: function close() {
			this._communicator.close();
			this._resetState();
		}

		/**
   * Connects to the Xebra server. If `auto_connect : true` is passed to State on.
   */

	}, {
		key: "connect",
		value: function connect() {
			this._communicator.connect();
		}

		/**
   * Create a {@link Resource}, which can be used to retrieve image data from the Max search path.
   * @return {Resource}
   */

	}, {
		key: "createResource",
		value: function createResource() {
			return this._resourceController.createResource();
		}

		/**
   * Send an arbitrary message to the named channel. The type of the message will be coerced to
   * a Max type in the Max application by mira.channel
   * @param {String} channel - The name of the mira.channel objects that should receive this message
   * @param {Number|String|Array<Number|String>|Object} message - the message to send
   */

	}, {
		key: "sendMessageToChannel",
		value: function sendMessageToChannel(channel, message) {
			this._communicator.sendChannelMessage(channel, message);
		}

		/**
   * Send mira.motion updates to parameters on the root node.
   * @see Xebra.MOTION_TYPES
   * @param {string} motionType - The type of motion
   * @param {number} motionX
   * @param {number} motionY
   * @param {number} motionZ
   * @param {number} timestamp
   * @throws Will throw an error when motion is currently disabled on the instance of State.
   */

	}, {
		key: "sendMotionData",
		value: function sendMotionData(motionType, motionX, motionY, motionZ, timestamp) {
			var xuuid = this.xebraUuid;
			if (!xuuid) return;

			if (!this.isMotionEnabled) throw new Error("Can't send motion data when motion is disabled");

			this._rootNode.setParamValue(motionType, [xuuid, xuuid, motionX, motionY, motionZ, timestamp]);
		}

		/**
   * Returns a list of the names of all mira.channel objects in all patchers
   * @return {string[]}
   */

	}, {
		key: "getChannelNames",
		value: function getChannelNames() {
			var names = new _set2.default();
			this._patchers.forEach(function (patcher) {
				patcher.getChannelNames().forEach(function (name) {
					names.add(name);
				});
			});
			return (0, _from2.default)(names);
		}

		/**
   * Returns a list of available patchers.
   * @return {PatcherNode[]}
   */

	}, {
		key: "getPatchers",
		value: function getPatchers() {
			return (0, _from2.default)(this._patchers.values());
		}

		/**
   * Returns a list of node objects with the given scripting name (the Max attribute 'varname').
   * @return {ObjectNode[]}
   */

	}, {
		key: "getObjectsByScriptingName",
		value: function getObjectsByScriptingName(scriptingName) {
			var retVal = [];
			this._patchers.forEach(function (patcher, id) {
				var obj = patcher.getObjectByScriptingName(scriptingName);
				if (obj) retVal.push(obj);
			});
			return retVal;
		}
		/**
   * Returns the object speficied by the given id.
   * @param {Xebra.NodeId} id - The id of the object
   * @return {ObjectNode|null} the object or null if not known
  */

	}, {
		key: "getObjectById",
		value: function getObjectById(id) {
			var node = this._state.get(id);
			if (!node || !(node instanceof _index.ObjectNode)) return null;
			return node;
		}

		/**
   * Returns the patcher speficied by the given id.
   * @param {Xebra.NodeId} id - The id of the patcher
   * @return {PatcherNode|null} the patcher or null if not known
  */

	}, {
		key: "getPatcherById",
		value: function getPatcherById(id) {
			return this._patchers.get(id) || null;
		}
	}, {
		key: "isMotionEnabled",
		get: function get() {
			return this._motionNodes.size > 0;
		}

		/**
   * Returns the current connection state.
   * @type {number}
   * @readonly
   * @see {Xebra.CONNECTION_STATES}
   */

	}, {
		key: "connectionState",
		get: function get() {
			return this._communicator.connectionState;
		}

		/**
   * Name of the current xebra connection. For some Max objects, like mira.motion and mira.multitouch, multiple xebra
   * clients (connected via Xebra.js or the Mira iOS app) can send events to the same object. This name property will
   * be appended to these events, so that the events can be routed in Max.
   * @type {string}
   */

	}, {
		key: "name",
		get: function get() {
			return this._communicator.name;
		},
		set: function set(name) {
			this._communicator.name = name;
		}

		/**
   * Hostname of the Max WebSocket.
   * @type {string}
   * @readonly
   */

	}, {
		key: "hostname",
		get: function get() {
			return this._communicator.host;
		}

		/**
   * Returns whether the initial state has been received from Max and loaded.
   * @type {boolean}
   * @readonly
   */

	}, {
		key: "isStateLoaded",
		get: function get() {
			return this._isStateLoaded;
		}

		/**
   * Returns the port number of the Max WebSocket.
   * @type {number}
   * @readonly
   */

	}, {
		key: "port",
		get: function get() {
			return this._communicator.port;
		}

		/**
   * WebSocket connection URL.
   * @type {string}
   * @readonly
   */

	}, {
		key: "wsUrl",
		get: function get() {
			return this._communicator.wsUrl;
		}

		/**
   * UUID associated with this state.
   * @type {string}
   * @readonly
   */

	}, {
		key: "uuid",
		get: function get() {
			return this._communicator.uuid;
		}

		/**
   * UID assigned to this state by Max, after connection.
   * @private
   * @readonly
   */

	}, {
		key: "xebraUuid",
		get: function get() {
			return this._communicator.xebraUuid;
		}
	}]);

	return State;
}(_events.EventEmitter);

exports.State = State;

// constants

/**
 * Connection States
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {number} INIT - The connection hasn't been set up yet, it's still waiting for a call to connect (unless
 *     auto_connect is set to true)
 * @property {number} CONNECTING - The connection is being established
 * @property {number} CONNECTED - The connection is established and alive
 * @property {number} CONNECTION_FAIL - The connection could NEVER be established
 * @property {number} RECONNECTING - The connection was lost and attempts to reconnect are made (based on reconnect,
 *     reconnect_attempts and reconnect_timeout options)
 * @property {number} DISCONNECTED - The connection was lost and all attempts to reconnect failed
 */

var CONNECTION_STATES = _xebraCommunicator2.default.CONNECTION_STATES;
var VERSION = _xebraCommunicator2.default.XEBRA_VERSION;

exports.CONNECTION_STATES = CONNECTION_STATES;
exports.SUPPORTED_OBJECTS = SUPPORTED_OBJECTS;
exports.VERSION = VERSION;

},{"./lib/constants.js":152,"./lib/objectList.js":153,"./lib/resource.js":154,"./nodes/index.js":157,"babel-runtime/core-js/array/from":5,"babel-runtime/core-js/json/stringify":8,"babel-runtime/core-js/map":9,"babel-runtime/core-js/object/assign":10,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/freeze":13,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/keys":16,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/object/values":18,"babel-runtime/core-js/set":19,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21,"events":139,"lodash.pick":140,"lodash.uniq":141,"xebra-communicator":3}],152:[function(require,module,exports){
"use strict";

var _freeze = require("babel-runtime/core-js/object/freeze");

var _freeze2 = _interopRequireDefault(_freeze);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * Filename for an empty XebraResource
 * @static
 * @constant
 * @memberof Xebra
 * @type {String}
 */
var EMPTY_RESOURCE = "<none>";

/**
 * Motion Types supported by Xebra. Use these as type identifiers when calling sendMotionData on Xebra.State.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {string} ACCEL - Acceleration, minus any acceleration due to gravity
 * @property {string} GRAVITY - Acceleration due to gravity
 * @property {string} ORIENTATION - Roll, pitch and yaw
 * @property {string} RAWACCEL - Raw acceleration, including both user acceleration as well as gravity
 * @property {string} ROTATIONRATE - Raw gyroscope readings: x, y and z rotation rates
 */
var MOTION_TYPES = (0, _freeze2.default)({
  ROTATIONRATE: "rotationrate",
  GRAVITY: "gravity",
  ACCEL: "accel",
  ORIENTATION: "orientation",
  RAWACCEL: "rawaccel"
});

/**
 * Unit Styles of live.* objects.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {string} LIVE_UNIT_INT - Integer Unit Style
 * @property {string} LIVE_UNIT_FLOAT - Float Unit Style
 * @property {string} LIVE_UNIT_TIME - Time Unit Style
 * @property {string} LIVE_UNIT_HZ - Hertz Unit Style
 * @property {string} LIVE_UNIT_DB - deciBel Unit Style
 * @property {string} LIVE_UNIT_PERCENT - Percent (%) Unit Style
 * @property {string} LIVE_UNIT_PAN - Pan Unit Style
 * @property {string} LIVE_UNIT_SEMITONES - Semitones Unit Stlye
 * @property {string} LIVE_UNIT_MIDI - MIDI Notes Unit Style
 * @property {string} LIVE_UNIT_CUSTOM - Custom Unit Style
 * @property {string} LIVE_UNIT_NATIVE - Native Unit Style
 */
var LIVE_UNIT_STYLES = (0, _freeze2.default)({
  LIVE_UNIT_INT: "Int",
  LIVE_UNIT_FLOAT: "Float",
  LIVE_UNIT_TIME: "Time",
  LIVE_UNIT_HZ: "Hertz",
  LIVE_UNIT_DB: "deciBel",
  LIVE_UNIT_PERCENT: "%",
  LIVE_UNIT_PAN: "Pan",
  LIVE_UNIT_SEMITONES: "Semitones",
  LIVE_UNIT_MIDI: "MIDI",
  LIVE_UNIT_CUSTOM: "Custom",
  LIVE_UNIT_NATIVE: "Native"
});

/**
 * Unit Styles of live.* objects.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {string} LIVE_UNIT_INT - Integer Unit Style
 */
var LIVE_VALUE_TYPES = (0, _freeze2.default)({
  FLOAT: "Float",
  ENUM: "Enum",
  INT: "Int (0-255)"
});

/**
 * Available View Modes of XebraState.
 * @static
 * @constant
 * @memberof Xebra
 * @type {object}
 * @property {number} LINKED - Calculate visibility and position using the same view mode as Max
 * @property {number} PRESENTATION - Calculate visibility and position always using Presentation Mode
 * @property {number} PATCHING - Calculate visibility and position always using Patching Mode
 */
var VIEW_MODES = (0, _freeze2.default)({
  LINKED: 1,
  PRESENTATION: 2,
  PATCHING: 4
});

exports.EMPTY_RESOURCE = EMPTY_RESOURCE;
exports.LIVE_UNIT_STYLES = LIVE_UNIT_STYLES;
exports.LIVE_VALUE_TYPES = LIVE_VALUE_TYPES;
exports.MOTION_TYPES = MOTION_TYPES;
exports.VIEW_MODES = VIEW_MODES;

},{"babel-runtime/core-js/object/freeze":13}],153:[function(require,module,exports){
"use strict";

var _values = require("babel-runtime/core-js/object/values");

var _values2 = _interopRequireDefault(_values);

var _freeze = require("babel-runtime/core-js/object/freeze");

var _freeze2 = _interopRequireDefault(_freeze);

var _defineProperty2 = require("babel-runtime/core-js/object/define-property");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _Object$freeze, _Object$freeze2;

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
	if (key in obj) {
		(0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
	} else {
		obj[key] = value;
	}return obj;
}

var PARAMETER_ATTR = exports.PARAMETER_ATTR = (0, _freeze2.default)({
	CUSTOM_UNITS: "_parameter_units",
	EXPONENT: "_parameter_exponent",
	LONGNAME: "_parameter_longname",
	RANGE: "_parameter_range",
	SHORTNAME: "_parameter_shortname",
	STEPS: "_parameter_steps",
	TYPE: "_parameter_type",
	UNIT_STYLE: "_parameter_unitstyle"
});

var OBJECTS = exports.OBJECTS = (0, _freeze2.default)({
	BUTTON: "button",
	COMMENT: "comment",
	DIAL: "dial",
	FLONUM: "flonum",
	FPIC: "fpic",
	GAIN: "gain~",
	KSLIDER: "kslider",
	LIVE_BUTTON: "live.button",
	LIVE_DIAL: "live.dial",
	LIVE_GRID: "live.grid",
	LIVE_NUMBOX: "live.numbox",
	LIVE_SLIDER: "live.slider",
	LIVE_TAB: "live.tab",
	LIVE_TEXT: "live.text",
	LIVE_TOGGLE: "live.toggle",
	MESSAGE: "message",
	METER: "meter~",
	MIRA_CHANNEL: "mira.channel",
	MIRA_FRAME: "mira.frame",
	MIRA_MOTION: "mira.motion",
	MIRA_MULTITOUCH: "mira.multitouch",
	MULTISLIDER: "multislider",
	NUMBER: "number",
	PATCHER: "jpatcher",
	PATCHERVIEW: "patcherview",
	PANEL: "panel",
	RSLIDER: "rslider",
	SLIDER: "slider",
	SWATCH: "swatch",
	TOGGLE: "toggle",
	UMENU: "umenu"
});

var MANDATORY_OBJECTS = exports.MANDATORY_OBJECTS = (0, _freeze2.default)((_Object$freeze = {}, _defineProperty(_Object$freeze, OBJECTS.PATCHER, ["editing_bgcolor", "locked_bgcolor", "openinpresentation"]), _defineProperty(_Object$freeze, OBJECTS.PATCHERVIEW, ["name", "presentation", "locked"]), _defineProperty(_Object$freeze, OBJECTS.MIRA_CHANNEL, ["name"]), _defineProperty(_Object$freeze, OBJECTS.MIRA_FRAME, ["color", "mira_focus", "patching_rect", "presentation_rect", "presentation", "tabname", "taborder"]), _defineProperty(_Object$freeze, OBJECTS.MIRA_MOTION, []), _Object$freeze));

var DEFAULT_PARAMS = exports.DEFAULT_PARAMS = ["patching_rect", "presentation_rect", "zorder", "presentation", "hidden", "ignoreclick", "varname"];

var OBJECT_PARAMETERS = exports.OBJECT_PARAMETERS = (0, _freeze2.default)((_Object$freeze2 = {}, _defineProperty(_Object$freeze2, OBJECTS.BUTTON, DEFAULT_PARAMS.concat(["bgcolor", "blinkcolor", "outlinecolor", "value"])), _defineProperty(_Object$freeze2, OBJECTS.COMMENT, DEFAULT_PARAMS.concat(["textfield", "fontsize", "textjustification", "fontname", "fontface", "bgcolor", "textcolor", "bubble", "bubblepoint", "bubbleside", "bubbletextmargin"])), _defineProperty(_Object$freeze2, OBJECTS.DIAL, DEFAULT_PARAMS.concat(["distance", "floatoutput", "mode", "size", "min", "mult", "degrees", "thickness", "bgcolor", "needlecolor", "outlinecolor", "vtracking"])), _defineProperty(_Object$freeze2, OBJECTS.FLONUM, DEFAULT_PARAMS.concat(["value", "fontsize", "fontname", "fontface", "format", "bgcolor", "textcolor", "tricolor", "triscale", "numdecimalplaces", "htricolor"])), _defineProperty(_Object$freeze2, OBJECTS.FPIC, DEFAULT_PARAMS.concat(["alpha", "destrect", "autofit", "xoffset", "yoffset", "pic"])), _defineProperty(_Object$freeze2, OBJECTS.GAIN, DEFAULT_PARAMS.concat(["value", "size", "orientation", "bgcolor", "stripecolor", "knobcolor", "distance"])), _defineProperty(_Object$freeze2, OBJECTS.KSLIDER, DEFAULT_PARAMS.concat(["value", "blackkeycolor", "hkeycolor", "mode", "offset", "range", "selectioncolor", "whitekeycolor", "rawsend"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_BUTTON, DEFAULT_PARAMS.concat([PARAMETER_ATTR.LONGNAME, PARAMETER_ATTR.SHORTNAME, PARAMETER_ATTR.RANGE], ["active", "bgcolor", "bgoncolor", "activebgcolor", "activebgoncolor", "bordercolor", "focusbordercolor", "value"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_DIAL, DEFAULT_PARAMS.concat((0, _values2.default)(PARAMETER_ATTR), ["fontname", "fontsize", "fontface", "active", "activedialcolor", "activeneedlecolor", "appearance", "bordercolor", "dialcolor", "focusbordercolor", "needlecolor", "panelcolor", "showname", "shownumber", "textcolor", "triangle", "tribordercolor", "tricolor", "distance", "value"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_GRID, DEFAULT_PARAMS.concat(["amountcolor", "bgstepcolor", "bgstepcolor2", "bordercolor", "bordercolor2", "columns", "direction", "direction_height", "directioncolor", "displayamount", "freezecolor", "hbgcolor", "link", "marker_horizontal", "marker_vertical", "matrixmode", "mode", "rounded", "rows", "spacing", "stepcolor", "distance", "touchy", "directions", "setcell", "currentstep", "constraint"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_NUMBOX, DEFAULT_PARAMS.concat((0, _values2.default)(PARAMETER_ATTR), ["activebgcolor", "active", "activeslidercolor", "activetricolor", "activetricolor2", "appearance", "bordercolor", "focusbordercolor", "textcolor", "tricolor", "tricolor2", "value", "fontname", "fontface", "fontsize"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_SLIDER, DEFAULT_PARAMS.concat((0, _values2.default)(PARAMETER_ATTR), ["fontname", "fontsize", "fontface", "orientation", "relative", "showname", "shownumber", "slidercolor", "textcolor", "tribordercolor", "trioncolor", "tricolor", "value", "distance"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_TAB, DEFAULT_PARAMS.concat([PARAMETER_ATTR.LONGNAME, PARAMETER_ATTR.SHORTNAME, PARAMETER_ATTR.RANGE], ["active", "activebgcolor", "activebgoncolor", "bgcolor", "bgoncolor", "blinktime", "bordercolor", "button", "focusbordercolor", "mode", "multiline", "num_lines_patching", "num_lines_presentation", "pictures", "rounded", "spacing_x", "spacing_y", "textcolor", "textoncolor", "fontname", "fontsize", "fontface", "value", "usepicture"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_TEXT, DEFAULT_PARAMS.concat([PARAMETER_ATTR.LONGNAME, PARAMETER_ATTR.SHORTNAME, PARAMETER_ATTR.RANGE], ["activebgcolor", "active", "bgcolor", "activebgoncolor", "bgoncolor", "bordercolor", "textcolor", "activetextoncolor", "activetextcolor", "text", "texton", "value", "fontsize", "fontname", "fontface", "pictures", "usepicture", "mode"])), _defineProperty(_Object$freeze2, OBJECTS.LIVE_TOGGLE, DEFAULT_PARAMS.concat([PARAMETER_ATTR.LONGNAME, PARAMETER_ATTR.SHORTNAME, PARAMETER_ATTR.RANGE], ["bgcolor", "activebgcolor", "bgoncolor", "activebgoncolor", "bordercolor", "focusbordercolor", "value", "rounded", "active"])), _defineProperty(_Object$freeze2, OBJECTS.MESSAGE, DEFAULT_PARAMS.concat(["textfield", "fontsize", "textjustification", "fontname", "fontface", "bgcolor", "bgfillcolor_color", "bgfillcolor_type", "bgfillcolor_pt1", "bgfillcolor_pt2", "bgfillcolor_color1", "bgfillcolor_color2", "bgfillcolor_color", "bgfillcolor_proportion", "bgfillcolor_angle", "textcolor", "value"])), _defineProperty(_Object$freeze2, OBJECTS.METER, DEFAULT_PARAMS.concat(["bgcolor", "offcolor", "ntepidleds", "nwarmleds", "nhotleds", "numleds", "dbperled", "coldcolor", "tepidcolor", "warmcolor", "hotcolor", "overloadcolor", "level"])), _defineProperty(_Object$freeze2, OBJECTS.MIRA_MULTITOUCH, DEFAULT_PARAMS.concat(["color", "hsegments", "vsegments", "region", "pinch", "pinch_enabled", "rotate", "rotate_enabled", "tap", "tap_enabled", "tap_touch_count", "tap_tap_count", "swipe", "swipe_enabled", "swipe_touch_count", "remote_gestures", "remote_circles", "moved_touch", "up_down_cancelled_touch"])), _defineProperty(_Object$freeze2, OBJECTS.MULTISLIDER, DEFAULT_PARAMS.concat(["distance", "ghostbar", "setstyle", "candycane", "size", "setminmax", "orientation", "thickness", "bgcolor", "slidercolor", "candicane2", "candicane3", "candicane4", "candicane5", "candicane6", "candicane7", "candicane8", "peakcolor", "drawpeaks", "signed", "spacing", "settype"])), _defineProperty(_Object$freeze2, OBJECTS.NUMBER, DEFAULT_PARAMS.concat(["value", "fontsize", "fontname", "fontface", "format", "bgcolor", "textcolor", "tricolor", "triscale", "numdecimalplaces", "htricolor"])), _defineProperty(_Object$freeze2, OBJECTS.PANEL, DEFAULT_PARAMS.concat(["bgcolor", "bgfillcolor_color", "bgfillcolor_type", "bgfillcolor_pt1", "bgfillcolor_pt2", "bgfillcolor_color1", "bgfillcolor_color2", "bgfillcolor_color", "bgfillcolor_proportion", "bgfillcolor_angle", "bordercolor", "border", "rounded", "shape", "horizontal_direction", "vertical_direction", "arrow_orientation"])), _defineProperty(_Object$freeze2, OBJECTS.RSLIDER, DEFAULT_PARAMS.concat(["distance", "size", "min", "mult", "orientation", "drawline", "bgcolor", "bordercolor", "fgcolor"])), _defineProperty(_Object$freeze2, OBJECTS.SLIDER, DEFAULT_PARAMS.concat(["bgcolor", "distance", "elementcolor", "floatoutput", "knobcolor", "knobshape", "min", "mult", "orientation", "relative", "size", "thickness"])), _defineProperty(_Object$freeze2, OBJECTS.SWATCH, DEFAULT_PARAMS.concat(["distance", "value", "compatibility", "saturation"])), _defineProperty(_Object$freeze2, OBJECTS.TOGGLE, DEFAULT_PARAMS.concat(["bgcolor", "checkedcolor", "uncheckedcolor", "thickness", "value"])), _defineProperty(_Object$freeze2, OBJECTS.UMENU, DEFAULT_PARAMS.concat(["arrow", "applycolors", "bgcolor", "bgfillcolor_type", "bgfillcolor_color1", "bgfillcolor_color2", "bgfillcolor_pt1", "bgfillcolor_pt2", "bgfillcolor_color", "bgfillcolor_proportion", "bgfillcolor_angle", "color", "elementcolor", "fontname", "fontsize", "fontface", "items", "menumode", "textcolor", "textjustification", "truncate", "underline", "value"])), _Object$freeze2));

var OPTIONAL_OBJECT_PARAMETERS = exports.OPTIONAL_OBJECT_PARAMETERS = (0, _freeze2.default)(_defineProperty({}, OBJECTS.LIVE_TAB, ["pictures"]));

},{"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/freeze":13,"babel-runtime/core-js/object/values":18}],154:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ResourceController = undefined;

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _get = function get(object, property, receiver) {
	if (object === null) object = Function.prototype;var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);if (desc === undefined) {
		var parent = (0, _getPrototypeOf2.default)(object);if (parent === null) {
			return undefined;
		} else {
			return get(parent, property, receiver);
		}
	} else if ("value" in desc) {
		return desc.value;
	} else {
		var getter = desc.get;if (getter === undefined) {
			return undefined;
		}return getter.call(receiver);
	}
};

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var _events = require("events");

var _path = require("path");

var _constants = require("./constants.js");

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

var XEBRA_RESOURCE_ID = 0;

/**
 * @desc Represents some data that the remote Max instance has access to. The intended use is to support Max objects
 * like fpic and live.tab, which may want to display images. Can also be used to fetch data from files in Max's search
 * path. Setting `filename` (or setting `dimensions` in the case of .svg files) will query Max for that data in Max's
 * search path. Listen for the {@link Resource.event:data_received} event to receive the data as a data URI string.
 * Only images are currently supported.
 * @class
 * @extends EventEmitter
 * @example
 * // To use a resource without an ObjectNode, first create the resource.
 * const xebraState; // Instance of Xebra.State
 * const resource = xebraState.createResource();
 *
 * // The resource doesn't hold on to data from Max once it receives it, so be sure to listen for {@link Resource.event:data_received}
 * // events in order to handle resource data.
 * resource.on("data_received", (filename, data_uri) => {
 * // Do something with the data
 * });
 *
 * // Setting the filename property will cause the Resource object to fetch the data from Max. filename should be the
 * // name of a file in Max's search path. If Max is able to load the file successfully, it will send the data back
 * // to the Resource object, which will fire a {@link Resource.event:data_received} event with the data and filename.
 * resource.filename = "alex.png";
 *
 * // If the requested file is an .svg file, then Max will render the file before sending the data back to the Resource
 * // object. In this case, the dimensions property of the resource must be set as well as filename.
 * resource.filename = "maxelement.svg";
 * resource.dimensions = {width: 100, height: 50};
 */

var Resource = function (_EventEmitter) {
	_inherits(Resource, _EventEmitter);

	/**
  * @constructor
  * @param  {Xebra.NodeId} [0] parentObjectId - The id of the ObjectNode that owns this resource
  */
	function Resource() {
		var parentObjectId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

		_classCallCheck(this, Resource);

		var _this = _possibleConstructorReturn(this, (Resource.__proto__ || (0, _getPrototypeOf2.default)(Resource)).call(this));

		_this._id = ++XEBRA_RESOURCE_ID;
		_this._width = 1;
		_this._height = 1;
		_this._filename = _constants.EMPTY_RESOURCE;
		_this._objectContext = parentObjectId;
		return _this;
	}

	/**
  * Unique identifier associated with each resource.
  * @readonly
  * @type {Xebra.NodeId}
  */

	_createClass(Resource, [{
		key: "on",

		/**
   * @private
   */
		value: function on(event, fn) {
			_get(Resource.prototype.__proto__ || (0, _getPrototypeOf2.default)(Resource.prototype), "on", this).call(this, event, fn);
			if (event === "data_received") this._doFetch();
		}

		/**
   * Clears the resource content
   * @private
   */

	}, {
		key: "clear",
		value: function clear() {
			this._width = 1;
			this._height = 1;
			this._filename = _constants.EMPTY_RESOURCE;

			/**
    * @event Resource.clear
    * Called whenever the resource is cleared and its content is now empty
    */
			this.emit("clear");
		}

		/**
   * Be sure to call this when the Resource is no longer needed.
   */

	}, {
		key: "destroy",
		value: function destroy() {
			/**
    * @event Resource.destroy
    * Called whenever the resource is about to be destroyed
    */
			this.emit("destroy");
			this.removeAllListeners();
		}

		/**
   * Fetch the resource data
   * @private
   */

	}, {
		key: "_doFetch",
		value: function _doFetch() {
			this.emit("needs_data", this);
		}

		/**
   * Handle incoming resource data.
   * @private
   * @param {object} data - The resource data
   */

	}, {
		key: "handleData",
		value: function handleData(data) {
			var filetype = (0, _path.extname)(data.request.name);
			if (filetype.length && filetype[0] === ".") filetype = filetype.substr(1);

			if (filetype === "svg") filetype = "png"; // Max will convert rendered svg surfaces to png for us
			var data_uri_string = "data:image/" + filetype + ";base64," + data.data;

			/**
    * @event Resource.data_received
    * @param {string} name - name of the resource
    * @param {string} datauri - data-uri representation of the resource
    */
			this.emit("data_received", data.request.name, data_uri_string);
		}
	}, {
		key: "id",
		get: function get() {
			return this._id;
		}

		/**
   * Name of a file in Max's search path. Setting this will query Max for data from the corresponding file. Listen to
   * the {@link Resource.event:data_received} event for the data in the form of a data-uri string.
   * @type {string}
   */

	}, {
		key: "filename",
		get: function get() {
			return this._filename;
		},
		set: function set(fn) {
			this._filename = fn;
			this._doFetch();
		}

		/**
   * Id of the ObjectNode that owns the resource. If the resource is not bound to an ObjectNode, returns null. Max can
   * use the object id to augment the search path with the parent patcher of the object, if the object id is supplied.
   * @type {Xebra.NodeId}
   */

	}, {
		key: "objectContext",
		get: function get() {
			return this._objectContext;
		}
	}, {
		key: "isEmpty",
		get: function get() {
			return this.filename === _constants.EMPTY_RESOURCE;
		}

		/**
   * Whether the resource is a SVG image or not
   * @readonly
   * @type {boolean}
   */

	}, {
		key: "isSVG",
		get: function get() {
			return this._filename ? (0, _path.extname)(this._filename) === ".svg" : false;
		}

		/**
   * @typedef {object} ResourceDimensions
   * @property {number} height The height
   * @property {number} width The width
   */

		/**
   * Dimensions of the resource. These are <strong>not</strong> updated automatically, and <strong>cannot</strong> be
   * used to determine the dimensions of a raster image in Max's filepath. Instead, use the data URI returned with the
   * {@link Resource.event:data_received} event to determine size. Setting these dimensions will trigger a new data
   * fetch, if the resource is an .svg image. Max will be used to render the image and a .png data-uri will be
   * returned.
   * @type {ResourceDimensions}
   */

	}, {
		key: "dimensions",
		get: function get() {
			return {
				width: this._width,
				height: this._height
			};
		},
		set: function set(dim) {
			if (this._width !== dim.width || this._height !== dim.height) {
				this._width = dim.width;
				this._height = dim.height;
				if (this.isSVG) this._doFetch();
			}
		}
	}]);

	return Resource;
}(_events.EventEmitter);

exports.default = Resource;

var ResourceController = function (_EventEmitter2) {
	_inherits(ResourceController, _EventEmitter2);

	function ResourceController() {
		_classCallCheck(this, ResourceController);

		var _this2 = _possibleConstructorReturn(this, (ResourceController.__proto__ || (0, _getPrototypeOf2.default)(ResourceController)).call(this));

		_this2._fetchResourceData = function (resource) {
			_this2.emit("get_resource_info", resource);
		};

		return _this2;
	}

	_createClass(ResourceController, [{
		key: "createResource",
		value: function createResource() {
			var parentObjectId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var resource = new Resource(parentObjectId);
			resource.on("needs_data", this._fetchResourceData);
			return resource;
		}
	}]);

	return ResourceController;
}(_events.EventEmitter);

exports.ResourceController = ResourceController;

},{"./constants.js":152,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-own-property-descriptor":14,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21,"events":139,"path":142}],155:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _freeze = require("babel-runtime/core-js/object/freeze");

var _freeze2 = _interopRequireDefault(_freeze);

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var _events = require("events");

var _objectList = require("../lib/objectList.js");

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * @desc <strong>Constructor for internal use only</strong>
 * Base class for Max nodes in the Xebra state tree. Through Xebra, Max exposes patchers, mira.frame objects, other Max
 * objects and assignable parameters for each object. Each of these is represented by a different XebraNode subclass.
 * @class
 */
var XebraNode = function (_EventEmitter) {
	_inherits(XebraNode, _EventEmitter);

	/**
  * @param  {number} id          The id of the node
  * @param  {string} type        Type identifier of the node
  * @param  {number} creationSeq The sequence number for the creation of this node
  */
	function XebraNode(id, type, creationSeq) {
		_classCallCheck(this, XebraNode);

		var _this = _possibleConstructorReturn(this, (XebraNode.__proto__ || (0, _getPrototypeOf2.default)(XebraNode)).call(this));

		_this._id = id;
		_this._type = type;
		_this._creationSeq = creationSeq;
		_this._children = new _map2.default();
		_this._paramsNameLookup = new _map2.default();
		return _this;
	}

	/**
  * Destroys the node by destroying all child nodes and removing all attached listeners.
  * @ignore
  */

	_createClass(XebraNode, [{
		key: "destroy",
		value: function destroy() {
			/**
    * Object Destroyed event
    * @alias XebraNode.destroy
    * @event XebraNode.destroy
    * @param {XebraNode} object     The destroyed object
    */
			this.emit("destroy", this);

			this.removeAllListeners();
		}

		/**
   * The creation sequence number associated with this node. This number is an increasing integer unique to each node.
   * @member {number}
   */

	}, {
		key: "_getParamForType",

		/**
   * @private
   */
		value: function _getParamForType(type) {
			var id = this._paramsNameLookup.get(type);
			return this.getChild(id);
		}

		/**
   * Callback when a parameter value is changed due to a modification in Max.
   * @abstract
   * @method
   * @private
   */

	}, {
		key: "_onParamChange",
		value: function _onParamChange() {
			throw new Error("Missing subclass implementation for _onParamChange");
		}

		/**
   * Callback when a parameter value was set by the client.
   * @abstract
   * @method
   * @private
   */

	}, {
		key: "_onParamSet",
		value: function _onParamSet() {
			throw new Error("Missing subclass implementation for _onParamSet");
		}

		/**
   * Adds a child.
   * @ignore
   * @param {Xebra.NodeId} id - The id of the child to be added
   * @param {XebraNode} node - The child to add
   */

	}, {
		key: "addChild",
		value: function addChild(id, node) {
			this._children.set(id, node);
		}

		/**
   * Execute callback function for each child of the node.
   * @ignore
   * @param {function} callback - The callback to execute
   * @param {object} context - The context of the callback
   */

	}, {
		key: "forEachChild",
		value: function forEachChild(callback, context) {
			this._children.forEach(callback, context);
		}

		/**
   * Returns the child with the given id.
   * @ignore
   * @param {Xebra.NodeId}
   * @return {XebraNode|null}
   */

	}, {
		key: "getChild",
		value: function getChild(id) {
			return this._children.get(id) || null;
		}

		/**
   * Returns all children of the node.
   * @ignore
   * @return {XebraNode[]}
   */

	}, {
		key: "getChildren",
		value: function getChildren() {
			return (0, _from2.default)(this._children.values());
		}

		/**
   * Returns whether the given id is a direct child.
   * @ignore
   * @param {Xebra.NodeId} id - The id of the potential child
   * @return {boolean}
   */

	}, {
		key: "hasChild",
		value: function hasChild(id) {
			return this._children.has(id);
		}

		/**
   * Removes the direct child connection to the node with the given id.
   * @ignore
   * @param {Xebra.NodeId} id - The id of the child to remove the connection to
   */

	}, {
		key: "removeChild",
		value: function removeChild(id) {
			var child = this.getChild(id);
			if (child) this._children.delete(id);
			return child;
		}

		/**
   * Adds a Parameter node to this node's children. Also adds the node as a listener for the Parameter node, so local
   * and remote changes to that node will trigger {@link State.object_changed} events.
   * @ignore
   * @listens ParamNode#change
   * @listens ParamNode#set
   * @param {ParamNode} param The parameter to add
   */

	}, {
		key: "addParam",
		value: function addParam(param) {
			this._paramsNameLookup.set(param.type, param.id);

			param.on("change", this._onParamChange);
			param.on("set", this._onParamSet);

			this.addChild(param.id, param);
		}

		/**
   * Returns a list of the names of all available parameters.
   * @return {string[]}
   */

	}, {
		key: "getParamTypes",
		value: function getParamTypes() {
			if (_objectList.OBJECT_PARAMETERS.hasOwnProperty(this.type)) {
				return (0, _freeze2.default)(_objectList.OBJECT_PARAMETERS[this.type] || []);
			}
			return (0, _freeze2.default)(_objectList.MANDATORY_OBJECTS[this.type] || []);
		}

		/**
   * Returns a list of the parameters that are not required for this object to be initialized.
   * @ignore
   * @return {string[]}
   */

	}, {
		key: "getOptionalParamTypes",
		value: function getOptionalParamTypes() {
			return (0, _freeze2.default)(_objectList.OPTIONAL_OBJECT_PARAMETERS[this.type] || []);
		}

		/**
   * Returns the value for the parameter with the name <i>type</i>.
   * @param  {String} type - Parameter type identifier
   * @return {Xebra.ParamValueType} returns the value(s) of the given parameter type or null
   */

	}, {
		key: "getParamValue",
		value: function getParamValue(type) {
			var param = this._getParamForType(type);
			if (param) return param.value;
			return null;
		}

		/**
   * Sets the value for the parameter with the name <i>type</i> to the given value.
   * @param {String} type - Parameter type identifier
   * @param {Object} value - Parameter value
   */

	}, {
		key: "setParamValue",
		value: function setParamValue(type, value) {
			var param = this._getParamForType(type);
			if (param) param.value = value;
		}
	}, {
		key: "creationSequence",
		get: function get() {
			return this._creationSeq;
		}

		/**
   * Unique id associated with each XebraNode.
   * @readonly
   * @member {Xebra.NodeId}
   */

	}, {
		key: "id",
		get: function get() {
			return this._id;
		}

		/**
   * @desc Returns whether all of the parameters for the object have been added yet.
   * @readonly
   * @private
   * @type {boolean}
   */

	}, {
		key: "isReady",
		get: function get() {
			return true;
		}

		/**
   * Type associated with this node. For Objects, Frames and Patchers, this will correspond to the class name of the
   * Max object. For parameters, this will be the name of the associated parameter. Parameters usually correspond to
   * the name of a Max object's attribute.
   * @member {string}
   */

	}, {
		key: "type",
		get: function get() {
			return this._type;
		}
	}]);

	return XebraNode;
}(_events.EventEmitter);

exports.default = XebraNode;
module.exports = exports["default"];

},{"../lib/objectList.js":153,"babel-runtime/core-js/array/from":5,"babel-runtime/core-js/map":9,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/freeze":13,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21,"events":139}],156:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _constants = require("../lib/constants.js");

var _objectNode = require("./objectNode.js");

var _objectNode2 = _interopRequireDefault(_objectNode);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * @desc <strong>Constructor for internal use only</strong>
 *
 * FrameNode instances represent mira.frame objects in a Max patcher. Using the FrameNode object, it is possible to see
 * which Max objects intersect a given mira.frame object, in both Patching as well as Presentation Modes.
 * @class
 * @extends ObjectNode
 * @extends XebraNode
 */
var FrameNode = function (_ObjectNode) {
	_inherits(FrameNode, _ObjectNode);

	/**
  * @param  {number} id - The id of the node
  * @param  {string} type - Type identifier of the node
  * @param  {number} creationSeq - The sequence number for the creation of this node
  * @param  {number} patcherId - The id of the parent node
  */
	function FrameNode(id, type, creationSeq, patcherId) {
		_classCallCheck(this, FrameNode);

		var _this = _possibleConstructorReturn(this, (FrameNode.__proto__ || (0, _getPrototypeOf2.default)(FrameNode)).call(this, id, type, creationSeq, patcherId));

		_this._onObjectInitialized = function (obj) {
			_this.emit("object_added", obj);
		};

		_this._onObjectChange = function (obj, param) {
			if (_this.getChild(obj.id)) _this.emit("object_changed", obj, param);
		};

		_this._onObjectDestroy = function (obj) {
			_this.removeObject(obj.id);
		};

		_this._objects = new _set2.default();
		_this._viewMode = _constants.VIEW_MODES.LINKED;
		_this._patcherViewMode = _constants.VIEW_MODES.PATCHING;
		return _this;
	}

	/**
  * The view mode of the FrameNode. In Patching mode, object positions and visibility will be calculated relative to
  * the patching_rect of the mira.frame object. In Presentation mode, the presentation_rect will be used. Linked mode
  * will defer to Max. If Max is in Presentation mode, Xebra will use Presentation mode, and if Max is in Patching
  * mode, Xebra will use Patching mode as well.
  * @type {number}
  * @see Xebra.VIEW_MODES
  */

	_createClass(FrameNode, [{
		key: "addObject",

		// End of bound callbacks

		/**
   * Adds the given object to the frame.
   * @ignore
   * @param {ObjectNode} obj
   * @listens ObjectNode.param_changed
   * @listens ObjectNode.destroy
   * @fires XebraState.object_added
   */
		value: function addObject(obj) {
			this._objects.add(obj.id);
			this.addChild(obj.id, obj);

			obj.on("param_changed", this._onObjectChange);
			obj.on("destroy", this._onObjectDestroy);

			if (obj.isReady) {
				this.emit("object_added", obj);
			} else {
				obj.once("initialized", this._onObjectInitialized);
			}
		}

		/**
   * Checks whether the frame contains the object identified by the given id.
   * @param  {Xebra.NodeId} id - The id of the object
   * @return {boolean}
   */

	}, {
		key: "containsObject",
		value: function containsObject(id) {
			return this.hasChild(id);
		}

		/**
   * Boundary check whether the given rect is visible within the frame.
   * @param  {Xebra.PatchingRect} rect - The rectangle to check
   * @return {boolean} whether the rect is contained or not
   */

	}, {
		key: "containsRect",
		value: function containsRect(rect) {
			var frameRect = this.viewMode === _constants.VIEW_MODES.PATCHING ? this.getParamValue("patching_rect") : this.getParamValue("presentation_rect");

			if (!frameRect) return false; // don't have the rect yet

			if (rect[0] < frameRect[0] + frameRect[2] && // x
			rect[0] + rect[2] >= frameRect[0] && rect[1] < frameRect[1] + frameRect[3] && // y
			rect[1] + rect[3] >= frameRect[1]) {
				return true;
			}

			return false;
		}

		/**
   * Returns the object with the given id.
   * @param  {Xebra.NodeId} id - The id of the object
   * @return {ObjectNode|null} The object (if contained) or null
   */

	}, {
		key: "getObject",
		value: function getObject(id) {
			return this.getChild(id);
		}

		/**
   * Returns a list of all objects contained in the frame.
   * @return {ObjectNode[]} An array of all contained objects
   */

	}, {
		key: "getObjects",
		value: function getObjects() {
			var _this2 = this;

			var objects = [];

			this._objects.forEach(function (id) {
				objects.push(_this2.getChild(id));
			}, this);

			return objects;
		}

		/**
   * Returns the frame of the object relative the the frame, in the current view mode, or null if the object is not in
   * the frame.
   * @return {Xebra.PatchingRect|null} Relative object frame.
   */

	}, {
		key: "getRelativeRect",
		value: function getRelativeRect(object) {
			if (!this.containsObject(object.id)) return null;
			var viewMode = this.viewMode;
			var objectRect = object.getParamValue(viewMode === _constants.VIEW_MODES.PATCHING ? "patching_rect" : "presentation_rect");
			var thisRect = this.getParamValue(viewMode === _constants.VIEW_MODES.PATCHING ? "patching_rect" : "presentation_rect");
			return [objectRect[0] - thisRect[0], objectRect[1] - thisRect[1], objectRect[2], objectRect[3]];
		}

		/**
   * Checks whether the current view mode is linked.
   * @return {boolean} Whether the frame defers to Max for it's viewMode or not
   */

	}, {
		key: "isViewModeLinked",
		value: function isViewModeLinked() {
			return this._viewMode === _constants.VIEW_MODES.LINKED;
		}

		/**
   * Removes the object with the given id from the frame.
   * @ignore
   * @fires XebraState.object_removed
   * @param  {Xebra.NodeId} id - The id of the object to remove
   */

	}, {
		key: "removeObject",
		value: function removeObject(id) {
			var obj = this.removeChild(id);

			if (obj) {

				this._objects.delete(id);

				// make sure to clean up attached event listeners
				obj.removeListener("param_changed", this._onObjectChange);
				obj.removeListener("destroy", this._onObjectDestroy);
				obj.removeListener("initialized", this._onObjectInitialized);

				if (obj.isReady) this.emit("object_removed", obj);
			}
		}
	}, {
		key: "viewMode",
		get: function get() {
			if (this._viewMode === _constants.VIEW_MODES.LINKED) return this._patcherViewMode;
			return this._viewMode;
		},
		set: function set(mode) {
			this._viewMode = mode;
			this.emit("viewmode_change", this, mode);
		}

		/**
   * Sets the view mode of the containing patcher
   * @private
   * @type {number}
   */

	}, {
		key: "patcherViewMode",
		get: function get() {
			return this._patcherViewMode;
		},
		set: function set(mode) {
			this._patcherViewMode = mode;
			if (this.isViewModeLinked()) this.emit("viewmode_change", this, mode);
		}

		// Bound callbacks using fat arrow notation

		/**
   * @private
   * @fires XebraState.object_added
   * @param {ObjectNode} obj - The new object
   */

		/**
   * @private
   * @fires XebraState.object_changed
   * @param {ObjectNode} obj - The changed object
   * @param {ParamNode} param - The changed parameter
   */

		/**
   * Callback called when a contained object is destroyed.
   * @private
   * @param {ObjectNode} obj - The destroyed object
   */

	}]);

	return FrameNode;
}(_objectNode2.default);

exports.default = FrameNode;
module.exports = exports["default"];

},{"../lib/constants.js":152,"./objectNode.js":160,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/set":19,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21}],157:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ParamNode = exports.ObjectNode = exports.PatcherNode = exports.FrameNode = exports.getInstanceForObjectType = undefined;

var _objectList = require("../lib/objectList.js");

var _frame = require("./frame.js");

var _frame2 = _interopRequireDefault(_frame);

var _patcher = require("./patcher.js");

var _patcher2 = _interopRequireDefault(_patcher);

var _objectNode = require("./objectNode.js");

var _objectNode2 = _interopRequireDefault(_objectNode);

var _paramNode = require("./paramNode.js");

var _paramNode2 = _interopRequireDefault(_paramNode);

var _liveDisplayValueMixin = require("./liveDisplayValueMixin.js");

var _liveDisplayValueMixin2 = _interopRequireDefault(_liveDisplayValueMixin);

var _liveScalingObjectMixin = require("./liveScalingObjectMixin.js");

var _liveScalingObjectMixin2 = _interopRequireDefault(_liveScalingObjectMixin);

var _resourceObjectMixin = require("./resourceObjectMixin.js");

var _resourceObjectMixin2 = _interopRequireDefault(_resourceObjectMixin);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var LIVE_DISPLAY_VALUE_OBJECT_TYPES = [_objectList.OBJECTS.LIVE_DIAL, _objectList.OBJECTS.LIVE_NUMBOX, _objectList.OBJECTS.LIVE_SLIDER];
var LIVE_SCALING_OBJECT_TYPES = [_objectList.OBJECTS.LIVE_DIAL, _objectList.OBJECTS.LIVE_NUMBOX, _objectList.OBJECTS.LIVE_SLIDER];
var RESOURCE_OBJECT_TYPES = [_objectList.OBJECTS.FPIC, _objectList.OBJECTS.LIVE_TAB, _objectList.OBJECTS.LIVE_TEXT];

function getInstanceForObjectType(id, type, creationSeq, parentId) {
	// Patchers
	if (type === _objectList.OBJECTS.PATCHER) {
		return new _patcher2.default(id, type, creationSeq, parentId);
	}
	// Mira Frames
	else if (type === _objectList.OBJECTS.MIRA_FRAME) {
			return new _frame2.default(id, type, creationSeq, parentId);
		}

	var ObjClass = _objectNode2.default;

	// Certain objects, for example fpic, can have resources (only images for now)
	// Changes in certain parameters can trigger a resource request (these relationships are object-dependent)
	// Let it be known, this hard-coding causes us great pain
	if (RESOURCE_OBJECT_TYPES.indexOf(type) > -1) ObjClass = (0, _resourceObjectMixin2.default)(ObjClass);
	if (LIVE_SCALING_OBJECT_TYPES.indexOf(type) > -1) ObjClass = (0, _liveScalingObjectMixin2.default)(ObjClass);
	if (LIVE_DISPLAY_VALUE_OBJECT_TYPES.indexOf(type) > -1) ObjClass = (0, _liveDisplayValueMixin2.default)(ObjClass);

	return new ObjClass(id, type, creationSeq, parentId);
}

exports.getInstanceForObjectType = getInstanceForObjectType;
exports.FrameNode = _frame2.default;
exports.PatcherNode = _patcher2.default;
exports.ObjectNode = _objectNode2.default;
exports.ParamNode = _paramNode2.default;

},{"../lib/objectList.js":153,"./frame.js":156,"./liveDisplayValueMixin.js":158,"./liveScalingObjectMixin.js":159,"./objectNode.js":160,"./paramNode.js":161,"./patcher.js":162,"./resourceObjectMixin.js":163}],158:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _get = function get(object, property, receiver) {
	if (object === null) object = Function.prototype;var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);if (desc === undefined) {
		var parent = (0, _getPrototypeOf2.default)(object);if (parent === null) {
			return undefined;
		} else {
			return get(parent, property, receiver);
		}
	} else if ("value" in desc) {
		return desc.value;
	} else {
		var getter = desc.get;if (getter === undefined) {
			return undefined;
		}return getter.call(receiver);
	}
};

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var _constants = require("../lib/constants.js");

var _objectList = require("../lib/objectList.js");

var _sprintfJs = require("sprintf-js");

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

function stringForLiveValue(liveValue, unitStyle, paramValueType, customUnit) {
	if (liveValue === undefined || unitStyle === undefined) return "";

	var outVal = null;

	switch (unitStyle) {
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_INT:
			outVal = "" + Math.round(liveValue);
			break;
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_FLOAT:
			outVal = liveValue.toFixed(2);
			break;
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_TIME:
			if (liveValue >= 10000) {
				outVal = (liveValue / 1000).toFixed(1) + " s";
			} else if (liveValue >= 1000) {
				outVal = (liveValue / 1000).toFixed(2) + " s";
			} else if (liveValue >= 100) {
				outVal = Math.round(liveValue) + " ms";
			} else if (liveValue >= 10) {
				outVal = liveValue.toFixed(1) + " ms";
			} else {
				outVal = liveValue.toFixed(2) + " ms";
			}
			break;
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_HZ:
			if (liveValue >= 10000) {
				outVal = (liveValue / 1000).toFixed(1) + " kHz";
			} else if (liveValue >= 1000) {
				outVal = (liveValue / 1000).toFixed(2) + " kHz";
			} else if (liveValue >= 100) {
				outVal = Math.round(liveValue) + " Hz";
			} else if (liveValue >= 10) {
				outVal = liveValue.toFixed(1) + " Hz";
			} else {
				outVal = liveValue.toFixed(2) + " Hz";
			}
			break;
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_DB:
			if (Math.abs(liveValue) >= 10) {
				outVal = Math.round(liveValue) + " dB";
			} else {
				outVal = liveValue.toFixed(1) + " dB";
			}
			break;
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_PERCENT:
			if (Math.abs(liveValue) >= 100 || paramValueType === _constants.LIVE_VALUE_TYPES.INT) {
				outVal = Math.round(liveValue) + " %";
			} else if (Math.abs(liveValue) >= 10) {
				outVal = liveValue.toFixed(1) + " %";
			} else {
				outVal = liveValue.toFixed(2) + " %";
			}
			break;
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_PAN:
			if (liveValue === 0) {
				outVal = "C";
			} else if (liveValue > 0) {
				outVal = Math.round(liveValue) + "R";
			} else {
				outVal = Math.round(liveValue) + "L";
			}
			break;
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_SEMITONES:
			{
				var val = Math.round(liveValue);
				if (val === 0) {
					outVal = "0 st";
				} else if (val > 0) {
					outVal = "+" + val + " st";
				} else {
					outVal = val + " st";
				}
				break;
			}case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_MIDI:
			{
				var _val = Math.round(liveValue);
				var dRes = Math.floor(_val / 12);
				var mRes = _val - dRes * 12;
				var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
				outVal = "" + notes[mRes] + (dRes - 2);
				if (_val > 127) outVal = "+";
				if (_val < 0) outVal = "-";
				break;
			}
		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_CUSTOM:

			if (customUnit.indexOf("%") >= 0) {
				// wrap in try catch here in order to catch invalid sprintf format strings
				try {
					outVal = (0, _sprintfJs.sprintf)(customUnit, liveValue);
				} catch (e) {
					outVal = customUnit;
				}
			} else {
				outVal = (paramValueType === _constants.LIVE_VALUE_TYPES.INT ? Math.round(liveValue) : liveValue.toFixed(2)) + " " + customUnit;
			}

			break;

		case _constants.LIVE_UNIT_STYLES.LIVE_UNIT_NATIVE:
			outVal = paramValueType === _constants.LIVE_VALUE_TYPES.INT ? Math.round(liveValue) : liveValue.toFixed(2);
			break;
		default:
			outVal = "";
	}
	return outVal;
}

/**
 * Adds a virtual, readonly "displayvalue" parameter to the object in order to simplify reading the different display
 * and unit styles of certain live objects.
 *
 * For example, if the value of the "distance" parameter is 0.5, then depending on the configuration of the object, the
 * "displayvalue" parameter could be "400 Hz" or "C3#".
 *
 * This mixin is currently added to ObjectNodes representing live.dial, live.numbox and live.slider objects.
 *
 * @mixin LiveDisplayValueMixin
 * @example
 * // dialNode is the ObjectNode for the live.dial
 * dialNode.setParamValue("_parameter_range", [10, 20]);
 * dialNode.setParamValue("_parameter_exponent", 1);
 * dialNode.setParamValue("distance", 0.5);
 * dialNode.setParamValue("_parameter_unitstyle", "Pan");
 * dialNode.getParamValue("displayvalue"); // returns "15R"
 *
 * dialNode.setParamValue("_parameter_unitstyle", "Semitones");
 * dialNode.getParamValue("displayvalue"); // returns "+ 15 st"
 *
 * @see Xebra.LIVE_UNIT_STYLES
 */

exports.default = function (objClass) {
	return function (_objClass) {
		_inherits(_class, _objClass);

		function _class() {
			_classCallCheck(this, _class);

			return _possibleConstructorReturn(this, (_class.__proto__ || (0, _getPrototypeOf2.default)(_class)).apply(this, arguments));
		}

		_createClass(_class, [{
			key: "getParamValue",

			/**
    * Returns the value for the parameter specified by the given parameter type identifier.
    * @param  {string} type Parameter type identifier
    * @return {Xebra.ParamValueType}
    * @ignore
    * @override
    * @memberof LiveDisplayValueMixin
    * @instance
   */
			value: function getParamValue(type) {
				if (type === "displayvalue") {

					var paramValueType = this.getParamValue(_objectList.PARAMETER_ATTR.TYPE);
					var val = this.getParamValue("value");

					if (paramValueType === _constants.LIVE_VALUE_TYPES.ENUM) {
						var enums = this.getParamValue(_objectList.PARAMETER_ATTR.RANGE);

						var roundedVal = Math.round(val);

						if (!enums.length) return "";

						if (roundedVal <= 0) return enums[0];
						if (roundedVal >= enums.length) return enums[enums.length - 1];

						return enums[roundedVal];
					}

					return stringForLiveValue(val, this.getParamValue(_objectList.PARAMETER_ATTR.UNIT_STYLE), paramValueType, this.getParamValue(_objectList.PARAMETER_ATTR.CUSTOM_UNITS));
				}

				return _get(_class.prototype.__proto__ || (0, _getPrototypeOf2.default)(_class.prototype), "getParamValue", this).call(this, type);
			}

			/**
    * Adds the virtual displayvalue parameter to the paramTypes array
   	 * @ignore
   	 * @override
   	 * @memberof LiveDisplayValueMixin
   	 * @instance
    */

		}, {
			key: "getParamTypes",
			value: function getParamTypes() {
				return _get(_class.prototype.__proto__ || (0, _getPrototypeOf2.default)(_class.prototype), "getParamTypes", this).call(this).concat("displayvalue");
			}

			/**
    * Adds the virtual displayvalue parameter to the optionalParamTypes array
   	 * @ignore
   	 * @override
   	 * @memberof LiveDisplayValueMixin
   	 * @instance
    */

		}, {
			key: "getOptionalParamTypes",
			value: function getOptionalParamTypes() {
				return _get(_class.prototype.__proto__ || (0, _getPrototypeOf2.default)(_class.prototype), "getOptionalParamTypes", this).call(this).concat("displayvalue");
			}
		}]);

		return _class;
	}(objClass);
};

module.exports = exports["default"];

},{"../lib/constants.js":152,"../lib/objectList.js":153,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-own-property-descriptor":14,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21,"sprintf-js":148}],159:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _isIterable2 = require("babel-runtime/core-js/is-iterable");

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () {
	function sliceIterator(arr, i) {
		var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
			for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
				_arr.push(_s.value);if (i && _arr.length === i) break;
			}
		} catch (err) {
			_d = true;_e = err;
		} finally {
			try {
				if (!_n && _i["return"]) _i["return"]();
			} finally {
				if (_d) throw _e;
			}
		}return _arr;
	}return function (arr, i) {
		if (Array.isArray(arr)) {
			return arr;
		} else if ((0, _isIterable3.default)(Object(arr))) {
			return sliceIterator(arr, i);
		} else {
			throw new TypeError("Invalid attempt to destructure non-iterable instance");
		}
	};
}();

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _get = function get(object, property, receiver) {
	if (object === null) object = Function.prototype;var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);if (desc === undefined) {
		var parent = (0, _getPrototypeOf2.default)(object);if (parent === null) {
			return undefined;
		} else {
			return get(parent, property, receiver);
		}
	} else if ("value" in desc) {
		return desc.value;
	} else {
		var getter = desc.get;if (getter === undefined) {
			return undefined;
		}return getter.call(receiver);
	}
};

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var _constants = require("../lib/constants.js");

var _objectList = require("../lib/objectList.js");

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

function clamp(v, lo, hi) {
	return v < hi ? v > lo ? v : lo : hi;
}

function alignStep(min, max, value, steps) {
	var range = max - min;
	var singleStep = range / steps;
	return Math.floor(value / singleStep) * singleStep;
}

/**
 * Certain live.* objects, for example live.slider and live.dial, manage their internal state using two separate but
 * related parameters: "distance" and "value". The "distance" parameter is always a value between 0 and 1, ignoring the
 * range and possible nonlinear scaling applied to the object. The "value" parameter is the one that the object will
 * display, and is computed by applying the exponent and range parameters to the "distance" parameter. This mixin
 * simply performs this calculation automatically whenever the "distance" parameter is set.
 *
 * @mixin LiveScalingObjectMixin
 * @example
 * // dialNode is the ObjectNode for the live.dial
 * dialNode.setParamValue("_parameter_range", [10, 20]);
 * dialNode.setParamValue("_parameter_exponent", 1);
 * dialNode.setParamValue("distance", 0.5);
 * dialNode.getParamValue("value"); // returns 15
 *
 * dialNode.setParamValue("_parameter_exponent", 2);
 * dialNode.getParamValue("value"); // returns 12.5
 */

exports.default = function (objClass) {
	return function (_objClass) {
		_inherits(_class, _objClass);

		function _class(id, type, creationSeq, patcherId) {
			_classCallCheck(this, _class);

			var _this = _possibleConstructorReturn(this, (_class.__proto__ || (0, _getPrototypeOf2.default)(_class)).apply(this, arguments));

			_this._ignoredValueSeq = 0;
			return _this;
		}

		/**
   * @ignore
   * @override
   * @memberof LiveScalingObjectMixin
   * @instance
   */

		_createClass(_class, [{
			key: "setParamValue",
			value: function setParamValue(type, value) {
				// Handle live.slider and live.dial distance
				if (type === "distance") {

					var distParam = this._getParamForType(type);

					if (!distParam) return;

					var dist = clamp(value, 0, 1);

					var parameterType = this.getParamValue(_objectList.PARAMETER_ATTR.TYPE);
					var parameterSteps = this.getParamValue(_objectList.PARAMETER_ATTR.STEPS);

					var _getParamValue = this.getParamValue(_objectList.PARAMETER_ATTR.RANGE),
					    _getParamValue2 = _slicedToArray(_getParamValue, 2),
					    min = _getParamValue2[0],
					    max = _getParamValue2[1];

					// Steps and enum handler


					if (parameterType === _constants.LIVE_VALUE_TYPES.ENUM) {
						min = 0;
						max = this.getParamValue(_objectList.PARAMETER_ATTR.RANGE).length - 1;

						dist = alignStep(0, 1, dist, max);
					} else if (parameterSteps > 1) {
						dist = alignStep(0, 1, dist, parameterSteps - 1);
					} else if (parameterType === _constants.LIVE_VALUE_TYPES.INT) {
						dist = alignStep(0, 1, dist, max - min);
					}

					// set distance
					distParam.value = dist;

					// calc and set scaled value
					var valueParam = this._getParamForType("value");
					if (!valueParam) return;

					var expDist = dist;
					var pExpo = this.getParamValue(_objectList.PARAMETER_ATTR.EXPONENT) || 1;
					if (pExpo !== 1) expDist = Math.pow(expDist, pExpo);

					var val = expDist * (max - min) + min;
					if (parameterType !== _constants.LIVE_VALUE_TYPES.FLOAT) val = Math.round(val);

					valueParam.modify(val, valueParam.types, valueParam.remoteSequence + 1);
				}
				// Handle live.numbox
				else if (type === "value" && this.type === _objectList.OBJECTS.LIVE_NUMBOX) {

						var _parameterType = this.getParamValue(_objectList.PARAMETER_ATTR.TYPE);
						var _parameterSteps = this.getParamValue(_objectList.PARAMETER_ATTR.STEPS);

						var _ref = _parameterType === _constants.LIVE_VALUE_TYPES.ENUM ? [0, this.getParamValue(_objectList.PARAMETER_ATTR.RANGE).length - 1] : this.getParamValue(_objectList.PARAMETER_ATTR.RANGE),
						    _ref2 = _slicedToArray(_ref, 2),
						    _min = _ref2[0],
						    _max = _ref2[1];

						var _val = clamp(value, _min, _max);

						if (_parameterType === _constants.LIVE_VALUE_TYPES.ENUM) {
							_val = alignStep(_min, _max, _val, _max);
						} else if (_parameterSteps > 1) {
							_val = alignStep(_min, _max, _val, _parameterSteps - 1);
						} else {
							_val = Math.round(_val);
						}

						var param = this._getParamForType(type);
						if (param) param.value = _val;
					} else {
						_get(_class.prototype.__proto__ || (0, _getPrototypeOf2.default)(_class.prototype), "setParamValue", this).call(this, type, value);
						return;
					}
			}
		}]);

		return _class;
	}(objClass);
};

module.exports = exports["default"];

},{"../lib/constants.js":152,"../lib/objectList.js":153,"babel-runtime/core-js/get-iterator":6,"babel-runtime/core-js/is-iterable":7,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-own-property-descriptor":14,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21}],160:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _base = require("./base.js");

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * @desc <strong>Constructor for internal use only</strong>
 *
 * Representation of a Max object in the Xebra state tree. The `nodeType` property returns the type of the ObjectNode,
 * which corresponds to the Max class of the object it represents. The `getParamTypes` function will return an array of
 * the parameters supported by this object, which usually corresponds to the attributes of the Max object. To listen to
 * parameter changes from Max, subscribe to the {@link ObjectNode.event:param_changed} event.
 * @extends XebraNode
 */
var ObjectNode = function (_XebraNode) {
	_inherits(ObjectNode, _XebraNode);

	/**
  * @param  {Xebra.NodeId} id - The id of the node
  * @param  {string} type - Type identifier of the node
  * @param  {number} creationSeq - The sequence number for the creation of this node
  * @param  {number} patcherId - The id of the parent node
  */
	function ObjectNode(id, type, creationSeq, patcherId) {
		_classCallCheck(this, ObjectNode);

		var _this = _possibleConstructorReturn(this, (ObjectNode.__proto__ || (0, _getPrototypeOf2.default)(ObjectNode)).call(this, id, type, creationSeq));

		_initialiseProps.call(_this);

		_this._patcherId = patcherId;
		_this._isReady = false;
		return _this;
	}

	/**
  * @desc Have all of the parameters for the object been added yet
  * @readonly
  * @private
  * @type {boolean}
  */

	_createClass(ObjectNode, [{
		key: "isReady",
		get: function get() {
			return this._isReady;
		}

		/**
   * @desc Unique id of the parent patcher of the Max object.
   * @readonly
   * @type {Xebra.NodeId}
   */

	}, {
		key: "patcherId",

		// End of bound callbacks
		get: function get() {
			return this._patcherId;
		}

		// Bound callbacks using fat arrow notation
		/**
   * @private
   * @param {ParamNode}
   * @fires ObjectNode.param_changed
   */

		/**
   * @private
   * @param {ParamNode}
   * @fires ObjectNode.param_set
   */

	}]);

	return ObjectNode;
}(_base2.default);

var _initialiseProps = function _initialiseProps() {
	var _this2 = this;

	this._onParamChange = function (param) {

		/**
   * Parameter Changed event. Listen to this event to be notified when the value of a parameter changes.
   * @event ObjectNode.param_changed
   * @param {ObjectNode} object     This
   * @param {ParamNode}  param      The parameter node
   */
		if (!_this2._isReady) {
			var paramTypes = _this2.getParamTypes();
			var optionalParamTypes = _this2.getOptionalParamTypes();
			var isReady = true;
			for (var i = 0; i < paramTypes.length; i++) {
				var type = paramTypes[i];
				var value = _this2.getParamValue(type);
				if ((value === null || value === undefined) && optionalParamTypes.indexOf(type) === -1) {
					isReady = false;
					break;
				}
			}

			if (isReady) {
				_this2._isReady = true;
				_this2.emit("initialized", _this2);
			}
		} else {
			_this2.emit("param_changed", _this2, param);
		}
	};

	this._onParamSet = function (param) {
		/**
   * Parameter set event. Used internally in order to communicate parameter changes to Max. Use param_changed instead
   * if you'd like to keep track of parameter changes.
   *
   * @event ObjectNode.param_set
   * @param {ObjectNode} object     This
   * @param {ParamNode}  param      The parameter node
   */
		_this2.emit("param_set", _this2, param);
		_this2.emit("param_changed", _this2, param);
	};
};

exports.default = ObjectNode;
module.exports = exports["default"];

},{"./base.js":155,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21}],161:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _base = require("./base.js");

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

/*
 * Unfortunately Max doesn't set the values for gradient related parameters
 * properly when an object is created and the values are set to defaults.
 * That's why we set some default values here
 * see #10136
 */

var PARAM_DEFAULT_VALUES = {
	bgfillcolor_pt1: [0.5, 0.05],
	bgfillcolor_pt2: [0.5, 0.95]
};

/**
 * @private
 */
function _getDefaultParamValue(type, value) {
	if ((!value || value.constructor === Array && !value.length) && PARAM_DEFAULT_VALUES.hasOwnProperty(type)) {
		return PARAM_DEFAULT_VALUES[type];
	}
	return value;
}

/*
 * Communication between xebra-state and Max uses a modified form of OSC,
 * which passes values along with types (h for integer, d for float, etc.).
 * Javascript doesn't differentiate between integers and floats. So,
 * xebra-state needs to store the types of each parameter when Max
 * updates the value of that parameter. There are some special parameters,
 * however, that are not initialized by Max. These types must be known
 * beforehand and are hardcoded.
 */
var HARDCODED_TYPES = {
	moved_touch: ["h", "h", "h", "h", "h", "h", "d", "d"],
	up_down_cancelled_touch: ["h", "h", "h", "h", "h", "h", "d", "d"],
	pinch: ["h", "h", "h", "d", "d", "h"],
	region: ["h", "h", "h", "h", "h", "h"],
	rotate: ["h", "h", "h", "d", "d", "h"],
	swipe: ["h", "h", "h", "h", "h"],
	tap: ["h", "h", "h", "d", "d", "h"],
	rawsend: ["h", "h"],
	rotationrate: ["h", "h", "d", "d", "d", "d"],
	gravity: ["h", "h", "d", "d", "d", "d"],
	accel: ["h", "h", "d", "d", "d", "d"],
	orientation: ["h", "h", "d", "d", "d", "d"],
	rawaccel: ["h", "h", "d", "d", "d", "d"],
	touchy: ["s", "s", "h", "h"],
	setcell: ["h", "h", "h"],
	directions: "h*",
	constraint: "h*"
};

function _getHardcodedOSCTypes(type) {
	if (HARDCODED_TYPES.hasOwnProperty(type)) return HARDCODED_TYPES[type];
	return null;
}

/**
 * @class
 * @desc <strong>Constructor for internal use only</strong>
 *
 * Representation of a Max object parameter. Usually, a parameter is simply a Max attribute. Setting the value of the
 * parameter will update the Max object attribute with the same name. Some parameters do not map to attributes, for
 * example the "distance" parameter of a slider object, which controls the value of the slider.
 * @extends XebraNode
 */

var ParamNode = function (_XebraNode) {
	_inherits(ParamNode, _XebraNode);

	/**
  * @param  {Number} id - The id of the node
  * @param  {String} type - Type identifier of the node
  * @param  {Number} creationSeq - The sequence number for the creation of this node
  */
	function ParamNode(id, type, creationSeq) {
		_classCallCheck(this, ParamNode);

		var _this = _possibleConstructorReturn(this, (ParamNode.__proto__ || (0, _getPrototypeOf2.default)(ParamNode)).call(this, id, type, creationSeq));

		_this._onParamChange = function (param) {
			_this.emit("change", _this);
		};

		_this._onParamSet = function (param) {
			_this.emit("set", _this);
		};

		_this._sequence = 0;
		_this._currentRemoteSequence = 0;
		_this._value = _getDefaultParamValue(type, null);

		// Not beautiful but given the way we have to mirror all OSC types across Max and the client
		// we hardcode the types for params that don't receive an initial value here
		_this._types = _getHardcodedOSCTypes(type);
		return _this;
	}

	/**
  * The sequence number associated with the most recent modification. Whenever the value of the parameter is updated
  * in Max or some other remote endpoint, this sequence number will increase.
  * @type {number}
  */

	_createClass(ParamNode, [{
		key: "_storeValue",

		// End of bound callbacks

		/**
   * @private
   */
		value: function _storeValue(value) {
			var val = _getDefaultParamValue(this.type, value);

			if (val && val.length === 1) {
				this._value = val[0];
			} else {
				this._value = val;
			}
		}

		/**
   * getter for the OSC value types
   * @ignore
   * @readonly
   * @type {string[]}
   */

	}, {
		key: "init",

		/**
   * Inits the node with the given value.
   * @ignore
   * @param  {Xebra.ParamValueType} value [description]
   */
		value: function init(value) {
			this._storeValue(value);
		}

		/**
   * Modifies the value of the parameter. This is used in order to apply remote modifications. Use the param.value
   * getter/setter if you want to read/change the value.
   * @ignore
   * @param  {Xebra.ParamValueType} value - The new value
   * @param  {string[]} value - The OSC types
   * @param  {number} remoteSequence - The remote sequence number
   * @fires ParamNode.change
   */

	}, {
		key: "modify",
		value: function modify(value, types, remoteSequence) {
			if (this._currentRemoteSequence && this._currentRemoteSequence >= remoteSequence) return;

			this._currentRemoteSequence = remoteSequence;
			this._storeValue(value);

			// don't overwrite types for certain value
			if (!HARDCODED_TYPES.hasOwnProperty(this.type)) {
				this._types = types;
			}

			/**
    * Parameter change event
    * @event ParamNode.change
    * @param {ParamNode} param this
    */
			this.emit("change", this);
		}
	}, {
		key: "remoteSequence",
		get: function get() {
			return this._currentRemoteSequence;
		}

		// Bound callbacks using fat arrow notation

		/**
   * @private
   * @param {ParamNode} param - The changed parameter
   */

		/**
   * @private
   * @param {ParamNode} param - The changed parameter
   */

	}, {
		key: "types",
		get: function get() {

			if (typeof this._types === "string") {
				if (this._types.charAt(1) === "*") {
					if (this._value === null) return [];
					return new Array(this._value.length).fill(this._types.charAt(0));
				}
			}

			return this._types;
		}

		/**
   * The client modification sequence number
   * @ignore
   * @readonly
   * @type {number}
   */

	}, {
		key: "sequence",
		get: function get() {
			return this._sequence;
		}

		/**
   * The current value of this parameter. Setting the value will trigger an update in Max, if connected. This will not
   * cause an ObjectNode.param_changed event to fire, however, since this is only fired on changes that come from Max.
   * @type {Xebra.ParamValueType}
   * @fires ParamNode#set
   */

	}, {
		key: "value",
		get: function get() {
			// handle enums
			if (this.getParamValue("style") === "enumindex") {
				var values = this.getParamValue("enumvals");
				if (!values) return null;
				return values[this._value];
			}
			return this._value;
		},
		set: function set(value) {
			this._storeValue(value);
			this._sequence++;
			/**
    * Parameter set event
    * @event ParamNode#set
    * @ignore
    * @param {ParamNode} param this
    */
			this.emit("set", this);
		}
	}]);

	return ParamNode;
}(_base2.default);

exports.default = ParamNode;
module.exports = exports["default"];

},{"./base.js":155,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21}],162:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _constants = require("../lib/constants.js");

var _objectNode = require("./objectNode.js");

var _objectNode2 = _interopRequireDefault(_objectNode);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

/**
 * @desc <strong>Constructor for internal use only</strong>
 *
 * Represent a single Max patcher. Use `getFrames` and `getObjects` to iterate over instances of {@link FrameNode} and
 * {@link ObjectNode}, respectively. The very handy `getObjectByScriptingName` function can be used to get the
 * {@link ObjectNode} instance bound to a Max object with the given `varname` attribute.
 * @class
 * @extends ObjectNode
 * @extends XebraNode
 */
var PatcherNode = function (_ObjectNode) {
	_inherits(PatcherNode, _ObjectNode);

	/**
  * @param  {number} id - The id of the node
  * @param  {string} type - Type identifier of the node
  * @param  {number} creationSeq - The sequence number for the creation of this node
  * @param  {number} parentId - The id of the parent node
  */
	function PatcherNode(id, type, creationSeq, parentId) {
		_classCallCheck(this, PatcherNode);

		var _this = _possibleConstructorReturn(this, (PatcherNode.__proto__ || (0, _getPrototypeOf2.default)(PatcherNode)).call(this, id, type, creationSeq, parentId));

		_this._onFrameChange = function (frame, param) {
			// position changed? We might have to figure out if this object needs
			// to be added to frame instances
			if (frame.viewMode === _constants.VIEW_MODES.PATCHING && param.type === "patching_rect" || frame.viewMode === _constants.VIEW_MODES.PRESENTATION && param.type === "presentation_rect") {
				_this._assignObjectsToFrame(frame);
			}

			/**
    * @event PatcherNode.frame_changed
    * @param {FrameNode} frame - The changed frame
    * @param {ParamNode} param - The parameter node
    */
			if (frame.isReady) _this.emit("frame_changed", frame, param);
		};

		_this._onFrameInitialized = function (frame) {
			_this.emit("frame_added", frame);
		};

		_this._onFrameViewModeChange = function (frame) {
			_this._assignObjectsToFrame(frame);
		};

		_this._onObjectInitialized = function (object) {
			var varname = object.getParamValue("varname");
			if (varname) {
				_this._storeScriptingNameLookup(object.id, varname);
			}
			_this._assignObjectToFrames(object);
			_this.emit("object_added", object);
		};

		_this._onObjectChange = function (obj, param) {
			// position changed? We might have to figure out if this object needs
			// to be added to frame instances
			//
			if (param.type === "presentation" || param.type === "patching_rect" || param.type === "presentation_rect") {
				_this._assignObjectToFrames(obj);
			}

			// varname changed? We have to update maps to/from the varname
			if (param.type === "varname") {
				_this._removeScriptingNameLookup(obj.id);
				_this._storeScriptingNameLookup(obj.id, param.value);
			}

			/**
    * @event PatcherNode.object_changed
    * @param {ObjectNode} object 	The changed object
    * @param {ParamNode}		param   The changed parameter
    */
			if (obj.isReady) _this.emit("object_changed", obj, param);
		};

		_this._onObjectDestroy = function (obj) {
			_this.removeObject(obj.id);
		};

		_this._onViewChange = function (view, param) {
			if (param.type === "presentation") _this._updateViewMode();
			_this.emit("param_changed", _this, param);
		};

		_this._onViewDestroy = function (view) {
			view.removeListener("param_changed", _this._onViewChange);
			view.removeListener("destroy", _this._onViewDestroy);
			_this._view = null;
		};

		_this._frames = new _set2.default();
		_this._objects = new _set2.default();

		_this._idsByScriptingName = new _map2.default();
		_this._scriptingNamesById = new _map2.default();

		_this._view = null;

		_this.on("initialized", _this._updateViewMode);
		return _this;
	}

	// Bound callbacks using fat arrow notation
	/**
  * @private
  * @param {FrameNode} frame - the changed frame
  * @param {ParamNode} param - the changed parameter
  * @fires XebraState.frame_changed
  */

	/**
  * @private
  * @param {FrameNode} frame - the initialized frame
  */

	/**
  * @private
  * @param {FrameNode} frame - The changed frame
  */

	_createClass(PatcherNode, [{
		key: "_removeScriptingNameLookup",

		/**
   * @private
   * @param {Xebra.NodeId} objectId - The id of the object
   */
		value: function _removeScriptingNameLookup(objectId) {
			var scriptName = this._scriptingNamesById.get(objectId);
			if (!scriptName) return;

			this._idsByScriptingName.delete(scriptName);
			this._scriptingNamesById.delete(objectId);
		}

		/**
   * @private
   * @param {Xebra.NodeId} objectId - The id of the object
   * @param {string} scriptingName - The scriptingName of the object
   */

	}, {
		key: "_storeScriptingNameLookup",
		value: function _storeScriptingNameLookup(objectId, scriptingName) {
			this._idsByScriptingName.set(scriptingName, objectId);
			this._scriptingNamesById.set(objectId, scriptingName);
		}

		/**
   * @private
   * @param {ObjectNode} obj - The new object
   * @fires PatcherNode.object_added
   */

		/**
   * @private
   * @param {ObjectNode} obj - The changed object
   * @param {ParamNode} param - The changed parameter
   * @fires PatcherNode.object_changed
   */

		/**
   * @private
   * @param {ObjectNode} obj - The destroyed object
   */

		/**
   * @private
   * @param {ObjectNode} view - The PatcherView object node
   * @param {ParamNode} param - the changed parameter
   */

		/**
   * @private
   * @param {ObjectNode} view - The PatcherView object node
   */

	}, {
		key: "_viewModeToRectParam",

		/**
   * @private
   */
		value: function _viewModeToRectParam(mode) {
			return mode === _constants.VIEW_MODES.PATCHING ? "patching_rect" : "presentation_rect";
		}

		/**
   * Assigns an object to the contained frames based on its rect position.
   * @private
   * @param {ObjectNode} obj - the object to assign
   */

	}, {
		key: "_assignObjectToFrames",
		value: function _assignObjectToFrames(obj) {
			var _this2 = this;

			this._frames.forEach(function (frameId) {

				var frame = _this2.getChild(frameId);
				var objRect = obj.getParamValue(_this2._viewModeToRectParam(frame.viewMode));
				var containsObject = frame.containsObject(obj.id);

				if (!objRect && !containsObject) return;

				// if we got no rect for the object or all vals are 0 (indicates not present in that view mode)
				// make sure to remove the obj from the frame if it has been there.
				if (containsObject && (!objRect || frame.viewMode === _constants.VIEW_MODES.PRESENTATION && !obj.getParamValue("presentation"))) {
					frame.removeObject(obj.id);
				} else {
					var containsRect = frame.containsRect(objRect);

					if (containsObject && !containsRect) {
						frame.removeObject(obj.id);
					} else if (!containsObject && containsRect) {
						frame.addObject(obj);
					}
				}
			}, this);
		}

		/**
   * Assigns the contained objects to the given frame based on the rect.
   * @private
   * @param {FrameNode} frame - the frame to assign objects to
   */

	}, {
		key: "_assignObjectsToFrame",
		value: function _assignObjectsToFrame(frame) {
			var _this3 = this;

			var rectParamName = this._viewModeToRectParam(frame.viewMode);

			this._objects.forEach(function (objId) {

				var obj = _this3.getChild(objId);

				var objRect = obj.getParamValue(rectParamName);
				var containsObject = frame.containsObject(obj.id);

				if (!objRect && !containsObject) return;

				// if we got no rect for the object or all vals are 0 (indicates not present in that view mode)
				// make sure to remove the obj from the frame if it has been there.
				if (containsObject && (!objRect || frame.viewMode === _constants.VIEW_MODES.PRESENTATION && !obj.getParamValue("presentation"))) {
					frame.removeObject(obj.id);
				} else {
					var containsRect = frame.containsRect(objRect);

					if (containsObject && !containsRect) {
						frame.removeObject(obj.id);
					} else if (!containsObject && containsRect) {
						frame.addObject(obj);
					}
				}
			}, this);
		}

		/**
   * @private
   */

	}, {
		key: "_updateViewMode",
		value: function _updateViewMode() {
			var _this4 = this;

			var mode = this.viewMode;

			this._frames.forEach(function (frameId) {

				var frame = _this4.getChild(frameId);
				frame.patcherViewMode = mode;
			}, this);
		}

		/**
   * Adds a frame to the patcher.
   * @ignore
   * @param {FrameNode} frame
   * @fires XebraState.frame_added
   * @listens ObjectNode.param_changed
   */

	}, {
		key: "addFrame",
		value: function addFrame(frame) {
			// we add the frame to the frames list but don't directly assign objects. This
			// is due to the design of the protocol delivering objects without an initial state so we
			// don't have the "patching_rect" from the beginning on. Ouch! Luckily this will be emitted
			// as an "param_changed" event so the assignment will happen there as we need to redo it whenever
			// the frame is moved anyway.

			frame.patcherViewMode = this.viewMode; // set the patcher's view mode

			this.addChild(frame.id, frame);
			this._frames.add(frame.id);

			frame.on("param_changed", this._onFrameChange);
			frame.on("viewmode_change", this._onFrameViewModeChange);

			if (frame.isReady) {
				this.emit("frame_added", frame);
			} else {
				frame.once("initialized", this._onFrameInitialized);
			}
		}

		/**
   * Adds an object to the patcher.
   * @ignore
   * @param {ObjectNode} obj
   * @listens ObjectNode.param_changed
   * @listens ObjectNode.destroy
   * @fires XebraState.object_added
   */

	}, {
		key: "addObject",
		value: function addObject(obj) {
			this.addChild(obj.id, obj);

			if (obj.type === "patcherview") {
				this._view = obj;
				obj.on("param_changed", this._onViewChange);
				obj.on("destroy", this._onViewDestroy);
			} else {
				this._objects.add(obj.id);
				obj.on("param_changed", this._onObjectChange);
				obj.on("destroy", this._onObjectDestroy);

				if (obj.isReady) {
					this.emit("object_added", obj);
					this._assignObjectToFrames(obj);
				} else {
					obj.once("initialized", this._onObjectInitialized);
				}
			}
		}

		/**
   * Returns a list of the names of all mira.channel objects
   * @return {string[]}
   */

	}, {
		key: "getChannelNames",
		value: function getChannelNames() {
			var _this5 = this;

			var names = new _set2.default();
			this._objects.forEach(function (id) {
				var obj = _this5.getChild(id);
				if (obj.type === "mira.channel") {
					names.add(obj.getParamValue("name"));
				}
			}, this);
			return (0, _from2.default)(names);
		}

		/**
   * Returns the frame with the given id.
   * @param  {Xebra.NodeId} id
   * @return {Frame|null}
   */

	}, {
		key: "getFrame",
		value: function getFrame(id) {
			return this.getChild(id);
		}

		/**
   * Returns a list of frames that are present in this patch.
   * @return {FrameNode[]}
  	 */

	}, {
		key: "getFrames",
		value: function getFrames() {
			var _this6 = this;

			var frames = [];
			this._frames.forEach(function (id) {
				frames.push(_this6.getChild(id));
			}, this);

			return frames;
		}

		/**
   * Returns the object with the given id.
   * @param  {Xebra.NodeId} id
   * @return {ObjectNode|null}
   */

	}, {
		key: "getObject",
		value: function getObject(id) {
			return this.getChild(id);
		}

		/**
   * Returns the object with the given scripting name.
   * @param  {String} scripting_name
   * @return {ObjectNode|null}
   */

	}, {
		key: "getObjectByScriptingName",
		value: function getObjectByScriptingName(scriptingName) {
			if (this._idsByScriptingName.has(scriptingName)) return this.getChild(this._idsByScriptingName.get(scriptingName));
			return null;
		}

		/**
   * Returns a list of objects that are present in this patch.
   * @return {ObjectNode[]}
   */

	}, {
		key: "getObjects",
		value: function getObjects() {
			var _this7 = this;

			var objects = [];

			this._objects.forEach(function (id) {
				objects.push(_this7.getChild(id));
			}, this);

			return objects;
		}

		/**
   * Removes the frame identified by the given id from the patch.
   * @ignore
   * @param  {Xebra.NodeId} id
   * @fires XebraState.frame_removed
   */

	}, {
		key: "removeFrame",
		value: function removeFrame(id) {
			var frame = this.removeChild(id);

			if (frame) {

				this._frames.delete(id);

				// make sure to clean up attached event listeners
				frame.removeListener("param_changed", this._onFrameChange);
				frame.removeListener("viewmode_change", this._onFrameViewModeChange);
				frame.removeListener("initialized", this._onFrameInitialized);

				if (frame.isReady) this.emit("frame_removed", frame);
			}
		}

		/**
   * Removes the object identified by the given id from the patch.
   * @ignore
   * @fires XebraState.object_removed
   * @param  {Xebra.NodeId} id
   */

	}, {
		key: "removeObject",
		value: function removeObject(id) {
			var obj = this.removeChild(id);

			if (obj) {

				this._objects.delete(id);
				this._removeScriptingNameLookup(id);

				// make sure to clean up attached event listeners
				obj.removeListener("param_changed", this._onObjectChange);
				obj.removeListener("destroy", this._onObjectDestroy);
				obj.removeListener("initialized", this._onObjectInitialized);

				if (obj.isReady) this.emit("object_removed", obj);
			}
		}
	}, {
		key: "name",

		// End of bound callbacks

		/**
   * Name of the patcher (same as the filename for saved patchers).
   * @type {string}
   */
		get: function get() {
			return this._view ? this._view.getParamValue("name") : "";
		}

		/**
   * Indicates whether the patcher is currently locked or not
   * @return {boolean}
   */

	}, {
		key: "locked",
		get: function get() {
			var locked = this._view ? this._view.getParamValue("locked") : 0;
			return locked ? true : false;
		}

		/**
   * Returns the current background color of the patcher considering whether it's currently locked or not
   * @return {Color}
   */

	}, {
		key: "bgColor",
		get: function get() {
			var bgcolor = this.locked ? this.getParamValue("locked_bgcolor") : this.getParamValue("editing_bgcolor");
			return bgcolor || [1, 1, 1, 1];
		}

		/**
   * Returns whether the Max patcher is currently in Presentation or Patching display.
   * @type {number}
   * @see Xebra.VIEW_MODES
   */

	}, {
		key: "viewMode",
		get: function get() {
			if (!this._view) {
				return this.getParamValue("openinpresentation") ? _constants.VIEW_MODES.PRESENTATION : _constants.VIEW_MODES.PATCHING;
			}
			return this._view.getParamValue("presentation") ? _constants.VIEW_MODES.PRESENTATION : _constants.VIEW_MODES.PATCHING;
		}
	}]);

	return PatcherNode;
}(_objectNode2.default);

exports.default = PatcherNode;
module.exports = exports["default"];

},{"../lib/constants.js":152,"./objectNode.js":160,"babel-runtime/core-js/array/from":5,"babel-runtime/core-js/map":9,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/set":19,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21}],163:[function(require,module,exports){
"use strict";

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault2(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault2(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault2(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;(0, _defineProperty2.default)(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

var _get = function get(object, property, receiver) {
	if (object === null) object = Function.prototype;var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);if (desc === undefined) {
		var parent = (0, _getPrototypeOf2.default)(object);if (parent === null) {
			return undefined;
		} else {
			return get(parent, property, receiver);
		}
	} else if ("value" in desc) {
		return desc.value;
	} else {
		var getter = desc.get;if (getter === undefined) {
			return undefined;
		}return getter.call(receiver);
	}
};

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj };
}

var _objectList = require("../lib/objectList.js");

var _constants = require("../lib/constants.js");

var _resource = require("../lib/resource.js");

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
	}subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
}

function isImage(v) {
	return v && v !== _constants.EMPTY_RESOURCE;
}

/**
 * Request and manage remote resources from the Max seach path. A resource includes both metadata, like image size and
 * file type, as well as the file data itself. Only images are currently supported.
 *
 * This Mixin is currently applied to instances of ObjectNode representing fpic, live.tab and live.text.
 *
 * @mixin ResourceObjectMixin
 * @example
 * // An ObjectNode that uses resources will return a nonzero value from getResourceCount
 * const fpicObject;
 * const resourceCount = fpicObject.getResourceCount(); // Will always be one
 *
 * // To get a specific resource, use the getResourceAtIndex function
 * const resource = fpicObject.getResourceAtIndex(0);
 *
 * // ObjectNodes that use resources will manage those resources on their own. If you'd like
 * // to handle the data for that resource as well, then you must register another listener.
 * // The resource doesn't hold on to data from Max once it receives it, so be sure to listen for {@link Resource.event:data_received}
 * // events in order to handle resource data.
 * resource.on("data_received", (filename, data_uri) => {
 * // Do something with the data
 * });
 *
 * // For resources that belong to an ObjectNode, it doesn't make sense to set the filename and
 * // dimensions properties of the resource directly. Rather, you can set the parameters of the
 * // ObjectNode, and it will manage resources itself.
 * fpicObject.setParamValue("pic", "alex.png"); // Will request new resource data.
 */

exports.default = function (objClass) {
	return function (_objClass) {
		_inherits(_class2, _objClass);

		function _class2(id, type, creationSeq, patcherId) {
			_classCallCheck(this, _class2);

			var _this = _possibleConstructorReturn(this, (_class2.__proto__ || (0, _getPrototypeOf2.default)(_class2)).apply(this, arguments));

			_this._onParamChangeForResources = function (param) {
				if (_this._type === _objectList.OBJECTS.FPIC) {
					if (param.type === "pic") {
						if (isImage(param.value)) {
							_this._resources[0].filename = param.value;
						} else if (!_this._resources[0].isEmpty) {
							_this._resources[0].clear();
						}
					}
				} else if (_this._type === _objectList.OBJECTS.LIVE_TEXT) {
					if (param.type === "pictures") {
						for (var i = 0; i < param.value.length; i++) {
							if (isImage(param.value[i])) {
								_this._resources[i].filename = param.value[i];
							} else if (!_this._resources[i].isEmpty) {
								_this._resources[i].clear();
							}
						}
					}
				} else if (_this._type === _objectList.OBJECTS.LIVE_TAB) {
					if (param.type === "pictures") {

						// For now, create a whole new array of resources
						_this._resources.forEach(function (r) {
							r.destroy();
						});

						_this._resources = [];

						if (param.value) {
							var enumerableValue = param.value;
							if (!(param.value instanceof Array)) {
								enumerableValue = [param.value];
							}

							enumerableValue.forEach(function (filename) {
								var res = _this._resourceController.createResource(_this.id);
								_this._resources.push(res);
								res.filename = filename;
							});
						}

						/**
       * Resources Changed event. Fired internally whenever an object node has a new array of resources.
       * @event ResourceObjectMixin.resources_changed
       * @param {ObjectNode} object     This
       */
						_this.emit("resources_changed", _this);
					}
				}
			};

			_this._resources = [];
			_this._resourceController = new _resource.ResourceController();
			var resourceCount = 0;

			if (type === _objectList.OBJECTS.FPIC) {
				resourceCount = 1;
			} else if (type === _objectList.OBJECTS.LIVE_TEXT) {
				resourceCount = 2;
			}

			for (var i = 0; i < resourceCount; i++) {
				var resource = _this._resourceController.createResource(_this.id);
				_this._resources.push(resource);
			}
			return _this;
		}

		// Bound callbacks using fat arrow notation

		/**
   * Callback for handling resource related parameter events
   * @private
   * @memberof ResourceObjectMixin
   * @param {ParamNode}
   */

		_createClass(_class2, [{
			key: "addParam",

			// End of bound callbacks

			/**
    * @ignore
    * @override
    * @memberof ResourceObjectMixin
    * @instance
    */
			value: function addParam(param) {
				_get(_class2.prototype.__proto__ || (0, _getPrototypeOf2.default)(_class2.prototype), "addParam", this).call(this, param);
				param.on("change", this._onParamChangeForResources);
			}

			/**
    * @memberof ResourceObjectMixin
    * @instance
    * @private
    * @return {Object} the ResourceController for this object's Resources
    */

		}, {
			key: "getResourceCount",

			/**
    * @memberof ResourceObjectMixin
    * @instance
    * @return {number} number of available resources
    */
			value: function getResourceCount() {
				return this._resources ? this._resources.length : 0;
			}

			/**
    * @param {number} idx - The resource index
    * @memberof ResourceObjectMixin
    * @instance
    * @throws throws an error if the resource index is out of bounds
    */

		}, {
			key: "getResourceAtIndex",
			value: function getResourceAtIndex(idx) {
				if (idx < 0 || idx >= this._resources.length) throw new Error("Invalid Resource Index. Object has " + this.getResourceCount() + " resources.");
				return this._resources[idx];
			}

			/**
    * @ignore
    * @override
    * @memberof ResourceObjectMixin
    * @instance
    */

		}, {
			key: "destroy",
			value: function destroy() {
				_get(_class2.prototype.__proto__ || (0, _getPrototypeOf2.default)(_class2.prototype), "destroy", this).call(this);
				this._resourceController.removeAllListeners();
				if (this._resources && this._resources.length) {
					this._resources.forEach(function (res) {
						res.destroy();
					});
				}
			}
		}, {
			key: "resourceController",
			get: function get() {
				return this._resourceController;
			}
		}]);

		return _class2;
	}(objClass);
};

module.exports = exports["default"];

},{"../lib/constants.js":152,"../lib/objectList.js":153,"../lib/resource.js":154,"babel-runtime/core-js/object/create":11,"babel-runtime/core-js/object/define-property":12,"babel-runtime/core-js/object/get-own-property-descriptor":14,"babel-runtime/core-js/object/get-prototype-of":15,"babel-runtime/core-js/object/set-prototype-of":17,"babel-runtime/core-js/symbol":20,"babel-runtime/core-js/symbol/iterator":21}]},{},[151])(151)
});