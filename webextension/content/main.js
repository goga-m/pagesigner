// Nodejs depedencies
var fs = require('fs')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var axios = require('axios')
var convert = require('xml-js');
var atob = require('atob')
var btoa = require('btoa')
var crypto = require('crypto')
var getRandomValues = require('get-random-values')

//Helper variables on NodeJS
navigator = {}
// Helper functions
var xml2json = (xml) => {
  const jsonData101 = convert.xml2json(xml, { compact: true })
  const jsonDataJson = JSON.parse(jsonData101)
  return jsonDataJson
}



// Libs
var AbstractSocket = require('./libs/socket')

// Utils
var { ba2int, assert } = require('./libs/utils')


// CryptoJS libraries
var CryptoJS = require('./libs/CryptoJS/core')

// tlns_utils
var {
  ab2ba,
  ba2ab,
  ba2ua,
  ua2ba,
  wa2ba,
  ba2hex,
  hex2ba,
  bi2ba,
  str2ba,
  ba2str,
  hmac,
  sha1,
  sha256,
  md5,
  xor,
  isdefined,
  log,
  getRandom,
  b64encode,
  b64decode,
  dechunk_http,
  gunzip_http,
  getTime
} = require('./libs/tlns_utils')

var { check_oracle } = require('./libs/oracles.js')
var { 
  TLSNClientSession,
  prepare_pms,
  get_certificate,
  decrypt_html,
  start_audit
} = require('./libs/tlsn')


// Globals 

// TODO: Make these parameters configurable for custom oracle server
var snapshotID = 'snap-03bae56722ceec3f0';
var imageID = 'ami-1f447c65';
var oracles_intact = false; //must be explicitely set to true

var oracle = {
  'name': 'tlsnotarygroup5',
  'IP': '54.158.251.14',
  'port': '10011',
'DI':'https://ec2.us-east-1.amazonaws.com/?AWSAccessKeyId=AKIAIHZGACNJKBHFWOTQ&Action=DescribeInstances&Expires=2025-01-01&InstanceId=i-0858c02ad9a33c579&SignatureMethod=HmacSHA256&SignatureVersion=2&Version=2014-10-01&Signature=AWkxF%2FlBVL%2FBl2WhQC62qGJ80qhL%2B%2B%2FJXvSp8mm5sIg%3D',
'DV':'https://ec2.us-east-1.amazonaws.com/?AWSAccessKeyId=AKIAIHZGACNJKBHFWOTQ&Action=DescribeVolumes&Expires=2025-01-01&SignatureMethod=HmacSHA256&SignatureVersion=2&Version=2014-10-01&VolumeId=vol-056223d4e1ce55d9c&Signature=DCYnV1vNqE3cyTm6bmtNS1idGdBT7DcbeLtZfcm3ljo%3D',
'GCO':'https://ec2.us-east-1.amazonaws.com/?AWSAccessKeyId=AKIAIHZGACNJKBHFWOTQ&Action=GetConsoleOutput&Expires=2025-01-01&InstanceId=i-0858c02ad9a33c579&SignatureMethod=HmacSHA256&SignatureVersion=2&Version=2014-10-01&Signature=I%2F1kp7oSli9GvYrrP5HD52D6nOy7yCq9dowaDomSAOQ%3D',
'GU':'https://iam.amazonaws.com/?AWSAccessKeyId=AKIAIHZGACNJKBHFWOTQ&Action=GetUser&Expires=2025-01-01&SignatureMethod=HmacSHA256&SignatureVersion=2&Version=2010-05-08&Signature=N%2BsdNA6z3QReVsHsf7RV4uZLzS5Pqi0n3QSfqBAMs8o%3D',
'DIA':'https://ec2.us-east-1.amazonaws.com/?AWSAccessKeyId=AKIAIHZGACNJKBHFWOTQ&Action=DescribeInstanceAttribute&Attribute=userData&Expires=2025-01-01&InstanceId=i-0858c02ad9a33c579&SignatureMethod=HmacSHA256&SignatureVersion=2&Version=2014-10-01&Signature=ENM%2Bw9WkB4U4kYDMN6kowJhZenuCEX3c1G7xSuu6GZA%3D',
  'instanceId': 'i-0858c02ad9a33c579',
  'modulus': [186,187,68,57,92,215,243,62,188,248,16,13,3,29,40,217,208,206,78,13,202,184,82,121,26,51,203,41,169,11,4,102,228,127,110,117,170,48,210,212,160,51,175,246,110,178,43,106,94,255,69,0,217,91,225,7,84,133,193,43,177,254,75,191,109,50,212,190,177,61,64,230,188,105,56,252,40,3,91,190,117,1,52,30,210,137,136,13,216,110,83,21,164,56,248,215,33,159,129,149,85,236,130,194,79,227,184,135,133,61,85,201,243,225,121,233,36,84,207,218,86,68,99,21,150,252,28,220,4,93,81,57,214,94,147,56,234,236,0,178,93,39,48,143,21,120,241,33,73,239,185,255,255,79,112,194,72,226,84,158,182,96,159,33,111,57,212,27,23,133,223,152,101,240,98,181,94,38,147,195,187,245,226,158,11,102,91,91,47,146,178,65,180,73,176,209,32,27,99,183,254,161,115,38,186,31,132,165,252,189,226,72,152,219,177,52,47,178,121,45,30,143,78,142,223,133,112,136,72,165,166,225,18,62,249,119,157,198,68,114,69,199,32,121,201,72,159,13,37,66,160,210,83,163,131,128,54,178,219,5,74,94,214,244,43,123,140,156,192,89,120,211,61,192,76,70,176,122,247,198,21,220,79,212,200,192,88,126,200,115,71,102,66,92,102,60,179,213,125,123,86,195,67,204,71,222,249,46,242,179,11,111,12,158,91,189,215,72,190,15,165,11,102,51,1,91,116,127,31,12,55,193,249,170,15,231,13,189,60,73,8,239,238,18,44,131,78,190,164,46,41,169,139,43,230,105,2,170,231,202,203,126,74,202,172,112,217,194,26,202,140,71,183,45,239,213,254,213,139,27,95,163,172,27,176,189,233,59,181,49,225,220,125,90,182,120,183,236,62,100,170,130,122,202,206,193,77,130,250,167,187,238,39,197,216,183,56,203,72,122,168,64,217,225,8,233,13,164,224,23,255,239,230,44,90,31,149,106,207,28,9,249,154,163,84,231,149,167,59,194,193,41,106,239,30,137,188,78,45,66,30,224,233,181,132,146,106,227,135,229,106,71,168,69,149,167,154,150,106,29,130,114,109,11,66,120,42,128,247,166,248,152,103,131,56,88,37,46,19,240,110,135,15,234,44,39,87,65,232,105,2,163]
}


//there can be potentially multiple oracles to choose from
var oracles = [];
oracles.push(oracle);
//all servers trusted to perform notary (including non-oracles)
//TODO: configurable
var pagesigner_servers = [oracle];





/**
 * File: verifychain/buffer.js
 */
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],2:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],3:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"buffer":[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding) {
  var self = this
  if (!(self instanceof Buffer)) return new Buffer(subject, encoding)

  var type = typeof subject
  var length

  if (type === 'number') {
    length = +subject
  } else if (type === 'string') {
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) {
    // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data)) subject = subject.data
    length = +subject.length
  } else {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (length > kMaxLength) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum size: 0x' +
      kMaxLength.toString(16) + ' bytes')
  }

  if (length < 0) length = 0
  else length >>>= 0 // coerce to uint32

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    self = Buffer._augment(new Uint8Array(length)) // eslint-disable-line consistent-this
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    self.length = length
    self._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    self._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++) {
        self[i] = subject.readUInt8(i)
      }
    } else {
      for (i = 0; i < length; i++) {
        self[i] = ((subject[i] % 256) + 256) % 256
      }
    }
  } else if (type === 'string') {
    self.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < length; i++) {
      self[i] = 0
    }
  }

  if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent

  return self
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, totalLength) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function byteLength (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function toString (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0

  if (length < 0 || offset < 0 || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, target_start, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (target_start >= target.length) target_start = target.length
  if (!target_start) target_start = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (target_start < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - target_start < end - start) {
    end = target.length - target_start + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":1,"ieee754":2,"is-array":3}]},{},[]);

/**
 * End File: verifychain/buffer.js
 */

/**
 * File: verifychain/asn1.js
 */

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var asn1 = require('../asn1');
var inherits = require('inherits');

var api = exports;

api.define = function define(name, body) {
  return new Entity(name, body);
};

function Entity(name, body) {
  this.name = name;
  this.body = body;

  this.decoders = {};
  this.encoders = {};
};

Entity.prototype._createNamed = function createNamed(base) {
  var named;
  try {
    named = require('vm').runInThisContext(
      '(function ' + this.name + '(entity) {\n' +
      '  this._initNamed(entity);\n' +
      '})'
    );
  } catch (e) {
    named = function (entity) {
      this._initNamed(entity);
    };
  }
  inherits(named, base);
  named.prototype._initNamed = function initnamed(entity) {
    base.call(this, entity);
  };

  return new named(this);
};

Entity.prototype._getDecoder = function _getDecoder(enc) {
  // Lazily create decoder
  if (!this.decoders.hasOwnProperty(enc))
    this.decoders[enc] = this._createNamed(asn1.decoders[enc]);
  return this.decoders[enc];
};

Entity.prototype.decode = function decode(data, enc, options) {
  return this._getDecoder(enc).decode(data, options);
};

Entity.prototype._getEncoder = function _getEncoder(enc) {
  // Lazily create encoder
  if (!this.encoders.hasOwnProperty(enc))
    this.encoders[enc] = this._createNamed(asn1.encoders[enc]);
  return this.encoders[enc];
};

Entity.prototype.encode = function encode(data, enc, /* internal */ reporter) {
  return this._getEncoder(enc).encode(data, reporter);
};

},{"../asn1":"asn1.js","inherits":13,"vm":19}],2:[function(require,module,exports){
var inherits = require('inherits');
var Reporter = require('../base').Reporter;
var Buffer = require('buffer').Buffer;

function DecoderBuffer(base, options) {
  Reporter.call(this, options);
  if (!Buffer.isBuffer(base)) {
    this.error('Input not Buffer');
    return;
  }

  this.base = base;
  this.offset = 0;
  this.length = base.length;
}
inherits(DecoderBuffer, Reporter);
exports.DecoderBuffer = DecoderBuffer;

DecoderBuffer.prototype.save = function save() {
  return { offset: this.offset };
};

DecoderBuffer.prototype.restore = function restore(save) {
  // Return skipped data
  var res = new DecoderBuffer(this.base);
  res.offset = save.offset;
  res.length = this.offset;

  this.offset = save.offset;

  return res;
};

DecoderBuffer.prototype.isEmpty = function isEmpty() {
  return this.offset === this.length;
};

DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
  if (this.offset + 1 <= this.length)
    return this.base.readUInt8(this.offset++, true);
  else
    return this.error(fail || 'DecoderBuffer overrun');
}

DecoderBuffer.prototype.skip = function skip(bytes, fail) {
  if (!(this.offset + bytes <= this.length))
    return this.error(fail || 'DecoderBuffer overrun');

  var res = new DecoderBuffer(this.base);

  // Share reporter state
  res._reporterState = this._reporterState;

  res.offset = this.offset;
  res.length = this.offset + bytes;
  this.offset += bytes;
  return res;
}

DecoderBuffer.prototype.raw = function raw(save) {
  return this.base.slice(save ? save.offset : this.offset, this.length);
}

function EncoderBuffer(value, reporter) {
  if (Array.isArray(value)) {
    this.length = 0;
    this.value = value.map(function(item) {
      if (!(item instanceof EncoderBuffer))
        item = new EncoderBuffer(item, reporter);
      this.length += item.length;
      return item;
    }, this);
  } else if (typeof value === 'number') {
    if (!(0 <= value && value <= 0xff))
      return reporter.error('non-byte EncoderBuffer value');
    this.value = value;
    this.length = 1;
  } else if (typeof value === 'string') {
    this.value = value;
    this.length = Buffer.byteLength(value);
  } else if (Buffer.isBuffer(value)) {
    this.value = value;
    this.length = value.length;
  } else {
    return reporter.error('Unsupported type: ' + typeof value);
  }
}
exports.EncoderBuffer = EncoderBuffer;

EncoderBuffer.prototype.join = function join(out, offset) {
  if (!out)
    out = new Buffer(this.length);
  if (!offset)
    offset = 0;

  if (this.length === 0)
    return out;

  if (Array.isArray(this.value)) {
    this.value.forEach(function(item) {
      item.join(out, offset);
      offset += item.length;
    });
  } else {
    if (typeof this.value === 'number')
      out[offset] = this.value;
    else if (typeof this.value === 'string')
      out.write(this.value, offset);
    else if (Buffer.isBuffer(this.value))
      this.value.copy(out, offset);
    offset += this.length;
  }

  return out;
};

},{"../base":3,"buffer":15,"inherits":13}],3:[function(require,module,exports){
var base = exports;

base.Reporter = require('./reporter').Reporter;
base.DecoderBuffer = require('./buffer').DecoderBuffer;
base.EncoderBuffer = require('./buffer').EncoderBuffer;
base.Node = require('./node');

},{"./buffer":2,"./node":4,"./reporter":5}],4:[function(require,module,exports){
var Reporter = require('../base').Reporter;
var EncoderBuffer = require('../base').EncoderBuffer;
var assert = require('minimalistic-assert');

// Supported tags
var tags = [
  'seq', 'seqof', 'set', 'setof', 'octstr', 'bitstr', 'objid', 'bool',
  'gentime', 'utctime', 'null_', 'enum', 'int', 'ia5str'
];

// Public methods list
var methods = [
  'key', 'obj', 'use', 'optional', 'explicit', 'implicit', 'def', 'choice',
  'any'
].concat(tags);

// Overrided methods list
var overrided = [
  '_peekTag', '_decodeTag', '_use',
  '_decodeStr', '_decodeObjid', '_decodeTime',
  '_decodeNull', '_decodeInt', '_decodeBool', '_decodeList',

  '_encodeComposite', '_encodeStr', '_encodeObjid', '_encodeTime',
  '_encodeNull', '_encodeInt', '_encodeBool'
];

function Node(enc, parent) {
  var state = {};
  this._baseState = state;

  state.enc = enc;

  state.parent = parent || null;
  state.children = null;

  // State
  state.tag = null;
  state.args = null;
  state.reverseArgs = null;
  state.choice = null;
  state.optional = false;
  state.any = false;
  state.obj = false;
  state.use = null;
  state.useDecoder = null;
  state.key = null;
  state['default'] = null;
  state.explicit = null;
  state.implicit = null;

  // Should create new instance on each method
  if (!state.parent) {
    state.children = [];
    this._wrap();
  }
}
module.exports = Node;

var stateProps = [
  'enc', 'parent', 'children', 'tag', 'args', 'reverseArgs', 'choice',
  'optional', 'any', 'obj', 'use', 'alteredUse', 'key', 'default', 'explicit',
  'implicit'
];

Node.prototype.clone = function clone() {
  var state = this._baseState;
  var cstate = {};
  stateProps.forEach(function(prop) {
    cstate[prop] = state[prop];
  });
  var res = new this.constructor(cstate.parent);
  res._baseState = cstate;
  return res;
};

Node.prototype._wrap = function wrap() {
  var state = this._baseState;
  methods.forEach(function(method) {
    this[method] = function _wrappedMethod() {
      var clone = new this.constructor(this);
      state.children.push(clone);
      return clone[method].apply(clone, arguments);
    };
  }, this);
};

Node.prototype._init = function init(body) {
  var state = this._baseState;

  assert(state.parent === null);
  body.call(this);

  // Filter children
  state.children = state.children.filter(function(child) {
    return child._baseState.parent === this;
  }, this);
  assert.equal(state.children.length, 1, 'Root node can have only one child');
};

Node.prototype._useArgs = function useArgs(args) {
  var state = this._baseState;

  // Filter children and args
  var children = args.filter(function(arg) {
    return arg instanceof this.constructor;
  }, this);
  args = args.filter(function(arg) {
    return !(arg instanceof this.constructor);
  }, this);

  if (children.length !== 0) {
    assert(state.children === null);
    state.children = children;

    // Replace parent to maintain backward link
    children.forEach(function(child) {
      child._baseState.parent = this;
    }, this);
  }
  if (args.length !== 0) {
    assert(state.args === null);
    state.args = args;
    state.reverseArgs = args.map(function(arg) {
      if (typeof arg !== 'object' || arg.constructor !== Object)
        return arg;

      var res = {};
      Object.keys(arg).forEach(function(key) {
        if (key == (key | 0))
          key |= 0;
        var value = arg[key];
        res[value] = key;
      });
      return res;
    });
  }
};

//
// Overrided methods
//

overrided.forEach(function(method) {
  Node.prototype[method] = function _overrided() {
    var state = this._baseState;
    throw new Error(method + ' not implemented for encoding: ' + state.enc);
  };
});

//
// Public methods
//

tags.forEach(function(tag) {
  Node.prototype[tag] = function _tagMethod() {
    var state = this._baseState;
    var args = Array.prototype.slice.call(arguments);

    assert(state.tag === null);
    state.tag = tag;

    this._useArgs(args);

    return this;
  };
});

Node.prototype.use = function use(item) {
  var state = this._baseState;

  assert(state.use === null);
  state.use = item;

  return this;
};

Node.prototype.optional = function optional() {
  var state = this._baseState;

  state.optional = true;

  return this;
};

Node.prototype.def = function def(val) {
  var state = this._baseState;

  assert(state['default'] === null);
  state['default'] = val;
  state.optional = true;

  return this;
};

Node.prototype.explicit = function explicit(num) {
  var state = this._baseState;

  assert(state.explicit === null && state.implicit === null);
  state.explicit = num;

  return this;
};

Node.prototype.implicit = function implicit(num) {
  var state = this._baseState;

  assert(state.explicit === null && state.implicit === null);
  state.implicit = num;

  return this;
};

Node.prototype.obj = function obj() {
  var state = this._baseState;
  var args = Array.prototype.slice.call(arguments);

  state.obj = true;

  if (args.length !== 0)
    this._useArgs(args);

  return this;
};

Node.prototype.key = function key(newKey) {
  var state = this._baseState;

  assert(state.key === null);
  state.key = newKey;

  return this;
};

Node.prototype.any = function any() {
  var state = this._baseState;

  state.any = true;

  return this;
};

Node.prototype.choice = function choice(obj) {
  var state = this._baseState;

  assert(state.choice === null);
  state.choice = obj;
  this._useArgs(Object.keys(obj).map(function(key) {
    return obj[key];
  }));

  return this;
};

//
// Decoding
//

Node.prototype._decode = function decode(input) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return input.wrapResult(state.children[0]._decode(input));

  var result = state['default'];
  var present = true;

  var prevKey;
  if (state.key !== null)
    prevKey = input.enterKey(state.key);

  // Check if tag is there
  if (state.optional) {
    present = this._peekTag(
      input,
      state.explicit !== null ? state.explicit :
          state.implicit !== null ? state.implicit :
              state.tag || 0
    );
    if (input.isError(present))
      return present;
  }

  // Push object on stack
  var prevObj;
  if (state.obj && present)
    prevObj = input.enterObject();

  if (present) {
    // Unwrap explicit values
    if (state.explicit !== null) {
      var explicit = this._decodeTag(input, state.explicit);
      if (input.isError(explicit))
        return explicit;
      input = explicit;
    }

    // Unwrap implicit and normal values
    if (state.use === null && state.choice === null) {
      if (state.any)
        var save = input.save();
      var body = this._decodeTag(
        input,
        state.implicit !== null ? state.implicit : state.tag,
        state.any
      );
      if (input.isError(body))
        return body;

      if (state.any)
        result = input.raw(save);
      else
        input = body;
    }

    // Select proper method for tag
    if (state.any)
      result = result;
    else if (state.choice === null)
      result = this._decodeGeneric(state.tag, input);
    else
      result = this._decodeChoice(input);

    if (input.isError(result))
      return result;

    // Decode children
    if (!state.any && state.choice === null && state.children !== null) {
      var fail = state.children.some(function decodeChildren(child) {
        // NOTE: We are ignoring errors here, to let parser continue with other
        // parts of encoded data
        child._decode(input);
      });
      if (fail)
        return err;
    }
  }

  // Pop object
  if (state.obj && present)
    result = input.leaveObject(prevObj);

  // Set key
  if (state.key !== null && (result !== null || present === true))
    input.leaveKey(prevKey, state.key, result);

  return result;
};

Node.prototype._decodeGeneric = function decodeGeneric(tag, input) {
  var state = this._baseState;

  if (tag === 'seq' || tag === 'set')
    return null;
  if (tag === 'seqof' || tag === 'setof')
    return this._decodeList(input, tag, state.args[0]);
  else if (tag === 'octstr' || tag === 'bitstr' || tag === 'ia5str')
    return this._decodeStr(input, tag);
  else if (tag === 'objid' && state.args)
    return this._decodeObjid(input, state.args[0], state.args[1]);
  else if (tag === 'objid')
    return this._decodeObjid(input, null, null);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._decodeTime(input, tag);
  else if (tag === 'null_')
    return this._decodeNull(input);
  else if (tag === 'bool')
    return this._decodeBool(input);
  else if (tag === 'int' || tag === 'enum')
    return this._decodeInt(input, state.args && state.args[0]);
  else if (state.use !== null)
    return this._getUse(state.use, input._reporterState.obj)._decode(input);
  else
    return input.error('unknown tag: ' + tag);

  return null;
};

Node.prototype._getUse = function _getUse(entity, obj) {

  var state = this._baseState;
  // Create altered use decoder if implicit is set
  state.useDecoder = this._use(entity, obj);
  assert(state.useDecoder._baseState.parent === null);
  state.useDecoder = state.useDecoder._baseState.children[0];
  if (state.implicit !== state.useDecoder._baseState.implicit) {
    state.useDecoder = state.useDecoder.clone();
    state.useDecoder._baseState.implicit = state.implicit;
  }
  return state.useDecoder;
};

Node.prototype._decodeChoice = function decodeChoice(input) {
  var state = this._baseState;
  var result = null;
  var match = false;

  Object.keys(state.choice).some(function(key) {
    var save = input.save();
    var node = state.choice[key];
    try {
      var value = node._decode(input);
      if (input.isError(value))
        return false;

      result = { type: key, value: value };
      match = true;
    } catch (e) {
      input.restore(save);
      return false;
    }
    return true;
  }, this);

  if (!match)
    return input.error('Choice not matched');

  return result;
};

//
// Encoding
//

Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
  return new EncoderBuffer(data, this.reporter);
};

Node.prototype._encode = function encode(data, reporter, parent) {
  var state = this._baseState;
  if (state['default'] !== null && state['default'] === data)
    return;

  var result = this._encodeValue(data, reporter, parent);
  if (result === undefined)
    return;

  if (this._skipDefault(result, reporter, parent))
    return;

  return result;
};

Node.prototype._encodeValue = function encode(data, reporter, parent) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return state.children[0]._encode(data, reporter || new Reporter());

  var result = null;
  var present = true;

  // Set reporter to share it with a child class
  this.reporter = reporter;

  // Check if data is there
  if (state.optional && data === undefined) {
    if (state['default'] !== null)
      data = state['default']
    else
      return;
  }

  // For error reporting
  var prevKey;

  // Encode children first
  var content = null;
  var primitive = false;
  if (state.any) {
    // Anything that was given is translated to buffer
    result = this._createEncoderBuffer(data);
  } else if (state.choice) {
    result = this._encodeChoice(data, reporter);
  } else if (state.children) {
    content = state.children.map(function(child) {
      if (child._baseState.tag === 'null_')
        return child._encode(null, reporter, data);

      if (child._baseState.key === null)
        return reporter.error('Child should have a key');
      var prevKey = reporter.enterKey(child._baseState.key);

      if (typeof data !== 'object')
        return reporter.error('Child expected, but input is not object');

      var res = child._encode(data[child._baseState.key], reporter, data);
      reporter.leaveKey(prevKey);

      return res;
    }, this).filter(function(child) {
      return child;
    });

    content = this._createEncoderBuffer(content);
  } else {
    if (state.tag === 'seqof' || state.tag === 'setof') {
      // TODO(indutny): this should be thrown on DSL level
      if (!(state.args && state.args.length === 1))
        return reporter.error('Too many args for : ' + state.tag);

      if (!Array.isArray(data))
        return reporter.error('seqof/setof, but data is not Array');

      var child = this.clone();
      child._baseState.implicit = null;
      content = this._createEncoderBuffer(data.map(function(item) {
        var state = this._baseState;

        return this._getUse(state.args[0], data)._encode(item, reporter);
      }, child));
    } else if (state.use !== null) {
      result = this._getUse(state.use, parent)._encode(data, reporter);
    } else {
      content = this._encodePrimitive(state.tag, data);
      primitive = true;
    }
  }

  // Encode data itself
  var result;
  if (!state.any && state.choice === null) {
    var tag = state.implicit !== null ? state.implicit : state.tag;
    var cls = state.implicit === null ? 'universal' : 'context';

    if (tag === null) {
      if (state.use === null)
        reporter.error('Tag could be ommited only for .use()');
    } else {
      if (state.use === null)
        result = this._encodeComposite(tag, primitive, cls, content);
    }
  }

  // Wrap in explicit
  if (state.explicit !== null)
    result = this._encodeComposite(state.explicit, false, 'context', result);

  return result;
};

Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
  var state = this._baseState;

  var node = state.choice[data.type];
  if (!node) {
    assert(
        false,
        data.type + ' not found in ' +
            JSON.stringify(Object.keys(state.choice)));
  }
  return node._encode(data.value, reporter);
};

Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
  var state = this._baseState;

  if (tag === 'octstr' || tag === 'bitstr' || tag === 'ia5str')
    return this._encodeStr(data, tag);
  else if (tag === 'objid' && state.args)
    return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
  else if (tag === 'objid')
    return this._encodeObjid(data, null, null);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._encodeTime(data, tag);
  else if (tag === 'null_')
    return this._encodeNull();
  else if (tag === 'int' || tag === 'enum')
    return this._encodeInt(data, state.args && state.reverseArgs[0]);
  else if (tag === 'bool')
    return this._encodeBool(data);
  else
    throw new Error('Unsupported tag: ' + tag);
};

},{"../base":3,"minimalistic-assert":14}],5:[function(require,module,exports){
var inherits = require('inherits');

function Reporter(options) {
  this._reporterState = {
    obj: null,
    path: [],
    options: options || {},
    errors: []
  };
}
exports.Reporter = Reporter;

Reporter.prototype.isError = function isError(obj) {
  return obj instanceof ReporterError;
};

Reporter.prototype.enterKey = function enterKey(key) {
  return this._reporterState.path.push(key);
};

Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
  var state = this._reporterState;

  state.path = state.path.slice(0, index - 1);
  if (state.obj !== null)
    state.obj[key] = value;
};

Reporter.prototype.enterObject = function enterObject() {
  var state = this._reporterState;

  var prev = state.obj;
  state.obj = {};
  return prev;
};

Reporter.prototype.leaveObject = function leaveObject(prev) {
  var state = this._reporterState;

  var now = state.obj;
  state.obj = prev;
  return now;
};

Reporter.prototype.error = function error(msg) {
  var err;
  var state = this._reporterState;

  var inherited = msg instanceof ReporterError;
  if (inherited) {
    err = msg;
  } else {
    err = new ReporterError(state.path.map(function(elem) {
      return '[' + JSON.stringify(elem) + ']';
    }).join(''), msg.message || msg, msg.stack);
  }

  if (!state.options.partial)
    throw err;

  if (!inherited)
    state.errors.push(err);

  return err;
};

Reporter.prototype.wrapResult = function wrapResult(result) {
  var state = this._reporterState;
  if (!state.options.partial)
    return result;

  return {
    result: this.isError(result) ? null : result,
    errors: state.errors
  };
};

function ReporterError(path, msg) {
  this.path = path;
  this.rethrow(msg);
};
inherits(ReporterError, Error);

ReporterError.prototype.rethrow = function rethrow(msg) {
  this.message = msg + ' at: ' + (this.path || '(shallow)');
  Error.captureStackTrace(this, ReporterError);

  return this;
};

},{"inherits":13}],6:[function(require,module,exports){
var constants = require('../constants');

exports.tagClass = {
  0: 'universal',
  1: 'application',
  2: 'context',
  3: 'private'
};
exports.tagClassByName = constants._reverse(exports.tagClass);

exports.tag = {
  0x00: 'end',
  0x01: 'bool',
  0x02: 'int',
  0x03: 'bitstr',
  0x04: 'octstr',
  0x05: 'null_',
  0x06: 'objid',
  0x07: 'objDesc',
  0x08: 'external',
  0x09: 'real',
  0x0a: 'enum',
  0x0b: 'embed',
  0x0c: 'utf8str',
  0x0d: 'relativeOid',
  0x10: 'seq',
  0x11: 'set',
  0x12: 'numstr',
  0x13: 'printstr',
  0x14: 't61str',
  0x15: 'videostr',
  0x16: 'ia5str',
  0x17: 'utctime',
  0x18: 'gentime',
  0x19: 'graphstr',
  0x1a: 'iso646str',
  0x1b: 'genstr',
  0x1c: 'unistr',
  0x1d: 'charstr',
  0x1e: 'bmpstr'
};
exports.tagByName = constants._reverse(exports.tag);

},{"../constants":7}],7:[function(require,module,exports){
var constants = exports;

// Helper
constants._reverse = function reverse(map) {
  var res = {};

  Object.keys(map).forEach(function(key) {
    // Convert key to integer if it is stringified
    if ((key | 0) == key)
      key = key | 0;

    var value = map[key];
    res[value] = key;
  });

  return res;
};

constants.der = require('./der');

},{"./der":6}],8:[function(require,module,exports){
var inherits = require('inherits');

var asn1 = require('../../asn1');
var base = asn1.base;
var bignum = asn1.bignum;

// Import DER constants
var der = asn1.constants.der;

function DERDecoder(entity) {
  this.enc = 'der';
  this.name = entity.name;
  this.entity = entity;

  // Construct base tree
  this.tree = new DERNode();
  this.tree._init(entity.body);
};
module.exports = DERDecoder;

DERDecoder.prototype.decode = function decode(data, options) {
  if (!(data instanceof base.DecoderBuffer))
    data = new base.DecoderBuffer(data, options);

  return this.tree._decode(data, options);
};

// Tree methods

function DERNode(parent) {
  base.Node.call(this, 'der', parent);
}
inherits(DERNode, base.Node);

DERNode.prototype._peekTag = function peekTag(buffer, tag) {
  if (buffer.isEmpty())
    return false;

  var state = buffer.save();
  var decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
  if (buffer.isError(decodedTag))
    return decodedTag;

  buffer.restore(state);

  return decodedTag.tag === tag || decodedTag.tagStr === tag;
};

DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
  var decodedTag = derDecodeTag(buffer,
                                'Failed to decode tag of "' + tag + '"');
  if (buffer.isError(decodedTag))
    return decodedTag;

  var len = derDecodeLen(buffer,
                         decodedTag.primitive,
                         'Failed to get length of "' + tag + '"');

  // Failure
  if (buffer.isError(len))
    return len;

  if (!any &&
      decodedTag.tag !== tag &&
      decodedTag.tagStr !== tag &&
      decodedTag.tagStr + 'of' !== tag) {
    return buffer.error('Failed to match tag: "' + tag + '"');
  }

  if (decodedTag.primitive || len !== null)
    return buffer.skip(len, 'Failed to match body of: "' + tag + '"');

  // Indefinite length... find END tag
  var state = buffer.start();
  var res = this._skipUntilEnd(
      buffer,
      'Failed to skip indefinite length body: "' + this.tag + '"');
  if (buffer.isError(res))
    return res;

  return buffer.cut(state);
};

DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
  while (true) {
    var tag = derDecodeTag(buffer, fail);
    if (buffer.isError(tag))
      return tag;
    var len = derDecodeLen(buffer, tag.primitive, fail);
    if (buffer.isError(len))
      return len;

    var res;
    if (tag.primitive || len !== null)
      res = buffer.skip(len)
    else
      res = this._skipUntilEnd(buffer, fail);

    // Failure
    if (buffer.isError(res))
      return res;

    if (tag.tagStr === 'end')
      break;
  }
};

DERNode.prototype._decodeList = function decodeList(buffer, tag, decoder) {
  var result = [];
  while (!buffer.isEmpty()) {
    var possibleEnd = this._peekTag(buffer, 'end');
    if (buffer.isError(possibleEnd))
      return possibleEnd;

    var res = decoder.decode(buffer, 'der');
    if (buffer.isError(res) && possibleEnd)
      break;
    result.push(res);
  }
  return result;
};

DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
  if (tag === 'octstr') {
    return buffer.raw();
  } else if (tag === 'bitstr') {
    var unused = buffer.readUInt8();
    if (buffer.isError(unused))
      return unused;

    return { unused: unused, data: buffer.raw() };
  } else if (tag === 'ia5str') {
    return buffer.raw().toString();
  } else {
    return this.error('Decoding of string type: ' + tag + ' unsupported');
  }
};

DERNode.prototype._decodeObjid = function decodeObjid(buffer, values, relative) {
  var identifiers = [];
  var ident = 0;
  while (!buffer.isEmpty()) {
    var subident = buffer.readUInt8();
    ident <<= 7;
    ident |= subident & 0x7f;
    if ((subident & 0x80) === 0) {
      identifiers.push(ident);
      ident = 0;
    }
  }
  if (subident & 0x80)
    identifiers.push(ident);

  var first = (identifiers[0] / 40) | 0;
  var second = identifiers[0] % 40;

  if (relative)
    result = identifiers;
  else
    result = [first, second].concat(identifiers.slice(1));

  if (values)
    result = values[result.join(' ')];

  return result;
};

DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
  var str = buffer.raw().toString();
  if (tag === 'gentime') {
    var year = str.slice(0, 4) | 0;
    var mon = str.slice(4, 6) | 0;
    var day = str.slice(6, 8) | 0;
    var hour = str.slice(8, 10) | 0;
    var min = str.slice(10, 12) | 0;
    var sec = str.slice(12, 14) | 0;
  } else if (tag === 'utctime') {
    var year = str.slice(0, 2) | 0;
    var mon = str.slice(2, 4) | 0;
    var day = str.slice(4, 6) | 0;
    var hour = str.slice(6, 8) | 0;
    var min = str.slice(8, 10) | 0;
    var sec = str.slice(10, 12) | 0;
    if (year < 70)
      year = 2000 + year;
    else
      year = 1900 + year;
  } else {
    return this.error('Decoding ' + tag + ' time is not supported yet');
  }

  return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
};

DERNode.prototype._decodeNull = function decodeNull(buffer) {
  return null;
};

DERNode.prototype._decodeBool = function decodeBool(buffer) {
  var res = buffer.readUInt8();
  if (buffer.isError(res))
    return res;
  else
    return res !== 0;
};

DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
  var res = 0;

  // Bigint, return as it is (assume big endian)
  var raw = buffer.raw();
  if (raw.length > 3)
    return new bignum(raw);

  while (!buffer.isEmpty()) {
    res <<= 8;
    var i = buffer.readUInt8();
    if (buffer.isError(i))
      return i;
    res |= i;
  }

  if (values)
    res = values[res] || res;

  return res;
};

DERNode.prototype._use = function use(entity, obj) {
  if (typeof entity === 'function')
    entity = entity(obj);
  return entity._getDecoder('der').tree;
};

// Utility methods

function derDecodeTag(buf, fail) {
  var tag = buf.readUInt8(fail);
  if (buf.isError(tag))
    return tag;

  var cls = der.tagClass[tag >> 6];
  var primitive = (tag & 0x20) === 0;

  // Multi-octet tag - load
  if ((tag & 0x1f) === 0x1f) {
    var oct = tag;
    tag = 0;
    while ((oct & 0x80) === 0x80) {
      oct = buf.readUInt8(fail);
      if (buf.isError(oct))
        return oct;

      tag <<= 7;
      tag |= oct & 0x7f;
    }
  } else {
    tag &= 0x1f;
  }
  var tagStr = der.tag[tag];

  return {
    cls: cls,
    primitive: primitive,
    tag: tag,
    tagStr: tagStr
  };
}

function derDecodeLen(buf, primitive, fail) {
  var len = buf.readUInt8(fail);
  if (buf.isError(len))
    return len;

  // Indefinite form
  if (!primitive && len === 0x80)
    return null;

  // Definite form
  if ((len & 0x80) === 0) {
    // Short form
    return len;
  }

  // Long form
  var num = len & 0x7f;
  if (num >= 4)
    return buf.error('length octect is too long');

  len = 0;
  for (var i = 0; i < num; i++) {
    len <<= 8;
    var j = buf.readUInt8(fail);
    if (buf.isError(j))
      return j;
    len |= j;
  }

  return len;
}

},{"../../asn1":"asn1.js","inherits":13}],9:[function(require,module,exports){
var decoders = exports;

decoders.der = require('./der');

},{"./der":8}],10:[function(require,module,exports){
var inherits = require('inherits');
var Buffer = require('buffer').Buffer;

var asn1 = require('../../asn1');
var base = asn1.base;
var bignum = asn1.bignum;

// Import DER constants
var der = asn1.constants.der;

function DEREncoder(entity) {
  this.enc = 'der';
  this.name = entity.name;
  this.entity = entity;

  // Construct base tree
  this.tree = new DERNode();
  this.tree._init(entity.body);
};
module.exports = DEREncoder;

DEREncoder.prototype.encode = function encode(data, reporter) {
  return this.tree._encode(data, reporter).join();
};

// Tree methods

function DERNode(parent) {
  base.Node.call(this, 'der', parent);
}
inherits(DERNode, base.Node);

DERNode.prototype._encodeComposite = function encodeComposite(tag,
                                                              primitive,
                                                              cls,
                                                              content) {
  var encodedTag = encodeTag(tag, primitive, cls, this.reporter);

  // Short form
  if (content.length < 0x80) {
    var header = new Buffer(2);
    header[0] = encodedTag;
    header[1] = content.length;
    return this._createEncoderBuffer([ header, content ]);
  }

  // Long form
  // Count octets required to store length
  var lenOctets = 1;
  for (var i = content.length; i >= 0x100; i >>= 8)
    lenOctets++;

  var header = new Buffer(1 + 1 + lenOctets);
  header[0] = encodedTag;
  header[1] = 0x80 | lenOctets;

  for (var i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
    header[i] = j & 0xff;

  return this._createEncoderBuffer([ header, content ]);
};

DERNode.prototype._encodeStr = function encodeStr(str, tag) {
  if (tag === 'octstr')
    return this._createEncoderBuffer(str);
  else if (tag === 'bitstr')
    return this._createEncoderBuffer([ str.unused | 0, str.data ]);
  else if (tag === 'ia5str')
    return this._createEncoderBuffer(str);
  return this.reporter.error('Encoding of string type: ' + tag +
                             ' unsupported');
};

DERNode.prototype._encodeObjid = function encodeObjid(id, values, relative) {
  if (typeof id === 'string') {
    if (!values)
      return this.reporter.error('string objid given, but no values map found');
    if (!values.hasOwnProperty(id))
      return this.reporter.error('objid not found in values map');
    id = values[id].split(/\s+/g);
    for (var i = 0; i < id.length; i++)
      id[i] |= 0;
  } else if (Array.isArray(id)) {
    id = id.slice();
  }

  if (!Array.isArray(id)) {
    return this.reporter.error('objid() should be either array or string, ' +
                               'got: ' + JSON.stringify(id));
  }

  if (!relative) {
    if (id[1] >= 40)
      return this.reporter.error('Second objid identifier OOB');
    id.splice(0, 2, id[0] * 40 + id[1]);
  }

  // Count number of octets
  var size = 0;
  for (var i = 0; i < id.length; i++) {
    var ident = id[i];
    for (size++; ident >= 0x80; ident >>= 7)
      size++;
  }

  var objid = new Buffer(size);
  var offset = objid.length - 1;
  for (var i = id.length - 1; i >= 0; i--) {
    var ident = id[i];
    objid[offset--] = ident & 0x7f;
    while ((ident >>= 7) > 0)
      objid[offset--] = 0x80 | (ident & 0x7f);
  }

  return this._createEncoderBuffer(objid);
};

function two(num) {
  if (num <= 10)
    return '0' + num;
  else
    return num;
}

DERNode.prototype._encodeTime = function encodeTime(time, tag) {
  var str;
  var date = new Date(time);

  if (tag === 'gentime') {
    str = [
      date.getFullYear(),
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('');
  } else if (tag === 'utctime') {
    str = [
      date.getFullYear() % 100,
      two(date.getUTCMonth() + 1),
      two(date.getUTCDate()),
      two(date.getUTCHours()),
      two(date.getUTCMinutes()),
      two(date.getUTCSeconds()),
      'Z'
    ].join('');
  } else {
    this.reporter.error('Encoding ' + tag + ' time is not supported yet');
  }

  return this._encodeStr(str, 'octstr');
};

DERNode.prototype._encodeNull = function encodeNull() {
  return this._createEncoderBuffer('');
};

DERNode.prototype._encodeInt = function encodeInt(num, values) {
  if (typeof num === 'string') {
    if (!values)
      return this.reporter.error('String int or enum given, but no values map');
    if (!values.hasOwnProperty(num)) {
      return this.reporter.error('Values map doesn\'t contain: ' +
                                 JSON.stringify(num));
    }
    num = values[num];
  }

  // Bignum, assume big endian
  if (bignum !== null && num instanceof bignum) {
    var numArray = num.toArray();
    if(num.sign === false && numArray[0] & 0x80) {
      numArray.unshift(0);
    }
    num = new Buffer(numArray);
  }

  if (Buffer.isBuffer(num)) {
    var size = num.length;
    if (num.length === 0)
      size++;

    var out = new Buffer(size);
    num.copy(out);
    if (num.length === 0)
      out[0] = 0
    return this._createEncoderBuffer(out);
  }

  if (num < 0x80)
    return this._createEncoderBuffer(num);

  if (num < 0x100)
    return this._createEncoderBuffer([0, num]);

  var size = 1;
  for (var i = num; i >= 0x100; i >>= 8)
    size++;

  var out = new Array(size);
  for (var i = out.length - 1; i >= 0; i--) {
    out[i] = num & 0xff;
    num >>= 8;
  }
  if(out[0] & 0x80) {
    out.unshift(0);
  }

  return this._createEncoderBuffer(new Buffer(out));
};

DERNode.prototype._encodeBool = function encodeBool(value) {
  return this._createEncoderBuffer(value ? 0xff : 0);
};

DERNode.prototype._use = function use(entity, obj) {
  if (typeof entity === 'function')
    entity = entity(obj);
  return entity._getEncoder('der').tree;
};

DERNode.prototype._skipDefault = function skipDefault(dataBuffer, reporter, parent) {
  var state = this._baseState;
  var i;
  if (state['default'] === null)
    return false;

  var data = dataBuffer.join();
  if (state.defaultBuffer === undefined)
    state.defaultBuffer = this._encodeValue(state['default'], reporter, parent).join();

  if (data.length !== state.defaultBuffer.length)
    return false;

  for (i=0; i < data.length; i++)
    if (data[i] !== state.defaultBuffer[i])
      return false;

  return true;
};

// Utility methods

function encodeTag(tag, primitive, cls, reporter) {
  var res;

  if (tag === 'seqof')
    tag = 'seq';
  else if (tag === 'setof')
    tag = 'set';

  if (der.tagByName.hasOwnProperty(tag))
    res = der.tagByName[tag];
  else if (typeof tag === 'number' && (tag | 0) === tag)
    res = tag;
  else
    return reporter.error('Unknown tag: ' + tag);

  if (res >= 0x1f)
    return reporter.error('Multi-octet tag encoding unsupported');

  if (!primitive)
    res |= 0x20;

  res |= (der.tagClassByName[cls || 'universal'] << 6);

  return res;
}

},{"../../asn1":"asn1.js","buffer":15,"inherits":13}],11:[function(require,module,exports){
var encoders = exports;

encoders.der = require('./der');

},{"./der":10}],12:[function(require,module,exports){
(function(module, exports) {

'use strict';

// Utils

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

// Could use `inherits` module, but don't want to move from single file
// architecture yet.
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  var TempCtor = function () {};
  TempCtor.prototype = superCtor.prototype;
  ctor.prototype = new TempCtor();
  ctor.prototype.constructor = ctor;
}

// BN

function BN(number, base, endian) {
  // May be `new BN(bn)` ?
  if (number !== null &&
      typeof number === 'object' &&
      Array.isArray(number.words)) {
    return number;
  }

  this.sign = false;
  this.words = null;
  this.length = 0;

  // Reduction context
  this.red = null;

  if (base === 'le' || base === 'be') {
    endian = base;
    base = 10;
  }

  if (number !== null)
    this._init(number || 0, base || 10, endian || 'be');
}
if (typeof module === 'object')
  module.exports = BN;
else
  exports.BN = BN;

BN.BN = BN;
BN.wordSize = 26;

BN.prototype._init = function init(number, base, endian) {
  if (typeof number === 'number') {
    if (number < 0) {
      this.sign = true;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [ number & 0x3ffffff ];
      this.length = 1;
    } else {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    }
    return;
  } else if (typeof number === 'object') {
    return this._initArray(number, base, endian);
  }
  if (base === 'hex')
    base = 16;
  assert(base === (base | 0) && base >= 2 && base <= 36);

  number = number.toString().replace(/\s+/g, '');
  var start = 0;
  if (number[0] === '-')
    start++;

  if (base === 16)
    this._parseHex(number, start);
  else
    this._parseBase(number, base, start);

  if (number[0] === '-')
    this.sign = true;

  this.strip();
};

BN.prototype._initArray = function _initArray(number, base, endian) {
  // Perhaps a Uint8Array
  assert(typeof number.length === 'number');
  this.length = Math.ceil(number.length / 3);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  var off = 0;
  if (endian === 'be') {
    for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
      var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  } else if (endian === 'le') {
    for (var i = 0, j = 0; i < number.length; i += 3) {
      var w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
  }
  return this.strip();
};

function parseHex(str, start, end) {
  var r = 0;
  var len = Math.min(str.length, end);
  for (var i = start; i < len; i++) {
    var c = str.charCodeAt(i) - 48;

    r <<= 4;

    // 'a' - 'f'
    if (c >= 49 && c <= 54)
      r |= c - 49 + 0xa;

    // 'A' - 'F'
    else if (c >= 17 && c <= 22)
      r |= c - 17 + 0xa;

    // '0' - '9'
    else
      r |= c & 0xf;
  }
  return r;
}

BN.prototype._parseHex = function _parseHex(number, start) {
  // Create possibly bigger array to ensure that it fits the number
  this.length = Math.ceil((number.length - start) / 6);
  this.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    this.words[i] = 0;

  // Scan 24-bit chunks and add them to the number
  var off = 0;
  for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
    var w = parseHex(number, i, i + 6);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    off += 24;
    if (off >= 26) {
      off -= 26;
      j++;
    }
  }
  if (i + 6 !== start) {
    var w = parseHex(number, start, i + 6);
    this.words[j] |= (w << off) & 0x3ffffff;
    this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
  }
  this.strip();
};

function parseBase(str, start, end, mul) {
  var r = 0;
  var len = Math.min(str.length, end);
  for (var i = start; i < len; i++) {
    var c = str.charCodeAt(i) - 48;

    r *= mul;

    // 'a'
    if (c >= 49)
      r += c - 49 + 0xa;

    // 'A'
    else if (c >= 17)
      r += c - 17 + 0xa;

    // '0' - '9'
    else
      r += c;
  }
  return r;
}

BN.prototype._parseBase = function _parseBase(number, base, start) {
  // Initialize as zero
  this.words = [ 0 ];
  this.length = 1;

  // Find length of limb in base
  for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base)
    limbLen++;
  limbLen--;
  limbPow = (limbPow / base) | 0;

  var total = number.length - start;
  var mod = total % limbLen;
  var end = Math.min(total, total - mod) + start;

  var word = 0;
  for (var i = start; i < end; i += limbLen) {
    word = parseBase(number, i, i + limbLen, base);

    this.imuln(limbPow);
    if (this.words[0] + word < 0x4000000)
      this.words[0] += word;
    else
      this._iaddn(word);
  }

  if (mod !== 0) {
    var pow = 1;
    var word = parseBase(number, i, number.length, base);

    for (var i = 0; i < mod; i++)
      pow *= base;
    this.imuln(pow);
    if (this.words[0] + word < 0x4000000)
      this.words[0] += word;
    else
      this._iaddn(word);
  }
};

BN.prototype.copy = function copy(dest) {
  dest.words = new Array(this.length);
  for (var i = 0; i < this.length; i++)
    dest.words[i] = this.words[i];
  dest.length = this.length;
  dest.sign = this.sign;
  dest.red = this.red;
};

BN.prototype.clone = function clone() {
  var r = new BN(null);
  this.copy(r);
  return r;
};

// Remove leading `0` from `this`
BN.prototype.strip = function strip() {
  while (this.length > 1 && this.words[this.length - 1] === 0)
    this.length--;
  return this._normSign();
};

BN.prototype._normSign = function _normSign() {
  // -0 = 0
  if (this.length === 1 && this.words[0] === 0)
    this.sign = false;
  return this;
};

BN.prototype.inspect = function inspect() {
  return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
};

/*

var zeros = [];
var groupSizes = [];
var groupBases = [];

var s = '';
var i = -1;
while (++i < BN.wordSize) {
  zeros[i] = s;
  s += '0';
}
groupSizes[0] = 0;
groupSizes[1] = 0;
groupBases[0] = 0;
groupBases[1] = 0;
var base = 2 - 1;
while (++base < 36 + 1) {
  var groupSize = 0;
  var groupBase = 1;
  while (groupBase < (1 << BN.wordSize) / base) {
    groupBase *= base;
    groupSize += 1;
  }
  groupSizes[base] = groupSize;
  groupBases[base] = groupBase;
}

*/

var zeros = [
  '',
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '0000000',
  '00000000',
  '000000000',
  '0000000000',
  '00000000000',
  '000000000000',
  '0000000000000',
  '00000000000000',
  '000000000000000',
  '0000000000000000',
  '00000000000000000',
  '000000000000000000',
  '0000000000000000000',
  '00000000000000000000',
  '000000000000000000000',
  '0000000000000000000000',
  '00000000000000000000000',
  '000000000000000000000000',
  '0000000000000000000000000'
];

var groupSizes = [
  0, 0,
  25, 16, 12, 11, 10, 9, 8,
  8, 7, 7, 7, 7, 6, 6,
  6, 6, 6, 6, 6, 5, 5,
  5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5
];

var groupBases = [
  0, 0,
  33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
  43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
  16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
  6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
  24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
];

BN.prototype.toString = function toString(base, padding) {
  base = base || 10;
  if (base === 16 || base === 'hex') {
    var out = '';
    var off = 0;
    var padding = padding | 0 || 1;
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = this.words[i];
      var word = (((w << off) | carry) & 0xffffff).toString(16);
      carry = (w >>> (24 - off)) & 0xffffff;
      if (carry !== 0 || i !== this.length - 1)
        out = zeros[6 - word.length] + word + out;
      else
        out = word + out;
      off += 2;
      if (off >= 26) {
        off -= 26;
        i--;
      }
    }
    if (carry !== 0)
      out = carry.toString(16) + out;
    while (out.length % padding !== 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else if (base === (base | 0) && base >= 2 && base <= 36) {
    // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
    var groupSize = groupSizes[base];
    // var groupBase = Math.pow(base, groupSize);
    var groupBase = groupBases[base];
    var out = '';
    var c = this.clone();
    c.sign = false;
    while (c.cmpn(0) !== 0) {
      var r = c.modn(groupBase).toString(base);
      c = c.idivn(groupBase);

      if (c.cmpn(0) !== 0)
        out = zeros[groupSize - r.length] + r + out;
      else
        out = r + out;
    }
    if (this.cmpn(0) === 0)
      out = '0' + out;
    if (this.sign)
      out = '-' + out;
    return out;
  } else {
    assert(false, 'Base should be between 2 and 36');
  }
};

BN.prototype.toJSON = function toJSON() {
  return this.toString(16);
};

BN.prototype.toArray = function toArray() {
  this.strip();
  var res = new Array(this.byteLength());
  res[0] = 0;

  var q = this.clone();
  for (var i = 0; q.cmpn(0) !== 0; i++) {
    var b = q.andln(0xff);
    q.ishrn(8);

    // Assume big-endian
    res[res.length - i - 1] = b;
  }

  return res;
};

/*
function genCountBits(bits) {
  var arr = [];

  for (var i = bits - 1; i >= 0; i--) {
    var bit = '0x' + (1 << i).toString(16);
    arr.push('w >= ' + bit + ' ? ' + (i + 1));
  }

  return new Function('w', 'return ' + arr.join(' :\n') + ' :\n0;');
};

BN.prototype._countBits = genCountBits(26);
*/

// Sadly chrome apps could not contain `new Function()` calls
BN.prototype._countBits = function _countBits(w) {
  return w >= 0x2000000 ? 26 :
         w >= 0x1000000 ? 25 :
         w >= 0x800000 ? 24 :
         w >= 0x400000 ? 23 :
         w >= 0x200000 ? 22 :
         w >= 0x100000 ? 21 :
         w >= 0x80000 ? 20 :
         w >= 0x40000 ? 19 :
         w >= 0x20000 ? 18 :
         w >= 0x10000 ? 17 :
         w >= 0x8000 ? 16 :
         w >= 0x4000 ? 15 :
         w >= 0x2000 ? 14 :
         w >= 0x1000 ? 13 :
         w >= 0x800 ? 12 :
         w >= 0x400 ? 11 :
         w >= 0x200 ? 10 :
         w >= 0x100 ? 9 :
         w >= 0x80 ? 8 :
         w >= 0x40 ? 7 :
         w >= 0x20 ? 6 :
         w >= 0x10 ? 5 :
         w >= 0x8 ? 4 :
         w >= 0x4 ? 3 :
         w >= 0x2 ? 2 :
         w >= 0x1 ? 1 :
         0;
};

// Return number of used bits in a BN
BN.prototype.bitLength = function bitLength() {
  var hi = 0;
  var w = this.words[this.length - 1];
  var hi = this._countBits(w);
  return (this.length - 1) * 26 + hi;
};

BN.prototype.byteLength = function byteLength() {
  return Math.ceil(this.bitLength() / 8);
};

// Return negative clone of `this`
BN.prototype.neg = function neg() {
  if (this.cmpn(0) === 0)
    return this.clone();

  var r = this.clone();
  r.sign = !this.sign;
  return r;
};


// Or `num` with `this` in-place
BN.prototype.ior = function ior(num) {
  this.sign = this.sign || num.sign;

  while (this.length < num.length)
    this.words[this.length++] = 0;

  for (var i = 0; i < num.length; i++)
    this.words[i] = this.words[i] | num.words[i];

  return this.strip();
};


// Or `num` with `this`
BN.prototype.or = function or(num) {
  if (this.length > num.length)
    return this.clone().ior(num);
  else
    return num.clone().ior(this);
};


// And `num` with `this` in-place
BN.prototype.iand = function iand(num) {
  this.sign = this.sign && num.sign;

  // b = min-length(num, this)
  var b;
  if (this.length > num.length)
    b = num;
  else
    b = this;

  for (var i = 0; i < b.length; i++)
    this.words[i] = this.words[i] & num.words[i];

  this.length = b.length;

  return this.strip();
};


// And `num` with `this`
BN.prototype.and = function and(num) {
  if (this.length > num.length)
    return this.clone().iand(num);
  else
    return num.clone().iand(this);
};


// Xor `num` with `this` in-place
BN.prototype.ixor = function ixor(num) {
  this.sign = this.sign || num.sign;

  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  for (var i = 0; i < b.length; i++)
    this.words[i] = a.words[i] ^ b.words[i];

  if (this !== a)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];

  this.length = a.length;

  return this.strip();
};


// Xor `num` with `this`
BN.prototype.xor = function xor(num) {
  if (this.length > num.length)
    return this.clone().ixor(num);
  else
    return num.clone().ixor(this);
};


// Set `bit` of `this`
BN.prototype.setn = function setn(bit, val) {
  assert(typeof bit === 'number' && bit >= 0);

  var off = (bit / 26) | 0;
  var wbit = bit % 26;

  while (this.length <= off)
    this.words[this.length++] = 0;

  if (val)
    this.words[off] = this.words[off] | (1 << wbit);
  else
    this.words[off] = this.words[off] & ~(1 << wbit);

  return this.strip();
};


// Add `num` to `this` in-place
BN.prototype.iadd = function iadd(num) {
  // negative + positive
  if (this.sign && !num.sign) {
    this.sign = false;
    var r = this.isub(num);
    this.sign = !this.sign;
    return this._normSign();

  // positive + negative
  } else if (!this.sign && num.sign) {
    num.sign = false;
    var r = this.isub(num);
    num.sign = true;
    return r._normSign();
  }

  // a.length > b.length
  var a;
  var b;
  if (this.length > num.length) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] + b.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] + carry;
    this.words[i] = r & 0x3ffffff;
    carry = r >>> 26;
  }

  this.length = a.length;
  if (carry !== 0) {
    this.words[this.length] = carry;
    this.length++;
  // Copy the rest of the words
  } else if (a !== this) {
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  }

  return this;
};

// Add `num` to `this`
BN.prototype.add = function add(num) {
  if (num.sign && !this.sign) {
    num.sign = false;
    var res = this.sub(num);
    num.sign = true;
    return res;
  } else if (!num.sign && this.sign) {
    this.sign = false;
    var res = num.sub(this);
    this.sign = true;
    return res;
  }

  if (this.length > num.length)
    return this.clone().iadd(num);
  else
    return num.clone().iadd(this);
};

// Subtract `num` from `this` in-place
BN.prototype.isub = function isub(num) {
  // this - (-num) = this + num
  if (num.sign) {
    num.sign = false;
    var r = this.iadd(num);
    num.sign = true;
    return r._normSign();

  // -this - num = -(this + num)
  } else if (this.sign) {
    this.sign = false;
    this.iadd(num);
    this.sign = true;
    return this._normSign();
  }

  // At this point both numbers are positive
  var cmp = this.cmp(num);

  // Optimization - zeroify
  if (cmp === 0) {
    this.sign = false;
    this.length = 1;
    this.words[0] = 0;
    return this;
  }

  // a > b
  var a;
  var b;
  if (cmp > 0) {
    a = this;
    b = num;
  } else {
    a = num;
    b = this;
  }

  var carry = 0;
  for (var i = 0; i < b.length; i++) {
    var r = a.words[i] - b.words[i] + carry;
    carry = r >> 26;
    this.words[i] = r & 0x3ffffff;
  }
  for (; carry !== 0 && i < a.length; i++) {
    var r = a.words[i] + carry;
    carry = r >> 26;
    this.words[i] = r & 0x3ffffff;
  }

  // Copy rest of the words
  if (carry === 0 && i < a.length && a !== this)
    for (; i < a.length; i++)
      this.words[i] = a.words[i];
  this.length = Math.max(this.length, i);

  if (a !== this)
    this.sign = true;

  return this.strip();
};

// Subtract `num` from `this`
BN.prototype.sub = function sub(num) {
  return this.clone().isub(num);
};

/*
// NOTE: This could be potentionally used to generate loop-less multiplications
function _genCombMulTo(alen, blen) {
  var len = alen + blen - 1;
  var src = [
    'var a = this.words, b = num.words, o = out.words, c = 0, w, ' +
        'mask = 0x3ffffff, shift = 0x4000000;',
    'out.length = ' + len + ';'
  ];
  for (var k = 0; k < len; k++) {
    var minJ = Math.max(0, k - alen + 1);
    var maxJ = Math.min(k, blen - 1);

    for (var j = minJ; j <= maxJ; j++) {
      var i = k - j;
      var mul = 'a[' + i + '] * b[' + j + ']';

      if (j === minJ) {
        src.push('w = ' + mul + ' + c;');
        src.push('c = (w / shift) | 0;');
      } else {
        src.push('w += ' + mul + ';');
        src.push('c += (w / shift) | 0;');
      }
      src.push('w &= mask;');
    }
    src.push('o[' + k + '] = w;');
  }
  src.push('if (c !== 0) {',
           '  o[' + k + '] = c;',
           '  out.length++;',
           '}',
           'return out;');

  return src.join('\n');
}
*/

BN.prototype._smallMulTo = function _smallMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = carry >>> 26;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;
    }
    out.words[k] = rword;
    carry = ncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype._bigMulTo = function _bigMulTo(num, out) {
  out.sign = num.sign !== this.sign;
  out.length = this.length + num.length;

  var carry = 0;
  var hncarry = 0;
  for (var k = 0; k < out.length - 1; k++) {
    // Sum all words with the same `i + j = k` and accumulate `ncarry`,
    // note that ncarry could be >= 0x3ffffff
    var ncarry = hncarry;
    hncarry = 0;
    var rword = carry & 0x3ffffff;
    var maxJ = Math.min(k, num.length - 1);
    for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i] | 0;
      var b = num.words[j] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
      lo = (lo + rword) | 0;
      rword = lo & 0x3ffffff;
      ncarry = (ncarry + (lo >>> 26)) | 0;

      hncarry += ncarry >>> 26;
      ncarry &= 0x3ffffff;
    }
    out.words[k] = rword;
    carry = ncarry;
    ncarry = hncarry;
  }
  if (carry !== 0) {
    out.words[k] = carry;
  } else {
    out.length--;
  }

  return out.strip();
};

BN.prototype.mulTo = function mulTo(num, out) {
  var res;
  if (this.length + num.length < 63)
    res = this._smallMulTo(num, out);
  else
    res = this._bigMulTo(num, out);
  return res;
};

// Multiply `this` by `num`
BN.prototype.mul = function mul(num) {
  var out = new BN(null);
  out.words = new Array(this.length + num.length);
  return this.mulTo(num, out);
};

// In-place Multiplication
BN.prototype.imul = function imul(num) {
  if (this.cmpn(0) === 0 || num.cmpn(0) === 0) {
    this.words[0] = 0;
    this.length = 1;
    return this;
  }

  var tlen = this.length;
  var nlen = num.length;

  this.sign = num.sign !== this.sign;
  this.length = this.length + num.length;
  this.words[this.length - 1] = 0;

  for (var k = this.length - 2; k >= 0; k--) {
    // Sum all words with the same `i + j = k` and accumulate `carry`,
    // note that carry could be >= 0x3ffffff
    var carry = 0;
    var rword = 0;
    var maxJ = Math.min(k, nlen - 1);
    for (var j = Math.max(0, k - tlen + 1); j <= maxJ; j++) {
      var i = k - j;
      var a = this.words[i];
      var b = num.words[j];
      var r = a * b;

      var lo = r & 0x3ffffff;
      carry += (r / 0x4000000) | 0;
      lo += rword;
      rword = lo & 0x3ffffff;
      carry += lo >>> 26;
    }
    this.words[k] = rword;
    this.words[k + 1] += carry;
    carry = 0;
  }

  // Propagate overflows
  var carry = 0;
  for (var i = 1; i < this.length; i++) {
    var w = this.words[i] + carry;
    this.words[i] = w & 0x3ffffff;
    carry = w >>> 26;
  }

  return this.strip();
};

BN.prototype.imuln = function imuln(num) {
  assert(typeof num === 'number');

  // Carry
  var carry = 0;
  for (var i = 0; i < this.length; i++) {
    var w = this.words[i] * num;
    var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
    carry >>= 26;
    carry += (w / 0x4000000) | 0;
    // NOTE: lo is 27bit maximum
    carry += lo >>> 26;
    this.words[i] = lo & 0x3ffffff;
  }

  if (carry !== 0) {
    this.words[i] = carry;
    this.length++;
  }

  return this;
};

// `this` * `this`
BN.prototype.sqr = function sqr() {
  return this.mul(this);
};

// `this` * `this` in-place
BN.prototype.isqr = function isqr() {
  return this.mul(this);
};

// Shift-left in-place
BN.prototype.ishln = function ishln(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;
  var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

  if (r !== 0) {
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var newCarry = this.words[i] & carryMask;
      var c = (this.words[i] - newCarry) << r;
      this.words[i] = c | carry;
      carry = newCarry >>> (26 - r);
    }
    if (carry) {
      this.words[i] = carry;
      this.length++;
    }
  }

  if (s !== 0) {
    for (var i = this.length - 1; i >= 0; i--)
      this.words[i + s] = this.words[i];
    for (var i = 0; i < s; i++)
      this.words[i] = 0;
    this.length += s;
  }

  return this.strip();
};

// Shift-right in-place
// NOTE: `hint` is a lowest bit before trailing zeroes
// NOTE: if `extended` is true - { lo: ..., hi: } object will be returned
BN.prototype.ishrn = function ishrn(bits, hint, extended) {
  assert(typeof bits === 'number' && bits >= 0);
  if (hint)
    hint = (hint - (hint % 26)) / 26;
  else
    hint = 0;

  var r = bits % 26;
  var s = Math.min((bits - r) / 26, this.length);
  var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
  var maskedWords = extended;

  hint -= s;
  hint = Math.max(0, hint);

  // Extended mode, copy masked part
  if (maskedWords) {
    for (var i = 0; i < s; i++)
      maskedWords.words[i] = this.words[i];
    maskedWords.length = s;
  }

  if (s === 0) {
    // No-op, we should not move anything at all
  } else if (this.length > s) {
    this.length -= s;
    for (var i = 0; i < this.length; i++)
      this.words[i] = this.words[i + s];
  } else {
    this.words[0] = 0;
    this.length = 1;
  }

  var carry = 0;
  for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= hint); i--) {
    var word = this.words[i];
    this.words[i] = (carry << (26 - r)) | (word >>> r);
    carry = word & mask;
  }

  // Push carried bits as a mask
  if (maskedWords && carry !== 0)
    maskedWords.words[maskedWords.length++] = carry;

  if (this.length === 0) {
    this.words[0] = 0;
    this.length = 1;
  }

  this.strip();
  if (extended)
    return { hi: this, lo: maskedWords };

  return this;
};

// Shift-left
BN.prototype.shln = function shln(bits) {
  return this.clone().ishln(bits);
};

// Shift-right
BN.prototype.shrn = function shrn(bits) {
  return this.clone().ishrn(bits);
};

// Test if n bit is set
BN.prototype.testn = function testn(bit) {
  assert(typeof bit === 'number' && bit >= 0);
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    return false;
  }

  // Check bit and return
  var w = this.words[s];

  return !!(w & q);
};

// Return only lowers bits of number (in-place)
BN.prototype.imaskn = function imaskn(bits) {
  assert(typeof bits === 'number' && bits >= 0);
  var r = bits % 26;
  var s = (bits - r) / 26;

  assert(!this.sign, 'imaskn works only with positive numbers');

  if (r !== 0)
    s++;
  this.length = Math.min(s, this.length);

  if (r !== 0) {
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    this.words[this.length - 1] &= mask;
  }

  return this.strip();
};

// Return only lowers bits of number
BN.prototype.maskn = function maskn(bits) {
  return this.clone().imaskn(bits);
};

// Add plain number `num` to `this`
BN.prototype.iaddn = function iaddn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.isubn(-num);

  // Possible sign change
  if (this.sign) {
    if (this.length === 1 && this.words[0] < num) {
      this.words[0] = num - this.words[0];
      this.sign = false;
      return this;
    }

    this.sign = false;
    this.isubn(num);
    this.sign = true;
    return this;
  }

  // Add without checks
  return this._iaddn(num);
};

BN.prototype._iaddn = function _iaddn(num) {
  this.words[0] += num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
    this.words[i] -= 0x4000000;
    if (i === this.length - 1)
      this.words[i + 1] = 1;
    else
      this.words[i + 1]++;
  }
  this.length = Math.max(this.length, i + 1);

  return this;
};

// Subtract plain number `num` from `this`
BN.prototype.isubn = function isubn(num) {
  assert(typeof num === 'number');
  if (num < 0)
    return this.iaddn(-num);

  if (this.sign) {
    this.sign = false;
    this.iaddn(num);
    this.sign = true;
    return this;
  }

  this.words[0] -= num;

  // Carry
  for (var i = 0; i < this.length && this.words[i] < 0; i++) {
    this.words[i] += 0x4000000;
    this.words[i + 1] -= 1;
  }

  return this.strip();
};

BN.prototype.addn = function addn(num) {
  return this.clone().iaddn(num);
};

BN.prototype.subn = function subn(num) {
  return this.clone().isubn(num);
};

BN.prototype.iabs = function iabs() {
  this.sign = false;

  return this;
};

BN.prototype.abs = function abs() {
  return this.clone().iabs();
};

BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
  // Bigger storage is needed
  var len = num.length + shift;
  var i;
  if (this.words.length < len) {
    var t = new Array(len);
    for (var i = 0; i < this.length; i++)
      t[i] = this.words[i];
    this.words = t;
  } else {
    i = this.length;
  }

  // Zeroify rest
  this.length = Math.max(this.length, len);
  for (; i < this.length; i++)
    this.words[i] = 0;

  var carry = 0;
  for (var i = 0; i < num.length; i++) {
    var w = this.words[i + shift] + carry;
    var right = num.words[i] * mul;
    w -= right & 0x3ffffff;
    carry = (w >> 26) - ((right / 0x4000000) | 0);
    this.words[i + shift] = w & 0x3ffffff;
  }
  for (; i < this.length - shift; i++) {
    var w = this.words[i + shift] + carry;
    carry = w >> 26;
    this.words[i + shift] = w & 0x3ffffff;
  }

  if (carry === 0)
    return this.strip();

  // Subtraction overflow
  assert(carry === -1);
  carry = 0;
  for (var i = 0; i < this.length; i++) {
    var w = -this.words[i] + carry;
    carry = w >> 26;
    this.words[i] = w & 0x3ffffff;
  }
  this.sign = true;

  return this.strip();
};

BN.prototype._wordDiv = function _wordDiv(num, mode) {
  var shift = this.length - num.length;

  var a = this.clone();
  var b = num;

  // Normalize
  var bhi = b.words[b.length - 1];
  for (var shift = 0; bhi < 0x2000000; shift++)
    bhi <<= 1;
  if (shift !== 0) {
    b = b.shln(shift);
    a.ishln(shift);
    bhi = b.words[b.length - 1];
  }

  // Initialize quotient
  var m = a.length - b.length;
  var q;

  if (mode !== 'mod') {
    q = new BN(null);
    q.length = m + 1;
    q.words = new Array(q.length);
    for (var i = 0; i < q.length; i++)
      q.words[i] = 0;
  }

  var diff = a.clone()._ishlnsubmul(b, 1, m);
  if (!diff.sign) {
    a = diff;
    if (q)
      q.words[m] = 1;
  }

  for (var j = m - 1; j >= 0; j--) {
    var qj = a.words[b.length + j] * 0x4000000 + a.words[b.length + j - 1];

    // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
    // (0x7ffffff)
    qj = Math.min((qj / bhi) | 0, 0x3ffffff);

    a._ishlnsubmul(b, qj, j);
    while (a.sign) {
      qj--;
      a.sign = false;
      a._ishlnsubmul(b, 1, j);
      a.sign = !a.sign;
    }
    if (q)
      q.words[j] = qj;
  }
  if (q)
    q.strip();
  a.strip();

  // Denormalize
  if (mode !== 'div' && shift !== 0)
    a.ishrn(shift);
  return { div: q ? q : null, mod: a };
};

BN.prototype.divmod = function divmod(num, mode) {
  assert(num.cmpn(0) !== 0);

  if (this.sign && !num.sign) {
    var res = this.neg().divmod(num, mode);
    var div;
    var mod;
    if (mode !== 'mod')
      div = res.div.neg();
    if (mode !== 'div')
      mod = res.mod.cmpn(0) === 0 ? res.mod : num.sub(res.mod);
    return {
      div: div,
      mod: mod
    };
  } else if (!this.sign && num.sign) {
    var res = this.divmod(num.neg(), mode);
    var div;
    if (mode !== 'mod')
      div = res.div.neg();
    return { div: div, mod: res.mod };
  } else if (this.sign && num.sign) {
    return this.neg().divmod(num.neg(), mode);
  }

  // Both numbers are positive at this point

  // Strip both numbers to approximate shift value
  if (num.length > this.length || this.cmp(num) < 0)
    return { div: new BN(0), mod: this };

  // Very short reduction
  if (num.length === 1) {
    if (mode === 'div')
      return { div: this.divn(num.words[0]), mod: null };
    else if (mode === 'mod')
      return { div: null, mod: new BN(this.modn(num.words[0])) };
    return {
      div: this.divn(num.words[0]),
      mod: new BN(this.modn(num.words[0]))
    };
  }

  return this._wordDiv(num, mode);
};

// Find `this` / `num`
BN.prototype.div = function div(num) {
  return this.divmod(num, 'div').div;
};

// Find `this` % `num`
BN.prototype.mod = function mod(num) {
  return this.divmod(num, 'mod').mod;
};

// Find Round(`this` / `num`)
BN.prototype.divRound = function divRound(num) {
  var dm = this.divmod(num);

  // Fast case - exact division
  if (dm.mod.cmpn(0) === 0)
    return dm.div;

  var mod = dm.div.sign ? dm.mod.isub(num) : dm.mod;

  var half = num.shrn(1);
  var r2 = num.andln(1);
  var cmp = mod.cmp(half);

  // Round down
  if (cmp < 0 || r2 === 1 && cmp === 0)
    return dm.div;

  // Round up
  return dm.div.sign ? dm.div.isubn(1) : dm.div.iaddn(1);
};

BN.prototype.modn = function modn(num) {
  assert(num <= 0x3ffffff);
  var p = (1 << 26) % num;

  var acc = 0;
  for (var i = this.length - 1; i >= 0; i--)
    acc = (p * acc + this.words[i]) % num;

  return acc;
};

// In-place division by number
BN.prototype.idivn = function idivn(num) {
  assert(num <= 0x3ffffff);

  var carry = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var w = this.words[i] + carry * 0x4000000;
    this.words[i] = (w / num) | 0;
    carry = w % num;
  }

  return this.strip();
};

BN.prototype.divn = function divn(num) {
  return this.clone().idivn(num);
};

BN.prototype._egcd = function _egcd(x1, p) {
  assert(!p.sign);
  assert(p.cmpn(0) !== 0);

  var a = this;
  var b = p.clone();

  if (a.sign)
    a = a.mod(p);
  else
    a = a.clone();

  var x2 = new BN(0);
  while (b.isEven())
    b.ishrn(1);
  var delta = b.clone();
  while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
    while (a.isEven()) {
      a.ishrn(1);
      if (x1.isEven())
        x1.ishrn(1);
      else
        x1.iadd(delta).ishrn(1);
    }
    while (b.isEven()) {
      b.ishrn(1);
      if (x2.isEven())
        x2.ishrn(1);
      else
        x2.iadd(delta).ishrn(1);
    }
    if (a.cmp(b) >= 0) {
      a.isub(b);
      x1.isub(x2);
    } else {
      b.isub(a);
      x2.isub(x1);
    }
  }
  if (a.cmpn(1) === 0)
    return x1;
  else
    return x2;
};

BN.prototype.gcd = function gcd(num) {
  if (this.cmpn(0) === 0)
    return num.clone();
  if (num.cmpn(0) === 0)
    return this.clone();

  var a = this.clone();
  var b = num.clone();
  a.sign = false;
  b.sign = false;

  // Remove common factor of two
  for (var shift = 0; a.isEven() && b.isEven(); shift++) {
    a.ishrn(1);
    b.ishrn(1);
  }

  while (a.isEven())
    a.ishrn(1);

  do {
    while (b.isEven())
      b.ishrn(1);

    // Swap `a` and `b` to make `a` always bigger than `b`
    if (a.cmp(b) < 0) {
      var t = a;
      a = b;
      b = t;
    }
    a.isub(a.div(b).mul(b));
  } while (a.cmpn(0) !== 0 && b.cmpn(0) !== 0);
  if (a.cmpn(0) === 0)
    return b.ishln(shift);
  else
    return a.ishln(shift);
};

// Invert number in the field F(num)
BN.prototype.invm = function invm(num) {
  return this._egcd(new BN(1), num).mod(num);
};

BN.prototype.isEven = function isEven() {
  return (this.words[0] & 1) === 0;
};

BN.prototype.isOdd = function isOdd() {
  return (this.words[0] & 1) === 1;
};

// And first word and num
BN.prototype.andln = function andln(num) {
  return this.words[0] & num;
};

// Increment at the bit position in-line
BN.prototype.bincn = function bincn(bit) {
  assert(typeof bit === 'number');
  var r = bit % 26;
  var s = (bit - r) / 26;
  var q = 1 << r;

  // Fast case: bit is much higher than all existing words
  if (this.length <= s) {
    for (var i = this.length; i < s + 1; i++)
      this.words[i] = 0;
    this.words[s] |= q;
    this.length = s + 1;
    return this;
  }

  // Add bit and propagate, if needed
  var carry = q;
  for (var i = s; carry !== 0 && i < this.length; i++) {
    var w = this.words[i];
    w += carry;
    carry = w >>> 26;
    w &= 0x3ffffff;
    this.words[i] = w;
  }
  if (carry !== 0) {
    this.words[i] = carry;
    this.length++;
  }
  return this;
};

BN.prototype.cmpn = function cmpn(num) {
  var sign = num < 0;
  if (sign)
    num = -num;

  if (this.sign && !sign)
    return -1;
  else if (!this.sign && sign)
    return 1;

  num &= 0x3ffffff;
  this.strip();

  var res;
  if (this.length > 1) {
    res = 1;
  } else {
    var w = this.words[0];
    res = w === num ? 0 : w < num ? -1 : 1;
  }
  if (this.sign)
    res = -res;
  return res;
};

// Compare two numbers and return:
// 1 - if `this` > `num`
// 0 - if `this` == `num`
// -1 - if `this` < `num`
BN.prototype.cmp = function cmp(num) {
  if (this.sign && !num.sign)
    return -1;
  else if (!this.sign && num.sign)
    return 1;

  var res = this.ucmp(num);
  if (this.sign)
    return -res;
  else
    return res;
};

// Unsigned comparison
BN.prototype.ucmp = function ucmp(num) {
  // At this point both numbers have the same sign
  if (this.length > num.length)
    return 1;
  else if (this.length < num.length)
    return -1;

  var res = 0;
  for (var i = this.length - 1; i >= 0; i--) {
    var a = this.words[i];
    var b = num.words[i];

    if (a === b)
      continue;
    if (a < b)
      res = -1;
    else if (a > b)
      res = 1;
    break;
  }
  return res;
};

//
// A reduce context, could be using montgomery or something better, depending
// on the `m` itself.
//
BN.red = function red(num) {
  return new Red(num);
};

BN.prototype.toRed = function toRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  assert(!this.sign, 'red works only with positives');
  return ctx.convertTo(this)._forceRed(ctx);
};

BN.prototype.fromRed = function fromRed() {
  assert(this.red, 'fromRed works only with numbers in reduction context');
  return this.red.convertFrom(this);
};

BN.prototype._forceRed = function _forceRed(ctx) {
  this.red = ctx;
  return this;
};

BN.prototype.forceRed = function forceRed(ctx) {
  assert(!this.red, 'Already a number in reduction context');
  return this._forceRed(ctx);
};

BN.prototype.redAdd = function redAdd(num) {
  assert(this.red, 'redAdd works only with red numbers');
  return this.red.add(this, num);
};

BN.prototype.redIAdd = function redIAdd(num) {
  assert(this.red, 'redIAdd works only with red numbers');
  return this.red.iadd(this, num);
};

BN.prototype.redSub = function redSub(num) {
  assert(this.red, 'redSub works only with red numbers');
  return this.red.sub(this, num);
};

BN.prototype.redISub = function redISub(num) {
  assert(this.red, 'redISub works only with red numbers');
  return this.red.isub(this, num);
};

BN.prototype.redShl = function redShl(num) {
  assert(this.red, 'redShl works only with red numbers');
  return this.red.shl(this, num);
};

BN.prototype.redMul = function redMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.mul(this, num);
};

BN.prototype.redIMul = function redIMul(num) {
  assert(this.red, 'redMul works only with red numbers');
  this.red._verify2(this, num);
  return this.red.imul(this, num);
};

BN.prototype.redSqr = function redSqr() {
  assert(this.red, 'redSqr works only with red numbers');
  this.red._verify1(this);
  return this.red.sqr(this);
};

BN.prototype.redISqr = function redISqr() {
  assert(this.red, 'redISqr works only with red numbers');
  this.red._verify1(this);
  return this.red.isqr(this);
};

// Square root over p
BN.prototype.redSqrt = function redSqrt() {
  assert(this.red, 'redSqrt works only with red numbers');
  this.red._verify1(this);
  return this.red.sqrt(this);
};

BN.prototype.redInvm = function redInvm() {
  assert(this.red, 'redInvm works only with red numbers');
  this.red._verify1(this);
  return this.red.invm(this);
};

// Return negative clone of `this` % `red modulo`
BN.prototype.redNeg = function redNeg() {
  assert(this.red, 'redNeg works only with red numbers');
  this.red._verify1(this);
  return this.red.neg(this);
};

BN.prototype.redPow = function redPow(num) {
  assert(this.red && !num.red, 'redPow(normalNum)');
  this.red._verify1(this);
  return this.red.pow(this, num);
};

// Prime numbers with efficient reduction
var primes = {
  k256: null,
  p224: null,
  p192: null,
  p25519: null
};

// Pseudo-Mersenne prime
function MPrime(name, p) {
  // P = 2 ^ N - K
  this.name = name;
  this.p = new BN(p, 16);
  this.n = this.p.bitLength();
  this.k = new BN(1).ishln(this.n).isub(this.p);

  this.tmp = this._tmp();
}

MPrime.prototype._tmp = function _tmp() {
  var tmp = new BN(null);
  tmp.words = new Array(Math.ceil(this.n / 13));
  return tmp;
};

MPrime.prototype.ireduce = function ireduce(num) {
  // Assumes that `num` is less than `P^2`
  // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
  var r = num;
  var rlen;

  do {
    var pair = r.ishrn(this.n, 0, this.tmp);
    r = this.imulK(pair.hi);
    r = r.iadd(pair.lo);
    rlen = r.bitLength();
  } while (rlen > this.n);

  var cmp = rlen < this.n ? -1 : r.cmp(this.p);
  if (cmp === 0) {
    r.words[0] = 0;
    r.length = 1;
  } else if (cmp > 0) {
    r.isub(this.p);
  } else {
    r.strip();
  }

  return r;
};

MPrime.prototype.imulK = function imulK(num) {
  return num.imul(this.k);
};

function K256() {
  MPrime.call(
    this,
    'k256',
    'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
}
inherits(K256, MPrime);

K256.prototype.imulK = function imulK(num) {
  // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
  num.words[num.length] = 0;
  num.words[num.length + 1] = 0;
  num.length += 2;

  // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
  var hi;
  var lo = 0;
  for (var i = 0; i < num.length; i++) {
    var w = num.words[i];
    hi = w * 0x40;
    lo += w * 0x3d1;
    hi += (lo / 0x4000000) | 0;
    lo &= 0x3ffffff;

    num.words[i] = lo;

    lo = hi;
  }

  // Fast length reduction
  if (num.words[num.length - 1] === 0) {
    num.length--;
    if (num.words[num.length - 1] === 0)
      num.length--;
  }
  return num;
};

function P224() {
  MPrime.call(
    this,
    'p224',
    'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
}
inherits(P224, MPrime);

function P192() {
  MPrime.call(
    this,
    'p192',
    'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
}
inherits(P192, MPrime);

function P25519() {
  // 2 ^ 255 - 19
  MPrime.call(
    this,
    '25519',
    '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
}
inherits(P25519, MPrime);

P25519.prototype.imulK = function imulK(num) {
  // K = 0x13
  var carry = 0;
  for (var i = 0; i < num.length; i++) {
    var hi = num.words[i] * 0x13 + carry;
    var lo = hi & 0x3ffffff;
    hi >>>= 26;

    num.words[i] = lo;
    carry = hi;
  }
  if (carry !== 0)
    num.words[num.length++] = carry;
  return num;
};

// Exported mostly for testing purposes, use plain name instead
BN._prime = function prime(name) {
  // Cached version of prime
  if (primes[name])
    return primes[name];

  var prime;
  if (name === 'k256')
    prime = new K256();
  else if (name === 'p224')
    prime = new P224();
  else if (name === 'p192')
    prime = new P192();
  else if (name === 'p25519')
    prime = new P25519();
  else
    throw new Error('Unknown prime ' + name);
  primes[name] = prime;

  return prime;
};

//
// Base reduction engine
//
function Red(m) {
  if (typeof m === 'string') {
    var prime = BN._prime(m);
    this.m = prime.p;
    this.prime = prime;
  } else {
    this.m = m;
    this.prime = null;
  }
}

Red.prototype._verify1 = function _verify1(a) {
  assert(!a.sign, 'red works only with positives');
  assert(a.red, 'red works only with red numbers');
};

Red.prototype._verify2 = function _verify2(a, b) {
  assert(!a.sign && !b.sign, 'red works only with positives');
  assert(a.red && a.red === b.red,
         'red works only with red numbers');
};

Red.prototype.imod = function imod(a) {
  if (this.prime)
    return this.prime.ireduce(a)._forceRed(this);
  return a.mod(this.m)._forceRed(this);
};

Red.prototype.neg = function neg(a) {
  var r = a.clone();
  r.sign = !r.sign;
  return r.iadd(this.m)._forceRed(this);
};

Red.prototype.add = function add(a, b) {
  this._verify2(a, b);

  var res = a.add(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res._forceRed(this);
};

Red.prototype.iadd = function iadd(a, b) {
  this._verify2(a, b);

  var res = a.iadd(b);
  if (res.cmp(this.m) >= 0)
    res.isub(this.m);
  return res;
};

Red.prototype.sub = function sub(a, b) {
  this._verify2(a, b);

  var res = a.sub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res._forceRed(this);
};

Red.prototype.isub = function isub(a, b) {
  this._verify2(a, b);

  var res = a.isub(b);
  if (res.cmpn(0) < 0)
    res.iadd(this.m);
  return res;
};

Red.prototype.shl = function shl(a, num) {
  this._verify1(a);
  return this.imod(a.shln(num));
};

Red.prototype.imul = function imul(a, b) {
  this._verify2(a, b);
  return this.imod(a.imul(b));
};

Red.prototype.mul = function mul(a, b) {
  this._verify2(a, b);
  return this.imod(a.mul(b));
};

Red.prototype.isqr = function isqr(a) {
  return this.imul(a, a);
};

Red.prototype.sqr = function sqr(a) {
  return this.mul(a, a);
};

Red.prototype.sqrt = function sqrt(a) {
  if (a.cmpn(0) === 0)
    return a.clone();

  var mod3 = this.m.andln(3);
  assert(mod3 % 2 === 1);

  // Fast case
  if (mod3 === 3) {
    var pow = this.m.add(new BN(1)).ishrn(2);
    var r = this.pow(a, pow);
    return r;
  }

  // Tonelli-Shanks algorithm (Totally unoptimized and slow)
  //
  // Find Q and S, that Q * 2 ^ S = (P - 1)
  var q = this.m.subn(1);
  var s = 0;
  while (q.cmpn(0) !== 0 && q.andln(1) === 0) {
    s++;
    q.ishrn(1);
  }
  assert(q.cmpn(0) !== 0);

  var one = new BN(1).toRed(this);
  var nOne = one.redNeg();

  // Find quadratic non-residue
  // NOTE: Max is such because of generalized Riemann hypothesis.
  var lpow = this.m.subn(1).ishrn(1);
  var z = this.m.bitLength();
  z = new BN(2 * z * z).toRed(this);
  while (this.pow(z, lpow).cmp(nOne) !== 0)
    z.redIAdd(nOne);

  var c = this.pow(z, q);
  var r = this.pow(a, q.addn(1).ishrn(1));
  var t = this.pow(a, q);
  var m = s;
  while (t.cmp(one) !== 0) {
    var tmp = t;
    for (var i = 0; tmp.cmp(one) !== 0; i++)
      tmp = tmp.redSqr();
    assert(i < m);
    var b = this.pow(c, new BN(1).ishln(m - i - 1));

    r = r.redMul(b);
    c = b.redSqr();
    t = t.redMul(c);
    m = i;
  }

  return r;
};

Red.prototype.invm = function invm(a) {
  var inv = a._egcd(new BN(1), this.m);
  if (inv.sign) {
    inv.sign = false;
    return this.imod(inv).redNeg();
  } else {
    return this.imod(inv);
  }
};

Red.prototype.pow = function pow(a, num) {
  var w = [];
  var q = num.clone();
  while (q.cmpn(0) !== 0) {
    w.push(q.andln(1));
    q.ishrn(1);
  }

  // Skip leading zeroes
  var res = a;
  for (var i = 0; i < w.length; i++, res = this.sqr(res))
    if (w[i] !== 0)
      break;

  if (++i < w.length) {
    for (var q = this.sqr(res); i < w.length; i++, q = this.sqr(q)) {
      if (w[i] === 0)
        continue;
      res = this.mul(res, q);
    }
  }

  return res;
};

Red.prototype.convertTo = function convertTo(num) {
  return num.clone();
};

Red.prototype.convertFrom = function convertFrom(num) {
  var res = num.clone();
  res.red = null;
  return res;
};

//
// Montgomery method engine
//

BN.mont = function mont(num) {
  return new Mont(num);
};

function Mont(m) {
  Red.call(this, m);

  this.shift = this.m.bitLength();
  if (this.shift % 26 !== 0)
    this.shift += 26 - (this.shift % 26);
  this.r = new BN(1).ishln(this.shift);
  this.r2 = this.imod(this.r.sqr());
  this.rinv = this.r.invm(this.m);

  this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
  this.minv.sign = true;
  this.minv = this.minv.mod(this.r);
}
inherits(Mont, Red);

Mont.prototype.convertTo = function convertTo(num) {
  return this.imod(num.shln(this.shift));
};

Mont.prototype.convertFrom = function convertFrom(num) {
  var r = this.imod(num.mul(this.rinv));
  r.red = null;
  return r;
};

Mont.prototype.imul = function imul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0) {
    a.words[0] = 0;
    a.length = 1;
    return a;
  }

  var t = a.imul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.mul = function mul(a, b) {
  if (a.cmpn(0) === 0 || b.cmpn(0) === 0)
    return new BN(0)._forceRed(this);

  var t = a.mul(b);
  var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
  var u = t.isub(c).ishrn(this.shift);
  var res = u;
  if (u.cmp(this.m) >= 0)
    res = u.isub(this.m);
  else if (u.cmpn(0) < 0)
    res = u.iadd(this.m);

  return res._forceRed(this);
};

Mont.prototype.invm = function invm(a) {
  // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
  var res = this.imod(a.invm(this.m).mul(this.r2));
  return res._forceRed(this);
};

})(typeof module === 'undefined' || module, this);

},{}],13:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],14:[function(require,module,exports){
module.exports = assert;

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

assert.equal = function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
};

},{}],15:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding) {
  var self = this
  if (!(self instanceof Buffer)) return new Buffer(subject, encoding)

  var type = typeof subject
  var length

  if (type === 'number') {
    length = +subject
  } else if (type === 'string') {
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) {
    // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data)) subject = subject.data
    length = +subject.length
  } else {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (length > kMaxLength) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum size: 0x' +
      kMaxLength.toString(16) + ' bytes')
  }

  if (length < 0) length = 0
  else length >>>= 0 // coerce to uint32

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    self = Buffer._augment(new Uint8Array(length)) // eslint-disable-line consistent-this
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    self.length = length
    self._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    self._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++) {
        self[i] = subject.readUInt8(i)
      }
    } else {
      for (i = 0; i < length; i++) {
        self[i] = ((subject[i] % 256) + 256) % 256
      }
    }
  } else if (type === 'string') {
    self.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT) {
    for (i = 0; i < length; i++) {
      self[i] = 0
    }
  }

  if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent

  return self
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, totalLength) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function byteLength (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function toString (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0

  if (length < 0 || offset < 0 || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) >>> 0 & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(
      this, value, offset, byteLength,
      Math.pow(2, 8 * byteLength - 1) - 1,
      -Math.pow(2, 8 * byteLength - 1)
    )
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, target_start, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (target_start >= target.length) target_start = target.length
  if (!target_start) target_start = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (target_start < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - target_start < end - start) {
    end = target.length - target_start + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":16,"ieee754":17,"is-array":18}],16:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],17:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],18:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],19:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":20}],20:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],"asn1.js":[function(require,module,exports){
var asn1 = exports;

asn1.bignum = require('bn.js');

asn1.define = require('./asn1/api').define;
asn1.base = require('./asn1/base');
asn1.constants = require('./asn1/constants');
asn1.decoders = require('./asn1/decoders');
asn1.encoders = require('./asn1/encoders');

},{"./asn1/api":1,"./asn1/base":3,"./asn1/constants":7,"./asn1/decoders":9,"./asn1/encoders":11,"bn.js":12}]},{},[]);

/**
 * EndFile: verifychain/asn1.js
 */

/**
 * File: verifychain/jsrsasign-latest-all-min.js
 */
/*
 * jsrsasign 4.2.2 (c) 2010-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
/*
yahoo-min.js
Copyright (c) 2011, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.com/yui/license.html
version: 2.9.0
*/
window = {}
if(typeof YAHOO=="undefined"||!YAHOO){var YAHOO={};}YAHOO.namespace=function(){var b=arguments,g=null,e,c,f;for(e=0;e<b.length;e=e+1){f=(""+b[e]).split(".");g=YAHOO;for(c=(f[0]=="YAHOO")?1:0;c<f.length;c=c+1){g[f[c]]=g[f[c]]||{};g=g[f[c]];}}return g;};YAHOO.log=function(d,a,c){var b=YAHOO.widget.Logger;if(b&&b.log){return b.log(d,a,c);}else{return false;}};YAHOO.register=function(a,f,e){var k=YAHOO.env.modules,c,j,h,g,d;if(!k[a]){k[a]={versions:[],builds:[]};}c=k[a];j=e.version;h=e.build;g=YAHOO.env.listeners;c.name=a;c.version=j;c.build=h;c.versions.push(j);c.builds.push(h);c.mainClass=f;for(d=0;d<g.length;d=d+1){g[d](c);}if(f){f.VERSION=j;f.BUILD=h;}else{YAHOO.log("mainClass is undefined for module "+a,"warn");}};YAHOO.env=YAHOO.env||{modules:[],listeners:[]};YAHOO.env.getVersion=function(a){return YAHOO.env.modules[a]||null;};YAHOO.env.parseUA=function(d){var e=function(i){var j=0;return parseFloat(i.replace(/\./g,function(){return(j++==1)?"":".";}));},h=navigator,g={ie:0,opera:0,gecko:0,webkit:0,chrome:0,mobile:null,air:0,ipad:0,iphone:0,ipod:0,ios:null,android:0,webos:0,caja:h&&h.cajaVersion,secure:false,os:null},c=d||(navigator&&navigator.userAgent),f=window&&window.location,b=f&&f.href,a;g.secure=b&&(b.toLowerCase().indexOf("https")===0);if(c){if((/windows|win32/i).test(c)){g.os="windows";}else{if((/macintosh/i).test(c)){g.os="macintosh";}else{if((/rhino/i).test(c)){g.os="rhino";}}}if((/KHTML/).test(c)){g.webkit=1;}a=c.match(/AppleWebKit\/([^\s]*)/);if(a&&a[1]){g.webkit=e(a[1]);if(/ Mobile\//.test(c)){g.mobile="Apple";a=c.match(/OS ([^\s]*)/);if(a&&a[1]){a=e(a[1].replace("_","."));}g.ios=a;g.ipad=g.ipod=g.iphone=0;a=c.match(/iPad|iPod|iPhone/);if(a&&a[0]){g[a[0].toLowerCase()]=g.ios;}}else{a=c.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);if(a){g.mobile=a[0];}if(/webOS/.test(c)){g.mobile="WebOS";a=c.match(/webOS\/([^\s]*);/);if(a&&a[1]){g.webos=e(a[1]);}}if(/ Android/.test(c)){g.mobile="Android";a=c.match(/Android ([^\s]*);/);if(a&&a[1]){g.android=e(a[1]);}}}a=c.match(/Chrome\/([^\s]*)/);if(a&&a[1]){g.chrome=e(a[1]);}else{a=c.match(/AdobeAIR\/([^\s]*)/);if(a){g.air=a[0];}}}if(!g.webkit){a=c.match(/Opera[\s\/]([^\s]*)/);if(a&&a[1]){g.opera=e(a[1]);a=c.match(/Version\/([^\s]*)/);if(a&&a[1]){g.opera=e(a[1]);}a=c.match(/Opera Mini[^;]*/);if(a){g.mobile=a[0];}}else{a=c.match(/MSIE\s([^;]*)/);if(a&&a[1]){g.ie=e(a[1]);}else{a=c.match(/Gecko\/([^\s]*)/);if(a){g.gecko=1;a=c.match(/rv:([^\s\)]*)/);if(a&&a[1]){g.gecko=e(a[1]);}}}}}}return g;};YAHOO.env.ua=YAHOO.env.parseUA();(function(){YAHOO.namespace("util","widget","example");if("undefined"!==typeof YAHOO_config){var b=YAHOO_config.listener,a=YAHOO.env.listeners,d=true,c;if(b){for(c=0;c<a.length;c++){if(a[c]==b){d=false;break;}}if(d){a.push(b);}}}})();YAHOO.lang=YAHOO.lang||{};(function(){var f=YAHOO.lang,a=Object.prototype,c="[object Array]",h="[object Function]",i="[object Object]",b=[],g={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;","`":"&#x60;"},d=["toString","valueOf"],e={isArray:function(j){return a.toString.apply(j)===c;},isBoolean:function(j){return typeof j==="boolean";},isFunction:function(j){return(typeof j==="function")||a.toString.apply(j)===h;},isNull:function(j){return j===null;},isNumber:function(j){return typeof j==="number"&&isFinite(j);},isObject:function(j){return(j&&(typeof j==="object"||f.isFunction(j)))||false;},isString:function(j){return typeof j==="string";},isUndefined:function(j){return typeof j==="undefined";},_IEEnumFix:(YAHOO.env.ua.ie)?function(l,k){var j,n,m;for(j=0;j<d.length;j=j+1){n=d[j];m=k[n];if(f.isFunction(m)&&m!=a[n]){l[n]=m;}}}:function(){},escapeHTML:function(j){return j.replace(/[&<>"'\/`]/g,function(k){return g[k];});},extend:function(m,n,l){if(!n||!m){throw new Error("extend failed, please check that "+"all dependencies are included.");}var k=function(){},j;k.prototype=n.prototype;m.prototype=new k();m.prototype.constructor=m;m.superclass=n.prototype;if(n.prototype.constructor==a.constructor){n.prototype.constructor=n;}if(l){for(j in l){if(f.hasOwnProperty(l,j)){m.prototype[j]=l[j];}}f._IEEnumFix(m.prototype,l);}},augmentObject:function(n,m){if(!m||!n){throw new Error("Absorb failed, verify dependencies.");}var j=arguments,l,o,k=j[2];if(k&&k!==true){for(l=2;l<j.length;l=l+1){n[j[l]]=m[j[l]];}}else{for(o in m){if(k||!(o in n)){n[o]=m[o];}}f._IEEnumFix(n,m);}return n;},augmentProto:function(m,l){if(!l||!m){throw new Error("Augment failed, verify dependencies.");}var j=[m.prototype,l.prototype],k;for(k=2;k<arguments.length;k=k+1){j.push(arguments[k]);}f.augmentObject.apply(this,j);return m;},dump:function(j,p){var l,n,r=[],t="{...}",k="f(){...}",q=", ",m=" => ";if(!f.isObject(j)){return j+"";}else{if(j instanceof Date||("nodeType" in j&&"tagName" in j)){return j;}else{if(f.isFunction(j)){return k;}}}p=(f.isNumber(p))?p:3;if(f.isArray(j)){r.push("[");for(l=0,n=j.length;l<n;l=l+1){if(f.isObject(j[l])){r.push((p>0)?f.dump(j[l],p-1):t);}else{r.push(j[l]);}r.push(q);}if(r.length>1){r.pop();}r.push("]");}else{r.push("{");for(l in j){if(f.hasOwnProperty(j,l)){r.push(l+m);if(f.isObject(j[l])){r.push((p>0)?f.dump(j[l],p-1):t);}else{r.push(j[l]);}r.push(q);}}if(r.length>1){r.pop();}r.push("}");}return r.join("");},substitute:function(x,y,E,l){var D,C,B,G,t,u,F=[],p,z=x.length,A="dump",r=" ",q="{",m="}",n,w;for(;;){D=x.lastIndexOf(q,z);if(D<0){break;}C=x.indexOf(m,D);if(D+1>C){break;}p=x.substring(D+1,C);G=p;u=null;B=G.indexOf(r);if(B>-1){u=G.substring(B+1);G=G.substring(0,B);}t=y[G];if(E){t=E(G,t,u);}if(f.isObject(t)){if(f.isArray(t)){t=f.dump(t,parseInt(u,10));}else{u=u||"";n=u.indexOf(A);if(n>-1){u=u.substring(4);}w=t.toString();if(w===i||n>-1){t=f.dump(t,parseInt(u,10));}else{t=w;}}}else{if(!f.isString(t)&&!f.isNumber(t)){t="~-"+F.length+"-~";F[F.length]=p;}}x=x.substring(0,D)+t+x.substring(C+1);if(l===false){z=D-1;}}for(D=F.length-1;D>=0;D=D-1){x=x.replace(new RegExp("~-"+D+"-~"),"{"+F[D]+"}","g");}return x;},trim:function(j){try{return j.replace(/^\s+|\s+$/g,"");}catch(k){return j;
}},merge:function(){var n={},k=arguments,j=k.length,m;for(m=0;m<j;m=m+1){f.augmentObject(n,k[m],true);}return n;},later:function(t,k,u,n,p){t=t||0;k=k||{};var l=u,s=n,q,j;if(f.isString(u)){l=k[u];}if(!l){throw new TypeError("method undefined");}if(!f.isUndefined(n)&&!f.isArray(s)){s=[n];}q=function(){l.apply(k,s||b);};j=(p)?setInterval(q,t):setTimeout(q,t);return{interval:p,cancel:function(){if(this.interval){clearInterval(j);}else{clearTimeout(j);}}};},isValue:function(j){return(f.isObject(j)||f.isString(j)||f.isNumber(j)||f.isBoolean(j));}};f.hasOwnProperty=(a.hasOwnProperty)?function(j,k){return j&&j.hasOwnProperty&&j.hasOwnProperty(k);}:function(j,k){return !f.isUndefined(j[k])&&j.constructor.prototype[k]!==j[k];};e.augmentObject(f,e,true);YAHOO.util.Lang=f;f.augment=f.augmentProto;YAHOO.augment=f.augmentProto;YAHOO.extend=f.extend;})();YAHOO.register("yahoo",YAHOO,{version:"2.9.0",build:"2800"});
/*! CryptoJS v3.1.2 core-fix.js
 * code.google.com/p/crypto-js
 * (c) 2009-2013 by Jeff Mott. All rights reserved.
 * code.google.com/p/crypto-js/wiki/License
 * THIS IS FIX of 'core.js' to fix Hmac issue.
 * https://code.google.com/p/crypto-js/issues/detail?id=84
 * https://crypto-js.googlecode.com/svn-history/r667/branches/3.x/src/core.js
 */
var CryptoJS=CryptoJS||(function(e,g){var a={};var b=a.lib={};var j=b.Base=(function(){function n(){}return{extend:function(p){n.prototype=this;var o=new n();if(p){o.mixIn(p)}if(!o.hasOwnProperty("init")){o.init=function(){o.$super.init.apply(this,arguments)}}o.init.prototype=o;o.$super=this;return o},create:function(){var o=this.extend();o.init.apply(o,arguments);return o},init:function(){},mixIn:function(p){for(var o in p){if(p.hasOwnProperty(o)){this[o]=p[o]}}if(p.hasOwnProperty("toString")){this.toString=p.toString}},clone:function(){return this.init.prototype.extend(this)}}}());var l=b.WordArray=j.extend({init:function(o,n){o=this.words=o||[];if(n!=g){this.sigBytes=n}else{this.sigBytes=o.length*4}},toString:function(n){return(n||h).stringify(this)},concat:function(t){var q=this.words;var p=t.words;var n=this.sigBytes;var s=t.sigBytes;this.clamp();if(n%4){for(var r=0;r<s;r++){var o=(p[r>>>2]>>>(24-(r%4)*8))&255;q[(n+r)>>>2]|=o<<(24-((n+r)%4)*8)}}else{for(var r=0;r<s;r+=4){q[(n+r)>>>2]=p[r>>>2]}}this.sigBytes+=s;return this},clamp:function(){var o=this.words;var n=this.sigBytes;o[n>>>2]&=4294967295<<(32-(n%4)*8);o.length=e.ceil(n/4)},clone:function(){var n=j.clone.call(this);n.words=this.words.slice(0);return n},random:function(p){var o=[];for(var n=0;n<p;n+=4){o.push((e.random()*4294967296)|0)}return new l.init(o,p)}});var m=a.enc={};var h=m.Hex={stringify:function(p){var r=p.words;var o=p.sigBytes;var q=[];for(var n=0;n<o;n++){var s=(r[n>>>2]>>>(24-(n%4)*8))&255;q.push((s>>>4).toString(16));q.push((s&15).toString(16))}return q.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o+=2){q[o>>>3]|=parseInt(p.substr(o,2),16)<<(24-(o%8)*4)}return new l.init(q,n/2)}};var d=m.Latin1={stringify:function(q){var r=q.words;var p=q.sigBytes;var n=[];for(var o=0;o<p;o++){var s=(r[o>>>2]>>>(24-(o%4)*8))&255;n.push(String.fromCharCode(s))}return n.join("")},parse:function(p){var n=p.length;var q=[];for(var o=0;o<n;o++){q[o>>>2]|=(p.charCodeAt(o)&255)<<(24-(o%4)*8)}return new l.init(q,n)}};var c=m.Utf8={stringify:function(n){try{return decodeURIComponent(escape(d.stringify(n)))}catch(o){throw new Error("Malformed UTF-8 data")}},parse:function(n){return d.parse(unescape(encodeURIComponent(n)))}};var i=b.BufferedBlockAlgorithm=j.extend({reset:function(){this._data=new l.init();this._nDataBytes=0},_append:function(n){if(typeof n=="string"){n=c.parse(n)}this._data.concat(n);this._nDataBytes+=n.sigBytes},_process:function(w){var q=this._data;var x=q.words;var n=q.sigBytes;var t=this.blockSize;var v=t*4;var u=n/v;if(w){u=e.ceil(u)}else{u=e.max((u|0)-this._minBufferSize,0)}var s=u*t;var r=e.min(s*4,n);if(s){for(var p=0;p<s;p+=t){this._doProcessBlock(x,p)}var o=x.splice(0,s);q.sigBytes-=r}return new l.init(o,r)},clone:function(){var n=j.clone.call(this);n._data=this._data.clone();return n},_minBufferSize:0});var f=b.Hasher=i.extend({cfg:j.extend(),init:function(n){this.cfg=this.cfg.extend(n);this.reset()},reset:function(){i.reset.call(this);this._doReset()},update:function(n){this._append(n);this._process();return this},finalize:function(n){if(n){this._append(n)}var o=this._doFinalize();return o},blockSize:512/32,_createHelper:function(n){return function(p,o){return new n.init(o).finalize(p)}},_createHmacHelper:function(n){return function(p,o){return new k.HMAC.init(n,o).finalize(p)}}});var k=a.algo={};return a}(Math));/*
CryptoJS v3.1.2 x64-core-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(g){var a=CryptoJS,f=a.lib,e=f.Base,h=f.WordArray,a=a.x64={};a.Word=e.extend({init:function(b,c){this.high=b;this.low=c}});a.WordArray=e.extend({init:function(b,c){b=this.words=b||[];this.sigBytes=c!=g?c:8*b.length},toX32:function(){for(var b=this.words,c=b.length,a=[],d=0;d<c;d++){var e=b[d];a.push(e.high);a.push(e.low)}return h.create(a,this.sigBytes)},clone:function(){for(var b=e.clone.call(this),c=b.words=this.words.slice(0),a=c.length,d=0;d<a;d++)c[d]=c[d].clone();return b}})})();
/*
CryptoJS v3.1.2 hmac-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var c=CryptoJS,k=c.enc.Utf8;c.algo.HMAC=c.lib.Base.extend({init:function(a,b){a=this._hasher=new a.init;"string"==typeof b&&(b=k.parse(b));var c=a.blockSize,e=4*c;b.sigBytes>e&&(b=a.finalize(b));b.clamp();for(var f=this._oKey=b.clone(),g=this._iKey=b.clone(),h=f.words,j=g.words,d=0;d<c;d++)h[d]^=1549556828,j[d]^=909522486;f.sigBytes=g.sigBytes=e;this.reset()},reset:function(){var a=this._hasher;a.reset();a.update(this._iKey)},update:function(a){this._hasher.update(a);return this},finalize:function(a){var b=
this._hasher;a=b.finalize(a);b.reset();return b.finalize(this._oKey.clone().concat(a))}})})();
/*
CryptoJS v3.1.2 sha256-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(k){for(var g=CryptoJS,h=g.lib,v=h.WordArray,j=h.Hasher,h=g.algo,s=[],t=[],u=function(q){return 4294967296*(q-(q|0))|0},l=2,b=0;64>b;){var d;a:{d=l;for(var w=k.sqrt(d),r=2;r<=w;r++)if(!(d%r)){d=!1;break a}d=!0}d&&(8>b&&(s[b]=u(k.pow(l,0.5))),t[b]=u(k.pow(l,1/3)),b++);l++}var n=[],h=h.SHA256=j.extend({_doReset:function(){this._hash=new v.init(s.slice(0))},_doProcessBlock:function(q,h){for(var a=this._hash.words,c=a[0],d=a[1],b=a[2],k=a[3],f=a[4],g=a[5],j=a[6],l=a[7],e=0;64>e;e++){if(16>e)n[e]=
q[h+e]|0;else{var m=n[e-15],p=n[e-2];n[e]=((m<<25|m>>>7)^(m<<14|m>>>18)^m>>>3)+n[e-7]+((p<<15|p>>>17)^(p<<13|p>>>19)^p>>>10)+n[e-16]}m=l+((f<<26|f>>>6)^(f<<21|f>>>11)^(f<<7|f>>>25))+(f&g^~f&j)+t[e]+n[e];p=((c<<30|c>>>2)^(c<<19|c>>>13)^(c<<10|c>>>22))+(c&d^c&b^d&b);l=j;j=g;g=f;f=k+m|0;k=b;b=d;d=c;c=m+p|0}a[0]=a[0]+c|0;a[1]=a[1]+d|0;a[2]=a[2]+b|0;a[3]=a[3]+k|0;a[4]=a[4]+f|0;a[5]=a[5]+g|0;a[6]=a[6]+j|0;a[7]=a[7]+l|0},_doFinalize:function(){var d=this._data,b=d.words,a=8*this._nDataBytes,c=8*d.sigBytes;
b[c>>>5]|=128<<24-c%32;b[(c+64>>>9<<4)+14]=k.floor(a/4294967296);b[(c+64>>>9<<4)+15]=a;d.sigBytes=4*b.length;this._process();return this._hash},clone:function(){var b=j.clone.call(this);b._hash=this._hash.clone();return b}});g.SHA256=j._createHelper(h);g.HmacSHA256=j._createHmacHelper(h)})(Math);
/*
CryptoJS v3.1.2 sha224-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var b=CryptoJS,d=b.lib.WordArray,a=b.algo,c=a.SHA256,a=a.SHA224=c.extend({_doReset:function(){this._hash=new d.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var a=c._doFinalize.call(this);a.sigBytes-=4;return a}});b.SHA224=c._createHelper(a);b.HmacSHA224=c._createHmacHelper(a)})();
/*
CryptoJS v3.1.2 sha512-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){function a(){return d.create.apply(d,arguments)}for(var n=CryptoJS,r=n.lib.Hasher,e=n.x64,d=e.Word,T=e.WordArray,e=n.algo,ea=[a(1116352408,3609767458),a(1899447441,602891725),a(3049323471,3964484399),a(3921009573,2173295548),a(961987163,4081628472),a(1508970993,3053834265),a(2453635748,2937671579),a(2870763221,3664609560),a(3624381080,2734883394),a(310598401,1164996542),a(607225278,1323610764),a(1426881987,3590304994),a(1925078388,4068182383),a(2162078206,991336113),a(2614888103,633803317),
a(3248222580,3479774868),a(3835390401,2666613458),a(4022224774,944711139),a(264347078,2341262773),a(604807628,2007800933),a(770255983,1495990901),a(1249150122,1856431235),a(1555081692,3175218132),a(1996064986,2198950837),a(2554220882,3999719339),a(2821834349,766784016),a(2952996808,2566594879),a(3210313671,3203337956),a(3336571891,1034457026),a(3584528711,2466948901),a(113926993,3758326383),a(338241895,168717936),a(666307205,1188179964),a(773529912,1546045734),a(1294757372,1522805485),a(1396182291,
2643833823),a(1695183700,2343527390),a(1986661051,1014477480),a(2177026350,1206759142),a(2456956037,344077627),a(2730485921,1290863460),a(2820302411,3158454273),a(3259730800,3505952657),a(3345764771,106217008),a(3516065817,3606008344),a(3600352804,1432725776),a(4094571909,1467031594),a(275423344,851169720),a(430227734,3100823752),a(506948616,1363258195),a(659060556,3750685593),a(883997877,3785050280),a(958139571,3318307427),a(1322822218,3812723403),a(1537002063,2003034995),a(1747873779,3602036899),
a(1955562222,1575990012),a(2024104815,1125592928),a(2227730452,2716904306),a(2361852424,442776044),a(2428436474,593698344),a(2756734187,3733110249),a(3204031479,2999351573),a(3329325298,3815920427),a(3391569614,3928383900),a(3515267271,566280711),a(3940187606,3454069534),a(4118630271,4000239992),a(116418474,1914138554),a(174292421,2731055270),a(289380356,3203993006),a(460393269,320620315),a(685471733,587496836),a(852142971,1086792851),a(1017036298,365543100),a(1126000580,2618297676),a(1288033470,
3409855158),a(1501505948,4234509866),a(1607167915,987167468),a(1816402316,1246189591)],v=[],w=0;80>w;w++)v[w]=a();e=e.SHA512=r.extend({_doReset:function(){this._hash=new T.init([new d.init(1779033703,4089235720),new d.init(3144134277,2227873595),new d.init(1013904242,4271175723),new d.init(2773480762,1595750129),new d.init(1359893119,2917565137),new d.init(2600822924,725511199),new d.init(528734635,4215389547),new d.init(1541459225,327033209)])},_doProcessBlock:function(a,d){for(var f=this._hash.words,
F=f[0],e=f[1],n=f[2],r=f[3],G=f[4],H=f[5],I=f[6],f=f[7],w=F.high,J=F.low,X=e.high,K=e.low,Y=n.high,L=n.low,Z=r.high,M=r.low,$=G.high,N=G.low,aa=H.high,O=H.low,ba=I.high,P=I.low,ca=f.high,Q=f.low,k=w,g=J,z=X,x=K,A=Y,y=L,U=Z,B=M,l=$,h=N,R=aa,C=O,S=ba,D=P,V=ca,E=Q,m=0;80>m;m++){var s=v[m];if(16>m)var j=s.high=a[d+2*m]|0,b=s.low=a[d+2*m+1]|0;else{var j=v[m-15],b=j.high,p=j.low,j=(b>>>1|p<<31)^(b>>>8|p<<24)^b>>>7,p=(p>>>1|b<<31)^(p>>>8|b<<24)^(p>>>7|b<<25),u=v[m-2],b=u.high,c=u.low,u=(b>>>19|c<<13)^(b<<
3|c>>>29)^b>>>6,c=(c>>>19|b<<13)^(c<<3|b>>>29)^(c>>>6|b<<26),b=v[m-7],W=b.high,t=v[m-16],q=t.high,t=t.low,b=p+b.low,j=j+W+(b>>>0<p>>>0?1:0),b=b+c,j=j+u+(b>>>0<c>>>0?1:0),b=b+t,j=j+q+(b>>>0<t>>>0?1:0);s.high=j;s.low=b}var W=l&R^~l&S,t=h&C^~h&D,s=k&z^k&A^z&A,T=g&x^g&y^x&y,p=(k>>>28|g<<4)^(k<<30|g>>>2)^(k<<25|g>>>7),u=(g>>>28|k<<4)^(g<<30|k>>>2)^(g<<25|k>>>7),c=ea[m],fa=c.high,da=c.low,c=E+((h>>>14|l<<18)^(h>>>18|l<<14)^(h<<23|l>>>9)),q=V+((l>>>14|h<<18)^(l>>>18|h<<14)^(l<<23|h>>>9))+(c>>>0<E>>>0?1:
0),c=c+t,q=q+W+(c>>>0<t>>>0?1:0),c=c+da,q=q+fa+(c>>>0<da>>>0?1:0),c=c+b,q=q+j+(c>>>0<b>>>0?1:0),b=u+T,s=p+s+(b>>>0<u>>>0?1:0),V=S,E=D,S=R,D=C,R=l,C=h,h=B+c|0,l=U+q+(h>>>0<B>>>0?1:0)|0,U=A,B=y,A=z,y=x,z=k,x=g,g=c+b|0,k=q+s+(g>>>0<c>>>0?1:0)|0}J=F.low=J+g;F.high=w+k+(J>>>0<g>>>0?1:0);K=e.low=K+x;e.high=X+z+(K>>>0<x>>>0?1:0);L=n.low=L+y;n.high=Y+A+(L>>>0<y>>>0?1:0);M=r.low=M+B;r.high=Z+U+(M>>>0<B>>>0?1:0);N=G.low=N+h;G.high=$+l+(N>>>0<h>>>0?1:0);O=H.low=O+C;H.high=aa+R+(O>>>0<C>>>0?1:0);P=I.low=P+D;
I.high=ba+S+(P>>>0<D>>>0?1:0);Q=f.low=Q+E;f.high=ca+V+(Q>>>0<E>>>0?1:0)},_doFinalize:function(){var a=this._data,d=a.words,f=8*this._nDataBytes,e=8*a.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+128>>>10<<5)+30]=Math.floor(f/4294967296);d[(e+128>>>10<<5)+31]=f;a.sigBytes=4*d.length;this._process();return this._hash.toX32()},clone:function(){var a=r.clone.call(this);a._hash=this._hash.clone();return a},blockSize:32});n.SHA512=r._createHelper(e);n.HmacSHA512=r._createHmacHelper(e)})();
/*
CryptoJS v3.1.2 sha384-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var c=CryptoJS,a=c.x64,b=a.Word,e=a.WordArray,a=c.algo,d=a.SHA512,a=a.SHA384=d.extend({_doReset:function(){this._hash=new e.init([new b.init(3418070365,3238371032),new b.init(1654270250,914150663),new b.init(2438529370,812702999),new b.init(355462360,4144912697),new b.init(1731405415,4290775857),new b.init(2394180231,1750603025),new b.init(3675008525,1694076839),new b.init(1203062813,3204075428)])},_doFinalize:function(){var a=d._doFinalize.call(this);a.sigBytes-=16;return a}});c.SHA384=
d._createHelper(a);c.HmacSHA384=d._createHmacHelper(a)})();
/*
CryptoJS v3.1.2 md5-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(E){function h(a,f,g,j,p,h,k){a=a+(f&g|~f&j)+p+k;return(a<<h|a>>>32-h)+f}function k(a,f,g,j,p,h,k){a=a+(f&j|g&~j)+p+k;return(a<<h|a>>>32-h)+f}function l(a,f,g,j,h,k,l){a=a+(f^g^j)+h+l;return(a<<k|a>>>32-k)+f}function n(a,f,g,j,h,k,l){a=a+(g^(f|~j))+h+l;return(a<<k|a>>>32-k)+f}for(var r=CryptoJS,q=r.lib,F=q.WordArray,s=q.Hasher,q=r.algo,a=[],t=0;64>t;t++)a[t]=4294967296*E.abs(E.sin(t+1))|0;q=q.MD5=s.extend({_doReset:function(){this._hash=new F.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(m,f){for(var g=0;16>g;g++){var j=f+g,p=m[j];m[j]=(p<<8|p>>>24)&16711935|(p<<24|p>>>8)&4278255360}var g=this._hash.words,j=m[f+0],p=m[f+1],q=m[f+2],r=m[f+3],s=m[f+4],t=m[f+5],u=m[f+6],v=m[f+7],w=m[f+8],x=m[f+9],y=m[f+10],z=m[f+11],A=m[f+12],B=m[f+13],C=m[f+14],D=m[f+15],b=g[0],c=g[1],d=g[2],e=g[3],b=h(b,c,d,e,j,7,a[0]),e=h(e,b,c,d,p,12,a[1]),d=h(d,e,b,c,q,17,a[2]),c=h(c,d,e,b,r,22,a[3]),b=h(b,c,d,e,s,7,a[4]),e=h(e,b,c,d,t,12,a[5]),d=h(d,e,b,c,u,17,a[6]),c=h(c,d,e,b,v,22,a[7]),
b=h(b,c,d,e,w,7,a[8]),e=h(e,b,c,d,x,12,a[9]),d=h(d,e,b,c,y,17,a[10]),c=h(c,d,e,b,z,22,a[11]),b=h(b,c,d,e,A,7,a[12]),e=h(e,b,c,d,B,12,a[13]),d=h(d,e,b,c,C,17,a[14]),c=h(c,d,e,b,D,22,a[15]),b=k(b,c,d,e,p,5,a[16]),e=k(e,b,c,d,u,9,a[17]),d=k(d,e,b,c,z,14,a[18]),c=k(c,d,e,b,j,20,a[19]),b=k(b,c,d,e,t,5,a[20]),e=k(e,b,c,d,y,9,a[21]),d=k(d,e,b,c,D,14,a[22]),c=k(c,d,e,b,s,20,a[23]),b=k(b,c,d,e,x,5,a[24]),e=k(e,b,c,d,C,9,a[25]),d=k(d,e,b,c,r,14,a[26]),c=k(c,d,e,b,w,20,a[27]),b=k(b,c,d,e,B,5,a[28]),e=k(e,b,
c,d,q,9,a[29]),d=k(d,e,b,c,v,14,a[30]),c=k(c,d,e,b,A,20,a[31]),b=l(b,c,d,e,t,4,a[32]),e=l(e,b,c,d,w,11,a[33]),d=l(d,e,b,c,z,16,a[34]),c=l(c,d,e,b,C,23,a[35]),b=l(b,c,d,e,p,4,a[36]),e=l(e,b,c,d,s,11,a[37]),d=l(d,e,b,c,v,16,a[38]),c=l(c,d,e,b,y,23,a[39]),b=l(b,c,d,e,B,4,a[40]),e=l(e,b,c,d,j,11,a[41]),d=l(d,e,b,c,r,16,a[42]),c=l(c,d,e,b,u,23,a[43]),b=l(b,c,d,e,x,4,a[44]),e=l(e,b,c,d,A,11,a[45]),d=l(d,e,b,c,D,16,a[46]),c=l(c,d,e,b,q,23,a[47]),b=n(b,c,d,e,j,6,a[48]),e=n(e,b,c,d,v,10,a[49]),d=n(d,e,b,c,
C,15,a[50]),c=n(c,d,e,b,t,21,a[51]),b=n(b,c,d,e,A,6,a[52]),e=n(e,b,c,d,r,10,a[53]),d=n(d,e,b,c,y,15,a[54]),c=n(c,d,e,b,p,21,a[55]),b=n(b,c,d,e,w,6,a[56]),e=n(e,b,c,d,D,10,a[57]),d=n(d,e,b,c,u,15,a[58]),c=n(c,d,e,b,B,21,a[59]),b=n(b,c,d,e,s,6,a[60]),e=n(e,b,c,d,z,10,a[61]),d=n(d,e,b,c,q,15,a[62]),c=n(c,d,e,b,x,21,a[63]);g[0]=g[0]+b|0;g[1]=g[1]+c|0;g[2]=g[2]+d|0;g[3]=g[3]+e|0},_doFinalize:function(){var a=this._data,f=a.words,g=8*this._nDataBytes,j=8*a.sigBytes;f[j>>>5]|=128<<24-j%32;var h=E.floor(g/
4294967296);f[(j+64>>>9<<4)+15]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;f[(j+64>>>9<<4)+14]=(g<<8|g>>>24)&16711935|(g<<24|g>>>8)&4278255360;a.sigBytes=4*(f.length+1);this._process();a=this._hash;f=a.words;for(g=0;4>g;g++)j=f[g],f[g]=(j<<8|j>>>24)&16711935|(j<<24|j>>>8)&4278255360;return a},clone:function(){var a=s.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=s._createHelper(q);r.HmacMD5=s._createHmacHelper(q)})(Math);
/*
CryptoJS v3.1.2 enc-base64-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var h=CryptoJS,j=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();b=[];for(var a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));for(var c=[],a=0,d=0;d<
e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return j.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
/*
CryptoJS v3.1.2 cipher-core-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
CryptoJS.lib.Cipher||function(u){var g=CryptoJS,f=g.lib,k=f.Base,l=f.WordArray,q=f.BufferedBlockAlgorithm,r=g.enc.Base64,v=g.algo.EvpKDF,n=f.Cipher=q.extend({cfg:k.extend(),createEncryptor:function(a,b){return this.create(this._ENC_XFORM_MODE,a,b)},createDecryptor:function(a,b){return this.create(this._DEC_XFORM_MODE,a,b)},init:function(a,b,c){this.cfg=this.cfg.extend(c);this._xformMode=a;this._key=b;this.reset()},reset:function(){q.reset.call(this);this._doReset()},process:function(a){this._append(a);
return this._process()},finalize:function(a){a&&this._append(a);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(a){return{encrypt:function(b,c,d){return("string"==typeof c?s:j).encrypt(a,b,c,d)},decrypt:function(b,c,d){return("string"==typeof c?s:j).decrypt(a,b,c,d)}}}});f.StreamCipher=n.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var m=g.mode={},t=function(a,b,c){var d=this._iv;d?this._iv=u:d=this._prevBlock;for(var e=
0;e<c;e++)a[b+e]^=d[e]},h=(f.BlockCipherMode=k.extend({createEncryptor:function(a,b){return this.Encryptor.create(a,b)},createDecryptor:function(a,b){return this.Decryptor.create(a,b)},init:function(a,b){this._cipher=a;this._iv=b}})).extend();h.Encryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize;t.call(this,a,b,d);c.encryptBlock(a,b);this._prevBlock=a.slice(b,b+d)}});h.Decryptor=h.extend({processBlock:function(a,b){var c=this._cipher,d=c.blockSize,e=a.slice(b,b+d);c.decryptBlock(a,
b);t.call(this,a,b,d);this._prevBlock=e}});m=m.CBC=h;h=(g.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,e=[],f=0;f<c;f+=4)e.push(d);c=l.create(e,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};f.BlockCipher=n.extend({cfg:n.cfg.extend({mode:m,padding:h}),reset:function(){n.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;
this._mode=c.call(a,this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var p=f.CipherParams=k.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),m=(g.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;
return(a?l.create([1398893684,1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=l.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return p.create({ciphertext:a,salt:c})}},j=f.SerializableCipher=k.extend({cfg:k.extend({format:m}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var e=a.createEncryptor(c,d);b=e.finalize(b);e=e.cfg;return p.create({ciphertext:b,key:c,iv:e.iv,algorithm:a,mode:e.mode,padding:e.padding,
blockSize:a.blockSize,formatter:d.format})},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),g=(g.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=l.random(8));a=v.create({keySize:b+c}).compute(a,d);c=l.create(a.words.slice(b),4*c);a.sigBytes=4*b;return p.create({key:a,iv:c,salt:d})}},s=f.PasswordBasedCipher=j.extend({cfg:j.cfg.extend({kdf:g}),encrypt:function(a,
b,c,d){d=this.cfg.extend(d);c=d.kdf.execute(c,a.keySize,a.ivSize);d.iv=c.iv;a=j.encrypt.call(this,a,b,c.key,d);a.mixIn(c);return a},decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);c=d.kdf.execute(c,a.keySize,a.ivSize,b.salt);d.iv=c.iv;return j.decrypt.call(this,a,b,c.key,d)}})}();
/*
CryptoJS v3.1.2 aes-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){for(var q=CryptoJS,x=q.lib.BlockCipher,r=q.algo,j=[],y=[],z=[],A=[],B=[],C=[],s=[],u=[],v=[],w=[],g=[],k=0;256>k;k++)g[k]=128>k?k<<1:k<<1^283;for(var n=0,l=0,k=0;256>k;k++){var f=l^l<<1^l<<2^l<<3^l<<4,f=f>>>8^f&255^99;j[n]=f;y[f]=n;var t=g[n],D=g[t],E=g[D],b=257*g[f]^16843008*f;z[n]=b<<24|b>>>8;A[n]=b<<16|b>>>16;B[n]=b<<8|b>>>24;C[n]=b;b=16843009*E^65537*D^257*t^16843008*n;s[f]=b<<24|b>>>8;u[f]=b<<16|b>>>16;v[f]=b<<8|b>>>24;w[f]=b;n?(n=t^g[g[g[E^t]]],l^=g[g[l]]):n=l=1}var F=[0,1,2,4,8,
16,32,64,128,27,54],r=r.AES=x.extend({_doReset:function(){for(var c=this._key,e=c.words,a=c.sigBytes/4,c=4*((this._nRounds=a+6)+1),b=this._keySchedule=[],h=0;h<c;h++)if(h<a)b[h]=e[h];else{var d=b[h-1];h%a?6<a&&4==h%a&&(d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255]):(d=d<<8|d>>>24,d=j[d>>>24]<<24|j[d>>>16&255]<<16|j[d>>>8&255]<<8|j[d&255],d^=F[h/a|0]<<24);b[h]=b[h-a]^d}e=this._invKeySchedule=[];for(a=0;a<c;a++)h=c-a,d=a%4?b[h]:b[h-4],e[a]=4>a||4>=h?d:s[j[d>>>24]]^u[j[d>>>16&255]]^v[j[d>>>
8&255]]^w[j[d&255]]},encryptBlock:function(c,e){this._doCryptBlock(c,e,this._keySchedule,z,A,B,C,j)},decryptBlock:function(c,e){var a=c[e+1];c[e+1]=c[e+3];c[e+3]=a;this._doCryptBlock(c,e,this._invKeySchedule,s,u,v,w,y);a=c[e+1];c[e+1]=c[e+3];c[e+3]=a},_doCryptBlock:function(c,e,a,b,h,d,j,m){for(var n=this._nRounds,f=c[e]^a[0],g=c[e+1]^a[1],k=c[e+2]^a[2],p=c[e+3]^a[3],l=4,t=1;t<n;t++)var q=b[f>>>24]^h[g>>>16&255]^d[k>>>8&255]^j[p&255]^a[l++],r=b[g>>>24]^h[k>>>16&255]^d[p>>>8&255]^j[f&255]^a[l++],s=
b[k>>>24]^h[p>>>16&255]^d[f>>>8&255]^j[g&255]^a[l++],p=b[p>>>24]^h[f>>>16&255]^d[g>>>8&255]^j[k&255]^a[l++],f=q,g=r,k=s;q=(m[f>>>24]<<24|m[g>>>16&255]<<16|m[k>>>8&255]<<8|m[p&255])^a[l++];r=(m[g>>>24]<<24|m[k>>>16&255]<<16|m[p>>>8&255]<<8|m[f&255])^a[l++];s=(m[k>>>24]<<24|m[p>>>16&255]<<16|m[f>>>8&255]<<8|m[g&255])^a[l++];p=(m[p>>>24]<<24|m[f>>>16&255]<<16|m[g>>>8&255]<<8|m[k&255])^a[l++];c[e]=q;c[e+1]=r;c[e+2]=s;c[e+3]=p},keySize:8});q.AES=x._createHelper(r)})();
/*
CryptoJS v3.1.2 tripledes-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){function j(b,c){var a=(this._lBlock>>>b^this._rBlock)&c;this._rBlock^=a;this._lBlock^=a<<b}function l(b,c){var a=(this._rBlock>>>b^this._lBlock)&c;this._lBlock^=a;this._rBlock^=a<<b}var h=CryptoJS,e=h.lib,n=e.WordArray,e=e.BlockCipher,g=h.algo,q=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],p=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,
55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],r=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],s=[{"0":8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,
2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,
1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{"0":1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,
75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,
276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{"0":260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,
14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,
17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{"0":2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,
98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,
1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{"0":128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,
10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,
83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{"0":268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,
2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{"0":1048576,
16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,
496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{"0":134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,
2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,
2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],t=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],m=g.DES=e.extend({_doReset:function(){for(var b=this._key.words,c=[],a=0;56>a;a++){var f=q[a]-1;c[a]=b[f>>>5]>>>31-f%32&1}b=this._subKeys=[];for(f=0;16>f;f++){for(var d=b[f]=[],e=r[f],a=0;24>a;a++)d[a/6|0]|=c[(p[a]-1+e)%28]<<31-a%6,d[4+(a/6|0)]|=c[28+(p[a+24]-1+e)%28]<<31-a%6;d[0]=d[0]<<1|d[0]>>>31;for(a=1;7>a;a++)d[a]>>>=
4*(a-1)+3;d[7]=d[7]<<5|d[7]>>>27}c=this._invSubKeys=[];for(a=0;16>a;a++)c[a]=b[15-a]},encryptBlock:function(b,c){this._doCryptBlock(b,c,this._subKeys)},decryptBlock:function(b,c){this._doCryptBlock(b,c,this._invSubKeys)},_doCryptBlock:function(b,c,a){this._lBlock=b[c];this._rBlock=b[c+1];j.call(this,4,252645135);j.call(this,16,65535);l.call(this,2,858993459);l.call(this,8,16711935);j.call(this,1,1431655765);for(var f=0;16>f;f++){for(var d=a[f],e=this._lBlock,h=this._rBlock,g=0,k=0;8>k;k++)g|=s[k][((h^
d[k])&t[k])>>>0];this._lBlock=h;this._rBlock=e^g}a=this._lBlock;this._lBlock=this._rBlock;this._rBlock=a;j.call(this,1,1431655765);l.call(this,8,16711935);l.call(this,2,858993459);j.call(this,16,65535);j.call(this,4,252645135);b[c]=this._lBlock;b[c+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});h.DES=e._createHelper(m);g=g.TripleDES=e.extend({_doReset:function(){var b=this._key.words;this._des1=m.createEncryptor(n.create(b.slice(0,2)));this._des2=m.createEncryptor(n.create(b.slice(2,4)));this._des3=
m.createEncryptor(n.create(b.slice(4,6)))},encryptBlock:function(b,c){this._des1.encryptBlock(b,c);this._des2.decryptBlock(b,c);this._des3.encryptBlock(b,c)},decryptBlock:function(b,c){this._des3.decryptBlock(b,c);this._des2.encryptBlock(b,c);this._des1.decryptBlock(b,c)},keySize:6,ivSize:2,blockSize:2});h.TripleDES=e._createHelper(g)})();
/*
CryptoJS v3.1.2 sha1-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var k=CryptoJS,b=k.lib,m=b.WordArray,l=b.Hasher,d=[],b=k.algo.SHA1=l.extend({_doReset:function(){this._hash=new m.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(n,p){for(var a=this._hash.words,e=a[0],f=a[1],h=a[2],j=a[3],b=a[4],c=0;80>c;c++){if(16>c)d[c]=n[p+c]|0;else{var g=d[c-3]^d[c-8]^d[c-14]^d[c-16];d[c]=g<<1|g>>>31}g=(e<<5|e>>>27)+b+d[c];g=20>c?g+((f&h|~f&j)+1518500249):40>c?g+((f^h^j)+1859775393):60>c?g+((f&h|f&j|h&j)-1894007588):g+((f^h^
j)-899497514);b=j;j=h;h=f<<30|f>>>2;f=e;e=g}a[0]=a[0]+e|0;a[1]=a[1]+f|0;a[2]=a[2]+h|0;a[3]=a[3]+j|0;a[4]=a[4]+b|0},_doFinalize:function(){var b=this._data,d=b.words,a=8*this._nDataBytes,e=8*b.sigBytes;d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=Math.floor(a/4294967296);d[(e+64>>>9<<4)+15]=a;b.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var b=l.clone.call(this);b._hash=this._hash.clone();return b}});k.SHA1=l._createHelper(b);k.HmacSHA1=l._createHmacHelper(b)})();
/*
CryptoJS v3.1.2 ripemd160-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/*

(c) 2012 by Cedric Mesnil. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
(function(){var q=CryptoJS,d=q.lib,n=d.WordArray,p=d.Hasher,d=q.algo,x=n.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),y=n.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),z=n.create([11,14,15,12,
5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),A=n.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),B=n.create([0,1518500249,1859775393,2400959708,2840853838]),C=n.create([1352829926,1548603684,1836072691,
2053994217,0]),d=d.RIPEMD160=p.extend({_doReset:function(){this._hash=n.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(e,v){for(var b=0;16>b;b++){var c=v+b,f=e[c];e[c]=(f<<8|f>>>24)&16711935|(f<<24|f>>>8)&4278255360}var c=this._hash.words,f=B.words,d=C.words,n=x.words,q=y.words,p=z.words,w=A.words,t,g,h,j,r,u,k,l,m,s;u=t=c[0];k=g=c[1];l=h=c[2];m=j=c[3];s=r=c[4];for(var a,b=0;80>b;b+=1)a=t+e[v+n[b]]|0,a=16>b?a+((g^h^j)+f[0]):32>b?a+((g&h|~g&j)+f[1]):48>b?
a+(((g|~h)^j)+f[2]):64>b?a+((g&j|h&~j)+f[3]):a+((g^(h|~j))+f[4]),a|=0,a=a<<p[b]|a>>>32-p[b],a=a+r|0,t=r,r=j,j=h<<10|h>>>22,h=g,g=a,a=u+e[v+q[b]]|0,a=16>b?a+((k^(l|~m))+d[0]):32>b?a+((k&m|l&~m)+d[1]):48>b?a+(((k|~l)^m)+d[2]):64>b?a+((k&l|~k&m)+d[3]):a+((k^l^m)+d[4]),a|=0,a=a<<w[b]|a>>>32-w[b],a=a+s|0,u=s,s=m,m=l<<10|l>>>22,l=k,k=a;a=c[1]+h+m|0;c[1]=c[2]+j+s|0;c[2]=c[3]+r+u|0;c[3]=c[4]+t+k|0;c[4]=c[0]+g+l|0;c[0]=a},_doFinalize:function(){var e=this._data,d=e.words,b=8*this._nDataBytes,c=8*e.sigBytes;
d[c>>>5]|=128<<24-c%32;d[(c+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;e.sigBytes=4*(d.length+1);this._process();e=this._hash;d=e.words;for(b=0;5>b;b++)c=d[b],d[b]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return e},clone:function(){var d=p.clone.call(this);d._hash=this._hash.clone();return d}});q.RIPEMD160=p._createHelper(d);q.HmacRIPEMD160=p._createHmacHelper(d)})(Math);
/*
CryptoJS v3.1.2 pbkdf2-min.js
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function(){var b=CryptoJS,a=b.lib,d=a.Base,m=a.WordArray,a=b.algo,q=a.HMAC,l=a.PBKDF2=d.extend({cfg:d.extend({keySize:4,hasher:a.SHA1,iterations:1}),init:function(a){this.cfg=this.cfg.extend(a)},compute:function(a,b){for(var c=this.cfg,f=q.create(c.hasher,a),g=m.create(),d=m.create([1]),l=g.words,r=d.words,n=c.keySize,c=c.iterations;l.length<n;){var h=f.update(b).finalize(d);f.reset();for(var j=h.words,s=j.length,k=h,p=1;p<c;p++){k=f.finalize(k);f.reset();for(var t=k.words,e=0;e<s;e++)j[e]^=t[e]}g.concat(h);
r[0]++}g.sigBytes=4*n;return g}});b.PBKDF2=function(a,b,c){return l.create(c).compute(a,b)}})();

/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var b64map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var b64pad="=";function hex2b64(d){var b;var e;var a="";for(b=0;b+3<=d.length;b+=3){e=parseInt(d.substring(b,b+3),16);a+=b64map.charAt(e>>6)+b64map.charAt(e&63)}if(b+1==d.length){e=parseInt(d.substring(b,b+1),16);a+=b64map.charAt(e<<2)}else{if(b+2==d.length){e=parseInt(d.substring(b,b+2),16);a+=b64map.charAt(e>>2)+b64map.charAt((e&3)<<4)}}if(b64pad){while((a.length&3)>0){a+=b64pad}}return a}function b64tohex(f){var d="";var e;var b=0;var c;var a;for(e=0;e<f.length;++e){if(f.charAt(e)==b64pad){break}a=b64map.indexOf(f.charAt(e));if(a<0){continue}if(b==0){d+=int2char(a>>2);c=a&3;b=1}else{if(b==1){d+=int2char((c<<2)|(a>>4));c=a&15;b=2}else{if(b==2){d+=int2char(c);d+=int2char(a>>2);c=a&3;b=3}else{d+=int2char((c<<2)|(a>>4));d+=int2char(a&15);b=0}}}}if(b==1){d+=int2char(c<<2)}return d}function b64toBA(e){var d=b64tohex(e);var c;var b=new Array();for(c=0;2*c<d.length;++c){b[c]=parseInt(d.substring(2*c,2*c+2),16)}return b};
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var dbits;var canary=244837814094590;var j_lm=((canary&16777215)==15715070);function BigInteger(e,d,f){if(e!=null){if("number"==typeof e){this.fromNumber(e,d,f)}else{if(d==null&&"string"!=typeof e){this.fromString(e,256)}else{this.fromString(e,d)}}}}function nbi(){return new BigInteger(null)}function am1(f,a,b,e,h,g){while(--g>=0){var d=a*this[f++]+b[e]+h;h=Math.floor(d/67108864);b[e++]=d&67108863}return h}function am2(f,q,r,e,o,a){var k=q&32767,p=q>>15;while(--a>=0){var d=this[f]&32767;var g=this[f++]>>15;var b=p*d+g*k;d=k*d+((b&32767)<<15)+r[e]+(o&1073741823);o=(d>>>30)+(b>>>15)+p*g+(o>>>30);r[e++]=d&1073741823}return o}function am3(f,q,r,e,o,a){var k=q&16383,p=q>>14;while(--a>=0){var d=this[f]&16383;var g=this[f++]>>14;var b=p*d+g*k;d=k*d+((b&16383)<<14)+r[e]+o;o=(d>>28)+(b>>14)+p*g;r[e++]=d&268435455}return o}if(j_lm&&(navigator.appName=="Microsoft Internet Explorer")){BigInteger.prototype.am=am2;dbits=30}else{if(j_lm&&(navigator.appName!="Netscape")){BigInteger.prototype.am=am1;dbits=26}else{BigInteger.prototype.am=am3;dbits=28}}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=((1<<dbits)-1);BigInteger.prototype.DV=(1<<dbits);var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array();var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv){BI_RC[rr++]=vv}rr="a".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}rr="A".charCodeAt(0);for(vv=10;vv<36;++vv){BI_RC[rr++]=vv}function int2char(a){return BI_RM.charAt(a)}function intAt(b,a){var d=BI_RC[b.charCodeAt(a)];return(d==null)?-1:d}function bnpCopyTo(b){for(var a=this.t-1;a>=0;--a){b[a]=this[a]}b.t=this.t;b.s=this.s}function bnpFromInt(a){this.t=1;this.s=(a<0)?-1:0;if(a>0){this[0]=a}else{if(a<-1){this[0]=a+this.DV}else{this.t=0}}}function nbv(a){var b=nbi();b.fromInt(a);return b}function bnpFromString(h,c){var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==256){e=8}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{this.fromRadix(h,c);return}}}}}}this.t=0;this.s=0;var g=h.length,d=false,f=0;while(--g>=0){var a=(e==8)?h[g]&255:intAt(h,g);if(a<0){if(h.charAt(g)=="-"){d=true}continue}d=false;if(f==0){this[this.t++]=a}else{if(f+e>this.DB){this[this.t-1]|=(a&((1<<(this.DB-f))-1))<<f;this[this.t++]=(a>>(this.DB-f))}else{this[this.t-1]|=a<<f}}f+=e;if(f>=this.DB){f-=this.DB}}if(e==8&&(h[0]&128)!=0){this.s=-1;if(f>0){this[this.t-1]|=((1<<(this.DB-f))-1)<<f}}this.clamp();if(d){BigInteger.ZERO.subTo(this,this)}}function bnpClamp(){var a=this.s&this.DM;while(this.t>0&&this[this.t-1]==a){--this.t}}function bnToString(c){if(this.s<0){return"-"+this.negate().toString(c)}var e;if(c==16){e=4}else{if(c==8){e=3}else{if(c==2){e=1}else{if(c==32){e=5}else{if(c==4){e=2}else{return this.toRadix(c)}}}}}var g=(1<<e)-1,l,a=false,h="",f=this.t;var j=this.DB-(f*this.DB)%e;if(f-->0){if(j<this.DB&&(l=this[f]>>j)>0){a=true;h=int2char(l)}while(f>=0){if(j<e){l=(this[f]&((1<<j)-1))<<(e-j);l|=this[--f]>>(j+=this.DB-e)}else{l=(this[f]>>(j-=e))&g;if(j<=0){j+=this.DB;--f}}if(l>0){a=true}if(a){h+=int2char(l)}}}return a?h:"0"}function bnNegate(){var a=nbi();BigInteger.ZERO.subTo(this,a);return a}function bnAbs(){return(this.s<0)?this.negate():this}function bnCompareTo(b){var d=this.s-b.s;if(d!=0){return d}var c=this.t;d=c-b.t;if(d!=0){return(this.s<0)?-d:d}while(--c>=0){if((d=this[c]-b[c])!=0){return d}}return 0}function nbits(a){var c=1,b;if((b=a>>>16)!=0){a=b;c+=16}if((b=a>>8)!=0){a=b;c+=8}if((b=a>>4)!=0){a=b;c+=4}if((b=a>>2)!=0){a=b;c+=2}if((b=a>>1)!=0){a=b;c+=1}return c}function bnBitLength(){if(this.t<=0){return 0}return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM))}function bnpDLShiftTo(c,b){var a;for(a=this.t-1;a>=0;--a){b[a+c]=this[a]}for(a=c-1;a>=0;--a){b[a]=0}b.t=this.t+c;b.s=this.s}function bnpDRShiftTo(c,b){for(var a=c;a<this.t;++a){b[a-c]=this[a]}b.t=Math.max(this.t-c,0);b.s=this.s}function bnpLShiftTo(j,e){var b=j%this.DB;var a=this.DB-b;var g=(1<<a)-1;var f=Math.floor(j/this.DB),h=(this.s<<b)&this.DM,d;for(d=this.t-1;d>=0;--d){e[d+f+1]=(this[d]>>a)|h;h=(this[d]&g)<<b}for(d=f-1;d>=0;--d){e[d]=0}e[f]=h;e.t=this.t+f+1;e.s=this.s;e.clamp()}function bnpRShiftTo(g,d){d.s=this.s;var e=Math.floor(g/this.DB);if(e>=this.t){d.t=0;return}var b=g%this.DB;var a=this.DB-b;var f=(1<<b)-1;d[0]=this[e]>>b;for(var c=e+1;c<this.t;++c){d[c-e-1]|=(this[c]&f)<<a;d[c-e]=this[c]>>b}if(b>0){d[this.t-e-1]|=(this.s&f)<<a}d.t=this.t-e;d.clamp()}function bnpSubTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]-d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g-=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g-=d[e];f[e++]=g&this.DM;g>>=this.DB}g-=d.s}f.s=(g<0)?-1:0;if(g<-1){f[e++]=this.DV+g}else{if(g>0){f[e++]=g}}f.t=e;f.clamp()}function bnpMultiplyTo(c,e){var b=this.abs(),f=c.abs();var d=b.t;e.t=d+f.t;while(--d>=0){e[d]=0}for(d=0;d<f.t;++d){e[d+b.t]=b.am(0,f[d],e,d,0,b.t)}e.s=0;e.clamp();if(this.s!=c.s){BigInteger.ZERO.subTo(e,e)}}function bnpSquareTo(d){var a=this.abs();var b=d.t=2*a.t;while(--b>=0){d[b]=0}for(b=0;b<a.t-1;++b){var e=a.am(b,a[b],d,2*b,0,1);if((d[b+a.t]+=a.am(b+1,2*a[b],d,2*b+1,e,a.t-b-1))>=a.DV){d[b+a.t]-=a.DV;d[b+a.t+1]=1}}if(d.t>0){d[d.t-1]+=a.am(b,a[b],d,2*b,0,1)}d.s=0;d.clamp()}function bnpDivRemTo(n,h,g){var w=n.abs();if(w.t<=0){return}var k=this.abs();if(k.t<w.t){if(h!=null){h.fromInt(0)}if(g!=null){this.copyTo(g)}return}if(g==null){g=nbi()}var d=nbi(),a=this.s,l=n.s;var v=this.DB-nbits(w[w.t-1]);if(v>0){w.lShiftTo(v,d);k.lShiftTo(v,g)}else{w.copyTo(d);k.copyTo(g)}var p=d.t;var b=d[p-1];if(b==0){return}var o=b*(1<<this.F1)+((p>1)?d[p-2]>>this.F2:0);var A=this.FV/o,z=(1<<this.F1)/o,x=1<<this.F2;var u=g.t,s=u-p,f=(h==null)?nbi():h;d.dlShiftTo(s,f);if(g.compareTo(f)>=0){g[g.t++]=1;g.subTo(f,g)}BigInteger.ONE.dlShiftTo(p,f);f.subTo(d,d);while(d.t<p){d[d.t++]=0}while(--s>=0){var c=(g[--u]==b)?this.DM:Math.floor(g[u]*A+(g[u-1]+x)*z);if((g[u]+=d.am(0,c,g,s,0,p))<c){d.dlShiftTo(s,f);g.subTo(f,g);while(g[u]<--c){g.subTo(f,g)}}}if(h!=null){g.drShiftTo(p,h);if(a!=l){BigInteger.ZERO.subTo(h,h)}}g.t=p;g.clamp();if(v>0){g.rShiftTo(v,g)}if(a<0){BigInteger.ZERO.subTo(g,g)}}function bnMod(b){var c=nbi();this.abs().divRemTo(b,null,c);if(this.s<0&&c.compareTo(BigInteger.ZERO)>0){b.subTo(c,c)}return c}function Classic(a){this.m=a}function cConvert(a){if(a.s<0||a.compareTo(this.m)>=0){return a.mod(this.m)}else{return a}}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}function cSqrTo(a,b){a.squareTo(b);this.reduce(b)}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1){return 0}var a=this[0];if((a&1)==0){return 0}var b=a&3;b=(b*(2-(a&15)*b))&15;b=(b*(2-(a&255)*b))&255;b=(b*(2-(((a&65535)*b)&65535)))&65535;b=(b*(2-a*b%this.DV))%this.DV;return(b>0)?this.DV-b:-b}function Montgomery(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<(a.DB-15))-1;this.mt2=2*a.t}function montConvert(a){var b=nbi();a.abs().dlShiftTo(this.m.t,b);b.divRemTo(this.m,null,b);if(a.s<0&&b.compareTo(BigInteger.ZERO)>0){this.m.subTo(b,b)}return b}function montRevert(a){var b=nbi();a.copyTo(b);this.reduce(b);return b}function montReduce(a){while(a.t<=this.mt2){a[a.t++]=0}for(var c=0;c<this.m.t;++c){var b=a[c]&32767;var d=(b*this.mpl+(((b*this.mph+(a[c]>>15)*this.mpl)&this.um)<<15))&a.DM;b=c+this.m.t;a[b]+=this.m.am(0,d,a,c,0,this.m.t);while(a[b]>=a.DV){a[b]-=a.DV;a[++b]++}}a.clamp();a.drShiftTo(this.m.t,a);if(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function montSqrTo(a,b){a.squareTo(b);this.reduce(b)}function montMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return((this.t>0)?(this[0]&1):this.s)==0}function bnpExp(h,j){if(h>4294967295||h<1){return BigInteger.ONE}var f=nbi(),a=nbi(),d=j.convert(this),c=nbits(h)-1;d.copyTo(f);while(--c>=0){j.sqrTo(f,a);if((h&(1<<c))>0){j.mulTo(a,d,f)}else{var b=f;f=a;a=b}}return j.revert(f)}function bnModPowInt(b,a){var c;if(b<256||a.isEven()){c=new Classic(a)}else{c=new Montgomery(a)}return this.exp(b,c)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function bnClone(){var a=nbi();this.copyTo(a);return a}function bnIntValue(){if(this.s<0){if(this.t==1){return this[0]-this.DV}else{if(this.t==0){return -1}}}else{if(this.t==1){return this[0]}else{if(this.t==0){return 0}}}return((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0]}function bnByteValue(){return(this.t==0)?this.s:(this[0]<<24)>>24}function bnShortValue(){return(this.t==0)?this.s:(this[0]<<16)>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){if(this.s<0){return -1}else{if(this.t<=0||(this.t==1&&this[0]<=0)){return 0}else{return 1}}}function bnpToRadix(c){if(c==null){c=10}if(this.signum()==0||c<2||c>36){return"0"}var f=this.chunkSize(c);var e=Math.pow(c,f);var i=nbv(e),j=nbi(),h=nbi(),g="";this.divRemTo(i,j,h);while(j.signum()>0){g=(e+h.intValue()).toString(c).substr(1)+g;j.divRemTo(i,j,h)}return h.intValue().toString(c)+g}function bnpFromRadix(m,h){this.fromInt(0);if(h==null){h=10}var f=this.chunkSize(h);var g=Math.pow(h,f),e=false,a=0,l=0;for(var c=0;c<m.length;++c){var k=intAt(m,c);if(k<0){if(m.charAt(c)=="-"&&this.signum()==0){e=true}continue}l=h*l+k;if(++a>=f){this.dMultiply(g);this.dAddOffset(l,0);a=0;l=0}}if(a>0){this.dMultiply(Math.pow(h,a));this.dAddOffset(l,0)}if(e){BigInteger.ZERO.subTo(this,this)}}function bnpFromNumber(f,e,h){if("number"==typeof e){if(f<2){this.fromInt(1)}else{this.fromNumber(f,h);if(!this.testBit(f-1)){this.bitwiseTo(BigInteger.ONE.shiftLeft(f-1),op_or,this)}if(this.isEven()){this.dAddOffset(1,0)}while(!this.isProbablePrime(e)){this.dAddOffset(2,0);if(this.bitLength()>f){this.subTo(BigInteger.ONE.shiftLeft(f-1),this)}}}}else{var d=new Array(),g=f&7;d.length=(f>>3)+1;e.nextBytes(d);if(g>0){d[0]&=((1<<g)-1)}else{d[0]=0}this.fromString(d,256)}}function bnToByteArray(){var b=this.t,c=new Array();c[0]=this.s;var e=this.DB-(b*this.DB)%8,f,a=0;if(b-->0){if(e<this.DB&&(f=this[b]>>e)!=(this.s&this.DM)>>e){c[a++]=f|(this.s<<(this.DB-e))}while(b>=0){if(e<8){f=(this[b]&((1<<e)-1))<<(8-e);f|=this[--b]>>(e+=this.DB-8)}else{f=(this[b]>>(e-=8))&255;if(e<=0){e+=this.DB;--b}}if((f&128)!=0){f|=-256}if(a==0&&(this.s&128)!=(f&128)){++a}if(a>0||f!=this.s){c[a++]=f}}}return c}function bnEquals(b){return(this.compareTo(b)==0)}function bnMin(b){return(this.compareTo(b)<0)?this:b}function bnMax(b){return(this.compareTo(b)>0)?this:b}function bnpBitwiseTo(c,h,e){var d,g,b=Math.min(c.t,this.t);for(d=0;d<b;++d){e[d]=h(this[d],c[d])}if(c.t<this.t){g=c.s&this.DM;for(d=b;d<this.t;++d){e[d]=h(this[d],g)}e.t=this.t}else{g=this.s&this.DM;for(d=b;d<c.t;++d){e[d]=h(g,c[d])}e.t=c.t}e.s=h(this.s,c.s);e.clamp()}function op_and(a,b){return a&b}function bnAnd(b){var c=nbi();this.bitwiseTo(b,op_and,c);return c}function op_or(a,b){return a|b}function bnOr(b){var c=nbi();this.bitwiseTo(b,op_or,c);return c}function op_xor(a,b){return a^b}function bnXor(b){var c=nbi();this.bitwiseTo(b,op_xor,c);return c}function op_andnot(a,b){return a&~b}function bnAndNot(b){var c=nbi();this.bitwiseTo(b,op_andnot,c);return c}function bnNot(){var b=nbi();for(var a=0;a<this.t;++a){b[a]=this.DM&~this[a]}b.t=this.t;b.s=~this.s;return b}function bnShiftLeft(b){var a=nbi();if(b<0){this.rShiftTo(-b,a)}else{this.lShiftTo(b,a)}return a}function bnShiftRight(b){var a=nbi();if(b<0){this.lShiftTo(-b,a)}else{this.rShiftTo(b,a)}return a}function lbit(a){if(a==0){return -1}var b=0;if((a&65535)==0){a>>=16;b+=16}if((a&255)==0){a>>=8;b+=8}if((a&15)==0){a>>=4;b+=4}if((a&3)==0){a>>=2;b+=2}if((a&1)==0){++b}return b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a){if(this[a]!=0){return a*this.DB+lbit(this[a])}}if(this.s<0){return this.t*this.DB}return -1}function cbit(a){var b=0;while(a!=0){a&=a-1;++b}return b}function bnBitCount(){var c=0,a=this.s&this.DM;for(var b=0;b<this.t;++b){c+=cbit(this[b]^a)}return c}function bnTestBit(b){var a=Math.floor(b/this.DB);if(a>=this.t){return(this.s!=0)}return((this[a]&(1<<(b%this.DB)))!=0)}function bnpChangeBit(c,b){var a=BigInteger.ONE.shiftLeft(c);this.bitwiseTo(a,b,a);return a}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(d,f){var e=0,g=0,b=Math.min(d.t,this.t);while(e<b){g+=this[e]+d[e];f[e++]=g&this.DM;g>>=this.DB}if(d.t<this.t){g+=d.s;while(e<this.t){g+=this[e];f[e++]=g&this.DM;g>>=this.DB}g+=this.s}else{g+=this.s;while(e<d.t){g+=d[e];f[e++]=g&this.DM;g>>=this.DB}g+=d.s}f.s=(g<0)?-1:0;if(g>0){f[e++]=g}else{if(g<-1){f[e++]=this.DV+g}}f.t=e;f.clamp()}function bnAdd(b){var c=nbi();this.addTo(b,c);return c}function bnSubtract(b){var c=nbi();this.subTo(b,c);return c}function bnMultiply(b){var c=nbi();this.multiplyTo(b,c);return c}function bnSquare(){var a=nbi();this.squareTo(a);return a}function bnDivide(b){var c=nbi();this.divRemTo(b,c,null);return c}function bnRemainder(b){var c=nbi();this.divRemTo(b,null,c);return c}function bnDivideAndRemainder(b){var d=nbi(),c=nbi();this.divRemTo(b,d,c);return new Array(d,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()}function bnpDAddOffset(b,a){if(b==0){return}while(this.t<=a){this[this.t++]=0}this[a]+=b;while(this[a]>=this.DV){this[a]-=this.DV;if(++a>=this.t){this[this.t++]=0}++this[a]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,c,b){a.multiplyTo(c,b)}function nSqrTo(a,b){a.squareTo(b)}NullExp.prototype.convert=nNop;NullExp.prototype.revert=nNop;NullExp.prototype.mulTo=nMulTo;NullExp.prototype.sqrTo=nSqrTo;function bnPow(a){return this.exp(a,new NullExp())}function bnpMultiplyLowerTo(b,f,e){var d=Math.min(this.t+b.t,f);e.s=0;e.t=d;while(d>0){e[--d]=0}var c;for(c=e.t-this.t;d<c;++d){e[d+this.t]=this.am(0,b[d],e,d,0,this.t)}for(c=Math.min(b.t,f);d<c;++d){this.am(0,b[d],e,d,0,f-d)}e.clamp()}function bnpMultiplyUpperTo(b,e,d){--e;var c=d.t=this.t+b.t-e;d.s=0;while(--c>=0){d[c]=0}for(c=Math.max(e-this.t,0);c<b.t;++c){d[this.t+c-e]=this.am(e-c,b[c],d,0,0,this.t+c-e)}d.clamp();d.drShiftTo(1,d)}function Barrett(a){this.r2=nbi();this.q3=nbi();BigInteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t){return a.mod(this.m)}else{if(a.compareTo(this.m)<0){return a}else{var b=nbi();a.copyTo(b);this.reduce(b);return b}}}function barrettRevert(a){return a}function barrettReduce(a){a.drShiftTo(this.m.t-1,this.r2);if(a.t>this.m.t+1){a.t=this.m.t+1;a.clamp()}this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);while(a.compareTo(this.r2)<0){a.dAddOffset(1,this.m.t+1)}a.subTo(this.r2,a);while(a.compareTo(this.m)>=0){a.subTo(this.m,a)}}function barrettSqrTo(a,b){a.squareTo(b);this.reduce(b)}function barrettMulTo(a,c,b){a.multiplyTo(c,b);this.reduce(b)}Barrett.prototype.convert=barrettConvert;Barrett.prototype.revert=barrettRevert;Barrett.prototype.reduce=barrettReduce;Barrett.prototype.mulTo=barrettMulTo;Barrett.prototype.sqrTo=barrettSqrTo;function bnModPow(q,f){var o=q.bitLength(),h,b=nbv(1),v;if(o<=0){return b}else{if(o<18){h=1}else{if(o<48){h=3}else{if(o<144){h=4}else{if(o<768){h=5}else{h=6}}}}}if(o<8){v=new Classic(f)}else{if(f.isEven()){v=new Barrett(f)}else{v=new Montgomery(f)}}var p=new Array(),d=3,s=h-1,a=(1<<h)-1;p[1]=v.convert(this);if(h>1){var A=nbi();v.sqrTo(p[1],A);while(d<=a){p[d]=nbi();v.mulTo(A,p[d-2],p[d]);d+=2}}var l=q.t-1,x,u=true,c=nbi(),y;o=nbits(q[l])-1;while(l>=0){if(o>=s){x=(q[l]>>(o-s))&a}else{x=(q[l]&((1<<(o+1))-1))<<(s-o);if(l>0){x|=q[l-1]>>(this.DB+o-s)}}d=h;while((x&1)==0){x>>=1;--d}if((o-=d)<0){o+=this.DB;--l}if(u){p[x].copyTo(b);u=false}else{while(d>1){v.sqrTo(b,c);v.sqrTo(c,b);d-=2}if(d>0){v.sqrTo(b,c)}else{y=b;b=c;c=y}v.mulTo(c,p[x],b)}while(l>=0&&(q[l]&(1<<o))==0){v.sqrTo(b,c);y=b;b=c;c=y;if(--o<0){o=this.DB-1;--l}}}return v.revert(b)}function bnGCD(c){var b=(this.s<0)?this.negate():this.clone();var h=(c.s<0)?c.negate():c.clone();if(b.compareTo(h)<0){var e=b;b=h;h=e}var d=b.getLowestSetBit(),f=h.getLowestSetBit();if(f<0){return b}if(d<f){f=d}if(f>0){b.rShiftTo(f,b);h.rShiftTo(f,h)}while(b.signum()>0){if((d=b.getLowestSetBit())>0){b.rShiftTo(d,b)}if((d=h.getLowestSetBit())>0){h.rShiftTo(d,h)}if(b.compareTo(h)>=0){b.subTo(h,b);b.rShiftTo(1,b)}else{h.subTo(b,h);h.rShiftTo(1,h)}}if(f>0){h.lShiftTo(f,h)}return h}function bnpModInt(e){if(e<=0){return 0}var c=this.DV%e,b=(this.s<0)?e-1:0;if(this.t>0){if(c==0){b=this[0]%e}else{for(var a=this.t-1;a>=0;--a){b=(c*b+this[a])%e}}}return b}function bnModInverse(f){var j=f.isEven();if((this.isEven()&&j)||f.signum()==0){return BigInteger.ZERO}var i=f.clone(),h=this.clone();var g=nbv(1),e=nbv(0),l=nbv(0),k=nbv(1);while(i.signum()!=0){while(i.isEven()){i.rShiftTo(1,i);if(j){if(!g.isEven()||!e.isEven()){g.addTo(this,g);e.subTo(f,e)}g.rShiftTo(1,g)}else{if(!e.isEven()){e.subTo(f,e)}}e.rShiftTo(1,e)}while(h.isEven()){h.rShiftTo(1,h);if(j){if(!l.isEven()||!k.isEven()){l.addTo(this,l);k.subTo(f,k)}l.rShiftTo(1,l)}else{if(!k.isEven()){k.subTo(f,k)}}k.rShiftTo(1,k)}if(i.compareTo(h)>=0){i.subTo(h,i);if(j){g.subTo(l,g)}e.subTo(k,e)}else{h.subTo(i,h);if(j){l.subTo(g,l)}k.subTo(e,k)}}if(h.compareTo(BigInteger.ONE)!=0){return BigInteger.ZERO}if(k.compareTo(f)>=0){return k.subtract(f)}if(k.signum()<0){k.addTo(f,k)}else{return k}if(k.signum()<0){return k.add(f)}else{return k}}var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];var lplim=(1<<26)/lowprimes[lowprimes.length-1];function bnIsProbablePrime(e){var d,b=this.abs();if(b.t==1&&b[0]<=lowprimes[lowprimes.length-1]){for(d=0;d<lowprimes.length;++d){if(b[0]==lowprimes[d]){return true}}return false}if(b.isEven()){return false}d=1;while(d<lowprimes.length){var a=lowprimes[d],c=d+1;while(c<lowprimes.length&&a<lplim){a*=lowprimes[c++]}a=b.modInt(a);while(d<c){if(a%lowprimes[d++]==0){return false}}}return b.millerRabin(e)}function bnpMillerRabin(f){var g=this.subtract(BigInteger.ONE);var c=g.getLowestSetBit();if(c<=0){return false}var h=g.shiftRight(c);f=(f+1)>>1;if(f>lowprimes.length){f=lowprimes.length}var b=nbi();for(var e=0;e<f;++e){b.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var l=b.modPow(h,this);if(l.compareTo(BigInteger.ONE)!=0&&l.compareTo(g)!=0){var d=1;while(d++<c&&l.compareTo(g)!=0){l=l.modPowInt(2,this);if(l.compareTo(BigInteger.ONE)==0){return false}}if(l.compareTo(g)!=0){return false}}}return true}BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.fromNumber=bnpFromNumber;BigInteger.prototype.bitwiseTo=bnpBitwiseTo;BigInteger.prototype.changeBit=bnpChangeBit;BigInteger.prototype.addTo=bnpAddTo;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo;BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo;BigInteger.prototype.modInt=bnpModInt;BigInteger.prototype.millerRabin=bnpMillerRabin;BigInteger.prototype.clone=bnClone;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.byteValue=bnByteValue;BigInteger.prototype.shortValue=bnShortValue;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.toByteArray=bnToByteArray;BigInteger.prototype.equals=bnEquals;BigInteger.prototype.min=bnMin;BigInteger.prototype.max=bnMax;BigInteger.prototype.and=bnAnd;BigInteger.prototype.or=bnOr;BigInteger.prototype.xor=bnXor;BigInteger.prototype.andNot=bnAndNot;BigInteger.prototype.not=bnNot;BigInteger.prototype.shiftLeft=bnShiftLeft;BigInteger.prototype.shiftRight=bnShiftRight;BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit;BigInteger.prototype.bitCount=bnBitCount;BigInteger.prototype.testBit=bnTestBit;BigInteger.prototype.setBit=bnSetBit;BigInteger.prototype.clearBit=bnClearBit;BigInteger.prototype.flipBit=bnFlipBit;BigInteger.prototype.add=bnAdd;BigInteger.prototype.subtract=bnSubtract;BigInteger.prototype.multiply=bnMultiply;BigInteger.prototype.divide=bnDivide;BigInteger.prototype.remainder=bnRemainder;BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder;BigInteger.prototype.modPow=bnModPow;BigInteger.prototype.modInverse=bnModInverse;BigInteger.prototype.pow=bnPow;BigInteger.prototype.gcd=bnGCD;BigInteger.prototype.isProbablePrime=bnIsProbablePrime;BigInteger.prototype.square=bnSquare;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function Arcfour(){this.i=0;this.j=0;this.S=new Array()}function ARC4init(d){var c,a,b;for(c=0;c<256;++c){this.S[c]=c}a=0;for(c=0;c<256;++c){a=(a+this.S[c]+d[c%d.length])&255;b=this.S[c];this.S[c]=this.S[a];this.S[a]=b}this.i=0;this.j=0}function ARC4next(){var a;this.i=(this.i+1)&255;this.j=(this.j+this.S[this.i])&255;a=this.S[this.i];this.S[this.i]=this.S[this.j];this.S[this.j]=a;return this.S[(a+this.S[this.i])&255]}Arcfour.prototype.init=ARC4init;Arcfour.prototype.next=ARC4next;function prng_newstate(){return new Arcfour()}var rng_psize=256;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var rng_state;var rng_pool;var rng_pptr;function rng_seed_int(a){rng_pool[rng_pptr++]^=a&255;rng_pool[rng_pptr++]^=(a>>8)&255;rng_pool[rng_pptr++]^=(a>>16)&255;rng_pool[rng_pptr++]^=(a>>24)&255;if(rng_pptr>=rng_psize){rng_pptr-=rng_psize}}function rng_seed_time(){rng_seed_int(new Date().getTime())}if(rng_pool==null){rng_pool=new Array();rng_pptr=0;var t;if(navigator.appName=="Netscape"&&navigator.appVersion<"5"&&window.crypto){var z=window.crypto.random(32);for(t=0;t<z.length;++t){rng_pool[rng_pptr++]=z.charCodeAt(t)&255}}while(rng_pptr<rng_psize){t=Math.floor(65536*Math.random());rng_pool[rng_pptr++]=t>>>8;rng_pool[rng_pptr++]=t&255}rng_pptr=0;rng_seed_time()}function rng_get_byte(){if(rng_state==null){rng_seed_time();rng_state=prng_newstate();rng_state.init(rng_pool);for(rng_pptr=0;rng_pptr<rng_pool.length;++rng_pptr){rng_pool[rng_pptr]=0}rng_pptr=0}return rng_state.next()}function rng_get_bytes(b){var a;for(a=0;a<b.length;++a){b[a]=rng_get_byte()}}function SecureRandom(){}SecureRandom.prototype.nextBytes=rng_get_bytes;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function parseBigInt(b,a){return new BigInteger(b,a)}function linebrk(c,d){var a="";var b=0;while(b+d<c.length){a+=c.substring(b,b+d)+"\n";b+=d}return a+c.substring(b,c.length)}function byte2Hex(a){if(a<16){return"0"+a.toString(16)}else{return a.toString(16)}}function pkcs1pad2(e,h){if(h<e.length+11){alert("Message too long for RSA");return null}var g=new Array();var d=e.length-1;while(d>=0&&h>0){var f=e.charCodeAt(d--);if(f<128){g[--h]=f}else{if((f>127)&&(f<2048)){g[--h]=(f&63)|128;g[--h]=(f>>6)|192}else{g[--h]=(f&63)|128;g[--h]=((f>>6)&63)|128;g[--h]=(f>>12)|224}}}g[--h]=0;var b=new SecureRandom();var a=new Array();while(h>2){a[0]=0;while(a[0]==0){b.nextBytes(a)}g[--h]=a[0]}g[--h]=2;g[--h]=0;return new BigInteger(g)}function oaep_mgf1_arr(c,a,e){var b="",d=0;while(b.length<a){b+=e(String.fromCharCode.apply(String,c.concat([(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255])));d+=1}return b}var SHA1_SIZE=20;function oaep_pad(l,a,c){if(l.length+2*SHA1_SIZE+2>a){throw"Message too long for RSA"}var h="",d;for(d=0;d<a-l.length-2*SHA1_SIZE-2;d+=1){h+="\x00"}var e=rstr_sha1("")+h+"\x01"+l;var f=new Array(SHA1_SIZE);new SecureRandom().nextBytes(f);var g=oaep_mgf1_arr(f,e.length,c||rstr_sha1);var k=[];for(d=0;d<e.length;d+=1){k[d]=e.charCodeAt(d)^g.charCodeAt(d)}var j=oaep_mgf1_arr(k,f.length,rstr_sha1);var b=[0];for(d=0;d<f.length;d+=1){b[d+1]=f[d]^j.charCodeAt(d)}return new BigInteger(b.concat(k))}function RSAKey(){this.n=null;this.e=0;this.d=null;this.p=null;this.q=null;this.dmp1=null;this.dmq1=null;this.coeff=null}function RSASetPublic(b,a){this.isPublic=true;if(typeof b!=="string"){this.n=b;this.e=a}else{if(b!=null&&a!=null&&b.length>0&&a.length>0){this.n=parseBigInt(b,16);this.e=parseInt(a,16)}else{alert("Invalid RSA public key")}}}function RSADoPublic(a){return a.modPowInt(this.e,this.n)}function RSAEncrypt(d){var a=pkcs1pad2(d,(this.n.bitLength()+7)>>3);if(a==null){return null}var e=this.doPublic(a);if(e==null){return null}var b=e.toString(16);if((b.length&1)==0){return b}else{return"0"+b}}function RSAEncryptOAEP(e,d){var a=oaep_pad(e,(this.n.bitLength()+7)>>3,d);if(a==null){return null}var f=this.doPublic(a);if(f==null){return null}var b=f.toString(16);if((b.length&1)==0){return b}else{return"0"+b}}RSAKey.prototype.doPublic=RSADoPublic;RSAKey.prototype.setPublic=RSASetPublic;RSAKey.prototype.encrypt=RSAEncrypt;RSAKey.prototype.encryptOAEP=RSAEncryptOAEP;RSAKey.prototype.type="RSA";
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function pkcs1unpad2(g,j){var a=g.toByteArray();var f=0;while(f<a.length&&a[f]==0){++f}if(a.length-f!=j-1||a[f]!=2){return null}++f;while(a[f]!=0){if(++f>=a.length){return null}}var e="";while(++f<a.length){var h=a[f]&255;if(h<128){e+=String.fromCharCode(h)}else{if((h>191)&&(h<224)){e+=String.fromCharCode(((h&31)<<6)|(a[f+1]&63));++f}else{e+=String.fromCharCode(((h&15)<<12)|((a[f+1]&63)<<6)|(a[f+2]&63));f+=2}}}return e}function oaep_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=e(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]));d+=1}return b}var SHA1_SIZE=20;function oaep_unpad(l,b,e){l=l.toByteArray();var f;for(f=0;f<l.length;f+=1){l[f]&=255}while(l.length<b){l.unshift(0)}l=String.fromCharCode.apply(String,l);if(l.length<2*SHA1_SIZE+2){throw"Cipher too short"}var c=l.substr(1,SHA1_SIZE);var o=l.substr(SHA1_SIZE+1);var m=oaep_mgf1_str(o,SHA1_SIZE,e||rstr_sha1);var h=[],f;for(f=0;f<c.length;f+=1){h[f]=c.charCodeAt(f)^m.charCodeAt(f)}var j=oaep_mgf1_str(String.fromCharCode.apply(String,h),l.length-SHA1_SIZE,rstr_sha1);var g=[];for(f=0;f<o.length;f+=1){g[f]=o.charCodeAt(f)^j.charCodeAt(f)}g=String.fromCharCode.apply(String,g);if(g.substr(0,SHA1_SIZE)!==rstr_sha1("")){throw"Hash mismatch"}g=g.substr(SHA1_SIZE);var a=g.indexOf("\x01");var k=(a!=-1)?g.substr(0,a).lastIndexOf("\x00"):-1;if(k+1!=a){throw"Malformed data"}return g.substr(a+1)}function RSASetPrivate(c,a,b){this.isPrivate=true;if(typeof c!=="string"){this.n=c;this.e=a;this.d=b}else{if(c!=null&&a!=null&&c.length>0&&a.length>0){this.n=parseBigInt(c,16);this.e=parseInt(a,16);this.d=parseBigInt(b,16)}else{alert("Invalid RSA private key")}}}function RSASetPrivateEx(g,d,e,c,b,a,h,f){this.isPrivate=true;if(g==null){throw"RSASetPrivateEx N == null"}if(d==null){throw"RSASetPrivateEx E == null"}if(g.length==0){throw"RSASetPrivateEx N.length == 0"}if(d.length==0){throw"RSASetPrivateEx E.length == 0"}if(g!=null&&d!=null&&g.length>0&&d.length>0){this.n=parseBigInt(g,16);this.e=parseInt(d,16);this.d=parseBigInt(e,16);this.p=parseBigInt(c,16);this.q=parseBigInt(b,16);this.dmp1=parseBigInt(a,16);this.dmq1=parseBigInt(h,16);this.coeff=parseBigInt(f,16)}else{alert("Invalid RSA private key in RSASetPrivateEx")}}function RSAGenerate(b,i){var a=new SecureRandom();var f=b>>1;this.e=parseInt(i,16);var c=new BigInteger(i,16);for(;;){for(;;){this.p=new BigInteger(b-f,1,a);if(this.p.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.p.isProbablePrime(10)){break}}for(;;){this.q=new BigInteger(f,1,a);if(this.q.subtract(BigInteger.ONE).gcd(c).compareTo(BigInteger.ONE)==0&&this.q.isProbablePrime(10)){break}}if(this.p.compareTo(this.q)<=0){var h=this.p;this.p=this.q;this.q=h}var g=this.p.subtract(BigInteger.ONE);var d=this.q.subtract(BigInteger.ONE);var e=g.multiply(d);if(e.gcd(c).compareTo(BigInteger.ONE)==0){this.n=this.p.multiply(this.q);this.d=c.modInverse(e);this.dmp1=this.d.mod(g);this.dmq1=this.d.mod(d);this.coeff=this.q.modInverse(this.p);break}}}function RSADoPrivate(a){if(this.p==null||this.q==null){return a.modPow(this.d,this.n)}var c=a.mod(this.p).modPow(this.dmp1,this.p);var b=a.mod(this.q).modPow(this.dmq1,this.q);while(c.compareTo(b)<0){c=c.add(this.p)}return c.subtract(b).multiply(this.coeff).mod(this.p).multiply(this.q).add(b)}function RSADecrypt(b){var d=parseBigInt(b,16);var a=this.doPrivate(d);if(a==null){return null}return pkcs1unpad2(a,(this.n.bitLength()+7)>>3)}function RSADecryptOAEP(d,b){var e=parseBigInt(d,16);var a=this.doPrivate(e);if(a==null){return null}return oaep_unpad(a,(this.n.bitLength()+7)>>3,b)}RSAKey.prototype.doPrivate=RSADoPrivate;RSAKey.prototype.setPrivate=RSASetPrivate;RSAKey.prototype.setPrivateEx=RSASetPrivateEx;RSAKey.prototype.generate=RSAGenerate;RSAKey.prototype.decrypt=RSADecrypt;RSAKey.prototype.decryptOAEP=RSADecryptOAEP;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function ECFieldElementFp(b,a){this.x=a;this.q=b}function feFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.x.equals(a.x))}function feFpToBigInteger(){return this.x}function feFpNegate(){return new ECFieldElementFp(this.q,this.x.negate().mod(this.q))}function feFpAdd(a){return new ECFieldElementFp(this.q,this.x.add(a.toBigInteger()).mod(this.q))}function feFpSubtract(a){return new ECFieldElementFp(this.q,this.x.subtract(a.toBigInteger()).mod(this.q))}function feFpMultiply(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger()).mod(this.q))}function feFpSquare(){return new ECFieldElementFp(this.q,this.x.square().mod(this.q))}function feFpDivide(a){return new ECFieldElementFp(this.q,this.x.multiply(a.toBigInteger().modInverse(this.q)).mod(this.q))}ECFieldElementFp.prototype.equals=feFpEquals;ECFieldElementFp.prototype.toBigInteger=feFpToBigInteger;ECFieldElementFp.prototype.negate=feFpNegate;ECFieldElementFp.prototype.add=feFpAdd;ECFieldElementFp.prototype.subtract=feFpSubtract;ECFieldElementFp.prototype.multiply=feFpMultiply;ECFieldElementFp.prototype.square=feFpSquare;ECFieldElementFp.prototype.divide=feFpDivide;function ECPointFp(c,a,d,b){this.curve=c;this.x=a;this.y=d;if(b==null){this.z=BigInteger.ONE}else{this.z=b}this.zinv=null}function pointFpGetX(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpGetY(){if(this.zinv==null){this.zinv=this.z.modInverse(this.curve.q)}return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))}function pointFpEquals(a){if(a==this){return true}if(this.isInfinity()){return a.isInfinity()}if(a.isInfinity()){return this.isInfinity()}var c,b;c=a.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(a.z)).mod(this.curve.q);if(!c.equals(BigInteger.ZERO)){return false}b=a.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(a.z)).mod(this.curve.q);return b.equals(BigInteger.ZERO)}function pointFpIsInfinity(){if((this.x==null)&&(this.y==null)){return true}return this.z.equals(BigInteger.ZERO)&&!this.y.toBigInteger().equals(BigInteger.ZERO)}function pointFpNegate(){return new ECPointFp(this.curve,this.x,this.y.negate(),this.z)}function pointFpAdd(l){if(this.isInfinity()){return l}if(l.isInfinity()){return this}var p=l.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(l.z)).mod(this.curve.q);var o=l.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(l.z)).mod(this.curve.q);if(BigInteger.ZERO.equals(o)){if(BigInteger.ZERO.equals(p)){return this.twice()}return this.curve.getInfinity()}var j=new BigInteger("3");var e=this.x.toBigInteger();var n=this.y.toBigInteger();var c=l.x.toBigInteger();var k=l.y.toBigInteger();var m=o.square();var i=m.multiply(o);var d=e.multiply(m);var g=p.square().multiply(this.z);var a=g.subtract(d.shiftLeft(1)).multiply(l.z).subtract(i).multiply(o).mod(this.curve.q);var h=d.multiply(j).multiply(p).subtract(n.multiply(i)).subtract(g.multiply(p)).multiply(l.z).add(p.multiply(i)).mod(this.curve.q);var f=i.multiply(this.z).multiply(l.z).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(a),this.curve.fromBigInteger(h),f)}function pointFpTwice(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var g=new BigInteger("3");var c=this.x.toBigInteger();var h=this.y.toBigInteger();var e=h.multiply(this.z);var j=e.multiply(h).mod(this.curve.q);var i=this.curve.a.toBigInteger();var k=c.square().multiply(g);if(!BigInteger.ZERO.equals(i)){k=k.add(this.z.square().multiply(i))}k=k.mod(this.curve.q);var b=k.square().subtract(c.shiftLeft(3).multiply(j)).shiftLeft(1).multiply(e).mod(this.curve.q);var f=k.multiply(g).multiply(c).subtract(j.shiftLeft(1)).shiftLeft(2).multiply(j).subtract(k.square().multiply(k)).mod(this.curve.q);var d=e.square().multiply(e).shiftLeft(3).mod(this.curve.q);return new ECPointFp(this.curve,this.curve.fromBigInteger(b),this.curve.fromBigInteger(f),d)}function pointFpMultiply(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add(a?this:l)}}return d}function pointFpMultiplyTwo(c,a,b){var d;if(c.bitLength()>b.bitLength()){d=c.bitLength()-1}else{d=b.bitLength()-1}var f=this.curve.getInfinity();var e=this.add(a);while(d>=0){f=f.twice();if(c.testBit(d)){if(b.testBit(d)){f=f.add(e)}else{f=f.add(this)}}else{if(b.testBit(d)){f=f.add(a)}}--d}return f}ECPointFp.prototype.getX=pointFpGetX;ECPointFp.prototype.getY=pointFpGetY;ECPointFp.prototype.equals=pointFpEquals;ECPointFp.prototype.isInfinity=pointFpIsInfinity;ECPointFp.prototype.negate=pointFpNegate;ECPointFp.prototype.add=pointFpAdd;ECPointFp.prototype.twice=pointFpTwice;ECPointFp.prototype.multiply=pointFpMultiply;ECPointFp.prototype.multiplyTwo=pointFpMultiplyTwo;function ECCurveFp(e,d,c){this.q=e;this.a=this.fromBigInteger(d);this.b=this.fromBigInteger(c);this.infinity=new ECPointFp(this,null,null)}function curveFpGetQ(){return this.q}function curveFpGetA(){return this.a}function curveFpGetB(){return this.b}function curveFpEquals(a){if(a==this){return true}return(this.q.equals(a.q)&&this.a.equals(a.a)&&this.b.equals(a.b))}function curveFpGetInfinity(){return this.infinity}function curveFpFromBigInteger(a){return new ECFieldElementFp(this.q,a)}function curveFpDecodePointHex(d){switch(parseInt(d.substr(0,2),16)){case 0:return this.infinity;case 2:case 3:return null;case 4:case 6:case 7:var a=(d.length-2)/2;var c=d.substr(2,a);var b=d.substr(a+2,a);return new ECPointFp(this,this.fromBigInteger(new BigInteger(c,16)),this.fromBigInteger(new BigInteger(b,16)));default:return null}}ECCurveFp.prototype.getQ=curveFpGetQ;ECCurveFp.prototype.getA=curveFpGetA;ECCurveFp.prototype.getB=curveFpGetB;ECCurveFp.prototype.equals=curveFpEquals;ECCurveFp.prototype.getInfinity=curveFpGetInfinity;ECCurveFp.prototype.fromBigInteger=curveFpFromBigInteger;ECCurveFp.prototype.decodePointHex=curveFpDecodePointHex;
/*! (c) Stefan Thomas | https://github.com/bitcoinjs/bitcoinjs-lib
 */
ECFieldElementFp.prototype.getByteLength=function(){return Math.floor((this.toBigInteger().bitLength()+7)/8)};ECPointFp.prototype.getEncoded=function(c){var d=function(h,f){var g=h.toByteArrayUnsigned();if(f<g.length){g=g.slice(g.length-f)}else{while(f>g.length){g.unshift(0)}}return g};var a=this.getX().toBigInteger();var e=this.getY().toBigInteger();var b=d(a,32);if(c){if(e.isEven()){b.unshift(2)}else{b.unshift(3)}}else{b.unshift(4);b=b.concat(d(e,32))}return b};ECPointFp.decodeFrom=function(g,c){var f=c[0];var e=c.length-1;var d=c.slice(1,1+e/2);var b=c.slice(1+e/2,1+e);d.unshift(0);b.unshift(0);var a=new BigInteger(d);var h=new BigInteger(b);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.decodeFromHex=function(g,c){var f=c.substr(0,2);var e=c.length-2;var d=c.substr(2,e/2);var b=c.substr(2+e/2,e/2);var a=new BigInteger(d,16);var h=new BigInteger(b,16);return new ECPointFp(g,g.fromBigInteger(a),g.fromBigInteger(h))};ECPointFp.prototype.add2D=function(c){if(this.isInfinity()){return c}if(c.isInfinity()){return this}if(this.x.equals(c.x)){if(this.y.equals(c.y)){return this.twice()}return this.curve.getInfinity()}var g=c.x.subtract(this.x);var e=c.y.subtract(this.y);var a=e.divide(g);var d=a.square().subtract(this.x).subtract(c.x);var f=a.multiply(this.x.subtract(d)).subtract(this.y);return new ECPointFp(this.curve,d,f)};ECPointFp.prototype.twice2D=function(){if(this.isInfinity()){return this}if(this.y.toBigInteger().signum()==0){return this.curve.getInfinity()}var b=this.curve.fromBigInteger(BigInteger.valueOf(2));var e=this.curve.fromBigInteger(BigInteger.valueOf(3));var a=this.x.square().multiply(e).add(this.curve.a).divide(this.y.multiply(b));var c=a.square().subtract(this.x.multiply(b));var d=a.multiply(this.x.subtract(c)).subtract(this.y);return new ECPointFp(this.curve,c,d)};ECPointFp.prototype.multiply2D=function(b){if(this.isInfinity()){return this}if(b.signum()==0){return this.curve.getInfinity()}var g=b;var f=g.multiply(new BigInteger("3"));var l=this.negate();var d=this;var c;for(c=f.bitLength()-2;c>0;--c){d=d.twice();var a=f.testBit(c);var j=g.testBit(c);if(a!=j){d=d.add2D(a?this:l)}}return d};ECPointFp.prototype.isOnCurve=function(){var d=this.getX().toBigInteger();var i=this.getY().toBigInteger();var f=this.curve.getA().toBigInteger();var c=this.curve.getB().toBigInteger();var h=this.curve.getQ();var e=i.multiply(i).mod(h);var g=d.multiply(d).multiply(d).add(f.multiply(d)).add(c).mod(h);return e.equals(g)};ECPointFp.prototype.toString=function(){return"("+this.getX().toBigInteger().toString()+","+this.getY().toBigInteger().toString()+")"};ECPointFp.prototype.validate=function(){var c=this.curve.getQ();if(this.isInfinity()){throw new Error("Point is at infinity.")}var a=this.getX().toBigInteger();var b=this.getY().toBigInteger();if(a.compareTo(BigInteger.ONE)<0||a.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("x coordinate out of bounds")}if(b.compareTo(BigInteger.ONE)<0||b.compareTo(c.subtract(BigInteger.ONE))>0){throw new Error("y coordinate out of bounds")}if(!this.isOnCurve()){throw new Error("Point is not on the curve.")}if(this.multiply(c).isInfinity()){throw new Error("Point is not a scalar multiple of G.")}return true};
/*! asn1-1.0.6.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}KJUR.asn1.ASN1Util=new function(){this.integerToByteHex=function(a){var b=a.toString(16);if((b.length%2)==1){b="0"+b}return b};this.bigIntToMinTwosComplementsHex=function(j){var f=j.toString(16);if(f.substr(0,1)!="-"){if(f.length%2==1){f="0"+f}else{if(!f.match(/^[0-7]/)){f="00"+f}}}else{var a=f.substr(1);var e=a.length;if(e%2==1){e+=1}else{if(!f.match(/^[0-7]/)){e+=2}}var g="";for(var d=0;d<e;d++){g+="f"}var c=new BigInteger(g,16);var b=c.xor(j).add(BigInteger.ONE);f=b.toString(16).replace(/^-/,"")}return f};this.getPEMStringFromHex=function(a,b){var c=KJUR.asn1;var f=CryptoJS.enc.Hex.parse(a);var d=CryptoJS.enc.Base64.stringify(f);var e=d.replace(/(.{64})/g,"$1\r\n");e=e.replace(/\r\n$/,"");return"-----BEGIN "+b+"-----\r\n"+e+"\r\n-----END "+b+"-----\r\n"};this.newObject=function(b){var g=KJUR.asn1;var k=Object.keys(b);if(k.length!=1){throw"key of param shall be only one."}var j=k[0];if(":bool:int:bitstr:octstr:null:oid:utf8str:numstr:prnstr:telstr:ia5str:utctime:gentime:seq:set:tag:".indexOf(":"+j+":")==-1){throw"undefined key: "+j}if(j=="bool"){return new g.DERBoolean(b[j])}if(j=="int"){return new g.DERInteger(b[j])}if(j=="bitstr"){return new g.DERBitString(b[j])}if(j=="octstr"){return new g.DEROctetString(b[j])}if(j=="null"){return new g.DERNull(b[j])}if(j=="oid"){return new g.DERObjectIdentifier(b[j])}if(j=="utf8str"){return new g.DERUTF8String(b[j])}if(j=="numstr"){return new g.DERNumericString(b[j])}if(j=="prnstr"){return new g.DERPrintableString(b[j])}if(j=="telstr"){return new g.DERTeletexString(b[j])}if(j=="ia5str"){return new g.DERIA5String(b[j])}if(j=="utctime"){return new g.DERUTCTime(b[j])}if(j=="gentime"){return new g.DERGeneralizedTime(b[j])}if(j=="seq"){var m=b[j];var h=[];for(var e=0;e<m.length;e++){var l=g.ASN1Util.newObject(m[e]);h.push(l)}return new g.DERSequence({array:h})}if(j=="set"){var m=b[j];var h=[];for(var e=0;e<m.length;e++){var l=g.ASN1Util.newObject(m[e]);h.push(l)}return new g.DERSet({array:h})}if(j=="tag"){var c=b[j];if(Object.prototype.toString.call(c)==="[object Array]"&&c.length==3){var d=g.ASN1Util.newObject(c[2]);return new g.DERTaggedObject({tag:c[0],explicit:c[1],obj:d})}else{var f={};if(c.explicit!==undefined){f.explicit=c.explicit}if(c.tag!==undefined){f.tag=c.tag}if(c.obj===undefined){throw"obj shall be specified for 'tag'."}f.obj=g.ASN1Util.newObject(c.obj);return new g.DERTaggedObject(f)}}};this.jsonToASN1HEX=function(b){var a=this.newObject(b);return a.getEncodedHex()}};KJUR.asn1.ASN1Object=function(){var c=true;var b=null;var d="00";var e="00";var a="";this.getLengthHexFromValue=function(){if(typeof this.hV=="undefined"||this.hV==null){throw"this.hV is null or undefined."}if(this.hV.length%2==1){throw"value hex must be even length: n="+a.length+",v="+this.hV}var i=this.hV.length/2;var h=i.toString(16);if(h.length%2==1){h="0"+h}if(i<128){return h}else{var g=h.length/2;if(g>15){throw"ASN.1 length too long to represent by 8x: n = "+i.toString(16)}var f=128+g;return f.toString(16)+h}};this.getEncodedHex=function(){if(this.hTLV==null||this.isModified){this.hV=this.getFreshValueHex();this.hL=this.getLengthHexFromValue();this.hTLV=this.hT+this.hL+this.hV;this.isModified=false}return this.hTLV};this.getValueHex=function(){this.getEncodedHex();return this.hV};this.getFreshValueHex=function(){return""}};KJUR.asn1.DERAbstractString=function(c){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);var b=null;var a=null;this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=stohex(this.s)};this.setStringHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d};this.getFreshValueHex=function(){return this.hV};if(typeof c!="undefined"){if(typeof c=="string"){this.setString(c)}else{if(typeof c.str!="undefined"){this.setString(c.str)}else{if(typeof c.hex!="undefined"){this.setStringHex(c.hex)}}}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractString,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractTime=function(c){KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);var b=null;var a=null;this.localDateToUTC=function(f){utc=f.getTime()+(f.getTimezoneOffset()*60000);var e=new Date(utc);return e};this.formatDate=function(m,o,e){var g=this.zeroPadding;var n=this.localDateToUTC(m);var p=String(n.getFullYear());if(o=="utc"){p=p.substr(2,2)}var l=g(String(n.getMonth()+1),2);var q=g(String(n.getDate()),2);var h=g(String(n.getHours()),2);var i=g(String(n.getMinutes()),2);var j=g(String(n.getSeconds()),2);var r=p+l+q+h+i+j;if(e===true){var f=n.getMilliseconds();if(f!=0){var k=g(String(f),3);k=k.replace(/[0]+$/,"");r=r+"."+k}}return r+"Z"};this.zeroPadding=function(e,d){if(e.length>=d){return e}return new Array(d-e.length+1).join("0")+e};this.getString=function(){return this.s};this.setString=function(d){this.hTLV=null;this.isModified=true;this.s=d;this.hV=stohex(d)};this.setByDateValue=function(h,j,e,d,f,g){var i=new Date(Date.UTC(h,j-1,e,d,f,g,0));this.setByDate(i)};this.getFreshValueHex=function(){return this.hV}};YAHOO.lang.extend(KJUR.asn1.DERAbstractTime,KJUR.asn1.ASN1Object);KJUR.asn1.DERAbstractStructured=function(b){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);var a=null;this.setByASN1ObjectArray=function(c){this.hTLV=null;this.isModified=true;this.asn1Array=c};this.appendASN1Object=function(c){this.hTLV=null;this.isModified=true;this.asn1Array.push(c)};this.asn1Array=new Array();if(typeof b!="undefined"){if(typeof b.array!="undefined"){this.asn1Array=b.array}}};YAHOO.lang.extend(KJUR.asn1.DERAbstractStructured,KJUR.asn1.ASN1Object);KJUR.asn1.DERBoolean=function(){KJUR.asn1.DERBoolean.superclass.constructor.call(this);this.hT="01";this.hTLV="0101ff"};YAHOO.lang.extend(KJUR.asn1.DERBoolean,KJUR.asn1.ASN1Object);KJUR.asn1.DERInteger=function(a){KJUR.asn1.DERInteger.superclass.constructor.call(this);this.hT="02";this.setByBigInteger=function(b){this.hTLV=null;this.isModified=true;this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b)};this.setByInteger=function(c){var b=new BigInteger(String(c),10);this.setByBigInteger(b)};this.setValueHex=function(b){this.hV=b};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.bigint!="undefined"){this.setByBigInteger(a.bigint)}else{if(typeof a["int"]!="undefined"){this.setByInteger(a["int"])}else{if(typeof a=="number"){this.setByInteger(a)}else{if(typeof a.hex!="undefined"){this.setValueHex(a.hex)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERInteger,KJUR.asn1.ASN1Object);KJUR.asn1.DERBitString=function(a){KJUR.asn1.DERBitString.superclass.constructor.call(this);this.hT="03";this.setHexValueIncludingUnusedBits=function(b){this.hTLV=null;this.isModified=true;this.hV=b};this.setUnusedBitsAndHexValue=function(b,d){if(b<0||7<b){throw"unused bits shall be from 0 to 7: u = "+b}var c="0"+b;this.hTLV=null;this.isModified=true;this.hV=c+d};this.setByBinaryString=function(e){e=e.replace(/0+$/,"");var f=8-e.length%8;if(f==8){f=0}for(var g=0;g<=f;g++){e+="0"}var j="";for(var g=0;g<e.length-1;g+=8){var d=e.substr(g,8);var c=parseInt(d,2).toString(16);if(c.length==1){c="0"+c}j+=c}this.hTLV=null;this.isModified=true;this.hV="0"+f+j};this.setByBooleanArray=function(d){var c="";for(var b=0;b<d.length;b++){if(d[b]==true){c+="1"}else{c+="0"}}this.setByBinaryString(c)};this.newFalseArray=function(d){var b=new Array(d);for(var c=0;c<d;c++){b[c]=false}return b};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a=="string"&&a.toLowerCase().match(/^[0-9a-f]+$/)){this.setHexValueIncludingUnusedBits(a)}else{if(typeof a.hex!="undefined"){this.setHexValueIncludingUnusedBits(a.hex)}else{if(typeof a.bin!="undefined"){this.setByBinaryString(a.bin)}else{if(typeof a.array!="undefined"){this.setByBooleanArray(a.array)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERBitString,KJUR.asn1.ASN1Object);KJUR.asn1.DEROctetString=function(a){KJUR.asn1.DEROctetString.superclass.constructor.call(this,a);this.hT="04"};YAHOO.lang.extend(KJUR.asn1.DEROctetString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNull=function(){KJUR.asn1.DERNull.superclass.constructor.call(this);this.hT="05";this.hTLV="0500"};YAHOO.lang.extend(KJUR.asn1.DERNull,KJUR.asn1.ASN1Object);KJUR.asn1.DERObjectIdentifier=function(c){var b=function(d){var e=d.toString(16);if(e.length==1){e="0"+e}return e};var a=function(k){var j="";var e=new BigInteger(k,10);var d=e.toString(2);var f=7-d.length%7;if(f==7){f=0}var m="";for(var g=0;g<f;g++){m+="0"}d=m+d;for(var g=0;g<d.length-1;g+=7){var l=d.substr(g,7);if(g!=d.length-7){l="1"+l}j+=b(parseInt(l,2))}return j};KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);this.hT="06";this.setValueHex=function(d){this.hTLV=null;this.isModified=true;this.s=null;this.hV=d};this.setValueOidString=function(f){if(!f.match(/^[0-9.]+$/)){throw"malformed oid string: "+f}var g="";var d=f.split(".");var j=parseInt(d[0])*40+parseInt(d[1]);g+=b(j);d.splice(0,2);for(var e=0;e<d.length;e++){g+=a(d[e])}this.hTLV=null;this.isModified=true;this.s=null;this.hV=g};this.setValueName=function(e){if(typeof KJUR.asn1.x509.OID.name2oidList[e]!="undefined"){var d=KJUR.asn1.x509.OID.name2oidList[e];this.setValueOidString(d)}else{throw"DERObjectIdentifier oidName undefined: "+e}};this.getFreshValueHex=function(){return this.hV};if(typeof c!="undefined"){if(typeof c=="string"&&c.match(/^[0-2].[0-9.]+$/)){this.setValueOidString(c)}else{if(KJUR.asn1.x509.OID.name2oidList[c]!==undefined){this.setValueOidString(KJUR.asn1.x509.OID.name2oidList[c])}else{if(typeof c.oid!="undefined"){this.setValueOidString(c.oid)}else{if(typeof c.hex!="undefined"){this.setValueHex(c.hex)}else{if(typeof c.name!="undefined"){this.setValueName(c.name)}}}}}}};YAHOO.lang.extend(KJUR.asn1.DERObjectIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.DERUTF8String=function(a){KJUR.asn1.DERUTF8String.superclass.constructor.call(this,a);this.hT="0c"};YAHOO.lang.extend(KJUR.asn1.DERUTF8String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERNumericString=function(a){KJUR.asn1.DERNumericString.superclass.constructor.call(this,a);this.hT="12"};YAHOO.lang.extend(KJUR.asn1.DERNumericString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERPrintableString=function(a){KJUR.asn1.DERPrintableString.superclass.constructor.call(this,a);this.hT="13"};YAHOO.lang.extend(KJUR.asn1.DERPrintableString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERTeletexString=function(a){KJUR.asn1.DERTeletexString.superclass.constructor.call(this,a);this.hT="14"};YAHOO.lang.extend(KJUR.asn1.DERTeletexString,KJUR.asn1.DERAbstractString);KJUR.asn1.DERIA5String=function(a){KJUR.asn1.DERIA5String.superclass.constructor.call(this,a);this.hT="16"};YAHOO.lang.extend(KJUR.asn1.DERIA5String,KJUR.asn1.DERAbstractString);KJUR.asn1.DERUTCTime=function(a){KJUR.asn1.DERUTCTime.superclass.constructor.call(this,a);this.hT="17";this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"utc");this.hV=stohex(this.s)};this.getFreshValueHex=function(){if(typeof this.date=="undefined"&&typeof this.s=="undefined"){this.date=new Date();this.s=this.formatDate(this.date,"utc");this.hV=stohex(this.s)}return this.hV};if(typeof a!="undefined"){if(typeof a.str!="undefined"){this.setString(a.str)}else{if(typeof a=="string"&&a.match(/^[0-9]{12}Z$/)){this.setString(a)}else{if(typeof a.hex!="undefined"){this.setStringHex(a.hex)}else{if(typeof a.date!="undefined"){this.setByDate(a.date)}}}}}};YAHOO.lang.extend(KJUR.asn1.DERUTCTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERGeneralizedTime=function(a){KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this,a);this.hT="18";this.withMillis=false;this.setByDate=function(b){this.hTLV=null;this.isModified=true;this.date=b;this.s=this.formatDate(this.date,"gen",this.withMillis);this.hV=stohex(this.s)};this.getFreshValueHex=function(){if(typeof this.date=="undefined"&&typeof this.s=="undefined"){this.date=new Date();this.s=this.formatDate(this.date,"gen",this.withMillis);this.hV=stohex(this.s)}return this.hV};if(typeof a!="undefined"){if(typeof a.str!="undefined"){this.setString(a.str)}else{if(typeof a=="string"&&a.match(/^[0-9]{14}Z$/)){this.setString(a)}else{if(typeof a.hex!="undefined"){this.setStringHex(a.hex)}else{if(typeof a.date!="undefined"){this.setByDate(a.date)}else{if(a.millis===true){this.withMillis=true}}}}}}};YAHOO.lang.extend(KJUR.asn1.DERGeneralizedTime,KJUR.asn1.DERAbstractTime);KJUR.asn1.DERSequence=function(a){KJUR.asn1.DERSequence.superclass.constructor.call(this,a);this.hT="30";this.getFreshValueHex=function(){var c="";for(var b=0;b<this.asn1Array.length;b++){var d=this.asn1Array[b];c+=d.getEncodedHex()}this.hV=c;return this.hV}};YAHOO.lang.extend(KJUR.asn1.DERSequence,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERSet=function(a){KJUR.asn1.DERSet.superclass.constructor.call(this,a);this.hT="31";this.sortFlag=true;this.getFreshValueHex=function(){var b=new Array();for(var c=0;c<this.asn1Array.length;c++){var d=this.asn1Array[c];b.push(d.getEncodedHex())}if(this.sortFlag==true){b.sort()}this.hV=b.join("");return this.hV};if(typeof a!="undefined"){if(typeof a.sortflag!="undefined"&&a.sortflag==false){this.sortFlag=false}}};YAHOO.lang.extend(KJUR.asn1.DERSet,KJUR.asn1.DERAbstractStructured);KJUR.asn1.DERTaggedObject=function(a){KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);this.hT="a0";this.hV="";this.isExplicit=true;this.asn1Object=null;this.setASN1Object=function(b,c,d){this.hT=c;this.isExplicit=b;this.asn1Object=d;if(this.isExplicit){this.hV=this.asn1Object.getEncodedHex();this.hTLV=null;this.isModified=true}else{this.hV=null;this.hTLV=d.getEncodedHex();this.hTLV=this.hTLV.replace(/^../,c);this.isModified=false}};this.getFreshValueHex=function(){return this.hV};if(typeof a!="undefined"){if(typeof a.tag!="undefined"){this.hT=a.tag}if(typeof a.explicit!="undefined"){this.isExplicit=a.explicit}if(typeof a.obj!="undefined"){this.asn1Object=a.obj;this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)}}};YAHOO.lang.extend(KJUR.asn1.DERTaggedObject,KJUR.asn1.ASN1Object);
/*! asn1hex-1.1.5.js (c) 2012-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var ASN1HEX=new function(){this.getByteLengthOfL_AtObj=function(b,c){if(b.substring(c+2,c+3)!="8"){return 1}var a=parseInt(b.substring(c+3,c+4));if(a==0){return -1}if(0<a&&a<10){return a+1}return -2};this.getHexOfL_AtObj=function(b,c){var a=this.getByteLengthOfL_AtObj(b,c);if(a<1){return""}return b.substring(c+2,c+2+a*2)};this.getIntOfL_AtObj=function(c,d){var b=this.getHexOfL_AtObj(c,d);if(b==""){return -1}var a;if(parseInt(b.substring(0,1))<8){a=new BigInteger(b,16)}else{a=new BigInteger(b.substring(2),16)}return a.intValue()};this.getStartPosOfV_AtObj=function(b,c){var a=this.getByteLengthOfL_AtObj(b,c);if(a<0){return a}return c+(a+1)*2};this.getHexOfV_AtObj=function(c,d){var b=this.getStartPosOfV_AtObj(c,d);var a=this.getIntOfL_AtObj(c,d);return c.substring(b,b+a*2)};this.getHexOfTLV_AtObj=function(c,e){var b=c.substr(e,2);var d=this.getHexOfL_AtObj(c,e);var a=this.getHexOfV_AtObj(c,e);return b+d+a};this.getPosOfNextSibling_AtObj=function(c,d){var b=this.getStartPosOfV_AtObj(c,d);var a=this.getIntOfL_AtObj(c,d);return b+a*2};this.getPosArrayOfChildren_AtObj=function(f,j){var c=new Array();var i=this.getStartPosOfV_AtObj(f,j);c.push(i);var b=this.getIntOfL_AtObj(f,j);var g=i;var d=0;while(1){var e=this.getPosOfNextSibling_AtObj(f,g);if(e==null||(e-i>=(b*2))){break}if(d>=200){break}c.push(e);g=e;d++}return c};this.getNthChildIndex_AtObj=function(d,b,e){var c=this.getPosArrayOfChildren_AtObj(d,b);return c[e]};this.getDecendantIndexByNthList=function(e,d,c){if(c.length==0){return d}var f=c.shift();var b=this.getPosArrayOfChildren_AtObj(e,d);return this.getDecendantIndexByNthList(e,b[f],c)};this.getDecendantHexTLVByNthList=function(d,c,b){var a=this.getDecendantIndexByNthList(d,c,b);return this.getHexOfTLV_AtObj(d,a)};this.getDecendantHexVByNthList=function(d,c,b){var a=this.getDecendantIndexByNthList(d,c,b);return this.getHexOfV_AtObj(d,a)}};ASN1HEX.getVbyList=function(d,c,b,e){var a=this.getDecendantIndexByNthList(d,c,b);if(a===undefined){throw"can't find nthList object"}if(e!==undefined){if(d.substr(a,2)!=e){throw"checking tag doesn't match: "+d.substr(a,2)+"!="+e}}return this.getHexOfV_AtObj(d,a)};ASN1HEX.hextooidstr=function(e){var h=function(b,a){if(b.length>=a){return b}return new Array(a-b.length+1).join("0")+b};var l=[];var o=e.substr(0,2);var f=parseInt(o,16);l[0]=new String(Math.floor(f/40));l[1]=new String(f%40);var m=e.substr(2);var k=[];for(var g=0;g<m.length/2;g++){k.push(parseInt(m.substr(g*2,2),16))}var j=[];var d="";for(var g=0;g<k.length;g++){if(k[g]&128){d=d+h((k[g]&127).toString(2),7)}else{d=d+h((k[g]&127).toString(2),7);j.push(new String(parseInt(d,2)));d=""}}var n=l.join(".");if(j.length>0){n=n+"."+j.join(".")}return n};
/*! asn1x509-1.0.9.js (c) 2013-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.x509=="undefined"||!KJUR.asn1.x509){KJUR.asn1.x509={}}KJUR.asn1.x509.Certificate=function(g){KJUR.asn1.x509.Certificate.superclass.constructor.call(this);var b=null;var d=null;var f=null;var c=null;var a=null;var e=null;this.setRsaPrvKeyByPEMandPass=function(i,k){var h=PKCS5PKEY.getDecryptedKeyHex(i,k);var j=new RSAKey();j.readPrivateKeyFromASN1HexString(h);this.prvKey=j};this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCert.asn1SignatureAlg;sig=new KJUR.crypto.Signature({alg:"SHA1withRSA"});sig.init(this.prvKey);sig.updateHex(this.asn1TBSCert.getEncodedHex());this.hexSig=sig.sign();this.asn1Sig=new KJUR.asn1.DERBitString({hex:"00"+this.hexSig});var h=new KJUR.asn1.DERSequence({array:[this.asn1TBSCert,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=h.getEncodedHex();this.isModified=false};this.setSignatureHex=function(h){this.asn1SignatureAlg=this.asn1TBSCert.asn1SignatureAlg;this.hexSig=h;this.asn1Sig=new KJUR.asn1.DERBitString({hex:"00"+this.hexSig});var i=new KJUR.asn1.DERSequence({array:[this.asn1TBSCert,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=i.getEncodedHex();this.isModified=false};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var j=this.getEncodedHex();var h=CryptoJS.enc.Hex.parse(j);var i=CryptoJS.enc.Base64.stringify(h);var k=i.replace(/(.{64})/g,"$1\r\n");return"-----BEGIN CERTIFICATE-----\r\n"+k+"\r\n-----END CERTIFICATE-----\r\n"};if(typeof g!="undefined"){if(typeof g.tbscertobj!="undefined"){this.asn1TBSCert=g.tbscertobj}if(typeof g.prvkeyobj!="undefined"){this.prvKey=g.prvkeyobj}else{if(typeof g.rsaprvkey!="undefined"){this.prvKey=g.rsaprvkey}else{if((typeof g.rsaprvpem!="undefined")&&(typeof g.rsaprvpas!="undefined")){this.setRsaPrvKeyByPEMandPass(g.rsaprvpem,g.rsaprvpas)}}}}};YAHOO.lang.extend(KJUR.asn1.x509.Certificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertificate=function(a){KJUR.asn1.x509.TBSCertificate.superclass.constructor.call(this);this._initialize=function(){this.asn1Array=new Array();this.asn1Version=new KJUR.asn1.DERTaggedObject({obj:new KJUR.asn1.DERInteger({"int":2})});this.asn1SerialNumber=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1NotBefore=null;this.asn1NotAfter=null;this.asn1Subject=null;this.asn1SubjPKey=null;this.extensionsArray=new Array()};this.setSerialNumberByParam=function(b){this.asn1SerialNumber=new KJUR.asn1.DERInteger(b)};this.setSignatureAlgByParam=function(b){this.asn1SignatureAlg=new KJUR.asn1.x509.AlgorithmIdentifier(b)};this.setIssuerByParam=function(b){this.asn1Issuer=new KJUR.asn1.x509.X500Name(b)};this.setNotBeforeByParam=function(b){this.asn1NotBefore=new KJUR.asn1.x509.Time(b)};this.setNotAfterByParam=function(b){this.asn1NotAfter=new KJUR.asn1.x509.Time(b)};this.setSubjectByParam=function(b){this.asn1Subject=new KJUR.asn1.x509.X500Name(b)};this.setSubjectPublicKeyByParam=function(b){this.asn1SubjPKey=new KJUR.asn1.x509.SubjectPublicKeyInfo(b)};this.setSubjectPublicKeyByGetKey=function(c){var b=KEYUTIL.getKey(c);this.asn1SubjPKey=new KJUR.asn1.x509.SubjectPublicKeyInfo(b)};this.appendExtension=function(b){this.extensionsArray.push(b)};this.appendExtensionByName=function(d,b){if(d.toLowerCase()=="basicconstraints"){var c=new KJUR.asn1.x509.BasicConstraints(b);this.appendExtension(c)}else{if(d.toLowerCase()=="keyusage"){var c=new KJUR.asn1.x509.KeyUsage(b);this.appendExtension(c)}else{if(d.toLowerCase()=="crldistributionpoints"){var c=new KJUR.asn1.x509.CRLDistributionPoints(b);this.appendExtension(c)}else{if(d.toLowerCase()=="extkeyusage"){var c=new KJUR.asn1.x509.ExtKeyUsage(b);this.appendExtension(c)}else{if(d.toLowerCase()=="authoritykeyidentifier"){var c=new KJUR.asn1.x509.AuthorityKeyIdentifier(b);this.appendExtension(c)}else{throw"unsupported extension name: "+d}}}}}};this.getEncodedHex=function(){if(this.asn1NotBefore==null||this.asn1NotAfter==null){throw"notBefore and/or notAfter not set"}var c=new KJUR.asn1.DERSequence({array:[this.asn1NotBefore,this.asn1NotAfter]});this.asn1Array=new Array();this.asn1Array.push(this.asn1Version);this.asn1Array.push(this.asn1SerialNumber);this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(c);this.asn1Array.push(this.asn1Subject);this.asn1Array.push(this.asn1SubjPKey);if(this.extensionsArray.length>0){var d=new KJUR.asn1.DERSequence({array:this.extensionsArray});var b=new KJUR.asn1.DERTaggedObject({explicit:true,tag:"a3",obj:d});this.asn1Array.push(b)}var e=new KJUR.asn1.DERSequence({array:this.asn1Array});this.hTLV=e.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize()};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertificate,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Extension=function(b){KJUR.asn1.x509.Extension.superclass.constructor.call(this);var a=null;this.getEncodedHex=function(){var f=new KJUR.asn1.DERObjectIdentifier({oid:this.oid});var e=new KJUR.asn1.DEROctetString({hex:this.getExtnValueHex()});var d=new Array();d.push(f);if(this.critical){d.push(new KJUR.asn1.DERBoolean())}d.push(e);var c=new KJUR.asn1.DERSequence({array:d});return c.getEncodedHex()};this.critical=false;if(typeof b!="undefined"){if(typeof b.critical!="undefined"){this.critical=b.critical}}};YAHOO.lang.extend(KJUR.asn1.x509.Extension,KJUR.asn1.ASN1Object);KJUR.asn1.x509.KeyUsage=function(a){KJUR.asn1.x509.KeyUsage.superclass.constructor.call(this,a);this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.15";if(typeof a!="undefined"){if(typeof a.bin!="undefined"){this.asn1ExtnValue=new KJUR.asn1.DERBitString(a)}}};YAHOO.lang.extend(KJUR.asn1.x509.KeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.BasicConstraints=function(c){KJUR.asn1.x509.BasicConstraints.superclass.constructor.call(this,c);var a=false;var b=-1;this.getExtnValueHex=function(){var e=new Array();if(this.cA){e.push(new KJUR.asn1.DERBoolean())}if(this.pathLen>-1){e.push(new KJUR.asn1.DERInteger({"int":this.pathLen}))}var d=new KJUR.asn1.DERSequence({array:e});this.asn1ExtnValue=d;return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.19";this.cA=false;this.pathLen=-1;if(typeof c!="undefined"){if(typeof c.cA!="undefined"){this.cA=c.cA}if(typeof c.pathLen!="undefined"){this.pathLen=c.pathLen}}};YAHOO.lang.extend(KJUR.asn1.x509.BasicConstraints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRLDistributionPoints=function(a){KJUR.asn1.x509.CRLDistributionPoints.superclass.constructor.call(this,a);this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.setByDPArray=function(b){this.asn1ExtnValue=new KJUR.asn1.DERSequence({array:b})};this.setByOneURI=function(e){var b=new KJUR.asn1.x509.GeneralNames([{uri:e}]);var d=new KJUR.asn1.x509.DistributionPointName(b);var c=new KJUR.asn1.x509.DistributionPoint({dpobj:d});this.setByDPArray([c])};this.oid="2.5.29.31";if(typeof a!="undefined"){if(typeof a.array!="undefined"){this.setByDPArray(a.array)}else{if(typeof a.uri!="undefined"){this.setByOneURI(a.uri)}}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLDistributionPoints,KJUR.asn1.x509.Extension);KJUR.asn1.x509.ExtKeyUsage=function(a){KJUR.asn1.x509.ExtKeyUsage.superclass.constructor.call(this,a);this.setPurposeArray=function(b){this.asn1ExtnValue=new KJUR.asn1.DERSequence();for(var c=0;c<b.length;c++){var d=new KJUR.asn1.DERObjectIdentifier(b[c]);this.asn1ExtnValue.appendASN1Object(d)}};this.getExtnValueHex=function(){return this.asn1ExtnValue.getEncodedHex()};this.oid="2.5.29.37";if(typeof a!="undefined"){if(typeof a.array!="undefined"){this.setPurposeArray(a.array)}}};YAHOO.lang.extend(KJUR.asn1.x509.ExtKeyUsage,KJUR.asn1.x509.Extension);KJUR.asn1.x509.AuthorityKeyIdentifier=function(a){KJUR.asn1.x509.AuthorityKeyIdentifier.superclass.constructor.call(this,a);this.asn1KID=null;this.asn1CertIssuer=null;this.asn1CertSN=null;this.getExtnValueHex=function(){var c=new Array();if(this.asn1KID){c.push(new KJUR.asn1.DERTaggedObject({explicit:false,tag:"80",obj:this.asn1KID}))}if(this.asn1CertIssuer){c.push(new KJUR.asn1.DERTaggedObject({explicit:false,tag:"a1",obj:this.asn1CertIssuer}))}if(this.asn1CertSN){c.push(new KJUR.asn1.DERTaggedObject({explicit:false,tag:"82",obj:this.asn1CertSN}))}var b=new KJUR.asn1.DERSequence({array:c});this.asn1ExtnValue=b;return this.asn1ExtnValue.getEncodedHex()};this.setKIDByParam=function(b){this.asn1KID=new KJUR.asn1.DEROctetString(b)};this.setCertIssuerByParam=function(b){this.asn1CertIssuer=new KJUR.asn1.x509.X500Name(b)};this.setCertSNByParam=function(b){this.asn1CertSN=new KJUR.asn1.DERInteger(b)};this.oid="2.5.29.35";if(typeof a!="undefined"){if(typeof a.kid!="undefined"){this.setKIDByParam(a.kid)}if(typeof a.issuer!="undefined"){this.setCertIssuerByParam(a.issuer)}if(typeof a.sn!="undefined"){this.setCertSNByParam(a.sn)}}};YAHOO.lang.extend(KJUR.asn1.x509.AuthorityKeyIdentifier,KJUR.asn1.x509.Extension);KJUR.asn1.x509.CRL=function(f){KJUR.asn1.x509.CRL.superclass.constructor.call(this);var a=null;var c=null;var e=null;var b=null;var d=null;this.setRsaPrvKeyByPEMandPass=function(h,j){var g=PKCS5PKEY.getDecryptedKeyHex(h,j);var i=new RSAKey();i.readPrivateKeyFromASN1HexString(g);this.rsaPrvKey=i};this.sign=function(){this.asn1SignatureAlg=this.asn1TBSCertList.asn1SignatureAlg;sig=new KJUR.crypto.Signature({alg:"SHA1withRSA",prov:"cryptojs/jsrsa"});sig.initSign(this.rsaPrvKey);sig.updateHex(this.asn1TBSCertList.getEncodedHex());this.hexSig=sig.sign();this.asn1Sig=new KJUR.asn1.DERBitString({hex:"00"+this.hexSig});var g=new KJUR.asn1.DERSequence({array:[this.asn1TBSCertList,this.asn1SignatureAlg,this.asn1Sig]});this.hTLV=g.getEncodedHex();this.isModified=false};this.getEncodedHex=function(){if(this.isModified==false&&this.hTLV!=null){return this.hTLV}throw"not signed yet"};this.getPEMString=function(){var i=this.getEncodedHex();var g=CryptoJS.enc.Hex.parse(i);var h=CryptoJS.enc.Base64.stringify(g);var j=h.replace(/(.{64})/g,"$1\r\n");return"-----BEGIN X509 CRL-----\r\n"+j+"\r\n-----END X509 CRL-----\r\n"};if(typeof f!="undefined"){if(typeof f.tbsobj!="undefined"){this.asn1TBSCertList=f.tbsobj}if(typeof f.rsaprvkey!="undefined"){this.rsaPrvKey=f.rsaprvkey}if((typeof f.rsaprvpem!="undefined")&&(typeof f.rsaprvpas!="undefined")){this.setRsaPrvKeyByPEMandPass(f.rsaprvpem,f.rsaprvpas)}}};YAHOO.lang.extend(KJUR.asn1.x509.CRL,KJUR.asn1.ASN1Object);KJUR.asn1.x509.TBSCertList=function(b){KJUR.asn1.x509.TBSCertList.superclass.constructor.call(this);var a=null;this.setSignatureAlgByParam=function(c){this.asn1SignatureAlg=new KJUR.asn1.x509.AlgorithmIdentifier(c)};this.setIssuerByParam=function(c){this.asn1Issuer=new KJUR.asn1.x509.X500Name(c)};this.setThisUpdateByParam=function(c){this.asn1ThisUpdate=new KJUR.asn1.x509.Time(c)};this.setNextUpdateByParam=function(c){this.asn1NextUpdate=new KJUR.asn1.x509.Time(c)};this.addRevokedCert=function(c,d){var f={};if(c!=undefined&&c!=null){f.sn=c}if(d!=undefined&&d!=null){f.time=d}var e=new KJUR.asn1.x509.CRLEntry(f);this.aRevokedCert.push(e)};this.getEncodedHex=function(){this.asn1Array=new Array();if(this.asn1Version!=null){this.asn1Array.push(this.asn1Version)}this.asn1Array.push(this.asn1SignatureAlg);this.asn1Array.push(this.asn1Issuer);this.asn1Array.push(this.asn1ThisUpdate);if(this.asn1NextUpdate!=null){this.asn1Array.push(this.asn1NextUpdate)}if(this.aRevokedCert.length>0){var c=new KJUR.asn1.DERSequence({array:this.aRevokedCert});this.asn1Array.push(c)}var d=new KJUR.asn1.DERSequence({array:this.asn1Array});this.hTLV=d.getEncodedHex();this.isModified=false;return this.hTLV};this._initialize=function(){this.asn1Version=null;this.asn1SignatureAlg=null;this.asn1Issuer=null;this.asn1ThisUpdate=null;this.asn1NextUpdate=null;this.aRevokedCert=new Array()};this._initialize()};YAHOO.lang.extend(KJUR.asn1.x509.TBSCertList,KJUR.asn1.ASN1Object);KJUR.asn1.x509.CRLEntry=function(c){KJUR.asn1.x509.CRLEntry.superclass.constructor.call(this);var b=null;var a=null;this.setCertSerial=function(d){this.sn=new KJUR.asn1.DERInteger(d)};this.setRevocationDate=function(d){this.time=new KJUR.asn1.x509.Time(d)};this.getEncodedHex=function(){var d=new KJUR.asn1.DERSequence({array:[this.sn,this.time]});this.TLV=d.getEncodedHex();return this.TLV};if(typeof c!="undefined"){if(typeof c.time!="undefined"){this.setRevocationDate(c.time)}if(typeof c.sn!="undefined"){this.setCertSerial(c.sn)}}};YAHOO.lang.extend(KJUR.asn1.x509.CRLEntry,KJUR.asn1.ASN1Object);KJUR.asn1.x509.X500Name=function(b){KJUR.asn1.x509.X500Name.superclass.constructor.call(this);this.asn1Array=new Array();this.setByString=function(c){var d=c.split("/");d.shift();for(var e=0;e<d.length;e++){this.asn1Array.push(new KJUR.asn1.x509.RDN({str:d[e]}))}};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var c=new KJUR.asn1.DERSequence({array:this.asn1Array});this.hTLV=c.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(typeof b.str!="undefined"){this.setByString(b.str)}if(typeof b.certissuer!="undefined"){var a=new X509();a.hex=X509.pemToHex(b.certissuer);this.hTLV=a.getIssuerHex()}if(typeof b.certsubject!="undefined"){var a=new X509();a.hex=X509.pemToHex(b.certsubject);this.hTLV=a.getSubjectHex()}}};YAHOO.lang.extend(KJUR.asn1.x509.X500Name,KJUR.asn1.ASN1Object);KJUR.asn1.x509.RDN=function(a){KJUR.asn1.x509.RDN.superclass.constructor.call(this);this.asn1Array=new Array();this.addByString=function(b){this.asn1Array.push(new KJUR.asn1.x509.AttributeTypeAndValue({str:b}))};this.getEncodedHex=function(){var b=new KJUR.asn1.DERSet({array:this.asn1Array});this.TLV=b.getEncodedHex();return this.TLV};if(typeof a!="undefined"){if(typeof a.str!="undefined"){this.addByString(a.str)}}};YAHOO.lang.extend(KJUR.asn1.x509.RDN,KJUR.asn1.ASN1Object);KJUR.asn1.x509.AttributeTypeAndValue=function(b){KJUR.asn1.x509.AttributeTypeAndValue.superclass.constructor.call(this);var d=null;var c=null;var a="utf8";this.setByString=function(e){if(e.match(/^([^=]+)=(.+)$/)){this.setByAttrTypeAndValueStr(RegExp.$1,RegExp.$2)}else{throw"malformed attrTypeAndValueStr: "+e}};this.setByAttrTypeAndValueStr=function(g,f){this.typeObj=KJUR.asn1.x509.OID.atype2obj(g);var e=a;if(g=="C"){e="prn"}this.valueObj=this.getValueObj(e,f)};this.getValueObj=function(f,e){if(f=="utf8"){return new KJUR.asn1.DERUTF8String({str:e})}if(f=="prn"){return new KJUR.asn1.DERPrintableString({str:e})}if(f=="tel"){return new KJUR.asn1.DERTeletexString({str:e})}if(f=="ia5"){return new KJUR.asn1.DERIA5String({str:e})}throw"unsupported directory string type: type="+f+" value="+e};this.getEncodedHex=function(){var e=new KJUR.asn1.DERSequence({array:[this.typeObj,this.valueObj]});this.TLV=e.getEncodedHex();return this.TLV};if(typeof b!="undefined"){if(typeof b.str!="undefined"){this.setByString(b.str)}}};YAHOO.lang.extend(KJUR.asn1.x509.AttributeTypeAndValue,KJUR.asn1.ASN1Object);KJUR.asn1.x509.SubjectPublicKeyInfo=function(d){KJUR.asn1.x509.SubjectPublicKeyInfo.superclass.constructor.call(this);var b=null;var c=null;var a=null;this.setRSAKey=function(e){if(!RSAKey.prototype.isPrototypeOf(e)){throw"argument is not RSAKey instance"}this.rsaKey=e;var g=new KJUR.asn1.DERInteger({bigint:e.n});var f=new KJUR.asn1.DERInteger({"int":e.e});var i=new KJUR.asn1.DERSequence({array:[g,f]});var h=i.getEncodedHex();this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"rsaEncryption"});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+h})};this.setRSAPEM=function(g){if(g.match(/-----BEGIN PUBLIC KEY-----/)){var n=g;n=n.replace(/^-----[^-]+-----/,"");n=n.replace(/-----[^-]+-----\s*$/,"");var m=n.replace(/\s+/g,"");var f=CryptoJS.enc.Base64.parse(m);var i=CryptoJS.enc.Hex.stringify(f);var k=_rsapem_getHexValueArrayOfChildrenFromHex(i);var h=k[1];var l=h.substr(2);var e=_rsapem_getHexValueArrayOfChildrenFromHex(l);var j=new RSAKey();j.setPublic(e[0],e[1]);this.setRSAKey(j)}else{throw"key not supported"}};this.getASN1Object=function(){if(this.asn1AlgId==null||this.asn1SubjPKey==null){throw"algId and/or subjPubKey not set"}var e=new KJUR.asn1.DERSequence({array:[this.asn1AlgId,this.asn1SubjPKey]});return e};this.getEncodedHex=function(){var e=this.getASN1Object();this.hTLV=e.getEncodedHex();return this.hTLV};this._setRSAKey=function(e){var g=KJUR.asn1.ASN1Util.newObject({seq:[{"int":{bigint:e.n}},{"int":{"int":e.e}}]});var f=g.getEncodedHex();this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"rsaEncryption"});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+f})};this._setEC=function(e){var f=new KJUR.asn1.DERObjectIdentifier({name:e.curveName});this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"ecPublicKey",asn1params:f});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+e.pubKeyHex})};this._setDSA=function(e){var f=new KJUR.asn1.ASN1Util.newObject({seq:[{"int":{bigint:e.p}},{"int":{bigint:e.q}},{"int":{bigint:e.g}}]});this.asn1AlgId=new KJUR.asn1.x509.AlgorithmIdentifier({name:"dsa",asn1params:f});var g=new KJUR.asn1.DERInteger({bigint:e.y});this.asn1SubjPKey=new KJUR.asn1.DERBitString({hex:"00"+g.getEncodedHex()})};if(typeof d!="undefined"){if(typeof RSAKey!="undefined"&&d instanceof RSAKey){this._setRSAKey(d)}else{if(typeof KJUR.crypto.ECDSA!="undefined"&&d instanceof KJUR.crypto.ECDSA){this._setEC(d)}else{if(typeof KJUR.crypto.DSA!="undefined"&&d instanceof KJUR.crypto.DSA){this._setDSA(d)}else{if(typeof d.rsakey!="undefined"){this.setRSAKey(d.rsakey)}else{if(typeof d.rsapem!="undefined"){this.setRSAPEM(d.rsapem)}}}}}}};YAHOO.lang.extend(KJUR.asn1.x509.SubjectPublicKeyInfo,KJUR.asn1.ASN1Object);KJUR.asn1.x509.Time=function(c){KJUR.asn1.x509.Time.superclass.constructor.call(this);var b=null;var a=null;this.setTimeParams=function(d){this.timeParams=d};this.getEncodedHex=function(){var d=null;if(this.timeParams!=null){if(this.type=="utc"){d=new KJUR.asn1.DERUTCTime(this.timeParams)}else{d=new KJUR.asn1.DERGeneralizedTime(this.timeParams)}}else{if(this.type=="utc"){d=new KJUR.asn1.DERUTCTime()}else{d=new KJUR.asn1.DERGeneralizedTime()}}this.TLV=d.getEncodedHex();return this.TLV};this.type="utc";if(typeof c!="undefined"){if(typeof c.type!="undefined"){this.type=c.type}else{if(typeof c.str!="undefined"){if(c.str.match(/^[0-9]{12}Z$/)){this.type="utc"}if(c.str.match(/^[0-9]{14}Z$/)){this.type="gen"}}}this.timeParams=c}};YAHOO.lang.extend(KJUR.asn1.x509.Time,KJUR.asn1.ASN1Object);KJUR.asn1.x509.AlgorithmIdentifier=function(e){KJUR.asn1.x509.AlgorithmIdentifier.superclass.constructor.call(this);var a=null;var d=null;var b=null;var c=false;this.getEncodedHex=function(){if(this.nameAlg==null&&this.asn1Alg==null){throw"algorithm not specified"}if(this.nameAlg!=null&&this.asn1Alg==null){this.asn1Alg=KJUR.asn1.x509.OID.name2obj(this.nameAlg)}var f=[this.asn1Alg];if(!this.paramEmpty){f.push(this.asn1Params)}var g=new KJUR.asn1.DERSequence({array:f});this.hTLV=g.getEncodedHex();return this.hTLV};if(typeof e!="undefined"){if(typeof e.name!="undefined"){this.nameAlg=e.name}if(typeof e.asn1params!="undefined"){this.asn1Params=e.asn1params}if(typeof e.paramempty!="undefined"){this.paramEmpty=e.paramempty}}if(this.asn1Params==null){this.asn1Params=new KJUR.asn1.DERNull()}};YAHOO.lang.extend(KJUR.asn1.x509.AlgorithmIdentifier,KJUR.asn1.ASN1Object);KJUR.asn1.x509.GeneralName=function(d){KJUR.asn1.x509.GeneralName.superclass.constructor.call(this);var c=null;var b=null;var a={rfc822:"81",dns:"82",uri:"86"};this.setByParam=function(g){var f=null;var e=null;if(typeof g.rfc822!="undefined"){this.type="rfc822";e=new KJUR.asn1.DERIA5String({str:g[this.type]})}if(typeof g.dns!="undefined"){this.type="dns";e=new KJUR.asn1.DERIA5String({str:g[this.type]})}if(typeof g.uri!="undefined"){this.type="uri";e=new KJUR.asn1.DERIA5String({str:g[this.type]})}if(this.type==null){throw"unsupported type in params="+g}this.asn1Obj=new KJUR.asn1.DERTaggedObject({explicit:false,tag:a[this.type],obj:e})};this.getEncodedHex=function(){return this.asn1Obj.getEncodedHex()};if(typeof d!="undefined"){this.setByParam(d)}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.GeneralNames=function(b){KJUR.asn1.x509.GeneralNames.superclass.constructor.call(this);var a=null;this.setByParamArray=function(e){for(var c=0;c<e.length;c++){var d=new KJUR.asn1.x509.GeneralName(e[c]);this.asn1Array.push(d)}};this.getEncodedHex=function(){var c=new KJUR.asn1.DERSequence({array:this.asn1Array});return c.getEncodedHex()};this.asn1Array=new Array();if(typeof b!="undefined"){this.setByParamArray(b)}};YAHOO.lang.extend(KJUR.asn1.x509.GeneralNames,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPointName=function(b){KJUR.asn1.x509.DistributionPointName.superclass.constructor.call(this);var e=null;var c=null;var a=null;var d=null;this.getEncodedHex=function(){if(this.type!="full"){throw"currently type shall be 'full': "+this.type}this.asn1Obj=new KJUR.asn1.DERTaggedObject({explicit:false,tag:this.tag,obj:this.asn1V});this.hTLV=this.asn1Obj.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(KJUR.asn1.x509.GeneralNames.prototype.isPrototypeOf(b)){this.type="full";this.tag="a0";this.asn1V=b}else{throw"This class supports GeneralNames only as argument"}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPointName,KJUR.asn1.ASN1Object);KJUR.asn1.x509.DistributionPoint=function(b){KJUR.asn1.x509.DistributionPoint.superclass.constructor.call(this);var a=null;this.getEncodedHex=function(){var c=new KJUR.asn1.DERSequence();if(this.asn1DP!=null){var d=new KJUR.asn1.DERTaggedObject({explicit:true,tag:"a0",obj:this.asn1DP});c.appendASN1Object(d)}this.hTLV=c.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(typeof b.dpobj!="undefined"){this.asn1DP=b.dpobj}}};YAHOO.lang.extend(KJUR.asn1.x509.DistributionPoint,KJUR.asn1.ASN1Object);KJUR.asn1.x509.OID=new function(a){this.atype2oidList={C:"2.5.4.6",O:"2.5.4.10",OU:"2.5.4.11",ST:"2.5.4.8",L:"2.5.4.7",CN:"2.5.4.3",DN:"2.5.4.49",DC:"0.9.2342.19200300.100.1.25",};this.name2oidList={sha1:"1.3.14.3.2.26",sha256:"2.16.840.1.101.3.4.2.1",sha384:"2.16.840.1.101.3.4.2.2",sha512:"2.16.840.1.101.3.4.2.3",sha224:"2.16.840.1.101.3.4.2.4",md5:"1.2.840.113549.2.5",md2:"1.3.14.7.2.2.1",ripemd160:"1.3.36.3.2.1",MD2withRSA:"1.2.840.113549.1.1.2",MD4withRSA:"1.2.840.113549.1.1.3",MD5withRSA:"1.2.840.113549.1.1.4",SHA1withRSA:"1.2.840.113549.1.1.5",SHA224withRSA:"1.2.840.113549.1.1.14",SHA256withRSA:"1.2.840.113549.1.1.11",SHA384withRSA:"1.2.840.113549.1.1.12",SHA512withRSA:"1.2.840.113549.1.1.13",SHA1withECDSA:"1.2.840.10045.4.1",SHA224withECDSA:"1.2.840.10045.4.3.1",SHA256withECDSA:"1.2.840.10045.4.3.2",SHA384withECDSA:"1.2.840.10045.4.3.3",SHA512withECDSA:"1.2.840.10045.4.3.4",dsa:"1.2.840.10040.4.1",SHA1withDSA:"1.2.840.10040.4.3",SHA224withDSA:"2.16.840.1.101.3.4.3.1",SHA256withDSA:"2.16.840.1.101.3.4.3.2",rsaEncryption:"1.2.840.113549.1.1.1",subjectKeyIdentifier:"2.5.29.14",countryName:"2.5.4.6",organization:"2.5.4.10",organizationalUnit:"2.5.4.11",stateOrProvinceName:"2.5.4.8",locality:"2.5.4.7",commonName:"2.5.4.3",keyUsage:"2.5.29.15",basicConstraints:"2.5.29.19",cRLDistributionPoints:"2.5.29.31",certificatePolicies:"2.5.29.32",authorityKeyIdentifier:"2.5.29.35",extKeyUsage:"2.5.29.37",anyExtendedKeyUsage:"2.5.29.37.0",serverAuth:"1.3.6.1.5.5.7.3.1",clientAuth:"1.3.6.1.5.5.7.3.2",codeSigning:"1.3.6.1.5.5.7.3.3",emailProtection:"1.3.6.1.5.5.7.3.4",timeStamping:"1.3.6.1.5.5.7.3.8",ocspSigning:"1.3.6.1.5.5.7.3.9",ecPublicKey:"1.2.840.10045.2.1",secp256r1:"1.2.840.10045.3.1.7",secp256k1:"1.3.132.0.10",secp384r1:"1.3.132.0.34",pkcs5PBES2:"1.2.840.113549.1.5.13",pkcs5PBKDF2:"1.2.840.113549.1.5.12","des-EDE3-CBC":"1.2.840.113549.3.7",data:"1.2.840.113549.1.7.1","signed-data":"1.2.840.113549.1.7.2","enveloped-data":"1.2.840.113549.1.7.3","digested-data":"1.2.840.113549.1.7.5","encrypted-data":"1.2.840.113549.1.7.6","authenticated-data":"1.2.840.113549.1.9.16.1.2",tstinfo:"1.2.840.113549.1.9.16.1.4",};this.objCache={};this.name2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.name2oidList[b]=="undefined"){throw"Name of ObjectIdentifier not defined: "+b}var c=this.name2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d};this.atype2obj=function(b){if(typeof this.objCache[b]!="undefined"){return this.objCache[b]}if(typeof this.atype2oidList[b]=="undefined"){throw"AttributeType name undefined: "+b}var c=this.atype2oidList[b];var d=new KJUR.asn1.DERObjectIdentifier({oid:c});this.objCache[b]=d;return d}};KJUR.asn1.x509.OID.oid2name=function(b){var c=KJUR.asn1.x509.OID.name2oidList;for(var a in c){if(c[a]==b){return a}}return""};KJUR.asn1.x509.X509Util=new function(){this.getPKCS8PubKeyPEMfromRSAKey=function(i){var h=null;var f=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(i.n);var j=KJUR.asn1.ASN1Util.integerToByteHex(i.e);var a=new KJUR.asn1.DERInteger({hex:f});var g=new KJUR.asn1.DERInteger({hex:j});var l=new KJUR.asn1.DERSequence({array:[a,g]});var c=l.getEncodedHex();var d=new KJUR.asn1.x509.AlgorithmIdentifier({name:"rsaEncryption"});var b=new KJUR.asn1.DERBitString({hex:"00"+c});var k=new KJUR.asn1.DERSequence({array:[d,b]});var e=k.getEncodedHex();var h=KJUR.asn1.ASN1Util.getPEMStringFromHex(e,"PUBLIC KEY");return h}};KJUR.asn1.x509.X509Util.newCertPEM=function(f){var c=KJUR.asn1.x509;var e=new c.TBSCertificate();if(f.serial!==undefined){e.setSerialNumberByParam(f.serial)}else{throw"serial number undefined."}if(typeof f.sigalg.name=="string"){e.setSignatureAlgByParam(f.sigalg)}else{throw"unproper signature algorithm name"}if(f.issuer!==undefined){e.setIssuerByParam(f.issuer)}else{throw"issuer name undefined."}if(f.notbefore!==undefined){e.setNotBeforeByParam(f.notbefore)}else{throw"notbefore undefined."}if(f.notafter!==undefined){e.setNotAfterByParam(f.notafter)}else{throw"notafter undefined."}if(f.subject!==undefined){e.setSubjectByParam(f.subject)}else{throw"subject name undefined."}if(f.sbjpubkey!==undefined){e.setSubjectPublicKeyByGetKey(f.sbjpubkey)}else{throw"subject public key undefined."}if(f.ext!==undefined&&f.ext.length!==undefined){for(var b=0;b<f.ext.length;b++){for(key in f.ext[b]){e.appendExtensionByName(key,f.ext[b][key])}}}if(f.cakey===undefined&&f.sighex===undefined){throw"param cakey and sighex undefined."}var d=null;var a=null;if(f.cakey){d=KEYUTIL.getKey.apply(null,f.cakey);a=new c.Certificate({tbscertobj:e,prvkeyobj:d});a.sign()}if(f.sighex){a=new c.Certificate({tbscertobj:e});a.setSignatureHex(f.sighex)}return a.getPEMString()};
/*! asn1cms-1.0.2.js (c) 2013-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.cms=="undefined"||!KJUR.asn1.cms){KJUR.asn1.cms={}}KJUR.asn1.cms.Attribute=function(b){KJUR.asn1.cms.Attribute.superclass.constructor.call(this);var a=[];this.getEncodedHex=function(){var f,e,c;f=new KJUR.asn1.DERObjectIdentifier({oid:this.attrTypeOid});e=new KJUR.asn1.DERSet({array:this.valueList});try{e.getEncodedHex()}catch(d){throw"fail valueSet.getEncodedHex in Attribute(1)/"+d}c=new KJUR.asn1.DERSequence({array:[f,e]});try{this.hTLV=c.getEncodedHex()}catch(d){throw"failed seq.getEncodedHex in Attribute(2)/"+d}return this.hTLV}};YAHOO.lang.extend(KJUR.asn1.cms.Attribute,KJUR.asn1.ASN1Object);KJUR.asn1.cms.ContentType=function(b){KJUR.asn1.cms.ContentType.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.3";var a=null;if(typeof b!="undefined"){var a=new KJUR.asn1.DERObjectIdentifier(b);this.valueList=[a]}};YAHOO.lang.extend(KJUR.asn1.cms.ContentType,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.MessageDigest=function(e){KJUR.asn1.cms.MessageDigest.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.4";if(typeof e!="undefined"){if(e.eciObj instanceof KJUR.asn1.cms.EncapsulatedContentInfo&&typeof e.hashAlg=="string"){var b=e.eciObj.eContentValueHex;var a=e.hashAlg;var c=KJUR.crypto.Util.hashHex(b,a);var d=new KJUR.asn1.DEROctetString({hex:c});d.getEncodedHex();this.valueList=[d]}else{var d=new KJUR.asn1.DEROctetString(e);d.getEncodedHex();this.valueList=[d]}}};YAHOO.lang.extend(KJUR.asn1.cms.MessageDigest,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningTime=function(c){KJUR.asn1.cms.SigningTime.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.5";if(typeof c!="undefined"){var a=new KJUR.asn1.x509.Time(c);try{a.getEncodedHex()}catch(b){throw"SigningTime.getEncodedHex() failed/"+b}this.valueList=[a]}};YAHOO.lang.extend(KJUR.asn1.cms.SigningTime,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningCertificate=function(d){KJUR.asn1.cms.SigningCertificate.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.12";var a=KJUR.asn1;var c=KJUR.asn1.cms;var b=KJUR.crypto;this.setCerts=function(l){var j=[];for(var h=0;h<l.length;h++){var f=KEYUTIL.getHexFromPEM(l[h]);var e=b.Util.hashHex(f,"sha1");var m=new a.DEROctetString({hex:e});m.getEncodedHex();var k=new c.IssuerAndSerialNumber({cert:l[h]});k.getEncodedHex();var n=new a.DERSequence({array:[m,k]});n.getEncodedHex();j.push(n)}var g=new a.DERSequence({array:j});g.getEncodedHex();this.valueList=[g]};if(typeof d!="undefined"){if(typeof d.array=="object"){this.setCerts(d.array)}}};YAHOO.lang.extend(KJUR.asn1.cms.SigningCertificate,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.SigningCertificateV2=function(e){KJUR.asn1.cms.SigningCertificateV2.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.47";var b=KJUR.asn1;var f=KJUR.asn1.x509;var d=KJUR.asn1.cms;var c=KJUR.crypto;this.setCerts=function(p,h){var n=[];for(var l=0;l<p.length;l++){var j=KEYUTIL.getHexFromPEM(p[l]);var r=[];if(h!="sha256"){r.push(new f.AlgorithmIdentifier({name:h}))}var g=c.Util.hashHex(j,h);var q=new b.DEROctetString({hex:g});q.getEncodedHex();r.push(q);var m=new d.IssuerAndSerialNumber({cert:p[l]});m.getEncodedHex();r.push(m);var o=new b.DERSequence({array:r});o.getEncodedHex();n.push(o)}var k=new b.DERSequence({array:n});k.getEncodedHex();this.valueList=[k]};if(typeof e!="undefined"){if(typeof e.array=="object"){var a="sha256";if(typeof e.hashAlg=="string"){a=e.hashAlg}this.setCerts(e.array,a)}}};YAHOO.lang.extend(KJUR.asn1.cms.SigningCertificateV2,KJUR.asn1.cms.Attribute);KJUR.asn1.cms.IssuerAndSerialNumber=function(c){KJUR.asn1.cms.IssuerAndSerialNumber.superclass.constructor.call(this);var e=null;var b=null;var a=KJUR.asn1;var d=a.x509;this.setByCertPEM=function(i){var g=KEYUTIL.getHexFromPEM(i);var f=new X509();f.hex=g;var j=f.getIssuerHex();this.dIssuer=new d.X500Name();this.dIssuer.hTLV=j;var h=f.getSerialNumberHex();this.dSerial=new a.DERInteger({hex:h})};this.getEncodedHex=function(){var f=new KJUR.asn1.DERSequence({array:[this.dIssuer,this.dSerial]});this.hTLV=f.getEncodedHex();return this.hTLV};if(typeof c!="undefined"){if(typeof c=="string"&&c.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(c)}if(c.issuer&&c.serial){if(c.issuer instanceof KJUR.asn1.x509.X500Name){this.dIssuer=c.issuer}else{this.dIssuer=new KJUR.asn1.x509.X500Name(c.issuer)}if(c.serial instanceof KJUR.asn1.DERInteger){this.dSerial=c.serial}else{this.dSerial=new KJUR.asn1.DERInteger(c.serial)}}if(typeof c.cert=="string"){this.setByCertPEM(c.cert)}}};YAHOO.lang.extend(KJUR.asn1.cms.IssuerAndSerialNumber,KJUR.asn1.ASN1Object);KJUR.asn1.cms.AttributeList=function(a){KJUR.asn1.cms.AttributeList.superclass.constructor.call(this);this.list=new Array();this.sortFlag=true;this.add=function(b){if(b instanceof KJUR.asn1.cms.Attribute){this.list.push(b)}};this.length=function(){return this.list.length};this.clear=function(){this.list=new Array();this.hTLV=null;this.hV=null};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var b=new KJUR.asn1.DERSet({array:this.list,sortflag:this.sortFlag});this.hTLV=b.getEncodedHex();return this.hTLV};if(typeof a!="undefined"){if(typeof a.sortflag!="undefined"&&a.sortflag==false){this.sortFlag=false}}};YAHOO.lang.extend(KJUR.asn1.cms.AttributeList,KJUR.asn1.ASN1Object);KJUR.asn1.cms.SignerInfo=function(c){KJUR.asn1.cms.SignerInfo.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.cms;var d=KJUR.asn1.x509;this.dCMSVersion=new a.DERInteger({"int":1});this.dSignerIdentifier=null;this.dDigestAlgorithm=null;this.dSignedAttrs=new b.AttributeList();this.dSigAlg=null;this.dSig=null;this.dUnsignedAttrs=new b.AttributeList();this.setSignerIdentifier=function(f){if(typeof f=="string"&&f.indexOf("CERTIFICATE")!=-1&&f.indexOf("BEGIN")!=-1&&f.indexOf("END")!=-1){var e=f;this.dSignerIdentifier=new b.IssuerAndSerialNumber({cert:f})}};this.setForContentAndHash=function(e){if(typeof e!="undefined"){if(e.eciObj instanceof KJUR.asn1.cms.EncapsulatedContentInfo){this.dSignedAttrs.add(new b.ContentType({oid:"1.2.840.113549.1.7.1"}));this.dSignedAttrs.add(new b.MessageDigest({eciObj:e.eciObj,hashAlg:e.hashAlg}))}if(typeof e.sdObj!="undefined"&&e.sdObj instanceof KJUR.asn1.cms.SignedData){if(e.sdObj.digestAlgNameList.join(":").indexOf(e.hashAlg)==-1){e.sdObj.digestAlgNameList.push(e.hashAlg)}}if(typeof e.hashAlg=="string"){this.dDigestAlgorithm=new d.AlgorithmIdentifier({name:e.hashAlg})}}};this.sign=function(j,f){this.dSigAlg=new d.AlgorithmIdentifier({name:f});var g=this.dSignedAttrs.getEncodedHex();var e=KEYUTIL.getKey(j);var i=new KJUR.crypto.Signature({alg:f});i.init(e);i.updateHex(g);var h=i.sign();this.dSig=new a.DEROctetString({hex:h})};this.addUnsigned=function(e){this.hTLV=null;this.dUnsignedAttrs.hTLV=null;this.dUnsignedAttrs.add(e)};this.getEncodedHex=function(){if(this.dSignedAttrs instanceof KJUR.asn1.cms.AttributeList&&this.dSignedAttrs.length()==0){throw"SignedAttrs length = 0 (empty)"}var e=new a.DERTaggedObject({obj:this.dSignedAttrs,tag:"a0",explicit:false});var h=null;if(this.dUnsignedAttrs.length()>0){h=new a.DERTaggedObject({obj:this.dUnsignedAttrs,tag:"a1",explicit:false})}var g=[this.dCMSVersion,this.dSignerIdentifier,this.dDigestAlgorithm,e,this.dSigAlg,this.dSig,];if(h!=null){g.push(h)}var f=new a.DERSequence({array:g});this.hTLV=f.getEncodedHex();return this.hTLV}};YAHOO.lang.extend(KJUR.asn1.cms.SignerInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.EncapsulatedContentInfo=function(c){KJUR.asn1.cms.EncapsulatedContentInfo.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.cms;var d=KJUR.asn1.x509;this.dEContentType=new a.DERObjectIdentifier({name:"data"});this.dEContent=null;this.isDetached=false;this.eContentValueHex=null;this.setContentType=function(e){if(e.match(/^[0-2][.][0-9.]+$/)){this.dEContentType=new a.DERObjectIdentifier({oid:e})}else{this.dEContentType=new a.DERObjectIdentifier({name:e})}};this.setContentValue=function(e){if(typeof e!="undefined"){if(typeof e.hex=="string"){this.eContentValueHex=e.hex}else{if(typeof e.str=="string"){this.eContentValueHex=utf8tohex(e.str)}}}};this.setContentValueHex=function(e){this.eContentValueHex=e};this.setContentValueStr=function(e){this.eContentValueHex=utf8tohex(e)};this.getEncodedHex=function(){if(typeof this.eContentValueHex!="string"){throw"eContentValue not yet set"}var g=new a.DEROctetString({hex:this.eContentValueHex});this.dEContent=new a.DERTaggedObject({obj:g,tag:"a0",explicit:true});var e=[this.dEContentType];if(!this.isDetached){e.push(this.dEContent)}var f=new a.DERSequence({array:e});this.hTLV=f.getEncodedHex();return this.hTLV}};YAHOO.lang.extend(KJUR.asn1.cms.EncapsulatedContentInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.ContentInfo=function(c){KJUR.asn1.cms.ContentInfo.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.cms;var d=KJUR.asn1.x509;this.dContentType=null;this.dContent=null;this.setContentType=function(e){if(typeof e=="string"){this.dContentType=d.OID.name2obj(e)}};this.getEncodedHex=function(){var f=new a.DERTaggedObject({obj:this.dContent,tag:"a0",explicit:true});var e=new a.DERSequence({array:[this.dContentType,f]});this.hTLV=e.getEncodedHex();return this.hTLV};if(typeof c!="undefined"){if(c.type){this.setContentType(c.type)}if(c.obj&&c.obj instanceof a.ASN1Object){this.dContent=c.obj}}};YAHOO.lang.extend(KJUR.asn1.cms.ContentInfo,KJUR.asn1.ASN1Object);KJUR.asn1.cms.SignedData=function(c){KJUR.asn1.cms.SignedData.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.cms;var d=KJUR.asn1.x509;this.dCMSVersion=new a.DERInteger({"int":1});this.dDigestAlgs=null;this.digestAlgNameList=[];this.dEncapContentInfo=new b.EncapsulatedContentInfo();this.dCerts=null;this.certificateList=[];this.crlList=[];this.signerInfoList=[new b.SignerInfo()];this.addCertificatesByPEM=function(e){var f=KEYUTIL.getHexFromPEM(e);var g=new a.ASN1Object();g.hTLV=f;this.certificateList.push(g)};this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}if(this.dDigestAlgs==null){var k=[];for(var j=0;j<this.digestAlgNameList.length;j++){var h=this.digestAlgNameList[j];var m=new d.AlgorithmIdentifier({name:h});k.push(m)}this.dDigestAlgs=new a.DERSet({array:k})}var e=[this.dCMSVersion,this.dDigestAlgs,this.dEncapContentInfo];if(this.dCerts==null){if(this.certificateList.length>0){var l=new a.DERSet({array:this.certificateList});this.dCerts=new a.DERTaggedObject({obj:l,tag:"a0",explicit:false})}}if(this.dCerts!=null){e.push(this.dCerts)}var g=new a.DERSet({array:this.signerInfoList});e.push(g);var f=new a.DERSequence({array:e});this.hTLV=f.getEncodedHex();return this.hTLV};this.getContentInfo=function(){this.getEncodedHex();var e=new b.ContentInfo({type:"signed-data",obj:this});return e};this.getContentInfoEncodedHex=function(){var e=this.getContentInfo();var f=e.getEncodedHex();return f};this.getPEM=function(){var e=this.getContentInfoEncodedHex();var f=a.ASN1Util.getPEMStringFromHex(e,"CMS");return f}};YAHOO.lang.extend(KJUR.asn1.cms.SignedData,KJUR.asn1.ASN1Object);KJUR.asn1.cms.CMSUtil=new function(){};KJUR.asn1.cms.CMSUtil.newSignedData=function(a){var h=KJUR.asn1.cms;var g=KJUR.asn1.cades;var f=new h.SignedData();f.dEncapContentInfo.setContentValue(a.content);if(typeof a.certs=="object"){for(var b=0;b<a.certs.length;b++){f.addCertificatesByPEM(a.certs[b])}}f.signerInfoList=[];for(var b=0;b<a.signerInfos.length;b++){var d=a.signerInfos[b];var c=new h.SignerInfo();c.setSignerIdentifier(d.signerCert);c.setForContentAndHash({sdObj:f,eciObj:f.dEncapContentInfo,hashAlg:d.hashAlg});for(attrName in d.sAttr){var j=d.sAttr[attrName];if(attrName=="SigningTime"){var e=new h.SigningTime(j);c.dSignedAttrs.add(e)}if(attrName=="SigningCertificate"){var e=new h.SigningCertificate(j);c.dSignedAttrs.add(e)}if(attrName=="SigningCertificateV2"){var e=new h.SigningCertificateV2(j);c.dSignedAttrs.add(e)}if(attrName=="SignaturePolicyIdentifier"){var e=new g.SignaturePolicyIdentifier(j);c.dSignedAttrs.add(e)}}c.sign(d.signerPrvKey,d.sigAlg);f.signerInfoList.push(c)}return f};
/*! asn1tsp-1.0.1.js (c) 2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.tsp=="undefined"||!KJUR.asn1.tsp){KJUR.asn1.tsp={}}KJUR.asn1.tsp.Accuracy=function(b){KJUR.asn1.tsp.Accuracy.superclass.constructor.call(this);var a=KJUR.asn1;this.seconds=null;this.millis=null;this.micros=null;this.getEncodedHex=function(){var e=null;var g=null;var i=null;var c=[];if(this.seconds!=null){e=new a.DERInteger({"int":this.seconds});c.push(e)}if(this.millis!=null){var h=new a.DERInteger({"int":this.millis});g=new a.DERTaggedObject({obj:h,tag:"80",explicit:false});c.push(g)}if(this.micros!=null){var f=new a.DERInteger({"int":this.micros});i=new a.DERTaggedObject({obj:f,tag:"81",explicit:false});c.push(i)}var d=new a.DERSequence({array:c});this.hTLV=d.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(typeof b.seconds=="number"){this.seconds=b.seconds}if(typeof b.millis=="number"){this.millis=b.millis}if(typeof b.micros=="number"){this.micros=b.micros}}};YAHOO.lang.extend(KJUR.asn1.tsp.Accuracy,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.MessageImprint=function(b){KJUR.asn1.tsp.MessageImprint.superclass.constructor.call(this);var a=KJUR.asn1;var c=KJUR.asn1.x509;this.dHashAlg=null;this.dHashValue=null;this.getEncodedHex=function(){if(typeof this.hTLV=="string"){return this.hTLV}var d=new a.DERSequence({array:[this.dHashAlg,this.dHashValue]});return d.getEncodedHex()};if(typeof b!="undefined"){if(typeof b.hashAlg=="string"){this.dHashAlg=new c.AlgorithmIdentifier({name:b.hashAlg})}if(typeof b.hashValue=="string"){this.dHashValue=new a.DEROctetString({hex:b.hashValue})}}};YAHOO.lang.extend(KJUR.asn1.tsp.MessageImprint,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TimeStampReq=function(c){KJUR.asn1.tsp.TimeStampReq.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.tsp;this.dVersion=new a.DERInteger({"int":1});this.dMessageImprint=null;this.dPolicy=null;this.dNonce=null;this.certReq=true;this.setMessageImprint=function(d){if(d instanceof KJUR.asn1.tsp.MessageImprint){this.dMessageImprint=d;return}if(typeof d=="object"){this.dMessageImprint=new b.MessageImprint(d)}};this.getEncodedHex=function(){if(this.dMessageImprint==null){throw"messageImprint shall be specified"}var d=[this.dVersion,this.dMessageImprint];if(this.dPolicy!=null){d.push(this.dPolicy)}if(this.dNonce!=null){d.push(this.dNonce)}if(this.certReq){d.push(new a.DERBoolean())}var e=new a.DERSequence({array:d});this.hTLV=e.getEncodedHex();return this.hTLV};if(typeof c!="undefined"){if(typeof c.mi=="object"){this.setMessageImprint(c.mi)}if(typeof c.policy=="object"){this.dPolicy=new a.DERObjectIdentifier(c.policy)}if(typeof c.nonce=="object"){this.dNonce=new a.DERInteger(c.nonce)}if(typeof c.certreq=="boolean"){this.certReq=c.certreq}}};YAHOO.lang.extend(KJUR.asn1.tsp.TimeStampReq,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TSTInfo=function(c){KJUR.asn1.tsp.TSTInfo.superclass.constructor.call(this);var a=KJUR.asn1;var d=KJUR.asn1.x509;var b=KJUR.asn1.tsp;this.dVersion=new a.DERInteger({"int":1});this.dPolicy=null;this.dMessageImprint=null;this.dSerialNumber=null;this.dGenTime=null;this.dAccuracy=null;this.dOrdering=null;this.dNonce=null;this.dTsa=null;this.getEncodedHex=function(){var e=[this.dVersion];if(this.dPolicy==null){throw"policy shall be specified."}e.push(this.dPolicy);if(this.dMessageImprint==null){throw"messageImprint shall be specified."}e.push(this.dMessageImprint);if(this.dSerialNumber==null){throw"serialNumber shall be specified."}e.push(this.dSerialNumber);if(this.dGenTime==null){throw"genTime shall be specified."}e.push(this.dGenTime);if(this.dAccuracy!=null){e.push(this.dAccuracy)}if(this.dOrdering!=null){e.push(this.dOrdering)}if(this.dNonce!=null){e.push(this.dNonce)}if(this.dTsa!=null){e.push(this.dTsa)}var f=new a.DERSequence({array:e});this.hTLV=f.getEncodedHex();return this.hTLV};if(typeof c!="undefined"){if(typeof c.policy=="string"){if(!c.policy.match(/^[0-9.]+$/)){throw"policy shall be oid like 0.1.4.134"}this.dPolicy=new a.DERObjectIdentifier({oid:c.policy})}if(typeof c.messageImprint!="undefined"){this.dMessageImprint=new b.MessageImprint(c.messageImprint)}if(typeof c.serialNumber!="undefined"){this.dSerialNumber=new a.DERInteger(c.serialNumber)}if(typeof c.genTime!="undefined"){this.dGenTime=new a.DERGeneralizedTime(c.genTime)}if(typeof c.accuracy!="undefind"){this.dAccuracy=new b.Accuracy(c.accuracy)}if(typeof c.ordering!="undefined"&&c.ordering==true){this.dOrdering=new a.DERBoolean()}if(typeof c.nonce!="undefined"){this.dNonce=new a.DERInteger(c.nonce)}if(typeof c.tsa!="undefined"){this.dTsa=new d.X500Name(c.tsa)}}};YAHOO.lang.extend(KJUR.asn1.tsp.TSTInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.TimeStampResp=function(c){KJUR.asn1.tsp.TimeStampResp.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.tsp;this.dStatus=null;this.dTST=null;this.getEncodedHex=function(){if(this.dStatus==null){throw"status shall be specified"}var d=[this.dStatus];if(this.dTST!=null){d.push(this.dTST)}var e=new a.DERSequence({array:d});this.hTLV=e.getEncodedHex();return this.hTLV};if(typeof c!="undefined"){if(typeof c.status=="object"){this.dStatus=new b.PKIStatusInfo(c.status)}if(typeof c.tst!="undefined"&&c.tst instanceof KJUR.asn1.ASN1Object){this.dTST=c.tst.getContentInfo()}}};YAHOO.lang.extend(KJUR.asn1.tsp.TimeStampResp,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatusInfo=function(c){KJUR.asn1.tsp.PKIStatusInfo.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.tsp;this.dStatus=null;this.dStatusString=null;this.dFailureInfo=null;this.getEncodedHex=function(){if(this.dStatus==null){throw"status shall be specified"}var d=[this.dStatus];if(this.dStatusString!=null){d.push(this.dStatusString)}if(this.dFailureInfo!=null){d.push(this.dFailureInfo)}var e=new a.DERSequence({array:d});this.hTLV=e.getEncodedHex();return this.hTLV};if(typeof c!="undefined"){if(typeof c.status=="object"){this.dStatus=new b.PKIStatus(c.status)}if(typeof c.statstr=="object"){this.dStatusString=new b.PKIFreeText({array:c.statstr})}if(typeof c.failinfo=="object"){this.dFailureInfo=new b.PKIFailureInfo(c.failinfo)}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIStatusInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatus=function(e){KJUR.asn1.tsp.PKIStatus.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.tsp;var d=null;this.getEncodedHex=function(){this.hTLV=this.dStatus.getEncodedHex();return this.hTLV};if(typeof e!="undefined"){if(typeof e.name!="undefined"){var c=b.PKIStatus.valueList;if(typeof c[e.name]=="undefined"){throw"name undefined: "+e.name}this.dStatus=new a.DERInteger({"int":c[e.name]})}else{this.dStatus=new a.DERInteger(e)}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIStatus,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIStatus.valueList={granted:0,grantedWithMods:1,rejection:2,waiting:3,revocationWarning:4,revocationNotification:5};KJUR.asn1.tsp.PKIFreeText=function(b){KJUR.asn1.tsp.PKIFreeText.superclass.constructor.call(this);var a=KJUR.asn1;this.textList=[];this.getEncodedHex=function(){var c=[];for(var e=0;e<this.textList.length;e++){c.push(new a.DERUTF8String({str:this.textList[e]}))}var d=new a.DERSequence({array:c});this.hTLV=d.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(typeof b.array=="object"){this.textList=b.array}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIFreeText,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIFailureInfo=function(d){KJUR.asn1.tsp.PKIFailureInfo.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.tsp;this.value=null;this.getEncodedHex=function(){if(this.value==null){throw"value shall be specified"}var e=new Number(this.value).toString(2);var f=new a.DERBitString();f.setByBinaryString(e);this.hTLV=f.getEncodedHex();return this.hTLV};if(typeof d!="undefined"){if(typeof d.name=="string"){var c=b.PKIFailureInfo.valueList;if(typeof c[d.name]=="undefined"){throw"name undefined: "+d.name}this.value=c[d.name]}else{if(typeof d["int"]=="number"){this.value=d["int"]}}}};YAHOO.lang.extend(KJUR.asn1.tsp.PKIFailureInfo,KJUR.asn1.ASN1Object);KJUR.asn1.tsp.PKIFailureInfo.valueList={badAlg:0,badRequest:2,badDataFormat:5,timeNotAvailable:14,unacceptedPolicy:15,unacceptedExtension:16,addInfoNotAvailable:17,systemFailure:25};KJUR.asn1.tsp.AbstractTSAAdapter=function(a){this.getTSTHex=function(c,b){throw"not implemented yet"}};KJUR.asn1.tsp.SimpleTSAAdapter=function(a){KJUR.asn1.tsp.SimpleTSAAdapter.superclass.constructor.call(this);this.params=null;this.serial=0;this.getTSTHex=function(c,b){var e=KJUR.crypto.Util.hashHex(c,b);this.params.tstInfo.messageImprint={hashAlg:b,hashValue:e};this.params.tstInfo.serialNumber={"int":this.serial++};var d=Math.floor(Math.random()*1000000000);this.params.tstInfo.nonce={"int":d};var f=KJUR.asn1.tsp.TSPUtil.newTimeStampToken(this.params);return f.getContentInfoEncodedHex()};if(typeof a!="undefined"){this.params=a}};YAHOO.lang.extend(KJUR.asn1.tsp.SimpleTSAAdapter,KJUR.asn1.tsp.AbstractTSAAdapter);KJUR.asn1.tsp.FixedTSAAdapter=function(a){KJUR.asn1.tsp.FixedTSAAdapter.superclass.constructor.call(this);this.params=null;this.getTSTHex=function(c,b){var d=KJUR.crypto.Util.hashHex(c,b);this.params.tstInfo.messageImprint={hashAlg:b,hashValue:d};var e=KJUR.asn1.tsp.TSPUtil.newTimeStampToken(this.params);return e.getContentInfoEncodedHex()};if(typeof a!="undefined"){this.params=a}};YAHOO.lang.extend(KJUR.asn1.tsp.FixedTSAAdapter,KJUR.asn1.tsp.AbstractTSAAdapter);KJUR.asn1.tsp.TSPUtil=new function(){};KJUR.asn1.tsp.TSPUtil.newTimeStampToken=function(b){var j=KJUR.asn1.cms;var a=KJUR.asn1.tsp;var g=new j.SignedData();var e=new a.TSTInfo(b.tstInfo);var f=e.getEncodedHex();g.dEncapContentInfo.setContentValue({hex:f});g.dEncapContentInfo.setContentType("tstinfo");if(typeof b.certs=="object"){for(var c=0;c<b.certs.length;c++){g.addCertificatesByPEM(b.certs[c])}}var d=g.signerInfoList[0];d.setSignerIdentifier(b.signerCert);d.setForContentAndHash({sdObj:g,eciObj:g.dEncapContentInfo,hashAlg:b.hashAlg});var h=new j.SigningCertificate({array:[b.signerCert]});d.dSignedAttrs.add(h);d.sign(b.signerPrvKey,b.sigAlg);return g};KJUR.asn1.tsp.TSPUtil.parseTimeStampReq=function(d){var f={};f.certreq=false;var h=ASN1HEX.getPosArrayOfChildren_AtObj(d,0);if(h.length<2){throw"TimeStampReq must have at least 2 items"}var c=ASN1HEX.getHexOfTLV_AtObj(d,h[1]);f.mi=KJUR.asn1.tsp.TSPUtil.parseMessageImprint(c);for(var e=2;e<h.length;e++){var b=h[e];var a=d.substr(b,2);if(a=="06"){var g=ASN1HEX.getHexOfV_AtObj(d,b);f.policy=ASN1HEX.hextooidstr(g)}if(a=="02"){f.nonce=ASN1HEX.getHexOfV_AtObj(d,b)}if(a=="01"){f.certreq=true}}return f};KJUR.asn1.tsp.TSPUtil.parseMessageImprint=function(c){var h={};if(c.substr(0,2)!="30"){throw"head of messageImprint hex shall be '30'"}var a=ASN1HEX.getPosArrayOfChildren_AtObj(c,0);var i=ASN1HEX.getDecendantIndexByNthList(c,0,[0,0]);var d=ASN1HEX.getHexOfV_AtObj(c,i);var e=ASN1HEX.hextooidstr(d);var g=KJUR.asn1.x509.OID.oid2name(e);if(g==""){throw"hashAlg name undefined: "+e}var b=g;var f=ASN1HEX.getDecendantIndexByNthList(c,0,[1]);h.hashAlg=b;h.hashValue=ASN1HEX.getHexOfV_AtObj(c,f);return h};
/*! asn1cades-1.0.0.js (c) 2013-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.asn1=="undefined"||!KJUR.asn1){KJUR.asn1={}}if(typeof KJUR.asn1.cades=="undefined"||!KJUR.asn1.cades){KJUR.asn1.cades={}}KJUR.asn1.cades.SignaturePolicyIdentifier=function(e){KJUR.asn1.cades.SignaturePolicyIdentifier.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.15";var b=KJUR.asn1;var d=KJUR.asn1.cades;if(typeof e!="undefined"){if(typeof e.oid=="string"&&typeof e.hash=="object"){var f=new b.DERObjectIdentifier({oid:e.oid});var a=new d.OtherHashAlgAndValue(e.hash);var c=new b.DERSequence({array:[f,a]});this.valueList=[c]}}};YAHOO.lang.extend(KJUR.asn1.cades.SignaturePolicyIdentifier,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.OtherHashAlgAndValue=function(b){KJUR.asn1.cades.OtherHashAlgAndValue.superclass.constructor.call(this);var a=KJUR.asn1;var c=KJUR.asn1.x509;this.dAlg=null;this.dHash=null;this.getEncodedHex=function(){var d=new a.DERSequence({array:[this.dAlg,this.dHash]});this.hTLV=d.getEncodedHex();return this.hTLV};if(typeof b!="undefined"){if(typeof b.alg=="string"&&typeof b.hash=="string"){this.dAlg=new c.AlgorithmIdentifier({name:b.alg});this.dHash=new a.DEROctetString({hex:b.hash})}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherHashAlgAndValue,KJUR.asn1.ASN1Object);KJUR.asn1.cades.SignatureTimeStamp=function(c){KJUR.asn1.cades.SignatureTimeStamp.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.14";this.tstHex=null;var a=KJUR.asn1;if(typeof c!="undefined"){if(typeof c.res!="undefined"){if(typeof c.res=="string"&&c.res.match(/^[0-9A-Fa-f]+$/)){}else{if(c.res instanceof KJUR.asn1.ASN1Object){}else{throw"res param shall be ASN1Object or hex string"}}}if(typeof c.tst!="undefined"){if(typeof c.tst=="string"&&c.tst.match(/^[0-9A-Fa-f]+$/)){var b=new a.ASN1Object();this.tstHex=c.tst;b.hTLV=this.tstHex;b.getEncodedHex();this.valueList=[b]}else{if(c.tst instanceof KJUR.asn1.ASN1Object){}else{throw"tst param shall be ASN1Object or hex string"}}}}};YAHOO.lang.extend(KJUR.asn1.cades.SignatureTimeStamp,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.CompleteCertificateRefs=function(c){KJUR.asn1.cades.CompleteCertificateRefs.superclass.constructor.call(this);this.attrTypeOid="1.2.840.113549.1.9.16.2.21";var a=KJUR.asn1;var b=KJUR.asn1.cades;this.setByArray=function(d){this.valueList=[];for(var e=0;e<d.length;e++){var f=new b.OtherCertID(d[e]);this.valueList.push(f)}};if(typeof c!="undefined"){if(typeof c=="object"&&typeof c.length=="number"){this.setByArray(c)}}};YAHOO.lang.extend(KJUR.asn1.cades.CompleteCertificateRefs,KJUR.asn1.cms.Attribute);KJUR.asn1.cades.OtherCertID=function(d){KJUR.asn1.cades.OtherCertID.superclass.constructor.call(this);var a=KJUR.asn1;var c=KJUR.asn1.cms;var b=KJUR.asn1.cades;this.hasIssuerSerial=true;this.dOtherCertHash=null;this.dIssuerSerial=null;this.setByCertPEM=function(e){this.dOtherCertHash=new b.OtherHash(e);if(this.hasIssuerSerial){this.dIssuerSerial=new c.IssuerAndSerialNumber(e)}};this.getEncodedHex=function(){if(this.hTLV!=null){return this.hTLV}if(this.dOtherCertHash==null){throw"otherCertHash not set"}var e=[this.dOtherCertHash];if(this.dIssuerSerial!=null){e.push(this.dIssuerSerial)}var f=new a.DERSequence({array:e});this.hTLV=f.getEncodedHex();return this.hTLV};if(typeof d!="undefined"){if(typeof d=="string"&&d.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(d)}if(typeof d=="object"){if(d.hasis===false){this.hasIssuerSerial=false}if(typeof d.cert=="string"){this.setByCertPEM(d.cert)}}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherCertID,KJUR.asn1.ASN1Object);KJUR.asn1.cades.OtherHash=function(c){KJUR.asn1.cades.OtherHash.superclass.constructor.call(this);var a=KJUR.asn1;var b=KJUR.asn1.cades;this.alg="sha256";this.dOtherHash=null;this.setByCertPEM=function(d){if(d.indexOf("-----BEGIN ")==-1){throw"certPEM not to seem PEM format"}var e=X509.pemToHex(d);var f=KJUR.crypto.Util.hashHex(e,this.alg);this.dOtherHash=new b.OtherHashAlgAndValue({alg:this.alg,hash:f})};this.getEncodedHex=function(){if(this.dOtherHash==null){throw"OtherHash not set"}return this.dOtherHash.getEncodedHex()};if(typeof c!="undefined"){if(typeof c=="string"){if(c.indexOf("-----BEGIN ")!=-1){this.setByCertPEM(c)}else{if(c.match(/^[0-9A-Fa-f]+$/)){this.dOtherHash=new a.DEROctetString({hex:c})}else{throw"unsupported string value for params"}}}else{if(typeof c=="object"){if(typeof c.cert=="string"){if(typeof c.alg=="string"){this.alg=c.alg}this.setByCertPEM(c.cert)}else{this.dOtherHash=new b.OtherHashAlgAndValue(c)}}}}};YAHOO.lang.extend(KJUR.asn1.cades.OtherHash,KJUR.asn1.ASN1Object);KJUR.asn1.cades.CAdESUtil=new function(){};KJUR.asn1.cades.CAdESUtil.addSigTS=function(c,b,a){};KJUR.asn1.cades.CAdESUtil.parseSignedDataForAddingUnsigned=function(d){var q=KJUR.asn1;var p=KJUR.asn1.cms;var c=KJUR.asn1.cades.CAdESUtil;var a={};if(ASN1HEX.getDecendantHexTLVByNthList(d,0,[0])!="06092a864886f70d010702"){throw"hex is not CMS SignedData"}var s=ASN1HEX.getDecendantIndexByNthList(d,0,[1,0]);var b=ASN1HEX.getPosArrayOfChildren_AtObj(d,s);if(b.length<4){throw"num of SignedData elem shall be 4 at least"}var f=b.shift();a.version=ASN1HEX.getHexOfTLV_AtObj(d,f);var l=b.shift();a.algs=ASN1HEX.getHexOfTLV_AtObj(d,l);var m=b.shift();a.encapcontent=ASN1HEX.getHexOfTLV_AtObj(d,m);a.certs=null;a.revs=null;a.si=[];var n=b.shift();if(d.substr(n,2)=="a0"){a.certs=ASN1HEX.getHexOfTLV_AtObj(d,n);n=b.shift()}if(d.substr(n,2)=="a1"){a.revs=ASN1HEX.getHexOfTLV_AtObj(d,n);n=b.shift()}var k=n;if(d.substr(k,2)!="31"){throw"Can't find signerInfos"}var j=ASN1HEX.getPosArrayOfChildren_AtObj(d,k);for(var h=0;h<j.length;h++){var o=j[h];var e=c.parseSignerInfoForAddingUnsigned(d,o,h);a.si[h]=e}var g=null;a.obj=new p.SignedData();g=new q.ASN1Object();g.hTLV=a.version;a.obj.dCMSVersion=g;g=new q.ASN1Object();g.hTLV=a.algs;a.obj.dDigestAlgs=g;g=new q.ASN1Object();g.hTLV=a.encapcontent;a.obj.dEncapContentInfo=g;g=new q.ASN1Object();g.hTLV=a.certs;a.obj.dCerts=g;a.obj.signerInfoList=[];for(var h=0;h<a.si.length;h++){a.obj.signerInfoList.push(a.si[h].obj)}return a};KJUR.asn1.cades.CAdESUtil.parseSignerInfoForAddingUnsigned=function(d,k,a){var m=KJUR.asn1;var l=KJUR.asn1.cms;var b={};var e=ASN1HEX.getPosArrayOfChildren_AtObj(d,k);if(e.length!=6){throw"not supported items for SignerInfo (!=6)"}var f=e.shift();b.version=ASN1HEX.getHexOfTLV_AtObj(d,f);var n=e.shift();b.si=ASN1HEX.getHexOfTLV_AtObj(d,n);var h=e.shift();b.digalg=ASN1HEX.getHexOfTLV_AtObj(d,h);var c=e.shift();b.sattrs=ASN1HEX.getHexOfTLV_AtObj(d,c);var i=e.shift();b.sigalg=ASN1HEX.getHexOfTLV_AtObj(d,i);var j=e.shift();b.sig=ASN1HEX.getHexOfTLV_AtObj(d,j);b.sigval=ASN1HEX.getHexOfV_AtObj(d,j);var g=null;b.obj=new l.SignerInfo();g=new m.ASN1Object();g.hTLV=b.version;b.obj.dCMSVersion=g;g=new m.ASN1Object();g.hTLV=b.si;b.obj.dSignerIdentifier=g;g=new m.ASN1Object();g.hTLV=b.digalg;b.obj.dDigestAlgorithm=g;g=new m.ASN1Object();g.hTLV=b.sattrs;b.obj.dSignedAttrs=g;g=new m.ASN1Object();g.hTLV=b.sigalg;b.obj.dSigAlg=g;g=new m.ASN1Object();g.hTLV=b.sig;b.obj.dSig=g;b.obj.dUnsignedAttrs=new l.AttributeList();return b};
/*! base64x-1.1.3 (c) 2012-2014 Kenji Urushima | kjur.github.com/jsjws/license
 */
function Base64x(){}function stoBA(d){var b=new Array();for(var c=0;c<d.length;c++){b[c]=d.charCodeAt(c)}return b}function BAtos(b){var d="";for(var c=0;c<b.length;c++){d=d+String.fromCharCode(b[c])}return d}function BAtohex(b){var e="";for(var d=0;d<b.length;d++){var c=b[d].toString(16);if(c.length==1){c="0"+c}e=e+c}return e}function stohex(a){return BAtohex(stoBA(a))}function stob64(a){return hex2b64(stohex(a))}function stob64u(a){return b64tob64u(hex2b64(stohex(a)))}function b64utos(a){return BAtos(b64toBA(b64utob64(a)))}function b64tob64u(a){a=a.replace(/\=/g,"");a=a.replace(/\+/g,"-");a=a.replace(/\//g,"_");return a}function b64utob64(a){if(a.length%4==2){a=a+"=="}else{if(a.length%4==3){a=a+"="}}a=a.replace(/-/g,"+");a=a.replace(/_/g,"/");return a}function hextob64u(a){return b64tob64u(hex2b64(a))}function b64utohex(a){return b64tohex(b64utob64(a))}var utf8tob64u,b64utoutf8;if(typeof Buffer==="function"){utf8tob64u=function(a){return b64tob64u(new Buffer(a,"utf8").toString("base64"))};b64utoutf8=function(a){return new Buffer(b64utob64(a),"base64").toString("utf8")}}else{utf8tob64u=function(a){return hextob64u(uricmptohex(encodeURIComponentAll(a)))};b64utoutf8=function(a){return decodeURIComponent(hextouricmp(b64utohex(a)))}}function utf8tob64(a){return hex2b64(uricmptohex(encodeURIComponentAll(a)))}function b64toutf8(a){return decodeURIComponent(hextouricmp(b64tohex(a)))}function utf8tohex(a){return uricmptohex(encodeURIComponentAll(a))}function hextoutf8(a){return decodeURIComponent(hextouricmp(a))}function hextorstr(c){var b="";for(var a=0;a<c.length-1;a+=2){b+=String.fromCharCode(parseInt(c.substr(a,2),16))}return b}function rstrtohex(c){var a="";for(var b=0;b<c.length;b++){a+=("0"+c.charCodeAt(b).toString(16)).slice(-2)}return a}function hextob64(a){return hex2b64(a)}function hextob64nl(b){var a=hextob64(b);var c=a.replace(/(.{64})/g,"$1\r\n");c=c.replace(/\r\n$/,"");return c}function b64nltohex(b){var a=b.replace(/[^0-9A-Za-z\/+=]*/g,"");var c=b64tohex(a);return c}function uricmptohex(a){return a.replace(/%/g,"")}function hextouricmp(a){return a.replace(/(..)/g,"%$1")}function encodeURIComponentAll(a){var d=encodeURIComponent(a);var b="";for(var c=0;c<d.length;c++){if(d[c]=="%"){b=b+d.substr(c,3);c=c+2}else{b=b+"%"+stohex(d[c])}}return b}function newline_toUnix(a){a=a.replace(/\r\n/mg,"\n");return a}function newline_toDos(a){a=a.replace(/\r\n/mg,"\n");a=a.replace(/\n/mg,"\r\n");return a};
/*! crypto-1.1.5.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.Util=new function(){this.DIGESTINFOHEAD={sha1:"3021300906052b0e03021a05000414",sha224:"302d300d06096086480165030402040500041c",sha256:"3031300d060960864801650304020105000420",sha384:"3041300d060960864801650304020205000430",sha512:"3051300d060960864801650304020305000440",md2:"3020300c06082a864886f70d020205000410",md5:"3020300c06082a864886f70d020505000410",ripemd160:"3021300906052b2403020105000414",};this.DEFAULTPROVIDER={md5:"cryptojs",sha1:"cryptojs",sha224:"cryptojs",sha256:"cryptojs",sha384:"cryptojs",sha512:"cryptojs",ripemd160:"cryptojs",hmacmd5:"cryptojs",hmacsha1:"cryptojs",hmacsha224:"cryptojs",hmacsha256:"cryptojs",hmacsha384:"cryptojs",hmacsha512:"cryptojs",hmacripemd160:"cryptojs",MD5withRSA:"cryptojs/jsrsa",SHA1withRSA:"cryptojs/jsrsa",SHA224withRSA:"cryptojs/jsrsa",SHA256withRSA:"cryptojs/jsrsa",SHA384withRSA:"cryptojs/jsrsa",SHA512withRSA:"cryptojs/jsrsa",RIPEMD160withRSA:"cryptojs/jsrsa",MD5withECDSA:"cryptojs/jsrsa",SHA1withECDSA:"cryptojs/jsrsa",SHA224withECDSA:"cryptojs/jsrsa",SHA256withECDSA:"cryptojs/jsrsa",SHA384withECDSA:"cryptojs/jsrsa",SHA512withECDSA:"cryptojs/jsrsa",RIPEMD160withECDSA:"cryptojs/jsrsa",SHA1withDSA:"cryptojs/jsrsa",SHA224withDSA:"cryptojs/jsrsa",SHA256withDSA:"cryptojs/jsrsa",MD5withRSAandMGF1:"cryptojs/jsrsa",SHA1withRSAandMGF1:"cryptojs/jsrsa",SHA224withRSAandMGF1:"cryptojs/jsrsa",SHA256withRSAandMGF1:"cryptojs/jsrsa",SHA384withRSAandMGF1:"cryptojs/jsrsa",SHA512withRSAandMGF1:"cryptojs/jsrsa",RIPEMD160withRSAandMGF1:"cryptojs/jsrsa",};this.CRYPTOJSMESSAGEDIGESTNAME={md5:"CryptoJS.algo.MD5",sha1:"CryptoJS.algo.SHA1",sha224:"CryptoJS.algo.SHA224",sha256:"CryptoJS.algo.SHA256",sha384:"CryptoJS.algo.SHA384",sha512:"CryptoJS.algo.SHA512",ripemd160:"CryptoJS.algo.RIPEMD160"};this.getDigestInfoHex=function(a,b){if(typeof this.DIGESTINFOHEAD[b]=="undefined"){throw"alg not supported in Util.DIGESTINFOHEAD: "+b}return this.DIGESTINFOHEAD[b]+a};this.getPaddedDigestInfoHex=function(h,a,j){var c=this.getDigestInfoHex(h,a);var d=j/4;if(c.length+22>d){throw"key is too short for SigAlg: keylen="+j+","+a}var b="0001";var k="00"+c;var g="";var l=d-b.length-k.length;for(var f=0;f<l;f+=2){g+="ff"}var e=b+g+k;return e};this.hashString=function(a,c){var b=new KJUR.crypto.MessageDigest({alg:c});return b.digestString(a)};this.hashHex=function(b,c){var a=new KJUR.crypto.MessageDigest({alg:c});return a.digestHex(b)};this.sha1=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha1",prov:"cryptojs"});return b.digestString(a)};this.sha256=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha256",prov:"cryptojs"});return b.digestString(a)};this.sha256Hex=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha256",prov:"cryptojs"});return b.digestHex(a)};this.sha512=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha512",prov:"cryptojs"});return b.digestString(a)};this.sha512Hex=function(a){var b=new KJUR.crypto.MessageDigest({alg:"sha512",prov:"cryptojs"});return b.digestHex(a)};this.md5=function(a){var b=new KJUR.crypto.MessageDigest({alg:"md5",prov:"cryptojs"});return b.digestString(a)};this.ripemd160=function(a){var b=new KJUR.crypto.MessageDigest({alg:"ripemd160",prov:"cryptojs"});return b.digestString(a)};this.getCryptoJSMDByName=function(a){}};KJUR.crypto.MessageDigest=function(params){var md=null;var algName=null;var provName=null;this.setAlgAndProvider=function(alg,prov){if(alg!=null&&prov===undefined){prov=KJUR.crypto.Util.DEFAULTPROVIDER[alg]}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(alg)!=-1&&prov=="cryptojs"){try{this.md=eval(KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[alg]).create()}catch(ex){throw"setAlgAndProvider hash alg set fail alg="+alg+"/"+ex}this.updateString=function(str){this.md.update(str)};this.updateHex=function(hex){var wHex=CryptoJS.enc.Hex.parse(hex);this.md.update(wHex)};this.digest=function(){var hash=this.md.finalize();return hash.toString(CryptoJS.enc.Hex)};this.digestString=function(str){this.updateString(str);return this.digest()};this.digestHex=function(hex){this.updateHex(hex);return this.digest()}}if(":sha256:".indexOf(alg)!=-1&&prov=="sjcl"){try{this.md=new sjcl.hash.sha256()}catch(ex){throw"setAlgAndProvider hash alg set fail alg="+alg+"/"+ex}this.updateString=function(str){this.md.update(str)};this.updateHex=function(hex){var baHex=sjcl.codec.hex.toBits(hex);this.md.update(baHex)};this.digest=function(){var hash=this.md.finalize();return sjcl.codec.hex.fromBits(hash)};this.digestString=function(str){this.updateString(str);return this.digest()};this.digestHex=function(hex){this.updateHex(hex);return this.digest()}}};this.updateString=function(str){throw"updateString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.updateHex=function(hex){throw"updateHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digest=function(){throw"digest() not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestString=function(str){throw"digestString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName};this.digestHex=function(hex){throw"digestHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName};if(params!==undefined){if(params.alg!==undefined){this.algName=params.alg;if(params.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}this.setAlgAndProvider(this.algName,this.provName)}}};KJUR.crypto.Mac=function(params){var mac=null;var pass=null;var algName=null;var provName=null;var algProv=null;this.setAlgAndProvider=function(alg,prov){if(alg==null){alg="hmacsha1"}alg=alg.toLowerCase();if(alg.substr(0,4)!="hmac"){throw"setAlgAndProvider unsupported HMAC alg: "+alg}if(prov===undefined){prov=KJUR.crypto.Util.DEFAULTPROVIDER[alg]}this.algProv=alg+"/"+prov;var hashAlg=alg.substr(4);if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(hashAlg)!=-1&&prov=="cryptojs"){try{var mdObj=eval(KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[hashAlg]);this.mac=CryptoJS.algo.HMAC.create(mdObj,this.pass)}catch(ex){throw"setAlgAndProvider hash alg set fail hashAlg="+hashAlg+"/"+ex}this.updateString=function(str){this.mac.update(str)};this.updateHex=function(hex){var wHex=CryptoJS.enc.Hex.parse(hex);this.mac.update(wHex)};this.doFinal=function(){var hash=this.mac.finalize();return hash.toString(CryptoJS.enc.Hex)};this.doFinalString=function(str){this.updateString(str);return this.doFinal()};this.doFinalHex=function(hex){this.updateHex(hex);return this.doFinal()}}};this.updateString=function(str){throw"updateString(str) not supported for this alg/prov: "+this.algProv};this.updateHex=function(hex){throw"updateHex(hex) not supported for this alg/prov: "+this.algProv};this.doFinal=function(){throw"digest() not supported for this alg/prov: "+this.algProv};this.doFinalString=function(str){throw"digestString(str) not supported for this alg/prov: "+this.algProv};this.doFinalHex=function(hex){throw"digestHex(hex) not supported for this alg/prov: "+this.algProv};if(params!==undefined){if(params.pass!==undefined){this.pass=params.pass}if(params.alg!==undefined){this.algName=params.alg;if(params.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}this.setAlgAndProvider(this.algName,this.provName)}}};KJUR.crypto.Signature=function(o){var q=null;var n=null;var r=null;var c=null;var l=null;var d=null;var k=null;var h=null;var p=null;var e=null;var b=-1;var g=null;var j=null;var a=null;var i=null;var f=null;this._setAlgNames=function(){if(this.algName.match(/^(.+)with(.+)$/)){this.mdAlgName=RegExp.$1.toLowerCase();this.pubkeyAlgName=RegExp.$2.toLowerCase()}};this._zeroPaddingOfSignature=function(x,w){var v="";var t=w/4-x.length;for(var u=0;u<t;u++){v=v+"0"}return v+x};this.setAlgAndProvider=function(u,t){this._setAlgNames();if(t!="cryptojs/jsrsa"){throw"provider not supported: "+t}if(":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(this.mdAlgName)!=-1){try{this.md=new KJUR.crypto.MessageDigest({alg:this.mdAlgName})}catch(s){throw"setAlgAndProvider hash alg set fail alg="+this.mdAlgName+"/"+s}this.init=function(w,x){var y=null;try{if(x===undefined){y=KEYUTIL.getKey(w)}else{y=KEYUTIL.getKey(w,x)}}catch(v){throw"init failed:"+v}if(y.isPrivate===true){this.prvKey=y;this.state="SIGN"}else{if(y.isPublic===true){this.pubKey=y;this.state="VERIFY"}else{throw"init failed.:"+y}}};this.initSign=function(v){if(typeof v.ecprvhex=="string"&&typeof v.eccurvename=="string"){this.ecprvhex=v.ecprvhex;this.eccurvename=v.eccurvename}else{this.prvKey=v}this.state="SIGN"};this.initVerifyByPublicKey=function(v){if(typeof v.ecpubhex=="string"&&typeof v.eccurvename=="string"){this.ecpubhex=v.ecpubhex;this.eccurvename=v.eccurvename}else{if(v instanceof KJUR.crypto.ECDSA){this.pubKey=v}else{if(v instanceof RSAKey){this.pubKey=v}}}this.state="VERIFY"};this.initVerifyByCertificatePEM=function(v){var w=new X509();w.readCertPEM(v);this.pubKey=w.subjectPublicKeyRSA;this.state="VERIFY"};this.updateString=function(v){this.md.updateString(v)};this.updateHex=function(v){this.md.updateHex(v)};this.sign=function(){this.sHashHex=this.md.digest();if(typeof this.ecprvhex!="undefined"&&typeof this.eccurvename!="undefined"){var v=new KJUR.crypto.ECDSA({curve:this.eccurvename});this.hSign=v.signHex(this.sHashHex,this.ecprvhex)}else{if(this.pubkeyAlgName=="rsaandmgf1"){this.hSign=this.prvKey.signWithMessageHashPSS(this.sHashHex,this.mdAlgName,this.pssSaltLen)}else{if(this.pubkeyAlgName=="rsa"){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex,this.mdAlgName)}else{if(this.prvKey instanceof KJUR.crypto.ECDSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex)}else{if(this.prvKey instanceof KJUR.crypto.DSA){this.hSign=this.prvKey.signWithMessageHash(this.sHashHex)}else{throw"Signature: unsupported public key alg: "+this.pubkeyAlgName}}}}}return this.hSign};this.signString=function(v){this.updateString(v);this.sign()};this.signHex=function(v){this.updateHex(v);this.sign()};this.verify=function(v){this.sHashHex=this.md.digest();if(typeof this.ecpubhex!="undefined"&&typeof this.eccurvename!="undefined"){var w=new KJUR.crypto.ECDSA({curve:this.eccurvename});return w.verifyHex(this.sHashHex,v,this.ecpubhex)}else{if(this.pubkeyAlgName=="rsaandmgf1"){return this.pubKey.verifyWithMessageHashPSS(this.sHashHex,v,this.mdAlgName,this.pssSaltLen)}else{if(this.pubkeyAlgName=="rsa"){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(this.pubKey instanceof KJUR.crypto.ECDSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{if(this.pubKey instanceof KJUR.crypto.DSA){return this.pubKey.verifyWithMessageHash(this.sHashHex,v)}else{throw"Signature: unsupported public key alg: "+this.pubkeyAlgName}}}}}}}};this.init=function(s,t){throw"init(key, pass) not supported for this alg:prov="+this.algProvName};this.initVerifyByPublicKey=function(s){throw"initVerifyByPublicKey(rsaPubKeyy) not supported for this alg:prov="+this.algProvName};this.initVerifyByCertificatePEM=function(s){throw"initVerifyByCertificatePEM(certPEM) not supported for this alg:prov="+this.algProvName};this.initSign=function(s){throw"initSign(prvKey) not supported for this alg:prov="+this.algProvName};this.updateString=function(s){throw"updateString(str) not supported for this alg:prov="+this.algProvName};this.updateHex=function(s){throw"updateHex(hex) not supported for this alg:prov="+this.algProvName};this.sign=function(){throw"sign() not supported for this alg:prov="+this.algProvName};this.signString=function(s){throw"digestString(str) not supported for this alg:prov="+this.algProvName};this.signHex=function(s){throw"digestHex(hex) not supported for this alg:prov="+this.algProvName};this.verify=function(s){throw"verify(hSigVal) not supported for this alg:prov="+this.algProvName};this.initParams=o;if(o!==undefined){if(o.alg!==undefined){this.algName=o.alg;if(o.prov===undefined){this.provName=KJUR.crypto.Util.DEFAULTPROVIDER[this.algName]}else{this.provName=o.prov}this.algProvName=this.algName+":"+this.provName;this.setAlgAndProvider(this.algName,this.provName);this._setAlgNames()}if(o.psssaltlen!==undefined){this.pssSaltLen=o.psssaltlen}if(o.prvkeypem!==undefined){if(o.prvkeypas!==undefined){throw"both prvkeypem and prvkeypas parameters not supported"}else{try{var q=new RSAKey();q.readPrivateKeyFromPEMString(o.prvkeypem);this.initSign(q)}catch(m){throw"fatal error to load pem private key: "+m}}}}};KJUR.crypto.OID=new function(){this.oidhex2name={"2a864886f70d010101":"rsaEncryption","2a8648ce3d0201":"ecPublicKey","2a8648ce380401":"dsa","2a8648ce3d030107":"secp256r1","2b8104001f":"secp192k1","2b81040021":"secp224r1","2b8104000a":"secp256k1","2b81040023":"secp521r1","2b81040022":"secp384r1","2a8648ce380403":"SHA1withDSA","608648016503040301":"SHA224withDSA","608648016503040302":"SHA256withDSA",}};
/*! ecdsa-modified-1.0.4.js (c) Stephan Thomas, Kenji Urushima | github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.ECDSA=function(h){var e="secp256r1";var g=null;var b=null;var f=null;var a=new SecureRandom();var d=null;this.type="EC";function c(s,o,r,n){var j=Math.max(o.bitLength(),n.bitLength());var t=s.add2D(r);var q=s.curve.getInfinity();for(var p=j-1;p>=0;--p){q=q.twice2D();q.z=BigInteger.ONE;if(o.testBit(p)){if(n.testBit(p)){q=q.add2D(t)}else{q=q.add2D(s)}}else{if(n.testBit(p)){q=q.add2D(r)}}}return q}this.getBigRandom=function(i){return new BigInteger(i.bitLength(),a).mod(i.subtract(BigInteger.ONE)).add(BigInteger.ONE)};this.setNamedCurve=function(i){this.ecparams=KJUR.crypto.ECParameterDB.getByName(i);this.prvKeyHex=null;this.pubKeyHex=null;this.curveName=i};this.setPrivateKeyHex=function(i){this.isPrivate=true;this.prvKeyHex=i};this.setPublicKeyHex=function(i){this.isPublic=true;this.pubKeyHex=i};this.generateKeyPairHex=function(){var k=this.ecparams.n;var n=this.getBigRandom(k);var l=this.ecparams.G.multiply(n);var q=l.getX().toBigInteger();var o=l.getY().toBigInteger();var i=this.ecparams.keylen/4;var m=("0000000000"+n.toString(16)).slice(-i);var r=("0000000000"+q.toString(16)).slice(-i);var p=("0000000000"+o.toString(16)).slice(-i);var j="04"+r+p;this.setPrivateKeyHex(m);this.setPublicKeyHex(j);return{ecprvhex:m,ecpubhex:j}};this.signWithMessageHash=function(i){return this.signHex(i,this.prvKeyHex)};this.signHex=function(o,j){var t=new BigInteger(j,16);var l=this.ecparams.n;var q=new BigInteger(o,16);do{var m=this.getBigRandom(l);var u=this.ecparams.G;var p=u.multiply(m);var i=p.getX().toBigInteger().mod(l)}while(i.compareTo(BigInteger.ZERO)<=0);var v=m.modInverse(l).multiply(q.add(t.multiply(i))).mod(l);return KJUR.crypto.ECDSA.biRSSigToASN1Sig(i,v)};this.sign=function(m,u){var q=u;var j=this.ecparams.n;var p=BigInteger.fromByteArrayUnsigned(m);do{var l=this.getBigRandom(j);var t=this.ecparams.G;var o=t.multiply(l);var i=o.getX().toBigInteger().mod(j)}while(i.compareTo(BigInteger.ZERO)<=0);var v=l.modInverse(j).multiply(p.add(q.multiply(i))).mod(j);return this.serializeSig(i,v)};this.verifyWithMessageHash=function(j,i){return this.verifyHex(j,i,this.pubKeyHex)};this.verifyHex=function(m,i,p){var l,j;var o=KJUR.crypto.ECDSA.parseSigHex(i);l=o.r;j=o.s;var k;k=ECPointFp.decodeFromHex(this.ecparams.curve,p);var n=new BigInteger(m,16);return this.verifyRaw(n,l,j,k)};this.verify=function(o,p,j){var l,i;if(Bitcoin.Util.isArray(p)){var n=this.parseSig(p);l=n.r;i=n.s}else{if("object"===typeof p&&p.r&&p.s){l=p.r;i=p.s}else{throw"Invalid value for signature"}}var k;if(j instanceof ECPointFp){k=j}else{if(Bitcoin.Util.isArray(j)){k=ECPointFp.decodeFrom(this.ecparams.curve,j)}else{throw"Invalid format for pubkey value, must be byte array or ECPointFp"}}var m=BigInteger.fromByteArrayUnsigned(o);return this.verifyRaw(m,l,i,k)};this.verifyRaw=function(o,i,w,m){var l=this.ecparams.n;var u=this.ecparams.G;if(i.compareTo(BigInteger.ONE)<0||i.compareTo(l)>=0){return false}if(w.compareTo(BigInteger.ONE)<0||w.compareTo(l)>=0){return false}var p=w.modInverse(l);var k=o.multiply(p).mod(l);var j=i.multiply(p).mod(l);var q=u.multiply(k).add(m.multiply(j));var t=q.getX().toBigInteger().mod(l);return t.equals(i)};this.serializeSig=function(k,j){var l=k.toByteArraySigned();var i=j.toByteArraySigned();var m=[];m.push(2);m.push(l.length);m=m.concat(l);m.push(2);m.push(i.length);m=m.concat(i);m.unshift(m.length);m.unshift(48);return m};this.parseSig=function(n){var m;if(n[0]!=48){throw new Error("Signature not a valid DERSequence")}m=2;if(n[m]!=2){throw new Error("First element in signature must be a DERInteger")}var l=n.slice(m+2,m+2+n[m+1]);m+=2+n[m+1];if(n[m]!=2){throw new Error("Second element in signature must be a DERInteger")}var i=n.slice(m+2,m+2+n[m+1]);m+=2+n[m+1];var k=BigInteger.fromByteArrayUnsigned(l);var j=BigInteger.fromByteArrayUnsigned(i);return{r:k,s:j}};this.parseSigCompact=function(m){if(m.length!==65){throw"Signature has the wrong length"}var j=m[0]-27;if(j<0||j>7){throw"Invalid signature type"}var o=this.ecparams.n;var l=BigInteger.fromByteArrayUnsigned(m.slice(1,33)).mod(o);var k=BigInteger.fromByteArrayUnsigned(m.slice(33,65)).mod(o);return{r:l,s:k,i:j}};if(h!==undefined){if(h.curve!==undefined){this.curveName=h.curve}}if(this.curveName===undefined){this.curveName=e}this.setNamedCurve(this.curveName);if(h!==undefined){if(h.prv!==undefined){this.setPrivateKeyHex(h.prv)}if(h.pub!==undefined){this.setPublicKeyHex(h.pub)}}};KJUR.crypto.ECDSA.parseSigHex=function(a){var b=KJUR.crypto.ECDSA.parseSigHexInHexRS(a);var d=new BigInteger(b.r,16);var c=new BigInteger(b.s,16);return{r:d,s:c}};KJUR.crypto.ECDSA.parseSigHexInHexRS=function(c){if(c.substr(0,2)!="30"){throw"signature is not a ASN.1 sequence"}var b=ASN1HEX.getPosArrayOfChildren_AtObj(c,0);if(b.length!=2){throw"number of signature ASN.1 sequence elements seem wrong"}var g=b[0];var f=b[1];if(c.substr(g,2)!="02"){throw"1st item of sequene of signature is not ASN.1 integer"}if(c.substr(f,2)!="02"){throw"2nd item of sequene of signature is not ASN.1 integer"}var e=ASN1HEX.getHexOfV_AtObj(c,g);var d=ASN1HEX.getHexOfV_AtObj(c,f);return{r:e,s:d}};KJUR.crypto.ECDSA.asn1SigToConcatSig=function(c){var d=KJUR.crypto.ECDSA.parseSigHexInHexRS(c);var b=d.r;var a=d.s;if(b.substr(0,2)=="00"&&(((b.length/2)*8)%(16*8))==8){b=b.substr(2)}if(a.substr(0,2)=="00"&&(((a.length/2)*8)%(16*8))==8){a=a.substr(2)}if((((b.length/2)*8)%(16*8))!=0){throw"unknown ECDSA sig r length error"}if((((a.length/2)*8)%(16*8))!=0){throw"unknown ECDSA sig s length error"}return b+a};KJUR.crypto.ECDSA.concatSigToASN1Sig=function(a){if((((a.length/2)*8)%(16*8))!=0){throw"unknown ECDSA concatinated r-s sig  length error"}var c=a.substr(0,a.length/2);var b=a.substr(a.length/2);return KJUR.crypto.ECDSA.hexRSSigToASN1Sig(c,b)};KJUR.crypto.ECDSA.hexRSSigToASN1Sig=function(b,a){var d=new BigInteger(b,16);var c=new BigInteger(a,16);return KJUR.crypto.ECDSA.biRSSigToASN1Sig(d,c)};KJUR.crypto.ECDSA.biRSSigToASN1Sig=function(e,c){var b=new KJUR.asn1.DERInteger({bigint:e});var a=new KJUR.asn1.DERInteger({bigint:c});var d=new KJUR.asn1.DERSequence({array:[b,a]});return d.getEncodedHex()};
/*! ecparam-1.0.0.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.ECParameterDB=new function(){var b={};var c={};function a(d){return new BigInteger(d,16)}this.getByName=function(e){var d=e;if(typeof c[d]!="undefined"){d=c[e]}if(typeof b[d]!="undefined"){return b[d]}throw"unregistered EC curve name: "+d};this.regist=function(A,l,o,g,m,e,j,f,k,u,d,x){b[A]={};var s=a(o);var z=a(g);var y=a(m);var t=a(e);var w=a(j);var r=new ECCurveFp(s,z,y);var q=r.decodePointHex("04"+f+k);b[A]["name"]=A;b[A]["keylen"]=l;b[A]["curve"]=r;b[A]["G"]=q;b[A]["n"]=t;b[A]["h"]=w;b[A]["oid"]=d;b[A]["info"]=x;for(var v=0;v<u.length;v++){c[u[v]]=A}}};KJUR.crypto.ECParameterDB.regist("secp128r1",128,"FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC","E87579C11079F43DD824993C2CEE5ED3","FFFFFFFE0000000075A30D1B9038A115","1","161FF7528B899B2D0C28607CA52C5B86","CF5AC8395BAFEB13C02DA292DDED7A83",[],"","secp128r1 : SECG curve over a 128 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160k1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73","0","7","0100000000000000000001B8FA16DFAB9ACA16B6B3","1","3B4C382CE37AA192A4019E763036F4F5DD4D7EBB","938CF935318FDCED6BC28286531733C3F03C4FEE",[],"","secp160k1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp160r1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC","1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45","0100000000000000000001F4C8F927AED3CA752257","1","4A96B5688EF573284664698968C38BB913CBFC82","23A628553168947D59DCC912042351377AC5FB32",[],"","secp160r1 : SECG curve over a 160 bit prime field");KJUR.crypto.ECParameterDB.regist("secp192k1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37","0","3","FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D","1","DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D","9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D",[]);KJUR.crypto.ECParameterDB.regist("secp192r1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC","64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1","FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831","1","188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012","07192B95FFC8DA78631011ED6B24CDD573F977A11E794811",[]);KJUR.crypto.ECParameterDB.regist("secp224r1",224,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE","B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4","FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D","1","B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21","BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34",[]);KJUR.crypto.ECParameterDB.regist("secp256k1",256,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F","0","7","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141","1","79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798","483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8",[]);KJUR.crypto.ECParameterDB.regist("secp256r1",256,"FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC","5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B","FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551","1","6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296","4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5",["NIST P-256","P-256","prime256v1"]);KJUR.crypto.ECParameterDB.regist("secp384r1",384,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC","B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973","1","AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7","3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f",["NIST P-384","P-384"]);KJUR.crypto.ECParameterDB.regist("secp521r1",521,"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC","051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409","1","C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66","011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650",["NIST P-521","P-521"]);
/*! dsa-modified-1.0.1.js (c) Recurity Labs GmbH, Kenji Urushimma | github.com/openpgpjs/openpgpjs/blob/master/LICENSE
 */
if(typeof KJUR=="undefined"||!KJUR){KJUR={}}if(typeof KJUR.crypto=="undefined"||!KJUR.crypto){KJUR.crypto={}}KJUR.crypto.DSA=function(){this.p=null;this.q=null;this.g=null;this.y=null;this.x=null;this.type="DSA";this.setPrivate=function(z,w,v,A,u){this.isPrivate=true;this.p=z;this.q=w;this.g=v;this.y=A;this.x=u};this.setPublic=function(w,v,u,z){this.isPublic=true;this.p=w;this.q=v;this.g=u;this.y=z;this.x=null};this.signWithMessageHash=function(z){var v=this.p;var u=this.q;var C=this.g;var D=this.y;var E=this.x;var A=z.substr(0,u.bitLength()/4);var B=new BigInteger(z,16);var w=n(BigInteger.ONE.add(BigInteger.ONE),u.subtract(BigInteger.ONE));var G=(C.modPow(w,v)).mod(u);var F=(w.modInverse(u).multiply(B.add(E.multiply(G)))).mod(u);var H=KJUR.asn1.ASN1Util.jsonToASN1HEX({seq:[{"int":{bigint:G}},{"int":{bigint:F}}]});return H};this.verifyWithMessageHash=function(C,B){var z=this.p;var u=this.q;var G=this.g;var H=this.y;var E=this.parseASN1Signature(B);var K=E[0];var J=E[1];var C=C.substr(0,u.bitLength()/4);var D=new BigInteger(C,16);if(BigInteger.ZERO.compareTo(K)>0||K.compareTo(u)>0||BigInteger.ZERO.compareTo(J)>0||J.compareTo(u)>0){throw"invalid DSA signature"}var I=J.modInverse(u);var A=D.multiply(I).mod(u);var v=K.multiply(I).mod(u);var F=G.modPow(A,z).multiply(H.modPow(v,z)).mod(z).mod(u);return F.compareTo(K)==0};this.parseASN1Signature=function(u){try{var y=new BigInteger(ASN1HEX.getVbyList(u,0,[0],"02"),16);var v=new BigInteger(ASN1HEX.getVbyList(u,0,[1],"02"),16);return[y,v]}catch(w){throw"malformed DSA signature"}};function d(E,w,B,v,u,C){var z=KJUR.crypto.Util.hashString(w,E.toLowerCase());var z=z.substr(0,u.bitLength()/4);var A=new BigInteger(z,16);var y=n(BigInteger.ONE.add(BigInteger.ONE),u.subtract(BigInteger.ONE));var F=(B.modPow(y,v)).mod(u);var D=(y.modInverse(u).multiply(A.add(C.multiply(F)))).mod(u);var G=new Array();G[0]=F;G[1]=D;return G}function r(v){var u=openpgp.config.config.prefer_hash_algorithm;switch(Math.round(v.bitLength()/8)){case 20:if(u!=2&&u>11&&u!=10&&u<8){return 2}return u;case 28:if(u>11&&u<8){return 11}return u;case 32:if(u>10&&u<8){return 8}return u;default:util.print_debug("DSA select hash algorithm: returning null for an unknown length of q");return null}}this.select_hash_algorithm=r;function m(I,K,J,B,z,u,F,G){var C=KJUR.crypto.Util.hashString(B,I.toLowerCase());var C=C.substr(0,u.bitLength()/4);var D=new BigInteger(C,16);if(BigInteger.ZERO.compareTo(K)>0||K.compareTo(u)>0||BigInteger.ZERO.compareTo(J)>0||J.compareTo(u)>0){util.print_error("invalid DSA Signature");return null}var H=J.modInverse(u);var A=D.multiply(H).mod(u);var v=K.multiply(H).mod(u);var E=F.modPow(A,z).multiply(G.modPow(v,z)).mod(z).mod(u);return E.compareTo(K)==0}function a(z){var A=new BigInteger(z,primeCenterie);var y=j(q,512);var u=t(p,q,z);var v;do{v=new BigInteger(q.bitCount(),rand)}while(x.compareTo(BigInteger.ZERO)!=1&&x.compareTo(q)!=-1);var w=g.modPow(x,p);return{x:v,q:A,p:y,g:u,y:w}}function j(y,z,w){if(z%64!=0){return false}var u;var v;do{u=w(bitcount,true);v=u.subtract(BigInteger.ONE);u=u.subtract(v.remainder(y))}while(!u.isProbablePrime(primeCenterie)||u.bitLength()!=l);return u}function t(B,z,A,w){var u=B.subtract(BigInteger.ONE);var y=u.divide(z);var v;do{v=w(A)}while(v.compareTo(u)!=-1&&v.compareTo(BigInteger.ONE)!=1);return v.modPow(y,B)}function o(w,y,u){var v;do{v=u(y,false)}while(v.compareTo(w)!=-1&&v.compareTo(BigInteger.ZERO)!=1);return v}function i(v,w){k=o(v);var u=g.modPow(k,w).mod(v);return u}function h(B,w,y,v,z,u){var A=B(v);s=(w.modInverse(z).multiply(A.add(u.multiply(y)))).mod(z);return s}this.sign=d;this.verify=m;function n(w,u){if(u.compareTo(w)<=0){return}var v=u.subtract(w);var y=e(v.bitLength());while(y>v){y=e(v.bitLength())}return w.add(y)}function e(w){if(w<0){return null}var u=Math.floor((w+7)/8);var v=c(u);if(w%8>0){v=String.fromCharCode((Math.pow(2,w%8)-1)&v.charCodeAt(0))+v.substring(1)}return new BigInteger(f(v),16)}function c(w){var u="";for(var v=0;v<w;v++){u+=String.fromCharCode(b())}return u}function b(){var u=new Uint32Array(1);window.crypto.getRandomValues(u);return u[0]&255}function f(y){if(y==null){return""}var v=[];var w=y.length;var z=0;var u;while(z<w){u=y[z++].charCodeAt().toString(16);while(u.length<2){u="0"+u}v.push(""+u)}return v.join("")}this.getRandomBigIntegerInRange=n;this.getRandomBigInteger=e;this.getRandomBytes=c};
/*! pkcs5pkey-1.0.6.js (c) 2013-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var PKCS5PKEY=function(){var c=function(n,p,o){return i(CryptoJS.AES,n,p,o)};var d=function(n,p,o){return i(CryptoJS.TripleDES,n,p,o)};var i=function(q,v,s,o){var p=CryptoJS.enc.Hex.parse(v);var u=CryptoJS.enc.Hex.parse(s);var n=CryptoJS.enc.Hex.parse(o);var r={};r.key=u;r.iv=n;r.ciphertext=p;var t=q.decrypt(r,u,{iv:n});return CryptoJS.enc.Hex.stringify(t)};var j=function(n,p,o){return e(CryptoJS.AES,n,p,o)};var m=function(n,p,o){return e(CryptoJS.TripleDES,n,p,o)};var e=function(s,x,v,p){var r=CryptoJS.enc.Hex.parse(x);var w=CryptoJS.enc.Hex.parse(v);var o=CryptoJS.enc.Hex.parse(p);var n={};var u=s.encrypt(r,w,{iv:o});var q=CryptoJS.enc.Hex.parse(u.toString());var t=CryptoJS.enc.Base64.stringify(q);return t};var g={"AES-256-CBC":{proc:c,eproc:j,keylen:32,ivlen:16},"AES-192-CBC":{proc:c,eproc:j,keylen:24,ivlen:16},"AES-128-CBC":{proc:c,eproc:j,keylen:16,ivlen:16},"DES-EDE3-CBC":{proc:d,eproc:m,keylen:24,ivlen:8}};var b=function(n){return g[n]["proc"]};var k=function(n){var p=CryptoJS.lib.WordArray.random(n);var o=CryptoJS.enc.Hex.stringify(p);return o};var l=function(q){var r={};if(q.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)","m"))){r.cipher=RegExp.$1;r.ivsalt=RegExp.$2}if(q.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"))){r.type=RegExp.$1}var p=-1;var t=0;if(q.indexOf("\r\n\r\n")!=-1){p=q.indexOf("\r\n\r\n");t=2}if(q.indexOf("\n\n")!=-1){p=q.indexOf("\n\n");t=1}var o=q.indexOf("-----END");if(p!=-1&&o!=-1){var n=q.substring(p+t*2,o-t);n=n.replace(/\s+/g,"");r.data=n}return r};var h=function(o,w,n){var t=n.substring(0,16);var r=CryptoJS.enc.Hex.parse(t);var p=CryptoJS.enc.Utf8.parse(w);var s=g[o]["keylen"]+g[o]["ivlen"];var v="";var u=null;for(;;){var q=CryptoJS.algo.MD5.create();if(u!=null){q.update(u)}q.update(p);q.update(r);u=q.finalize();v=v+CryptoJS.enc.Hex.stringify(u);if(v.length>=s*2){break}}var x={};x.keyhex=v.substr(0,g[o]["keylen"]*2);x.ivhex=v.substr(g[o]["keylen"]*2,g[o]["ivlen"]*2);return x};var a=function(n,t,p,u){var q=CryptoJS.enc.Base64.parse(n);var o=CryptoJS.enc.Hex.stringify(q);var s=g[t]["proc"];var r=s(o,p,u);return r};var f=function(n,q,o,s){var p=g[q]["eproc"];var r=p(n,o,s);return r};return{version:"1.0.5",getHexFromPEM:function(o,r){var p=o;if(p.indexOf("BEGIN "+r)==-1){throw"can't find PEM header: "+r}p=p.replace("-----BEGIN "+r+"-----","");p=p.replace("-----END "+r+"-----","");var q=p.replace(/\s+/g,"");var n=b64tohex(q);return n},getDecryptedKeyHexByKeyIV:function(o,r,q,p){var n=b(r);return n(o,q,p)},parsePKCS5PEM:function(n){return l(n)},getKeyAndUnusedIvByPasscodeAndIvsalt:function(o,n,p){return h(o,n,p)},decryptKeyB64:function(n,p,o,q){return a(n,p,o,q)},getDecryptedKeyHex:function(w,v){var o=l(w);var r=o.type;var p=o.cipher;var n=o.ivsalt;var q=o.data;var u=h(p,v,n);var t=u.keyhex;var s=a(q,p,t,n);return s},getRSAKeyFromEncryptedPKCS5PEM:function(p,o){var q=this.getDecryptedKeyHex(p,o);var n=new RSAKey();n.readPrivateKeyFromASN1HexString(q);return n},getEryptedPKCS5PEMFromPrvKeyHex:function(q,x,r,p){var n="";if(typeof r=="undefined"||r==null){r="AES-256-CBC"}if(typeof g[r]=="undefined"){throw"PKCS5PKEY unsupported algorithm: "+r}if(typeof p=="undefined"||p==null){var t=g[r]["ivlen"];var s=k(t);p=s.toUpperCase()}var w=h(r,x,p);var v=w.keyhex;var u=f(q,r,v,p);var o=u.replace(/(.{64})/g,"$1\r\n");var n="-----BEGIN RSA PRIVATE KEY-----\r\n";n+="Proc-Type: 4,ENCRYPTED\r\n";n+="DEK-Info: "+r+","+p+"\r\n";n+="\r\n";n+=o;n+="\r\n-----END RSA PRIVATE KEY-----\r\n";return n},getEryptedPKCS5PEMFromRSAKey:function(C,D,o,s){var A=new KJUR.asn1.DERInteger({"int":0});var v=new KJUR.asn1.DERInteger({bigint:C.n});var z=new KJUR.asn1.DERInteger({"int":C.e});var B=new KJUR.asn1.DERInteger({bigint:C.d});var t=new KJUR.asn1.DERInteger({bigint:C.p});var r=new KJUR.asn1.DERInteger({bigint:C.q});var y=new KJUR.asn1.DERInteger({bigint:C.dmp1});var u=new KJUR.asn1.DERInteger({bigint:C.dmq1});var x=new KJUR.asn1.DERInteger({bigint:C.coeff});var E=new KJUR.asn1.DERSequence({array:[A,v,z,B,t,r,y,u,x]});var w=E.getEncodedHex();return this.getEryptedPKCS5PEMFromPrvKeyHex(w,D,o,s)},newEncryptedPKCS5PEM:function(n,o,r,s){if(typeof o=="undefined"||o==null){o=1024}if(typeof r=="undefined"||r==null){r="10001"}var p=new RSAKey();p.generate(o,r);var q=null;if(typeof s=="undefined"||s==null){q=this.getEncryptedPKCS5PEMFromRSAKey(pkey,n)}else{q=this.getEncryptedPKCS5PEMFromRSAKey(pkey,n,s)}return q},getRSAKeyFromPlainPKCS8PEM:function(p){if(p.match(/ENCRYPTED/)){throw"pem shall be not ENCRYPTED"}var o=this.getHexFromPEM(p,"PRIVATE KEY");var n=this.getRSAKeyFromPlainPKCS8Hex(o);return n},getRSAKeyFromPlainPKCS8Hex:function(q){var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,0);if(p.length!=3){throw"outer DERSequence shall have 3 elements: "+p.length}var o=ASN1HEX.getHexOfTLV_AtObj(q,p[1]);if(o!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmIdentifier is not rsaEnc: "+o}var o=ASN1HEX.getHexOfTLV_AtObj(q,p[1]);var r=ASN1HEX.getHexOfTLV_AtObj(q,p[2]);var s=ASN1HEX.getHexOfV_AtObj(r,0);var n=new RSAKey();n.readPrivateKeyFromASN1HexString(s);return n},parseHexOfEncryptedPKCS8:function(u){var q={};var p=ASN1HEX.getPosArrayOfChildren_AtObj(u,0);if(p.length!=2){throw"malformed format: SEQUENCE(0).items != 2: "+p.length}q.ciphertext=ASN1HEX.getHexOfV_AtObj(u,p[1]);var w=ASN1HEX.getPosArrayOfChildren_AtObj(u,p[0]);if(w.length!=2){throw"malformed format: SEQUENCE(0.0).items != 2: "+w.length}if(ASN1HEX.getHexOfV_AtObj(u,w[0])!="2a864886f70d01050d"){throw"this only supports pkcs5PBES2"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(u,w[1]);if(w.length!=2){throw"malformed format: SEQUENCE(0.0.1).items != 2: "+n.length}var o=ASN1HEX.getPosArrayOfChildren_AtObj(u,n[1]);if(o.length!=2){throw"malformed format: SEQUENCE(0.0.1.1).items != 2: "+o.length}if(ASN1HEX.getHexOfV_AtObj(u,o[0])!="2a864886f70d0307"){throw"this only supports TripleDES"}q.encryptionSchemeAlg="TripleDES";q.encryptionSchemeIV=ASN1HEX.getHexOfV_AtObj(u,o[1]);var r=ASN1HEX.getPosArrayOfChildren_AtObj(u,n[0]);if(r.length!=2){throw"malformed format: SEQUENCE(0.0.1.0).items != 2: "+r.length}if(ASN1HEX.getHexOfV_AtObj(u,r[0])!="2a864886f70d01050c"){throw"this only supports pkcs5PBKDF2"}var v=ASN1HEX.getPosArrayOfChildren_AtObj(u,r[1]);if(v.length<2){throw"malformed format: SEQUENCE(0.0.1.0.1).items < 2: "+v.length}q.pbkdf2Salt=ASN1HEX.getHexOfV_AtObj(u,v[0]);var s=ASN1HEX.getHexOfV_AtObj(u,v[1]);try{q.pbkdf2Iter=parseInt(s,16)}catch(t){throw"malformed format pbkdf2Iter: "+s}return q},getPBKDF2KeyHexFromParam:function(s,n){var r=CryptoJS.enc.Hex.parse(s.pbkdf2Salt);var o=s.pbkdf2Iter;var q=CryptoJS.PBKDF2(n,r,{keySize:192/32,iterations:o});var p=CryptoJS.enc.Hex.stringify(q);return p},getPlainPKCS8HexFromEncryptedPKCS8PEM:function(v,w){var p=this.getHexFromPEM(v,"ENCRYPTED PRIVATE KEY");var n=this.parseHexOfEncryptedPKCS8(p);var s=PKCS5PKEY.getPBKDF2KeyHexFromParam(n,w);var t={};t.ciphertext=CryptoJS.enc.Hex.parse(n.ciphertext);var r=CryptoJS.enc.Hex.parse(s);var q=CryptoJS.enc.Hex.parse(n.encryptionSchemeIV);var u=CryptoJS.TripleDES.decrypt(t,r,{iv:q});var o=CryptoJS.enc.Hex.stringify(u);return o},getRSAKeyFromEncryptedPKCS8PEM:function(q,p){var o=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(q,p);var n=this.getRSAKeyFromPlainPKCS8Hex(o);return n},getKeyFromEncryptedPKCS8PEM:function(q,o){var n=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(q,o);var p=this.getKeyFromPlainPrivatePKCS8Hex(n);return p},parsePlainPrivatePKCS8Hex:function(q){var o={};o.algparam=null;if(q.substr(0,2)!="30"){throw"malformed plain PKCS8 private key(code:001)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,0);if(p.length!=3){throw"malformed plain PKCS8 private key(code:002)"}if(q.substr(p[1],2)!="30"){throw"malformed PKCS8 private key(code:003)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(q,p[1]);if(n.length!=2){throw"malformed PKCS8 private key(code:004)"}if(q.substr(n[0],2)!="06"){throw"malformed PKCS8 private key(code:005)"}o.algoid=ASN1HEX.getHexOfV_AtObj(q,n[0]);if(q.substr(n[1],2)=="06"){o.algparam=ASN1HEX.getHexOfV_AtObj(q,n[1])}if(q.substr(p[2],2)!="04"){throw"malformed PKCS8 private key(code:006)"}o.keyidx=ASN1HEX.getStartPosOfV_AtObj(q,p[2]);return o},getKeyFromPlainPrivatePKCS8PEM:function(o){var n=this.getHexFromPEM(o,"PRIVATE KEY");var p=this.getKeyFromPlainPrivatePKCS8Hex(n);return p},getKeyFromPlainPrivatePKCS8Hex:function(n){var p=this.parsePlainPrivatePKCS8Hex(n);if(p.algoid=="2a864886f70d010101"){this.parsePrivateRawRSAKeyHexAtObj(n,p);var o=p.key;var q=new RSAKey();q.setPrivateEx(o.n,o.e,o.d,o.p,o.q,o.dp,o.dq,o.co);return q}else{if(p.algoid=="2a8648ce3d0201"){this.parsePrivateRawECKeyHexAtObj(n,p);if(KJUR.crypto.OID.oidhex2name[p.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+p.algparam}var r=KJUR.crypto.OID.oidhex2name[p.algparam];var q=new KJUR.crypto.ECDSA({curve:r,prv:p.key});return q}else{throw"unsupported private key algorithm"}}},getRSAKeyFromPublicPKCS8PEM:function(o){var p=this.getHexFromPEM(o,"PUBLIC KEY");var n=this.getRSAKeyFromPublicPKCS8Hex(p);return n},getKeyFromPublicPKCS8PEM:function(o){var p=this.getHexFromPEM(o,"PUBLIC KEY");var n=this.getKeyFromPublicPKCS8Hex(p);return n},getKeyFromPublicPKCS8Hex:function(o){var n=this.parsePublicPKCS8Hex(o);if(n.algoid=="2a864886f70d010101"){var r=this.parsePublicRawRSAKeyHex(n.key);var p=new RSAKey();p.setPublic(r.n,r.e);return p}else{if(n.algoid=="2a8648ce3d0201"){if(KJUR.crypto.OID.oidhex2name[n.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+n.algparam}var q=KJUR.crypto.OID.oidhex2name[n.algparam];var p=new KJUR.crypto.ECDSA({curve:q,pub:n.key});return p}else{throw"unsupported public key algorithm"}}},parsePublicRawRSAKeyHex:function(p){var n={};if(p.substr(0,2)!="30"){throw"malformed RSA key(code:001)"}var o=ASN1HEX.getPosArrayOfChildren_AtObj(p,0);if(o.length!=2){throw"malformed RSA key(code:002)"}if(p.substr(o[0],2)!="02"){throw"malformed RSA key(code:003)"}n.n=ASN1HEX.getHexOfV_AtObj(p,o[0]);if(p.substr(o[1],2)!="02"){throw"malformed RSA key(code:004)"}n.e=ASN1HEX.getHexOfV_AtObj(p,o[1]);return n},parsePrivateRawRSAKeyHexAtObj:function(o,q){var p=q.keyidx;if(o.substr(p,2)!="30"){throw"malformed RSA private key(code:001)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(o,p);if(n.length!=9){throw"malformed RSA private key(code:002)"}q.key={};q.key.n=ASN1HEX.getHexOfV_AtObj(o,n[1]);q.key.e=ASN1HEX.getHexOfV_AtObj(o,n[2]);q.key.d=ASN1HEX.getHexOfV_AtObj(o,n[3]);q.key.p=ASN1HEX.getHexOfV_AtObj(o,n[4]);q.key.q=ASN1HEX.getHexOfV_AtObj(o,n[5]);q.key.dp=ASN1HEX.getHexOfV_AtObj(o,n[6]);q.key.dq=ASN1HEX.getHexOfV_AtObj(o,n[7]);q.key.co=ASN1HEX.getHexOfV_AtObj(o,n[8])},parsePrivateRawECKeyHexAtObj:function(o,q){var p=q.keyidx;if(o.substr(p,2)!="30"){throw"malformed ECC private key(code:001)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(o,p);if(n.length!=3){throw"malformed ECC private key(code:002)"}if(o.substr(n[1],2)!="04"){throw"malformed ECC private key(code:003)"}q.key=ASN1HEX.getHexOfV_AtObj(o,n[1])},parsePublicPKCS8Hex:function(q){var o={};o.algparam=null;var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,0);if(p.length!=2){throw"outer DERSequence shall have 2 elements: "+p.length}var r=p[0];if(q.substr(r,2)!="30"){throw"malformed PKCS8 public key(code:001)"}var n=ASN1HEX.getPosArrayOfChildren_AtObj(q,r);if(n.length!=2){throw"malformed PKCS8 public key(code:002)"}if(q.substr(n[0],2)!="06"){throw"malformed PKCS8 public key(code:003)"}o.algoid=ASN1HEX.getHexOfV_AtObj(q,n[0]);if(q.substr(n[1],2)=="06"){o.algparam=ASN1HEX.getHexOfV_AtObj(q,n[1])}if(q.substr(p[1],2)!="03"){throw"malformed PKCS8 public key(code:004)"}o.key=ASN1HEX.getHexOfV_AtObj(q,p[1]).substr(2);return o},getRSAKeyFromPublicPKCS8Hex:function(r){var q=ASN1HEX.getPosArrayOfChildren_AtObj(r,0);if(q.length!=2){throw"outer DERSequence shall have 2 elements: "+q.length}var p=ASN1HEX.getHexOfTLV_AtObj(r,q[0]);if(p!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmId is not rsaEncryption"}if(r.substr(q[1],2)!="03"){throw"PKCS8 Public Key is not BITSTRING encapslated."}var t=ASN1HEX.getStartPosOfV_AtObj(r,q[1])+2;if(r.substr(t,2)!="30"){throw"PKCS8 Public Key is not SEQUENCE."}var n=ASN1HEX.getPosArrayOfChildren_AtObj(r,t);if(n.length!=2){throw"inner DERSequence shall have 2 elements: "+n.length}if(r.substr(n[0],2)!="02"){throw"N is not ASN.1 INTEGER"}if(r.substr(n[1],2)!="02"){throw"E is not ASN.1 INTEGER"}var u=ASN1HEX.getHexOfV_AtObj(r,n[0]);var s=ASN1HEX.getHexOfV_AtObj(r,n[1]);var o=new RSAKey();o.setPublic(u,s);return o},}}();
/*! keyutil-1.0.7.js (c) 2013-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var KEYUTIL=function(){var d=function(p,r,q){return k(CryptoJS.AES,p,r,q)};var e=function(p,r,q){return k(CryptoJS.TripleDES,p,r,q)};var a=function(p,r,q){return k(CryptoJS.DES,p,r,q)};var k=function(s,x,u,q){var r=CryptoJS.enc.Hex.parse(x);var w=CryptoJS.enc.Hex.parse(u);var p=CryptoJS.enc.Hex.parse(q);var t={};t.key=w;t.iv=p;t.ciphertext=r;var v=s.decrypt(t,w,{iv:p});return CryptoJS.enc.Hex.stringify(v)};var l=function(p,r,q){return g(CryptoJS.AES,p,r,q)};var o=function(p,r,q){return g(CryptoJS.TripleDES,p,r,q)};var f=function(p,r,q){return g(CryptoJS.DES,p,r,q)};var g=function(t,y,v,q){var s=CryptoJS.enc.Hex.parse(y);var x=CryptoJS.enc.Hex.parse(v);var p=CryptoJS.enc.Hex.parse(q);var w=t.encrypt(s,x,{iv:p});var r=CryptoJS.enc.Hex.parse(w.toString());var u=CryptoJS.enc.Base64.stringify(r);return u};var i={"AES-256-CBC":{proc:d,eproc:l,keylen:32,ivlen:16},"AES-192-CBC":{proc:d,eproc:l,keylen:24,ivlen:16},"AES-128-CBC":{proc:d,eproc:l,keylen:16,ivlen:16},"DES-EDE3-CBC":{proc:e,eproc:o,keylen:24,ivlen:8},"DES-CBC":{proc:a,eproc:f,keylen:8,ivlen:8}};var c=function(p){return i[p]["proc"]};var m=function(p){var r=CryptoJS.lib.WordArray.random(p);var q=CryptoJS.enc.Hex.stringify(r);return q};var n=function(t){var u={};if(t.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)","m"))){u.cipher=RegExp.$1;u.ivsalt=RegExp.$2}if(t.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"))){u.type=RegExp.$1}var r=-1;var v=0;if(t.indexOf("\r\n\r\n")!=-1){r=t.indexOf("\r\n\r\n");v=2}if(t.indexOf("\n\n")!=-1){r=t.indexOf("\n\n");v=1}var q=t.indexOf("-----END");if(r!=-1&&q!=-1){var p=t.substring(r+v*2,q-v);p=p.replace(/\s+/g,"");u.data=p}return u};var j=function(q,y,p){var v=p.substring(0,16);var t=CryptoJS.enc.Hex.parse(v);var r=CryptoJS.enc.Utf8.parse(y);var u=i[q]["keylen"]+i[q]["ivlen"];var x="";var w=null;for(;;){var s=CryptoJS.algo.MD5.create();if(w!=null){s.update(w)}s.update(r);s.update(t);w=s.finalize();x=x+CryptoJS.enc.Hex.stringify(w);if(x.length>=u*2){break}}var z={};z.keyhex=x.substr(0,i[q]["keylen"]*2);z.ivhex=x.substr(i[q]["keylen"]*2,i[q]["ivlen"]*2);return z};var b=function(p,v,r,w){var s=CryptoJS.enc.Base64.parse(p);var q=CryptoJS.enc.Hex.stringify(s);var u=i[v]["proc"];var t=u(q,r,w);return t};var h=function(p,s,q,u){var r=i[s]["eproc"];var t=r(p,q,u);return t};return{version:"1.0.0",getHexFromPEM:function(q,u){var r=q;if(r.indexOf("-----BEGIN ")==-1){throw"can't find PEM header: "+u}if(typeof u=="string"&&u!=""){r=r.replace("-----BEGIN "+u+"-----","");r=r.replace("-----END "+u+"-----","")}else{r=r.replace(/-----BEGIN [^-]+-----/,"");r=r.replace(/-----END [^-]+-----/,"")}var t=r.replace(/\s+/g,"");var p=b64tohex(t);return p},getDecryptedKeyHexByKeyIV:function(q,t,s,r){var p=c(t);return p(q,s,r)},parsePKCS5PEM:function(p){return n(p)},getKeyAndUnusedIvByPasscodeAndIvsalt:function(q,p,r){return j(q,p,r)},decryptKeyB64:function(p,r,q,s){return b(p,r,q,s)},getDecryptedKeyHex:function(y,x){var q=n(y);var t=q.type;var r=q.cipher;var p=q.ivsalt;var s=q.data;var w=j(r,x,p);var v=w.keyhex;var u=b(s,r,v,p);return u},getRSAKeyFromEncryptedPKCS5PEM:function(r,q){var s=this.getDecryptedKeyHex(r,q);var p=new RSAKey();p.readPrivateKeyFromASN1HexString(s);return p},getEncryptedPKCS5PEMFromPrvKeyHex:function(x,s,A,t,r){var p="";if(typeof t=="undefined"||t==null){t="AES-256-CBC"}if(typeof i[t]=="undefined"){throw"KEYUTIL unsupported algorithm: "+t}if(typeof r=="undefined"||r==null){var v=i[t]["ivlen"];var u=m(v);r=u.toUpperCase()}var z=j(t,A,r);var y=z.keyhex;var w=h(s,t,y,r);var q=w.replace(/(.{64})/g,"$1\r\n");var p="-----BEGIN "+x+" PRIVATE KEY-----\r\n";p+="Proc-Type: 4,ENCRYPTED\r\n";p+="DEK-Info: "+t+","+r+"\r\n";p+="\r\n";p+=q;p+="\r\n-----END "+x+" PRIVATE KEY-----\r\n";return p},getEncryptedPKCS5PEMFromRSAKey:function(D,E,r,t){var B=new KJUR.asn1.DERInteger({"int":0});var w=new KJUR.asn1.DERInteger({bigint:D.n});var A=new KJUR.asn1.DERInteger({"int":D.e});var C=new KJUR.asn1.DERInteger({bigint:D.d});var u=new KJUR.asn1.DERInteger({bigint:D.p});var s=new KJUR.asn1.DERInteger({bigint:D.q});var z=new KJUR.asn1.DERInteger({bigint:D.dmp1});var v=new KJUR.asn1.DERInteger({bigint:D.dmq1});var y=new KJUR.asn1.DERInteger({bigint:D.coeff});var F=new KJUR.asn1.DERSequence({array:[B,w,A,C,u,s,z,v,y]});var x=F.getEncodedHex();return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA",x,E,r,t)},newEncryptedPKCS5PEM:function(p,q,t,u){if(typeof q=="undefined"||q==null){q=1024}if(typeof t=="undefined"||t==null){t="10001"}var r=new RSAKey();r.generate(q,t);var s=null;if(typeof u=="undefined"||u==null){s=this.getEncryptedPKCS5PEMFromRSAKey(r,p)}else{s=this.getEncryptedPKCS5PEMFromRSAKey(r,p,u)}return s},getRSAKeyFromPlainPKCS8PEM:function(r){if(r.match(/ENCRYPTED/)){throw"pem shall be not ENCRYPTED"}var q=this.getHexFromPEM(r,"PRIVATE KEY");var p=this.getRSAKeyFromPlainPKCS8Hex(q);return p},getRSAKeyFromPlainPKCS8Hex:function(s){var r=ASN1HEX.getPosArrayOfChildren_AtObj(s,0);if(r.length!=3){throw"outer DERSequence shall have 3 elements: "+r.length}var q=ASN1HEX.getHexOfTLV_AtObj(s,r[1]);if(q!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmIdentifier is not rsaEnc: "+q}var q=ASN1HEX.getHexOfTLV_AtObj(s,r[1]);var t=ASN1HEX.getHexOfTLV_AtObj(s,r[2]);var u=ASN1HEX.getHexOfV_AtObj(t,0);var p=new RSAKey();p.readPrivateKeyFromASN1HexString(u);return p},parseHexOfEncryptedPKCS8:function(w){var s={};var r=ASN1HEX.getPosArrayOfChildren_AtObj(w,0);if(r.length!=2){throw"malformed format: SEQUENCE(0).items != 2: "+r.length}s.ciphertext=ASN1HEX.getHexOfV_AtObj(w,r[1]);var y=ASN1HEX.getPosArrayOfChildren_AtObj(w,r[0]);if(y.length!=2){throw"malformed format: SEQUENCE(0.0).items != 2: "+y.length}if(ASN1HEX.getHexOfV_AtObj(w,y[0])!="2a864886f70d01050d"){throw"this only supports pkcs5PBES2"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(w,y[1]);if(y.length!=2){throw"malformed format: SEQUENCE(0.0.1).items != 2: "+p.length}var q=ASN1HEX.getPosArrayOfChildren_AtObj(w,p[1]);if(q.length!=2){throw"malformed format: SEQUENCE(0.0.1.1).items != 2: "+q.length}if(ASN1HEX.getHexOfV_AtObj(w,q[0])!="2a864886f70d0307"){throw"this only supports TripleDES"}s.encryptionSchemeAlg="TripleDES";s.encryptionSchemeIV=ASN1HEX.getHexOfV_AtObj(w,q[1]);var t=ASN1HEX.getPosArrayOfChildren_AtObj(w,p[0]);if(t.length!=2){throw"malformed format: SEQUENCE(0.0.1.0).items != 2: "+t.length}if(ASN1HEX.getHexOfV_AtObj(w,t[0])!="2a864886f70d01050c"){throw"this only supports pkcs5PBKDF2"}var x=ASN1HEX.getPosArrayOfChildren_AtObj(w,t[1]);if(x.length<2){throw"malformed format: SEQUENCE(0.0.1.0.1).items < 2: "+x.length}s.pbkdf2Salt=ASN1HEX.getHexOfV_AtObj(w,x[0]);var u=ASN1HEX.getHexOfV_AtObj(w,x[1]);try{s.pbkdf2Iter=parseInt(u,16)}catch(v){throw"malformed format pbkdf2Iter: "+u}return s},getPBKDF2KeyHexFromParam:function(u,p){var t=CryptoJS.enc.Hex.parse(u.pbkdf2Salt);var q=u.pbkdf2Iter;var s=CryptoJS.PBKDF2(p,t,{keySize:192/32,iterations:q});var r=CryptoJS.enc.Hex.stringify(s);return r},getPlainPKCS8HexFromEncryptedPKCS8PEM:function(x,y){var r=this.getHexFromPEM(x,"ENCRYPTED PRIVATE KEY");var p=this.parseHexOfEncryptedPKCS8(r);var u=KEYUTIL.getPBKDF2KeyHexFromParam(p,y);var v={};v.ciphertext=CryptoJS.enc.Hex.parse(p.ciphertext);var t=CryptoJS.enc.Hex.parse(u);var s=CryptoJS.enc.Hex.parse(p.encryptionSchemeIV);var w=CryptoJS.TripleDES.decrypt(v,t,{iv:s});var q=CryptoJS.enc.Hex.stringify(w);return q},getRSAKeyFromEncryptedPKCS8PEM:function(s,r){var q=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(s,r);var p=this.getRSAKeyFromPlainPKCS8Hex(q);return p},getKeyFromEncryptedPKCS8PEM:function(s,q){var p=this.getPlainPKCS8HexFromEncryptedPKCS8PEM(s,q);var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},parsePlainPrivatePKCS8Hex:function(s){var q={};q.algparam=null;if(s.substr(0,2)!="30"){throw"malformed plain PKCS8 private key(code:001)"}var r=ASN1HEX.getPosArrayOfChildren_AtObj(s,0);if(r.length!=3){throw"malformed plain PKCS8 private key(code:002)"}if(s.substr(r[1],2)!="30"){throw"malformed PKCS8 private key(code:003)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(s,r[1]);if(p.length!=2){throw"malformed PKCS8 private key(code:004)"}if(s.substr(p[0],2)!="06"){throw"malformed PKCS8 private key(code:005)"}q.algoid=ASN1HEX.getHexOfV_AtObj(s,p[0]);if(s.substr(p[1],2)=="06"){q.algparam=ASN1HEX.getHexOfV_AtObj(s,p[1])}if(s.substr(r[2],2)!="04"){throw"malformed PKCS8 private key(code:006)"}q.keyidx=ASN1HEX.getStartPosOfV_AtObj(s,r[2]);return q},getKeyFromPlainPrivatePKCS8PEM:function(q){var p=this.getHexFromPEM(q,"PRIVATE KEY");var r=this.getKeyFromPlainPrivatePKCS8Hex(p);return r},getKeyFromPlainPrivatePKCS8Hex:function(p){var w=this.parsePlainPrivatePKCS8Hex(p);if(w.algoid=="2a864886f70d010101"){this.parsePrivateRawRSAKeyHexAtObj(p,w);var u=w.key;var z=new RSAKey();z.setPrivateEx(u.n,u.e,u.d,u.p,u.q,u.dp,u.dq,u.co);return z}else{if(w.algoid=="2a8648ce3d0201"){this.parsePrivateRawECKeyHexAtObj(p,w);if(KJUR.crypto.OID.oidhex2name[w.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+w.algparam}var v=KJUR.crypto.OID.oidhex2name[w.algparam];var z=new KJUR.crypto.ECDSA({curve:v});z.setPublicKeyHex(w.pubkey);z.setPrivateKeyHex(w.key);z.isPublic=false;return z}else{if(w.algoid=="2a8648ce380401"){var t=ASN1HEX.getVbyList(p,0,[1,1,0],"02");var s=ASN1HEX.getVbyList(p,0,[1,1,1],"02");var y=ASN1HEX.getVbyList(p,0,[1,1,2],"02");var B=ASN1HEX.getVbyList(p,0,[2,0],"02");var r=new BigInteger(t,16);var q=new BigInteger(s,16);var x=new BigInteger(y,16);var A=new BigInteger(B,16);var z=new KJUR.crypto.DSA();z.setPrivate(r,q,x,null,A);return z}else{throw"unsupported private key algorithm"}}}},getRSAKeyFromPublicPKCS8PEM:function(q){var r=this.getHexFromPEM(q,"PUBLIC KEY");var p=this.getRSAKeyFromPublicPKCS8Hex(r);return p},getKeyFromPublicPKCS8PEM:function(q){var r=this.getHexFromPEM(q,"PUBLIC KEY");var p=this.getKeyFromPublicPKCS8Hex(r);return p},getKeyFromPublicPKCS8Hex:function(q){var p=this.parsePublicPKCS8Hex(q);if(p.algoid=="2a864886f70d010101"){var u=this.parsePublicRawRSAKeyHex(p.key);var r=new RSAKey();r.setPublic(u.n,u.e);return r}else{if(p.algoid=="2a8648ce3d0201"){if(KJUR.crypto.OID.oidhex2name[p.algparam]===undefined){throw"KJUR.crypto.OID.oidhex2name undefined: "+p.algparam}var s=KJUR.crypto.OID.oidhex2name[p.algparam];var r=new KJUR.crypto.ECDSA({curve:s,pub:p.key});return r}else{if(p.algoid=="2a8648ce380401"){var t=p.algparam;var v=ASN1HEX.getHexOfV_AtObj(p.key,0);var r=new KJUR.crypto.DSA();r.setPublic(new BigInteger(t.p,16),new BigInteger(t.q,16),new BigInteger(t.g,16),new BigInteger(v,16));return r}else{throw"unsupported public key algorithm"}}}},parsePublicRawRSAKeyHex:function(r){var p={};if(r.substr(0,2)!="30"){throw"malformed RSA key(code:001)"}var q=ASN1HEX.getPosArrayOfChildren_AtObj(r,0);if(q.length!=2){throw"malformed RSA key(code:002)"}if(r.substr(q[0],2)!="02"){throw"malformed RSA key(code:003)"}p.n=ASN1HEX.getHexOfV_AtObj(r,q[0]);if(r.substr(q[1],2)!="02"){throw"malformed RSA key(code:004)"}p.e=ASN1HEX.getHexOfV_AtObj(r,q[1]);return p},parsePrivateRawRSAKeyHexAtObj:function(q,s){var r=s.keyidx;if(q.substr(r,2)!="30"){throw"malformed RSA private key(code:001)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(q,r);if(p.length!=9){throw"malformed RSA private key(code:002)"}s.key={};s.key.n=ASN1HEX.getHexOfV_AtObj(q,p[1]);s.key.e=ASN1HEX.getHexOfV_AtObj(q,p[2]);s.key.d=ASN1HEX.getHexOfV_AtObj(q,p[3]);s.key.p=ASN1HEX.getHexOfV_AtObj(q,p[4]);s.key.q=ASN1HEX.getHexOfV_AtObj(q,p[5]);s.key.dp=ASN1HEX.getHexOfV_AtObj(q,p[6]);s.key.dq=ASN1HEX.getHexOfV_AtObj(q,p[7]);s.key.co=ASN1HEX.getHexOfV_AtObj(q,p[8])},parsePrivateRawECKeyHexAtObj:function(p,t){var q=t.keyidx;var r=ASN1HEX.getVbyList(p,q,[1],"04");var s=ASN1HEX.getVbyList(p,q,[2,0],"03").substr(2);t.key=r;t.pubkey=s},parsePublicPKCS8Hex:function(s){var q={};q.algparam=null;var r=ASN1HEX.getPosArrayOfChildren_AtObj(s,0);if(r.length!=2){throw"outer DERSequence shall have 2 elements: "+r.length}var t=r[0];if(s.substr(t,2)!="30"){throw"malformed PKCS8 public key(code:001)"}var p=ASN1HEX.getPosArrayOfChildren_AtObj(s,t);if(p.length!=2){throw"malformed PKCS8 public key(code:002)"}if(s.substr(p[0],2)!="06"){throw"malformed PKCS8 public key(code:003)"}q.algoid=ASN1HEX.getHexOfV_AtObj(s,p[0]);if(s.substr(p[1],2)=="06"){q.algparam=ASN1HEX.getHexOfV_AtObj(s,p[1])}else{if(s.substr(p[1],2)=="30"){q.algparam={};q.algparam.p=ASN1HEX.getVbyList(s,p[1],[0],"02");q.algparam.q=ASN1HEX.getVbyList(s,p[1],[1],"02");q.algparam.g=ASN1HEX.getVbyList(s,p[1],[2],"02")}}if(s.substr(r[1],2)!="03"){throw"malformed PKCS8 public key(code:004)"}q.key=ASN1HEX.getHexOfV_AtObj(s,r[1]).substr(2);return q},getRSAKeyFromPublicPKCS8Hex:function(t){var s=ASN1HEX.getPosArrayOfChildren_AtObj(t,0);if(s.length!=2){throw"outer DERSequence shall have 2 elements: "+s.length}var r=ASN1HEX.getHexOfTLV_AtObj(t,s[0]);if(r!="300d06092a864886f70d0101010500"){throw"PKCS8 AlgorithmId is not rsaEncryption"}if(t.substr(s[1],2)!="03"){throw"PKCS8 Public Key is not BITSTRING encapslated."}var v=ASN1HEX.getStartPosOfV_AtObj(t,s[1])+2;if(t.substr(v,2)!="30"){throw"PKCS8 Public Key is not SEQUENCE."}var p=ASN1HEX.getPosArrayOfChildren_AtObj(t,v);if(p.length!=2){throw"inner DERSequence shall have 2 elements: "+p.length}if(t.substr(p[0],2)!="02"){throw"N is not ASN.1 INTEGER"}if(t.substr(p[1],2)!="02"){throw"E is not ASN.1 INTEGER"}var w=ASN1HEX.getHexOfV_AtObj(t,p[0]);var u=ASN1HEX.getHexOfV_AtObj(t,p[1]);var q=new RSAKey();q.setPublic(w,u);return q},}}();KEYUTIL.getKey=function(c,o,i){if(typeof RSAKey!="undefined"&&c instanceof RSAKey){return c}if(typeof KJUR.crypto.ECDSA!="undefined"&&c instanceof KJUR.crypto.ECDSA){return c}if(typeof KJUR.crypto.DSA!="undefined"&&c instanceof KJUR.crypto.DSA){return c}if(c.xy!==undefined&&c.curve!==undefined){return new KJUR.crypto.ECDSA({prv:c.xy,curve:c.curve})}if(c.n!==undefined&&c.e!==undefined&&c.d!==undefined&&c.p!==undefined&&c.q!==undefined&&c.dp!==undefined&&c.dq!==undefined&&c.co!==undefined){var n=new RSAKey();n.setPrivateEx(c.n,c.e,c.d,c.p,c.q,c.dp,c.dq,c.co);return n}if(c.p!==undefined&&c.q!==undefined&&c.g!==undefined&&c.y!==undefined&&c.x!==undefined){var n=new KJUR.crypto.DSA();n.setPrivate(c.p,c.q,c.g,c.y,c.x);return n}if(c.d!==undefined&&c.curve!==undefined){return new KJUR.crypto.ECDSA({pub:c.d,curve:c.curve})}if(c.n!==undefined&&c.e){var n=new RSAKey();n.setPublic(c.n,c.e);return n}if(c.p!==undefined&&c.q!==undefined&&c.g!==undefined&&c.y!==undefined&&c.x===undefined){var n=new KJUR.crypto.DSA();n.setPublic(c.p,c.q,c.g,c.y);return n}if(c.indexOf("-END CERTIFICATE-",0)!=-1||c.indexOf("-END X509 CERTIFICATE-",0)!=-1||c.indexOf("-END TRUSTED CERTIFICATE-",0)!=-1){return X509.getPublicKeyFromCertPEM(c)}if(i==="pkcs8pub"){return KEYUTIL.getKeyFromPublicPKCS8Hex(c)}if(c.indexOf("-END PUBLIC KEY-")!=-1){return KEYUTIL.getKeyFromPublicPKCS8PEM(c)}if(i==="pkcs5prv"){var n=new RSAKey();n.readPrivateKeyFromASN1HexString(c);return n}if(i==="pkcs5prv"){var n=new RSAKey();n.readPrivateKeyFromASN1HexString(c);return n}if(c.indexOf("-END RSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")==-1){var n=new RSAKey();n.readPrivateKeyFromPEMString(c);return n}if(c.indexOf("-END DSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")==-1){var m=this.getHexFromPEM(c,"DSA PRIVATE KEY");var b=ASN1HEX.getVbyList(m,0,[1],"02");var a=ASN1HEX.getVbyList(m,0,[2],"02");var e=ASN1HEX.getVbyList(m,0,[3],"02");var k=ASN1HEX.getVbyList(m,0,[4],"02");var l=ASN1HEX.getVbyList(m,0,[5],"02");var n=new KJUR.crypto.DSA();n.setPrivate(new BigInteger(b,16),new BigInteger(a,16),new BigInteger(e,16),new BigInteger(k,16),new BigInteger(l,16));return n}if(c.indexOf("-END PRIVATE KEY-")!=-1){return KEYUTIL.getKeyFromPlainPrivatePKCS8PEM(c)}if(c.indexOf("-END RSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")!=-1){return KEYUTIL.getRSAKeyFromEncryptedPKCS5PEM(c,o)}if(c.indexOf("-END EC PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")!=-1){var m=KEYUTIL.getDecryptedKeyHex(c,o);var n=ASN1HEX.getVbyList(m,0,[1],"04");var j=ASN1HEX.getVbyList(m,0,[2,0],"06");var d=ASN1HEX.getVbyList(m,0,[3,0],"03").substr(2);var h="";if(KJUR.crypto.OID.oidhex2name[j]!==undefined){h=KJUR.crypto.OID.oidhex2name[j]}else{throw"undefined OID(hex) in KJUR.crypto.OID: "+j}var f=new KJUR.crypto.ECDSA({name:h});f.setPublicKeyHex(d);f.setPrivateKeyHex(n);f.isPublic=false;return f}if(c.indexOf("-END DSA PRIVATE KEY-")!=-1&&c.indexOf("4,ENCRYPTED")!=-1){var m=KEYUTIL.getDecryptedKeyHex(c,o);var b=ASN1HEX.getVbyList(m,0,[1],"02");var a=ASN1HEX.getVbyList(m,0,[2],"02");var e=ASN1HEX.getVbyList(m,0,[3],"02");var k=ASN1HEX.getVbyList(m,0,[4],"02");var l=ASN1HEX.getVbyList(m,0,[5],"02");var n=new KJUR.crypto.DSA();n.setPrivate(new BigInteger(b,16),new BigInteger(a,16),new BigInteger(e,16),new BigInteger(k,16),new BigInteger(l,16));return n}if(c.indexOf("-END ENCRYPTED PRIVATE KEY-")!=-1){return KEYUTIL.getKeyFromEncryptedPKCS8PEM(c,o)}throw"not supported argument"};KEYUTIL.generateKeypair=function(a,c){if(a=="RSA"){var b=c;var h=new RSAKey();h.generate(b,"10001");h.isPrivate=true;h.isPublic=true;var f=new RSAKey();var e=h.n.toString(16);var i=h.e.toString(16);f.setPublic(e,i);f.isPrivate=false;f.isPublic=true;var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{if(a=="EC"){var d=c;var g=new KJUR.crypto.ECDSA({curve:d});var j=g.generateKeyPairHex();var h=new KJUR.crypto.ECDSA({curve:d});h.setPrivateKeyHex(j.ecprvhex);h.isPrivate=true;h.isPublic=false;var f=new KJUR.crypto.ECDSA({curve:d});f.setPublicKeyHex(j.ecpubhex);f.isPrivate=false;f.isPublic=true;var k={};k.prvKeyObj=h;k.pubKeyObj=f;return k}else{throw"unknown algorithm: "+a}}};KEYUTIL.getPEM=function(a,r,o,g,j){var v=KJUR.asn1;var u=KJUR.crypto;function p(s){var w=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{"int":{bigint:s.n}},{"int":s.e},{"int":{bigint:s.d}},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.dmp1}},{"int":{bigint:s.dmq1}},{"int":{bigint:s.coeff}}]});return w}function q(w){var s=KJUR.asn1.ASN1Util.newObject({seq:[{"int":1},{octstr:{hex:w.prvKeyHex}},{tag:["a0",true,{oid:{name:w.curveName}}]},{tag:["a1",true,{bitstr:{hex:"00"+w.pubKeyHex}}]}]});return s}function n(s){var w=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{"int":{bigint:s.p}},{"int":{bigint:s.q}},{"int":{bigint:s.g}},{"int":{bigint:s.y}},{"int":{bigint:s.x}}]});return w}if(((typeof RSAKey!="undefined"&&a instanceof RSAKey)||(typeof u.DSA!="undefined"&&a instanceof u.DSA)||(typeof u.ECDSA!="undefined"&&a instanceof u.ECDSA))&&a.isPublic==true&&(r===undefined||r=="PKCS8PUB")){var t=new KJUR.asn1.x509.SubjectPublicKeyInfo(a);var m=t.getEncodedHex();return v.ASN1Util.getPEMStringFromHex(m,"PUBLIC KEY")}if(r=="PKCS1PRV"&&typeof RSAKey!="undefined"&&a instanceof RSAKey&&(o===undefined||o==null)&&a.isPrivate==true){var t=p(a);var m=t.getEncodedHex();return v.ASN1Util.getPEMStringFromHex(m,"RSA PRIVATE KEY")}if(r=="PKCS1PRV"&&typeof RSAKey!="undefined"&&a instanceof KJUR.crypto.ECDSA&&(o===undefined||o==null)&&a.isPrivate==true){var f=new KJUR.asn1.DERObjectIdentifier({name:a.curveName});var l=f.getEncodedHex();var e=q(a);var k=e.getEncodedHex();var i="";i+=v.ASN1Util.getPEMStringFromHex(l,"EC PARAMETERS");i+=v.ASN1Util.getPEMStringFromHex(k,"EC PRIVATE KEY");return i}if(r=="PKCS1PRV"&&typeof KJUR.crypto.DSA!="undefined"&&a instanceof KJUR.crypto.DSA&&(o===undefined||o==null)&&a.isPrivate==true){var t=n(a);var m=t.getEncodedHex();return v.ASN1Util.getPEMStringFromHex(m,"DSA PRIVATE KEY")}if(r=="PKCS5PRV"&&typeof RSAKey!="undefined"&&a instanceof RSAKey&&(o!==undefined&&o!=null)&&a.isPrivate==true){var t=p(a);var m=t.getEncodedHex();if(g===undefined){g="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA",m,o,g)}if(r=="PKCS5PRV"&&typeof KJUR.crypto.ECDSA!="undefined"&&a instanceof KJUR.crypto.ECDSA&&(o!==undefined&&o!=null)&&a.isPrivate==true){var t=q(a);var m=t.getEncodedHex();if(g===undefined){g="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("EC",m,o,g)}if(r=="PKCS5PRV"&&typeof KJUR.crypto.DSA!="undefined"&&a instanceof KJUR.crypto.DSA&&(o!==undefined&&o!=null)&&a.isPrivate==true){var t=n(a);var m=t.getEncodedHex();if(g===undefined){g="DES-EDE3-CBC"}return this.getEncryptedPKCS5PEMFromPrvKeyHex("DSA",m,o,g)}var h=function(w,s){var y=b(w,s);var x=new KJUR.asn1.ASN1Util.newObject({seq:[{seq:[{oid:{name:"pkcs5PBES2"}},{seq:[{seq:[{oid:{name:"pkcs5PBKDF2"}},{seq:[{octstr:{hex:y.pbkdf2Salt}},{"int":y.pbkdf2Iter}]}]},{seq:[{oid:{name:"des-EDE3-CBC"}},{octstr:{hex:y.encryptionSchemeIV}}]}]}]},{octstr:{hex:y.ciphertext}}]});return x.getEncodedHex()};var b=function(D,E){var x=100;var C=CryptoJS.lib.WordArray.random(8);var B="DES-EDE3-CBC";var s=CryptoJS.lib.WordArray.random(8);var y=CryptoJS.PBKDF2(E,C,{keySize:192/32,iterations:x});var z=CryptoJS.enc.Hex.parse(D);var A=CryptoJS.TripleDES.encrypt(z,y,{iv:s})+"";var w={};w.ciphertext=A;w.pbkdf2Salt=CryptoJS.enc.Hex.stringify(C);w.pbkdf2Iter=x;w.encryptionSchemeAlg=B;w.encryptionSchemeIV=CryptoJS.enc.Hex.stringify(s);return w};if(r=="PKCS8PRV"&&typeof RSAKey!="undefined"&&a instanceof RSAKey&&a.isPrivate==true){var d=p(a);var c=d.getEncodedHex();var t=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{seq:[{oid:{name:"rsaEncryption"}},{"null":true}]},{octstr:{hex:c}}]});var m=t.getEncodedHex();if(o===undefined||o==null){return v.ASN1Util.getPEMStringFromHex(m,"PRIVATE KEY")}else{var k=h(m,o);return v.ASN1Util.getPEMStringFromHex(k,"ENCRYPTED PRIVATE KEY")}}if(r=="PKCS8PRV"&&typeof KJUR.crypto.ECDSA!="undefined"&&a instanceof KJUR.crypto.ECDSA&&a.isPrivate==true){var d=new KJUR.asn1.ASN1Util.newObject({seq:[{"int":1},{octstr:{hex:a.prvKeyHex}},{tag:["a1",true,{bitstr:{hex:"00"+a.pubKeyHex}}]}]});var c=d.getEncodedHex();var t=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{seq:[{oid:{name:"ecPublicKey"}},{oid:{name:a.curveName}}]},{octstr:{hex:c}}]});var m=t.getEncodedHex();if(o===undefined||o==null){return v.ASN1Util.getPEMStringFromHex(m,"PRIVATE KEY")}else{var k=h(m,o);return v.ASN1Util.getPEMStringFromHex(k,"ENCRYPTED PRIVATE KEY")}}if(r=="PKCS8PRV"&&typeof KJUR.crypto.DSA!="undefined"&&a instanceof KJUR.crypto.DSA&&a.isPrivate==true){var d=new KJUR.asn1.DERInteger({bigint:a.x});var c=d.getEncodedHex();var t=KJUR.asn1.ASN1Util.newObject({seq:[{"int":0},{seq:[{oid:{name:"dsa"}},{seq:[{"int":{bigint:a.p}},{"int":{bigint:a.q}},{"int":{bigint:a.g}}]}]},{octstr:{hex:c}}]});var m=t.getEncodedHex();if(o===undefined||o==null){return v.ASN1Util.getPEMStringFromHex(m,"PRIVATE KEY")}else{var k=h(m,o);return v.ASN1Util.getPEMStringFromHex(k,"ENCRYPTED PRIVATE KEY")}}throw"unsupported object nor format"};KEYUTIL.getKeyFromCSRPEM=function(b){var a=KEYUTIL.getHexFromPEM(b,"CERTIFICATE REQUEST");var c=KEYUTIL.getKeyFromCSRHex(a);return c};KEYUTIL.getKeyFromCSRHex=function(a){var c=KEYUTIL.parseCSRHex(a);var b=KEYUTIL.getKey(c.p8pubkeyhex,null,"pkcs8pub");return b};KEYUTIL.parseCSRHex=function(c){var b={};var e=c;if(e.substr(0,2)!="30"){throw"malformed CSR(code:001)"}var d=ASN1HEX.getPosArrayOfChildren_AtObj(e,0);if(d.length<1){throw"malformed CSR(code:002)"}if(e.substr(d[0],2)!="30"){throw"malformed CSR(code:003)"}var a=ASN1HEX.getPosArrayOfChildren_AtObj(e,d[0]);if(a.length<3){throw"malformed CSR(code:004)"}b.p8pubkeyhex=ASN1HEX.getHexOfTLV_AtObj(e,a[2]);return b};
/*! rsapem-1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
function _rsapem_pemToBase64(b){var a=b;a=a.replace("-----BEGIN RSA PRIVATE KEY-----","");a=a.replace("-----END RSA PRIVATE KEY-----","");a=a.replace(/[ \n]+/g,"");return a}function _rsapem_getPosArrayOfChildrenFromHex(d){var j=new Array();var k=ASN1HEX.getStartPosOfV_AtObj(d,0);var f=ASN1HEX.getPosOfNextSibling_AtObj(d,k);var h=ASN1HEX.getPosOfNextSibling_AtObj(d,f);var b=ASN1HEX.getPosOfNextSibling_AtObj(d,h);var l=ASN1HEX.getPosOfNextSibling_AtObj(d,b);var e=ASN1HEX.getPosOfNextSibling_AtObj(d,l);var g=ASN1HEX.getPosOfNextSibling_AtObj(d,e);var c=ASN1HEX.getPosOfNextSibling_AtObj(d,g);var i=ASN1HEX.getPosOfNextSibling_AtObj(d,c);j.push(k,f,h,b,l,e,g,c,i);return j}function _rsapem_getHexValueArrayOfChildrenFromHex(i){var o=_rsapem_getPosArrayOfChildrenFromHex(i);var r=ASN1HEX.getHexOfV_AtObj(i,o[0]);var f=ASN1HEX.getHexOfV_AtObj(i,o[1]);var j=ASN1HEX.getHexOfV_AtObj(i,o[2]);var k=ASN1HEX.getHexOfV_AtObj(i,o[3]);var c=ASN1HEX.getHexOfV_AtObj(i,o[4]);var b=ASN1HEX.getHexOfV_AtObj(i,o[5]);var h=ASN1HEX.getHexOfV_AtObj(i,o[6]);var g=ASN1HEX.getHexOfV_AtObj(i,o[7]);var l=ASN1HEX.getHexOfV_AtObj(i,o[8]);var m=new Array();m.push(r,f,j,k,c,b,h,g,l);return m}function _rsapem_readPrivateKeyFromASN1HexString(c){var b=_rsapem_getHexValueArrayOfChildrenFromHex(c);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8])}function _rsapem_readPrivateKeyFromPEMString(e){var c=_rsapem_pemToBase64(e);var d=b64tohex(c);var b=_rsapem_getHexValueArrayOfChildrenFromHex(d);this.setPrivateEx(b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8])}RSAKey.prototype.readPrivateKeyFromPEMString=_rsapem_readPrivateKeyFromPEMString;RSAKey.prototype.readPrivateKeyFromASN1HexString=_rsapem_readPrivateKeyFromASN1HexString;
/*! rsasign-1.2.7.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
var _RE_HEXDECONLY=new RegExp("");_RE_HEXDECONLY.compile("[^0-9a-f]","gi");function _rsasign_getHexPaddedDigestInfoForString(d,e,a){var b=function(f){return KJUR.crypto.Util.hashString(f,a)};var c=b(d);return KJUR.crypto.Util.getPaddedDigestInfoHex(c,a,e)}function _zeroPaddingOfSignature(e,d){var c="";var a=d/4-e.length;for(var b=0;b<a;b++){c=c+"0"}return c+e}function _rsasign_signString(d,a){var b=function(e){return KJUR.crypto.Util.hashString(e,a)};var c=b(d);return this.signWithMessageHash(c,a)}function _rsasign_signWithMessageHash(e,c){var f=KJUR.crypto.Util.getPaddedDigestInfoHex(e,c,this.n.bitLength());var b=parseBigInt(f,16);var d=this.doPrivate(b);var a=d.toString(16);return _zeroPaddingOfSignature(a,this.n.bitLength())}function _rsasign_signStringWithSHA1(a){return _rsasign_signString.call(this,a,"sha1")}function _rsasign_signStringWithSHA256(a){return _rsasign_signString.call(this,a,"sha256")}function pss_mgf1_str(c,a,e){var b="",d=0;while(b.length<a){b+=hextorstr(e(rstrtohex(c+String.fromCharCode.apply(String,[(d&4278190080)>>24,(d&16711680)>>16,(d&65280)>>8,d&255]))));d+=1}return b}function _rsasign_signStringPSS(e,a,d){var c=function(f){return KJUR.crypto.Util.hashHex(f,a)};var b=c(rstrtohex(e));if(d===undefined){d=-1}return this.signWithMessageHashPSS(b,a,d)}function _rsasign_signWithMessageHashPSS(l,a,k){var b=hextorstr(l);var g=b.length;var m=this.n.bitLength()-1;var c=Math.ceil(m/8);var d;var o=function(i){return KJUR.crypto.Util.hashHex(i,a)};if(k===-1||k===undefined){k=g}else{if(k===-2){k=c-g-2}else{if(k<-2){throw"invalid salt length"}}}if(c<(g+k+2)){throw"data too long"}var f="";if(k>0){f=new Array(k);new SecureRandom().nextBytes(f);f=String.fromCharCode.apply(String,f)}var n=hextorstr(o(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+b+f)));var j=[];for(d=0;d<c-k-g-2;d+=1){j[d]=0}var e=String.fromCharCode.apply(String,j)+"\x01"+f;var h=pss_mgf1_str(n,e.length,o);var q=[];for(d=0;d<e.length;d+=1){q[d]=e.charCodeAt(d)^h.charCodeAt(d)}var p=(65280>>(8*c-m))&255;q[0]&=~p;for(d=0;d<g;d++){q.push(n.charCodeAt(d))}q.push(188);return _zeroPaddingOfSignature(this.doPrivate(new BigInteger(q)).toString(16),this.n.bitLength())}function _rsasign_getDecryptSignatureBI(a,d,c){var b=new RSAKey();b.setPublic(d,c);var e=b.doPublic(a);return e}function _rsasign_getHexDigestInfoFromSig(a,c,b){var e=_rsasign_getDecryptSignatureBI(a,c,b);var d=e.toString(16).replace(/^1f+00/,"");return d}function _rsasign_getAlgNameAndHashFromHexDisgestInfo(f){for(var e in KJUR.crypto.Util.DIGESTINFOHEAD){var d=KJUR.crypto.Util.DIGESTINFOHEAD[e];var b=d.length;if(f.substring(0,b)==d){var c=[e,f.substring(b)];return c}}return[]}function _rsasign_verifySignatureWithArgs(f,b,g,j){var e=_rsasign_getHexDigestInfoFromSig(b,g,j);var h=_rsasign_getAlgNameAndHashFromHexDisgestInfo(e);if(h.length==0){return false}var d=h[0];var i=h[1];var a=function(k){return KJUR.crypto.Util.hashString(k,d)};var c=a(f);return(i==c)}function _rsasign_verifyHexSignatureForMessage(c,b){var d=parseBigInt(c,16);var a=_rsasign_verifySignatureWithArgs(b,d,this.n.toString(16),this.e.toString(16));return a}function _rsasign_verifyString(f,j){j=j.replace(_RE_HEXDECONLY,"");j=j.replace(/[ \n]+/g,"");var b=parseBigInt(j,16);if(b.bitLength()>this.n.bitLength()){return 0}var i=this.doPublic(b);var e=i.toString(16).replace(/^1f+00/,"");var g=_rsasign_getAlgNameAndHashFromHexDisgestInfo(e);if(g.length==0){return false}var d=g[0];var h=g[1];var a=function(k){return KJUR.crypto.Util.hashString(k,d)};var c=a(f);return(h==c)}function _rsasign_verifyWithMessageHash(e,a){a=a.replace(_RE_HEXDECONLY,"");a=a.replace(/[ \n]+/g,"");var b=parseBigInt(a,16);if(b.bitLength()>this.n.bitLength()){return 0}var h=this.doPublic(b);var g=h.toString(16).replace(/^1f+00/,"");var c=_rsasign_getAlgNameAndHashFromHexDisgestInfo(g);if(c.length==0){return false}var d=c[0];var f=c[1];return(f==e)}function _rsasign_verifyStringPSS(c,b,a,f){var e=function(g){return KJUR.crypto.Util.hashHex(g,a)};var d=e(rstrtohex(c));if(f===undefined){f=-1}return this.verifyWithMessageHashPSS(d,b,a,f)}function _rsasign_verifyWithMessageHashPSS(f,s,l,c){var k=new BigInteger(s,16);if(k.bitLength()>this.n.bitLength()){return false}var r=function(i){return KJUR.crypto.Util.hashHex(i,l)};var j=hextorstr(f);var h=j.length;var g=this.n.bitLength()-1;var m=Math.ceil(g/8);var q;if(c===-1||c===undefined){c=h}else{if(c===-2){c=m-h-2}else{if(c<-2){throw"invalid salt length"}}}if(m<(h+c+2)){throw"data too long"}var a=this.doPublic(k).toByteArray();for(q=0;q<a.length;q+=1){a[q]&=255}while(a.length<m){a.unshift(0)}if(a[m-1]!==188){throw"encoded message does not end in 0xbc"}a=String.fromCharCode.apply(String,a);var d=a.substr(0,m-h-1);var e=a.substr(d.length,h);var p=(65280>>(8*m-g))&255;if((d.charCodeAt(0)&p)!==0){throw"bits beyond keysize not zero"}var n=pss_mgf1_str(e,d.length,r);var o=[];for(q=0;q<d.length;q+=1){o[q]=d.charCodeAt(q)^n.charCodeAt(q)}o[0]&=~p;var b=m-h-c-2;for(q=0;q<b;q+=1){if(o[q]!==0){throw"leftmost octets not zero"}}if(o[b]!==1){throw"0x01 marker not found"}return e===hextorstr(r(rstrtohex("\x00\x00\x00\x00\x00\x00\x00\x00"+j+String.fromCharCode.apply(String,o.slice(-c)))))}RSAKey.prototype.signWithMessageHash=_rsasign_signWithMessageHash;RSAKey.prototype.signString=_rsasign_signString;RSAKey.prototype.signStringWithSHA1=_rsasign_signStringWithSHA1;RSAKey.prototype.signStringWithSHA256=_rsasign_signStringWithSHA256;RSAKey.prototype.sign=_rsasign_signString;RSAKey.prototype.signWithSHA1=_rsasign_signStringWithSHA1;RSAKey.prototype.signWithSHA256=_rsasign_signStringWithSHA256;RSAKey.prototype.signWithMessageHashPSS=_rsasign_signWithMessageHashPSS;RSAKey.prototype.signStringPSS=_rsasign_signStringPSS;RSAKey.prototype.signPSS=_rsasign_signStringPSS;RSAKey.SALT_LEN_HLEN=-1;RSAKey.SALT_LEN_MAX=-2;RSAKey.prototype.verifyWithMessageHash=_rsasign_verifyWithMessageHash;RSAKey.prototype.verifyString=_rsasign_verifyString;RSAKey.prototype.verifyHexSignatureForMessage=_rsasign_verifyHexSignatureForMessage;RSAKey.prototype.verify=_rsasign_verifyString;RSAKey.prototype.verifyHexSignatureForByteArrayMessage=_rsasign_verifyHexSignatureForMessage;RSAKey.prototype.verifyWithMessageHashPSS=_rsasign_verifyWithMessageHashPSS;RSAKey.prototype.verifyStringPSS=_rsasign_verifyStringPSS;RSAKey.prototype.verifyPSS=_rsasign_verifyStringPSS;RSAKey.SALT_LEN_RECOVER=-2;
/*! x509-1.1.3.js (c) 2012-2014 Kenji Urushima | kjur.github.com/jsrsasign/license
 */
function X509(){this.subjectPublicKeyRSA=null;this.subjectPublicKeyRSA_hN=null;this.subjectPublicKeyRSA_hE=null;this.hex=null;this.getSerialNumberHex=function(){return ASN1HEX.getDecendantHexVByNthList(this.hex,0,[0,1])};this.getIssuerHex=function(){return ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,3])};this.getIssuerString=function(){return X509.hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,3]))};this.getSubjectHex=function(){return ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,5])};this.getSubjectString=function(){return X509.hex2dn(ASN1HEX.getDecendantHexTLVByNthList(this.hex,0,[0,5]))};this.getNotBefore=function(){var a=ASN1HEX.getDecendantHexVByNthList(this.hex,0,[0,4,0]);a=a.replace(/(..)/g,"%$1");a=decodeURIComponent(a);return a};this.getNotAfter=function(){var a=ASN1HEX.getDecendantHexVByNthList(this.hex,0,[0,4,1]);a=a.replace(/(..)/g,"%$1");a=decodeURIComponent(a);return a};this.readCertPEM=function(c){var e=X509.pemToHex(c);var b=X509.getPublicKeyHexArrayFromCertHex(e);var d=new RSAKey();d.setPublic(b[0],b[1]);this.subjectPublicKeyRSA=d;this.subjectPublicKeyRSA_hN=b[0];this.subjectPublicKeyRSA_hE=b[1];this.hex=e};this.readCertPEMWithoutRSAInit=function(c){var d=X509.pemToHex(c);var b=X509.getPublicKeyHexArrayFromCertHex(d);this.subjectPublicKeyRSA.setPublic(b[0],b[1]);this.subjectPublicKeyRSA_hN=b[0];this.subjectPublicKeyRSA_hE=b[1];this.hex=d}}X509.pemToBase64=function(a){var b=a;b=b.replace("-----BEGIN CERTIFICATE-----","");b=b.replace("-----END CERTIFICATE-----","");b=b.replace(/[ \n]+/g,"");return b};X509.pemToHex=function(a){var c=X509.pemToBase64(a);var b=b64tohex(c);return b};X509.getSubjectPublicKeyPosFromCertHex=function(f){var e=X509.getSubjectPublicKeyInfoPosFromCertHex(f);if(e==-1){return -1}var b=ASN1HEX.getPosArrayOfChildren_AtObj(f,e);if(b.length!=2){return -1}var d=b[1];if(f.substring(d,d+2)!="03"){return -1}var c=ASN1HEX.getStartPosOfV_AtObj(f,d);if(f.substring(c,c+2)!="00"){return -1}return c+2};X509.getSubjectPublicKeyInfoPosFromCertHex=function(d){var c=ASN1HEX.getStartPosOfV_AtObj(d,0);var b=ASN1HEX.getPosArrayOfChildren_AtObj(d,c);if(b.length<1){return -1}if(d.substring(b[0],b[0]+10)=="a003020102"){if(b.length<6){return -1}return b[6]}else{if(b.length<5){return -1}return b[5]}};X509.getPublicKeyHexArrayFromCertHex=function(f){var e=X509.getSubjectPublicKeyPosFromCertHex(f);var b=ASN1HEX.getPosArrayOfChildren_AtObj(f,e);if(b.length!=2){return[]}var d=ASN1HEX.getHexOfV_AtObj(f,b[0]);var c=ASN1HEX.getHexOfV_AtObj(f,b[1]);if(d!=null&&c!=null){return[d,c]}else{return[]}};X509.getHexTbsCertificateFromCert=function(b){var a=ASN1HEX.getStartPosOfV_AtObj(b,0);return a};X509.getPublicKeyHexArrayFromCertPEM=function(c){var d=X509.pemToHex(c);var b=X509.getPublicKeyHexArrayFromCertHex(d);return b};X509.hex2dn=function(e){var f="";var c=ASN1HEX.getPosArrayOfChildren_AtObj(e,0);for(var d=0;d<c.length;d++){var b=ASN1HEX.getHexOfTLV_AtObj(e,c[d]);f=f+"/"+X509.hex2rdn(b)}return f};X509.hex2rdn=function(a){var f=ASN1HEX.getDecendantHexTLVByNthList(a,0,[0,0]);var e=ASN1HEX.getDecendantHexVByNthList(a,0,[0,1]);var c="";try{c=X509.DN_ATTRHEX[f]}catch(b){c=f}e=e.replace(/(..)/g,"%$1");var d=decodeURIComponent(e);return c+"="+d};X509.DN_ATTRHEX={"0603550406":"C","060355040a":"O","060355040b":"OU","0603550403":"CN","0603550405":"SN","0603550408":"ST","0603550407":"L",};X509.getPublicKeyFromCertPEM=function(f){var c=X509.getPublicKeyInfoPropOfCertPEM(f);if(c.algoid=="2a864886f70d010101"){var i=KEYUTIL.parsePublicRawRSAKeyHex(c.keyhex);var j=new RSAKey();j.setPublic(i.n,i.e);return j}else{if(c.algoid=="2a8648ce3d0201"){var e=KJUR.crypto.OID.oidhex2name[c.algparam];var j=new KJUR.crypto.ECDSA({curve:e,info:c.keyhex});j.setPublicKeyHex(c.keyhex);return j}else{if(c.algoid=="2a8648ce380401"){var b=ASN1HEX.getVbyList(c.algparam,0,[0],"02");var a=ASN1HEX.getVbyList(c.algparam,0,[1],"02");var d=ASN1HEX.getVbyList(c.algparam,0,[2],"02");var h=ASN1HEX.getHexOfV_AtObj(c.keyhex,0);h=h.substr(2);var j=new KJUR.crypto.DSA();j.setPublic(new BigInteger(b,16),new BigInteger(a,16),new BigInteger(d,16),new BigInteger(h,16));return j}else{throw"unsupported key"}}}};X509.getPublicKeyInfoPropOfCertPEM=function(e){var c={};c.algparam=null;var g=X509.pemToHex(e);var d=ASN1HEX.getPosArrayOfChildren_AtObj(g,0);if(d.length!=3){throw"malformed X.509 certificate PEM (code:001)"}if(g.substr(d[0],2)!="30"){throw"malformed X.509 certificate PEM (code:002)"}var b=ASN1HEX.getPosArrayOfChildren_AtObj(g,d[0]);if(b.length<7){throw"malformed X.509 certificate PEM (code:003)"}var h=ASN1HEX.getPosArrayOfChildren_AtObj(g,b[6]);if(h.length!=2){throw"malformed X.509 certificate PEM (code:004)"}var f=ASN1HEX.getPosArrayOfChildren_AtObj(g,h[0]);if(f.length!=2){throw"malformed X.509 certificate PEM (code:005)"}c.algoid=ASN1HEX.getHexOfV_AtObj(g,f[0]);if(g.substr(f[1],2)=="06"){c.algparam=ASN1HEX.getHexOfV_AtObj(g,f[1])}else{if(g.substr(f[1],2)=="30"){c.algparam=ASN1HEX.getHexOfTLV_AtObj(g,f[1])}}if(g.substr(h[1],2)!="03"){throw"malformed X.509 certificate PEM (code:006)"}var a=ASN1HEX.getHexOfV_AtObj(g,h[1]);c.keyhex=a.substr(2);return c};


/**
 * End File: verifychain/jsrsasign-latest-all-min.js
 */

/**
 * File: verifychain/rootcertslist.js
 */

var certs = {
  "GTE CyberTrust Global Root": "-----BEGIN CERTIFICATE-----\nMIICWjCCAcMCAgGlMA0GCSqGSIb3DQEBBAUAMHUxCzAJBgNVBAYTAlVTMRgwFgYDVQQKEw9H\nVEUgQ29ycG9yYXRpb24xJzAlBgNVBAsTHkdURSBDeWJlclRydXN0IFNvbHV0aW9ucywgSW5j\nLjEjMCEGA1UEAxMaR1RFIEN5YmVyVHJ1c3QgR2xvYmFsIFJvb3QwHhcNOTgwODEzMDAyOTAw\nWhcNMTgwODEzMjM1OTAwWjB1MQswCQYDVQQGEwJVUzEYMBYGA1UEChMPR1RFIENvcnBvcmF0\naW9uMScwJQYDVQQLEx5HVEUgQ3liZXJUcnVzdCBTb2x1dGlvbnMsIEluYy4xIzAhBgNVBAMT\nGkdURSBDeWJlclRydXN0IEdsb2JhbCBSb290MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB\ngQCVD6C28FCc6HrHiM3dFw4usJTQGz0O9pTAipTHBsiQl8i4ZBp6fmw8U+E3KHNgf7KXUwef\nU/ltWJTSr41tiGeA5u2ylc9yMcqlHHK6XALnZELn+aks1joNrI1CqiQBOeacPwGFVw1Yh0X4\n04Wqk2kmhXBIgD8SFcd5tB8FLztimQIDAQABMA0GCSqGSIb3DQEBBAUAA4GBAG3rGwnpXtlR\n22ciYaQqPEh346B8pt5zohQDhT37qw4wxYMWM4ETCJ57NE7fQMh017l93PR2VX2bY1QY6fDq\n81yx2YtCHrnAlU66+tXifPVoYb+O7AWXX1uw16OFNMQkpw0PlZPvy5TYnh+dXIVtx6quTx8i\ntc2VrbqnzPmrC3p/\n-----END CERTIFICATE-----\n",
  "Thawte Server CA": "-----BEGIN CERTIFICATE-----\nMIIDEzCCAnygAwIBAgIBATANBgkqhkiG9w0BAQQFADCBxDELMAkGA1UEBhMCWkExFTATBgNV\nBAgTDFdlc3Rlcm4gQ2FwZTESMBAGA1UEBxMJQ2FwZSBUb3duMR0wGwYDVQQKExRUaGF3dGUg\nQ29uc3VsdGluZyBjYzEoMCYGA1UECxMfQ2VydGlmaWNhdGlvbiBTZXJ2aWNlcyBEaXZpc2lv\nbjEZMBcGA1UEAxMQVGhhd3RlIFNlcnZlciBDQTEmMCQGCSqGSIb3DQEJARYXc2VydmVyLWNl\ncnRzQHRoYXd0ZS5jb20wHhcNOTYwODAxMDAwMDAwWhcNMjAxMjMxMjM1OTU5WjCBxDELMAkG\nA1UEBhMCWkExFTATBgNVBAgTDFdlc3Rlcm4gQ2FwZTESMBAGA1UEBxMJQ2FwZSBUb3duMR0w\nGwYDVQQKExRUaGF3dGUgQ29uc3VsdGluZyBjYzEoMCYGA1UECxMfQ2VydGlmaWNhdGlvbiBT\nZXJ2aWNlcyBEaXZpc2lvbjEZMBcGA1UEAxMQVGhhd3RlIFNlcnZlciBDQTEmMCQGCSqGSIb3\nDQEJARYXc2VydmVyLWNlcnRzQHRoYXd0ZS5jb20wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJ\nAoGBANOkUG7I/1Zr5s9dtuoMaHVHoqrC2oQl/Kj0R1HahbUgdJSGHg91yekIYfUGbTBuFRkC\n6VLAYttNmZ7iagxEOM3+vuNkCXDF/rFrKbYvScg71CcEJRCXL+eQbcAoQpnXTEPew/UhbVSf\nXcNY4cDk2VuwuNy0e982OsK1ZiIS1ocNAgMBAAGjEzARMA8GA1UdEwEB/wQFMAMBAf8wDQYJ\nKoZIhvcNAQEEBQADgYEAB/pMaVz7lcxG7oWDTSEwjsrZqG9JGubaUeNgcGyEYRGhGshIPllD\nfU+VPaGLtwtimHp1it2ITk6eQNuozDJ0uW8NxuOzRAvZim+aKZuZGCg70eNAKJpaPNW15yAb\ni8qkq43pUdniTCxZqdq5snUb9kLy78fyGPmJvKP/iiMucEc=\n-----END CERTIFICATE-----\n",
  "Thawte Premium Server CA": "-----BEGIN CERTIFICATE-----\nMIIDJzCCApCgAwIBAgIBATANBgkqhkiG9w0BAQQFADCBzjELMAkGA1UEBhMCWkExFTATBgNV\nBAgTDFdlc3Rlcm4gQ2FwZTESMBAGA1UEBxMJQ2FwZSBUb3duMR0wGwYDVQQKExRUaGF3dGUg\nQ29uc3VsdGluZyBjYzEoMCYGA1UECxMfQ2VydGlmaWNhdGlvbiBTZXJ2aWNlcyBEaXZpc2lv\nbjEhMB8GA1UEAxMYVGhhd3RlIFByZW1pdW0gU2VydmVyIENBMSgwJgYJKoZIhvcNAQkBFhlw\ncmVtaXVtLXNlcnZlckB0aGF3dGUuY29tMB4XDTk2MDgwMTAwMDAwMFoXDTIwMTIzMTIzNTk1\nOVowgc4xCzAJBgNVBAYTAlpBMRUwEwYDVQQIEwxXZXN0ZXJuIENhcGUxEjAQBgNVBAcTCUNh\ncGUgVG93bjEdMBsGA1UEChMUVGhhd3RlIENvbnN1bHRpbmcgY2MxKDAmBgNVBAsTH0NlcnRp\nZmljYXRpb24gU2VydmljZXMgRGl2aXNpb24xITAfBgNVBAMTGFRoYXd0ZSBQcmVtaXVtIFNl\ncnZlciBDQTEoMCYGCSqGSIb3DQEJARYZcHJlbWl1bS1zZXJ2ZXJAdGhhd3RlLmNvbTCBnzAN\nBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEA0jY2aovXwlue2oFBYo847kkEVdbQ7xwblRZH7xhI\nNTpS9CtqBo87L+pW46+GjZ4X9560ZXUCTe/LCaIhUdib0GfQug2SBhRz1JPLlyoAnFxODLz6\nFVL88kRu2hFKbgifLy3j+ao6hnO2RlNYyIkFvYMRuHM/qgeN9EJN50CdHDcCAwEAAaMTMBEw\nDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQQFAAOBgQAmSCwWwlj66BZ0DKqqX1Q/8tfJ\neGBeXm43YyJ3Nn6yF8Q0ufUIhfzJATj/Tb7yFkJD57taRvvBxhEf8UqwKEbJw8RCfbz6q1lu\n1bdRiBHjpIUZa4JMpAwSremkrj/xw0llmozFyD4lt5SZu5IycQfwhl7tUCemDaYj+bvLpgcU\nQg==\n-----END CERTIFICATE-----\n",
  "Equifax Secure CA": "-----BEGIN CERTIFICATE-----\nMIIDIDCCAomgAwIBAgIENd70zzANBgkqhkiG9w0BAQUFADBOMQswCQYDVQQGEwJVUzEQMA4G\nA1UEChMHRXF1aWZheDEtMCsGA1UECxMkRXF1aWZheCBTZWN1cmUgQ2VydGlmaWNhdGUgQXV0\naG9yaXR5MB4XDTk4MDgyMjE2NDE1MVoXDTE4MDgyMjE2NDE1MVowTjELMAkGA1UEBhMCVVMx\nEDAOBgNVBAoTB0VxdWlmYXgxLTArBgNVBAsTJEVxdWlmYXggU2VjdXJlIENlcnRpZmljYXRl\nIEF1dGhvcml0eTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAwV2xWGcIYu6gmi0fCG2R\nFGiYCh7+2gRvE4RiIcPRfM6fBeC4AfBONOziipUEZKzxa1NfBbPLZ4C/QgKO/t0BCezhABRP\n/PvwDN1Dulsr4R+AcJkVV5MW8Q+XarfCaCMczE1ZMKxRHjuvK9buY0V7xdlfUNLjUA86iOe/\nFP3gx7kCAwEAAaOCAQkwggEFMHAGA1UdHwRpMGcwZaBjoGGkXzBdMQswCQYDVQQGEwJVUzEQ\nMA4GA1UEChMHRXF1aWZheDEtMCsGA1UECxMkRXF1aWZheCBTZWN1cmUgQ2VydGlmaWNhdGUg\nQXV0aG9yaXR5MQ0wCwYDVQQDEwRDUkwxMBoGA1UdEAQTMBGBDzIwMTgwODIyMTY0MTUxWjAL\nBgNVHQ8EBAMCAQYwHwYDVR0jBBgwFoAUSOZo+SvSspXXR9gjIBBPM5iQn9QwHQYDVR0OBBYE\nFEjmaPkr0rKV10fYIyAQTzOYkJ/UMAwGA1UdEwQFMAMBAf8wGgYJKoZIhvZ9B0EABA0wCxsF\nVjMuMGMDAgbAMA0GCSqGSIb3DQEBBQUAA4GBAFjOKer89961zgK5F7WF0bnj4JXMJTENAKaS\nbn+2kmOeUJXRmm/kEd5jhW6Y7qj/WsjTVbJmcVfewCHrPSqnI0kBBIZCe/zuf6IWUrVnZ9NA\n2zsmWLIodz2uFHdh1voqZiegDfqnc1zqcPGUIWVEX/r87yloqaKHee9570+sB3c4\n-----END CERTIFICATE-----\n",
  "Digital Signature Trust Co. Global CA 1": "-----BEGIN CERTIFICATE-----\nMIIDKTCCApKgAwIBAgIENnAVljANBgkqhkiG9w0BAQUFADBGMQswCQYDVQQGEwJVUzEkMCIG\nA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMREwDwYDVQQLEwhEU1RDQSBFMTAe\nFw05ODEyMTAxODEwMjNaFw0xODEyMTAxODQwMjNaMEYxCzAJBgNVBAYTAlVTMSQwIgYDVQQK\nExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xETAPBgNVBAsTCERTVENBIEUxMIGdMA0G\nCSqGSIb3DQEBAQUAA4GLADCBhwKBgQCgbIGpzzQeJN3+hijM3oMv+V7UQtLodGBmE5gGHKlR\nEmlvMVW5SXIACH7TpWJENySZj9mDSI+ZbZUTu0M7LklOiDfBu1h//uG9+LthzfNHwJmm8fOR\n6Hh8AMthyUQncWlVSn5JTe2io74CTADKAqjuAQIxZA9SLRN0dja1erQtcQIBA6OCASQwggEg\nMBEGCWCGSAGG+EIBAQQEAwIABzBoBgNVHR8EYTBfMF2gW6BZpFcwVTELMAkGA1UEBhMCVVMx\nJDAiBgNVBAoTG0RpZ2l0YWwgU2lnbmF0dXJlIFRydXN0IENvLjERMA8GA1UECxMIRFNUQ0Eg\nRTExDTALBgNVBAMTBENSTDEwKwYDVR0QBCQwIoAPMTk5ODEyMTAxODEwMjNagQ8yMDE4MTIx\nMDE4MTAyM1owCwYDVR0PBAQDAgEGMB8GA1UdIwQYMBaAFGp5fpFpRhgTCgJ3pVlbYJglDqL4\nMB0GA1UdDgQWBBRqeX6RaUYYEwoCd6VZW2CYJQ6i+DAMBgNVHRMEBTADAQH/MBkGCSqGSIb2\nfQdBAAQMMAobBFY0LjADAgSQMA0GCSqGSIb3DQEBBQUAA4GBACIS2Hod3IEGtgllsofIH160\nL+nEHvI8wbsEkBFKg05+k7lNQseSJqBcNJo4cvj9axY+IO6CizEqkzaFI4iKPANo08kJD038\nbKTaKHKTDomAsH3+gG9lbRgzl4vCa4nuYD3Im+9/KzJic5PLPON74nZ4RbyhkwS7hp86W0N6\nw4pl\n-----END CERTIFICATE-----\n",
  "Digital Signature Trust Co. Global CA 3": "-----BEGIN CERTIFICATE-----\nMIIDKTCCApKgAwIBAgIENm7TzjANBgkqhkiG9w0BAQUFADBGMQswCQYDVQQGEwJVUzEkMCIG\nA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMREwDwYDVQQLEwhEU1RDQSBFMjAe\nFw05ODEyMDkxOTE3MjZaFw0xODEyMDkxOTQ3MjZaMEYxCzAJBgNVBAYTAlVTMSQwIgYDVQQK\nExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xETAPBgNVBAsTCERTVENBIEUyMIGdMA0G\nCSqGSIb3DQEBAQUAA4GLADCBhwKBgQC/k48Xku8zExjrEH9OFr//Bo8qhbxe+SSmJIi2A7fB\nw18DW9Fvrn5C6mYjuGODVvsoLeE4i7TuqAHhzhy2iCoiRoX7n6dwqUcUP87eZfCocfdPJmyM\nvMa1795JJ/9IKn3oTQPMx7JSxhcxEzu1TdvIxPbDDyQq2gyd55FbgM2UnQIBA6OCASQwggEg\nMBEGCWCGSAGG+EIBAQQEAwIABzBoBgNVHR8EYTBfMF2gW6BZpFcwVTELMAkGA1UEBhMCVVMx\nJDAiBgNVBAoTG0RpZ2l0YWwgU2lnbmF0dXJlIFRydXN0IENvLjERMA8GA1UECxMIRFNUQ0Eg\nRTIxDTALBgNVBAMTBENSTDEwKwYDVR0QBCQwIoAPMTk5ODEyMDkxOTE3MjZagQ8yMDE4MTIw\nOTE5MTcyNlowCwYDVR0PBAQDAgEGMB8GA1UdIwQYMBaAFB6CTShlgDzJQW6sNS5ay97u+Dlb\nMB0GA1UdDgQWBBQegk0oZYA8yUFurDUuWsve7vg5WzAMBgNVHRMEBTADAQH/MBkGCSqGSIb2\nfQdBAAQMMAobBFY0LjADAgSQMA0GCSqGSIb3DQEBBQUAA4GBAEeNg61i8tuwnkUiBbmi1gMO\nOHLnnvx75pO2mqWilMg0HZHRxdf0CiUPPXiBng+xZ8SQTGPdXqfiup/1902lMXucKS1M/mQ+\n7LZT/uqb7YLbdHVLB3luHtgZg3Pe9T7Qtd7nS2h9Qy4qIOF+oHhEngj1mPnHfxsb1gYgAlih\nw6ID\n-----END CERTIFICATE-----\n",
  "Verisign Class 3 Public Primary Certification Authority": "-----BEGIN CERTIFICATE-----\nMIICPDCCAaUCEDyRMcsf9tAbDpq40ES/Er4wDQYJKoZIhvcNAQEFBQAwXzELMAkGA1UEBhMC\nVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMTcwNQYDVQQLEy5DbGFzcyAzIFB1YmxpYyBQ\ncmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5MB4XDTk2MDEyOTAwMDAwMFoXDTI4MDgw\nMjIzNTk1OVowXzELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMTcwNQYD\nVQQLEy5DbGFzcyAzIFB1YmxpYyBQcmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5MIGf\nMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJXFme8huKARS0EN8EQNvjV69qRUCPhAwL0TPZ\n2RHP7gJYHyX3KqhEBarsAx94f56TuZoAqiN91qyFomNFx3InzPRMxnVx0jnvT0Lwdd8KkMaO\nIG+YD/isI19wKTakyYbnsZogy1Olhec9vn2a/iRFM9x2Fe0PonFkTGUugWhFpwIDAQABMA0G\nCSqGSIb3DQEBBQUAA4GBABByUqkFFBkyCEHwxWsKzH4PIRnN5GfcX6kb5sroc50i2JhucwNh\nkcV8sEVAbkSdjbCxlnRhLQ2pRdKkkirWmnWXbj9T/UWZYB2oK0z5XqcJ2HUw19JlYD1n1khV\ndWk/kfVIC0dpImmClr7JyDiGSnoscxlIaU5rfGW/D/xwzoiQ\n-----END CERTIFICATE-----\n",
  "Verisign Class 3 Public Primary Certification Authority - G2": "-----BEGIN CERTIFICATE-----\nMIIDAjCCAmsCEH3Z/gfPqB63EHln+6eJNMYwDQYJKoZIhvcNAQEFBQAwgcExCzAJBgNVBAYT\nAlVTMRcwFQYDVQQKEw5WZXJpU2lnbiwgSW5jLjE8MDoGA1UECxMzQ2xhc3MgMyBQdWJsaWMg\nUHJpbWFyeSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSAtIEcyMTowOAYDVQQLEzEoYykgMTk5\nOCBWZXJpU2lnbiwgSW5jLiAtIEZvciBhdXRob3JpemVkIHVzZSBvbmx5MR8wHQYDVQQLExZW\nZXJpU2lnbiBUcnVzdCBOZXR3b3JrMB4XDTk4MDUxODAwMDAwMFoXDTI4MDgwMTIzNTk1OVow\ngcExCzAJBgNVBAYTAlVTMRcwFQYDVQQKEw5WZXJpU2lnbiwgSW5jLjE8MDoGA1UECxMzQ2xh\nc3MgMyBQdWJsaWMgUHJpbWFyeSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSAtIEcyMTowOAYD\nVQQLEzEoYykgMTk5OCBWZXJpU2lnbiwgSW5jLiAtIEZvciBhdXRob3JpemVkIHVzZSBvbmx5\nMR8wHQYDVQQLExZWZXJpU2lnbiBUcnVzdCBOZXR3b3JrMIGfMA0GCSqGSIb3DQEBAQUAA4GN\nADCBiQKBgQDMXtERXVxp0KvTuWpMmR9ZmDCOFoUgRm1HP9SFIIThbbP4pO0M8RcPO/mn+SXX\nwc+EY/J8Y8+iR/LGWzOOZEAEaMGAuWQcRXfH2G71lSk8UOg013gfqLptQ5GVj0VXXn7F+8qk\nBOvqlzdUMG+7AUcyM83cV5tkaWH4mx0ciU9cZwIDAQABMA0GCSqGSIb3DQEBBQUAA4GBAFFN\nzb5cy5gZnBWyATl4Lk0PZ3BwmcYQWpSkU01UbSuvDV1Ai2TT1+7eVmGSX6bEHRBhNtMsJzzo\nKQm5EWR0zLVznxxIqbxhAe7iF6YM40AIOw7n60RzKprxaZLvcRTDOaxxp5EJb+RxBrO6WVcm\neQD2+A2iMzAo1KpYoJ2daZH9\n-----END CERTIFICATE-----\n",
  "GlobalSign Root CA": "-----BEGIN CERTIFICATE-----\nMIIDdTCCAl2gAwIBAgILBAAAAAABFUtaw5QwDQYJKoZIhvcNAQEFBQAwVzELMAkGA1UEBhMC\nQkUxGTAXBgNVBAoTEEdsb2JhbFNpZ24gbnYtc2ExEDAOBgNVBAsTB1Jvb3QgQ0ExGzAZBgNV\nBAMTEkdsb2JhbFNpZ24gUm9vdCBDQTAeFw05ODA5MDExMjAwMDBaFw0yODAxMjgxMjAwMDBa\nMFcxCzAJBgNVBAYTAkJFMRkwFwYDVQQKExBHbG9iYWxTaWduIG52LXNhMRAwDgYDVQQLEwdS\nb290IENBMRswGQYDVQQDExJHbG9iYWxTaWduIFJvb3QgQ0EwggEiMA0GCSqGSIb3DQEBAQUA\nA4IBDwAwggEKAoIBAQDaDuaZjc6j40+Kfvvxi4Mla+pIH/EqsLmVEQS98GPR4mdmzxzdzxtI\nK+6NiY6arymAZavpxy0Sy6scTHAHoT0KMM0VjU/43dSMUBUc71DuxC73/OlS8pF94G3VNTCO\nXkNz8kHp1Wrjsok6Vjk4bwY8iGlbKk3Fp1S4bInMm/k8yuX9ifUSPJJ4ltbcdG6TRGHRjcdG\nsnUOhugZitVtbNV4FpWi6cgKOOvyJBNPc1STE4U6G7weNLWLBYy5d4ux2x8gkasJU26Qzns3\ndLlwR5EiUWMWea6xrkEmCMgZK9FGqkjWZCrXgzT/LCrBbBlDSgeF59N89iFo7+ryUp9/k5DP\nAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRg\ne2YaRQ2XyolQL30EzTSo//z9SzANBgkqhkiG9w0BAQUFAAOCAQEA1nPnfE920I2/7LqivjTF\nKDK1fPxsnCwrvQmeU79rXqoRSLblCKOzyj1hTdNGCbM+w6DjY1Ub8rrvrTnhQ7k4o+YviiY7\n76BQVvnGCv04zcQLcFGUl5gE38NflNUVyRRBnMRddWQVDf9VMOyGj/8N7yy5Y0b2qvzfvGn9\nLhJIZJrglfCm7ymPAbEVtQwdpf5pLGkkeB6zpxxxYu7KyJesF12KwvhHhm4qxFYxldBniYUr\n+WymXUadDKqC5JlR3XC321Y9YeRq4VzW9v493kHMB65jUr9TU/Qr6cf9tveCX4XSQRjbgbME\nHMUfpIBvFSDJ3gyICh3WZlXi/EjJKSZp4A==\n-----END CERTIFICATE-----\n",
  "GlobalSign Root CA - R2": "-----BEGIN CERTIFICATE-----\nMIIDujCCAqKgAwIBAgILBAAAAAABD4Ym5g0wDQYJKoZIhvcNAQEFBQAwTDEgMB4GA1UECxMX\nR2xvYmFsU2lnbiBSb290IENBIC0gUjIxEzARBgNVBAoTCkdsb2JhbFNpZ24xEzARBgNVBAMT\nCkdsb2JhbFNpZ24wHhcNMDYxMjE1MDgwMDAwWhcNMjExMjE1MDgwMDAwWjBMMSAwHgYDVQQL\nExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMjETMBEGA1UEChMKR2xvYmFsU2lnbjETMBEGA1UE\nAxMKR2xvYmFsU2lnbjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKbPJA6+Lm8o\nmUVCxKs+IVSbC9N/hHD6ErPLv4dfxn+G07IwXNb9rfF73OX4YJYJkhD10FPe+3t+c4isUoh7\nSqbKSaZeqKeMWhG8eoLrvozps6yWJQeXSpkqBy+0Hne/ig+1AnwblrjFuTosvNYSuetZfeLQ\nBoZfXklqtTleiDTsvHgMCJiEbKjNS7SgfQx5TfC4LcshytVsW33hoCmEofnTlEnLJGKRILzd\nC9XZzPnqJworc5HGnRusyMvo4KD0L5CLTfuwNhv2GXqF4G3yYROIXJ/gkwpRl4pazq+r1feq\nCapgvdzZX99yqWATXgAByUr6P6TqBwMhAo6CygPCm48CAwEAAaOBnDCBmTAOBgNVHQ8BAf8E\nBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUm+IHV2ccHsBqBt5ZtJot39wZhi4w\nNgYDVR0fBC8wLTAroCmgJ4YlaHR0cDovL2NybC5nbG9iYWxzaWduLm5ldC9yb290LXIyLmNy\nbDAfBgNVHSMEGDAWgBSb4gdXZxwewGoG3lm0mi3f3BmGLjANBgkqhkiG9w0BAQUFAAOCAQEA\nmYFThxxol4aR7OBKuEQLq4GsJ0/WwbgcQ3izDJr86iw8bmEbTUsp9Z8FHSbBuOmDAGJFtqkI\nk7mpM0sYmsL4h4hO291xNBrBVNpGP+DTKqttVCL1OmLNIG+6KYnX3ZHu01yiPqFbQfXf5WRD\nLenVOavSot+3i9DAgBkcRcAtjOj4LaR0VknFBbVPFd5uRHg5h6h+u/N5GJG79G+dwfCMNYxd\nAfvDbbnvRG15RjF+Cv6pgsH/76tuIMRQyV+dTZsXjAzlAcmgQWpzU/qlULRuJQ/7TBj0/VLZ\njmmx6BEP3ojY+x1J96relc8geMJgEtslQIxq/H5COEBkEveegeGTLg==\n-----END CERTIFICATE-----\n",
  "ValiCert Class 1 VA": "-----BEGIN CERTIFICATE-----\nMIIC5zCCAlACAQEwDQYJKoZIhvcNAQEFBQAwgbsxJDAiBgNVBAcTG1ZhbGlDZXJ0IFZhbGlk\nYXRpb24gTmV0d29yazEXMBUGA1UEChMOVmFsaUNlcnQsIEluYy4xNTAzBgNVBAsTLFZhbGlD\nZXJ0IENsYXNzIDEgUG9saWN5IFZhbGlkYXRpb24gQXV0aG9yaXR5MSEwHwYDVQQDExhodHRw\nOi8vd3d3LnZhbGljZXJ0LmNvbS8xIDAeBgkqhkiG9w0BCQEWEWluZm9AdmFsaWNlcnQuY29t\nMB4XDTk5MDYyNTIyMjM0OFoXDTE5MDYyNTIyMjM0OFowgbsxJDAiBgNVBAcTG1ZhbGlDZXJ0\nIFZhbGlkYXRpb24gTmV0d29yazEXMBUGA1UEChMOVmFsaUNlcnQsIEluYy4xNTAzBgNVBAsT\nLFZhbGlDZXJ0IENsYXNzIDEgUG9saWN5IFZhbGlkYXRpb24gQXV0aG9yaXR5MSEwHwYDVQQD\nExhodHRwOi8vd3d3LnZhbGljZXJ0LmNvbS8xIDAeBgkqhkiG9w0BCQEWEWluZm9AdmFsaWNl\ncnQuY29tMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYWYJ6ibiWuqYvaG9YLqdUHAZu\n9OqNSLwxlBfw8068srg1knaw0KWlAdcAAxIiGQj4/xEjm84H9b9pGib+TunRf50sQB1ZaG6m\n+FiwnRqP0z/x3BkGgagO4DrdyFNFCQbmD3DD+kCmDuJWBQ8YTfwggtFzVXSNdnKgHZ0dwN0/\ncQIDAQABMA0GCSqGSIb3DQEBBQUAA4GBAFBoPUn0LBwGlN+VYH+Wexf+T3GtZMjdd9LvWVXo\nP+iOBSoh8gfStadS/pyxtuJbdxdA6nLWI8sogTLDAHkY7FkXicnGah5xyf23dKUlRWnFSKsZ\n4UWKJWsZ7uW7EvV/96aNUcPwnXS3qT6gpf+2SQMT2iLM7XGCK5nPOrf1LXLI\n-----END CERTIFICATE-----\n",
  "ValiCert Class 2 VA": "-----BEGIN CERTIFICATE-----\nMIIC5zCCAlACAQEwDQYJKoZIhvcNAQEFBQAwgbsxJDAiBgNVBAcTG1ZhbGlDZXJ0IFZhbGlk\nYXRpb24gTmV0d29yazEXMBUGA1UEChMOVmFsaUNlcnQsIEluYy4xNTAzBgNVBAsTLFZhbGlD\nZXJ0IENsYXNzIDIgUG9saWN5IFZhbGlkYXRpb24gQXV0aG9yaXR5MSEwHwYDVQQDExhodHRw\nOi8vd3d3LnZhbGljZXJ0LmNvbS8xIDAeBgkqhkiG9w0BCQEWEWluZm9AdmFsaWNlcnQuY29t\nMB4XDTk5MDYyNjAwMTk1NFoXDTE5MDYyNjAwMTk1NFowgbsxJDAiBgNVBAcTG1ZhbGlDZXJ0\nIFZhbGlkYXRpb24gTmV0d29yazEXMBUGA1UEChMOVmFsaUNlcnQsIEluYy4xNTAzBgNVBAsT\nLFZhbGlDZXJ0IENsYXNzIDIgUG9saWN5IFZhbGlkYXRpb24gQXV0aG9yaXR5MSEwHwYDVQQD\nExhodHRwOi8vd3d3LnZhbGljZXJ0LmNvbS8xIDAeBgkqhkiG9w0BCQEWEWluZm9AdmFsaWNl\ncnQuY29tMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOOnHK5avIWZJV16vYdA757tn2\nVUdZZUcOBVXc65g2PFxTXdMwzzjsvUGJ7SVCCSRrCl6zfN1SLUzm1NZ9WlmpZdRJEy0kTRxQ\nb7XBhVQ7/nHk01xC+YDgkRoKWzk2Z/M/VXwbP7RfZHM047QSv4dk+NoS/zcnwbNDu+97bi5p\n9wIDAQABMA0GCSqGSIb3DQEBBQUAA4GBADt/UG9vUJSZSWI4OB9L+KXIPqeCgfYrx+jFzug6\nEILLGACOTb2oWH+heQC1u+mNr0HZDzTuIYEZoDJJKPTEjlbVUjP9UNV+mWwD5MlM/Mtsq2az\nSiGM5bUMMj4QssxsodyamEwCW/POuZ6lcg5Ktz885hZo+L7tdEy8W9ViH0Pd\n-----END CERTIFICATE-----\n",
  "RSA Root Certificate 1": "-----BEGIN CERTIFICATE-----\nMIIC5zCCAlACAQEwDQYJKoZIhvcNAQEFBQAwgbsxJDAiBgNVBAcTG1ZhbGlDZXJ0IFZhbGlk\nYXRpb24gTmV0d29yazEXMBUGA1UEChMOVmFsaUNlcnQsIEluYy4xNTAzBgNVBAsTLFZhbGlD\nZXJ0IENsYXNzIDMgUG9saWN5IFZhbGlkYXRpb24gQXV0aG9yaXR5MSEwHwYDVQQDExhodHRw\nOi8vd3d3LnZhbGljZXJ0LmNvbS8xIDAeBgkqhkiG9w0BCQEWEWluZm9AdmFsaWNlcnQuY29t\nMB4XDTk5MDYyNjAwMjIzM1oXDTE5MDYyNjAwMjIzM1owgbsxJDAiBgNVBAcTG1ZhbGlDZXJ0\nIFZhbGlkYXRpb24gTmV0d29yazEXMBUGA1UEChMOVmFsaUNlcnQsIEluYy4xNTAzBgNVBAsT\nLFZhbGlDZXJ0IENsYXNzIDMgUG9saWN5IFZhbGlkYXRpb24gQXV0aG9yaXR5MSEwHwYDVQQD\nExhodHRwOi8vd3d3LnZhbGljZXJ0LmNvbS8xIDAeBgkqhkiG9w0BCQEWEWluZm9AdmFsaWNl\ncnQuY29tMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDjmFGWHOjVsQaBalfDcnWTq8+e\npvzzFlLWLU2fNUSoLgRNB0mKOCn1dzfnt6td3zZxFJmP3MKS8edgkpfs2Ejcv8ECIMYkpChM\nMFp2bbFc893enhBxoYjHW5tBbcqwuI4V7q0zK89HBFx1cQqYJJgpp0lZpd34t0NiYfPT4tBV\nPwIDAQABMA0GCSqGSIb3DQEBBQUAA4GBAFa7AliEZwgs3x/be0kz9dNnnfS0ChCzycUs4pJq\ncXgn8nCDQtM+z6lU9PHYkhaM0QTLS6vJn0WuPIqpsHEzXcjFV9+vqDWzf4mH6eglkrh/hXqu\n1rweN1gqZ8mRzyqBPu3GOd/APhmcGcwTTYJBtYze4D1gCCAPRX5ron+jjBXu\n-----END CERTIFICATE-----\n",
  "Verisign Class 3 Public Primary Certification Authority - G3": "-----BEGIN CERTIFICATE-----\nMIIEGjCCAwICEQCbfgZJoz5iudXukEhxKe9XMA0GCSqGSIb3DQEBBQUAMIHKMQswCQYDVQQG\nEwJVUzEXMBUGA1UEChMOVmVyaVNpZ24sIEluYy4xHzAdBgNVBAsTFlZlcmlTaWduIFRydXN0\nIE5ldHdvcmsxOjA4BgNVBAsTMShjKSAxOTk5IFZlcmlTaWduLCBJbmMuIC0gRm9yIGF1dGhv\ncml6ZWQgdXNlIG9ubHkxRTBDBgNVBAMTPFZlcmlTaWduIENsYXNzIDMgUHVibGljIFByaW1h\ncnkgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgLSBHMzAeFw05OTEwMDEwMDAwMDBaFw0zNjA3\nMTYyMzU5NTlaMIHKMQswCQYDVQQGEwJVUzEXMBUGA1UEChMOVmVyaVNpZ24sIEluYy4xHzAd\nBgNVBAsTFlZlcmlTaWduIFRydXN0IE5ldHdvcmsxOjA4BgNVBAsTMShjKSAxOTk5IFZlcmlT\naWduLCBJbmMuIC0gRm9yIGF1dGhvcml6ZWQgdXNlIG9ubHkxRTBDBgNVBAMTPFZlcmlTaWdu\nIENsYXNzIDMgUHVibGljIFByaW1hcnkgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgLSBHMzCC\nASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMu6nFL8eB8aHm8bN3O9+MlrlBIwT/A2\nR/XQkQr1F8ilYcEWQE37imGQ5XYgwREGfassbqb1EUGO+i2tKmFZpGcmTNDovFJbcCAEWNF6\nyaRpvIMXZK0Fi7zQWM6NjPXr8EJJC52XJ2cybuGukxUccLwgTS8Y3pKI6GyFVxEa6X7jJhFU\nokWWVYPKMIno3Nij7SqAP395ZVc+FSBmCC+Vk7+qRy+oRpfwEuL+wgorUeZ25rdGt+INpsyo\nw0xZVYnm6FNcHOqd8GIWC6fJXwzw3sJ2zq/3avL6QaaiMxTJ5Xpj055iN9WFZZ4O5lMkdBte\nHRJTW8cs54NJOxWuimi5V5cCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAERSWwauSCPc/L8my\n/uRan2Te2yFPhpk0djZX3dAVL8WtfxUfN2JzPtTnX84XA9s1+ivbrmAJXx5fj267Cz3qWhMe\nDGBvtcC1IyIuBwvLqXTLR7sdwdela8wv0kL9Sd2nic9TutoAWii/gt/4uhMdUIaC/Y4wjylG\nsB49Ndo4YhYYSq3mtlFs3q9i6wHQHiT+eo8SGhJouPtmmRQURVyu565pF4ErWjfJXir0xuKh\nXFSbplQAz/DxwceYMBo7Nhbbo27q/a2ywtrvAkcTisDxszGtTxzhT5yvDwyd93gN2PQ1VoDa\nt20Xj50egWTh/sVFuq1ruQp6Tk9LhO5L8X3dEQ==\n-----END CERTIFICATE-----\n",
  "Verisign Class 4 Public Primary Certification Authority - G3": "-----BEGIN CERTIFICATE-----\nMIIEGjCCAwICEQDsoKeLbnVqAc/EfMwvlF7XMA0GCSqGSIb3DQEBBQUAMIHKMQswCQYDVQQG\nEwJVUzEXMBUGA1UEChMOVmVyaVNpZ24sIEluYy4xHzAdBgNVBAsTFlZlcmlTaWduIFRydXN0\nIE5ldHdvcmsxOjA4BgNVBAsTMShjKSAxOTk5IFZlcmlTaWduLCBJbmMuIC0gRm9yIGF1dGhv\ncml6ZWQgdXNlIG9ubHkxRTBDBgNVBAMTPFZlcmlTaWduIENsYXNzIDQgUHVibGljIFByaW1h\ncnkgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgLSBHMzAeFw05OTEwMDEwMDAwMDBaFw0zNjA3\nMTYyMzU5NTlaMIHKMQswCQYDVQQGEwJVUzEXMBUGA1UEChMOVmVyaVNpZ24sIEluYy4xHzAd\nBgNVBAsTFlZlcmlTaWduIFRydXN0IE5ldHdvcmsxOjA4BgNVBAsTMShjKSAxOTk5IFZlcmlT\naWduLCBJbmMuIC0gRm9yIGF1dGhvcml6ZWQgdXNlIG9ubHkxRTBDBgNVBAMTPFZlcmlTaWdu\nIENsYXNzIDQgUHVibGljIFByaW1hcnkgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgLSBHMzCC\nASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAK3LpRFpxlmr8Y+1GQ9Wzsy1HyDkniYl\nS+BzZYlZ3tCD5PUPtbut8XzoIfzk6AzufEUiGXaStBO3IFsJ+mGuqPKljYXCKtbeZjbSmwL0\nqJJgfJxptI8kHtCGUvYynEFYHiK9zUVilQhu0GbdU6LM8BDcVHOLBKFGMzNcF0C5nk3T875V\ng+ixiY5afJqWIpA7iCXy0lOIAgwLePLmNxdLMEYH5IBtptiWLugs+BGzOA1mppvqySNb247i\n8xOOGlktqgLw7KSHZtzBP/XYufTsgsbSPZUd5cBPhMnZo0QoBmrXRazwa2rvTl/4EYIeOGM0\nZlDUPpNz+jDDZq3/ky2X7wMCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAj/ola09b5KROJ1Wr\nIhVZPMq1CtRK26vdoV9TxaBXOcLORyu+OshWv8LZJxA6sQU8wHcxuzrTBXttmhwwjIDLk5Mq\ng6sFUYICABFna/OIYUdfA5PVWw3g8dShMjWFsjrbsIKr0csKvE+MW8VLADsfKoKmfjaF3H48\nZwC15DtS4KjrXRX5xm3wrR0OhbepmnMUWluPQSjA1egtTaRezarZ7c7c2NU8Qh0XwRJdRTjD\nOPP8hS6DRkiy1yBfkjaP53kPmF6Z6PDQpLv1U70qzlmwr25/bLvSHgCwIe34QWKCudiyxLtG\nUPMxxY8BqHTr9Xgn2uf3ZkPznoM+IKrDNWCRzg==\n-----END CERTIFICATE-----\n",
  "Entrust.net Secure Server CA": "-----BEGIN CERTIFICATE-----\nMIIE2DCCBEGgAwIBAgIEN0rSQzANBgkqhkiG9w0BAQUFADCBwzELMAkGA1UEBhMCVVMxFDAS\nBgNVBAoTC0VudHJ1c3QubmV0MTswOQYDVQQLEzJ3d3cuZW50cnVzdC5uZXQvQ1BTIGluY29y\ncC4gYnkgcmVmLiAobGltaXRzIGxpYWIuKTElMCMGA1UECxMcKGMpIDE5OTkgRW50cnVzdC5u\nZXQgTGltaXRlZDE6MDgGA1UEAxMxRW50cnVzdC5uZXQgU2VjdXJlIFNlcnZlciBDZXJ0aWZp\nY2F0aW9uIEF1dGhvcml0eTAeFw05OTA1MjUxNjA5NDBaFw0xOTA1MjUxNjM5NDBaMIHDMQsw\nCQYDVQQGEwJVUzEUMBIGA1UEChMLRW50cnVzdC5uZXQxOzA5BgNVBAsTMnd3dy5lbnRydXN0\nLm5ldC9DUFMgaW5jb3JwLiBieSByZWYuIChsaW1pdHMgbGlhYi4pMSUwIwYDVQQLExwoYykg\nMTk5OSBFbnRydXN0Lm5ldCBMaW1pdGVkMTowOAYDVQQDEzFFbnRydXN0Lm5ldCBTZWN1cmUg\nU2VydmVyIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MIGdMA0GCSqGSIb3DQEBAQUAA4GLADCB\nhwKBgQDNKIM0VBuJ8w+vN5Ex/68xYMmo6LIQaO2f55M28Qpku0f1BBc/I0dNxScZgSYMVHIN\niC3ZH5oSn7yzcdOAGT9HZnuMNSjSuQrfJNqc1lB5gXpa0zf3wkrYKZImZNHkmGw6AIr1NJtl\n+O3jEP/9uElY3KDegjlrgbEWGWG5VLbmQwIBA6OCAdcwggHTMBEGCWCGSAGG+EIBAQQEAwIA\nBzCCARkGA1UdHwSCARAwggEMMIHeoIHboIHYpIHVMIHSMQswCQYDVQQGEwJVUzEUMBIGA1UE\nChMLRW50cnVzdC5uZXQxOzA5BgNVBAsTMnd3dy5lbnRydXN0Lm5ldC9DUFMgaW5jb3JwLiBi\neSByZWYuIChsaW1pdHMgbGlhYi4pMSUwIwYDVQQLExwoYykgMTk5OSBFbnRydXN0Lm5ldCBM\naW1pdGVkMTowOAYDVQQDEzFFbnRydXN0Lm5ldCBTZWN1cmUgU2VydmVyIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5MQ0wCwYDVQQDEwRDUkwxMCmgJ6AlhiNodHRwOi8vd3d3LmVudHJ1c3Qu\nbmV0L0NSTC9uZXQxLmNybDArBgNVHRAEJDAigA8xOTk5MDUyNTE2MDk0MFqBDzIwMTkwNTI1\nMTYwOTQwWjALBgNVHQ8EBAMCAQYwHwYDVR0jBBgwFoAU8BdiE1U9s/8KAGv7UISX8+1i0Bow\nHQYDVR0OBBYEFPAXYhNVPbP/CgBr+1CEl/PtYtAaMAwGA1UdEwQFMAMBAf8wGQYJKoZIhvZ9\nB0EABAwwChsEVjQuMAMCBJAwDQYJKoZIhvcNAQEFBQADgYEAkNwwAvpkdMKnCqV8IY00F6j7\nRw7/JXyNEwr75Ji174z4xRAN95K+8cPV1ZVqBLssziY2ZcgxxufuP+NXdYR6Ee9GTxj005i7\nqIcyunL2POI9n9cd2cNgQ4xYDiKWL2KjLB+6rQXvqzJ4h6BUcxm1XAX5Uj5tLUUL9wqT6u0G\n+bI=\n-----END CERTIFICATE-----\n",
  "Entrust.net Premium 2048 Secure Server CA": "-----BEGIN CERTIFICATE-----\nMIIEXDCCA0SgAwIBAgIEOGO5ZjANBgkqhkiG9w0BAQUFADCBtDEUMBIGA1UEChMLRW50cnVz\ndC5uZXQxQDA+BgNVBAsUN3d3dy5lbnRydXN0Lm5ldC9DUFNfMjA0OCBpbmNvcnAuIGJ5IHJl\nZi4gKGxpbWl0cyBsaWFiLikxJTAjBgNVBAsTHChjKSAxOTk5IEVudHJ1c3QubmV0IExpbWl0\nZWQxMzAxBgNVBAMTKkVudHJ1c3QubmV0IENlcnRpZmljYXRpb24gQXV0aG9yaXR5ICgyMDQ4\nKTAeFw05OTEyMjQxNzUwNTFaFw0xOTEyMjQxODIwNTFaMIG0MRQwEgYDVQQKEwtFbnRydXN0\nLm5ldDFAMD4GA1UECxQ3d3d3LmVudHJ1c3QubmV0L0NQU18yMDQ4IGluY29ycC4gYnkgcmVm\nLiAobGltaXRzIGxpYWIuKTElMCMGA1UECxMcKGMpIDE5OTkgRW50cnVzdC5uZXQgTGltaXRl\nZDEzMDEGA1UEAxMqRW50cnVzdC5uZXQgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgKDIwNDgp\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArU1LqRKGsuqjIAcVFmQqK0vRvwtK\nTY7tgHalZ7d4QMBzQshowNtTK91euHaYNZOLGp18EzoOH1u3Hs/lJBQesYGpjX24zGtLA/EC\nDNyrpUAkAH90lKGdCCmziAv1h3edVc3kw37XamSrhRSGlVuXMlBvPci6Zgzj/L24ScF2iUkZ\n/cCovYmjZy/Gn7xxGWC4LeksyZB2ZnuU4q941mVTXTzWnLLPKQP5L6RQstRIzgUyVYr9smRM\nDuSYB3Xbf9+5CFVghTAp+XtIpGmG4zU/HoZdenoVve8AjhUiVBcAkCaTvA5JaJG/+EfTnZVC\nwQ5N328mz8MYIWJmQ3DW1cAH4QIDAQABo3QwcjARBglghkgBhvhCAQEEBAMCAAcwHwYDVR0j\nBBgwFoAUVeSB0RGAvtiJuQijMfmhJAkWuXAwHQYDVR0OBBYEFFXkgdERgL7YibkIozH5oSQJ\nFrlwMB0GCSqGSIb2fQdBAAQQMA4bCFY1LjA6NC4wAwIEkDANBgkqhkiG9w0BAQUFAAOCAQEA\nWUesIYSKF8mciVMeuoCFGsY8Tj6xnLZ8xpJdGGQC49MGCBFhfGPjK50xA3B20qMooPS7mmNz\n7W3lKtvtFKkrxjYR0CvrB4ul2p5cGZ1WEvVUKcgF7bISKo30Axv/55IQh7A6tcOdBTcSo8f0\nFbnVpDkWm1M6I5HxqIKiaohowXkCIryqptau37AUX7iH0N18f3v/rxzP5tsHrV7bhZ3QKw0z\n2wTR5klAEyt2+z7pnIkPFc4YsIV4IU9rTw76NmfNB/L/CNDi3tm/Kq+4h4YhPATKt5Rof888\n6ZjXOP/swNlQ8C5LWK5Gb9Auw2DaclVyvUxFnmG6v4SBkgPR0ml8xQ==\n-----END CERTIFICATE-----\n",
  "Baltimore CyberTrust Root": "-----BEGIN CERTIFICATE-----\nMIIDdzCCAl+gAwIBAgIEAgAAuTANBgkqhkiG9w0BAQUFADBaMQswCQYDVQQGEwJJRTESMBAG\nA1UEChMJQmFsdGltb3JlMRMwEQYDVQQLEwpDeWJlclRydXN0MSIwIAYDVQQDExlCYWx0aW1v\ncmUgQ3liZXJUcnVzdCBSb290MB4XDTAwMDUxMjE4NDYwMFoXDTI1MDUxMjIzNTkwMFowWjEL\nMAkGA1UEBhMCSUUxEjAQBgNVBAoTCUJhbHRpbW9yZTETMBEGA1UECxMKQ3liZXJUcnVzdDEi\nMCAGA1UEAxMZQmFsdGltb3JlIEN5YmVyVHJ1c3QgUm9vdDCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBAKMEuyKrmD1X6CZymrV51Cni4eiVgLGw41uOKymaZN+hXe2wCQVt2ygu\nzmKiYv60iNoS6zjrIZ3AQSsBUnuId9Mcj8e6uYi1agnnc+gRQKfRzMpijS3ljwumUNKoUMMo\n6vWrJYeKmpYcqWe4PwzV9/lSEy/CG9VwcPCPwBLKBsua4dnKM3p31vjsufFoREJIE9LAwqSu\nXmD+tqYF/LTdB1kC1FkYmGP1pWPgkAx9XbIGevOF6uvUA65ehD5f/xXtabz5OTZydc93Uk3z\nyZAsuT3lySNTPx8kmCFcB5kpvcY67Oduhjprl3RjM71oGDHweI12v/yejl0qhqdNkNwnGjkC\nAwEAAaNFMEMwHQYDVR0OBBYEFOWdWTCCR1jMrPoIVDaGezq1BE3wMBIGA1UdEwEB/wQIMAYB\nAf8CAQMwDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBBQUAA4IBAQCFDF2O5G9RaEIFoN27\nTyclhAO992T9Ldcw46QQF+vaKSm2eT929hkTI7gQCvlYpNRhcL0EYWoSihfVCr3FvDB81ukM\nJY2GQE/szKN+OMY3EU/t3WgxjkzSswF07r51XgdIGn9w/xZchMB5hbgF/X++ZRGjD8ACtPhS\nNzkE1akxehi/oCr0Epn3o0WC4zxe9Z2etciefC7IpJ5OCBRLbf1wbWsaY71k5h+3zvDyny67\nG7fyUIhzksLi4xaNmjICq44Y3ekQEe5+NauQrz4wlHrQMz2nZQ/1/I6eYs9HRCwBXbsdtTLS\nR9I4LtD+gdwyah617jzV/OeBHRnDJELqYzmp\n-----END CERTIFICATE-----\n",
  "Equifax Secure Global eBusiness CA": "-----BEGIN CERTIFICATE-----\nMIICkDCCAfmgAwIBAgIBATANBgkqhkiG9w0BAQQFADBaMQswCQYDVQQGEwJVUzEcMBoGA1UE\nChMTRXF1aWZheCBTZWN1cmUgSW5jLjEtMCsGA1UEAxMkRXF1aWZheCBTZWN1cmUgR2xvYmFs\nIGVCdXNpbmVzcyBDQS0xMB4XDTk5MDYyMTA0MDAwMFoXDTIwMDYyMTA0MDAwMFowWjELMAkG\nA1UEBhMCVVMxHDAaBgNVBAoTE0VxdWlmYXggU2VjdXJlIEluYy4xLTArBgNVBAMTJEVxdWlm\nYXggU2VjdXJlIEdsb2JhbCBlQnVzaW5lc3MgQ0EtMTCBnzANBgkqhkiG9w0BAQEFAAOBjQAw\ngYkCgYEAuucXkAJlsTRVPEnCUdXfp9E3j9HngXNBUmCbnaEXJnitx7HoJpQytd4zjTov2/Ka\nelpzmKNc6fuKcxtc58O/gGzNqfTWK8D3+ZmqY6KxRwIP1ORROhI8bIpaVIRw28HFkM9yRcuo\nWcDNM50/o5brhTMhHD4ePmBudpxnhcXIw2ECAwEAAaNmMGQwEQYJYIZIAYb4QgEBBAQDAgAH\nMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAUvqigdHJQa0S3ySPY+6j/s1draGwwHQYD\nVR0OBBYEFL6ooHRyUGtEt8kj2Puo/7NXa2hsMA0GCSqGSIb3DQEBBAUAA4GBADDiAVGqx+pf\n2rnQZQ8w1j7aDRRJbpGTJxQx78T3LUX47Me/okENI7SS+RkAZ70Br83gcfxaz2TE4JaY0KNA\n4gGK7ycH8WUBikQtBmV1UsCGECAhX2xrD2yuCRyv8qIYNMR1pHMc8Y3c7635s3a0kr/clRAe\nvsvIO1qEYBlWlKlV\n-----END CERTIFICATE-----\n",
  "Equifax Secure eBusiness CA 1": "-----BEGIN CERTIFICATE-----\nMIICgjCCAeugAwIBAgIBBDANBgkqhkiG9w0BAQQFADBTMQswCQYDVQQGEwJVUzEcMBoGA1UE\nChMTRXF1aWZheCBTZWN1cmUgSW5jLjEmMCQGA1UEAxMdRXF1aWZheCBTZWN1cmUgZUJ1c2lu\nZXNzIENBLTEwHhcNOTkwNjIxMDQwMDAwWhcNMjAwNjIxMDQwMDAwWjBTMQswCQYDVQQGEwJV\nUzEcMBoGA1UEChMTRXF1aWZheCBTZWN1cmUgSW5jLjEmMCQGA1UEAxMdRXF1aWZheCBTZWN1\ncmUgZUJ1c2luZXNzIENBLTEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAM4vGbwXt3fe\nk6lfWg0XTzQaDJj0ItlZ1MRoRvC0NcWFAyDGr0WlIVFFQesWWDYyb+JQYmT5/VGcqiTZ9J2D\nKocKIdMSODRsjQBuWqDZQu4aIZX5UkxVWsUPOE9G+m34LjXWHXzr4vCwdYDIqROsvojvOm6r\nXyo4YgKwEnv+j6YDAgMBAAGjZjBkMBEGCWCGSAGG+EIBAQQEAwIABzAPBgNVHRMBAf8EBTAD\nAQH/MB8GA1UdIwQYMBaAFEp4MlIR21kWNl7fwRQ2QGpHfEyhMB0GA1UdDgQWBBRKeDJSEdtZ\nFjZe38EUNkBqR3xMoTANBgkqhkiG9w0BAQQFAAOBgQB1W6ibAxHm6VZMzfmpTMANmvPMZWnm\nJXbMWbfWVMMdzZmsGd20hdXgPfxiIKeES1hl8eL5lSE/9dR+WB5Hh1Q+WKG1tfgq73HnvMP2\nsUlG4tega+VWeponmHxGYhTnyfxuAxJ5gDgdSIKN/Bf+KpYrtWKmpj29f5JZzVoqgrI3eQ==\n-----END CERTIFICATE-----\n",
  "Equifax Secure eBusiness CA 2": "-----BEGIN CERTIFICATE-----\nMIIDIDCCAomgAwIBAgIEN3DPtTANBgkqhkiG9w0BAQUFADBOMQswCQYDVQQGEwJVUzEXMBUG\nA1UEChMORXF1aWZheCBTZWN1cmUxJjAkBgNVBAsTHUVxdWlmYXggU2VjdXJlIGVCdXNpbmVz\ncyBDQS0yMB4XDTk5MDYyMzEyMTQ0NVoXDTE5MDYyMzEyMTQ0NVowTjELMAkGA1UEBhMCVVMx\nFzAVBgNVBAoTDkVxdWlmYXggU2VjdXJlMSYwJAYDVQQLEx1FcXVpZmF4IFNlY3VyZSBlQnVz\naW5lc3MgQ0EtMjCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEA5Dk5kx5SBhsoNviyoynF\n7Y6yEb3+6+e0dMKP/wXn2Z0GvxLIPw7y1tEkshHe0XMJitSxLJgJDR5QRrKDpkWNYmi7hRsg\ncDKqQM2mll/EcTc/BPO3QSQ5BxoeLmFYoBIL5aXfxavqN3HMHMg3OrmXUqesxWoklE6ce8/A\natbfIb0CAwEAAaOCAQkwggEFMHAGA1UdHwRpMGcwZaBjoGGkXzBdMQswCQYDVQQGEwJVUzEX\nMBUGA1UEChMORXF1aWZheCBTZWN1cmUxJjAkBgNVBAsTHUVxdWlmYXggU2VjdXJlIGVCdXNp\nbmVzcyBDQS0yMQ0wCwYDVQQDEwRDUkwxMBoGA1UdEAQTMBGBDzIwMTkwNjIzMTIxNDQ1WjAL\nBgNVHQ8EBAMCAQYwHwYDVR0jBBgwFoAUUJ4L6q9euSBIplBqy/3YIHqngnYwHQYDVR0OBBYE\nFFCeC+qvXrkgSKZQasv92CB6p4J2MAwGA1UdEwQFMAMBAf8wGgYJKoZIhvZ9B0EABA0wCxsF\nVjMuMGMDAgbAMA0GCSqGSIb3DQEBBQUAA4GBAAyGgq3oThr1jokn4jVYPSm0B482UJW/bsGe\n68SQsoWou7dC4A8HOd/7npCy0cE+U58DRLB+S/Rv5Hwf5+Kx5Lia78O9zt4LMjTZ3ijtM2vE\n1Nc9ElirfQkty3D1E4qUoSek1nDFbZS1yX2doNLGCEnZZpum0/QL3MUmV+GRMOrN\n-----END CERTIFICATE-----\n",
  "AddTrust Low-Value Services Root": "-----BEGIN CERTIFICATE-----\nMIIEGDCCAwCgAwIBAgIBATANBgkqhkiG9w0BAQUFADBlMQswCQYDVQQGEwJTRTEUMBIGA1UE\nChMLQWRkVHJ1c3QgQUIxHTAbBgNVBAsTFEFkZFRydXN0IFRUUCBOZXR3b3JrMSEwHwYDVQQD\nExhBZGRUcnVzdCBDbGFzcyAxIENBIFJvb3QwHhcNMDAwNTMwMTAzODMxWhcNMjAwNTMwMTAz\nODMxWjBlMQswCQYDVQQGEwJTRTEUMBIGA1UEChMLQWRkVHJ1c3QgQUIxHTAbBgNVBAsTFEFk\nZFRydXN0IFRUUCBOZXR3b3JrMSEwHwYDVQQDExhBZGRUcnVzdCBDbGFzcyAxIENBIFJvb3Qw\nggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCWltQhSWDia+hBBwzexODcEyPNwTXH\n+9ZOEQpnXvUGW2ulCDtbKRY654eyNAbFvAWlA3yCyykQruGIgb3WntP+LVbBFc7jJp0VLhD7\nBo8wBN6ntGO0/7Gcrjyvd7ZWxbWroulpOj0OM3kyP3CCkplhbY0wCI9xP6ZIVxn4JdxLZlyl\ndI+Yrsj5wAYi56xz36Uu+1LcsRVlIPo1Zmne3yzxbrww2ywkEtvrNTVokMsAsJchPXQhI2U0\nK7t4WaPW4XY5mqRJjox0r26kmqPZm9I4XJuiGMx1I4S+6+JNM3GOGvDC+Mcdoq0Dlyz4zyXG\n9rgkMbFjXZJ/Y/AlyVMuH79NAgMBAAGjgdIwgc8wHQYDVR0OBBYEFJWxtPCUtr3H2tERCSG+\nwa9J/RB7MAsGA1UdDwQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MIGPBgNVHSMEgYcwgYSAFJWx\ntPCUtr3H2tERCSG+wa9J/RB7oWmkZzBlMQswCQYDVQQGEwJTRTEUMBIGA1UEChMLQWRkVHJ1\nc3QgQUIxHTAbBgNVBAsTFEFkZFRydXN0IFRUUCBOZXR3b3JrMSEwHwYDVQQDExhBZGRUcnVz\ndCBDbGFzcyAxIENBIFJvb3SCAQEwDQYJKoZIhvcNAQEFBQADggEBACxtZBsfzQ3duQH6lmM0\nMkhHma6X7f1yFqZzR1r0693p9db7RcwpiURdv0Y5PejuvE1Uhh4dbOMXJ0PhiVYrqW9yTkkz\n43J8KiOavD7/KCrto/8cI7pDVwlnTUtiBi34/2ydYB7YHEt9tTEv2dB8Xfjea4MYeDdXL+gz\nB2ffHsdrKpV2ro9Xo/D0UrSpUwjP4E/TelOL/bscVjby/rK25Xa71SJlpz/+0WatC7xrmYbv\nP33zGDLKe8bjq2RGlfgmadlVg3sslgf/WSxEo8bl6ancoWOAWiFeIc9TVPC6b4nbqKqVz4vj\nccweGyBECMB6tkD9xOQ14R0WHNC8K47Wcdk=\n-----END CERTIFICATE-----\n",
  "AddTrust External Root": "-----BEGIN CERTIFICATE-----\nMIIENjCCAx6gAwIBAgIBATANBgkqhkiG9w0BAQUFADBvMQswCQYDVQQGEwJTRTEUMBIGA1UE\nChMLQWRkVHJ1c3QgQUIxJjAkBgNVBAsTHUFkZFRydXN0IEV4dGVybmFsIFRUUCBOZXR3b3Jr\nMSIwIAYDVQQDExlBZGRUcnVzdCBFeHRlcm5hbCBDQSBSb290MB4XDTAwMDUzMDEwNDgzOFoX\nDTIwMDUzMDEwNDgzOFowbzELMAkGA1UEBhMCU0UxFDASBgNVBAoTC0FkZFRydXN0IEFCMSYw\nJAYDVQQLEx1BZGRUcnVzdCBFeHRlcm5hbCBUVFAgTmV0d29yazEiMCAGA1UEAxMZQWRkVHJ1\nc3QgRXh0ZXJuYWwgQ0EgUm9vdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALf3\nGjPm8gAELTngTlvtH7xsD821+iO2zt6bETOXpClMfZOfvUq8k+0DGuOPz+VtUFrWlymUWoCw\nSXrbLpX9uMq/NzgtHj6RQa1wVsfwTz/oMp50ysiQVOnGXw94nZpAPA6sYapeFI+eh6FqUNzX\nmk6vBbOmcZSccbNQYArHE504B4YCqOmoaSYYkKtMsE8jqzpPhNjfzp/haW+710LXa0Tkx63u\nbUFfclpxCDezeWWkWaCUN/cALw3CknLa0Dhy2xSoRcRdKn23tNbE7qzNE0S3ySvdQwAl+mG5\naWpYIxG3pzOPVnVZ9c0p10a3CitlttNCbxWyuHv77+ldU9U0WicCAwEAAaOB3DCB2TAdBgNV\nHQ4EFgQUrb2YejS0Jvf6xCZU7wO94CTLVBowCwYDVR0PBAQDAgEGMA8GA1UdEwEB/wQFMAMB\nAf8wgZkGA1UdIwSBkTCBjoAUrb2YejS0Jvf6xCZU7wO94CTLVBqhc6RxMG8xCzAJBgNVBAYT\nAlNFMRQwEgYDVQQKEwtBZGRUcnVzdCBBQjEmMCQGA1UECxMdQWRkVHJ1c3QgRXh0ZXJuYWwg\nVFRQIE5ldHdvcmsxIjAgBgNVBAMTGUFkZFRydXN0IEV4dGVybmFsIENBIFJvb3SCAQEwDQYJ\nKoZIhvcNAQEFBQADggEBALCb4IUlwtYj4g+WBpKdQZic2YR5gdkeWxQHIzZlj7DYd7usQWxH\nYINRsPkyPef89iYTx4AWpb9a/IfPeHmJIZriTAcKhjW88t5RxNKWt9x+Tu5w/Rw56wwCURQt\njr0W4MHfRnXnJK3s9EK0hZNwEGe6nQY1ShjTK3rMUUKhemPR5ruhxSvCNr4TDea9Y355e6cJ\nDUCrat2PisP29owaQgVR1EX1n6diIWgVIEM8med8vSTYqZEXc4g/VhsxOBi0cQ+azcgOno4u\nG+GMmIPLHzHxREzGBHNJdmAPx/i9F4BrLunMTA5amnkPIAou1Z5jJh5VkpTYghdae9C8x49O\nhgQ=\n-----END CERTIFICATE-----\n",
  "AddTrust Public Services Root": "-----BEGIN CERTIFICATE-----\nMIIEFTCCAv2gAwIBAgIBATANBgkqhkiG9w0BAQUFADBkMQswCQYDVQQGEwJTRTEUMBIGA1UE\nChMLQWRkVHJ1c3QgQUIxHTAbBgNVBAsTFEFkZFRydXN0IFRUUCBOZXR3b3JrMSAwHgYDVQQD\nExdBZGRUcnVzdCBQdWJsaWMgQ0EgUm9vdDAeFw0wMDA1MzAxMDQxNTBaFw0yMDA1MzAxMDQx\nNTBaMGQxCzAJBgNVBAYTAlNFMRQwEgYDVQQKEwtBZGRUcnVzdCBBQjEdMBsGA1UECxMUQWRk\nVHJ1c3QgVFRQIE5ldHdvcmsxIDAeBgNVBAMTF0FkZFRydXN0IFB1YmxpYyBDQSBSb290MIIB\nIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6Rowj4OIFMEg2Dybjxt+A3S72mnTRqX4\njsIMEZBRpS9mVEBV6tsfSlbunyNu9DnLoblv8n75XYcmYZ4c+OLspoH4IcUkzBEMP9smcnrH\nAZcHF/nXGCwwfQ56HmIexkvA/X1id9NEHif2P0tEs7c42TkfYNVRknMDtABp4/MUTu7R3AnP\ndzRGULD4EfL+OHn3Bzn+UZKXC1sIXzSGAa2Il+tmzV7R/9x98oTaunet3IAIx6eH1lWfl2ro\nyBFkuucZKT8Rs3iQhCBSWxHveNCD9tVIkNAwHM+A+WD+eeSI8t0A65RF62WUaUC6wNW0uLp9\nBBGo6zEFlpROWCGOn9Bg/QIDAQABo4HRMIHOMB0GA1UdDgQWBBSBPjfYkrAfd59ctKtzquf2\nNGAv+jALBgNVHQ8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zCBjgYDVR0jBIGGMIGDgBSBPjfY\nkrAfd59ctKtzquf2NGAv+qFopGYwZDELMAkGA1UEBhMCU0UxFDASBgNVBAoTC0FkZFRydXN0\nIEFCMR0wGwYDVQQLExRBZGRUcnVzdCBUVFAgTmV0d29yazEgMB4GA1UEAxMXQWRkVHJ1c3Qg\nUHVibGljIENBIFJvb3SCAQEwDQYJKoZIhvcNAQEFBQADggEBAAP3FUr4JNojVhaTdt02KLmu\nG7jD8WS6IBh4lSknVwW8fCr0uVFV2ocC3g8WFzH4qnkuCRO7r7IgGRLlk/lL+YPoRNWyQSW/\niHVv/xD8SlTQX/D67zZzfRs2RcYhbbQVuE7PnFylPVoAjgbjPGsye/Kf8Lb93/AoGEjwxrzQ\nvzSAlsJKsW2Ox5BF3i9nrEUEo3rcVZLJR2bYGozH7ZxOmuASu7VqTITh4SINhwBk/ox9Yjll\npu9CtoAlEmEBqCQTcAARJl/6NVDFSMwGR+gn2HCNX2TmoUQmXiLsks3/QppEIW1cxeMiHV9H\nEufOX1362KqxMy3ZdvJOOjMMK7MtkAY=\n-----END CERTIFICATE-----\n",
  "AddTrust Qualified Certificates Root": "-----BEGIN CERTIFICATE-----\nMIIEHjCCAwagAwIBAgIBATANBgkqhkiG9w0BAQUFADBnMQswCQYDVQQGEwJTRTEUMBIGA1UE\nChMLQWRkVHJ1c3QgQUIxHTAbBgNVBAsTFEFkZFRydXN0IFRUUCBOZXR3b3JrMSMwIQYDVQQD\nExpBZGRUcnVzdCBRdWFsaWZpZWQgQ0EgUm9vdDAeFw0wMDA1MzAxMDQ0NTBaFw0yMDA1MzAx\nMDQ0NTBaMGcxCzAJBgNVBAYTAlNFMRQwEgYDVQQKEwtBZGRUcnVzdCBBQjEdMBsGA1UECxMU\nQWRkVHJ1c3QgVFRQIE5ldHdvcmsxIzAhBgNVBAMTGkFkZFRydXN0IFF1YWxpZmllZCBDQSBS\nb290MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5B6a/twJWoekn0e+EV+vhDTb\nYjx5eLfpMLXsDBwqxBb/4Oxx64r1EW7tTw2R0hIYLUkVAcKkIhPHEWT/IhKauY5cLwjPcWqz\nZwFZ8V1G87B4pfYOQnrjfxvM0PC3KP0q6p6zsLkEqv32x7SxuCqg+1jxGaBvcCV+PmlKfw8i\n2O+tCBGaKZnhqkRFmhJePp1tUvznoD1oL/BLcHwTOK28FSXx1s6rosAx1i+f4P8UWfyEk9mH\nfExUE+uf0S0R+Bg6Ot4l2ffTQO2kBhLEO+GRwVY18BTcZTYJbqukB8c10cIDMzZbdSZtQvES\na0NvS3GU+jQd7RNuyoB/mC9suWXY6QIDAQABo4HUMIHRMB0GA1UdDgQWBBQ5lYtii1zJ1IC6\nWA+XPxUIQ8yYpzALBgNVHQ8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zCBkQYDVR0jBIGJMIGG\ngBQ5lYtii1zJ1IC6WA+XPxUIQ8yYp6FrpGkwZzELMAkGA1UEBhMCU0UxFDASBgNVBAoTC0Fk\nZFRydXN0IEFCMR0wGwYDVQQLExRBZGRUcnVzdCBUVFAgTmV0d29yazEjMCEGA1UEAxMaQWRk\nVHJ1c3QgUXVhbGlmaWVkIENBIFJvb3SCAQEwDQYJKoZIhvcNAQEFBQADggEBABmrder4i2Vh\nlRO6aQTvhsoToMeqT2QbPxj2qC0sVY8FtzDqQmodwCVRLae/DLPt7wh/bDxGGuoYQ992zPlm\nhpwsaPXpF/gxsxjE1kh9I0xowX67ARRvxdlu3rsEQmr49lx95dr6h+sNNVJn0J6XdgWTP5XH\nAeZpVTh/EGGZyeNfpso+gmNIquIISD6q8rKFYqa0p9m9N5xotS1WfbC3P6CxB9bpT9zeRXEw\nMn8bLgn5v1Kh7sKAPgZcLlVAwRv1cEWw3F369nJad9Jjzc9YiQBCYz95OdBEsIJuQRno3eDB\niFrRHnGTHyQwdOUeqN48Jzd/g66ed8/wMLH/S5noxqE=\n-----END CERTIFICATE-----\n",
  "Entrust Root Certification Authority": "-----BEGIN CERTIFICATE-----\nMIIEkTCCA3mgAwIBAgIERWtQVDANBgkqhkiG9w0BAQUFADCBsDELMAkGA1UEBhMCVVMxFjAU\nBgNVBAoTDUVudHJ1c3QsIEluYy4xOTA3BgNVBAsTMHd3dy5lbnRydXN0Lm5ldC9DUFMgaXMg\naW5jb3Jwb3JhdGVkIGJ5IHJlZmVyZW5jZTEfMB0GA1UECxMWKGMpIDIwMDYgRW50cnVzdCwg\nSW5jLjEtMCsGA1UEAxMkRW50cnVzdCBSb290IENlcnRpZmljYXRpb24gQXV0aG9yaXR5MB4X\nDTA2MTEyNzIwMjM0MloXDTI2MTEyNzIwNTM0MlowgbAxCzAJBgNVBAYTAlVTMRYwFAYDVQQK\nEw1FbnRydXN0LCBJbmMuMTkwNwYDVQQLEzB3d3cuZW50cnVzdC5uZXQvQ1BTIGlzIGluY29y\ncG9yYXRlZCBieSByZWZlcmVuY2UxHzAdBgNVBAsTFihjKSAyMDA2IEVudHJ1c3QsIEluYy4x\nLTArBgNVBAMTJEVudHJ1c3QgUm9vdCBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTCCASIwDQYJ\nKoZIhvcNAQEBBQADggEPADCCAQoCggEBALaVtkNC+sZtKm9I35RMOVcF7sN5EUFoNu3s/poB\nj6E4KPz3EEZmLk0eGrEaTsbRwJWIsMn/MYszA9u3g3s+IIRe7bJWKKf44LlAcTfFy0cOlypo\nwCKVYhXbR9n10Cv/gkvJrT7eTNuQgFA/CYqEAOwwCj0Yzfv9KlmaI5UXLEWeH25DeW0MXJj+\nSKfFI0dcXv1u5x609mhF0YaDW6KKjbHjKYD+JXGIrb68j6xSlkuqUY3kEzEZ6E5Nn9uss2rV\nvDlUccp6en+Q3X0dgNmBu1kmwhH+5pPi94DkZfs0Nw4pgHBNrziGLp5/V6+eF67rHMsoIV+2\nHNjnogQi+dPa2MsCAwEAAaOBsDCBrTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB\n/zArBgNVHRAEJDAigA8yMDA2MTEyNzIwMjM0MlqBDzIwMjYxMTI3MjA1MzQyWjAfBgNVHSME\nGDAWgBRokORnpKZTgMeGZqTx90tD+4S9bTAdBgNVHQ4EFgQUaJDkZ6SmU4DHhmak8fdLQ/uE\nvW0wHQYJKoZIhvZ9B0EABBAwDhsIVjcuMTo0LjADAgSQMA0GCSqGSIb3DQEBBQUAA4IBAQCT\n1DCw1wMgKtD5Y+iRDAUgqV8ZyntyTtSx29CW+1RaGSwMCPeyvIWonX9tO1KzKtvn1ISMY/YP\nyyYBkVBs9F8U4pN0wBOeMDpQ47RgxRzwIkSNcUesyBrJ6ZuaAGAT/3B+XxFNSRuzFVJ7yVTa\nv52Vr2ua2J7p8eRDjeIRRDq/r72DQnNSi6q7pynP9WQcCk3RvKqsnyrQ/39/2n3qse0wJcGE\n2jTSW3iDVuycNsMm4hH2Z0kdkquM++v/eu6FSqdQgPCnXEqULl8FmTxSQeDNtGPPAUO6nIPc\nj2A781q0tHuu2guQOHXvgR1m0vdXcDazv/wor3ElhVsT/h5/WrQ8\n-----END CERTIFICATE-----\n",
  "RSA Security 2048 v3": "-----BEGIN CERTIFICATE-----\nMIIDYTCCAkmgAwIBAgIQCgEBAQAAAnwAAAAKAAAAAjANBgkqhkiG9w0BAQUFADA6MRkwFwYD\nVQQKExBSU0EgU2VjdXJpdHkgSW5jMR0wGwYDVQQLExRSU0EgU2VjdXJpdHkgMjA0OCBWMzAe\nFw0wMTAyMjIyMDM5MjNaFw0yNjAyMjIyMDM5MjNaMDoxGTAXBgNVBAoTEFJTQSBTZWN1cml0\neSBJbmMxHTAbBgNVBAsTFFJTQSBTZWN1cml0eSAyMDQ4IFYzMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAt49VcdKA3XtpeafwGFAyPGJn9gqVB93mG/Oe2dJBVGutn3y+Gc37\nRqtBaB4Y6lXIL5F4iSj7Jylg/9+PjDvJSZu1pJTOAeo+tWN7fyb9Gd3AIb2E0S1PRsNO3Ng3\nOTsor8udGuorryGlwSMiuLgbWhOHV4PR8CDn6E8jQrAApX2J6elhc5SYcSa8LWrg903w8bYq\nODGBDSnhAMFRD0xS+ARaqn1y07iHKrtjEAMqs6FPDVpeRrc9DvV07Jmf+T0kgYim3WBU6JU2\nPcYJk5qjEoAAVZkZR73QpXzDuvsf9/UP+Ky5tfQ3mBMY3oVbtwyCO4dvlTlYMNpuAWgXIszA\nCwIDAQABo2MwYTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjAfBgNVHSMEGDAW\ngBQHw1EwpKrpRa41JPr/JCwz0LGdjDAdBgNVHQ4EFgQUB8NRMKSq6UWuNST6/yQsM9CxnYww\nDQYJKoZIhvcNAQEFBQADggEBAF8+hnZuuDU8TjYcHnmYv/3VEhF5Ug7uMYm83X/50cYVIeiK\nAVQNOvtUudZj1LGqlk2iQk3UUx+LEN5/Zb5gEydxiKRz44Rj0aRV4VCT5hsOedBnvEbIvz8X\nDZXmxpBp3ue0L96VfdASPz0+f00/FGj1EVDVwfSQpQgdMWD/YIwjVAqv/qFuxdF6Kmh4zx6C\nCiC0H63lhbJqaHVOrSU3lIW+vaHU6rcMSzyd6BIA8F+sDeGscGNz9395nzIlQnQFgCi/vcEk\nllgVsRch6YlL2weIZ/QVrXA+L02FO8K32/6YaCOJ4XQP3vTFhGMpG8zLB8kApKnXwiJPZ9d3\n7CAFYd4=\n-----END CERTIFICATE-----\n",
  "GeoTrust Global CA": "-----BEGIN CERTIFICATE-----\nMIIDVDCCAjygAwIBAgIDAjRWMA0GCSqGSIb3DQEBBQUAMEIxCzAJBgNVBAYTAlVTMRYwFAYD\nVQQKEw1HZW9UcnVzdCBJbmMuMRswGQYDVQQDExJHZW9UcnVzdCBHbG9iYWwgQ0EwHhcNMDIw\nNTIxMDQwMDAwWhcNMjIwNTIxMDQwMDAwWjBCMQswCQYDVQQGEwJVUzEWMBQGA1UEChMNR2Vv\nVHJ1c3QgSW5jLjEbMBkGA1UEAxMSR2VvVHJ1c3QgR2xvYmFsIENBMIIBIjANBgkqhkiG9w0B\nAQEFAAOCAQ8AMIIBCgKCAQEA2swYYzD99BcjGlZ+W988bDjkcbd4kdS8odhM+KhDtgPpTSEH\nCIjaWC9mOSm9BXiLnTjoBbdqfnGk5sRgprDvgOSJKA+eJdbtg/OtppHHmMlCGDUUna2YRpIu\nT8rxh0PBFpVXLVDviS2Aelet8u5fa9IAjbkU+BQVNdnARqN7csiRv8lVK83Qlz6cJmTM386D\nGXHKTubU1XupGc1V3sjs0l44U+VcT4wt/lAjNvxm5suOpDkZALeVAjmRCw7+OC7RHQWa9k0+\nbw8HHa8sHo9gOeL6NlMTOdReJivbPagUvTLrGAMoUgRx5aszPeE4uwc2hGKceeoWMPRfwCvo\ncWvk+QIDAQABo1MwUTAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTAephojYn7qwVkDBF9\nqn1luMrMTjAfBgNVHSMEGDAWgBTAephojYn7qwVkDBF9qn1luMrMTjANBgkqhkiG9w0BAQUF\nAAOCAQEANeMpauUvXVSOKVCUn5kaFOSPeCpilKInZ57QzxpeR+nBsqTP3UEaBU6bS+5Kb1VS\nsyShNwrrZHYqLizz/Tt1kL/6cdjHPTfStQWVYrmm3ok9Nns4d0iXrKYgjy6myQzCsplFAMfO\nEVEiIuCl6rYVSAlk6l5PdPcFPseKUgzbFbS9bZvlxrFUaKnjaZC2mqUPuLk/IH2uSrW4nOQd\ntqvmlKXBx4Ot2/Unhw4EbNX/3aBd7YdStysVAq45pmp06drE57xNNB6pXE0zX5IJL4hmXXeX\nxx12E6nV5fEWCRE11azbJHFwLJhWC9kXtNHjUStedejV0NxPNO3CBWaAocvmMw==\n-----END CERTIFICATE-----\n",
  "GeoTrust Global CA 2": "-----BEGIN CERTIFICATE-----\nMIIDZjCCAk6gAwIBAgIBATANBgkqhkiG9w0BAQUFADBEMQswCQYDVQQGEwJVUzEWMBQGA1UE\nChMNR2VvVHJ1c3QgSW5jLjEdMBsGA1UEAxMUR2VvVHJ1c3QgR2xvYmFsIENBIDIwHhcNMDQw\nMzA0MDUwMDAwWhcNMTkwMzA0MDUwMDAwWjBEMQswCQYDVQQGEwJVUzEWMBQGA1UEChMNR2Vv\nVHJ1c3QgSW5jLjEdMBsGA1UEAxMUR2VvVHJ1c3QgR2xvYmFsIENBIDIwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDvPE1APRDfO1MA4Wf+lGAVPoWI8YkNkMgoI5kF6Csgncbz\nYEbYwbLVjDHZ3CB5JIG/NTL8Y2nbsSpr7iFY8gjpeMtvy/wWUsiRxP89c96xPqfCfWbB9X5S\nJBri1WeR0IIQ13hLTytCOb1kLUCgsBDTOEhGiKEMuzozKmKY+wCdE1l/bztyqu6mD4b5BWHq\nZ38MN5aL5mkWRxHCJ1kDs6ZgwiFAVvqgx306E+PsV8ez1q6diYD3Aecs9pYrEw15LNnA5IZ7\nS4wMcoKK+xfNAGw6EzywhIdLFnopsk/bHdQL82Y3vdj2V7teJHq4PIu5+pIaGoSe2HSPqht/\nXvT+RSIhAgMBAAGjYzBhMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFHE4NvICMVNHK266\nZUapEBVYIAUJMB8GA1UdIwQYMBaAFHE4NvICMVNHK266ZUapEBVYIAUJMA4GA1UdDwEB/wQE\nAwIBhjANBgkqhkiG9w0BAQUFAAOCAQEAA/e1K6tdEPx7srJerJsOflN4WT5CBP51o62sgU7X\nAotexC3IUnbHLB/8gTKY0UvGkpMzNTEv/NgdRN3ggX+d6YvhZJFiCzkIjKx0nVnZellSlxG5\nFntvRdOW2TF9AjYPnDtuzywNA0ZF66D0f0hExghAzN4bcLUprbqLOzRldRtxIR0sFAqwlpW4\n1uryZfspuk/qkZN0abby/+Ea0AzRdoXLiiW9l14sbxWZJue2Kf8i7MkCx1YAzUm5s2x7UwQa\n4qjJqhIFI8LO57sEAszAR6LkxCkvW0VXiVHuPOtSCP8HNR6fNWpHSlaY0VqFH4z1Ir+rzoPz\n4iIprn2DQKi6bA==\n-----END CERTIFICATE-----\n",
  "GeoTrust Universal CA": "-----BEGIN CERTIFICATE-----\nMIIFaDCCA1CgAwIBAgIBATANBgkqhkiG9w0BAQUFADBFMQswCQYDVQQGEwJVUzEWMBQGA1UE\nChMNR2VvVHJ1c3QgSW5jLjEeMBwGA1UEAxMVR2VvVHJ1c3QgVW5pdmVyc2FsIENBMB4XDTA0\nMDMwNDA1MDAwMFoXDTI5MDMwNDA1MDAwMFowRTELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUdl\nb1RydXN0IEluYy4xHjAcBgNVBAMTFUdlb1RydXN0IFVuaXZlcnNhbCBDQTCCAiIwDQYJKoZI\nhvcNAQEBBQADggIPADCCAgoCggIBAKYVVaCjxuAfjJ0hUNfBvitbtaSeodlyWL0AG0y/YckU\nHUWCq8YdgNY96xCcOq9tJPi8cQGeBvV8Xx7BDlXKg5pZMK4ZyzBIle0iN430SppyZj6tlcDg\nFgDgEB8rMQ7XlFTTQjOgNB0eRXbdT8oYN+yFFXoZCPzVx5zw8qkuEKmS5j1YPakWaDwvdSEY\nfyh3peFhF7em6fgemdtzbvQKoiFs7tqqhZJmr/Z6a4LauiIINQ/PQvE1+mrufislzDoR5G2v\nc7J2Ha3QsnhnGqQ5HFELZ1aD/ThdDc7d8Lsrlh/eezJS/R27tQahsiFepdaVaH/wmZ7cRQg+\n59IJDTWU3YBOU5fXtQlEIGQWFwMCTFMNaN7VqnJNk22CDtucvc+081xdVHppCZbW2xHBjXWo\ntM85yM48vCR85mLK4b19p71XZQvk/iXttmkQ3CgaRr0BHdCXteGYO8A3ZNY9lO4L4fUorgtW\nv3GLIylBjobFS1J72HGrH4oVpjuDWtdYAVHGTEHZf9hBZ3KiKN9gg6meyHv8U3NyWfWTehd2\nDs735VzZC1U0oqpbtWpU5xPKV+yXbfReBi9Fi1jUIxaS5BZuKGNZMN9QAZxjiRqf2xeUgnA3\nwySemkfWWspOqGmJch+RbNt+nhutxx9z3SxPGWX9f5NAEC7S8O08ni4oPmkmM8V7AgMBAAGj\nYzBhMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFNq7LqqwDLiIJlF0XG0D08DYj3rWMB8G\nA1UdIwQYMBaAFNq7LqqwDLiIJlF0XG0D08DYj3rWMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG\n9w0BAQUFAAOCAgEAMXjmx7XfuJRAyXHEqDXsRh3ChfMoWIawC/yOsjmPRFWrZIRcaanQmjg8\n+uUfNeVE44B5lGiku8SfPeE0zTBGi1QrlaXv9z+ZhP015s8xxtxqv6fXIwjhmF7DWgh2qaav\ndy+3YL1ERmrvl/9zlcGO6JP7/TG37FcREUWbMPEaiDnBTzynANXH/KttgCJwpQzgXQQpAvvL\noJHRfNbDflDVnVi+QTjruXU8FdmbyUqDWcDaU/0zuzYYm4UPFd3uLax2k7nZAY1IEKj79TiG\n8dsKxr2EoyNB3tZ3b4XUhRxQ4K5RirqNPnbiucon8l+f725ZDQbYKxek0nxru18UGkiPGkzn\ns0ccjkxFKyDuSN/n3QmOGKjaQI2SJhFTYXNd673nxE0pN2HrrDktZy4W1vUAg4WhzH92xH3k\nt0tm7wNFYGm2DFKWkoRepqO1pD4r2czYG0eq8kTaT/kD6PAUyz/zg97QwVTjt+gKN02LIFkD\nMBmhLMi9ER/frslKxfMnZmaGrGiR/9nmUxwPi1xpZQomyB40w11Re9epnAahNt3ViZS82eQt\nDF4JbAiXfKM9fJP/P6EUp8+1Xevb2xzEdt+Iub1FBZUbrvxGakyvSOPOrg/SfuvmbJxPgWp6\nZKy7PtXny3YuxadIwVyQD8vIP/rmMuGNG2+k5o7Y+SlIis5z/iw=\n-----END CERTIFICATE-----\n",
  "GeoTrust Universal CA 2": "-----BEGIN CERTIFICATE-----\nMIIFbDCCA1SgAwIBAgIBATANBgkqhkiG9w0BAQUFADBHMQswCQYDVQQGEwJVUzEWMBQGA1UE\nChMNR2VvVHJ1c3QgSW5jLjEgMB4GA1UEAxMXR2VvVHJ1c3QgVW5pdmVyc2FsIENBIDIwHhcN\nMDQwMzA0MDUwMDAwWhcNMjkwMzA0MDUwMDAwWjBHMQswCQYDVQQGEwJVUzEWMBQGA1UEChMN\nR2VvVHJ1c3QgSW5jLjEgMB4GA1UEAxMXR2VvVHJ1c3QgVW5pdmVyc2FsIENBIDIwggIiMA0G\nCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCzVFLByT7y2dyxUxpZKeexw0Uo5dfR7cXFS6Gq\ndHtXr0om/Nj1XqduGdt0DE81WzILAePb63p3NeqqWuDW6KFXlPCQo3RWlEQwAx5cTiuFJnSC\negx2oG9NzkEtoBUGFF+3Qs17j1hhNNwqCPkuwwGmIkQcTAeC5lvO0Ep8BNMZcyfwqph/Lq9O\n64ceJHdqXbboW0W63MOhBW9Wjo8QJqVJwy7XQYci4E+GymC16qFjwAGXEHm9ADwSbSsVsaxL\nse4YuU6W3Nx2/zu+z18DwPw76L5GG//aQMJS9/7jOvdqdzXQ2o3rXhhqMcceujwbKNZrVMaq\nW9eiLBsZzKIC9ptZvTdrhrVtgrrY6slWvKk2WP0+GfPtDCapkzj4T8FdIgbQl+rhrcZV4IEr\nKIM6+vR7IVEAvlI4zs1meaj0gVbi0IMJR1FbUGrP20gaXT73y/Zl92zxlfgCOzJWgjl6W70v\niRu/obTo/3+NjN8D8WBOWBFM66M/ECuDmgFz2ZRthAAnZqzwcEAJQpKtT5MNYQlRJNiS1QuU\nYbKHsu3/mjX/hVTK7URDrBs8FmtISgocQIgfksILAAX/8sgCSqSqqcyZlpwvWOB94b67B9xf\nBHJcMTTD7F8t4D1kkCLm0ey4Lt1ZrtmhN79UNdxzMk+MBB4zsslG8dhcyFVQyWi9qLo2CQID\nAQABo2MwYTAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBR281Xh+qQ2+/CfXGJx7Tz0RzgQ\nKzAfBgNVHSMEGDAWgBR281Xh+qQ2+/CfXGJx7Tz0RzgQKzAOBgNVHQ8BAf8EBAMCAYYwDQYJ\nKoZIhvcNAQEFBQADggIBAGbBxiPz2eAubl/oz66wsCVNK/g7WJtAJDday6sWSf+zdXkzoS9t\ncBc0kf5nfo/sm+VegqlVHy/c1FEHEv6sFj4sNcZj/NwQ6w2jqtB8zNHQL1EuxBRa3ugZ4T7G\nzKQp5y6EqgYweHZUcyiYWTjgAA1i00J9IZ+uPTqM1fp3DRgrFg5fNuH8KrUwJM/gYwx7WBr+\nmbpCErGR9Hxo4sjoryzqyX6uuyo9DRXcNJW2GHSoag/HtPQTxORb7QrSpJdMKu0vbBKJPfEn\ncKpqA1Ihn0CoZ1Dy81of398j9tx4TuaYT1U6U+Pv8vSfx3zYWK8pIpe44L2RLrB27FcRz+8p\nRPPphXpgY+RdM4kX2TGq2tbzGDVyz4crL2MjhF2EjD9XoIj8mZEoJmmZ1I+XRL6O1UixpCgp\n8RW04eWe3fiPpm8m1wk8OhwRDqZsN/etRIcsKMfYdIKz0G9KV7s1KSegi+ghp4dkNl3M2Bas\nx7InQJJVOCiNUW7dFGdTbHFcJoRNdVq2fmBWqU2t+5sel/MN2dKXVHfaPRK34B7vCAas+YWH\n6aLcr34YEoP9VhdBLtUpgn2Z9DH2canPLAEnpQW5qrJITirvn5NSUZU8UnOOVkwXQMAJKOSL\nakhT2+zNVVXxxvjpoixMptEmX36vWkzaH6byHCx+rgIW0lbQL1dTR+iS\n-----END CERTIFICATE-----\n",
  "America Online Root Certification Authority 1": "-----BEGIN CERTIFICATE-----\nMIIDpDCCAoygAwIBAgIBATANBgkqhkiG9w0BAQUFADBjMQswCQYDVQQGEwJVUzEcMBoGA1UE\nChMTQW1lcmljYSBPbmxpbmUgSW5jLjE2MDQGA1UEAxMtQW1lcmljYSBPbmxpbmUgUm9vdCBD\nZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSAxMB4XDTAyMDUyODA2MDAwMFoXDTM3MTExOTIwNDMw\nMFowYzELMAkGA1UEBhMCVVMxHDAaBgNVBAoTE0FtZXJpY2EgT25saW5lIEluYy4xNjA0BgNV\nBAMTLUFtZXJpY2EgT25saW5lIFJvb3QgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgMTCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKgv6KRpBgNHw+kqmP8ZonCaxlCyfqXfaE0b\nfA+2l2h9LaaLl+lkhsmj76CGv2BlnEtUiMJIxUo5vxTjWVXlGbR0yLQFOVwWpeKVBeASrlmL\nojNoWBym1BW32J/X3HGrfpq/m44zDyL9Hy7nBzbvYjnF3cu6JRQj3gzGPTzOggjmZj7aUTsW\nOqMFf6Dch9Wc/HKpoH145LcxVR5lu9RhsCFg7RAycsWSJR74kEoYeEfffjA3PlAb2xzTa5qG\nUwew76wGePiEmf4hjUyAtgyC9mZweRrTT6PP8c9GsEsPPt2IYriMqQkoO3rHl+Ee5fSfwMCu\nJKDIodkP1nsmgmkyPacCAwEAAaNjMGEwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUAK3Z\no/Z59m50qX8zPYEX10zPM94wHwYDVR0jBBgwFoAUAK3Zo/Z59m50qX8zPYEX10zPM94wDgYD\nVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBBQUAA4IBAQB8itEfGDeC4Liwo+1WlchiYZwFos3C\nYiZhzRAW18y0ZTTQEYqtqKkFZu90821fnZmv9ov761KyBZiibyrFVL0lvV+uyIbqRizBs73B\n6UlwGBaXCBOMIOAbLjpHyx7kADCVW/RFo8AasAFOq73AI25jP4BKxQft3OJvx8Fi8eNy1gTI\ndGcL+oiroQHIb/AUr9KZzVGTfu0uOMe9zkZQPXLjeSWdm4grECDdpbgyn43gKd8hdIaC2y+C\nMMbHNYaz+ZZfRtsMRf3zUMNvxsNIrUam4SdHCh0Om7bCd39j8uB9Gr784N/Xx6dssPmuujz9\ndLQR6FgNgLzTqIA6me11zEZ7\n-----END CERTIFICATE-----\n",
  "America Online Root Certification Authority 2": "-----BEGIN CERTIFICATE-----\nMIIFpDCCA4ygAwIBAgIBATANBgkqhkiG9w0BAQUFADBjMQswCQYDVQQGEwJVUzEcMBoGA1UE\nChMTQW1lcmljYSBPbmxpbmUgSW5jLjE2MDQGA1UEAxMtQW1lcmljYSBPbmxpbmUgUm9vdCBD\nZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSAyMB4XDTAyMDUyODA2MDAwMFoXDTM3MDkyOTE0MDgw\nMFowYzELMAkGA1UEBhMCVVMxHDAaBgNVBAoTE0FtZXJpY2EgT25saW5lIEluYy4xNjA0BgNV\nBAMTLUFtZXJpY2EgT25saW5lIFJvb3QgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgMjCCAiIw\nDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMxBRR3pPU0Q9oyxQcngXssNt79Hc9PwVU3d\nxgz6sWYFas14tNwC206B89enfHG8dWOgXeMHDEjsJcQDIPT/DjsS/5uN4cbVG7RtIuOx238h\nZK+GvFciKtZHgVdEglZTvYYUAQv8f3SkWq7xuhG1m1hagLQ3eAkzfDJHA1zEpYNI9FdWboE2\nJxhP7JsowtS013wMPgwr38oE18aO6lhOqKSlGBxsRZijQdEt0sdtjRnxrXm3gT+9BoInLRBY\nBbV4Bbkv2wxrkJB+FFk4u5QkE+XRnRTf04JNRvCAOVIyD+OEsnpD8l7eXz8d3eOyG6ChKiMD\nbi4BFYdcpnV1x5dhvt6G3NRI270qv0pV2uh9UPu0gBe4lL8BPeraunzgWGcXuVjgiIZGZ2yd\nEEdYMtA1fHkqkKJaEBEjNa0vzORKW6fIJ/KD3l67Xnfn6KVuY8INXWHQjNJsWiEOyiijzirp\nlcdIz5ZvHZIlyMbGwcEMBawmxNJ10uEqZ8A9W6Wa6897GqidFEXlD6CaZd4vKL3Ob5Rmg0gp\n2OpljK+T2WSfVVcmv2/LNzGZo2C7HK2JNDJiuEMhBnIMoVxtRsX6Kc8w3onccVvdtjc+31D1\nuAclJuW8tf48ArO3+L5DwYcRlJ4jbBeKuIonDFRH8KmzwICMoCfrHRnjB453cMor9H124Hhn\nAgMBAAGjYzBhMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFE1FwWg4u3OpaaEg5+31IqEj\nFNeeMB8GA1UdIwQYMBaAFE1FwWg4u3OpaaEg5+31IqEjFNeeMA4GA1UdDwEB/wQEAwIBhjAN\nBgkqhkiG9w0BAQUFAAOCAgEAZ2sGuV9FOypLM7PmG2tZTiLMubekJcmnxPBUlgtk87FYT15R\n/LKXeydlwuXK5w0MJXti4/qftIe3RUavg6WXSIylvfEWK5t2LHo1YGwRgJfMqZJS5ivmae2p\n+DYtLHe/YUjRYwu5W1LtGLBDQiKmsXeu3mnFzcccobGlHBD7GL4acN3Bkku+KVqdPzW+5X1R\n+FXgJXUjhx5c3LqdsKyzadsXg8n33gy8CNyRnqjQ1xU3c6U1uPx+xURABsPr+CKAXEfOAuMR\nn0T//ZoyzH1kUQ7rVyZ2OuMeIjzCpjbdGe+n/BLzJsBZMYVMnNjP36TMzCmT/5RtdlwTCJfy\n7aULTd3oyWgOZtMADjMSW7yV5TKQqLPGbIOtd+6Lfn6xqavT4fG2wLHqiMDn05DpKJKUe2h7\nlyoKZy2FAjgQ5ANh1NolNscIWC2hp1GvMApJ9aZphwctREZ2jirlmjvXGKL8nDgQzMY70rUX\nOm/9riW99XJZZLF0KjhfGEzfz3EEWjbUvy+ZnOjZurGV5gJLIaFb1cFPj65pbVPbAZO1XB4Y\n3WRayhgoPmMEEf0cjQAPuDffZ4qdZqkCapH/E8ovXYO8h5Ns3CRRFgQlZvqz2cK6Kb6aSDiC\nmfS/O0oxGfm/jiEzFMpPVF/7zvuPcX/9XhmgD0uRuMRUvAawRY8mkaKO/qk=\n-----END CERTIFICATE-----\n",
  "Visa eCommerce Root": "-----BEGIN CERTIFICATE-----\nMIIDojCCAoqgAwIBAgIQE4Y1TR0/BvLB+WUF1ZAcYjANBgkqhkiG9w0BAQUFADBrMQswCQYD\nVQQGEwJVUzENMAsGA1UEChMEVklTQTEvMC0GA1UECxMmVmlzYSBJbnRlcm5hdGlvbmFsIFNl\ncnZpY2UgQXNzb2NpYXRpb24xHDAaBgNVBAMTE1Zpc2EgZUNvbW1lcmNlIFJvb3QwHhcNMDIw\nNjI2MDIxODM2WhcNMjIwNjI0MDAxNjEyWjBrMQswCQYDVQQGEwJVUzENMAsGA1UEChMEVklT\nQTEvMC0GA1UECxMmVmlzYSBJbnRlcm5hdGlvbmFsIFNlcnZpY2UgQXNzb2NpYXRpb24xHDAa\nBgNVBAMTE1Zpc2EgZUNvbW1lcmNlIFJvb3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\nAoIBAQCvV95WHm6h2mCxlCfLF9sHP4CFT8icttD0b0/Pmdjh28JIXDqsOTPHH2qLJj0rNfVI\nsZHBAk4ElpF7sDPwsRROEW+1QK8bRaVK7362rPKgH1g/EkZgPI2h4H3PVz4zHvtH8aoVlwdV\nZqW1LS7YgFmypw23RuwhY/81q6UCzyr0TP579ZRdhE2o8mCP2w4lPJ9zcc+U30rq299yOIzz\nlr3xF7zSujtFWsan9sYXiwGd/BmoKoMWuDpI/k4+oKsGGelT84ATB+0tvz8KPFUgOSwsAGl0\nlUq8ILKpeeUYiZGo3BxN77t+Nwtd/jmliFKMAGzsGHxBvfaLdXe6YJ2E5/4tAgMBAAGjQjBA\nMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBQVOIMPPyw/cDMe\nzUb+B4wg4NfDtzANBgkqhkiG9w0BAQUFAAOCAQEAX/FBfXxcCLkr4NWSR/pnXKUTwwMhmytM\niUbPWU3J/qVAtmPN3XEolWcRzCSs00Rsca4BIGsDoo8Ytyk6feUWYFN4PMCvFYP3j1IzJL1k\nk5fui/fbGKhtcbP3LBfQdCVp9/5rPJS+TUtBjE7ic9DjkCJzQ83z7+pzzkWKsKZJ/0x9nXGI\nxHYdkFsd7v3M9+79YKWxehZx0RbQfBI8bGmX265fOZpwLwU8GUYEmSA20GBuYQa7FkKMcPcw\n++DbZqMAAb3mLNqRX6BGi01qnD093QVG/na/oAo85ADmJ7f/hC3euiInlhBx6yLt398znM/j\nra6O1I7mT1GvFpLgXPYHDw==\n-----END CERTIFICATE-----\n",
  "Certum Root CA": "-----BEGIN CERTIFICATE-----\nMIIDDDCCAfSgAwIBAgIDAQAgMA0GCSqGSIb3DQEBBQUAMD4xCzAJBgNVBAYTAlBMMRswGQYD\nVQQKExJVbml6ZXRvIFNwLiB6IG8uby4xEjAQBgNVBAMTCUNlcnR1bSBDQTAeFw0wMjA2MTEx\nMDQ2MzlaFw0yNzA2MTExMDQ2MzlaMD4xCzAJBgNVBAYTAlBMMRswGQYDVQQKExJVbml6ZXRv\nIFNwLiB6IG8uby4xEjAQBgNVBAMTCUNlcnR1bSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAM6xwS7TT3zNJc4YPk/EjG+AanPIW1H4m9LcuwBcsaD8dQPugfCI7iNS6eYV\nM42sLQnFdvkrOYCJ5JdLkKWoePhzQ3ukYbDYWMzhbGZ+nPMJXlVjhNWo7/OxLjBos8Q82Kxu\njZlakE403Daaj4GIULdtlkIJ89eVgw1BS7Bqa/j8D35in2fE7SZfECYPCE/wpFcozo+47UX2\nbu4lXapuOb7kky/ZR6By6/qmW6/KUz/iDsaWVhFu9+lmqSbYf5VT7QqFiLpPKaVCjF62/IUg\nAKpoC6EahQGcxEZjgoi2IrHu/qpGWX7PNSzVttpd90gzFFS269lvzs2I1qsb2pY7HVkCAwEA\nAaMTMBEwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQUFAAOCAQEAuI3O7+cUus/usESS\nbLQ5PqKEbq24IXfS1HeCh+YgQYHu4vgRt2PRFze+GXYkHAQaTOs9qmdvLdTN/mUxcMUbpgIK\numB7bVjCmkn+YzILa+M6wKyrO7Do0wlRjBCDxjTgxSvgGrZgFCdsMneMvLJymM/NzD+5yCRC\nFNZX/OYmQ6kd5YCQzgNUKD73P9P4Te1qCjqTE5s7FCMTY5w/0YcneeVMUeMBrYVdGjux1XMQ\npNPyvG5k9VpWkKjHDkx0Dy5xO/fIR/RpbxXyEV6DHpx8Uq79AtoSqFlnGNu8cN2bsWntgM6J\nQEhqDjXKKWYVIZQs6GAqm4VKQPNriiTsBhYscw==\n-----END CERTIFICATE-----\n",
  "Comodo AAA Services root": "-----BEGIN CERTIFICATE-----\nMIIEMjCCAxqgAwIBAgIBATANBgkqhkiG9w0BAQUFADB7MQswCQYDVQQGEwJHQjEbMBkGA1UE\nCAwSR3JlYXRlciBNYW5jaGVzdGVyMRAwDgYDVQQHDAdTYWxmb3JkMRowGAYDVQQKDBFDb21v\nZG8gQ0EgTGltaXRlZDEhMB8GA1UEAwwYQUFBIENlcnRpZmljYXRlIFNlcnZpY2VzMB4XDTA0\nMDEwMTAwMDAwMFoXDTI4MTIzMTIzNTk1OVowezELMAkGA1UEBhMCR0IxGzAZBgNVBAgMEkdy\nZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBwwHU2FsZm9yZDEaMBgGA1UECgwRQ29tb2RvIENB\nIExpbWl0ZWQxITAfBgNVBAMMGEFBQSBDZXJ0aWZpY2F0ZSBTZXJ2aWNlczCCASIwDQYJKoZI\nhvcNAQEBBQADggEPADCCAQoCggEBAL5AnfRu4ep2hxxNRUSOvkbIgwadwSr+GB+O5AL686td\nUIoWMQuaBtDFcCLNSS1UY8y2bmhGC1Pqy0wkwLxyTurxFa70VJoSCsN6sjNg4tqJVfMiWPPe\n3M/vg4aijJRPn2jymJBGhCfHdr/jzDUsi14HZGWCwEiwqJH5YZ92IFCokcdmtet4YgNW8Ioa\nE+oxox6gmf049vYnMlhvB/VruPsUK6+3qszWY19zjNoFmag4qMsXeDZRrOme9Hg6jc8P2ULi\nmAyrL58OAd7vn5lJ8S3frHRNG5i1R8XlKdH5kBjHYpy+g8cmez6KJcfA3Z3mNWgQIJ2P2N7S\nw4ScDV7oL8kCAwEAAaOBwDCBvTAdBgNVHQ4EFgQUoBEKIz6W8Qfs4q8p74Klf9AwpLQwDgYD\nVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMBAf8wewYDVR0fBHQwcjA4oDagNIYyaHR0cDov\nL2NybC5jb21vZG9jYS5jb20vQUFBQ2VydGlmaWNhdGVTZXJ2aWNlcy5jcmwwNqA0oDKGMGh0\ndHA6Ly9jcmwuY29tb2RvLm5ldC9BQUFDZXJ0aWZpY2F0ZVNlcnZpY2VzLmNybDANBgkqhkiG\n9w0BAQUFAAOCAQEACFb8AvCb6P+k+tZ7xkSAzk/ExfYAWMymtrwUSWgEdujm7l3sAg9g1o1Q\nGE8mTgHj5rCl7r+8dFRBv/38ErjHT1r0iWAFf2C3BUrz9vHCv8S5dIa2LX1rzNLzRt0vxuBq\nw8M0Ayx9lt1awg6nCpnBBYurDC/zXDrPbDdVCYfeU0BsWO/8tqtlbgT2G9w84FoVxp7Z8VlI\nMCFlA2zs6SFz7JsDoeA3raAVGI/6ugLOpyypEBMs1OUIJqsil2D4kF501KKaU73yqWjgom7C\n12yxow+ev+to51byrvLjKzg6CYG1a4XXvi3tPxq3smPi9WIsgtRqAEFQ8TmDn5XpNpaYbg==\n-----END CERTIFICATE-----\n",
  "Comodo Secure Services root": "-----BEGIN CERTIFICATE-----\nMIIEPzCCAyegAwIBAgIBATANBgkqhkiG9w0BAQUFADB+MQswCQYDVQQGEwJHQjEbMBkGA1UE\nCAwSR3JlYXRlciBNYW5jaGVzdGVyMRAwDgYDVQQHDAdTYWxmb3JkMRowGAYDVQQKDBFDb21v\nZG8gQ0EgTGltaXRlZDEkMCIGA1UEAwwbU2VjdXJlIENlcnRpZmljYXRlIFNlcnZpY2VzMB4X\nDTA0MDEwMTAwMDAwMFoXDTI4MTIzMTIzNTk1OVowfjELMAkGA1UEBhMCR0IxGzAZBgNVBAgM\nEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBwwHU2FsZm9yZDEaMBgGA1UECgwRQ29tb2Rv\nIENBIExpbWl0ZWQxJDAiBgNVBAMMG1NlY3VyZSBDZXJ0aWZpY2F0ZSBTZXJ2aWNlczCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMBxM4KK0HDrc4eCQNUd5MvJDkKQ+d40uaG6\nEfQlhfPMcm3ye5drswfxdySRXyWP9nQ95IDC+DwN879A6vfIUtFyb+/Iq0G4bi4XKpVpDM3S\nHpR7LZQdqnXXs5jLrLxkU0C8j6ysNstcrbvd4JQX7NFc0L/vpZXJkMWwrPsbQ996CF23uPJA\nGysnnlDOXmWCiIxe004MeuoIkbY2qitC++rCoznl2yY4rYsK7hljxxwk3wN42ubqwUcaCwtG\nCd0C/N7Lh1/XMGNooa7cMqG6vv5Eq2i2pRcV/b3Vp6ea5EQz6YiO/O1R65NxTq0B50SOqy3L\nqP4BSUjwwN3HaNiS/j0CAwEAAaOBxzCBxDAdBgNVHQ4EFgQUPNiTiMLAggnMAZkGkyDpnnAJ\nY08wDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMBAf8wgYEGA1UdHwR6MHgwO6A5oDeG\nNWh0dHA6Ly9jcmwuY29tb2RvY2EuY29tL1NlY3VyZUNlcnRpZmljYXRlU2VydmljZXMuY3Js\nMDmgN6A1hjNodHRwOi8vY3JsLmNvbW9kby5uZXQvU2VjdXJlQ2VydGlmaWNhdGVTZXJ2aWNl\ncy5jcmwwDQYJKoZIhvcNAQEFBQADggEBAIcBbSMdflsXfcFhMs+P5/OKlFlm4J4oqF7Tt/Q0\n5qo5spcWxYJvMqTpjOev/e/C6LlLqqP05tqNZSH7uoDrJiiFGv45jN5bBAS0VPmjZ55B+glS\nzAVIqMk/IQQezkhr/IXownuvf7fM+F86/TXGDe+X3EyrEeFryzHRbPtIgKvcnDe4IRRLDXE9\n7IMzbtFuMhbsmMcWi1mmNKsFVy2T96oTy9IT4rcuO81rUBcJaD61JlfutuC23bkpgHl9j6Pw\npCikFcSF9CfUa7/lXORlAnZUtOM3ZiTTGWHIUhDlizeauan5Hb/qmZJhlv8BzaFfDbxxvA6s\nCx1HRR3B7Hzs/Sk=\n-----END CERTIFICATE-----\n",
  "Comodo Trusted Services root": "-----BEGIN CERTIFICATE-----\nMIIEQzCCAyugAwIBAgIBATANBgkqhkiG9w0BAQUFADB/MQswCQYDVQQGEwJHQjEbMBkGA1UE\nCAwSR3JlYXRlciBNYW5jaGVzdGVyMRAwDgYDVQQHDAdTYWxmb3JkMRowGAYDVQQKDBFDb21v\nZG8gQ0EgTGltaXRlZDElMCMGA1UEAwwcVHJ1c3RlZCBDZXJ0aWZpY2F0ZSBTZXJ2aWNlczAe\nFw0wNDAxMDEwMDAwMDBaFw0yODEyMzEyMzU5NTlaMH8xCzAJBgNVBAYTAkdCMRswGQYDVQQI\nDBJHcmVhdGVyIE1hbmNoZXN0ZXIxEDAOBgNVBAcMB1NhbGZvcmQxGjAYBgNVBAoMEUNvbW9k\nbyBDQSBMaW1pdGVkMSUwIwYDVQQDDBxUcnVzdGVkIENlcnRpZmljYXRlIFNlcnZpY2VzMIIB\nIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA33FvNlhTWvI2VFeAxHQIIO0Yfyod5jWa\nHiWsnOWWfnJSoBVC21ndZHoa0Lh73TkVvFVIxO06AOoxEbrycXQaZ7jPM8yoMa+j49d/vzMt\nTGo87IvDktJTdyR0nAducPy9C1t2ul/y/9c3S0pgePfw+spwtOpZqqPOSC+pw7ILfhdyFgym\nBwwbOM/JYrc/oJOlh0Hyt3BAd9i+FHzjqMB6juljatEPmsbS9Is6FARW1O24zG71++IsWL1/\nT2sr92AkWCTOJu80kTrV44HQsvAEAtdbtz6SrGsSivnkBbA7kUlcsutT6vifR4buv5XAwAaf\n0lteERv0xwQ1KdJVXOTt6wIDAQABo4HJMIHGMB0GA1UdDgQWBBTFe1i97doladL3WRaoszLA\neydb9DAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zCBgwYDVR0fBHwwejA8oDqg\nOIY2aHR0cDovL2NybC5jb21vZG9jYS5jb20vVHJ1c3RlZENlcnRpZmljYXRlU2VydmljZXMu\nY3JsMDqgOKA2hjRodHRwOi8vY3JsLmNvbW9kby5uZXQvVHJ1c3RlZENlcnRpZmljYXRlU2Vy\ndmljZXMuY3JsMA0GCSqGSIb3DQEBBQUAA4IBAQDIk4E7ibSvuIQSTI3S8NtwuleGFTQQuS9/\nHrCoiWChisJ3DFBKmwCL2Iv0QeLQg4pKHBQGsKNoBXAxMKdTmw7pSqBYaWcOrp32pSxBvzwG\na+RZzG0Q8ZZvH9/0BAKkn0U+yNj6NkZEUD+Cl5EfKNsYEYwq5GWDVxISjBc/lDb+XbDABHcT\nuPQV1T84zJQ6VdCsmPW6AF/ghhmBeC8owH7TzEIK9a5QoNE+xqFx7D+gIIxmOom0jtTYsU0l\nR+4viMi14QVFwL4Ucd56/Y57fU0IlqUSc/AtyjcndBInTMu2l+nZrghtWjlA3QVHdWpaIbOj\nGM9O9y5Xt5hwXsjEeLBi\n-----END CERTIFICATE-----\n",
  "QuoVadis Root CA": "-----BEGIN CERTIFICATE-----\nMIIF0DCCBLigAwIBAgIEOrZQizANBgkqhkiG9w0BAQUFADB/MQswCQYDVQQGEwJCTTEZMBcG\nA1UEChMQUXVvVmFkaXMgTGltaXRlZDElMCMGA1UECxMcUm9vdCBDZXJ0aWZpY2F0aW9uIEF1\ndGhvcml0eTEuMCwGA1UEAxMlUXVvVmFkaXMgUm9vdCBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0\neTAeFw0wMTAzMTkxODMzMzNaFw0yMTAzMTcxODMzMzNaMH8xCzAJBgNVBAYTAkJNMRkwFwYD\nVQQKExBRdW9WYWRpcyBMaW1pdGVkMSUwIwYDVQQLExxSb290IENlcnRpZmljYXRpb24gQXV0\naG9yaXR5MS4wLAYDVQQDEyVRdW9WYWRpcyBSb290IENlcnRpZmljYXRpb24gQXV0aG9yaXR5\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv2G1lVO6V/z68mcLOhrfEYBklbTR\nvM16z/Ypli4kVEAkOPcahdxYTMukJ0KX0J+DisPkBgNbAKVRHnAEdOLB1Dqr1607BxgFjv2D\nrOpm2RgbaIr1VxqYuvXtdj182d6UajtLF8HVj71lODqV0D1VNk7feVcxKh7YWWVJWCCYfqtf\nfp/p1k3sg3Spx2zY7ilKhSoGFPlU5tPaZQeLYzcS19Dsw3sgQUSj7cugF+FxZc4dZjH3dgEZ\nyH0DWLaVSR2mEiboxgx24ONmy+pdpibu5cxfvWenAScOospUxbF6lR1xHkopigPcakXBpBle\nbzbNw6Kwt/5cOOJSvPhEQ+aQuwIDAQABo4ICUjCCAk4wPQYIKwYBBQUHAQEEMTAvMC0GCCsG\nAQUFBzABhiFodHRwczovL29jc3AucXVvdmFkaXNvZmZzaG9yZS5jb20wDwYDVR0TAQH/BAUw\nAwEB/zCCARoGA1UdIASCAREwggENMIIBCQYJKwYBBAG+WAABMIH7MIHUBggrBgEFBQcCAjCB\nxxqBxFJlbGlhbmNlIG9uIHRoZSBRdW9WYWRpcyBSb290IENlcnRpZmljYXRlIGJ5IGFueSBw\nYXJ0eSBhc3N1bWVzIGFjY2VwdGFuY2Ugb2YgdGhlIHRoZW4gYXBwbGljYWJsZSBzdGFuZGFy\nZCB0ZXJtcyBhbmQgY29uZGl0aW9ucyBvZiB1c2UsIGNlcnRpZmljYXRpb24gcHJhY3RpY2Vz\nLCBhbmQgdGhlIFF1b1ZhZGlzIENlcnRpZmljYXRlIFBvbGljeS4wIgYIKwYBBQUHAgEWFmh0\ndHA6Ly93d3cucXVvdmFkaXMuYm0wHQYDVR0OBBYEFItLbe3TKbkGGew5Oanwl4Rqy+/fMIGu\nBgNVHSMEgaYwgaOAFItLbe3TKbkGGew5Oanwl4Rqy+/foYGEpIGBMH8xCzAJBgNVBAYTAkJN\nMRkwFwYDVQQKExBRdW9WYWRpcyBMaW1pdGVkMSUwIwYDVQQLExxSb290IENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5MS4wLAYDVQQDEyVRdW9WYWRpcyBSb290IENlcnRpZmljYXRpb24gQXV0\naG9yaXR5ggQ6tlCLMA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQUFAAOCAQEAitQUtf70\nmpKnGdSkfnIYj9lofFIk3WdvOXrEql494liwTXCYhGHoG+NpGA7O+0dQoE7/8CQfvbLO9Sf8\n7C9TqnN7Az10buYWnuulLsS/VidQK2K6vkscPFVcQR0kvoIgR13VRH56FmjffU1RcHhXHTMe\n/QKZnAzNCgVPx7uOpHX6Sm2xgI4JVrmcGmD+XcHXetwReNDWXcG31a0ymQM6isxUJTkxgXsT\nIlG6Rmyhu576BGxJJnSP0nPrzDCi5upZIof4l/UO/erMkqQWxFIY6iHOsfHmhIHluqmGKPJD\nWl0Snawe2ajlCmqnf6CHKc/yiU3U7MXi5nrQNiOKSnQ2+Q==\n-----END CERTIFICATE-----\n",
  "QuoVadis Root CA 2": "-----BEGIN CERTIFICATE-----\nMIIFtzCCA5+gAwIBAgICBQkwDQYJKoZIhvcNAQEFBQAwRTELMAkGA1UEBhMCQk0xGTAXBgNV\nBAoTEFF1b1ZhZGlzIExpbWl0ZWQxGzAZBgNVBAMTElF1b1ZhZGlzIFJvb3QgQ0EgMjAeFw0w\nNjExMjQxODI3MDBaFw0zMTExMjQxODIzMzNaMEUxCzAJBgNVBAYTAkJNMRkwFwYDVQQKExBR\ndW9WYWRpcyBMaW1pdGVkMRswGQYDVQQDExJRdW9WYWRpcyBSb290IENBIDIwggIiMA0GCSqG\nSIb3DQEBAQUAA4ICDwAwggIKAoICAQCaGMpLlA0ALa8DKYrwD4HIrkwZhR0In6spRIXzL4Gt\nMh6QRr+jhiYaHv5+HBg6XJxgFyo6dIMzMH1hVBHL7avg5tKifvVrbxi3Cgst/ek+7wrGsxDp\n3MJGF/hd/aTa/55JWpzmM+Yklvc/ulsrHHo1wtZn/qtmUIttKGAr79dgw8eTvI02kfN/+NsR\nE8Scd3bBrrcCaoF6qUWD4gXmuVbBlDePSHFjIuwXZQeVikvfj8ZaCuWw419eaxGrDPmF60Tp\n+ARz8un+XJiM9XOva7R+zdRcAitMOeGylZUtQofX1bOQQ7dsE/He3fbE+Ik/0XX1ksOR1YqI\n0JDs3G3eicJlcZaLDQP9nL9bFqyS2+r+eXyt66/3FsvbzSUr5R/7mp/iUcw6UwxI5g69ybR2\nBlLmEROFcmMDBOAENisgGQLodKcftslWZvB1JdxnwQ5hYIizPtGo/KPaHbDRsSNU30R2be1B\n2MGyIrZTHN81Hdyhdyox5C315eXbyOD/5YDXC2Og/zOhD7osFRXql7PSorW+8oyWHhqPHWyk\nYTe5hnMz15eWniN9gqRMgeKh0bpnX5UHoycR7hYQe7xFSkyyBNKr79X9DFHOUGoIMfmR2gyP\nZFwDwzqLID9ujWc9Otb+fVuIyV77zGHcizN300QyNQliBJIWENieJ0f7OyHj+OsdWwIDAQAB\no4GwMIGtMA8GA1UdEwEB/wQFMAMBAf8wCwYDVR0PBAQDAgEGMB0GA1UdDgQWBBQahGK8SEwz\nJQTU7tD2A8QZRtGUazBuBgNVHSMEZzBlgBQahGK8SEwzJQTU7tD2A8QZRtGUa6FJpEcwRTEL\nMAkGA1UEBhMCQk0xGTAXBgNVBAoTEFF1b1ZhZGlzIExpbWl0ZWQxGzAZBgNVBAMTElF1b1Zh\nZGlzIFJvb3QgQ0EgMoICBQkwDQYJKoZIhvcNAQEFBQADggIBAD4KFk2fBluornFdLwUvZ+YT\nRYPENvbzwCYMDbVHZF34tHLJRqUDGCdViXh9duqWNIAXINzng/iN/Ae42l9NLmeyhP3ZRPx3\nUIHmfLTJDQtyU/h2BwdBR5YM++CCJpNVjP4iH2BlfF/nJrP3MpCYUNQ3cVX2kiF495V5+vgt\nJodmVjB3pjd4M1IQWK4/YY7yarHvGH5KWWPKjaJW1acvvFYfzznB4vsKqBUsfU16Y8Zsl0Q8\n0m/DShcK+JDSV6IZUaUtl0HaB0+pUNqQjZRG4T7wlP0QADj1O+hA4bRuVhogzG9Yje0uRY/W\n6ZM/57Es3zrWIozchLsib9D45MY56QSIPMO661V6bYCZJPVsAfv4l7CUW+v90m/xd2gNNWQj\nrLhVoQPRTUIZ3Ph1WVaj+ahJefivDrkRoHy3au000LYmYjgahwz46P0u05B/B5EqHdZ+XIWD\nmbA4CD/pXvk1B+TJYm5Xf6dQlfe6yJvmjqIBxdZmv3lh8zwc4bmCXF2gw+nYSL0ZohEUGW6y\nhhtoPkg3Goi3XZZenMfvJ2II4pEZXNLxId26F0KCl3GBUzGpn/Z9Yr9y4aOTHcyKJloJONDO\n1w2AFrR4pTqHTI2KpdVGl/IsELm8VCLAAVBpQ570su9t+Oza8eOx79+Rj1QqCyXBJhnEUhAF\nZdWCEOrCMc0u\n-----END CERTIFICATE-----\n",
  "QuoVadis Root CA 3": "-----BEGIN CERTIFICATE-----\nMIIGnTCCBIWgAwIBAgICBcYwDQYJKoZIhvcNAQEFBQAwRTELMAkGA1UEBhMCQk0xGTAXBgNV\nBAoTEFF1b1ZhZGlzIExpbWl0ZWQxGzAZBgNVBAMTElF1b1ZhZGlzIFJvb3QgQ0EgMzAeFw0w\nNjExMjQxOTExMjNaFw0zMTExMjQxOTA2NDRaMEUxCzAJBgNVBAYTAkJNMRkwFwYDVQQKExBR\ndW9WYWRpcyBMaW1pdGVkMRswGQYDVQQDExJRdW9WYWRpcyBSb290IENBIDMwggIiMA0GCSqG\nSIb3DQEBAQUAA4ICDwAwggIKAoICAQDMV0IWVJzmmNPTTe7+7cefQzlKZbPoFog02w1ZkXTP\nkrgEQK0CSzGrvI2RaNggDhoB4hp7Thdd4oq3P5kazethq8Jlph+3t723j/z9cI8LoGe+AaJZ\nz3HmDyl2/7FWeUUrH556VOijKTVopAFPD6QuN+8bv+OPEKhyq1hX51SGyMnzW9os2l2Objyj\nPtr7guXd8lyyBTNvijbO0BNO/79KDDRMpsMhvVAEVeuxu537RR5kFd5VAYwCdrXLoT9Cabwv\nvWhDFlaJKjdhkf2mrk7AyxRllDdLkgbvBNDInIjbC3uBr7E9KsRlOni27tyAsdLTmZw67mta\na7ONt9XOnMK+pUsvFrGeaDsGb659n/je7Mwpp5ijJUMv7/FfJuGITfhebtfZFG4ZM2mnO4SJ\nk8RTVROhUXhA+LjJou57ulJCg54U7QVSWllWp5f8nT8KKdjcT5EOE7zelaTfi5m+rJsziO+1\nga8bxiJTyPbH7pcUsMV8eFLI8M5ud2CEpukqdiDtWAEXMJPpGovgc2PZapKUSU60rUqFxKMi\nMPwJ7Wgic6aIDFUhWMXhOp8q3crhkODZc6tsgLjoC2SToJyMGf+z0gzskSaHirOi4XCPLArl\nzW1oUevaPwV/izLmE1xr/l9A4iLItLRkT9a6fUg+qGkM17uGcclzuD87nSVL2v9A6wIDAQAB\no4IBlTCCAZEwDwYDVR0TAQH/BAUwAwEB/zCB4QYDVR0gBIHZMIHWMIHTBgkrBgEEAb5YAAMw\ngcUwgZMGCCsGAQUFBwICMIGGGoGDQW55IHVzZSBvZiB0aGlzIENlcnRpZmljYXRlIGNvbnN0\naXR1dGVzIGFjY2VwdGFuY2Ugb2YgdGhlIFF1b1ZhZGlzIFJvb3QgQ0EgMyBDZXJ0aWZpY2F0\nZSBQb2xpY3kgLyBDZXJ0aWZpY2F0aW9uIFByYWN0aWNlIFN0YXRlbWVudC4wLQYIKwYBBQUH\nAgEWIWh0dHA6Ly93d3cucXVvdmFkaXNnbG9iYWwuY29tL2NwczALBgNVHQ8EBAMCAQYwHQYD\nVR0OBBYEFPLAE+CCQz777i9nMpY1XNu4ywLQMG4GA1UdIwRnMGWAFPLAE+CCQz777i9nMpY1\nXNu4ywLQoUmkRzBFMQswCQYDVQQGEwJCTTEZMBcGA1UEChMQUXVvVmFkaXMgTGltaXRlZDEb\nMBkGA1UEAxMSUXVvVmFkaXMgUm9vdCBDQSAzggIFxjANBgkqhkiG9w0BAQUFAAOCAgEAT62g\nLEz6wPJv92ZVqyM07ucp2sNbtrCD2dDQ4iH782CnO11gUyeim/YIIirnv6By5ZwkajGxkHon\n24QRiSemd1o417+shvzuXYO8BsbRd2sPbSQvS3pspweWyuOEn62Iix2rFo1bZhfZFvSLgNLd\n+LJ2w/w4E6oM3kJpK27zPOuAJ9v1pkQNn1pVWQvVDVJIxa6f8i+AxeoyUDUSly7B4f/xI4hR\nOJ/yZlZ25w9Rl6VSDE1JUZU2Pb+iSwwQHYaZTKrzchGT5Or2m9qoXadNt54CrnMAyNojA+j5\n6hl0YgCUyyIgvpSnWbWCar6ZeXqp8kokUvd0/bpO5qgdAm6xDYBEwa7TIzdfu4V8K5Iu6H6l\ni92Z4b8nby1dqnuH/grdS/yO9SbkbnBCbjPsMZ57k8HkyWkaPcBrTiJt7qtYTcbQQcEr6k8S\nh17rRdhs9ZgC06DYVYoGmRmioHfRMJ6szHXug/WwYjnPbFfiTNKRCw51KBuav/0aQ/HKd/s7\nj2G4aSgWQgRecCocIdiP4b0jWy10QJLZYxkNc91pvGJHvOB0K7Lrfb5BG7XARsWhIstfTsEo\nkt4YutUqKLsRixeTmJlglFwjz1onl14LBQaTNx47aTbrqZ5hHY8y2o4M1nQ+ewkk2gF3R8Q7\nzTSMmfXK4SVhM7JZG+Ju1zdXtg2pEto=\n-----END CERTIFICATE-----\n",
  "Security Communication Root CA": "-----BEGIN CERTIFICATE-----\nMIIDWjCCAkKgAwIBAgIBADANBgkqhkiG9w0BAQUFADBQMQswCQYDVQQGEwJKUDEYMBYGA1UE\nChMPU0VDT00gVHJ1c3QubmV0MScwJQYDVQQLEx5TZWN1cml0eSBDb21tdW5pY2F0aW9uIFJv\nb3RDQTEwHhcNMDMwOTMwMDQyMDQ5WhcNMjMwOTMwMDQyMDQ5WjBQMQswCQYDVQQGEwJKUDEY\nMBYGA1UEChMPU0VDT00gVHJ1c3QubmV0MScwJQYDVQQLEx5TZWN1cml0eSBDb21tdW5pY2F0\naW9uIFJvb3RDQTEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCzs/5/022x7xZ8\nV6UMbXaKL0u/ZPtM7orw8yl89f/uKuDp6bpbZCKamm8sOiZpUQWZJtzVHGpxxpp9Hp3dfGzG\njGdnSj74cbAZJ6kJDKaVv0uMDPpVmDvY6CKhS3E4eayXkmmziX7qIWgGmBSWh9JhNrxtJ1ae\nV+7AwFb9Ms+k2Y7CI9eNqPPYJayX5HA49LY6tJ07lyZDo6G8SVlyTCMwhwFY9k6+HGhWZq/N\nQV3Is00qVUarH9oe4kA92819uZKAnDfdDJZkndwi92SL32HeFZRSFaB9UslLqCHJxrHty8OV\nYNEP8Ktw+N/LTX7s1vqr2b1/VPKl6Xn62dZ2JChzAgMBAAGjPzA9MB0GA1UdDgQWBBSgc0mZ\naNyFW2XjmygvV5+9M7wHSDALBgNVHQ8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG\n9w0BAQUFAAOCAQEAaECpqLvkT115swW1F7NgE+vGkl3g0dNq/vu+m22/xwVtWSDEHPC32oRY\nAmP6SBbvT6UL90qY8j+eG61Ha2POCEfrUj94nK9NrvjVT8+amCoQQTlSxN3Zmw7vkwGusi7K\naEIkQmywszo+zenaSMQVy+n5Bw+SUEmK3TGXX8npN6o7WWWXlDLJs58+OmJYxUmtYg5xpTKq\nL8aJdkNAExNnPaJUJRDL8Try2frbSVa7pv6nQTXD4IhhyYjH3zYQIphZ6rBK+1YWc26sTfci\noU+tHXotRSflMMFe8toTyyVCUZVHA4xsIcx0Qu1T/zOLjw9XARYvz6buyXAiFL39vmwLAw==\n-----END CERTIFICATE-----\n",
  "Sonera Class 2 Root CA": "-----BEGIN CERTIFICATE-----\nMIIDIDCCAgigAwIBAgIBHTANBgkqhkiG9w0BAQUFADA5MQswCQYDVQQGEwJGSTEPMA0GA1UE\nChMGU29uZXJhMRkwFwYDVQQDExBTb25lcmEgQ2xhc3MyIENBMB4XDTAxMDQwNjA3Mjk0MFoX\nDTIxMDQwNjA3Mjk0MFowOTELMAkGA1UEBhMCRkkxDzANBgNVBAoTBlNvbmVyYTEZMBcGA1UE\nAxMQU29uZXJhIENsYXNzMiBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJAX\nSjWdyvANlsdE+hY3/Ei9vX+ALTU74W+oZ6m/AxxNjG8yR9VBaKQTBME1DJqEQ/xcHf+Js+gX\nGM2RX/uJ4+q/Tl18GybTdXnt5oTjV+WtKcT0OijnpXuENmmz/V52vaMtmdOQTiMofRhj8VQ7\nJp12W5dCsv+u8E7s3TmVToMGf+dJQMjFAbJUWmYdPfz56TwKnoG4cPABi+QjVHzIrviQHgCW\nctRUz2EjvOr7nQKV0ba5cTppCD8PtOFCx4j1P5iop7oc4HFx71hXgVB6XGt0Rg6DA5jDjqhu\n8nYybieDwnPz3BjotJPqdURrBGAgcVeHnfO+oJAjPYok4doh28MCAwEAAaMzMDEwDwYDVR0T\nAQH/BAUwAwEB/zARBgNVHQ4ECgQISqCqWITTXjwwCwYDVR0PBAQDAgEGMA0GCSqGSIb3DQEB\nBQUAA4IBAQBazof5FnIVV0sd2ZvnoiYw7JNn39Yt0jSv9zilzqsWuasvfDXLrNAPtEwr/IDv\na4yRXzZ299uzGxnq9LIR/WFxRL8oszodv7ND6J+/3DEIcbCdjdY0RzKQxmUk96BKfARzjzlv\nF4xytb1LyHr4e4PDKE6cCepnP7JnBBvDFNr450kkkdAdavphOe9r5yF1BgfYErQhIHBCcYHa\nPJo2vqZbDWpsmh+Re/n570K6Tk6ezAyNlNzZRZxe7EJQY670XcSxEtzKO6gunRRaBXW37Ndj\n4ro1tgQIkejanZz2ZrUYrAqmVCY0M9IbwdR/GjqOC6oybtv8TyWf2TLHllpwrN9M\n-----END CERTIFICATE-----\n",
  "Staat der Nederlanden Root CA": "-----BEGIN CERTIFICATE-----\nMIIDujCCAqKgAwIBAgIEAJiWijANBgkqhkiG9w0BAQUFADBVMQswCQYDVQQGEwJOTDEeMBwG\nA1UEChMVU3RhYXQgZGVyIE5lZGVybGFuZGVuMSYwJAYDVQQDEx1TdGFhdCBkZXIgTmVkZXJs\nYW5kZW4gUm9vdCBDQTAeFw0wMjEyMTcwOTIzNDlaFw0xNTEyMTYwOTE1MzhaMFUxCzAJBgNV\nBAYTAk5MMR4wHAYDVQQKExVTdGFhdCBkZXIgTmVkZXJsYW5kZW4xJjAkBgNVBAMTHVN0YWF0\nIGRlciBOZWRlcmxhbmRlbiBSb290IENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC\nAQEAmNK1URF6gaYUmHFtvsznExvWJw56s2oYHLZhWtVhCb/ekBPHZ+7d89rFDBKeNVU+LCeI\nQGv33N0iYfXCxw719tV2U02PjLwYdjeFnejKScfST5gTCaI+Ioicf9byEGW07l8Y1Rfj+MX9\n4p2i71MOhXeiD+EwR+4A5zN9RGcaC1Hoi6CeUJhoNFIfLm0B8mBF8jHrqTFoKbt6QZ7GGX+U\ntFE5A3+y3qcym7RHjm+0Sq7lr7HcsBthvJly3uSJt3omXdozSVtSnA71iq3DuD3oBmrC1SoL\nbHuEvVYFy4ZlkuxEK7COudxwC0barbxjiDn622r+I/q85Ej0ZytqERAhSQIDAQABo4GRMIGO\nMAwGA1UdEwQFMAMBAf8wTwYDVR0gBEgwRjBEBgRVHSAAMDwwOgYIKwYBBQUHAgEWLmh0dHA6\nLy93d3cucGtpb3ZlcmhlaWQubmwvcG9saWNpZXMvcm9vdC1wb2xpY3kwDgYDVR0PAQH/BAQD\nAgEGMB0GA1UdDgQWBBSofeu8Y6R0E3QA7Jbg0zTBLL9s+DANBgkqhkiG9w0BAQUFAAOCAQEA\nBYSHVXQ2YcG70dTGFagTtJ+k/rvuFbQvBgwp8qiSpGEN/KtcCFtREytNwiphyPgJWPwtArI5\nfZlmgb9uXJVFIGzmeafR2Bwp/MIgJ1HI8XxdNGdphREwxgDS1/PTfLbwMVcoEoJz6TMvplW0\nC5GUR5z6u3pCMuiufi3IvKwUv9kP2Vv8wfl6leF9fpb8cbDCTMjfRTTJzg3ynGQI0DvDKcWy\n7ZAEwbEpkcUwb8GpcjPM/l0WFywRaed+/sWDCN+83CI6LiBpIzlWYGeQiy52OfsRiJf2fL1L\nuCAWZwWN4jvBcj+UlTfHXbme2JOhF4//DGYVwSR8MnwDHTuhWEUykw==\n-----END CERTIFICATE-----\n",
  "TDC Internet Root CA": "-----BEGIN CERTIFICATE-----\nMIIEKzCCAxOgAwIBAgIEOsylTDANBgkqhkiG9w0BAQUFADBDMQswCQYDVQQGEwJESzEVMBMG\nA1UEChMMVERDIEludGVybmV0MR0wGwYDVQQLExRUREMgSW50ZXJuZXQgUm9vdCBDQTAeFw0w\nMTA0MDUxNjMzMTdaFw0yMTA0MDUxNzAzMTdaMEMxCzAJBgNVBAYTAkRLMRUwEwYDVQQKEwxU\nREMgSW50ZXJuZXQxHTAbBgNVBAsTFFREQyBJbnRlcm5ldCBSb290IENBMIIBIjANBgkqhkiG\n9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxLhAvJHVYx/XmaCLDEAedLdInUaMArLgJF/wGROnN4Nr\nXceO+YQwzho7+vvOi20jxsNuZp+Jpd/gQlBn+h9sHvTQBda/ytZO5GhgbEaqHF1j4QeGDmUA\npy6mcca8uYGoOn0a0vnRrEvLznWv3Hv6gXPU/Lq9QYjUdLP5Xjg6PEOo0pVOd20TDJ2PeAG3\nWiAfAzc14izbSysseLlJ28TQx5yc5IogCSEWVmb/Bexb4/DPqyQkXsN/cHoSxNK1EKC2IeGN\neGlVRGn1ypYcNIUXJXfi9i8nmHj9eQY6otZaQ8H/7AQ77hPv01ha/5Lr7K7a8jcDR0G2l8kt\nCkEiu7vmpwIDAQABo4IBJTCCASEwEQYJYIZIAYb4QgEBBAQDAgAHMGUGA1UdHwReMFwwWqBY\noFakVDBSMQswCQYDVQQGEwJESzEVMBMGA1UEChMMVERDIEludGVybmV0MR0wGwYDVQQLExRU\nREMgSW50ZXJuZXQgUm9vdCBDQTENMAsGA1UEAxMEQ1JMMTArBgNVHRAEJDAigA8yMDAxMDQw\nNTE2MzMxN1qBDzIwMjEwNDA1MTcwMzE3WjALBgNVHQ8EBAMCAQYwHwYDVR0jBBgwFoAUbGQB\nx/2FbazI2p5QCIUItTxWqFAwHQYDVR0OBBYEFGxkAcf9hW2syNqeUAiFCLU8VqhQMAwGA1Ud\nEwQFMAMBAf8wHQYJKoZIhvZ9B0EABBAwDhsIVjUuMDo0LjADAgSQMA0GCSqGSIb3DQEBBQUA\nA4IBAQBOQ8zR3R0QGwZ/t6T609lN+yOfI1Rb5osvBCiLtSdtiaHsmGnc540mgwV5dOy0uaOX\nwTUA/RXaOYE6lTGQ3pfphqiZdwzlWqCE/xIWrG64jcN7ksKsLtB9KOy282A4aW8+2ARVPp7M\nVdK6/rtHBNcK2RYKNCn1WBPVT8+PVkuzHu7TmHnaCB4Mb7j4Fifvwm899qNLPg7kbWzbO0ES\nm70NRyN/PErQr8Cv9u8btRXE64PECV90i9kR+8JWsTz4cMo0jUNAE4z9mQNUecYu6oah9jrU\nCbz0vGbMPVjQV0kK7iXiQe4T+Zs4NNEA9X7nlB38aQNiuJkFBT1reBK9sG9l\n-----END CERTIFICATE-----\n",
  "UTN DATACorp SGC Root CA": "-----BEGIN CERTIFICATE-----\nMIIEXjCCA0agAwIBAgIQRL4Mi1AAIbQR0ypoBqmtaTANBgkqhkiG9w0BAQUFADCBkzELMAkG\nA1UEBhMCVVMxCzAJBgNVBAgTAlVUMRcwFQYDVQQHEw5TYWx0IExha2UgQ2l0eTEeMBwGA1UE\nChMVVGhlIFVTRVJUUlVTVCBOZXR3b3JrMSEwHwYDVQQLExhodHRwOi8vd3d3LnVzZXJ0cnVz\ndC5jb20xGzAZBgNVBAMTElVUTiAtIERBVEFDb3JwIFNHQzAeFw05OTA2MjQxODU3MjFaFw0x\nOTA2MjQxOTA2MzBaMIGTMQswCQYDVQQGEwJVUzELMAkGA1UECBMCVVQxFzAVBgNVBAcTDlNh\nbHQgTGFrZSBDaXR5MR4wHAYDVQQKExVUaGUgVVNFUlRSVVNUIE5ldHdvcmsxITAfBgNVBAsT\nGGh0dHA6Ly93d3cudXNlcnRydXN0LmNvbTEbMBkGA1UEAxMSVVROIC0gREFUQUNvcnAgU0dD\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3+5YEKIrblXEjr8uRgnn4AgPLit6\nE5Qbvfa2gI5lBZMAHryv4g+OGQ0SR+ysraP6LnD43m77VkIVni5c7yPeIbkFdicZD0/Ww5y0\nvpQZY/KmEQrrU0icvvIpOxboGqBMpsn0GFlowHDyUwDAXlCCpVZvNvlK4ESGoE1O1kduSUrL\nZ9emxAW5jh70/P/N5zbgnAVssjMiFdC04MwXwLLA9P4yPykqlXvY8qdOD1R8oQ2AswkDwf9c\n3V6aPryuvEeKaq5xyh+xKrhfQgUL7EYw0XILyulWbfXv33i+Ybqypa4ETLyorGkVl73v67SM\nvzX41MPRKA5cOp9wGDMgd8SirwIDAQABo4GrMIGoMAsGA1UdDwQEAwIBxjAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBRTMtGzz3/64PGgXYVOktKeRR20TzA9BgNVHR8ENjA0MDKgMKAu\nhixodHRwOi8vY3JsLnVzZXJ0cnVzdC5jb20vVVROLURBVEFDb3JwU0dDLmNybDAqBgNVHSUE\nIzAhBggrBgEFBQcDAQYKKwYBBAGCNwoDAwYJYIZIAYb4QgQBMA0GCSqGSIb3DQEBBQUAA4IB\nAQAnNZcAiosovcYzMB4p/OL31ZjUQLtgyr+rFywJNn9Q+kHcrpY6CiM+iVnJowftGzet/Hy+\nUUla3joKVAgWRcKZsYfNjGjgaQPpxE6YsjuMFrMOoAyYUJuTqXAJyCyjj98C5OBxOvG0I3Kg\nqgHf35g+FFCgMSa9KOlaMCZ1+XtgHI3zzVAmbQQnmt/VDUVHKWss5nbZqSl9Mt3JNjy9rjXx\nEZ4du5A/EkdOjtd+D2JzHVImOBwYSf0wdJrE5SIv2MCN7ZF6TACPcn9d2t0bi0Vr591pl6jF\nVkwPDPafepE39peC4N1xaf92P2BNPM/3mfnGV/TJVTl4uix5yaaIK/QI\n-----END CERTIFICATE-----\n",
  "UTN USERFirst Hardware Root CA": "-----BEGIN CERTIFICATE-----\nMIIEdDCCA1ygAwIBAgIQRL4Mi1AAJLQR0zYq/mUK/TANBgkqhkiG9w0BAQUFADCBlzELMAkG\nA1UEBhMCVVMxCzAJBgNVBAgTAlVUMRcwFQYDVQQHEw5TYWx0IExha2UgQ2l0eTEeMBwGA1UE\nChMVVGhlIFVTRVJUUlVTVCBOZXR3b3JrMSEwHwYDVQQLExhodHRwOi8vd3d3LnVzZXJ0cnVz\ndC5jb20xHzAdBgNVBAMTFlVUTi1VU0VSRmlyc3QtSGFyZHdhcmUwHhcNOTkwNzA5MTgxMDQy\nWhcNMTkwNzA5MTgxOTIyWjCBlzELMAkGA1UEBhMCVVMxCzAJBgNVBAgTAlVUMRcwFQYDVQQH\nEw5TYWx0IExha2UgQ2l0eTEeMBwGA1UEChMVVGhlIFVTRVJUUlVTVCBOZXR3b3JrMSEwHwYD\nVQQLExhodHRwOi8vd3d3LnVzZXJ0cnVzdC5jb20xHzAdBgNVBAMTFlVUTi1VU0VSRmlyc3Qt\nSGFyZHdhcmUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCx98M4P7Sof885glFn\n0G2f0v9Y8+efK+wNiVSZuTiZFvfgIXlIwrthdBKWHTxqctU8EGc6Oe0rE81m65UJM6Rsl7Ho\nxuzBdXmcRl6Nq9Bq/bkqVRcQVLMZ8Jr28bFdtqdt++BxF2uiiPsA3/4aMXcMmgF6sTLjKwEH\nOG7DpV4jvEWbe1DByTCP2+UretNb+zNAHqDVmBe8i4fDidNdoI6yqqr2jmmIBsX6iSHzCJ1p\nLgkzmykNRg+MzEk0sGlRvfkGzWitZky8PqxhvQqIDsjfPe58BEydCl5rkdbux+0ojatNh4lz\n0G6k0B4WixThdkQDf2Os5M1JnMWS9KsyoUhbAgMBAAGjgbkwgbYwCwYDVR0PBAQDAgHGMA8G\nA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFKFyXyYbKJhDlV0HN9WFlp1L0sNFMEQGA1UdHwQ9\nMDswOaA3oDWGM2h0dHA6Ly9jcmwudXNlcnRydXN0LmNvbS9VVE4tVVNFUkZpcnN0LUhhcmR3\nYXJlLmNybDAxBgNVHSUEKjAoBggrBgEFBQcDAQYIKwYBBQUHAwUGCCsGAQUFBwMGBggrBgEF\nBQcDBzANBgkqhkiG9w0BAQUFAAOCAQEARxkP3nTGmZev/K0oXnWO6y1n7k57K9cM//bey1Wi\nCuFMVGWTYGufEpytXoMs61quwOQt9ABjHbjAbPLPSbtNk28GpgoiskliCE7/yMgUsogWXecB\n5BKV5UU0s4tpvc+0hY91UZ59Ojg6FEgSxvunOxqNDYJAB+gECJChicsZUN/KHAG8HQQZexB2\nlzvukJDKxA4fFm517zP4029bHpbj4HR3dHuKom4t3XbWOTCC8KucUvIqx69JXn7HaOWCgchq\nJ/kniCrVWFCVH/A7HFe7fRQ5YiuayZSSKqMiDP+JJn1fIytH1xUdqWqeUQ0qUZ6B+dQ7XnAS\nfxAynB67nfhmqA==\n-----END CERTIFICATE-----\n",
  "Camerfirma Chambers of Commerce Root": "-----BEGIN CERTIFICATE-----\nMIIEvTCCA6WgAwIBAgIBADANBgkqhkiG9w0BAQUFADB/MQswCQYDVQQGEwJFVTEnMCUGA1UE\nChMeQUMgQ2FtZXJmaXJtYSBTQSBDSUYgQTgyNzQzMjg3MSMwIQYDVQQLExpodHRwOi8vd3d3\nLmNoYW1iZXJzaWduLm9yZzEiMCAGA1UEAxMZQ2hhbWJlcnMgb2YgQ29tbWVyY2UgUm9vdDAe\nFw0wMzA5MzAxNjEzNDNaFw0zNzA5MzAxNjEzNDRaMH8xCzAJBgNVBAYTAkVVMScwJQYDVQQK\nEx5BQyBDYW1lcmZpcm1hIFNBIENJRiBBODI3NDMyODcxIzAhBgNVBAsTGmh0dHA6Ly93d3cu\nY2hhbWJlcnNpZ24ub3JnMSIwIAYDVQQDExlDaGFtYmVycyBvZiBDb21tZXJjZSBSb290MIIB\nIDANBgkqhkiG9w0BAQEFAAOCAQ0AMIIBCAKCAQEAtzZV5aVdGDDg2olUkfzIx1L4L1DZ77F1\nc2VHfRtbunXF/KGIJPov7coISjlUxFF6tdpg6jg8gbLL8bvZkSM/SAFwdakFKq0fcfPJVD0d\nBmpAPrMMhe5cG3nCYsS4No41XQEMIwRHNaqbYE6gZj3LJgqcQKH0XZi/caulAGgq7YN6D6IU\ntdQis4CwPAxaUWktWBiP7Zme8a7ileb2R6jWDA+wWFjbw2Y3npuRVDM30pQcakjJyfKl2qUM\nI/cjDpwyVV5xnIQFUZot/eZOKjRa3spAN2cMVCFVd9oKDMyXroDclDZK9D7ONhMeU+SsTjoF\n7Nuucpw4i9A5O4kKPnf+dQIBA6OCAUQwggFAMBIGA1UdEwEB/wQIMAYBAf8CAQwwPAYDVR0f\nBDUwMzAxoC+gLYYraHR0cDovL2NybC5jaGFtYmVyc2lnbi5vcmcvY2hhbWJlcnNyb290LmNy\nbDAdBgNVHQ4EFgQU45T1sU3p26EpW1eLTXYGduHRooowDgYDVR0PAQH/BAQDAgEGMBEGCWCG\nSAGG+EIBAQQEAwIABzAnBgNVHREEIDAegRxjaGFtYmVyc3Jvb3RAY2hhbWJlcnNpZ24ub3Jn\nMCcGA1UdEgQgMB6BHGNoYW1iZXJzcm9vdEBjaGFtYmVyc2lnbi5vcmcwWAYDVR0gBFEwTzBN\nBgsrBgEEAYGHLgoDATA+MDwGCCsGAQUFBwIBFjBodHRwOi8vY3BzLmNoYW1iZXJzaWduLm9y\nZy9jcHMvY2hhbWJlcnNyb290Lmh0bWwwDQYJKoZIhvcNAQEFBQADggEBAAxBl8IahsAifJ/7\nkPMa0QOx7xP5IV8EnNrJpY0nbJaHkb5BkAFyk+cefV/2icZdp0AJPaxJRUXcLo0waLIJuvvD\nL8y6C98/d3tGfToSJI6WjzwFCm/SlCgdbQzALogi1djPHRPH8EjX1wWnz8dHnjs8NMiAT9QU\nu/wNUPf6s+xCX6ndbcj0dc97wXImsQEcXCz9ek60AcUFV7nnPKoF2YjpB0ZBzu9Bga5Y34Oi\nrsrXdx/nADydb47kMgkdTXg0eDQ8lJsm7U9xxhl6vSAiSFr+S30Dt+dYvsYyTnQeaN2oaFuz\nPu5ifdmA6Ap1erfutGWaIZDgqtCYvDi1czyL+Nw=\n-----END CERTIFICATE-----\n",
  "Camerfirma Global Chambersign Root": "-----BEGIN CERTIFICATE-----\nMIIExTCCA62gAwIBAgIBADANBgkqhkiG9w0BAQUFADB9MQswCQYDVQQGEwJFVTEnMCUGA1UE\nChMeQUMgQ2FtZXJmaXJtYSBTQSBDSUYgQTgyNzQzMjg3MSMwIQYDVQQLExpodHRwOi8vd3d3\nLmNoYW1iZXJzaWduLm9yZzEgMB4GA1UEAxMXR2xvYmFsIENoYW1iZXJzaWduIFJvb3QwHhcN\nMDMwOTMwMTYxNDE4WhcNMzcwOTMwMTYxNDE4WjB9MQswCQYDVQQGEwJFVTEnMCUGA1UEChMe\nQUMgQ2FtZXJmaXJtYSBTQSBDSUYgQTgyNzQzMjg3MSMwIQYDVQQLExpodHRwOi8vd3d3LmNo\nYW1iZXJzaWduLm9yZzEgMB4GA1UEAxMXR2xvYmFsIENoYW1iZXJzaWduIFJvb3QwggEgMA0G\nCSqGSIb3DQEBAQUAA4IBDQAwggEIAoIBAQCicKLQn0KuWxfH2H3PFIP8T8mhtxOviteePgQK\nkotgVvq0Mi+ITaFgCPS3CU6gSS9J1tPfnZdan5QEcOw/Wdm3zGaLmFIoCQLfxS+EjXqXd7/s\nQJ0lcqu1PzKY+7e3/HKE5TWH+VX6ox8Oby4o3Wmg2UIQxvi1RMLQQ3/bvOSiPGpVeAp3qdjq\nGTK3L/5cPxvusZjsyq16aUXjlg9V9ubtdepl6DJWk0aJqCWKZQbua795B9Dxt6/tLE2Su8Co\nX6dnfQTyFQhwrJLWfQTSM/tMtgsL+xrJxI0DqX5c8lCrEqWhz0hQpe/SyBoT+rB/sYIcd2oP\nX9wLlY/vQ37mRQklAgEDo4IBUDCCAUwwEgYDVR0TAQH/BAgwBgEB/wIBDDA/BgNVHR8EODA2\nMDSgMqAwhi5odHRwOi8vY3JsLmNoYW1iZXJzaWduLm9yZy9jaGFtYmVyc2lnbnJvb3QuY3Js\nMB0GA1UdDgQWBBRDnDafsJ4wTcbOX60Qq+UDpfqpFDAOBgNVHQ8BAf8EBAMCAQYwEQYJYIZI\nAYb4QgEBBAQDAgAHMCoGA1UdEQQjMCGBH2NoYW1iZXJzaWducm9vdEBjaGFtYmVyc2lnbi5v\ncmcwKgYDVR0SBCMwIYEfY2hhbWJlcnNpZ25yb290QGNoYW1iZXJzaWduLm9yZzBbBgNVHSAE\nVDBSMFAGCysGAQQBgYcuCgEBMEEwPwYIKwYBBQUHAgEWM2h0dHA6Ly9jcHMuY2hhbWJlcnNp\nZ24ub3JnL2Nwcy9jaGFtYmVyc2lnbnJvb3QuaHRtbDANBgkqhkiG9w0BAQUFAAOCAQEAPDtw\nkfkEVCeR4e3t/mh/YV3lQWVPMvEYBZRqHN4fcNs+ezICNLUMbKGKfKX0j//U2K0X1S0E0T9Y\ngOKBWYi+wONGkyT+kL0mojAt6JcmVzWJdJYY9hXiryQZVgICsroPFOrGimbBhkVVi76Svpyk\nBMdJPJ7oKXqJ1/6v/2j1pReQvayZzKWGVwlnRtvWFsJG8eSpUPWP0ZIV018+xgBJOm5YstHR\nJw0lyDL4IBHNfTIzSJRUTN3cecQwn+uOuFW114hcxWokPbLTBQNRxgfvzBRydD1ucs4YKIxK\noHflCStFREest2d/AYoFWpO+ocH/+OcOZ6RHSXZddZAa9SaP8A==\n-----END CERTIFICATE-----\n",
  "NetLock Notary (Class A) Root": "-----BEGIN CERTIFICATE-----\nMIIGfTCCBWWgAwIBAgICAQMwDQYJKoZIhvcNAQEEBQAwga8xCzAJBgNVBAYTAkhVMRAwDgYD\nVQQIEwdIdW5nYXJ5MREwDwYDVQQHEwhCdWRhcGVzdDEnMCUGA1UEChMeTmV0TG9jayBIYWxv\nemF0Yml6dG9uc2FnaSBLZnQuMRowGAYDVQQLExFUYW51c2l0dmFueWtpYWRvazE2MDQGA1UE\nAxMtTmV0TG9jayBLb3pqZWd5em9pIChDbGFzcyBBKSBUYW51c2l0dmFueWtpYWRvMB4XDTk5\nMDIyNDIzMTQ0N1oXDTE5MDIxOTIzMTQ0N1owga8xCzAJBgNVBAYTAkhVMRAwDgYDVQQIEwdI\ndW5nYXJ5MREwDwYDVQQHEwhCdWRhcGVzdDEnMCUGA1UEChMeTmV0TG9jayBIYWxvemF0Yml6\ndG9uc2FnaSBLZnQuMRowGAYDVQQLExFUYW51c2l0dmFueWtpYWRvazE2MDQGA1UEAxMtTmV0\nTG9jayBLb3pqZWd5em9pIChDbGFzcyBBKSBUYW51c2l0dmFueWtpYWRvMIIBIjANBgkqhkiG\n9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvHSMD7tM9DceqQWC2ObhbHDqeLVu0ThEDaiDzl3S1tWB\nxdRL51uUcCbbO51qTGL3cfNk1mE7PetzozfZz+qMkjvN9wfcZnSX9EUi3fRc4L9t875lM+QV\nOr/bmJBVOMTtplVjC7B4BPTjbsE/jvxReB+SnoPC/tmwqcm8WgD/qaiYdPv2LD4VOQ22BFWo\nDpggQrOxJa1+mm9dU7GrDPzr4PN6s6iz/0b2Y6LYOph7tqyF/7AlT3Rj5xMHpQqPBffAZG9+\npyeAlt7ULoZgx2srXnN7F+eRP2QM2EsiNCubMvJIH5+hCoR64sKtlz2O1cH5VqNQ6ca0+pii\n7pXmKgOM3wIDAQABo4ICnzCCApswDgYDVR0PAQH/BAQDAgAGMBIGA1UdEwEB/wQIMAYBAf8C\nAQQwEQYJYIZIAYb4QgEBBAQDAgAHMIICYAYJYIZIAYb4QgENBIICURaCAk1GSUdZRUxFTSEg\nRXplbiB0YW51c2l0dmFueSBhIE5ldExvY2sgS2Z0LiBBbHRhbGFub3MgU3pvbGdhbHRhdGFz\naSBGZWx0ZXRlbGVpYmVuIGxlaXJ0IGVsamFyYXNvayBhbGFwamFuIGtlc3p1bHQuIEEgaGl0\nZWxlc2l0ZXMgZm9seWFtYXRhdCBhIE5ldExvY2sgS2Z0LiB0ZXJtZWtmZWxlbG9zc2VnLWJp\nenRvc2l0YXNhIHZlZGkuIEEgZGlnaXRhbGlzIGFsYWlyYXMgZWxmb2dhZGFzYW5hayBmZWx0\nZXRlbGUgYXogZWxvaXJ0IGVsbGVub3J6ZXNpIGVsamFyYXMgbWVndGV0ZWxlLiBBeiBlbGph\ncmFzIGxlaXJhc2EgbWVndGFsYWxoYXRvIGEgTmV0TG9jayBLZnQuIEludGVybmV0IGhvbmxh\ncGphbiBhIGh0dHBzOi8vd3d3Lm5ldGxvY2submV0L2RvY3MgY2ltZW4gdmFneSBrZXJoZXRv\nIGF6IGVsbGVub3J6ZXNAbmV0bG9jay5uZXQgZS1tYWlsIGNpbWVuLiBJTVBPUlRBTlQhIFRo\nZSBpc3N1YW5jZSBhbmQgdGhlIHVzZSBvZiB0aGlzIGNlcnRpZmljYXRlIGlzIHN1YmplY3Qg\ndG8gdGhlIE5ldExvY2sgQ1BTIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5uZXRsb2NrLm5l\ndC9kb2NzIG9yIGJ5IGUtbWFpbCBhdCBjcHNAbmV0bG9jay5uZXQuMA0GCSqGSIb3DQEBBAUA\nA4IBAQBIJEb3ulZv+sgoA0BO5TE5ayZrU3/b39/zcT0mwBQOxmd7I6gMc90Bu8bKbjc5VdXH\njFYgDigKDtIqpLBJUsY4B/6+CgmM0ZjPytoUMaFP0jn8DxEsQ8Pdq5PHVT5HfBgaANzze9jy\nf1JsIPQLX2lS9O74silg6+NJMSEN1rUQQeJBCWziGppWS3cC9qCbmieH6FUpccKQn0V4GuEV\nZD3QDtigdp+uxdAu6tYPVuxkf1qbFFgBJ34TUMdrKuZoPL9coAob4Q566eKAw+np9v1sEZ7Q\n5SgnK1QyQhSCdeZK8CtmdWOMovsEPoMOmzbwGOQmIMOM8CgHrTwXZoi1/baI\n-----END CERTIFICATE-----\n",
  "NetLock Business (Class B) Root": "-----BEGIN CERTIFICATE-----\nMIIFSzCCBLSgAwIBAgIBaTANBgkqhkiG9w0BAQQFADCBmTELMAkGA1UEBhMCSFUxETAPBgNV\nBAcTCEJ1ZGFwZXN0MScwJQYDVQQKEx5OZXRMb2NrIEhhbG96YXRiaXp0b25zYWdpIEtmdC4x\nGjAYBgNVBAsTEVRhbnVzaXR2YW55a2lhZG9rMTIwMAYDVQQDEylOZXRMb2NrIFV6bGV0aSAo\nQ2xhc3MgQikgVGFudXNpdHZhbnlraWFkbzAeFw05OTAyMjUxNDEwMjJaFw0xOTAyMjAxNDEw\nMjJaMIGZMQswCQYDVQQGEwJIVTERMA8GA1UEBxMIQnVkYXBlc3QxJzAlBgNVBAoTHk5ldExv\nY2sgSGFsb3phdGJpenRvbnNhZ2kgS2Z0LjEaMBgGA1UECxMRVGFudXNpdHZhbnlraWFkb2sx\nMjAwBgNVBAMTKU5ldExvY2sgVXpsZXRpIChDbGFzcyBCKSBUYW51c2l0dmFueWtpYWRvMIGf\nMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx6gTsIKAjwo84YM/HRrPVG/77uZmeBNwcf4xK\ngZjupNTKihe5In+DCnVMm8Bp2GQ5o+2So/1bXHQawEfKOml2mrriRBf8TKPV/riXiK+IA4kf\npPIEPsgHC+b5sy96YhQJRhTKZPWLgLViqNhr1nGTLbO/CVRY7QbrqHvcQ7GhaQIDAQABo4IC\nnzCCApswEgYDVR0TAQH/BAgwBgEB/wIBBDAOBgNVHQ8BAf8EBAMCAAYwEQYJYIZIAYb4QgEB\nBAQDAgAHMIICYAYJYIZIAYb4QgENBIICURaCAk1GSUdZRUxFTSEgRXplbiB0YW51c2l0dmFu\neSBhIE5ldExvY2sgS2Z0LiBBbHRhbGFub3MgU3pvbGdhbHRhdGFzaSBGZWx0ZXRlbGVpYmVu\nIGxlaXJ0IGVsamFyYXNvayBhbGFwamFuIGtlc3p1bHQuIEEgaGl0ZWxlc2l0ZXMgZm9seWFt\nYXRhdCBhIE5ldExvY2sgS2Z0LiB0ZXJtZWtmZWxlbG9zc2VnLWJpenRvc2l0YXNhIHZlZGku\nIEEgZGlnaXRhbGlzIGFsYWlyYXMgZWxmb2dhZGFzYW5hayBmZWx0ZXRlbGUgYXogZWxvaXJ0\nIGVsbGVub3J6ZXNpIGVsamFyYXMgbWVndGV0ZWxlLiBBeiBlbGphcmFzIGxlaXJhc2EgbWVn\ndGFsYWxoYXRvIGEgTmV0TG9jayBLZnQuIEludGVybmV0IGhvbmxhcGphbiBhIGh0dHBzOi8v\nd3d3Lm5ldGxvY2submV0L2RvY3MgY2ltZW4gdmFneSBrZXJoZXRvIGF6IGVsbGVub3J6ZXNA\nbmV0bG9jay5uZXQgZS1tYWlsIGNpbWVuLiBJTVBPUlRBTlQhIFRoZSBpc3N1YW5jZSBhbmQg\ndGhlIHVzZSBvZiB0aGlzIGNlcnRpZmljYXRlIGlzIHN1YmplY3QgdG8gdGhlIE5ldExvY2sg\nQ1BTIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5uZXRsb2NrLm5ldC9kb2NzIG9yIGJ5IGUt\nbWFpbCBhdCBjcHNAbmV0bG9jay5uZXQuMA0GCSqGSIb3DQEBBAUAA4GBAATbrowXr/gOkDFO\nzT4JwG06sPgzTEdM43WIEJessDgVkcYplswhwG08pXTP2IKlOcNl40JwuyKQ433bNXbhoLXa\nn3BukxowOR0w2y7jfLKRstE3Kfq51hdcR0/jHTjrn9V7lagonhVK0dHQKwCXoOKSNitjrFgB\nazMpUIaD8QFI\n-----END CERTIFICATE-----\n",
  "NetLock Express (Class C) Root": "-----BEGIN CERTIFICATE-----\nMIIFTzCCBLigAwIBAgIBaDANBgkqhkiG9w0BAQQFADCBmzELMAkGA1UEBhMCSFUxETAPBgNV\nBAcTCEJ1ZGFwZXN0MScwJQYDVQQKEx5OZXRMb2NrIEhhbG96YXRiaXp0b25zYWdpIEtmdC4x\nGjAYBgNVBAsTEVRhbnVzaXR2YW55a2lhZG9rMTQwMgYDVQQDEytOZXRMb2NrIEV4cHJlc3N6\nIChDbGFzcyBDKSBUYW51c2l0dmFueWtpYWRvMB4XDTk5MDIyNTE0MDgxMVoXDTE5MDIyMDE0\nMDgxMVowgZsxCzAJBgNVBAYTAkhVMREwDwYDVQQHEwhCdWRhcGVzdDEnMCUGA1UEChMeTmV0\nTG9jayBIYWxvemF0Yml6dG9uc2FnaSBLZnQuMRowGAYDVQQLExFUYW51c2l0dmFueWtpYWRv\nazE0MDIGA1UEAxMrTmV0TG9jayBFeHByZXNzeiAoQ2xhc3MgQykgVGFudXNpdHZhbnlraWFk\nbzCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEA6+ywbGGKIyWvYCDj2Z/8kwvbXY2wobNA\nOoLO/XXgeDIDhlqGlZHtU/qdQPzm6N3ZW3oDvV3zOwzDUXmbrVWg6dADEK8KuhRC2VImESLH\n0iDMgqSaqf64gXadarfSNnU+sYYJ9m5tfk63euyucYT2BDMIJTLrdKwWRMbkQJMdf60CAwEA\nAaOCAp8wggKbMBIGA1UdEwEB/wQIMAYBAf8CAQQwDgYDVR0PAQH/BAQDAgAGMBEGCWCGSAGG\n+EIBAQQEAwIABzCCAmAGCWCGSAGG+EIBDQSCAlEWggJNRklHWUVMRU0hIEV6ZW4gdGFudXNp\ndHZhbnkgYSBOZXRMb2NrIEtmdC4gQWx0YWxhbm9zIFN6b2xnYWx0YXRhc2kgRmVsdGV0ZWxl\naWJlbiBsZWlydCBlbGphcmFzb2sgYWxhcGphbiBrZXN6dWx0LiBBIGhpdGVsZXNpdGVzIGZv\nbHlhbWF0YXQgYSBOZXRMb2NrIEtmdC4gdGVybWVrZmVsZWxvc3NlZy1iaXp0b3NpdGFzYSB2\nZWRpLiBBIGRpZ2l0YWxpcyBhbGFpcmFzIGVsZm9nYWRhc2FuYWsgZmVsdGV0ZWxlIGF6IGVs\nb2lydCBlbGxlbm9yemVzaSBlbGphcmFzIG1lZ3RldGVsZS4gQXogZWxqYXJhcyBsZWlyYXNh\nIG1lZ3RhbGFsaGF0byBhIE5ldExvY2sgS2Z0LiBJbnRlcm5ldCBob25sYXBqYW4gYSBodHRw\nczovL3d3dy5uZXRsb2NrLm5ldC9kb2NzIGNpbWVuIHZhZ3kga2VyaGV0byBheiBlbGxlbm9y\nemVzQG5ldGxvY2submV0IGUtbWFpbCBjaW1lbi4gSU1QT1JUQU5UISBUaGUgaXNzdWFuY2Ug\nYW5kIHRoZSB1c2Ugb2YgdGhpcyBjZXJ0aWZpY2F0ZSBpcyBzdWJqZWN0IHRvIHRoZSBOZXRM\nb2NrIENQUyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cubmV0bG9jay5uZXQvZG9jcyBvciBi\neSBlLW1haWwgYXQgY3BzQG5ldGxvY2submV0LjANBgkqhkiG9w0BAQQFAAOBgQAQrX/XDDKA\nCtiG8XmYta3UzbM2xJZIwVzNmtkFLp++UOv0JhQQLdRmF/iewSf98e3ke0ugbLWrmldwpu2g\npO0u9f38vf5NNwgMvOOWgyL1SRt/Syu0VMGAfJlOHdCM7tCs5ZL6dVb+ZKATj7i4Fp1hBWeA\nyNDYpQcCNJgEjTME1A==\n-----END CERTIFICATE-----\n",
  "XRamp Global CA Root": "-----BEGIN CERTIFICATE-----\nMIIEMDCCAxigAwIBAgIQUJRs7Bjq1ZxN1ZfvdY+grTANBgkqhkiG9w0BAQUFADCBgjELMAkG\nA1UEBhMCVVMxHjAcBgNVBAsTFXd3dy54cmFtcHNlY3VyaXR5LmNvbTEkMCIGA1UEChMbWFJh\nbXAgU2VjdXJpdHkgU2VydmljZXMgSW5jMS0wKwYDVQQDEyRYUmFtcCBHbG9iYWwgQ2VydGlm\naWNhdGlvbiBBdXRob3JpdHkwHhcNMDQxMTAxMTcxNDA0WhcNMzUwMTAxMDUzNzE5WjCBgjEL\nMAkGA1UEBhMCVVMxHjAcBgNVBAsTFXd3dy54cmFtcHNlY3VyaXR5LmNvbTEkMCIGA1UEChMb\nWFJhbXAgU2VjdXJpdHkgU2VydmljZXMgSW5jMS0wKwYDVQQDEyRYUmFtcCBHbG9iYWwgQ2Vy\ndGlmaWNhdGlvbiBBdXRob3JpdHkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCY\nJB69FbS638eMpSe2OAtp87ZOqCwuIR1cRN8hXX4jdP5efrRKt6atH67gBhbim1vZZ3RrXYCP\nKZ2GG9mcDZhtdhAoWORlsH9KmHmf4MMxfoArtYzAQDsRhtDLooY2YKTVMIJt2W7QDxIEM5df\nT2Fa8OT5kavnHTu86M/0ay00fOJIYRyO82FEzG+gSqmUsE3a56k0enI4qEHMPJQRfevIpoy3\nhsvKMzvZPTeL+3o+hiznc9cKV6xkmxnr9A8ECIqsAxcZZPRaJSKNNCyy9mgdEm3Tih4U2sSP\npuIjhdV6Db1q4Ons7Be7QhtnqiXtRYMh/MHJfNViPvryxS3T/dRlAgMBAAGjgZ8wgZwwEwYJ\nKwYBBAGCNxQCBAYeBABDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0O\nBBYEFMZPoj0GY4QJnM5i5ASsjVy16bYbMDYGA1UdHwQvMC0wK6ApoCeGJWh0dHA6Ly9jcmwu\neHJhbXBzZWN1cml0eS5jb20vWEdDQS5jcmwwEAYJKwYBBAGCNxUBBAMCAQEwDQYJKoZIhvcN\nAQEFBQADggEBAJEVOQMBG2f7Shz5CmBbodpNl2L5JFMn14JkTpAuw0kbK5rc/Kh4ZzXxHfAR\nvbdI4xD2Dd8/0sm2qlWkSLoC295ZLhVbO50WfUfXN+pfTXYSNrsf16GBBEYgoyxtqZ4Bfj8p\nzgCT3/3JknOJiWSe5yvkHJEs0rnOfc5vMZnT5r7SHpDwCRR5XCOrTdLaIR9NmXmd4c8nnxCb\nHIgNsIpkQTG4DmyQJKSbXHGPurt+HBvbaoAPIbzp26a3QPSyi6mx5O+aGtA9aZnuqCij4Tyz\n8LIRnM98QObd50N9otg6tamN8jSZxNQQ4Qb9CYQQO+7ETPTsJ3xCwnR8gooJybQDJbw=\n-----END CERTIFICATE-----\n",
  "Go Daddy Class 2 CA": "-----BEGIN CERTIFICATE-----\nMIIEADCCAuigAwIBAgIBADANBgkqhkiG9w0BAQUFADBjMQswCQYDVQQGEwJVUzEhMB8GA1UE\nChMYVGhlIEdvIERhZGR5IEdyb3VwLCBJbmMuMTEwLwYDVQQLEyhHbyBEYWRkeSBDbGFzcyAy\nIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MB4XDTA0MDYyOTE3MDYyMFoXDTM0MDYyOTE3MDYy\nMFowYzELMAkGA1UEBhMCVVMxITAfBgNVBAoTGFRoZSBHbyBEYWRkeSBHcm91cCwgSW5jLjEx\nMC8GA1UECxMoR28gRGFkZHkgQ2xhc3MgMiBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTCCASAw\nDQYJKoZIhvcNAQEBBQADggENADCCAQgCggEBAN6d1+pXGEmhW+vXX0iG6r7d/+TvZxz0ZWiz\nV3GgXne77ZtJ6XCAPVYYYwhv2vLM0D9/AlQiVBDYsoHUwHU9S3/Hd8M+eKsaA7Ugay9qK7HF\niH7Eux6wwdhFJ2+qN1j3hybX2C32qRe3H3I2TqYXP2WYktsqbl2i/ojgC95/5Y0V4evLOtXi\nEqITLdiOr18SPaAIBQi2XKVlOARFmR6jYGB0xUGlcmIbYsUfb18aQr4CUWWoriMYavx4A6lN\nf4DD+qta/KFApMoZFv6yyO9ecw3ud72a9nmYvLEHZ6IVDd2gWMZEewo+YihfukEHU1jPEX44\ndMX4/7VpkI+EdOqXG68CAQOjgcAwgb0wHQYDVR0OBBYEFNLEsNKR1EwRcbNhyz2h/t2oatTj\nMIGNBgNVHSMEgYUwgYKAFNLEsNKR1EwRcbNhyz2h/t2oatTjoWekZTBjMQswCQYDVQQGEwJV\nUzEhMB8GA1UEChMYVGhlIEdvIERhZGR5IEdyb3VwLCBJbmMuMTEwLwYDVQQLEyhHbyBEYWRk\neSBDbGFzcyAyIENlcnRpZmljYXRpb24gQXV0aG9yaXR5ggEAMAwGA1UdEwQFMAMBAf8wDQYJ\nKoZIhvcNAQEFBQADggEBADJL87LKPpH8EsahB4yOd6AzBhRckB4Y9wimPQoZ+YeAEW5p5JYX\nMP80kWNyOO7MHAGjHZQopDH2esRU1/blMVgDoszOYtuURXO1v0XJJLXVggKtI3lpjbi2Tc7P\nTMozI+gciKqdi0FuFskg5YmezTvacPd+mSYgFFQlq25zheabIZ0KbIIOqPjCDPoQHmyW74cN\nxA9hi63ugyuV+I6ShHI56yDqg+2DzZduCLzrTia2cyvk0/ZM/iZx4mERdEr/VxqHD3VILs9R\naRegAhJhldXRQLIQTO7ErBBDpqWeCtWVYpoNz4iCxTIM5CufReYNnyicsbkqWletNw+vHX/b\nvZ8=\n-----END CERTIFICATE-----\n",
  "Starfield Class 2 CA": "-----BEGIN CERTIFICATE-----\nMIIEDzCCAvegAwIBAgIBADANBgkqhkiG9w0BAQUFADBoMQswCQYDVQQGEwJVUzElMCMGA1UE\nChMcU3RhcmZpZWxkIFRlY2hub2xvZ2llcywgSW5jLjEyMDAGA1UECxMpU3RhcmZpZWxkIENs\nYXNzIDIgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMDQwNjI5MTczOTE2WhcNMzQwNjI5\nMTczOTE2WjBoMQswCQYDVQQGEwJVUzElMCMGA1UEChMcU3RhcmZpZWxkIFRlY2hub2xvZ2ll\ncywgSW5jLjEyMDAGA1UECxMpU3RhcmZpZWxkIENsYXNzIDIgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkwggEgMA0GCSqGSIb3DQEBAQUAA4IBDQAwggEIAoIBAQC3Msj+6XGmBIWtDBFk385N\n78gDGIc/oav7PKaf8MOh2tTYbitTkPskpD6E8J7oX+zlJ0T1KKY/e97gKvDIr1MvnsoFAZMe\nj2YcOadN+lq2cwQlZut3f+dZxkqZJRRU6ybH838Z1TBwj6+wRir/resp7defqgSHo9T5iaU0\nX9tDkYI22WY8sbi5gv2cOj4QyDvvBmVmepsZGD3/cVE8MC5fvj13c7JdBmzDI1aaK4Umkhyn\nArPkPw2vCHmCuDY96pzTNbO8acr1zJ3o/WSNF4Azbl5KXZnJHoe0nRrA1W4TNSNe35tfPe/W\n93bC6j67eA0cQmdrBNj41tpvi/JEoAGrAgEDo4HFMIHCMB0GA1UdDgQWBBS/X7fRzt0fhvRb\nVazc1xDCDqmI5zCBkgYDVR0jBIGKMIGHgBS/X7fRzt0fhvRbVazc1xDCDqmI56FspGowaDEL\nMAkGA1UEBhMCVVMxJTAjBgNVBAoTHFN0YXJmaWVsZCBUZWNobm9sb2dpZXMsIEluYy4xMjAw\nBgNVBAsTKVN0YXJmaWVsZCBDbGFzcyAyIENlcnRpZmljYXRpb24gQXV0aG9yaXR5ggEAMAwG\nA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAAWdP4id0ckaVaGsafPzWdqbAYcaT1ep\noXkJKtv3L7IezMdeatiDh6GX70k1PncGQVhiv45YuApnP+yz3SFmH8lU+nLMPUxA2IGvd56D\neruix/U0F47ZEUD0/CwqTRV/p2JdLiXTAAsgGh1o+Re49L2L7ShZ3U0WixeDyLJlxy16paq8\nU4Zt3VekyvggQQto8PT7dL5WXXp59fkdheMtlb71cZBDzI0fmgAKhynpVSJYACPq4xJDKVtH\nCN2MQWplBqjlIapBtJUhlbl90TSrE9atvNziPTnNvT51cKEYWQPJIrSPnNVeKtelttQKbfi3\nQBFGmh95DmK/D5fs4C8fF5Q=\n-----END CERTIFICATE-----\n",
  "StartCom Certification Authority": "-----BEGIN CERTIFICATE-----\nMIIHhzCCBW+gAwIBAgIBLTANBgkqhkiG9w0BAQsFADB9MQswCQYDVQQGEwJJTDEWMBQGA1UE\nChMNU3RhcnRDb20gTHRkLjErMCkGA1UECxMiU2VjdXJlIERpZ2l0YWwgQ2VydGlmaWNhdGUg\nU2lnbmluZzEpMCcGA1UEAxMgU3RhcnRDb20gQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcN\nMDYwOTE3MTk0NjM3WhcNMzYwOTE3MTk0NjM2WjB9MQswCQYDVQQGEwJJTDEWMBQGA1UEChMN\nU3RhcnRDb20gTHRkLjErMCkGA1UECxMiU2VjdXJlIERpZ2l0YWwgQ2VydGlmaWNhdGUgU2ln\nbmluZzEpMCcGA1UEAxMgU3RhcnRDb20gQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwggIiMA0G\nCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDBiNsJvGxGfHiflXu1M5DycmLWwTYgIiRezul3\n8kMKogZkpMyONvg45iPwbm2xPN1yo4UcodM9tDMr0y+v/uqwQVlntsQGfQqedIXWeUyAN3rf\nOQVSWff0G0ZDpNKFhdLDcfN1YjS6LIp/Ho/u7TTQEceWzVI9ujPW3U3eCztKS5/CJi/6tRYc\ncjV3yjxd5srhJosaNnZcAdt0FCX+7bWgiA/deMotHweXMAEtcnn6RtYTKqi5pquDSR3l8u/d\n5AGOGAqPY1MWhWKpDhk6zLVmpsJrdAfkK+F2PrRt2PZE4XNiHzvEvqBTViVsUQn3qqvKv3b9\nbZvzndu/PWa8DFaqr5hIlTpL36dYUNk4dalb6kMMAv+Z6+hsTXBbKWWc3apdzK8BMewM69KN\n6Oqce+Zu9ydmDBpI125C4z/eIT574Q1w+2OqqGwaVLRcJXrJosmLFqa7LH4XXgVNWG4SHQHu\nEhANxjJ/GP/89PrNbpHoNkm+Gkhpi8KWTRoSsmkXwQqQ1vp5Iki/untp+HDH+no32NgN0nZP\nV/+Qt+OR0t3vwmC3Zzrd/qqc8NSLf3Iizsafl7b4r4qgEKjZ+xjGtrVcUjyJthkqcwEKDwOz\nEmDyei+B26Nu/yYwl/WL3YlXtq09s68rxbd2AvCl1iuahhQqcvbjM4xdCUsT37uMdBNSSwID\nAQABo4ICEDCCAgwwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYE\nFE4L7xqkQFulF2mHMMo0aEPQQa7yMB8GA1UdIwQYMBaAFE4L7xqkQFulF2mHMMo0aEPQQa7y\nMIIBWgYDVR0gBIIBUTCCAU0wggFJBgsrBgEEAYG1NwEBATCCATgwLgYIKwYBBQUHAgEWImh0\ndHA6Ly93d3cuc3RhcnRzc2wuY29tL3BvbGljeS5wZGYwNAYIKwYBBQUHAgEWKGh0dHA6Ly93\nd3cuc3RhcnRzc2wuY29tL2ludGVybWVkaWF0ZS5wZGYwgc8GCCsGAQUFBwICMIHCMCcWIFN0\nYXJ0IENvbW1lcmNpYWwgKFN0YXJ0Q29tKSBMdGQuMAMCAQEagZZMaW1pdGVkIExpYWJpbGl0\neSwgcmVhZCB0aGUgc2VjdGlvbiAqTGVnYWwgTGltaXRhdGlvbnMqIG9mIHRoZSBTdGFydENv\nbSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBQb2xpY3kgYXZhaWxhYmxlIGF0IGh0dHA6Ly93\nd3cuc3RhcnRzc2wuY29tL3BvbGljeS5wZGYwEQYJYIZIAYb4QgEBBAQDAgAHMDgGCWCGSAGG\n+EIBDQQrFilTdGFydENvbSBGcmVlIFNTTCBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTANBgkq\nhkiG9w0BAQsFAAOCAgEAjo/n3JR5fPGFf59Jb2vKXfuM/gTFwWLRfUKKvFO3lANmMD+x5wqn\nUCBVJX92ehQN6wQOQOY+2IirByeDqXWmN3PH/UvSTa0XQMhGvjt/UfzDtgUx3M2FIk5xt/Jx\nXrAaxrqTi3iSSoX4eA+D/i+tLPfkpLst0OcNOrg+zvZ49q5HJMqjNTbOx8aHmNrs++myzieb\niMMEofYLWWivydsQD032ZGNcpRJvkrKTlMeIFw6Ttn5ii5B/q06f/ON1FE8qMt9bDeD1e5MN\nq6HPh+GlBEXoPBKlCcWw0bdT82AUuoVpaiF8H3VhFyAXe2w7QSlc4axa0c2Mm+tgHRns9+Ww\n2vl5GKVFP0lDV9LdJNUso/2RjSe15esUBppMeyG7Oq0wBhjA2MFrLH9ZXF2RsXAiV+uKa0hK\n1Q8p7MZAwC+ITGgBF3f0JBlPvfrhsiAhS90a2Cl9qrjeVOwhVYBsHvUwyKMQ5bLmKhQxw4Ut\njJixhlpPiVktucf3HMiKf8CdBUrmQk9io20ppB+Fq9vlgcitKj1MXVuEJnHEhV5xJMqlG2zY\nYdMa4FTbzrqpMrUi9nNBCV24F10OD5mQ1kfabwo6YigUZ4LZ8dCAWZvLMdibD4x3TrVoivJs\n9iQOLWxwxXPR3hTQcY+203sC9uO41Alua551hDnmfyWl8kgAwKQB2j8=\n-----END CERTIFICATE-----\n",
  "Taiwan GRCA": "-----BEGIN CERTIFICATE-----\nMIIFcjCCA1qgAwIBAgIQH51ZWtcvwgZEpYAIaeNe9jANBgkqhkiG9w0BAQUFADA/MQswCQYD\nVQQGEwJUVzEwMC4GA1UECgwnR292ZXJubWVudCBSb290IENlcnRpZmljYXRpb24gQXV0aG9y\naXR5MB4XDTAyMTIwNTEzMjMzM1oXDTMyMTIwNTEzMjMzM1owPzELMAkGA1UEBhMCVFcxMDAu\nBgNVBAoMJ0dvdmVybm1lbnQgUm9vdCBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTCCAiIwDQYJ\nKoZIhvcNAQEBBQADggIPADCCAgoCggIBAJoluOzMonWoe/fOW1mKydGGEghU7Jzy50b2iPN8\n6aXfTEc2pBsBHH8eV4qNw8XRIePaJD9IK/ufLqGU5ywck9G/GwGHU5nOp/UKIXZ3/6m3xnOU\nT0b3EEk3+qhZSV1qgQdW8or5BtD3cCJNtLdBuTK4sfCxw5w/cP1T3YGq2GN49thTbqGsaoQk\nclSGxtKyyhwOeYHWtXBiCAEuTk8O1RGvqa/lmr/czIdtJuTJV6L7lvnM4T9TjGxMfptTCAts\nF/tnyMKtsc2AtJfcdgEWFelq16TheEfOhtX7MfP6Mb40qij7cEwdScevLJ1tZqa2jWR+tSBq\nnTuBto9AAGdLiYa4zGX+FVPpBMHWXx1E1wovJ5pGfaENda1UhhXcSTvxls4Pm6Dso3pdvtUq\ndULle96ltqqvKKyskKw4t9VoNSZ63Pc78/1Fm9G7Q3hub/FCVGqY8A2tl+lSXunVanLeavcb\nYBT0peS2cWeqH+riTcFCQP5nRhc4L0c/cZyu5SHKYS1tB6iEfC3uUSXxY5Ce/eFXiGvviiNt\nsea9P63RPZYLhY3Naye7twWb7LuRqQoHEgKXTiCQ8P8NHuJBO9NAOueNXdpm5AKwB1KYXA6O\nM5zCppX7VRluTI6uSw+9wThNXo+EHWbNxWCWtFJaBYmOlXqYwZE8lSOyDvR5tMl8wUohAgMB\nAAGjajBoMB0GA1UdDgQWBBTMzO/MKWCkO7GStjz6MmKPrCUVOzAMBgNVHRMEBTADAQH/MDkG\nBGcqBwAEMTAvMC0CAQAwCQYFKw4DAhoFADAHBgVnKgMAAAQUA5vwIhP/lSg209yewDL7MTqK\nUWUwDQYJKoZIhvcNAQEFBQADggIBAECASvomyc5eMN1PhnR2WPWus4MzeKR6dBcZTulStbng\nCnRiqmjKeKBMmo4sIy7VahIkv9Ro04rQ2JyftB8M3jh+Vzj8jeJPXgyfqzvS/3WXy6TjZwj/\n5cAWtUgBfen5Cv8b5Wppv3ghqMKnI6mGq3ZW6A4M9hPdKmaKZEk9GhiHkASfQlK3T8v+R0F2\nNe//AHY2RTKbxkaFXeIksB7jSJaYV0eUVXoPQbFEJPPB/hprv4j9wabak2BegUqZIJxIZhm1\nAHlUD7gsL0u8qV1bYH+Mh6XgUmMqvtg7hUAV/h62ZT/FS9p+tXo1KaMuephgIqP0fSdOLeq0\ndDzpD6QzDxARvBMB1uUO07+1EqLhRSPAzAhuYbeJq4PjJB7mXQfnHyA+z2fI56wwbSdLaG5L\nKlwCCDTb+HbkZ6MmnD+iMsJKxYEYMRBWqoTvLQr/uB930r+lWKBi5NdLkXWNiYCYfm3LU05e\nr/ayl4WXudpVBrkk7tfGOB5jGxI7leFYrPLfhNVfmS8NVVvmONsuP3LpSIXLuykTjx44Vbnz\nssQwmSNOXfJIoRIM3BKQCZBUkQM8R+XVyWXgt0t97EfTsws+rZ7QdAAO671RrcDeLMDDav7v\n3Aun+kbfYNucpllQdSNpc5Oy+fwC00fmcc4QAu4njIT/rEUNE1yDMuAlpYYsfPQS\n-----END CERTIFICATE-----\n",
  "Firmaprofesional Root CA": "-----BEGIN CERTIFICATE-----\nMIIEVzCCAz+gAwIBAgIBATANBgkqhkiG9w0BAQUFADCBnTELMAkGA1UEBhMCRVMxIjAgBgNV\nBAcTGUMvIE11bnRhbmVyIDI0NCBCYXJjZWxvbmExQjBABgNVBAMTOUF1dG9yaWRhZCBkZSBD\nZXJ0aWZpY2FjaW9uIEZpcm1hcHJvZmVzaW9uYWwgQ0lGIEE2MjYzNDA2ODEmMCQGCSqGSIb3\nDQEJARYXY2FAZmlybWFwcm9mZXNpb25hbC5jb20wHhcNMDExMDI0MjIwMDAwWhcNMTMxMDI0\nMjIwMDAwWjCBnTELMAkGA1UEBhMCRVMxIjAgBgNVBAcTGUMvIE11bnRhbmVyIDI0NCBCYXJj\nZWxvbmExQjBABgNVBAMTOUF1dG9yaWRhZCBkZSBDZXJ0aWZpY2FjaW9uIEZpcm1hcHJvZmVz\naW9uYWwgQ0lGIEE2MjYzNDA2ODEmMCQGCSqGSIb3DQEJARYXY2FAZmlybWFwcm9mZXNpb25h\nbC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDnIwNvbyOlXnjOlSztlB5u\nCp4Bx+ow0Syd3Tfom5h5VtP8c9/Qit5Vj1H5WuretXDE7aTt/6MNbg9kUDGvASdYrv5sp0ov\nFy3Tc9UTHI9ZpTQsHVQERc1ouKDAA6XPhUJHlShbz++AbOCQl4oBPB3zhxAwJkh91/zpnZFx\n/0GaqUC1N5wpIE8fUuOgfRNtVLcK3ulqTgesrBlf3H5idPayBQC6haD9HThuy1q7hryUZzM1\ngywfI834yJFxzJeL764P3CkDG8A563DtwW4O2GcLiam8NeTvtjS0pbbELaW+0MOUJEjb35bT\nALVmGotmBQ/dPz/LP6pemkr4tErvlTcbAgMBAAGjgZ8wgZwwKgYDVR0RBCMwIYYfaHR0cDov\nL3d3dy5maXJtYXByb2Zlc2lvbmFsLmNvbTASBgNVHRMBAf8ECDAGAQH/AgEBMCsGA1UdEAQk\nMCKADzIwMDExMDI0MjIwMDAwWoEPMjAxMzEwMjQyMjAwMDBaMA4GA1UdDwEB/wQEAwIBBjAd\nBgNVHQ4EFgQUMwugZtHq2s7eYpMEKFK1FH84aLcwDQYJKoZIhvcNAQEFBQADggEBAEdz/o0n\nVPD11HecJ3lXV7cVVuzH2Fi3AQL0M+2TUIiefEaxvT8Ub/GzR0iLjJcG1+p+o1wqu00vR+L4\nOQbJnC4xGgN49Lw4xiKLMzHwFgQEffl25EvXwOaD7FnMP97/T2u3Z36mhoEyIwOdyPdfwUpg\npZKpsaSgYMN4h7Mi8yrrW6ntBas3D7Hi05V2Y1Z0jFhyGzflZKG+TQyTmAyX9odtsz/ny4Cm\n7YjHX1BiAuiZdBbQ5rQ58SfLyEDW44YQqSMSkuBpQWOnryULwMWSyx6Yo1q6xTMPoJcB3X/g\ne9YGVM+h4k0460tQtcsm9MracEpqoeJ5quGnM/b9Sh/22WA=\n-----END CERTIFICATE-----\n",
  "Wells Fargo Root CA": "-----BEGIN CERTIFICATE-----\nMIID5TCCAs2gAwIBAgIEOeSXnjANBgkqhkiG9w0BAQUFADCBgjELMAkGA1UEBhMCVVMxFDAS\nBgNVBAoTC1dlbGxzIEZhcmdvMSwwKgYDVQQLEyNXZWxscyBGYXJnbyBDZXJ0aWZpY2F0aW9u\nIEF1dGhvcml0eTEvMC0GA1UEAxMmV2VsbHMgRmFyZ28gUm9vdCBDZXJ0aWZpY2F0ZSBBdXRo\nb3JpdHkwHhcNMDAxMDExMTY0MTI4WhcNMjEwMTE0MTY0MTI4WjCBgjELMAkGA1UEBhMCVVMx\nFDASBgNVBAoTC1dlbGxzIEZhcmdvMSwwKgYDVQQLEyNXZWxscyBGYXJnbyBDZXJ0aWZpY2F0\naW9uIEF1dGhvcml0eTEvMC0GA1UEAxMmV2VsbHMgRmFyZ28gUm9vdCBDZXJ0aWZpY2F0ZSBB\ndXRob3JpdHkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDVqDM7Jvk0/82bfuUE\nR84A4n135zHCLielTWi5MbqNQ1mXx3Oqfz1cQJ4F5aHiidlMuD+b+Qy0yGIZLEWukR5zcUHE\nSxP9cMIlrCL1dQu3U+SlK93OvRw6esP3E48mVJwWa2uv+9iWsWCaSOAlIiR5NM4OJgALTqv9\ni86C1y8IcGjBqAr5dE8Hq6T54oN+J3N0Prj5OEL8pahbSCOz6+MlsoCultQKnMJ4msZoGK43\nYjdeUXWoWGPAUe5AeH6orxqg4bB4nVCMe+ez/I4jsNtlAHCEAQgAFG5Uhpq6zPk3EPbg3oQt\nnaSFN9OH4xXQwReQfhkhahKpdv0SAulPIV4XAgMBAAGjYTBfMA8GA1UdEwEB/wQFMAMBAf8w\nTAYDVR0gBEUwQzBBBgtghkgBhvt7hwcBCzAyMDAGCCsGAQUFBwIBFiRodHRwOi8vd3d3Lndl\nbGxzZmFyZ28uY29tL2NlcnRwb2xpY3kwDQYJKoZIhvcNAQEFBQADggEBANIn3ZwKdyu7IvIC\ntUpKkfnRLb7kuxpo7w6kAOnu5+/u9vnldKTC2FJYxHT7zmu1Oyl5GFrvm+0fazbuSCUlFLZW\nohDo7qd/0D+j0MNdJu4HzMPBJCGHHt8qElNvQRbn7a6U+oxy+hNH8Dx+rn0ROhPs7fpvcmR7\nnX1/Jv16+yWt6j4pf0zjAFcysLPp7VMX2YuyFA4w6OXVE8Zkr8QA1dhYJPz1j+zxx32l2w8n\n0cbyQIjmH/ZhqPRCyLk306m+LFZ4wnKbWV01QIroTmMatukgalHizqSQ33ZwmVxwQ023tqcZ\nZE6St8WRPH9IFmV7Fv3L/PvZ1dZPIWU7Sn9Ho/s=\n-----END CERTIFICATE-----\n",
  "Swisscom Root CA 1": "-----BEGIN CERTIFICATE-----\nMIIF2TCCA8GgAwIBAgIQXAuFXAvnWUHfV8w/f52oNjANBgkqhkiG9w0BAQUFADBkMQswCQYD\nVQQGEwJjaDERMA8GA1UEChMIU3dpc3Njb20xJTAjBgNVBAsTHERpZ2l0YWwgQ2VydGlmaWNh\ndGUgU2VydmljZXMxGzAZBgNVBAMTElN3aXNzY29tIFJvb3QgQ0EgMTAeFw0wNTA4MTgxMjA2\nMjBaFw0yNTA4MTgyMjA2MjBaMGQxCzAJBgNVBAYTAmNoMREwDwYDVQQKEwhTd2lzc2NvbTEl\nMCMGA1UECxMcRGlnaXRhbCBDZXJ0aWZpY2F0ZSBTZXJ2aWNlczEbMBkGA1UEAxMSU3dpc3Nj\nb20gUm9vdCBDQSAxMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA0LmwqAzZuz8h\n+BvVM5OAFmUgdbI9m2BtRsiMMW8Xw/qabFbtPMWRV8PNq5ZJkCoZSx6jbVfd8StiKHVFXqrW\nW/oLJdihFvkcxC7mlSpnzNApbjyFNDhhSbEAn9Y6cV9Nbc5fuankiX9qUvrKm/LcqfmdmUc/\nTilftKaNXXsLmREDA/7n29uj/x2lzZAeAR81sH8A25Bvxn570e56eqeqDFdvpG3FEzuwpdnt\nMhy0XmeLVNxzh+XTF3xmUHJd1BpYwdnP2IkCb6dJtDZd0KTeByy2dbcokdaXvij1mB7qWybJ\nvbCXc9qukSbraMH5ORXWZ0sKbU/Lz7DkQnGMU3nn7uHbHaBuHYwadzVcFh4rUx80i9Fs/PJn\nB3r1re3WmquhsUvhzDdf/X/NTa64H5xD+SpYVUNFvJbNcA78yeNmuk6NO4HLFWR7uZToXTNS\nhXEuT46iBhFRyePLoW4xCGQMwtI89Tbo19AOeCMgkckkKmUpWyL3Ic6DXqTz3kvTaI9GdVyD\nCW4pa8RwjPWd1yAv/0bSKzjCL3UcPX7ape8eYIVpQtPM+GP+HkM5haa2Y0EQs3MevNP6yn0W\nR+Kn1dCjigoIlmJWbjTb2QK5MHXjBNLnj8KwEUAKrNVxAmKLMb7dxiNYMUJDLXT5xp6mig/p\n/r+D5kNXJLrvRjSq1xIBOO0CAwEAAaOBhjCBgzAOBgNVHQ8BAf8EBAMCAYYwHQYDVR0hBBYw\nFDASBgdghXQBUwABBgdghXQBUwABMBIGA1UdEwEB/wQIMAYBAf8CAQcwHwYDVR0jBBgwFoAU\nAyUv3m+CATpcLNwroWm1Z9SM0/0wHQYDVR0OBBYEFAMlL95vggE6XCzcK6FptWfUjNP9MA0G\nCSqGSIb3DQEBBQUAA4ICAQA1EMvspgQNDQ/NwNurqPKIlwzfky9NfEBWMXrrpA9gzXrzvsMn\njgM+pN0S734edAY8PzHyHHuRMSG08NBsl9Tpl7IkVh5WwzW9iAUPWxAaZOHHgjD5Mq2eUCzn\neAXQMbFamIp1TpBcahQq4FJHgmDmHtqBsfsUC1rxn9KVuj7QG9YVHaO+htXbD8BJZLsuUBlL\n0iT43R4HVtA4oJVwIHaM190e3p9xxCPvgxNcoyQVTSlAPGrEqdi3pkSlDfTgnXceQHAm/NrZ\nNuR55LU/vJtlvrsRls/bxig5OgjOR1tTWsWZ/l2p3e9M1MalrQLmjAcSHm8D0W+go/MpvRLH\nUKKwf4ipmXeascClOS5cfGniLLDqN2qk4Vrh9VDlg++luyqI54zb/W1elxmofmZ1a3Hqv7HH\nb6D0jqTsNFFbjCYDcKF31QESVwA12yPeDooomf2xEG9L/zgtYE4snOtnta1J7ksfrK/7DZBa\nZmBwXarNeNQk7shBoJMBkpxqnvy5JMWzFYJ+vq6VK+uxwNrjAWALXmmshFZhvnEX/h0TD/7G\nh0Xp/jKgGg0TpJRVcaUWi7rKibCyx/yP2FS1k2Kdzs9Z+z0YzirLNRWCXf9UIltxUvu3yf5g\nmwBBZPCqKuy2QkPOiWaByIufOVQDJdMWNY6E0F/6MBr1mmz0DlP5OlvRHA==\n-----END CERTIFICATE-----\n",
  "DigiCert Assured ID Root CA": "-----BEGIN CERTIFICATE-----\nMIIDtzCCAp+gAwIBAgIQDOfg5RfYRv6P5WD8G/AwOTANBgkqhkiG9w0BAQUFADBlMQswCQYD\nVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQu\nY29tMSQwIgYDVQQDExtEaWdpQ2VydCBBc3N1cmVkIElEIFJvb3QgQ0EwHhcNMDYxMTEwMDAw\nMDAwWhcNMzExMTEwMDAwMDAwWjBlMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQg\nSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQuY29tMSQwIgYDVQQDExtEaWdpQ2VydCBBc3N1\ncmVkIElEIFJvb3QgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCtDhXO5EOA\nXLGH87dg+XESpa7cJpSIqvTO9SA5KFhgDPiA2qkVlTJhPLWxKISKityfCgyDF3qPkKyK53lT\nXDGEKvYPmDI2dsze3Tyoou9q+yHyUmHfnyDXH+Kx2f4YZNISW1/5WBg1vEfNoTb5a3/UsDg+\nwRvDjDPZ2C8Y/igPs6eD1sNuRMBhNZYW/lmci3Zt1/GiSw0r/wty2p5g0I6QNcZ4VYcgoc/l\nbQrISXwxmDNsIumH0DJaoroTghHtORedmTpyoeb6pNnVFzF1roV9Iq4/AUaG9ih5yLHa5FcX\nxH4cDrC0kqZWs72yl+2qp/C3xag/lRbQ/6GW6whfGHdPAgMBAAGjYzBhMA4GA1UdDwEB/wQE\nAwIBhjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRF66Kv9JLLgjEtUYunpyGd823IDzAf\nBgNVHSMEGDAWgBRF66Kv9JLLgjEtUYunpyGd823IDzANBgkqhkiG9w0BAQUFAAOCAQEAog68\n3+Lt8ONyc3pklL/3cmbYMuRCdWKuh+vy1dneVrOfzM4UKLkNl2BcEkxY5NM9g0lFWJc1aRqo\nR+pWxnmrEthngYTffwk8lOa4JiwgvT2zKIn3X/8i4peEH+ll74fg38FnSbNd67IJKusm7Xi+\nfT8r87cmNW1fiQG2SVufAQWbqz0lwcy2f8Lxb4bG+mRo64EtlOtCt/qMHt1i8b5QZ7dsvfPx\nH2sMNgcWfzd8qVttevESRmCD1ycEvkvOl77DZypoEd+A5wwzZr8TDRRu838fYxAe+o0bJW1s\nj6W3YQGx0qMmoRBxna3iw/nDmVG3KwcIzi7mULKn+gpFL6Lw8g==\n-----END CERTIFICATE-----\n",
  "DigiCert Global Root CA": "-----BEGIN CERTIFICATE-----\nMIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBhMQswCQYD\nVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQu\nY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBDQTAeFw0wNjExMTAwMDAwMDBa\nFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMx\nGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5jb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBS\nb290IENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKP\nC3eQyaKl7hLOllsBCSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscF\ns3YnFo97nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt\n43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7PT19sdl6g\nSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4gdW7jVg/tRvoSSii\ncNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAOBgNVHQ8BAf8EBAMCAYYwDwYD\nVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbRTLtm8KPiGxvDl7I90VUwHwYDVR0jBBgw\nFoAUA95QNVbRTLtm8KPiGxvDl7I90VUwDQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1E\nnE9SsPTfrgT1eXkIoyQY/EsrhMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDi\nqw8cvpOp/2PV5Adg06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBA\nI+0tKIJFPnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls\nYSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQkCAUw7C29\nC79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=\n-----END CERTIFICATE-----\n",
  "DigiCert High Assurance EV Root CA": "-----BEGIN CERTIFICATE-----\nMIIDxTCCAq2gAwIBAgIQAqxcJmoLQJuPC3nyrkYldzANBgkqhkiG9w0BAQUFADBsMQswCQYD\nVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQu\nY29tMSswKQYDVQQDEyJEaWdpQ2VydCBIaWdoIEFzc3VyYW5jZSBFViBSb290IENBMB4XDTA2\nMTExMDAwMDAwMFoXDTMxMTExMDAwMDAwMFowbDELMAkGA1UEBhMCVVMxFTATBgNVBAoTDERp\nZ2lDZXJ0IEluYzEZMBcGA1UECxMQd3d3LmRpZ2ljZXJ0LmNvbTErMCkGA1UEAxMiRGlnaUNl\ncnQgSGlnaCBBc3N1cmFuY2UgRVYgUm9vdCBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBAMbM5XPm+9S75S0tMqbf5YE/yc0lSbZxKsPVlDRnogocsF9ppkCxxLeyj9CYpKlB\nWTrT3JTWPNt0OKRKzE0lgvdKpVMSOO7zSW1xkX5jtqumX8OkhPhPYlG++MXs2ziS4wblCJEM\nxChBVfvLWokVfnHoNb9Ncgk9vjo4UFt3MRuNs8ckRZqnrG0AFFoEt7oT61EKmEFBIk5lYYeB\nQVCmeVyJ3hlKV9Uu5l0cUyx+mM0aBhakaHPQNAQTXKFx01p8VdteZOE3hzBWBOURtCmAEvF5\nOYiiAhF8J2a3iLd48soKqDirCmTCv2ZdlYTBoSUeh10aUAsgEsxBu24LUTi4S8sCAwEAAaNj\nMGEwDgYDVR0PAQH/BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFLE+w2kD+L9H\nAdSYJhoIAu9jZCvDMB8GA1UdIwQYMBaAFLE+w2kD+L9HAdSYJhoIAu9jZCvDMA0GCSqGSIb3\nDQEBBQUAA4IBAQAcGgaX3NecnzyIZgYIVyHbIUf4KmeqvxgydkAQV8GK83rZEWWONfqe/EW1\nntlMMUu4kehDLI6zeM7b41N5cdblIZQB2lWHmiRk9opmzN6cN82oNLFpmyPInngiK3BD41VH\nMWEZ71jFhS9OMPagMRYjyOfiZRYzy78aG6A9+MpeizGLYAiJLQwGXFK3xPkKmNEVX58Svnw2\nYzi9RKR/5CYrCsSXaQ3pjOLAEFe4yHYSkVXySGnYvCoCWw9E1CAx2/S6cCZdkGCevEsXCS+0\nyx5DaMkHJ8HSXPfqIbloEpw8nL+e/IBcm2PN7EeqJSdnoDfzAIJ9VNep+OkuE6N36B9K\n-----END CERTIFICATE-----\n",
  "Certplus Class 2 Primary CA": "-----BEGIN CERTIFICATE-----\nMIIDkjCCAnqgAwIBAgIRAIW9S/PY2uNp9pTXX8OlRCMwDQYJKoZIhvcNAQEFBQAwPTELMAkG\nA1UEBhMCRlIxETAPBgNVBAoTCENlcnRwbHVzMRswGQYDVQQDExJDbGFzcyAyIFByaW1hcnkg\nQ0EwHhcNOTkwNzA3MTcwNTAwWhcNMTkwNzA2MjM1OTU5WjA9MQswCQYDVQQGEwJGUjERMA8G\nA1UEChMIQ2VydHBsdXMxGzAZBgNVBAMTEkNsYXNzIDIgUHJpbWFyeSBDQTCCASIwDQYJKoZI\nhvcNAQEBBQADggEPADCCAQoCggEBANxQltAS+DXSCHh6tlJw/W/uz7kRy1134ezpfgSN1sxv\nc0NXYKwzCkTsA18cgCSR5aiRVhKC9+Ar9NuuYS6JEI1rbLqzAr3VNsVINyPi8Fo3UjMXEuLR\nYE2+L0ER4/YXJQyLkcAbmXuZVg2v7tK8R1fjeUl7NIknJITesezpWE7+Tt9avkGtrAjFGA7v\n0lPubNCdEgETjdyAYveVqUSISnFOYFWe2yMZeVYHDD9jC1yw4r5+FfyUM1hBOHTE4Y+L3yas\nH7WLO7dDWWuwJKZtkIvEcupdM5i3y95ee++U8Rs+yskhwcWYAqqi9lt3m/V+llU0HGdpwPFC\n40es/CgcZlUCAwEAAaOBjDCBiTAPBgNVHRMECDAGAQH/AgEKMAsGA1UdDwQEAwIBBjAdBgNV\nHQ4EFgQU43Mt38sOKAze3bOkynm4jrvoMIkwEQYJYIZIAYb4QgEBBAQDAgEGMDcGA1UdHwQw\nMC4wLKAqoCiGJmh0dHA6Ly93d3cuY2VydHBsdXMuY29tL0NSTC9jbGFzczIuY3JsMA0GCSqG\nSIb3DQEBBQUAA4IBAQCnVM+IRBnL39R/AN9WM2K191EBkOvDP9GIROkkXe/nFL0gt5o8AP5t\nn9uQ3Nf0YtaLcF3n5QRIqWh8yfFC82x/xXp8HVGIutIKPidd3i1RTtMTZGnkLuPT55sJmabg\nlZvOGtd/vjzOUrMRFcEPF80Du5wlFbqidon8BvEY0JNLDnyCt6X09l/+7UCmnYR0ObncHoUW\n2ikbhiMAybuJfm6AiB4vFLQDJKgybwOaRywwvlbGp0ICcBvqQNi6BQNwB6SW//1IMwrh3KWB\nkJtN3X3n57LNXMhqlfil9o3EXXgIvnsG1knPGTZQIy4I5p4FTUcY1Rbpsda2ENW7l7+ijrRU\n-----END CERTIFICATE-----\n",
  "DST Root CA X3": "-----BEGIN CERTIFICATE-----\nMIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/MSQwIgYD\nVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMTDkRTVCBSb290IENB\nIFgzMB4XDTAwMDkzMDIxMTIxOVoXDTIxMDkzMDE0MDExNVowPzEkMCIGA1UEChMbRGlnaXRh\nbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRcwFQYDVQQDEw5EU1QgUm9vdCBDQSBYMzCCASIwDQYJ\nKoZIhvcNAQEBBQADggEPADCCAQoCggEBAN+v6ZdQCINXtMxiZfaQguzH0yxrMMpb7NnDfcdA\nwRgUi+DoM3ZJKuM/IUmTrE4Orz5Iy2Xu/NMhD2XSKtkyj4zl93ewEnu1lcCJo6m67XMuegwG\nMoOifooUMM0RoOEqOLl5CjH9UL2AZd+3UWODyOKIYepLYYHsUmu5ouJLGiifSKOeDNoJjj4X\nLh7dIN9bxiqKqy69cK3FCxolkHRyxXtqqzTWMIn/5WgTe1QLyNau7Fqckh49ZLOMxt+/yUFw\n7BZy1SbsOFU5Q9D8/RhcQPGX69Wam40dutolucbY38EVAjqr2m7xPi71XAicPNaDaeQQmxkq\ntilX4+U9m5/wAl0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYw\nHQYDVR0OBBYEFMSnsaR7LHH62+FLkHX/xBVghYkQMA0GCSqGSIb3DQEBBQUAA4IBAQCjGiyb\nFwBcqR7uKGY3Or+Dxz9LwwmglSBd49lZRNI+DT69ikugdB/OEIKcdBodfpga3csTS7MgROSR\n6cz8faXbauX+5v3gTt23ADq1cEmv8uXrAvHRAosZy5Q6XkjEGB5YGV8eAlrwDPGxrancWYaL\nbumR9YbK+rlmM6pZW87ipxZzR8srzJmwN0jP41ZL9c8PDHIyh8bwRLtTcm1D9SZImlJnt1ir\n/md2cXjbDaJWFBM5JDGFoqgCWjBH4d1QB7wCCZAA62RjYJsWvIjJEubSfZGL+T0yjWW06Xyx\nV3bqxbYoOb8VZRzI9neWagqNdwvYkQsEjgfbKbYK7p2CNTUQ\n-----END CERTIFICATE-----\n",
  "DST ACES CA X6": "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIQDV6ZCtadt3js2AdWO4YV2TANBgkqhkiG9w0BAQUFADBbMQswCQYD\nVQQGEwJVUzEgMB4GA1UEChMXRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QxETAPBgNVBAsTCERT\nVCBBQ0VTMRcwFQYDVQQDEw5EU1QgQUNFUyBDQSBYNjAeFw0wMzExMjAyMTE5NThaFw0xNzEx\nMjAyMTE5NThaMFsxCzAJBgNVBAYTAlVTMSAwHgYDVQQKExdEaWdpdGFsIFNpZ25hdHVyZSBU\ncnVzdDERMA8GA1UECxMIRFNUIEFDRVMxFzAVBgNVBAMTDkRTVCBBQ0VTIENBIFg2MIIBIjAN\nBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuT31LMmU3HWKlV1j6IR3dma5WZFcRt2SPp/5\nDgO0PWGSvSMmtWPuktKe1jzIDZBfZIGxqAgNTNj50wUoUrQBJcWVHAx+PhCEdc/BGZFjz+io\nkYi5Q1K7gLFViYsx+tC3dr5BPTCapCIlF3PoHuLTrCq9Wzgh1SpL11V94zpVvddtawJXa+ZH\nfAjIgrrep4c9oW24MFbCswKBXy314powGCi4ZtPLAZZv6opFVdbgnf9nKxcCpk4aahELfrd7\n55jWjHZvwTvbUJN+5dCOHze4vbrGn2zpfDPyMjwmR/onJALJfh1biEITajV8fTXpLmaRcpPV\nMibEdPVTo7NdmvYJywIDAQABo4HIMIHFMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQD\nAgHGMB8GA1UdEQQYMBaBFHBraS1vcHNAdHJ1c3Rkc3QuY29tMGIGA1UdIARbMFkwVwYKYIZI\nAWUDAgEBATBJMEcGCCsGAQUFBwIBFjtodHRwOi8vd3d3LnRydXN0ZHN0LmNvbS9jZXJ0aWZp\nY2F0ZXMvcG9saWN5L0FDRVMtaW5kZXguaHRtbDAdBgNVHQ4EFgQUCXIGThhDD+XWzMNqizF7\neI+og7gwDQYJKoZIhvcNAQEFBQADggEBAKPYjtay284F5zLNAdMEA+V25FYrnJmQ6AgwbN99\nPe7lv7UkQIRJ4dEorsTCOlMwiPH1d25Ryvr/ma8kXxug/fKshMrfqfBfBC6tFr8hlxCBPeP/\nh40y3JTlR4peahPJlJU90u7INJXQgNStMgiAVDzgvVJT11J8smk/f3rPanTK+gQqnExaBqXp\nIK1FZg9p8d2/6eMyi/rgwYZNcjwu2JN4Cir42NInPRmJX1p7ijvMDNpRrscL9yuwNwXsvFcj\n4jjSm2jzVhKIT0J8uDHEtdvkyCE06UgRNe76x5JXxZ805Mf29w4LTJxoeHtxMcfrHuBnQfO3\noKfN5XozNmr6mis=\n-----END CERTIFICATE-----\n",
  "TURKTRUST Certificate Services Provider Root 1": "-----BEGIN CERTIFICATE-----\nMIID+zCCAuOgAwIBAgIBATANBgkqhkiG9w0BAQUFADCBtzE/MD0GA1UEAww2VMOcUktUUlVT\nVCBFbGVrdHJvbmlrIFNlcnRpZmlrYSBIaXptZXQgU2HEn2xhecSxY8Sxc8SxMQswCQYDVQQG\nDAJUUjEPMA0GA1UEBwwGQU5LQVJBMVYwVAYDVQQKDE0oYykgMjAwNSBUw5xSS1RSVVNUIEJp\nbGdpIMSwbGV0acWfaW0gdmUgQmlsacWfaW0gR8O8dmVubGnEn2kgSGl6bWV0bGVyaSBBLsWe\nLjAeFw0wNTA1MTMxMDI3MTdaFw0xNTAzMjIxMDI3MTdaMIG3MT8wPQYDVQQDDDZUw5xSS1RS\nVVNUIEVsZWt0cm9uaWsgU2VydGlmaWthIEhpem1ldCBTYcSfbGF5xLFjxLFzxLExCzAJBgNV\nBAYMAlRSMQ8wDQYDVQQHDAZBTktBUkExVjBUBgNVBAoMTShjKSAyMDA1IFTDnFJLVFJVU1Qg\nQmlsZ2kgxLBsZXRpxZ9pbSB2ZSBCaWxpxZ9pbSBHw7x2ZW5sacSfaSBIaXptZXRsZXJpIEEu\nxZ4uMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAylIF1mMD2Bxf3dJ7XfIMYGFb\nazt0K3gNfUW9InTojAPBxhEqPZW8qZSwu5GXyGl8hMW0kWxsE2qkVa2kheiVfrMArwDCBRj1\ncJ02i67L5BuBf5OI+2pVu32Fks66WJ/bMsW9Xe8iSi9BB35JYbOG7E6mQW6EvAPs9TscyB/C\n7qju6hJKjRTP8wrgUDn5CDX4EVmt5yLqS8oUBt5CurKZ8y1UiBAG6uEaPj1nH/vO+3yC6BFd\nSsG5FOpU2WabfIl9BJpiyelSPJ6c79L1JuTm5Rh8i27fbMx4W09ysstcP4wFjdFMjK2Sx+F4\nf2VsSQZQLJ4ywtdKxnWKWU51b0dewQIDAQABoxAwDjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3\nDQEBBQUAA4IBAQAV9VX/N5aAWSGk/KEVTCD21F/aAyT8z5Aa9CEKmu46sWrv7/hg0Uw2ZkUd\n82YCdAR7kjCo3gp2D++Vbr3JN+YaDayJSFvMgzbC9UZcWYJWtNX+I7TYVBxEq8Sn5RTOPEFh\nfEPmzcSBCYsk+1Ql1haolgxnB2+zUEfjHCQo3SqYpGH+2+oSN7wBGjSFvW5P55FyB0SFHljK\nVETd96y5y4khctuPwGkplyqjrhgjlxxBKot8KsF8kOipKMDTkcatKIdAaLX/7KfS0zgYnNN9\naV3wxqUeJBujR/xpB2jn5Jq07Q+hh4cCzofSSE7hvP/L8XKSRGQDJereW26fyfJOrN3H\n-----END CERTIFICATE-----\n",
  "TURKTRUST Certificate Services Provider Root 2": "-----BEGIN CERTIFICATE-----\nMIIEPDCCAySgAwIBAgIBATANBgkqhkiG9w0BAQUFADCBvjE/MD0GA1UEAww2VMOcUktUUlVT\nVCBFbGVrdHJvbmlrIFNlcnRpZmlrYSBIaXptZXQgU2HEn2xhecSxY8Sxc8SxMQswCQYDVQQG\nEwJUUjEPMA0GA1UEBwwGQW5rYXJhMV0wWwYDVQQKDFRUw5xSS1RSVVNUIEJpbGdpIMSwbGV0\nacWfaW0gdmUgQmlsacWfaW0gR8O8dmVubGnEn2kgSGl6bWV0bGVyaSBBLsWeLiAoYykgS2Fz\nxLFtIDIwMDUwHhcNMDUxMTA3MTAwNzU3WhcNMTUwOTE2MTAwNzU3WjCBvjE/MD0GA1UEAww2\nVMOcUktUUlVTVCBFbGVrdHJvbmlrIFNlcnRpZmlrYSBIaXptZXQgU2HEn2xhecSxY8Sxc8Sx\nMQswCQYDVQQGEwJUUjEPMA0GA1UEBwwGQW5rYXJhMV0wWwYDVQQKDFRUw5xSS1RSVVNUIEJp\nbGdpIMSwbGV0acWfaW0gdmUgQmlsacWfaW0gR8O8dmVubGnEn2kgSGl6bWV0bGVyaSBBLsWe\nLiAoYykgS2FzxLFtIDIwMDUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCpNn7D\nkUNMwxmYCMjHWHtPFoylzkkBH3MOrHUTpvqeLCDe2JAOCtFp0if7qnefJ1Il4std2NiDUBd9\nirWCPwSOtNXwSadktx4uXyCcUHVPr+G1QRT0mJKIx+XlZEdhR3n9wFHxwZnn3M5q+6+1ATDc\nRhzviuyV79z/rxAc653YsKpqhRgNF8k+v/Gb0AmJQv2gQrSdiVFVKc8bcLyEVK3BEx+Y9C52\nYItdP5qtygy/p1Zbj3e41Z55SZI/4PGXJHpsmxcPbe9TmJEr5A++WXkHeLuXlfSfadRYhwqp\n48y2WBmfJiGxxFmNskF1wK1pzpwACPI2/z7woQ8arBT9pmAPAgMBAAGjQzBBMB0GA1UdDgQW\nBBTZN7NOBf3Zz58SFq62iS/rJTqIHDAPBgNVHQ8BAf8EBQMDBwYAMA8GA1UdEwEB/wQFMAMB\nAf8wDQYJKoZIhvcNAQEFBQADggEBAHJglrfJ3NgpXiOFX7KzLXb7iNcX/nttRbj2hWyfIvwq\nECLsqrkw9qtY1jkQMZkpAL2JZkH7dN6RwRgLn7Vhy506vvWolKMiVW4XSf/SKfE4Jl3vpao6\n+XF75tpYHdN0wgH6PmlYX63LaL4ULptswLbcoCb6dxriJNoaN+BnrdFzgw2lGh1uEpJ+hGIA\nF728JRhX8tepb1mIvDS3LoV4nZbcFMMsilKbloxSZj2GFotHuFEJjOp9zYhys2AzsfAKRO8P\n9Qk3iCQOLGsgOqL6EfJANZxEaGM7rDNvY7wsu/LSy3Z9fYjYHcgFHW68lKlmjHdxx/qR+i9R\nnuk5UrbnBEI=\n-----END CERTIFICATE-----\n",
  "SwissSign Gold CA - G2": "-----BEGIN CERTIFICATE-----\nMIIFujCCA6KgAwIBAgIJALtAHEP1Xk+wMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNVBAYTAkNI\nMRUwEwYDVQQKEwxTd2lzc1NpZ24gQUcxHzAdBgNVBAMTFlN3aXNzU2lnbiBHb2xkIENBIC0g\nRzIwHhcNMDYxMDI1MDgzMDM1WhcNMzYxMDI1MDgzMDM1WjBFMQswCQYDVQQGEwJDSDEVMBMG\nA1UEChMMU3dpc3NTaWduIEFHMR8wHQYDVQQDExZTd2lzc1NpZ24gR29sZCBDQSAtIEcyMIIC\nIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAr+TufoskDhJuqVAtFkQ7kpJcyrhdhJJC\nEyq8ZVeCQD5XJM1QiyUqt2/876LQwB8CJEoTlo8jE+YoWACjR8cGp4QjK7u9lit/VcyLwVcf\nDmJlD909Vopz2q5+bbqBHH5CjCA12UNNhPqE21Is8w4ndwtrvxEvcnifLtg+5hg3Wipy+dpi\nkJKVyh+c6bM8K8vzARO/Ws/BtQpgvd21mWRTuKCWs2/iJneRjOBiEAKfNA+k1ZIzUd6+jbqE\nemA8atufK+ze3gE/bk3lUIbLtK/tREDFylqM2tIrfKjuvqblCqoOpd8FUrdVxyJdMmqXl2MT\n28nbeTZ7hTpKxVKJ+STnnXepgv9VHKVxaSvRAiTysybUa9oEVeXBCsdtMDeQKuSeFDNeFhdV\nxVu1yzSJkvGdJo+hB9TGsnhQ2wwMC3wLjEHXuendjIj3o02yMszYF9rNt85mndT9Xv+9lz4p\nded+p2JYryU0pUHHPbwNUMoDAw8IWh+Vc3hiv69yFGkOpeUDDniOJihC8AcLYiAQZzlG+qkD\nzAQ4embvIIO1jEpWjpEA/I5cgt6IoMPiaG59je883WX0XaxR7ySArqpWl2/5rX3aYT+Ydzyl\nkbYcjCbaZaIJbcHiVOO5ykxMgI93e2CaHt+28kgeDrpOVG2Y4OGiGqJ3UM/EY5LsRxmd6+Zr\nzsECAwEAAaOBrDCBqTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4E\nFgQUWyV7lqRlUX64OfPAeGZe6Drn8O4wHwYDVR0jBBgwFoAUWyV7lqRlUX64OfPAeGZe6Drn\n8O4wRgYDVR0gBD8wPTA7BglghXQBWQECAQEwLjAsBggrBgEFBQcCARYgaHR0cDovL3JlcG9z\naXRvcnkuc3dpc3NzaWduLmNvbS8wDQYJKoZIhvcNAQEFBQADggIBACe645R88a7A3hfm5djV\n9VSwg/S7zV4Fe0+fdWavPOhWfvxyeDgD2StiGwC5+OlgzczOUYrHUDFu4Up+GC9pWbY9ZIEr\n44OE5iKHjn3g7gKZYbge9LgriBIWhMIxkziWMaa5O1M/wySTVltpkuzFwbs4AOPsF6m43Md8\nAYOfMke6UiI0HTJ6CVanfCU2qT1L2sCCbwq7EsiHSycR+R4tx5M/nttfJmtS2S6K8RTGRI0V\nqbe/vd6mGu6uLftIdxf+u+yvGPUqUfA5hJeVbG4bwyvEdGB5JbAKJ9/fXtI5z0V9Qkvfsywe\nxcZdylU6oJxpmo/a77KwPJ+HbBIrZXAVUjEaJM9vMSNQH4xPjyPDdEFjHFWoFN0+4FFQz/Eb\nMFYOkrCChdiDyyJkvC24JdVUorgG6q2SpCSgwYa1ShNqR88uC1aVVMvOmttqtKay20EIhid3\n92qgQmwLOM7XdVAyksLfKzAiSNDVQTglXaTpXZ/GlHXQRf0wl0OPkKsKx4ZzYEppLd6leNcG\n2mqeSz53OiATIgHQv2ieY2BrNU0LbbqhPcCT4H8js1WtciVORvnSFu+wZMEBnunKoGqYDs/Y\nYPIvSbjkQuE4NRb0yG5P94FW6LqjviOvrv1vA+ACOzB2+httQc8Bsem4yWb02ybzOqR08kkk\nW8mw0FfB+j564ZfJ\n-----END CERTIFICATE-----\n",
  "SwissSign Silver CA - G2": "-----BEGIN CERTIFICATE-----\nMIIFvTCCA6WgAwIBAgIITxvUL1S7L0swDQYJKoZIhvcNAQEFBQAwRzELMAkGA1UEBhMCQ0gx\nFTATBgNVBAoTDFN3aXNzU2lnbiBBRzEhMB8GA1UEAxMYU3dpc3NTaWduIFNpbHZlciBDQSAt\nIEcyMB4XDTA2MTAyNTA4MzI0NloXDTM2MTAyNTA4MzI0NlowRzELMAkGA1UEBhMCQ0gxFTAT\nBgNVBAoTDFN3aXNzU2lnbiBBRzEhMB8GA1UEAxMYU3dpc3NTaWduIFNpbHZlciBDQSAtIEcy\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxPGHf9N4Mfc4yfjDmUO8x/e8N+dO\ncbpLj6VzHVxumK4DV644N0MvFz0fyM5oEMF4rhkDKxD6LHmD9ui5aLlV8gREpzn5/ASLHvGi\nTSf5YXu6t+WiE7brYT7QbNHm+/pe7R20nqA1W6GSy/BJkv6FCgU+5tkL4k+73JU3/JHpMjUi\n0R86TieFnbAVlDLaYQ1HTWBCrpJH6INaUFjpiou5XaHc3ZlKHzZnu0jkg7Y360g6rw9njxcH\n6ATK72oxh9TAtvmUcXtnZLi2kUpCe2UuMGoM9ZDulebyzYLs2aFK7PayS+VFheZteJMELpyC\nbTapxDFkH4aDCyr0NQp4yVXPQbBH6TCfmb5hqAaEuSh6XzjZG6k4sIN/c8HDO0gqgg8hm7jM\nqDXDhBuDsz6+pJVpATqJAHgE2cn0mRmrVn5bi4Y5FZGkECwJMoBgs5PAKrYYC51+jUnyEEp/\n+dVGLxmSo5mnJqy7jDzmDrxHB9xzUfFwZC8I+bRHHTBsROopN4WSaGa8gzj+ezku01DwH/te\nYLappvonQfGbGHLy9YR0SslnxFSuSGTfjNFusB3hB48IHpmccelM2KX3RxIfdNFRnobzwqIj\nQAtz20um53MGjMGg6cFZrEb65i/4z3GcRm25xBWNOHkDRUjvxF3XCO6HOSKGsg0PWEP3calI\nLv3q1h8CAwEAAaOBrDCBqTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNV\nHQ4EFgQUF6DNweRBtjpbO8tFnb0cwpj6hlgwHwYDVR0jBBgwFoAUF6DNweRBtjpbO8tFnb0c\nwpj6hlgwRgYDVR0gBD8wPTA7BglghXQBWQEDAQEwLjAsBggrBgEFBQcCARYgaHR0cDovL3Jl\ncG9zaXRvcnkuc3dpc3NzaWduLmNvbS8wDQYJKoZIhvcNAQEFBQADggIBAHPGgeAn0i0P4JUw\n4ppBf1AsX19iYamGamkYDHRJ1l2E6kFSGG9YrVBWIGrGvShpWJHckRE1qTodvBqlYJ7YH39F\nkWnZfrt4csEGDyrOj4VwYaygzQu4OSlWhDJOhrs9xCrZ1x9y7v5RoSJBsXECYxqCsGKrXlcS\nH9/L3XWgwF15kIwb4FDm3jH+mHtwX6WQ2K34ArZv02DdQEsixT2tOnqfGhpHkXkzuoLcMmkD\nlm4fS/Bx/uNncqCxv1yL5PqZIseEuRuNI5c/7SXgz2W79WEE790eslpBIlqhn10s6FvJbakM\nDHiqYMZWjwFaDGi8aRl5xB9+lwW/xekkUV7U1UtT7dkjWjYDZaPBA61BMPNGG4WQr2W11bHk\nFlt4dR2Xem1ZqSqPe97Dh4kQmUlzeMg9vVE1dCrV8X5pGyq7O70luJpaPXJhkGaH7gzWTdQR\ndAtq/gsD/KNVV4n+SsuuWxcFyPKNIzFTONItaj+CuY0IavdeQXRuwxF+B6wpYJE/OMpXEA29\nMC/HpeZBoNquBYeaoKRlbEwJDIm6uNO5wJOKMPqN5ZprFQFOZ6raYlY+hAhm0sQ2fac+EPyI\n4NSA5QC9qvNOBqN6avlicuMJT+ubDgEj8Z+7fNzcbBGXJbLytGMU0gYqZ4yD9c7qB9iaah7s\n5Aq7KkzrCWA5zspi2C5u\n-----END CERTIFICATE-----\n",
  "GeoTrust Primary Certification Authority": "-----BEGIN CERTIFICATE-----\nMIIDfDCCAmSgAwIBAgIQGKy1av1pthU6Y2yv2vrEoTANBgkqhkiG9w0BAQUFADBYMQswCQYD\nVQQGEwJVUzEWMBQGA1UEChMNR2VvVHJ1c3QgSW5jLjExMC8GA1UEAxMoR2VvVHJ1c3QgUHJp\nbWFyeSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTAeFw0wNjExMjcwMDAwMDBaFw0zNjA3MTYy\nMzU5NTlaMFgxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMuMTEwLwYDVQQD\nEyhHZW9UcnVzdCBQcmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5MIIBIjANBgkqhkiG\n9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvrgVe//UfH1nrYNke8hCUy3f9oQIIGHWAVlqnEQRr+92\n/ZV+zmEwu3qDXwK9AWbK7hWNb6EwnL2hhZ6UOvNWiAAxz9juapYC2e0DjPt1befquFUWBRaa\n9OBesYjAZIVcFU2Ix7e64HXprQU9nceJSOC7KMgD4TCTZF5SwFlwIjVXiIrxlQqD17wxcwE0\n7e9GceBrAqg1cmuXm2bgyxx5X9gaBGgeRwLmnWDiNpcB3841kt++Z8dtd1k7j53WkBWUvEI0\nEME5+bEnPn7WinXFsq+W06Lem+SYvn3h6YGttm/81w7a4DSwDRp35+MImO9Y+pyEtzavwt+s\n0vQQBnBxNQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjAdBgNV\nHQ4EFgQULNVQQZcVi/CPNmFbSvtr2ZnJM5IwDQYJKoZIhvcNAQEFBQADggEBAFpwfyzdtzRP\n9YZRqSa+S7iq8XEN3GHHoOo0Hnp3DwQ16CePbJC/kRYkRj5KTs4rFtULUh38H2eiAkUxT87z\n+gOneZ1TatnaYzr4gNfTmeGl4b7UVXGYNTq+k+qurUKykG/g/CFNNWMziUnWm07Kx+dOCQD3\n2sfvmWKZd7aVIl6KoKv0uHiYyjgZmclynnjNS6yvGaBzEi38wkG6gZHaFloxt/m0cYASSJly\nc1pZU8FjUjPtp8nSOQJw+uCxQmYpqptR7TBUIhRf2asdweSU8Pj1K/fqynhG1riR/aYNKxoU\nAT6A8EKglQdebc3MS6RFjasS6LPeWuWgfOgPIh1a6Vk=\n-----END CERTIFICATE-----\n",
  "thawte Primary Root CA": "-----BEGIN CERTIFICATE-----\nMIIEIDCCAwigAwIBAgIQNE7VVyDV7exJ9C/ON9srbTANBgkqhkiG9w0BAQUFADCBqTELMAkG\nA1UEBhMCVVMxFTATBgNVBAoTDHRoYXd0ZSwgSW5jLjEoMCYGA1UECxMfQ2VydGlmaWNhdGlv\nbiBTZXJ2aWNlcyBEaXZpc2lvbjE4MDYGA1UECxMvKGMpIDIwMDYgdGhhd3RlLCBJbmMuIC0g\nRm9yIGF1dGhvcml6ZWQgdXNlIG9ubHkxHzAdBgNVBAMTFnRoYXd0ZSBQcmltYXJ5IFJvb3Qg\nQ0EwHhcNMDYxMTE3MDAwMDAwWhcNMzYwNzE2MjM1OTU5WjCBqTELMAkGA1UEBhMCVVMxFTAT\nBgNVBAoTDHRoYXd0ZSwgSW5jLjEoMCYGA1UECxMfQ2VydGlmaWNhdGlvbiBTZXJ2aWNlcyBE\naXZpc2lvbjE4MDYGA1UECxMvKGMpIDIwMDYgdGhhd3RlLCBJbmMuIC0gRm9yIGF1dGhvcml6\nZWQgdXNlIG9ubHkxHzAdBgNVBAMTFnRoYXd0ZSBQcmltYXJ5IFJvb3QgQ0EwggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCsoPD7gFnUnMekz52hWXMJEEUMDSxuaPFsW0hoSVk3\n/AszGcJ3f8wQLZU0HObrTQmnHNK4yZc2AreJ1CRfBsDMRJSUjQJib+ta3RGNKJpchJAQeg29\ndGYvajig4tVUROsdB58Hum/u6f1OCyn1PoSgAfGcq/gcfomk6KHYcWUNo1F77rzSImANuVud\n37r8UVsLr5iy6S7pBOhih94ryNdOwUxkHt3Ph1i6Sk/KaAcdHJ1KxtUvkcx8cXIcxcBn6zL9\nyZJclNqFwJu/U30rCfSMnZEfl2pSy94JNqR32HuHUETVPm4pafs5SSYeCaWAe0At6+gnhcn+\nYf1+5nyXHdWdAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMB0G\nA1UdDgQWBBR7W0XPr87Lev0xkhpqtvNG61dIUDANBgkqhkiG9w0BAQUFAAOCAQEAeRHAS7OR\ntvzw6WfUDW5FvlXok9LOAz/t2iWwHVfLHjp2oEzsUHboZHIMpKnxuIvW1oeEuzLlQRHAd9mz\nYJ3rG9XRbkREqaYB7FViHXe4XI5ISXycO1cRrK1zN44veFyQaEfZYGDm/Ac9IiAXxPcW6cTY\ncvnIc3zfFi8VqT79aie2oetaupgf1eNNZAqdE8hhuvU5HIe6uL17In/2/qxAeeWsEG89jxt5\ndovEN7MhGITlNgDrYyCZuen+MwS7QcjBAvlEYyCegc5C09Y/LHbTY5xZ3Y+m4Q6gLkH3LpVH\nz7z9M/P2C2F+fpErgUfCJzDupxBdN49cOSvkBPB7jVaMaA==\n-----END CERTIFICATE-----\n",
  "VeriSign Class 3 Public Primary Certification Authority - G5": "-----BEGIN CERTIFICATE-----\nMIIE0zCCA7ugAwIBAgIQGNrRniZ96LtKIVjNzGs7SjANBgkqhkiG9w0BAQUFADCByjELMAkG\nA1UEBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8wHQYDVQQLExZWZXJpU2lnbiBU\ncnVzdCBOZXR3b3JrMTowOAYDVQQLEzEoYykgMjAwNiBWZXJpU2lnbiwgSW5jLiAtIEZvciBh\ndXRob3JpemVkIHVzZSBvbmx5MUUwQwYDVQQDEzxWZXJpU2lnbiBDbGFzcyAzIFB1YmxpYyBQ\ncmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5IC0gRzUwHhcNMDYxMTA4MDAwMDAwWhcN\nMzYwNzE2MjM1OTU5WjCByjELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMu\nMR8wHQYDVQQLExZWZXJpU2lnbiBUcnVzdCBOZXR3b3JrMTowOAYDVQQLEzEoYykgMjAwNiBW\nZXJpU2lnbiwgSW5jLiAtIEZvciBhdXRob3JpemVkIHVzZSBvbmx5MUUwQwYDVQQDEzxWZXJp\nU2lnbiBDbGFzcyAzIFB1YmxpYyBQcmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5IC0g\nRzUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCvJAgIKXo1nmAMqudLO07cfLw8\nRRy7K+D+KQL5VwijZIUVJ/XxrcgxiV0i6CqqpkKzj/i5Vbext0uz/o9+B1fs70PbZmIVYc9g\nDaTY3vjgw2IIPVQT60nKWVSFJuUrjxuf6/WhkcIzSdhDY2pSS9KP6HBRTdGJaXvHcPaz3BJ0\n23tdS1bTlr8Vd6Gw9KIl8q8ckmcY5fQGBO+QueQA5N06tRn/Arr0PO7gi+s3i+z016zy9vA9\nr911kTMZHRxAy3QkGSGT2RT+rCpSx4/VBEnkjWNHiDxpg8v+R70rfk/Fla4OndTRQ8Bnc+MU\nCH7lP59zuDMKz10/NIeWiu5T6CUVAgMBAAGjgbIwga8wDwYDVR0TAQH/BAUwAwEB/zAOBgNV\nHQ8BAf8EBAMCAQYwbQYIKwYBBQUHAQwEYTBfoV2gWzBZMFcwVRYJaW1hZ2UvZ2lmMCEwHzAH\nBgUrDgMCGgQUj+XTGoasjY5rw8+AatRIGCx7GS4wJRYjaHR0cDovL2xvZ28udmVyaXNpZ24u\nY29tL3ZzbG9nby5naWYwHQYDVR0OBBYEFH/TZafC3ey78DAJ80M5+gKvMzEzMA0GCSqGSIb3\nDQEBBQUAA4IBAQCTJEowX2LP2BqYLz3q3JktvXf2pXkiOOzEp6B4Eq1iDkVwZMXnl2YtmAl+\nX6/WzChl8gGqCBpH3vn5fJJaCGkgDdk+bW48DW7Y5gaRQBi5+MHt39tBquCWIMnNZBU4gcmU\n7qKEKQsTb47bDN0lAtukixlE0kF6BWlKWE9gyn6CagsCqiUXObXbf+eEZSqVir2G3l6BFoMt\nEMze/aiCKm0oHw0LxOXnGiYZ4fQRbxC1lfznQgUy286dUV4otp6F01vvpX1FQHKOtw5rDgb7\nMzVIcbidJ4vEZV8NhnacRHr2lVz2XTIIM6RUthg/aFzyQkqFOFSDX9HoLPKsEdao7WNq\n-----END CERTIFICATE-----\n",
  "SecureTrust CA": "-----BEGIN CERTIFICATE-----\nMIIDuDCCAqCgAwIBAgIQDPCOXAgWpa1Cf/DrJxhZ0DANBgkqhkiG9w0BAQUFADBIMQswCQYD\nVQQGEwJVUzEgMB4GA1UEChMXU2VjdXJlVHJ1c3QgQ29ycG9yYXRpb24xFzAVBgNVBAMTDlNl\nY3VyZVRydXN0IENBMB4XDTA2MTEwNzE5MzExOFoXDTI5MTIzMTE5NDA1NVowSDELMAkGA1UE\nBhMCVVMxIDAeBgNVBAoTF1NlY3VyZVRydXN0IENvcnBvcmF0aW9uMRcwFQYDVQQDEw5TZWN1\ncmVUcnVzdCBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKukgeWVzfX2FI7C\nT8rU4niVWJxB4Q2ZQCQXOZEzZum+4YOvYlyJ0fwkW2Gz4BERQRwdbvC4u/jep4G6pkjGnx29\nvo6pQT64lO0pGtSO0gMdA+9tDWccV9cGrcrI9f4Or2YlSASWC12juhbDCE/RRvgUXPLIXgGZ\nbf2IzIaowW8xQmxSPmjL8xk037uHGFaAJsTQ3MBv396gwpEWoGQRS0S8Hvbn+mPeZqx2pHGj\n7DaUaHp3pLHnDi+BeuK1cobvomuL8A/b01k/unK8RCSc43Oz969XL0Imnal0ugBS8kvNU3xH\nCzaFDmapCJcWNFfBZveA4+1wVMeT4C4oFVmHursCAwEAAaOBnTCBmjATBgkrBgEEAYI3FAIE\nBh4EAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUQjK2FvoE\n/f5dS3rD/fdMQB1aQ68wNAYDVR0fBC0wKzApoCegJYYjaHR0cDovL2NybC5zZWN1cmV0cnVz\ndC5jb20vU1RDQS5jcmwwEAYJKwYBBAGCNxUBBAMCAQAwDQYJKoZIhvcNAQEFBQADggEBADDt\nT0rhWDpSclu1pqNlGKa7UTt36Z3q059c4EVlew3KW+JwULKUBRSuSceNQQcSc5R+DCMh/bwQ\nf2AQWnL1mA6s7Ll/3XpvXdMc9P+IBWlCqQVxyLesJugutIxq/3HcuLHfmbx8IVQr5Fiiu1cp\nrp6poxkmD5kuCLDv/WnPmRoJjeOnnyvJNjR7JLN4TJUXpAYmHrZkUjZfYGfZnMUFdAvnZyPS\nCPyI6a6Lf+Ew9Dd+/cYy2i2eRDAwbO4H3tI0/NL/QPZL9GZGBlSm8jIKYyYwa5vR3ItHuuG5\n1WLQoqD0ZwV4KWMabwTW+MZMo5qxN7SN5ShLHZ4swrhovO0C7jE=\n-----END CERTIFICATE-----\n",
  "Secure Global CA": "-----BEGIN CERTIFICATE-----\nMIIDvDCCAqSgAwIBAgIQB1YipOjUiolN9BPI8PjqpTANBgkqhkiG9w0BAQUFADBKMQswCQYD\nVQQGEwJVUzEgMB4GA1UEChMXU2VjdXJlVHJ1c3QgQ29ycG9yYXRpb24xGTAXBgNVBAMTEFNl\nY3VyZSBHbG9iYWwgQ0EwHhcNMDYxMTA3MTk0MjI4WhcNMjkxMjMxMTk1MjA2WjBKMQswCQYD\nVQQGEwJVUzEgMB4GA1UEChMXU2VjdXJlVHJ1c3QgQ29ycG9yYXRpb24xGTAXBgNVBAMTEFNl\nY3VyZSBHbG9iYWwgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCvNS7YrGxV\naQZx5RNoJLNP2MwhR/jxYDiJiQPpvepeRlMJ3Fz1Wuj3RSoC6zFh1ykzTM7HfAo3fg+6Mpjh\nHZevj8fcyTiW89sa/FHtaMbQbqR8JNGuQsiWUGMu4P51/pinX0kuleM5M2SOHqRfkNJnPLLZ\n/kG5VacJjnIFHovdRIWCQtBJwB1g8NEXLJXr9qXBkqPFwqcIYA1gBBCWeZ4WNOaptvolRTnI\nHmX5k/Wq8VLcmZg9pYYaDDUz+kulBAYVHDGA76oYa8J719rO+TMg1fW9ajMtgQT7sFzUnKPi\nXB3jqUJ1XnvUd+85VLrJChgbEplJL4hL/VBi0XPnj3pDAgMBAAGjgZ0wgZowEwYJKwYBBAGC\nNxQCBAYeBABDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFK9E\nBMJBfkiD2045AuzshHrmzsmkMDQGA1UdHwQtMCswKaAnoCWGI2h0dHA6Ly9jcmwuc2VjdXJl\ndHJ1c3QuY29tL1NHQ0EuY3JsMBAGCSsGAQQBgjcVAQQDAgEAMA0GCSqGSIb3DQEBBQUAA4IB\nAQBjGghAfaReUw132HquHw0LURYD7xh8yOOvaliTFGCRsoTciE6+OYo68+aCiV0BN7OrJKQV\nDpI1WkpEXk5X+nXOH0jOZvQ8QCaSmGwb7iRGDBezUqXbpZGRzzfTb+cnCDpOGR86p1hcF895\nP4vkp9MmI50mD1hp/Ed+stCNi5O/KU9DaXR2Z0vPB4zmAve14bRDtUstFJ/53CYNv6ZHdAbY\niNE6KTCEztI5gGIbqMdXSbxqVVFnFUq+NQfk1XWYN3kwFNspnWzFacxHVaIw98xcf8LDmBxr\nThaA63p4ZUWiABqvDA1VZDRIuJK58bRQKfJPIx/abKwfROHdI3hRW8cW\n-----END CERTIFICATE-----\n",
  "COMODO Certification Authority": "-----BEGIN CERTIFICATE-----\nMIIEHTCCAwWgAwIBAgIQToEtioJl4AsC7j41AkblPTANBgkqhkiG9w0BAQUFADCBgTELMAkG\nA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBxMHU2FsZm9y\nZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxJzAlBgNVBAMTHkNPTU9ETyBDZXJ0aWZp\nY2F0aW9uIEF1dGhvcml0eTAeFw0wNjEyMDEwMDAwMDBaFw0yOTEyMzEyMzU5NTlaMIGBMQsw\nCQYDVQQGEwJHQjEbMBkGA1UECBMSR3JlYXRlciBNYW5jaGVzdGVyMRAwDgYDVQQHEwdTYWxm\nb3JkMRowGAYDVQQKExFDT01PRE8gQ0EgTGltaXRlZDEnMCUGA1UEAxMeQ09NT0RPIENlcnRp\nZmljYXRpb24gQXV0aG9yaXR5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0ECL\ni3LjkRv3UcEbVASY06m/weaKXTuH+7uIzg3jLz8GlvCiKVCZrts7oVewdFFxze1CkU1B/qnI\n2GqGd0S7WWaXUF601CxwRM/aN5VCaTwwxHGzUvAhTaHYujl8HJ6jJJ3ygxaYqhZ8Q5sVW7eu\nNJH+1GImGEaaP+vB+fGQV+useg2L23IwambV4EajcNxo2f8ESIl33rXp+2dtQem8Ob0y2WIC\n8bGoPW43nOIv4tOiJovGuFVDiOEjPqXSJDlqR6sA1KGzqSX+DT+nHbrTUcELpNqsOO9VUCQF\nZUaTNE8tja3G1CEZ0o7KBWFxB3NH5YoZEr0ETc5OnKVIrLsm9wIDAQABo4GOMIGLMB0GA1Ud\nDgQWBBQLWOWLxkwVN6RAqTCpIb5HNlpW/zAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUw\nAwEB/zBJBgNVHR8EQjBAMD6gPKA6hjhodHRwOi8vY3JsLmNvbW9kb2NhLmNvbS9DT01PRE9D\nZXJ0aWZpY2F0aW9uQXV0aG9yaXR5LmNybDANBgkqhkiG9w0BAQUFAAOCAQEAPpiem/Yb6dc5\nt3iuHXIYSdOH5EOC6z/JqvWote9VfCFSZfnVDeFs9D6Mk3ORLgLETgdxb8CPOGEIqB6BCsAv\nIC9Bi5HcSEW88cbeunZrM8gALTFGTO3nnc+IlP8zwFboJIYmuNg4ON8qa90SzMc/RxdMosIG\nlgnW2/4/PEZB31jiVg88O8EckzXZOFKs7sjsLjBOlDW0JB9LeGna8gI4zJVSk/BwJVmcIGfE\n7vmLV2H0knZ9P4SNVbfo5azV8fUZVqZa+5Acr5Pr5RzUZ5ddBA6+C4OmF4O5MBKgxTMVBbkN\n+8cFduPYSo38NBejxiEovjBFMR7HeL5YYTisO+IBZQ==\n-----END CERTIFICATE-----\n",
  "Network Solutions Certificate Authority": "-----BEGIN CERTIFICATE-----\nMIID5jCCAs6gAwIBAgIQV8szb8JcFuZHFhfjkDFo4DANBgkqhkiG9w0BAQUFADBiMQswCQYD\nVQQGEwJVUzEhMB8GA1UEChMYTmV0d29yayBTb2x1dGlvbnMgTC5MLkMuMTAwLgYDVQQDEydO\nZXR3b3JrIFNvbHV0aW9ucyBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkwHhcNMDYxMjAxMDAwMDAw\nWhcNMjkxMjMxMjM1OTU5WjBiMQswCQYDVQQGEwJVUzEhMB8GA1UEChMYTmV0d29yayBTb2x1\ndGlvbnMgTC5MLkMuMTAwLgYDVQQDEydOZXR3b3JrIFNvbHV0aW9ucyBDZXJ0aWZpY2F0ZSBB\ndXRob3JpdHkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDkvH6SMG3G2I4rC7xG\nzuAnlt7e+foS0zwzc7MEL7xxjOWftiJgPl9dzgn/ggwbmlFQGiaJ3dVhXRncEg8tCqJDXRfQ\nNJIg6nPPOCwGJgl6cvf6UDL4wpPTaaIjzkGxzOTVHzbRijr4jGPiFFlp7Q3Tf2vouAPlT2rl\nmGNpSAW+Lv8ztumXWWn4Zxmuk2GWRBXTcrA/vGp97Eh/jcOrqnErU2lBUzS1sLnFBgrEsEX1\nQV1uiUV7PTsmjHTC5dLRfbIR1PtYMiKagMnc/Qzpf14Dl847ABSHJ3A4qY5usyd2mFHgBeMh\nqxrVhSI8KbWaFsWAqPS7azCPL0YCorEMIuDTAgMBAAGjgZcwgZQwHQYDVR0OBBYEFCEwyfsA\n106Y2oeqKtCnLrFAMadMMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MFIGA1Ud\nHwRLMEkwR6BFoEOGQWh0dHA6Ly9jcmwubmV0c29sc3NsLmNvbS9OZXR3b3JrU29sdXRpb25z\nQ2VydGlmaWNhdGVBdXRob3JpdHkuY3JsMA0GCSqGSIb3DQEBBQUAA4IBAQC7rkvnt1frf6ot\nt3NHhWrB5KUd5Oc86fRZZXe1eltajSU24HqXLjjAV2CDmAaDn7l2em5Q4LqILPxFzBiwmZVR\nDuwduIj/h1AcgsLj4DKAv6ALR8jDMe+ZZzKATxcheQxpXN5eNK4CtSbqUN9/GGUsyfJj4akH\n/nxxH2szJGoeBfcFaMBqEssuXmHLrijTfsK0ZpEmXzwuJF/LWA/rKOyvEZbz3HtvwKeI8lN3\ns2Berq4o2jUsbzRF0ybh3uxbTydrFny9RAQYgrOJeRcQcT16ohZO9QHNpGxlaKFJdlxDydi8\nNmdspZS11My5vWo1ViHe2MPr+8ukYEywVaCge1ey\n-----END CERTIFICATE-----\n",
  "WellsSecure Public Root Certificate Authority": "-----BEGIN CERTIFICATE-----\nMIIEvTCCA6WgAwIBAgIBATANBgkqhkiG9w0BAQUFADCBhTELMAkGA1UEBhMCVVMxIDAeBgNV\nBAoMF1dlbGxzIEZhcmdvIFdlbGxzU2VjdXJlMRwwGgYDVQQLDBNXZWxscyBGYXJnbyBCYW5r\nIE5BMTYwNAYDVQQDDC1XZWxsc1NlY3VyZSBQdWJsaWMgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRo\nb3JpdHkwHhcNMDcxMjEzMTcwNzU0WhcNMjIxMjE0MDAwNzU0WjCBhTELMAkGA1UEBhMCVVMx\nIDAeBgNVBAoMF1dlbGxzIEZhcmdvIFdlbGxzU2VjdXJlMRwwGgYDVQQLDBNXZWxscyBGYXJn\nbyBCYW5rIE5BMTYwNAYDVQQDDC1XZWxsc1NlY3VyZSBQdWJsaWMgUm9vdCBDZXJ0aWZpY2F0\nZSBBdXRob3JpdHkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDub7S9eeKPCCGe\nOARBJe+rWxxTkqxtnt3CxC5FlAM1iGd0V+PfjLindo8796jE2yljDpFoNoqXjopxaAkH5OjU\nDk/41itMpBb570OYj7OeUt9tkTmPOL13i0Nj67eT/DBMHAGTthP796EfvyXhdDcsHqRePGj4\nS78NuR4uNuip5Kf4D8uCdXw1LSLWwr8L87T8bJVhHlfXBIEyg1J55oNjz7fLY4sR4r1e6/aN\n7ZVyKLSsEmLpSjPmgzKuBXWVvYSV2ypcm44uDLiBK0HmOFafSZtsdvqKXfcBeYF8wYNABf5x\n/Qw/zE5gCQ5lRxAvAcAFP4/4s0HvWkJ+We/SlwxlAgMBAAGjggE0MIIBMDAPBgNVHRMBAf8E\nBTADAQH/MDkGA1UdHwQyMDAwLqAsoCqGKGh0dHA6Ly9jcmwucGtpLndlbGxzZmFyZ28uY29t\nL3dzcHJjYS5jcmwwDgYDVR0PAQH/BAQDAgHGMB0GA1UdDgQWBBQmlRkQ2eihl5H/3BnZtQQ+\n0nMKajCBsgYDVR0jBIGqMIGngBQmlRkQ2eihl5H/3BnZtQQ+0nMKaqGBi6SBiDCBhTELMAkG\nA1UEBhMCVVMxIDAeBgNVBAoMF1dlbGxzIEZhcmdvIFdlbGxzU2VjdXJlMRwwGgYDVQQLDBNX\nZWxscyBGYXJnbyBCYW5rIE5BMTYwNAYDVQQDDC1XZWxsc1NlY3VyZSBQdWJsaWMgUm9vdCBD\nZXJ0aWZpY2F0ZSBBdXRob3JpdHmCAQEwDQYJKoZIhvcNAQEFBQADggEBALkVsUSRzCPIK013\n4/iaeycNzXK7mQDKfGYZUMbVmO2rvwNa5U3lHshPcZeG1eMd/ZDJPHV3V3p9+N701NX3leZ0\nbh08rnyd2wIDBSxxSyU+B+NemvVmFymIGjifz6pBA4SXa5M4esowRBskRDPQ5NHcKDj0E0M1\nNSljqHyita04pO2t/caaH/+Xc/77szWnk4bGdpEA5qxRFsQnMlzbc9qlk1eOPm01JghZ1edE\n13YgY+esE2fDbbFwRnzVlhE9iW9dqKHrjQrawx0zbKPqZxmamX9LPYNRKh3KL4YMon4QLSvU\nFpULB6ouFJJJtylv2G0xffX8oRAHh84vWdw+WNs=\n-----END CERTIFICATE-----\n",
  "COMODO ECC Certification Authority": "-----BEGIN CERTIFICATE-----\nMIICiTCCAg+gAwIBAgIQH0evqmIAcFBUTAGem2OZKjAKBggqhkjOPQQDAzCBhTELMAkGA1UE\nBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBxMHU2FsZm9yZDEa\nMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxKzApBgNVBAMTIkNPTU9ETyBFQ0MgQ2VydGlm\naWNhdGlvbiBBdXRob3JpdHkwHhcNMDgwMzA2MDAwMDAwWhcNMzgwMTE4MjM1OTU5WjCBhTEL\nMAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBxMHU2Fs\nZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxKzApBgNVBAMTIkNPTU9ETyBFQ0Mg\nQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQDR3svdcmC\nFYX7deSRFtSrYpn1PlILBs5BAH+X4QokPB0BBO490o0JlwzgdeT6+3eKKvUDYEs2ixYjFq0J\ncfRK9ChQtP6IHG4/bC8vCVlbpVsLM5niwz2J+Wos77LTBumjQjBAMB0GA1UdDgQWBBR1cacZ\nSBm8nZ3qQUfflMRId5nTeTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAKBggq\nhkjOPQQDAwNoADBlAjEA7wNbeqy3eApyt4jf/7VGFAkK+qDmfQjGGoe9GKhzvSbKYAydzpmf\nz1wPMOG+FDHqAjAU9JM8SaczepBGR7NjfRObTrdvGDeAU/7dIOA1mjbRxwG55tzd8/8dLDoW\nV9mSOdY=\n-----END CERTIFICATE-----\n",
  "IGC/A": "-----BEGIN CERTIFICATE-----\nMIIEAjCCAuqgAwIBAgIFORFFEJQwDQYJKoZIhvcNAQEFBQAwgYUxCzAJBgNVBAYTAkZSMQ8w\nDQYDVQQIEwZGcmFuY2UxDjAMBgNVBAcTBVBhcmlzMRAwDgYDVQQKEwdQTS9TR0ROMQ4wDAYD\nVQQLEwVEQ1NTSTEOMAwGA1UEAxMFSUdDL0ExIzAhBgkqhkiG9w0BCQEWFGlnY2FAc2dkbi5w\nbS5nb3V2LmZyMB4XDTAyMTIxMzE0MjkyM1oXDTIwMTAxNzE0MjkyMlowgYUxCzAJBgNVBAYT\nAkZSMQ8wDQYDVQQIEwZGcmFuY2UxDjAMBgNVBAcTBVBhcmlzMRAwDgYDVQQKEwdQTS9TR0RO\nMQ4wDAYDVQQLEwVEQ1NTSTEOMAwGA1UEAxMFSUdDL0ExIzAhBgkqhkiG9w0BCQEWFGlnY2FA\nc2dkbi5wbS5nb3V2LmZyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsh/R0GLF\nMzvABIaIs9z4iPf930Pfeo2aSVz2TqrMHLmh6yeJ8kbpO0px1R2OLc/mratjUMdUC24SyZA2\nxtgv2pGqaMVy/hcKshd+ebUyiHDKcMCWSo7kVc0dJ5S/znIq7Fz5cyD+vfcuiWe4u0dzEvfR\nNWk68gq5rv9GQkaiv6GFGvm/5P9JhfejcIYyHF2fYPepraX/z9E0+X1bF8bc1g4oa8Ld8fUz\naJ1O/Id8NhLWo4DoQw1VYZTqZDdH6nfK0LJYBcNdfrGoRpAxVs5wKpayMLh35nnAvSk7/ZR3\nTL0gzUEl4C7HG7vupARB0l2tEmqKm0f7yd1GQOGdPDPQtQIDAQABo3cwdTAPBgNVHRMBAf8E\nBTADAQH/MAsGA1UdDwQEAwIBRjAVBgNVHSAEDjAMMAoGCCqBegF5AQEBMB0GA1UdDgQWBBSj\nBS8YYFDCiQrdKyFP/45OqDAxNjAfBgNVHSMEGDAWgBSjBS8YYFDCiQrdKyFP/45OqDAxNjAN\nBgkqhkiG9w0BAQUFAAOCAQEABdwm2Pp3FURo/C9mOnTgXeQp/wYHE4RKq89toB9RlPhJy3Q2\nFLwV3duJL92PoF189RLrn544pEfMs5bZvpwlqwN+Mw+VgQ39FuCIvjfwbF3QMZsyK10XZZOY\nYLxuj7GoPB7ZHPOpJkL5ZB3C55L29B5aqhlSXa/oovdgoPaN8In1buAKBQGVyYsgCrpa/Jos\nPL3Dt8ldeCUFP1YUmwza+zpI/pdpXsoQhvdOlgQITeywvl3cO45Pwf2aNjSaTFR+FwNIlQgR\nHAdvhQh+XU3Endv7rs6y0bO4g2wdsrN58dhwmX7wEwLOXt1R0982gaEbeC9xs/FZTEYYKKuF\n0mBWWg==\n-----END CERTIFICATE-----\n",
  "Security Communication EV RootCA1": "-----BEGIN CERTIFICATE-----\nMIIDfTCCAmWgAwIBAgIBADANBgkqhkiG9w0BAQUFADBgMQswCQYDVQQGEwJKUDElMCMGA1UE\nChMcU0VDT00gVHJ1c3QgU3lzdGVtcyBDTy4sTFRELjEqMCgGA1UECxMhU2VjdXJpdHkgQ29t\nbXVuaWNhdGlvbiBFViBSb290Q0ExMB4XDTA3MDYwNjAyMTIzMloXDTM3MDYwNjAyMTIzMlow\nYDELMAkGA1UEBhMCSlAxJTAjBgNVBAoTHFNFQ09NIFRydXN0IFN5c3RlbXMgQ08uLExURC4x\nKjAoBgNVBAsTIVNlY3VyaXR5IENvbW11bmljYXRpb24gRVYgUm9vdENBMTCCASIwDQYJKoZI\nhvcNAQEBBQADggEPADCCAQoCggEBALx/7FebJOD+nLpCeamIivqA4PUHKUPqjgo0No0c+qe1\nOXj/l3X3L+SqawSERMqm4miO/VVQYg+kcQ7OBzgtQoVQrTyWb4vVog7P3kmJPdZkLjjlHmy1\nV4qe70gOzXppFodEtZDkBp2uoQSXWHnvIEqCa4wiv+wfD+mEce3xDuS4GBPMVjZd0ZoeUWs5\nbmB2iDQL87PRsJ3KYeJkHcFGB7hj3R4zZbOOCVVSPbW9/wfrrWFVGCypaZhKqkDFMxRldAD5\nkd6vA0jFQFTcD4SQaCDFkpbcLuUCRarAX1T4bepJz11sS6/vmsJWXMY1VkJqMF/Cq/biPT+z\nyRGPMUzXn0kCAwEAAaNCMEAwHQYDVR0OBBYEFDVK9U2vP9eCOKyrcWUXdYydVZPmMA4GA1Ud\nDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBBQUAA4IBAQCoh+ns+EBn\nXcPBZsdAS5f8hxOQWsTvoMpfi7ent/HWtWS3irO4G8za+6xmiEHO6Pzk2x6Ipu0nUBsCMCRG\nef4Eh3CXQHPRwMFXGZpppSeZq51ihPZRwSzJIxXYKLerJRO1RuGGAv8mjMSIkh1W/hln8lXk\ngKNrnKt34VFxDSDbEJrbvXZ5B3eZKK2aXtqxT0QsNY6llsf9g/BYxnnWmHyojf6GPgcWkuF7\n5x3sM3Z+Qi5KhfmRiWiEA4Glm5q+4zfFVKtWOxgtQaQM+ELbmaDgcm+7XeEWT1MKZPlO9L9O\nVL14bIjqv5wTJMJwaaJ/D8g8rQjJsJhAoyrniIPtd490\n-----END CERTIFICATE-----\n",
  "OISTE WISeKey Global Root GA CA": "-----BEGIN CERTIFICATE-----\nMIID8TCCAtmgAwIBAgIQQT1yx/RrH4FDffHSKFTfmjANBgkqhkiG9w0BAQUFADCBijELMAkG\nA1UEBhMCQ0gxEDAOBgNVBAoTB1dJU2VLZXkxGzAZBgNVBAsTEkNvcHlyaWdodCAoYykgMjAw\nNTEiMCAGA1UECxMZT0lTVEUgRm91bmRhdGlvbiBFbmRvcnNlZDEoMCYGA1UEAxMfT0lTVEUg\nV0lTZUtleSBHbG9iYWwgUm9vdCBHQSBDQTAeFw0wNTEyMTExNjAzNDRaFw0zNzEyMTExNjA5\nNTFaMIGKMQswCQYDVQQGEwJDSDEQMA4GA1UEChMHV0lTZUtleTEbMBkGA1UECxMSQ29weXJp\nZ2h0IChjKSAyMDA1MSIwIAYDVQQLExlPSVNURSBGb3VuZGF0aW9uIEVuZG9yc2VkMSgwJgYD\nVQQDEx9PSVNURSBXSVNlS2V5IEdsb2JhbCBSb290IEdBIENBMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAy0+zAJs9Nt350UlqaxBJH+zYK7LG+DKBKUOVTJoZIyEVRd7jyBxR\nVVuuk+g3/ytr6dTqvirdqFEr12bDYVxgAsj1znJ7O7jyTmUIms2kahnBAbtzptf2w93NvKSL\ntZlhuAGio9RN1AU9ka34tAhxZK9w8RxrfvbDd50kc3vkDIzh2TbhmYsFmQvtRTEJysIA2/dy\noJaqlYfQjse2YXMNdmaM3Bu0Y6Kff5MTMPGhJ9vZ/yxViJGg4E8HsChWjBgbl0SOid3gF27n\nKu+POQoxhILYQBRJLnpB5Kf+42TMwVlxSywhp1t94B3RLoGbw9ho972WG6xwsRYUC9tguSYB\nBQIDAQABo1EwTzALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUswN+\nrja8sHnR3JQmthG+IbJphpQwEAYJKwYBBAGCNxUBBAMCAQAwDQYJKoZIhvcNAQEFBQADggEB\nAEuh/wuHbrP5wUOxSPMowB0uyQlB+pQAHKSkq0lPjz0e701vvbyk9vImMMkQyh2I+3QZH4VF\nvbBsUfk2ftv1TDI6QU9bR8/oCy22xBmddMVHxjtqD6wU2zz0c5ypBd8A3HR4+vg1YFkCExh8\nvPtNsCBtQ7tgMHpnM1zFmdH4LTlSc/uMqpclXHLZCB6rTjzjgTGfA6b7wP4piFXahNVQA7bi\nhKOmNqoROgHhGEvWRGizPflTdISzRpFGlgC3gCy24eMQ4tui5yiPAZZiFj4A4xylNoEYokxS\ndsARo27mHbrjWr42U8U+dY+GaSlYU7Wcu2+fXMUY7N0v4ZjJ/L7fCg0=\n-----END CERTIFICATE-----\n",
  "Microsec e-Szigno Root CA": "-----BEGIN CERTIFICATE-----\nMIIHqDCCBpCgAwIBAgIRAMy4579OKRr9otxmpRwsDxEwDQYJKoZIhvcNAQEFBQAwcjELMAkG\nA1UEBhMCSFUxETAPBgNVBAcTCEJ1ZGFwZXN0MRYwFAYDVQQKEw1NaWNyb3NlYyBMdGQuMRQw\nEgYDVQQLEwtlLVN6aWdubyBDQTEiMCAGA1UEAxMZTWljcm9zZWMgZS1Temlnbm8gUm9vdCBD\nQTAeFw0wNTA0MDYxMjI4NDRaFw0xNzA0MDYxMjI4NDRaMHIxCzAJBgNVBAYTAkhVMREwDwYD\nVQQHEwhCdWRhcGVzdDEWMBQGA1UEChMNTWljcm9zZWMgTHRkLjEUMBIGA1UECxMLZS1Temln\nbm8gQ0ExIjAgBgNVBAMTGU1pY3Jvc2VjIGUtU3ppZ25vIFJvb3QgQ0EwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDtyADVgXvNOABHzNuEwSFpLHSQDCHZU4ftPkNEU6+r+ICb\nPHiN1I2uuO/TEdyB5s87lozWbxXGd36hL+BfkrYn13aaHUM86tnsL+4582pnS4uCzyL4ZVX+\nLMsvfUh6PXX5qqAnu3jCBspRwn5mS6/NoqdNAoI/gqyFxuEPkEeZlApxcpMqyabAvjxWTHOS\nJ/FrtfX9/DAFYJLG65Z+AZHCabEeHXtTRbjcQR/Ji3HWVBTji1R4P770Yjtb9aPs1ZJ04nQw\n7wHb4dSrmZsqa/i9phyGI0Jf7Enemotb9HI6QMVJPqW+jqpx62z69Rrkav17fVVA71hu5tnV\nvCSrwe+3AgMBAAGjggQ3MIIEMzBnBggrBgEFBQcBAQRbMFkwKAYIKwYBBQUHMAGGHGh0dHBz\nOi8vcmNhLmUtc3ppZ25vLmh1L29jc3AwLQYIKwYBBQUHMAKGIWh0dHA6Ly93d3cuZS1zemln\nbm8uaHUvUm9vdENBLmNydDAPBgNVHRMBAf8EBTADAQH/MIIBcwYDVR0gBIIBajCCAWYwggFi\nBgwrBgEEAYGoGAIBAQEwggFQMCgGCCsGAQUFBwIBFhxodHRwOi8vd3d3LmUtc3ppZ25vLmh1\nL1NaU1ovMIIBIgYIKwYBBQUHAgIwggEUHoIBEABBACAAdABhAG4A+gBzAO0AdAB2AOEAbgB5\nACAA6QByAHQAZQBsAG0AZQB6AOkAcwDpAGgAZQB6ACAA6QBzACAAZQBsAGYAbwBnAGEAZADh\nAHMA4QBoAG8AegAgAGEAIABTAHoAbwBsAGcA4QBsAHQAYQB0APMAIABTAHoAbwBsAGcA4QBs\nAHQAYQB0AOEAcwBpACAAUwB6AGEAYgDhAGwAeQB6AGEAdABhACAAcwB6AGUAcgBpAG4AdAAg\nAGsAZQBsAGwAIABlAGwAagDhAHIAbgBpADoAIABoAHQAdABwADoALwAvAHcAdwB3AC4AZQAt\nAHMAegBpAGcAbgBvAC4AaAB1AC8AUwBaAFMAWgAvMIHIBgNVHR8EgcAwgb0wgbqggbeggbSG\nIWh0dHA6Ly93d3cuZS1zemlnbm8uaHUvUm9vdENBLmNybIaBjmxkYXA6Ly9sZGFwLmUtc3pp\nZ25vLmh1L0NOPU1pY3Jvc2VjJTIwZS1Temlnbm8lMjBSb290JTIwQ0EsT1U9ZS1Temlnbm8l\nMjBDQSxPPU1pY3Jvc2VjJTIwTHRkLixMPUJ1ZGFwZXN0LEM9SFU/Y2VydGlmaWNhdGVSZXZv\nY2F0aW9uTGlzdDtiaW5hcnkwDgYDVR0PAQH/BAQDAgEGMIGWBgNVHREEgY4wgYuBEGluZm9A\nZS1zemlnbm8uaHWkdzB1MSMwIQYDVQQDDBpNaWNyb3NlYyBlLVN6aWduw7MgUm9vdCBDQTEW\nMBQGA1UECwwNZS1TemlnbsOzIEhTWjEWMBQGA1UEChMNTWljcm9zZWMgS2Z0LjERMA8GA1UE\nBxMIQnVkYXBlc3QxCzAJBgNVBAYTAkhVMIGsBgNVHSMEgaQwgaGAFMegSXUWYYTbMUuE0vE3\nQJDvTtz3oXakdDByMQswCQYDVQQGEwJIVTERMA8GA1UEBxMIQnVkYXBlc3QxFjAUBgNVBAoT\nDU1pY3Jvc2VjIEx0ZC4xFDASBgNVBAsTC2UtU3ppZ25vIENBMSIwIAYDVQQDExlNaWNyb3Nl\nYyBlLVN6aWdubyBSb290IENBghEAzLjnv04pGv2i3GalHCwPETAdBgNVHQ4EFgQUx6BJdRZh\nhNsxS4TS8TdAkO9O3PcwDQYJKoZIhvcNAQEFBQADggEBANMTnGZjWS7KXHAM/IO8VbH0jgds\nZifOwTsgqRy7RlRw7lrMoHfqaEQn6/Ip3Xep1fvj1KcExJW4C+FEaGAHQzAxQmHl7tnlJNUb\n3+FKG6qfx1/4ehHqE5MAyopYse7tDk2016g2JnzgOsHVV4Lxdbb9iV/a86g4nzUGCM4ilb7N\n1fy+W955a9x6qWVmvrElWl/tftOsRm1M9DKHtCAE4Gx4sHfRhUZLphK3dehKyVZs15KrnfVJ\nONJPU+NVkBHbmJbGSfI+9J8b4PeI3CVimUTYc78/MPMMNz7UwiiAc7EBt51alhQBS6kRnSlq\nLtBdgcDPsiBDxwPgN05dCtxZICU=\n-----END CERTIFICATE-----\n",
  "Certigna": "-----BEGIN CERTIFICATE-----\nMIIDqDCCApCgAwIBAgIJAP7c4wEPyUj/MA0GCSqGSIb3DQEBBQUAMDQxCzAJBgNVBAYTAkZS\nMRIwEAYDVQQKDAlEaGlteW90aXMxETAPBgNVBAMMCENlcnRpZ25hMB4XDTA3MDYyOTE1MTMw\nNVoXDTI3MDYyOTE1MTMwNVowNDELMAkGA1UEBhMCRlIxEjAQBgNVBAoMCURoaW15b3RpczER\nMA8GA1UEAwwIQ2VydGlnbmEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIaPHJ\n1tazNHUmgh7stL7qXOEm7RFHYeGifBZ4QCHkYJ5ayGPhxLGWkv8YbWkj4Sti993iNi+RB7lI\nzw7sebYs5zRLcAglozyHGxnygQcPOJAZ0xH+hrTy0V4eHpbNgGzOOzGTtvKg0KmVEn2lmsxr\nyIRWijOp5yIVUxbwzBfsV1/pogqYCd7jX5xv3EjjhQsVWqa6n6xI4wmy9/Qy3l40vhx4XUJb\nzg4ij02Q130yGLMLLGq/jj8UEYkgDncUtT2UCIf3JR7VsmAA7G8qKCVuKj4YYxclPz5EIBb2\nJsglrgVKtOdjLPOMFlN+XPsRGgjBRmKfIrjxwo1p3Po6WAbfAgMBAAGjgbwwgbkwDwYDVR0T\nAQH/BAUwAwEB/zAdBgNVHQ4EFgQUGu3+QTmQtCRZvgHyUtVF9lo53BEwZAYDVR0jBF0wW4AU\nGu3+QTmQtCRZvgHyUtVF9lo53BGhOKQ2MDQxCzAJBgNVBAYTAkZSMRIwEAYDVQQKDAlEaGlt\neW90aXMxETAPBgNVBAMMCENlcnRpZ25hggkA/tzjAQ/JSP8wDgYDVR0PAQH/BAQDAgEGMBEG\nCWCGSAGG+EIBAQQEAwIABzANBgkqhkiG9w0BAQUFAAOCAQEAhQMeknH2Qq/ho2Ge6/PAD/Kl\n1NqV5ta+aDY9fm4fTIrv0Q8hbV6lUmPOEvjvKtpv6zf+EwLHyzs+ImvaYS5/1HI93TDhHkxA\nGYwP15zRgzB7mFncfca5DClMoTOi62c6ZYTTluLtdkVwj7Ur3vkj1kluPBS1xp81HlDQwY9q\ncEQCYsuuHWhBp6pX6FOqB9IG9tUUBguRA3UsbHK1YZWaDYu5Def131TN3ubY1gkIl2PlwS6w\nt0QmwCbAr1UwnjvVNioZBPRcHv/PLLf/0P2HQBHVESO7SMAhqaQoLf0V+LBOK/QwWyH8EZE0\nvkHve52Xdf+XlcCWWC/qu0bXu+TZLg==\n-----END CERTIFICATE-----\n",
  "AC RaÃ­z CerticÃ¡mara S.A.": "-----BEGIN CERTIFICATE-----\nMIIGZjCCBE6gAwIBAgIPB35Sk3vgFeNX8GmMy+wMMA0GCSqGSIb3DQEBBQUAMHsxCzAJBgNV\nBAYTAkNPMUcwRQYDVQQKDD5Tb2NpZWRhZCBDYW1lcmFsIGRlIENlcnRpZmljYWNpw7NuIERp\nZ2l0YWwgLSBDZXJ0aWPDoW1hcmEgUy5BLjEjMCEGA1UEAwwaQUMgUmHDrXogQ2VydGljw6Ft\nYXJhIFMuQS4wHhcNMDYxMTI3MjA0NjI5WhcNMzAwNDAyMjE0MjAyWjB7MQswCQYDVQQGEwJD\nTzFHMEUGA1UECgw+U29jaWVkYWQgQ2FtZXJhbCBkZSBDZXJ0aWZpY2FjacOzbiBEaWdpdGFs\nIC0gQ2VydGljw6FtYXJhIFMuQS4xIzAhBgNVBAMMGkFDIFJhw616IENlcnRpY8OhbWFyYSBT\nLkEuMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAq2uJo1PMSCMI+8PPUZYILrgI\nem08kBeGqentLhM0R7LQcNzJPNCNyu5LF6vQhbCnIwTLqKL85XXbQMpiiY9QngE9JlsYhBzL\nfDe3fezTf3MZsGqy2IiKLUV0qPezuMDU2s0iiXRNWhU5cxh0T7XrmafBHoi0wpOQY5fzp6cS\nsgkiBzPZkc0OnB8OIMfuuzONj8LSWKdf/WU34ojC2I+GdV75LaeHM/J4Ny+LvB2GNzmxlPLY\nvEqcgxhaBvzz1NS6jBUJJfD5to0EfhcSM2tXSExP2yYe68yQ54v5aHxwD6Mq0Do43zeX4lve\ngGHTgNiRg0JaTASJaBE8rF9ogEHMYELODVoqDA+bMMCm8Ibbq0nXl21Ii/kDwFJnmxL3wvIu\nmGVC2daa49AZMQyth9VXAnow6IYm+48jilSH5L887uvDdUhfHjlvgWJsxS3EF1QZtzeNnDeR\nyPYL1epjb4OsOMLzP96a++EjYfDIJss2yKHzMI+ko6Kh3VOz3vCaMh+DkXkwwakfU5tTohVT\nP92dsxA7SH2JD/ztA/X7JWR1DhcZDY8AFmd5ekD8LVkH2ZD6mq093ICK5lw1omdMEWux+IBk\nAC1vImHFrEsm5VoQgpukg3s0956JkSCXjrdCx2bD0Omk1vUgjcTDlaxECp1bczwmPS9KvqfJ\npxAe+59QafMCAwEAAaOB5jCB4zAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjAd\nBgNVHQ4EFgQU0QnQ6dfOeXRU+Tows/RtLAMDG2gwgaAGA1UdIASBmDCBlTCBkgYEVR0gADCB\niTArBggrBgEFBQcCARYfaHR0cDovL3d3dy5jZXJ0aWNhbWFyYS5jb20vZHBjLzBaBggrBgEF\nBQcCAjBOGkxMaW1pdGFjaW9uZXMgZGUgZ2FyYW507WFzIGRlIGVzdGUgY2VydGlmaWNhZG8g\nc2UgcHVlZGVuIGVuY29udHJhciBlbiBsYSBEUEMuMA0GCSqGSIb3DQEBBQUAA4ICAQBclLW4\nRZFNjmEfAygPU3zmpFmps4p6xbD/CHwso3EcIRNnoZUSQDWDg4902zNc8El2CoFS3UnUmjIz\n75uny3XlesuXEpBcunvFm9+7OSPI/5jOCk0iAUgHforA1SBClETvv3eiiWdIG0ADBaGJ7M9i\n4z0ldma/Jre7Ir5v/zlXdLp6yQGVwZVR6Kss+LGGIOk/yzVb0hfpKv6DExdA7ohiZVvVO2Dp\nezy4ydV/NgIlqmjCMRW3MGXrfx1IebHPOeJCgBbT9ZMj/EyXyVo3bHwi2ErN0o42gzmRkBDI\n8ck1fj+404HGIGQatlDCIaR43NAvO2STdPCWkPHv+wlaNECW8DYSwaN0jJN+Qd53i+yG2dIP\nPy3RzECiiWZIHiCznCNZc6lEc7wkeZBWN7PGKX6jD/EpOe9+XCgycDWs2rjIdWb8m0w5R44b\nb5tNAlQiM+9hup4phO9OSzNHdpdqy35f/RWmnkJDW2ZaiogN9xa5P1FlK2Zqi9E4UqLWRhH6\n/JocdJ6PlwsCT2TG9WjTSy3/pDceiz+/RL5hRqGEPQgnTIEgd4kI6mdAXmwIUV80WoyWaM3X\n94nCHNMyAK9Sy9NgWyo6R35rMDOhYil/SrnhLecUIw4OGEfhefwVVdCx/CVxY3UzHCMrr1zZ\n7Ud3YA47Dx7SwNxkBYn8eNZcLCZDqQ==\n-----END CERTIFICATE-----\n",
  "TC TrustCenter Class 2 CA II": "-----BEGIN CERTIFICATE-----\nMIIEqjCCA5KgAwIBAgIOLmoAAQACH9dSISwRXDswDQYJKoZIhvcNAQEFBQAwdjELMAkGA1UE\nBhMCREUxHDAaBgNVBAoTE1RDIFRydXN0Q2VudGVyIEdtYkgxIjAgBgNVBAsTGVRDIFRydXN0\nQ2VudGVyIENsYXNzIDIgQ0ExJTAjBgNVBAMTHFRDIFRydXN0Q2VudGVyIENsYXNzIDIgQ0Eg\nSUkwHhcNMDYwMTEyMTQzODQzWhcNMjUxMjMxMjI1OTU5WjB2MQswCQYDVQQGEwJERTEcMBoG\nA1UEChMTVEMgVHJ1c3RDZW50ZXIgR21iSDEiMCAGA1UECxMZVEMgVHJ1c3RDZW50ZXIgQ2xh\nc3MgMiBDQTElMCMGA1UEAxMcVEMgVHJ1c3RDZW50ZXIgQ2xhc3MgMiBDQSBJSTCCASIwDQYJ\nKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKuAh5uO8MN8h9foJIIRszzdQ2Lu+MNF2ujhoF/R\nKrLqk2jftMjWQ+nEdVl//OEd+DFwIxuInie5e/060smp6RQvkL4DUsFJzfb95AhmC1eKokKg\nuNV/aVyQMrKXDcpK3EY+AlWJU+MaWss2xgdW94zPEfRMuzBwBJWl9jmM/XOBCH2JXjIeIqki\nRUuwZi4wzJ9l/fzLganx4Duvo4bRierERXlQXa7pIXSSTYtZgo+U4+lK8edJsBTj9WLL1XK9\nH7nSn6DNqPoByNkN39r8R52zyFTfSUrxIan+GE7uSNQZu+995OKdy1u2bv/jzVrndIIFuoAl\nOMvkaZ6vQaoahPUCAwEAAaOCATQwggEwMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQD\nAgEGMB0GA1UdDgQWBBTjq1RMgKHbVkO3kUrL84J6E1wIqzCB7QYDVR0fBIHlMIHiMIHfoIHc\noIHZhjVodHRwOi8vd3d3LnRydXN0Y2VudGVyLmRlL2NybC92Mi90Y19jbGFzc18yX2NhX0lJ\nLmNybIaBn2xkYXA6Ly93d3cudHJ1c3RjZW50ZXIuZGUvQ049VEMlMjBUcnVzdENlbnRlciUy\nMENsYXNzJTIwMiUyMENBJTIwSUksTz1UQyUyMFRydXN0Q2VudGVyJTIwR21iSCxPVT1yb290\nY2VydHMsREM9dHJ1c3RjZW50ZXIsREM9ZGU/Y2VydGlmaWNhdGVSZXZvY2F0aW9uTGlzdD9i\nYXNlPzANBgkqhkiG9w0BAQUFAAOCAQEAjNfffu4bgBCzg/XbEeprS6iSGNn3Bzn1LL4GdXpo\nUxUc6krtXvwjshOg0wn/9vYua0Fxec3ibf2uWWuFHbhOIprtZjluS5TmVfwLG4t3wVMTZonZ\nKNaL80VKY7f9ewthXbhtvsPcW3nS7Yblok2+XnR8au0WOB9/WIFaGusyiC2y8zl3gK9etmF1\nKdsjTYjKUCjLhdLTEKJZbtOTVAB6okaVhgWcqRmY5TFyDADiZ9lA4CQze28suVyrZZ0srHbq\nNZn1l7kPJOzHdiEoZa5X6AeIdUpWoNIFOqTmjZKILPPy4cHGYdtBxceb9w4aUUXCYWvcZCcX\njFq32nQozZfkvQ==\n-----END CERTIFICATE-----\n",
  "TC TrustCenter Class 3 CA II": "-----BEGIN CERTIFICATE-----\nMIIEqjCCA5KgAwIBAgIOSkcAAQAC5aBd1j8AUb8wDQYJKoZIhvcNAQEFBQAwdjELMAkGA1UE\nBhMCREUxHDAaBgNVBAoTE1RDIFRydXN0Q2VudGVyIEdtYkgxIjAgBgNVBAsTGVRDIFRydXN0\nQ2VudGVyIENsYXNzIDMgQ0ExJTAjBgNVBAMTHFRDIFRydXN0Q2VudGVyIENsYXNzIDMgQ0Eg\nSUkwHhcNMDYwMTEyMTQ0MTU3WhcNMjUxMjMxMjI1OTU5WjB2MQswCQYDVQQGEwJERTEcMBoG\nA1UEChMTVEMgVHJ1c3RDZW50ZXIgR21iSDEiMCAGA1UECxMZVEMgVHJ1c3RDZW50ZXIgQ2xh\nc3MgMyBDQTElMCMGA1UEAxMcVEMgVHJ1c3RDZW50ZXIgQ2xhc3MgMyBDQSBJSTCCASIwDQYJ\nKoZIhvcNAQEBBQADggEPADCCAQoCggEBALTgu1G7OVyLBMVMeRwjhjEQY0NVJz/GRcekPewJ\nDRoeIMJWHt4bNwcwIi9v8Qbxq63WyKthoy9DxLCyLfzDlml7forkzMA5EpBCYMnMNWju2l+Q\nVl/NHE1bWEnrDgFPZPosPIlY2C8u4rBo6SI7dYnWRBpl8huXJh0obazovVkdKyT21oQDZogk\nAHhg8fir/gKya/si+zXmFtGt9i4S5Po1auUZuV3bOx4a+9P/FRQI2AlqukWdFHlgfa9Aigdz\ns5OW03Q0jTo3Kd5c7PXuLjHCINy+8U9/I1LZW+Jk2ZyqBwi1Rb3R0DHBq1SfqdLDYmAD8bs5\nSpJKPQq5ncWg/jcCAwEAAaOCATQwggEwMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQD\nAgEGMB0GA1UdDgQWBBTUovyfs8PYA9NXXAek0CSnwPIA1DCB7QYDVR0fBIHlMIHiMIHfoIHc\noIHZhjVodHRwOi8vd3d3LnRydXN0Y2VudGVyLmRlL2NybC92Mi90Y19jbGFzc18zX2NhX0lJ\nLmNybIaBn2xkYXA6Ly93d3cudHJ1c3RjZW50ZXIuZGUvQ049VEMlMjBUcnVzdENlbnRlciUy\nMENsYXNzJTIwMyUyMENBJTIwSUksTz1UQyUyMFRydXN0Q2VudGVyJTIwR21iSCxPVT1yb290\nY2VydHMsREM9dHJ1c3RjZW50ZXIsREM9ZGU/Y2VydGlmaWNhdGVSZXZvY2F0aW9uTGlzdD9i\nYXNlPzANBgkqhkiG9w0BAQUFAAOCAQEANmDkcPcGIEPZIxpC8vijsrlNirTzwppVMXzEO2ea\ntN9NDoqTSheLG43KieHPOh6sHfGcMrSOWXaiQYUlN6AT0PV8TtXqluJucsG7Kv5sbviRmEb8\nyRtXW+rIGjs/sFGYPAfaLFkB2otE6OF0/ado3VS6g0bsyEa1+K+XwDsJHI/OcpY9M1ZwvJbL\n2NV9IJqDnxrcOfHFcqMRA/07QlIp2+gB95tejNaNhk4Z+rwcvsUhpYeeeC422wlxo3I0+Gzj\nBgnyXlal092Y+tTmBvTwtiBjS+opvaqCZh77gaqnN60TGOaSw4HBM7uIHqHn4rS9MWwOUT1v\n+5ZWgOI2F9Hc5A==\n-----END CERTIFICATE-----\n",
  "TC TrustCenter Universal CA I": "-----BEGIN CERTIFICATE-----\nMIID3TCCAsWgAwIBAgIOHaIAAQAC7LdggHiNtgYwDQYJKoZIhvcNAQEFBQAweTELMAkGA1UE\nBhMCREUxHDAaBgNVBAoTE1RDIFRydXN0Q2VudGVyIEdtYkgxJDAiBgNVBAsTG1RDIFRydXN0\nQ2VudGVyIFVuaXZlcnNhbCBDQTEmMCQGA1UEAxMdVEMgVHJ1c3RDZW50ZXIgVW5pdmVyc2Fs\nIENBIEkwHhcNMDYwMzIyMTU1NDI4WhcNMjUxMjMxMjI1OTU5WjB5MQswCQYDVQQGEwJERTEc\nMBoGA1UEChMTVEMgVHJ1c3RDZW50ZXIgR21iSDEkMCIGA1UECxMbVEMgVHJ1c3RDZW50ZXIg\nVW5pdmVyc2FsIENBMSYwJAYDVQQDEx1UQyBUcnVzdENlbnRlciBVbml2ZXJzYWwgQ0EgSTCC\nASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKR3I5ZEr5D0MacQ9CaHnPM42Q9e3s9B\n6DGtxnSRJJZ4Hgmgm5qVSkr1YnwCqMqs+1oEdjneX/H5s7/zA1hV0qq34wQi0fiU2iIIAI3T\nfCZdzHd55yx4Oagmcw6iXSVphU9VDprvxrlE4Vc93x9UIuVvZaozhDrzznq+VZeujRIPFDPi\nUHDDSYcTvFHe15gSWu86gzOSBnWLknwSaHtwag+1m7Z3W0hZneTvWq3zwZ7U10VOylY0Ibw+\nF1tvdwxIAUMpsN0/lm7mlaoMwCC2/T42J5zjXM9OgdwZu5GQfezmlwQek8wiSdeXhrYTCjxD\nI3d+8NzmzSQfO4ObNDqDNOMCAwEAAaNjMGEwHwYDVR0jBBgwFoAUkqR1LKSevoFE63n8isWV\npesQdXMwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAYYwHQYDVR0OBBYEFJKkdSyk\nnr6BROt5/IrFlaXrEHVzMA0GCSqGSIb3DQEBBQUAA4IBAQAo0uCG1eb4e/CX3CJrO5UUVg8R\nMKWaTzqwOuAGy2X17caXJ/4l8lfmXpWMPmRgFVp/Lw0BxbFg/UU1z/CyvwbZ71q+s2IhtNer\nNXxTPqYn8aEt2hojnczd7Dwtnic0XQ/CNnm8yUpiLe1r2X1BQ3y2qsrtYbE3ghUJGooWMNjs\nydZHcnhLEEYUjl8Or+zHL6sQ17bxbuyGssLoDZJz3KL0Dzq/YSMQiZxIQG5wALPTujdEWBF6\nAmqI8Dc08BnprNRlc/ZpjGSUOnmFKbAWKwyCPwacx/0QK54PLLae4xW/2TYcuiUaUj0a7CIM\nHOCkoj3w6DnPgcB77V0fb8XQC9eY\n-----END CERTIFICATE-----\n",
  "Deutsche Telekom Root CA 2": "-----BEGIN CERTIFICATE-----\nMIIDnzCCAoegAwIBAgIBJjANBgkqhkiG9w0BAQUFADBxMQswCQYDVQQGEwJERTEcMBoGA1UE\nChMTRGV1dHNjaGUgVGVsZWtvbSBBRzEfMB0GA1UECxMWVC1UZWxlU2VjIFRydXN0IENlbnRl\ncjEjMCEGA1UEAxMaRGV1dHNjaGUgVGVsZWtvbSBSb290IENBIDIwHhcNOTkwNzA5MTIxMTAw\nWhcNMTkwNzA5MjM1OTAwWjBxMQswCQYDVQQGEwJERTEcMBoGA1UEChMTRGV1dHNjaGUgVGVs\nZWtvbSBBRzEfMB0GA1UECxMWVC1UZWxlU2VjIFRydXN0IENlbnRlcjEjMCEGA1UEAxMaRGV1\ndHNjaGUgVGVsZWtvbSBSb290IENBIDIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB\nAQCrC6M14IspFLEUha88EOQ5bzVdSq7d6mGNlUn0b2SjGmBmpKlAIoTZ1KXleJMOaAGtuU1c\nOs7TuKhCQN/Po7qCWWqSG6wcmtoIKyUn+WkjR/Hg6yx6m/UTAtB+NHzCnjwAWav12gz1Mjwr\nrFDa1sPeg5TKqAyZMg4ISFZbavva4VhYAUlfckE8FQYBjl2tqriTtM2e66foai1SNNs671x1\nUdrb8zH57nGYMsRUFUQM+ZtV7a3fGAigo4aKSe5TBY8ZTNXeWHmb0mocQqvF1afPaA+W5OFh\nmHZhyJF81j4A4pFQh+GdCuatl9Idxjp9y7zaAzTVjlsB9WoHtxa2bkp/AgMBAAGjQjBAMB0G\nA1UdDgQWBBQxw3kbuvVT1xfgiXotF2wKsyudMzAPBgNVHRMECDAGAQH/AgEFMA4GA1UdDwEB\n/wQEAwIBBjANBgkqhkiG9w0BAQUFAAOCAQEAlGRZrTlk5ynrE/5aw4sTV8gEJPB0d8Bg42f7\n6Ymmg7+Wgnxu1MM9756AbrsptJh6sTtU6zkXR34ajgv8HzFZMQSyzhfzLMdiNlXiItiJVbSY\nSKpk+tYcNthEeFpaIzpXl/V6ME+un2pMSyuOoAPjPuCp1NJ70rOo4nI8rZ7/gFnkm0W09juw\nzTkZmDLl6iFhkOQxIY40sfcvNUqFENrnijchvllj4PKFiDFT1FQUhXB59C4Gdyd1Lx+4ivn+\nxbrYNuSD7Odlt79jWvNGr4GUN9RBjNYj1h7P9WgbRGOiWrqnNVmh5XAFmw4jV5mUCm26OWMo\nhpLzGITY+9HPBVZkVw==\n-----END CERTIFICATE-----\n",
  "ComSign Secured CA": "-----BEGIN CERTIFICATE-----\nMIIDqzCCApOgAwIBAgIRAMcoRwmzuGxFjB36JPU2TukwDQYJKoZIhvcNAQEFBQAwPDEbMBkG\nA1UEAxMSQ29tU2lnbiBTZWN1cmVkIENBMRAwDgYDVQQKEwdDb21TaWduMQswCQYDVQQGEwJJ\nTDAeFw0wNDAzMjQxMTM3MjBaFw0yOTAzMTYxNTA0NTZaMDwxGzAZBgNVBAMTEkNvbVNpZ24g\nU2VjdXJlZCBDQTEQMA4GA1UEChMHQ29tU2lnbjELMAkGA1UEBhMCSUwwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDGtWhfHZQVw6QIVS3joFd67+l0Kru5fFdJGhFeTymHDEjW\naueP1H5XJLkGieQcPOqs49ohgHMhCu95mGwfCP+hUH3ymBvJVG8+pSjsIQQPRbsHPaHA+iqY\nHU4Gk/v1iDurX8sWv+bznkqH7Rnqwp9D5PGBpX8QTz7RSmKtUxvLg/8HZaWSLWapW7ha9B20\nIZFKF3ueMv5WJDmyVIRD9YTC2LxBkMyd1mja6YJQqTtoz7VdApRgFrFD2UNd3V2Hbuq7s8lr\n9gOUCXDeFhF6K+h2j0kQmHe5Y1yLM5d19guMsqtb3nQgJT/j8xH5h2iGNXHDHYwt6+UarA9z\n1YJZQIDTAgMBAAGjgacwgaQwDAYDVR0TBAUwAwEB/zBEBgNVHR8EPTA7MDmgN6A1hjNodHRw\nOi8vZmVkaXIuY29tc2lnbi5jby5pbC9jcmwvQ29tU2lnblNlY3VyZWRDQS5jcmwwDgYDVR0P\nAQH/BAQDAgGGMB8GA1UdIwQYMBaAFMFL7XC29z58ADsAj8c+DkWfHl3sMB0GA1UdDgQWBBTB\nS+1wtvc+fAA7AI/HPg5Fnx5d7DANBgkqhkiG9w0BAQUFAAOCAQEAFs/ukhNQq3sUnjO2QiBq\n1BW9Cav8cujvR3qQrFHBZE7piL1DRYHjZiM/EoZNGeQFsOY3wo3aBijJD4mkU6l1P7CW+6tM\nM1X5eCZGbxs2mPtCdsGCuY7e+0X5YxtiOzkGynd6qDwJz2w2PQ8KRUtpFhpFfTMDZflScZAm\nlaxMDPWLkz/MdXSFmLr/YnpNH4n+rr2UAJm/EaXc4HnFFgt9AmEd6oX5AhVP51qJThRv4zdL\nhfXBPGHg/QVBspJ/wx2g0K5SZGBrGMYmnNj1ZOQ2GmKfig8+/21OGVZOIJFsnzQzOjRXUDpv\ngV4GxvU+fE6OK85lBi5d0ipTdF7Tbieejw==\n-----END CERTIFICATE-----\n",
  "Cybertrust Global Root": "-----BEGIN CERTIFICATE-----\nMIIDoTCCAomgAwIBAgILBAAAAAABD4WqLUgwDQYJKoZIhvcNAQEFBQAwOzEYMBYGA1UEChMP\nQ3liZXJ0cnVzdCwgSW5jMR8wHQYDVQQDExZDeWJlcnRydXN0IEdsb2JhbCBSb290MB4XDTA2\nMTIxNTA4MDAwMFoXDTIxMTIxNTA4MDAwMFowOzEYMBYGA1UEChMPQ3liZXJ0cnVzdCwgSW5j\nMR8wHQYDVQQDExZDeWJlcnRydXN0IEdsb2JhbCBSb290MIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEA+Mi8vRRQZhP/8NN57CPytxrHjoXxEnOmGaoQ25yiZXRadz5RfVb23CO2\n1O1fWLE3TdVJDm71aofW0ozSJ8bi/zafmGWgE07GKmSb1ZASzxQG9Dvj1Ci+6A74q05IlG2O\nlTEQXO2iLb3VOm2yHLtgwEZLAfVJrn5GitB0jaEMAs7u/OePuGtm839EAL9mJRQr3RAwHQeW\nP032a7iPt3sMpTjr3kfb1V05/Iin89cqdPHoWqI7n1C6poxFNcJQZZXcY4Lv3b93TZxiyWNz\nFtApD0mpSPCzqrdsxacwOUBdrsTiXSZT8M4cIwhhqJQZugRiQOwfOHB3EgZxpzAYXSUnpQID\nAQABo4GlMIGiMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS2\nCHsNesysIEyGVjJez6tuhS1wVzA/BgNVHR8EODA2MDSgMqAwhi5odHRwOi8vd3d3Mi5wdWJs\naWMtdHJ1c3QuY29tL2NybC9jdC9jdHJvb3QuY3JsMB8GA1UdIwQYMBaAFLYIew16zKwgTIZW\nMl7Pq26FLXBXMA0GCSqGSIb3DQEBBQUAA4IBAQBW7wojoFROlZfJ+InaRcHUowAl9B8Tq7ej\nhVhpwjCt2BWKLePJzYFa+HMjWqd8BfP9IjsO0QbE2zZMcwSO5bAi5MXzLqXZI+O4Tkogp24C\nJJ8iYGd7ix1yCcUxXOl5n4BHPa2hCwcUPUf/A2kaDAtE52Mlp3+yybh2hO0j9n0Hq0V+09+z\nv+mKts2oomcrUtW3ZfA5TGOgkXmTUg9U3YO7n9GPp1Nzw8v/MOx8BLjYRB+TX3EJIrduPuoc\nA06dGiBh+4E37F78CkWr1+cXVdCg6mCbpvbjjFspwgZgFJ0tl0ypkxWdYcQBX0jWWL1WMRJO\nEcgh4LMRkWXbtKaIOM5V\n-----END CERTIFICATE-----\n",
  "ePKI Root Certification Authority": "-----BEGIN CERTIFICATE-----\nMIIFsDCCA5igAwIBAgIQFci9ZUdcr7iXAF7kBtK8nTANBgkqhkiG9w0BAQUFADBeMQswCQYD\nVQQGEwJUVzEjMCEGA1UECgwaQ2h1bmdod2EgVGVsZWNvbSBDby4sIEx0ZC4xKjAoBgNVBAsM\nIWVQS0kgUm9vdCBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTAeFw0wNDEyMjAwMjMxMjdaFw0z\nNDEyMjAwMjMxMjdaMF4xCzAJBgNVBAYTAlRXMSMwIQYDVQQKDBpDaHVuZ2h3YSBUZWxlY29t\nIENvLiwgTHRkLjEqMCgGA1UECwwhZVBLSSBSb290IENlcnRpZmljYXRpb24gQXV0aG9yaXR5\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA4SUP7o3biDN1Z82tH306Tm2d0y8U\n82N0ywEhajfqhFAHSyZbCUNsIZ5qyNUD9WBpj8zwIuQf5/dqIjG3LBXy4P4AakP/h2XGtRrB\np0xtInAhijHyl3SJCRImHJ7K2RKilTza6We/CKBk49ZCt0Xvl/T29de1ShUCWH2YWEtgvM3X\nDZoTM1PRYfl61dd4s5oz9wCGzh1NlDivqOx4UXCKXBCDUSH3ET00hl7lSM2XgYI1TBnsZfZr\nxQWh7kcT1rMhJ5QQCtkkO7q+RBNGMD+XPNjX12ruOzjjK9SXDrkb5wdJfzcq+Xd4z1TtW0ad\no4AOkUPB1ltfFLqfpo0kR0BZv3I4sjZsN/+Z0V0OWQqraffAsgRFelQArr5T9rXn4fg8ozHS\nqf4hUmTFpmfwdQcGlBSBVcYn5AGPF8Fqcde+S/uUWH1+ETOxQvdibBjWzwloPn9s9h6PYq2l\nY9sJpx8iQkEeb5mKPtf5P0B6ebClAZLSnT0IFaUQAS2zMnaolQ2zepr7BxB4EW/hj8e6DyUa\ndCrlHJhBmd8hh+iVBmoKs2pHdmX2Os+PYhcZewoozRrSgx4hxyy/vv9haLdnG7t4TY3OZ+Xk\nwY63I2binZB1NJipNiuKmpS5nezMirH4JYlcWrYvjB9teSSnUmjDhDXiZo1jDiVN1Rmy5nk3\npyKdVDECAwEAAaNqMGgwHQYDVR0OBBYEFB4M97Zn8uGSJglFwFU5Lnc/QkqiMAwGA1UdEwQF\nMAMBAf8wOQYEZyoHAAQxMC8wLQIBADAJBgUrDgMCGgUAMAcGBWcqAwAABBRFsMLHClZ87lt4\nDJX5GFPBphzYEDANBgkqhkiG9w0BAQUFAAOCAgEACbODU1kBPpVJufGBuvl2ICO1J2B01GqZ\nNF5sAFPZn/KmsSQHRGoqxqWOeBLoR9lYGxMqXnmbnwoqZ6YlPwZpVnPDimZI+ymBV3QGypzq\nKOg4ZyYr8dW1P2WT+DZdjo2NQCCHGervJ8A9tDkPJXtoUHRVnAxZfVo9QZQlUgjgRywVMRnV\nvwdVxrsStZf0X4OFunHB2WyBEXYKCrC/gpf36j36+uwtqSiUO1bd0lEursC9CBWMd1I0ltab\nrNMdjmEPNXubrjlpC2JgQCA2j6/7Nu4tCEoduL+bXPjqpRugc6bY+G7gMwRfaKonh+3ZwZCc\n7b3jajWvY9+rGNm65ulK6lCKD2GTHuItGeIwlDWSXQ62B68ZgI9HkFFLLk3dheLSClIKF5r8\nGrBQAuUBo2M3IUxExJtRmREOc5wGj1QupyheRDmHVi03vYVElOEMSyycw5KFNGHLD7ibSkNS\n/jQ6fbjpKdx2qcgw+BRxgMYeNkh0IkFch4LoGHGLQYlE535YW6i4jRPpp2zDR+2zGp1iro2C\n6pSe3VkQw63d4k3jMdXH7OjysP6SHhYKGvzZ8/gntsm+HbRsZJB/9OTEW9c3rkIO3aQab3yI\nVMUWbuF6aC74Or8NpDyJO3inTmODBCEIZ43ygknQW/2xzQ+DhNQ+IIX3Sj0rnP0qCglN6oH4\nEZw=\n-----END CERTIFICATE-----\n",
  "TÃBÄ°TAK UEKAE KÃ¶k Sertifika Hizmet SaÄlayÄ±cÄ±sÄ± - SÃ¼rÃ¼m 3": "-----BEGIN CERTIFICATE-----\nMIIFFzCCA/+gAwIBAgIBETANBgkqhkiG9w0BAQUFADCCASsxCzAJBgNVBAYTAlRSMRgwFgYD\nVQQHDA9HZWJ6ZSAtIEtvY2FlbGkxRzBFBgNVBAoMPlTDvHJraXllIEJpbGltc2VsIHZlIFRl\na25vbG9qaWsgQXJhxZ90xLFybWEgS3VydW11IC0gVMOcQsSwVEFLMUgwRgYDVQQLDD9VbHVz\nYWwgRWxla3Ryb25payB2ZSBLcmlwdG9sb2ppIEFyYcWfdMSxcm1hIEVuc3RpdMO8c8O8IC0g\nVUVLQUUxIzAhBgNVBAsMGkthbXUgU2VydGlmaWthc3lvbiBNZXJrZXppMUowSAYDVQQDDEFU\nw5xCxLBUQUsgVUVLQUUgS8O2ayBTZXJ0aWZpa2EgSGl6bWV0IFNhxJ9sYXnEsWPEsXPEsSAt\nIFPDvHLDvG0gMzAeFw0wNzA4MjQxMTM3MDdaFw0xNzA4MjExMTM3MDdaMIIBKzELMAkGA1UE\nBhMCVFIxGDAWBgNVBAcMD0dlYnplIC0gS29jYWVsaTFHMEUGA1UECgw+VMO8cmtpeWUgQmls\naW1zZWwgdmUgVGVrbm9sb2ppayBBcmHFn3TEsXJtYSBLdXJ1bXUgLSBUw5xCxLBUQUsxSDBG\nBgNVBAsMP1VsdXNhbCBFbGVrdHJvbmlrIHZlIEtyaXB0b2xvamkgQXJhxZ90xLFybWEgRW5z\ndGl0w7xzw7wgLSBVRUtBRTEjMCEGA1UECwwaS2FtdSBTZXJ0aWZpa2FzeW9uIE1lcmtlemkx\nSjBIBgNVBAMMQVTDnELEsFRBSyBVRUtBRSBLw7ZrIFNlcnRpZmlrYSBIaXptZXQgU2HEn2xh\necSxY8Sxc8SxIC0gU8O8csO8bSAzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nim1L/xCIOsP2fpTo6iBkcK4hgb46ezzb8R1Sf1n68yJMlaCQvEhOEav7t7WNeoMojCZG2E6V\nQIdhn8WebYGHV2yKO7Rm6sxA/OOqbLLLAdsyv9Lrhc+hDVXDWzhXcLh1xnnRFDDtG1hba+81\n8qEhTsXOfJlfbLm4IpNQp81McGq+agV/E5wrHur+R84EpW+sky58K5+eeROR6Oqeyjh1jmKw\nlZMq5d/pXpduIF9fhHpEORlAHLpVK/swsoHvhOPc7Jg4OQOFCKlUAwUp8MmPi+oLhmUZEdPp\nCSPeaJMDyTYcIW7OjGbxmTDY17PDHfiBLqi9ggtm/oLL4eAagsNAgQIDAQABo0IwQDAdBgNV\nHQ4EFgQUvYiHyY/2pAoLquvF/pEjnatKijIwDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQF\nMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAB18+kmPNOm3JpIWmgV050vQbTlswyb2zrgxvMTf\nvCr4N5EY3ATIZJkrGG2AA1nJrvhY0D7twyOfaTyGOBye79oneNGEN3GKPEs5z35FBtYt2IpN\neBLWrcLTy9LQQfMmNkqblWwM7uXRQydmwYj3erMgbOqwaSvHIOgMA8RBBZniP+Rr+KCGgceE\nxh/VS4ESshYhLBOhgLJeDEoTniDYYkCrkOpkSi+sDQESeUWoL4cZaMjihccwsnX5OD+ywJO0\na+IDRM5noN+J1q2MdqMTw5RhK2vZbMEHCiIHhWyFJEapvj+LeISCfiQMnf2BN+MlqO02TpUs\nyZyQ2uypQjyttgI=\n-----END CERTIFICATE-----\n",
  "Buypass Class 2 CA 1": "-----BEGIN CERTIFICATE-----\nMIIDUzCCAjugAwIBAgIBATANBgkqhkiG9w0BAQUFADBLMQswCQYDVQQGEwJOTzEdMBsGA1UE\nCgwUQnV5cGFzcyBBUy05ODMxNjMzMjcxHTAbBgNVBAMMFEJ1eXBhc3MgQ2xhc3MgMiBDQSAx\nMB4XDTA2MTAxMzEwMjUwOVoXDTE2MTAxMzEwMjUwOVowSzELMAkGA1UEBhMCTk8xHTAbBgNV\nBAoMFEJ1eXBhc3MgQVMtOTgzMTYzMzI3MR0wGwYDVQQDDBRCdXlwYXNzIENsYXNzIDIgQ0Eg\nMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAIs8B0XY9t/mx8q6jUPFR42wWsE4\n25KEHK8T1A9vNkYgxC7McXA0ojTTNy7Y3Tp3L8DrKehc0rWpkTSHIln+zNvnma+WwajHQN2l\nFYxuyHyXA8vmIPLXl18xoS830r7uvqmtqEyeIWZDO6i88wmjONVZJMHCR3axiFyCO7srpgTX\njAePzdVBHfCuuCkslFJgNJQ72uA40Z0zPhX0kzLFANq1KWYOOngPIVJfAuWSeyXTkh4vFZ2B\n5J2O6O+JzhRMVB0cgRJNcKi+EAUXfh/RuFdV7c27UsKwHnjCTTZoy1YmwVLBvXb3WNVyfh9E\ndrsAiR0WnVE1703CVu9r4Iw7DekCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4E\nFgQUP42aWYv8e3uco684sDntkHGA1sgwDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBBQUA\nA4IBAQAVGn4TirnoB6NLJzKyQJHyIdFkhb5jatLPgcIV1Xp+DCmsNx4cfHZSldq1fyOhKXdl\nyTKdqC5Wq2B2zha0jX94wNWZUYN/Xtm+DKhQ7SLHrQVMdvvt7h5HZPb3J31cKA9FxVxiXqaa\nkZG3Uxcu3K1gnZZkOb1naLKuBctN518fV4bVIJwo+28TOPX2EZL2fZleHwzoq0QkKXJAPTZS\nr4xYkHPB7GEseaHsh7U/2k3ZIQAw3pDaDtMaSKk+hQsUi4y8QZ5q9w5wwDX3OaJdZtB7WZ+o\nRxKaJyOkLY4ng5IgodcVf/EuGO70SH8vf/GhGLWhC5SgYiAynB321O+/TIho\n-----END CERTIFICATE-----\n",
  "Buypass Class 3 CA 1": "-----BEGIN CERTIFICATE-----\nMIIDUzCCAjugAwIBAgIBAjANBgkqhkiG9w0BAQUFADBLMQswCQYDVQQGEwJOTzEdMBsGA1UE\nCgwUQnV5cGFzcyBBUy05ODMxNjMzMjcxHTAbBgNVBAMMFEJ1eXBhc3MgQ2xhc3MgMyBDQSAx\nMB4XDTA1MDUwOTE0MTMwM1oXDTE1MDUwOTE0MTMwM1owSzELMAkGA1UEBhMCTk8xHTAbBgNV\nBAoMFEJ1eXBhc3MgQVMtOTgzMTYzMzI3MR0wGwYDVQQDDBRCdXlwYXNzIENsYXNzIDMgQ0Eg\nMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKSO13TZKWTeXx+HgJHqTjnmGcZE\nC4DVC69TB4sSveZn8AKxifZgisRbsELRwCGoy+Gb72RRtqfPFfV0gGgEkKBYouZ0plNTVUhj\nP5JW3SROjvi6K//zNIqeKNc0n6wv1g/xpC+9UrJJhW05NfBEMJNGJPO251P7vGGvqaMU+8IX\nF4Rs4HyI+MkcVyzwPX6UvCWThOiaAJpFBUJXgPROztmuOfbIUxAMZTpHe2DC1vqRycZxbL2R\nhzyRhkmr8w+gbCZ2Xhysm3HljbybIR6c1jh+JIAVMYKWsUnTYjdbiAwKYjT+p0h+mbEwi5A3\nlRyoH6UsjfRVyNvdWQrCrXig9IsCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4E\nFgQUOBTmyPCppAP0Tj4io1vy1uCtQHQwDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBBQUA\nA4IBAQABZ6OMySU9E2NdFm/soT4JXJEVKirZgCFPBdy7pYmrEzMqnji3jG8CcmPHc3ceCQa6\nOyh7pEfJYWsICCD8igWKH7y6xsL+z27sEzNxZy5p+qksP2bAEllNC1QCkoS72xLvg3BweMhT\n+t/Gxv/ciC8HwEmdMldg0/L2mSlf56oBzKwzqBwKu5HEA6BvtjT5htOzdlSY9EqBs1OdTUDs\n5XcTRa9bqh/YL0yCe/4qxFi7T/ye/QNlGioOw6UgFpRreaaiErS7GqQjel/wroQk5PMr+4ok\noyeYZdowdXb8GZHo2+ubPzK/QJcHJrrM85SFSnonk8+QQtS4Wxam58tAA915\n-----END CERTIFICATE-----\n",
  "EBG Elektronik Sertifika Hizmet SaÄlayÄ±cÄ±sÄ±": "-----BEGIN CERTIFICATE-----\nMIIF5zCCA8+gAwIBAgIITK9zQhyOdAIwDQYJKoZIhvcNAQEFBQAwgYAxODA2BgNVBAMML0VC\nRyBFbGVrdHJvbmlrIFNlcnRpZmlrYSBIaXptZXQgU2HEn2xhecSxY8Sxc8SxMTcwNQYDVQQK\nDC5FQkcgQmlsacWfaW0gVGVrbm9sb2ppbGVyaSB2ZSBIaXptZXRsZXJpIEEuxZ4uMQswCQYD\nVQQGEwJUUjAeFw0wNjA4MTcwMDIxMDlaFw0xNjA4MTQwMDMxMDlaMIGAMTgwNgYDVQQDDC9F\nQkcgRWxla3Ryb25payBTZXJ0aWZpa2EgSGl6bWV0IFNhxJ9sYXnEsWPEsXPEsTE3MDUGA1UE\nCgwuRUJHIEJpbGnFn2ltIFRla25vbG9qaWxlcmkgdmUgSGl6bWV0bGVyaSBBLsWeLjELMAkG\nA1UEBhMCVFIwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDuoIRh0DpqZhAy2DE4\nf6en5f2h4fuXd7hxlugTlkaDT7byX3JWbhNgpQGR4lvFzVcfd2NR/y8927k/qqk153nQ9dAk\ntiHq6yOU/im/+4mRDGSaBUorzAzu8T2bgmmkTPiab+ci2hC6X5L8GCcKqKpE+i4stPtGmggD\ng3KriORqcsnlZR9uKg+ds+g75AxuetpX/dfreYteIAbTdgtsApWjluTLdlHRKJ2hGvxEok3M\nenaoDT2/F08iiFD9rrbskFBKW5+VQarKD7JK/oCZTqNGFav4c0JqwmZ2sQomFd2TkuzbqV9U\nIlKRcF0T6kjsbgNs2d1s/OsNA/+mgxKb8amTD8UmTDGyY5lhcucqZJnSuOl14nypqZoaqsNW\n2xCaPINStnuWt6yHd6i58mcLlEOzrz5z+kI2sSXFCjEmN1ZnuqMLfdb3ic1nobc6HmZP9qBV\nFCVMLDMNpkGMvQQxahByCp0OLna9XvNRiYuoP1Vzv9s6xiQFlpJIqkuNKgPlV5EQ9GooFW5H\nd4RcUXSfGenmHmMWOeMRFeNYGkS9y8RsZteEBt8w9DeiQyJ50hBs37vmExH8nYQKE3vwO9D8\nowrXieqWfo1IhR5kX9tUoqzVegJ5a9KK8GfaZXINFHDk6Y54jzJ0fFfy1tb0Nokb+Clsi7n2\nl9GkLqq+CxnCRelwXQIDAJ3Zo2MwYTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIB\nBjAdBgNVHQ4EFgQU587GT/wWZ5b6SqMHwQSny2re2kcwHwYDVR0jBBgwFoAU587GT/wWZ5b6\nSqMHwQSny2re2kcwDQYJKoZIhvcNAQEFBQADggIBAJuYml2+8ygjdsZs93/mQJ7ANtyVDR2t\nFcU22NU57/IeIl6zgrRdu0waypIN30ckHrMk2pGI6YNw3ZPX6bqz3xZaPt7gyPvT/Wwp+BVG\noGgmzJNSroIBk5DKd8pNSe/iWtkqvTDOTLKBtjDOWU/aWR1qeqRFsIImgYZ29fUQALjuswno\nT4cCB64kXPBfrAowzIpAoHMEwfuJJPaaHFy3PApnNgUIMbOv2AFoKuB4j3TeuFGkjGwgPaL7\ns9QJ/XvCgKqTbCmYIai7FvOpEl90tYeY8pUm3zTvilORiF0alKM/fCL414i6poyWqD1SNGKf\nAB5UVUJnxk1Gj7sURT0KlhaOEKGXmdXTMIXM3rRyt7yKPBgpaP3ccQfuJDlq+u2lrDgv+R4Q\nDgZxGhBM/nV+/x5XOULK1+EVoVZVWRvRo68R2E7DpSvvkL/A7IITW43WciyTTo9qKd+FPNMN\n4KIYEsxVL0e3p5sC/kH2iExt2qkBR4NkJ2IQgtYSe14DHzSpyZH+r11thie3I6p1GMog57AP\n14kOpmciY/SDQSsGS7tY1dHXt7kQY9iJSrSq3RZj9W6+YKH47ejWkE8axsWgKdOnIaj1Wjz3\nx0miIZpKlVIglnKaZsv30oZDfCK+lvm9AahH3eU7QPl1K5srRmSGjR70j/sHd9DqSaIcjVIU\npgqT\n-----END CERTIFICATE-----\n",
  "certSIGN ROOT CA": "-----BEGIN CERTIFICATE-----\nMIIDODCCAiCgAwIBAgIGIAYFFnACMA0GCSqGSIb3DQEBBQUAMDsxCzAJBgNVBAYTAlJPMREw\nDwYDVQQKEwhjZXJ0U0lHTjEZMBcGA1UECxMQY2VydFNJR04gUk9PVCBDQTAeFw0wNjA3MDQx\nNzIwMDRaFw0zMTA3MDQxNzIwMDRaMDsxCzAJBgNVBAYTAlJPMREwDwYDVQQKEwhjZXJ0U0lH\nTjEZMBcGA1UECxMQY2VydFNJR04gUk9PVCBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\nAQoCggEBALczuX7IJUqOtdu0KBuqV5Do0SLTZLrTk+jUrIZhQGpgV2hUhE28alQCBf/fm5oq\nrl0Hj0rDKH/v+yv6efHHrfAQUySQi2bJqIirr1qjAOm+ukbuW3N7LBeCgV5iLKECZbO9xSsA\nfsT8AzNXDe3i+s5dRdY4zTW2ssHQnIFKquSyAVwdj1+ZxLGt24gh65AIgoDzMKND5pCCrlUo\nSe1b16kQOA7+j0xbm0bqQfWwCHTD0IgztnzXdN/chNFDDnU5oSVAKOp4yw4sLjmdjItuFhwv\nJoIQ4uNllAoEwF73XVv4EOLQunpL+943AAAaWyjj0pxzPjKHmKHJUS/X3qwzs08CAwEAAaNC\nMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAcYwHQYDVR0OBBYEFOCMm9slSbPx\nfIbWskKHC9BroNnkMA0GCSqGSIb3DQEBBQUAA4IBAQA+0hyJLjX8+HXd5n9liPRyTMks1zJO\n890ZeUe9jjtbkw9QSSQTaxQGcu8J06Gh40CEyecYMnQ8SG4Pn0vU9x7Tk4ZkVJdjclDVVc/6\nIJMCopvDI5NOFlV2oHB5bc0hH88vLbwZ44gx+FkagQnIl6Z0x2DEW8xXjrJ1/RsCCdtZb3KT\nafcxQdaIOL+Hsr0Wefmq5L6IJd1hJyMctTEHBDa0GpC9oHRxUIltvBTjD4au8as+x6AJzKNI\n0eDbZOeStc+vckNwi/nDhDwTqn6Sm1dTk/pwwpEOMfmbZ13pljheX7NzTogVZ96edhBiIL5V\naZVDADlN9u6wWk5JRFRYX0KD\n-----END CERTIFICATE-----\n",
  "CNNIC ROOT": "-----BEGIN CERTIFICATE-----\nMIIDVTCCAj2gAwIBAgIESTMAATANBgkqhkiG9w0BAQUFADAyMQswCQYDVQQGEwJDTjEOMAwG\nA1UEChMFQ05OSUMxEzARBgNVBAMTCkNOTklDIFJPT1QwHhcNMDcwNDE2MDcwOTE0WhcNMjcw\nNDE2MDcwOTE0WjAyMQswCQYDVQQGEwJDTjEOMAwGA1UEChMFQ05OSUMxEzARBgNVBAMTCkNO\nTklDIFJPT1QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDTNfc/c3et6FtzF8LR\nb+1VvG7q6KR5smzDo+/hn7E7SIX1mlwhIhAsxYLO2uOabjfhhyzcuQxauohV3/2q2x8x6gHx\n3zkBwRP9SFIhxFXf2tizVHa6dLG3fdfA6PZZxU3Iva0fFNrfWEQlMhkqx35+jq44sDB7R3IJ\nMfAw28Mbdim7aXZOV/kbZKKTVrdvmW7bCgScEeOAH8tjlBAKqeFkgjH5jCftppkA9nCTGPih\nNIaj3XrCGHn2emU1z5DrvTOTn1OrczvmmzQgLx3vqR1jGqCA2wMv+SYahtKNu6m+UjqHZ0gN\nv7Sg2Ca+I19zN38m5pIEo3/PIKe38zrKy5nLAgMBAAGjczBxMBEGCWCGSAGG+EIBAQQEAwIA\nBzAfBgNVHSMEGDAWgBRl8jGtKvf33VKWCscCwQ7vptU7ETAPBgNVHRMBAf8EBTADAQH/MAsG\nA1UdDwQEAwIB/jAdBgNVHQ4EFgQUZfIxrSr3991SlgrHAsEO76bVOxEwDQYJKoZIhvcNAQEF\nBQADggEBAEs17szkrr/Dbq2flTtLP1se31cpolnKOOK5Gv+e5m4y3R6u6jW39ZORTtpC4cMX\nYFDy0VwmuYK36m3knITnA3kXr5g9lNvHugDnuL8BV8F3RTIMO/G0HAiw/VGgod2aHRM2mm23\nxzy54cXZF/qD1T0VoDy7HgviyJA/qIYM/PmLXoXLT1tLYhFHxUV8BS9BsZ4QaRuZluBVeftO\nhpm4lNqGOGqTo+fLbuXf6iFViZx9fX+Y9QCJ7uOEwFyWtcVG6kbghVW2G8kS1sHNzYDzAgE8\nyGnLRUhj2JTQ7IUOO04RZfSCjKY9ri4ilAnIXOo8gV0WKgOXFlUJ24pBgp5mmxE=\n-----END CERTIFICATE-----\n",
  "ApplicationCA - Japanese Government": "-----BEGIN CERTIFICATE-----\nMIIDoDCCAoigAwIBAgIBMTANBgkqhkiG9w0BAQUFADBDMQswCQYDVQQGEwJKUDEcMBoGA1UE\nChMTSmFwYW5lc2UgR292ZXJubWVudDEWMBQGA1UECxMNQXBwbGljYXRpb25DQTAeFw0wNzEy\nMTIxNTAwMDBaFw0xNzEyMTIxNTAwMDBaMEMxCzAJBgNVBAYTAkpQMRwwGgYDVQQKExNKYXBh\nbmVzZSBHb3Zlcm5tZW50MRYwFAYDVQQLEw1BcHBsaWNhdGlvbkNBMIIBIjANBgkqhkiG9w0B\nAQEFAAOCAQ8AMIIBCgKCAQEAp23gdE6Hj6UG3mii24aZS2QNcfAKBZuOquHMLtJqO8F6tJdh\njYq+xpqcBrSGUeQ3DnR4fl+Kf5Sk10cI/VBaVuRorChzoHvpfxiSQE8tnfWuREhzNgaeZCw7\nNCPbXCbkcXmP1G55IrmTwcrNwVbtiGrXoDkhBFcsovW8R0FPXjQilbUfKW1eSvNNcr5BViCH\n/OlQR9cwFO5cjFW6WY2H/CPek9AEjP3vbb3QesmlOmpyM8ZKDQUXKi17safY1vC+9D/qDiht\nQWEjdnjDuGWk81quzMKq2edY3rZ+nYVunyoKb58DKTCXKB28t89UKU5RMfkntigm/qJj5kEW\n8DOYRwIDAQABo4GeMIGbMB0GA1UdDgQWBBRUWssmP3HMlEYNllPqa0jQk/5CdTAOBgNVHQ8B\nAf8EBAMCAQYwWQYDVR0RBFIwUKROMEwxCzAJBgNVBAYTAkpQMRgwFgYDVQQKDA/ml6XmnKzl\nm73mlL/lupwxIzAhBgNVBAsMGuOCouODl+ODquOCseODvOOCt+ODp+ODs0NBMA8GA1UdEwEB\n/wQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBADlqRHZ3ODrso2dGD/mLBqj7apAxzn7s2tGJ\nfHrrLgy9mTLnsCTWw//1sogJhyzjVOGjprIIC8CFqMjSnHH2HZ9g/DgzE+Ge3Atf2hZQKXsv\ncJEPmbo0NI2VdMV+eKlmXb3KIXdCEKxmJj3ekav9FfBv7WxfEPjzFvYDio+nEhEMy/0/ecGc\n/WLuo89UDNErXxc+4z6/wCs+CZv+iKZ+tJIX/COUgb1up8WMwusRRdv4QcmWdupwX3kSa+Sj\nB1oF7ydJzyGfikwJcGapJsErEU4z0g781mzSDjJkaP+tBXhfAx2o45CsJOAPQKdLrosot4LK\nGAfmt1t06SAZf7IbiVQ=\n-----END CERTIFICATE-----\n",
  "GeoTrust Primary Certification Authority - G3": "-----BEGIN CERTIFICATE-----\nMIID/jCCAuagAwIBAgIQFaxulBmyeUtB9iepwxgPHzANBgkqhkiG9w0BAQsFADCBmDELMAkG\nA1UEBhMCVVMxFjAUBgNVBAoTDUdlb1RydXN0IEluYy4xOTA3BgNVBAsTMChjKSAyMDA4IEdl\nb1RydXN0IEluYy4gLSBGb3IgYXV0aG9yaXplZCB1c2Ugb25seTE2MDQGA1UEAxMtR2VvVHJ1\nc3QgUHJpbWFyeSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSAtIEczMB4XDTA4MDQwMjAwMDAw\nMFoXDTM3MTIwMTIzNTk1OVowgZgxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1HZW9UcnVzdCBJ\nbmMuMTkwNwYDVQQLEzAoYykgMjAwOCBHZW9UcnVzdCBJbmMuIC0gRm9yIGF1dGhvcml6ZWQg\ndXNlIG9ubHkxNjA0BgNVBAMTLUdlb1RydXN0IFByaW1hcnkgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgLSBHMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANziXmJYHTNXOTIz\n+uvLh4yn1ErdBojqZI4xmKU4kB6Yzy5jK/BGvESyiaHAKAxJcCGVn2TAppMSAmUmhsalifD6\n14SgcK9PGpc/BkTVyetyEH3kMSj7HGHmKAdEc5IiaacDiGydY8hS2pgn5whMcD60yRLBxWeD\nXTPzAxHsatBT4tG6NmCUgLthY2xbF37fQJQeqw3CIShwiP/WJmxsYAQlTlV+fe+/lEjetx3d\ncI0FX4ilm/LC7urRQEFtYjgdVgbFA0dRIBn8exALDmKudlW/X3e+PkkBUz2YJQN2JFodtNuJ\n6nnltrM7P7pMKEF/BqxqjsHQ9gUdfeZChuOl1UcCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB\n/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFMR5yo6hTgMdHNxr2zFblD4/MH8tMA0GCSqG\nSIb3DQEBCwUAA4IBAQAtxRPPVoB7eni9n64smefv2t+UXglpp+duaIy9cr5HqQ6XErhK8WTT\nOd8lNNTBzU6B8A8ExCSzNJbGpqow32hhc9f5joWJ7w5elShKKiePEI4ufIbEAp7aDHdlDkQN\nkv39sxY2+hENHYwOB4lqKVb3cvTdFZx3NWZXqxNT2I7BQMXXExZacse3aQHEerGDAWh9jUGh\nlBjBJVz88P6DAod8DQ3PLghcSkANPuyBYeYk28rgDi0Hsj5W3I31QYUHSJsMC8tJP33st/3L\njWeJGqvtux6jAAgIFyqCXDFdRootD4abdNlF+9RAsXqqaC2Gspki4cErx5z481+oghLrGREt\n-----END CERTIFICATE-----\n",
  "thawte Primary Root CA - G2": "-----BEGIN CERTIFICATE-----\nMIICiDCCAg2gAwIBAgIQNfwmXNmET8k9Jj1Xm67XVjAKBggqhkjOPQQDAzCBhDELMAkGA1UE\nBhMCVVMxFTATBgNVBAoTDHRoYXd0ZSwgSW5jLjE4MDYGA1UECxMvKGMpIDIwMDcgdGhhd3Rl\nLCBJbmMuIC0gRm9yIGF1dGhvcml6ZWQgdXNlIG9ubHkxJDAiBgNVBAMTG3RoYXd0ZSBQcmlt\nYXJ5IFJvb3QgQ0EgLSBHMjAeFw0wNzExMDUwMDAwMDBaFw0zODAxMTgyMzU5NTlaMIGEMQsw\nCQYDVQQGEwJVUzEVMBMGA1UEChMMdGhhd3RlLCBJbmMuMTgwNgYDVQQLEy8oYykgMjAwNyB0\naGF3dGUsIEluYy4gLSBGb3IgYXV0aG9yaXplZCB1c2Ugb25seTEkMCIGA1UEAxMbdGhhd3Rl\nIFByaW1hcnkgUm9vdCBDQSAtIEcyMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEotWcgnuVnfFS\neIf+iha/BebfowJPDQfGAFG6DAJSLSKkQjnE/o/qycG+1E3/n3qe4rF8mq2nhglzh9HnmuN6\npapu+7qzcMBniKI11KOasf2twu8x+qi58/sIxpHR+ymVo0IwQDAPBgNVHRMBAf8EBTADAQH/\nMA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4EFgQUmtgAMADna3+FGO6Lts6KDPgR4bswCgYIKoZI\nzj0EAwMDaQAwZgIxAN344FdHW6fmCsO99YCKlzUNG4k8VIZ3KMqh9HneteY4sPBlcIx/AlTC\nv//YoT7ZzwIxAMSNlPzcU9LcnXgWHxUzI1NS41oxXZ3Krr0TKUQNJ1uo52icEvdYPy5yAlej\nj6EULg==\n-----END CERTIFICATE-----\n",
  "thawte Primary Root CA - G3": "-----BEGIN CERTIFICATE-----\nMIIEKjCCAxKgAwIBAgIQYAGXt0an6rS0mtZLL/eQ+zANBgkqhkiG9w0BAQsFADCBrjELMAkG\nA1UEBhMCVVMxFTATBgNVBAoTDHRoYXd0ZSwgSW5jLjEoMCYGA1UECxMfQ2VydGlmaWNhdGlv\nbiBTZXJ2aWNlcyBEaXZpc2lvbjE4MDYGA1UECxMvKGMpIDIwMDggdGhhd3RlLCBJbmMuIC0g\nRm9yIGF1dGhvcml6ZWQgdXNlIG9ubHkxJDAiBgNVBAMTG3RoYXd0ZSBQcmltYXJ5IFJvb3Qg\nQ0EgLSBHMzAeFw0wODA0MDIwMDAwMDBaFw0zNzEyMDEyMzU5NTlaMIGuMQswCQYDVQQGEwJV\nUzEVMBMGA1UEChMMdGhhd3RlLCBJbmMuMSgwJgYDVQQLEx9DZXJ0aWZpY2F0aW9uIFNlcnZp\nY2VzIERpdmlzaW9uMTgwNgYDVQQLEy8oYykgMjAwOCB0aGF3dGUsIEluYy4gLSBGb3IgYXV0\naG9yaXplZCB1c2Ugb25seTEkMCIGA1UEAxMbdGhhd3RlIFByaW1hcnkgUm9vdCBDQSAtIEcz\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsr8nLPvb2FvdeHsbnndmgcs+vHyu\n86YnmjSjaDFxODNi5PNxZnmxqWWjpYvVj2AtP0LMqmsywCPLLEHd5N/8YZzic7IilRFDGF/E\nth9XbAoFWCLINkw6fKXRz4aviKdEAhN0cXMKQlkC+BsUa0Lfb1+6a4KinVvnSr0eAXLbS3To\nO39/fR8EtCab4LRarEc9VbjXsCZSKAExQGbY2SS99irY7CFJXJv2eul/VTV+lmuNk5Mny5K7\n6qxAwJ/C+IDPXfRa3M50hqY+bAtTyr2SzhkGcuYMXDhpxwTWvGzOW/b3aJzcJRVIiKHpqfiY\nnODz1TEoYRFsZ5aNOZnLwkUkOQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB\n/wQEAwIBBjAdBgNVHQ4EFgQUrWyqlGCc7eT/+j4KdCtjA/e2Wb8wDQYJKoZIhvcNAQELBQAD\nggEBABpA2JVlrAmSicY59BDlqQ5mU1143vokkbvnRFHfxhY0Cu9qRFHqKweKA3rD6z8KLFIW\noCtDuSWQP3CpMyVtRRooOyfPqsMpQhvfO0zAMzRbQYi/aytlryjvsvXDqmbOe1but8jLZ8HJ\nnBoYuMTDSQPxYA5QzUbF83d597YV4Djbxy8ooAw/dyZ02SUS2jHaGh7cKUGRIjxpp7sC8rZc\nJwOJ9Abqm+RyguOhCcHpABnTPtRwa7pxpqpYrvS76Wy274fMm7v/OeZWYdMKp8RcTGB7BXcm\ner/YB1IsYvdwY9k5vG8cwnncdimvzsUsZAReiDZuMdRAGmI0Nj81Aa6sY6A=\n-----END CERTIFICATE-----\n",
  "GeoTrust Primary Certification Authority - G2": "-----BEGIN CERTIFICATE-----\nMIICrjCCAjWgAwIBAgIQPLL0SAoA4v7rJDteYD7DazAKBggqhkjOPQQDAzCBmDELMAkGA1UE\nBhMCVVMxFjAUBgNVBAoTDUdlb1RydXN0IEluYy4xOTA3BgNVBAsTMChjKSAyMDA3IEdlb1Ry\ndXN0IEluYy4gLSBGb3IgYXV0aG9yaXplZCB1c2Ugb25seTE2MDQGA1UEAxMtR2VvVHJ1c3Qg\nUHJpbWFyeSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSAtIEcyMB4XDTA3MTEwNTAwMDAwMFoX\nDTM4MDExODIzNTk1OVowgZgxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMu\nMTkwNwYDVQQLEzAoYykgMjAwNyBHZW9UcnVzdCBJbmMuIC0gRm9yIGF1dGhvcml6ZWQgdXNl\nIG9ubHkxNjA0BgNVBAMTLUdlb1RydXN0IFByaW1hcnkgQ2VydGlmaWNhdGlvbiBBdXRob3Jp\ndHkgLSBHMjB2MBAGByqGSM49AgEGBSuBBAAiA2IABBWx6P0DFUPlrOuHNxFi79KDNlJ9RVcL\nSo17VDs6bl8VAsBQps8lL33KSLjHUGMcKiEIfJo22Av+0SbFWDEwKCXzXV2juLaltJLtbCyf\n691DiaI8S0iRHVDsJt/WYC69IaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC\nAQYwHQYDVR0OBBYEFBVfNVdRVfslsq0DafwBo/q+EVXVMAoGCCqGSM49BAMDA2cAMGQCMGSW\nWaboCd6LuvpaiIjwH5HTRqjySkwCY/tsXzjbLkGTqQ7mndwxHLKgpxgceeHHNgIwOlavmnRs\n9vuD4DPTCF+hnMJbn0bWtsuRBmOiBuczrD6ogRLQy7rQkgu2npaqBA+K\n-----END CERTIFICATE-----\n",
  "VeriSign Universal Root Certification Authority": "-----BEGIN CERTIFICATE-----\nMIIEuTCCA6GgAwIBAgIQQBrEZCGzEyEDDrvkEhrFHTANBgkqhkiG9w0BAQsFADCBvTELMAkG\nA1UEBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8wHQYDVQQLExZWZXJpU2lnbiBU\ncnVzdCBOZXR3b3JrMTowOAYDVQQLEzEoYykgMjAwOCBWZXJpU2lnbiwgSW5jLiAtIEZvciBh\ndXRob3JpemVkIHVzZSBvbmx5MTgwNgYDVQQDEy9WZXJpU2lnbiBVbml2ZXJzYWwgUm9vdCBD\nZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTAeFw0wODA0MDIwMDAwMDBaFw0zNzEyMDEyMzU5NTla\nMIG9MQswCQYDVQQGEwJVUzEXMBUGA1UEChMOVmVyaVNpZ24sIEluYy4xHzAdBgNVBAsTFlZl\ncmlTaWduIFRydXN0IE5ldHdvcmsxOjA4BgNVBAsTMShjKSAyMDA4IFZlcmlTaWduLCBJbmMu\nIC0gRm9yIGF1dGhvcml6ZWQgdXNlIG9ubHkxODA2BgNVBAMTL1ZlcmlTaWduIFVuaXZlcnNh\nbCBSb290IENlcnRpZmljYXRpb24gQXV0aG9yaXR5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\nMIIBCgKCAQEAx2E3XrEBNNti1xWb/1hajCMj1mCOkdeQmIN65lgZOIzF9uVkhbSicfvtvbna\nzU0AtMgtc6XHaXGVHzk8skQHnOgO+k1KxCHfKWGPMiJhgsWHH26MfF8WIFFE0XBPV+rjHOPM\nee5Y2A7Cs0WTwCznmhcrewA3ekEzeOEz4vMQGn+HLL729fdC4uW/h2KJXwBL38Xd5HVEMkE6\nHnFuacsLdUYI0crSK5XQz/u5QGtkjFdN/BMReYTtXlT2NJ8IAfMQJQYXStrxHXpma5hgZqTZ\n79IugvHw7wnqRMkVauIDbjPTrJ9VAMf2CGqUuV/c4DPxhGD5WycRtPwW8rtWaoAljQIDAQAB\no4GyMIGvMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMG0GCCsGAQUFBwEMBGEw\nX6FdoFswWTBXMFUWCWltYWdlL2dpZjAhMB8wBwYFKw4DAhoEFI/l0xqGrI2Oa8PPgGrUSBgs\nexkuMCUWI2h0dHA6Ly9sb2dvLnZlcmlzaWduLmNvbS92c2xvZ28uZ2lmMB0GA1UdDgQWBBS2\nd/ppSEefUxLVwuoHMnYH0ZcHGTANBgkqhkiG9w0BAQsFAAOCAQEASvj4sAPmLGd75JR3Y8xu\nTPl9Dg3cyLk1uXBPY/ok+myDjEedO2Pzmvl2MpWRsXe8rJq+seQxIcaBlVZaDrHC1LGmWazx\nY8u4TB1ZkErvkBYoH1quEPuBUDgMbMzxPcP1Y+Oz4yHJJDnp/RVmRvQbEdBNc6N9Rvk97ahf\nYtTxP/jgdFcrGJ2BtMQo2pSXpXDrrB2+BxHw1dvd5Yzw1TKwg+ZX4o+/vqGqvz0dtdQ46tew\nXDpPaj+PwGZsY6rp2aQW9IHRlRQOfc2VNNnSj3BzgXucfr2YYdhFh5iQxeuGMMY1v/D/w1WI\ng0vvBZIGcfK4mJO37M2CYfE45k+XmCpajQ==\n-----END CERTIFICATE-----\n",
  "VeriSign Class 3 Public Primary Certification Authority - G4": "-----BEGIN CERTIFICATE-----\nMIIDhDCCAwqgAwIBAgIQL4D+I4wOIg9IZxIokYesszAKBggqhkjOPQQDAzCByjELMAkGA1UE\nBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8wHQYDVQQLExZWZXJpU2lnbiBUcnVz\ndCBOZXR3b3JrMTowOAYDVQQLEzEoYykgMjAwNyBWZXJpU2lnbiwgSW5jLiAtIEZvciBhdXRo\nb3JpemVkIHVzZSBvbmx5MUUwQwYDVQQDEzxWZXJpU2lnbiBDbGFzcyAzIFB1YmxpYyBQcmlt\nYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5IC0gRzQwHhcNMDcxMTA1MDAwMDAwWhcNMzgw\nMTE4MjM1OTU5WjCByjELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDlZlcmlTaWduLCBJbmMuMR8w\nHQYDVQQLExZWZXJpU2lnbiBUcnVzdCBOZXR3b3JrMTowOAYDVQQLEzEoYykgMjAwNyBWZXJp\nU2lnbiwgSW5jLiAtIEZvciBhdXRob3JpemVkIHVzZSBvbmx5MUUwQwYDVQQDEzxWZXJpU2ln\nbiBDbGFzcyAzIFB1YmxpYyBQcmltYXJ5IENlcnRpZmljYXRpb24gQXV0aG9yaXR5IC0gRzQw\ndjAQBgcqhkjOPQIBBgUrgQQAIgNiAASnVnp8Utpkmw4tXNherJI9/gHmGUo9FANL+mAnINmD\niWn6VMaaGF5VKmTeBvaNSjutEDxlPZCIBIngMGGzrl0Bp3vefLK+ymVhAIau2o970ImtTR1Z\nmkGxvEeA3J5iw/mjgbIwga8wDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwbQYI\nKwYBBQUHAQwEYTBfoV2gWzBZMFcwVRYJaW1hZ2UvZ2lmMCEwHzAHBgUrDgMCGgQUj+XTGoas\njY5rw8+AatRIGCx7GS4wJRYjaHR0cDovL2xvZ28udmVyaXNpZ24uY29tL3ZzbG9nby5naWYw\nHQYDVR0OBBYEFLMWkf3upm7ktS5Jj4d4gYDs5bG1MAoGCCqGSM49BAMDA2gAMGUCMGYhDBgm\nYFo4e1ZC4Kf8NoRRkSAsdk1DPcQdhCPQrNZ8NQbOzWm9kA3bbEhCHQ6qQgIxAJw9SDkjOVga\nFRJZap7v1VmyHVIsmXHNxynfGyphe3HR3vPA5Q06Sqotp9iGKt0uEA==\n-----END CERTIFICATE-----\n",
  "NetLock Arany (Class Gold) Főtanúsítvány": "-----BEGIN CERTIFICATE-----\nMIIEFTCCAv2gAwIBAgIGSUEs5AAQMA0GCSqGSIb3DQEBCwUAMIGnMQswCQYDVQQGEwJIVTER\nMA8GA1UEBwwIQnVkYXBlc3QxFTATBgNVBAoMDE5ldExvY2sgS2Z0LjE3MDUGA1UECwwuVGFu\nw7pzw610dsOhbnlraWFkw7NrIChDZXJ0aWZpY2F0aW9uIFNlcnZpY2VzKTE1MDMGA1UEAwws\nTmV0TG9jayBBcmFueSAoQ2xhc3MgR29sZCkgRsWRdGFuw7pzw610dsOhbnkwHhcNMDgxMjEx\nMTUwODIxWhcNMjgxMjA2MTUwODIxWjCBpzELMAkGA1UEBhMCSFUxETAPBgNVBAcMCEJ1ZGFw\nZXN0MRUwEwYDVQQKDAxOZXRMb2NrIEtmdC4xNzA1BgNVBAsMLlRhbsO6c8OtdHbDoW55a2lh\nZMOzayAoQ2VydGlmaWNhdGlvbiBTZXJ2aWNlcykxNTAzBgNVBAMMLE5ldExvY2sgQXJhbnkg\nKENsYXNzIEdvbGQpIEbFkXRhbsO6c8OtdHbDoW55MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\nMIIBCgKCAQEAxCRec75LbRTDofTjl5Bu0jBFHjzuZ9lk4BqKf8owyoPjIMHj9DrTlF8afFtt\nvzBPhCf2nx9JvMaZCpDyD/V/Q4Q3Y1GLeqVw/HpYzY6b7cNGbIRwXdrzAZAj/E4wqX7hJ2Pn\n7WQ8oLjJM2P+FpD/sLj916jAwJRDC7bVWaaeVtAkH3B5r9s5VA1lddkVQZQBr17s9o3x/61k\n/iCa11zr/qYfCGSji3ZVrR47KGAuhyXoqq8fxmRGILdwfzzeSNuWU7c5d+Qa4scWhHaXWy+7\nGRWF+GmF9ZmnqfI0p6m2pgP8b4Y9VHx2BJtr+UBdADTHLpl1neWIA6pN+APSQnbAGwIDAKiL\no0UwQzASBgNVHRMBAf8ECDAGAQH/AgEEMA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4EFgQUzPpn\nk/C2uNClwB7zU/2MU9+D15YwDQYJKoZIhvcNAQELBQADggEBAKt/7hwWqZw8UQCgwBEIBaeZ\n5m8BiFRhbvG5GK1Krf6BQCOUL/t1fC8oS2IkgYIL9WHxHG64YTjrgfpioTtaYtOUZcTh5m2C\n+C8lcLIhJsFyUR+MLMOEkMNaj7rP9KdlpeuY0fsFskZ1FSNqb4VjMIDw1Z4fKRzCbLBQWV2Q\nWzuoDTDPv31/zvGdg73JRm4gpvlhUbohL3u+pRVjodSVh/GeufOJ8z2FuLjbvrW5KfnaNwUA\nSZQDhETnv0Mxz3WLJdH0pmT1kvarBes96aULNmLazAZfNou2XjG4Kvte9nHfRCaexOYNkbQu\ndZWAUWpLMKawYqGT8ZvYzsRjdT9ZR7E=\n-----END CERTIFICATE-----\n",
  "Staat der Nederlanden Root CA - G2": "-----BEGIN CERTIFICATE-----\nMIIFyjCCA7KgAwIBAgIEAJiWjDANBgkqhkiG9w0BAQsFADBaMQswCQYDVQQGEwJOTDEeMBwG\nA1UECgwVU3RhYXQgZGVyIE5lZGVybGFuZGVuMSswKQYDVQQDDCJTdGFhdCBkZXIgTmVkZXJs\nYW5kZW4gUm9vdCBDQSAtIEcyMB4XDTA4MDMyNjExMTgxN1oXDTIwMDMyNTExMDMxMFowWjEL\nMAkGA1UEBhMCTkwxHjAcBgNVBAoMFVN0YWF0IGRlciBOZWRlcmxhbmRlbjErMCkGA1UEAwwi\nU3RhYXQgZGVyIE5lZGVybGFuZGVuIFJvb3QgQ0EgLSBHMjCCAiIwDQYJKoZIhvcNAQEBBQAD\nggIPADCCAgoCggIBAMVZ5291qj5LnLW4rJ4L5PnZyqtdj7U5EILXr1HgO+EASGrP2uEGQxGZ\nqhQlEq0i6ABtQ8SpuOUfiUtnvWFI7/3S4GCI5bkYYCjDdyutsDeqN95kWSpGV+RLufg3fNU2\n54DBtvPUZ5uW6M7XxgpT0GtJlvOjCwV3SPcl5XCsMBQgJeN/dVrlSPhOewMHBPqCYYdu8DvE\npMfQ9XQ+pV0aCPKbJdL2rAQmPlU6Yiile7Iwr/g3wtG61jj99O9JMDeZJiFIhQGp5Rbn3JBV\n3w/oOM2ZNyFPXfUib2rFEhZgF1XyZWampzCROME4HYYEhLoaJXhena/MUGDWE4dS7WMfbWV9\nwhUYdMrhfmQpjHLYFhN9C0lK8SgbIHRrxT3dsKpICT0ugpTNGmXZK4iambwYfp/ufWZ8Pr2U\nuIHOzZgweMFvZ9C+X+Bo7d7iscksWXiSqt8rYGPy5V6548r6f1CGPqI0GAwJaCgRHOThuVw+\nR7oyPxjMW4T182t0xHJ04eOLoEq9jWYv6q012iDTiIJh8BIitrzQ1aTsr1SIJSQ8p22xcik/\nPlemf1WvbibG/ufMQFxRRIEKeN5KzlW/HdXZt1bv8Hb/C3m1r737qWmRRpdogBQ2HbN/uymY\nNqUg+oJgYjOk7Na6B6duxc8UpufWkjTYgfX8HV2qXB72o007uPc5AgMBAAGjgZcwgZQwDwYD\nVR0TAQH/BAUwAwEB/zBSBgNVHSAESzBJMEcGBFUdIAAwPzA9BggrBgEFBQcCARYxaHR0cDov\nL3d3dy5wa2lvdmVyaGVpZC5ubC9wb2xpY2llcy9yb290LXBvbGljeS1HMjAOBgNVHQ8BAf8E\nBAMCAQYwHQYDVR0OBBYEFJFoMocVHYnitfGsNig0jQt8YojrMA0GCSqGSIb3DQEBCwUAA4IC\nAQCoQUpnKpKBglBu4dfYszk78wIVCVBR7y29JHuIhjv5tLySCZa59sCrI2AGeYwRTlHSeYAz\n+51IvuxBQ4EffkdAHOV6CMqqi3WtFMTC6GY8ggen5ieCWxjmD27ZUD6KQhgpxrRW/FYQoAUX\nvQwjf/ST7ZwaUb7dRUG/kSS0H4zpX897IZmflZ85OkYcbPnNe5yQzSipx6lVu6xiNGI1E0sU\nOlWDuYaNkqbG9AclVMwWVxJKgnjIFNkXgiYtXSAfea7+1HAWFpWD2DU5/1JddRwWxRNVz0fM\ndWVSSt7wsKfkCpYL+63C4iWEst3kvX5ZbJvw8NjnyvLplzh+ib7M+zkXYT9y2zqR2GUBGR2t\nUKRXCnxLvJxxcypFURmFzI79R6d0lR2o0a9OF7FpJsKqeFdbxU2n5Z4FF5TKsl+gSRiNNOkm\nbEgeqmiSBeGCc1qb3AdbCG19ndeNIdn8FCCqwkXfP+cAslHkwvgFuXkajDTznlvkN1trSt8s\nV4pAWja63XVECDdCcAz+3F4hoKOKwJCcaNpQ5kUQR3i2TtJlycM33+FCY7BXN0Ute4qcvwXq\nZVUz9zkQxSgqIXobisQk+T8VyJoVIPVVYpbtbZNQvOSqeK3Zywplh6ZmwcSBo3c6WB4L7oOL\nnR7SUqTMHW+wmG2UMbX4cQrcufx9MmDm66+KAQ==\n-----END CERTIFICATE-----\n",
  "CA Disig": "-----BEGIN CERTIFICATE-----\nMIIEDzCCAvegAwIBAgIBATANBgkqhkiG9w0BAQUFADBKMQswCQYDVQQGEwJTSzETMBEGA1UE\nBxMKQnJhdGlzbGF2YTETMBEGA1UEChMKRGlzaWcgYS5zLjERMA8GA1UEAxMIQ0EgRGlzaWcw\nHhcNMDYwMzIyMDEzOTM0WhcNMTYwMzIyMDEzOTM0WjBKMQswCQYDVQQGEwJTSzETMBEGA1UE\nBxMKQnJhdGlzbGF2YTETMBEGA1UEChMKRGlzaWcgYS5zLjERMA8GA1UEAxMIQ0EgRGlzaWcw\nggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCS9jHBfYj9mQGp2HvycXXxMcbzdWb6\nUShGhJd4NLxs/LxFWYgmGErENx+hSkS943EE9UQX4j/8SFhvXJ56CbpRNyIjZkMhsDxkovhq\nFQ4/61HhVKndBpnXmjxUizkDPw/Fzsbrg3ICqB9x8y34dQjbYkzo+s7552oftms1grrijxaS\nfQUMbEYDXcDtab86wYqg6I7ZuUUohwjstMoVvoLdtUSLLa2GDGhibYVW8qwUYzrG0ZmsNHhW\nS8+2rT+MitcE5eN4TPWGqvWP+j1scaMtymfraHtuM6kMgiioTGohQBUgDCZbg8KpFhXAJIJd\nKxatymP2dACw30PEEGBWZ2NFAgMBAAGjgf8wgfwwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4E\nFgQUjbJJaJ1yCCW5wCf1UJNWSEZx+Y8wDgYDVR0PAQH/BAQDAgEGMDYGA1UdEQQvMC2BE2Nh\nb3BlcmF0b3JAZGlzaWcuc2uGFmh0dHA6Ly93d3cuZGlzaWcuc2svY2EwZgYDVR0fBF8wXTAt\noCugKYYnaHR0cDovL3d3dy5kaXNpZy5zay9jYS9jcmwvY2FfZGlzaWcuY3JsMCygKqAohiZo\ndHRwOi8vY2EuZGlzaWcuc2svY2EvY3JsL2NhX2Rpc2lnLmNybDAaBgNVHSAEEzARMA8GDSuB\nHpGT5goAAAABAQEwDQYJKoZIhvcNAQEFBQADggEBAF00dGFMrzvY/59tWDYcPQuBDRIrRhCA\n/ec8J9B6yKm2fnQwM6M6int0wHl5QpNt/7EpFIKrIYwvF/k/Ji/1WcbvgAa3mkkp7M5+cTxq\nEEHA9tOasnxakZzArFvITV734VP/Q3f8nktnbNfzg9Gg4H8l37iYC5oyOGwwoPP/CBUz91BK\nez6jPiCp3C9WgArtQVCwyfTssuMmRAAOb54GvCKWU3BlxFAKRmukLyeBEicTXxChds6Kezfq\nwzlhA5WYOudsiCUI/HloDYd9Yvi0X/vF2Ey9WLw/Q1vUHgFNPGO+I++MzVpQuGhU+QqZMxEA\n4Z7CRneC9VkGjCFMhwnN5ag=\n-----END CERTIFICATE-----\n",
  "Juur-SK": "-----BEGIN CERTIFICATE-----\nMIIE5jCCA86gAwIBAgIEO45L/DANBgkqhkiG9w0BAQUFADBdMRgwFgYJKoZIhvcNAQkBFglw\na2lAc2suZWUxCzAJBgNVBAYTAkVFMSIwIAYDVQQKExlBUyBTZXJ0aWZpdHNlZXJpbWlza2Vz\na3VzMRAwDgYDVQQDEwdKdXVyLVNLMB4XDTAxMDgzMDE0MjMwMVoXDTE2MDgyNjE0MjMwMVow\nXTEYMBYGCSqGSIb3DQEJARYJcGtpQHNrLmVlMQswCQYDVQQGEwJFRTEiMCAGA1UEChMZQVMg\nU2VydGlmaXRzZWVyaW1pc2tlc2t1czEQMA4GA1UEAxMHSnV1ci1TSzCCASIwDQYJKoZIhvcN\nAQEBBQADggEPADCCAQoCggEBAIFxNj4zB9bjMI0TfncyRsvPGbJgMUaXhvSYRqTCZUXP00B8\n41oiqBB4M8yIsdOBSvZiF3tfTQou0M+LI+5PAk676w7KvRhj6IAcjeEcjT3g/1tf6mTll+g/\nmX8MCgkzABpTpyHhOEvWgxutr2TC+Rx6jGZITWYfGAriPrsfB2WThbkasLnE+w0R9vXW+RvH\nLCu3GFH+4Hv2qEivbDtPL+/40UceJlfwUR0zlv/vWT3aTdEVNMfqPxZIe5EcgEMPPbgFPtGz\nlc3Yyg/CQ2fbt5PgIoIuvvVoKIO5wTtpeyDaTpxt4brNj3pssAki14sL2xzVWiZbDcDq5WDQ\nn/413z8CAwEAAaOCAawwggGoMA8GA1UdEwEB/wQFMAMBAf8wggEWBgNVHSAEggENMIIBCTCC\nAQUGCisGAQQBzh8BAQEwgfYwgdAGCCsGAQUFBwICMIHDHoHAAFMAZQBlACAAcwBlAHIAdABp\nAGYAaQBrAGEAYQB0ACAAbwBuACAAdgDkAGwAagBhAHMAdABhAHQAdQBkACAAQQBTAC0AaQBz\nACAAUwBlAHIAdABpAGYAaQB0AHMAZQBlAHIAaQBtAGkAcwBrAGUAcwBrAHUAcwAgAGEAbABh\nAG0ALQBTAEsAIABzAGUAcgB0AGkAZgBpAGsAYQBhAHQAaQBkAGUAIABrAGkAbgBuAGkAdABh\nAG0AaQBzAGUAawBzMCEGCCsGAQUFBwIBFhVodHRwOi8vd3d3LnNrLmVlL2Nwcy8wKwYDVR0f\nBCQwIjAgoB6gHIYaaHR0cDovL3d3dy5zay5lZS9qdXVyL2NybC8wHQYDVR0OBBYEFASqekej\n5ImvGs8KQKcYP2/v6X2+MB8GA1UdIwQYMBaAFASqekej5ImvGs8KQKcYP2/v6X2+MA4GA1Ud\nDwEB/wQEAwIB5jANBgkqhkiG9w0BAQUFAAOCAQEAe8EYlFOiCfP+JmeaUOTDBS8rNXiRTHyo\nERF5TElZrMj3hWVcRrs7EKACr81Ptcw2Kuxd/u+gkcm2k298gFTsxwhwDY77guwqYHhpNjbR\nxZyLabVAyJRld/JXIWY7zoVAtjNjGr95HvxcHdMdkxuLDF2FvZkwMhgJkVLpfKG6/2SSmuz+\nNe6ML678IIbsSt4beDI3poHSna9aEhbKmVv8b20OxaAehsmR0FyYgl9jDIpaq9iVpszLita/\nZEuOyoqysOkhMp6qqIWYNIE5ITuoOlIyPfZrN4YGWhWY3PARZv40ILcD9EEQfTmEeZZyY7aW\nAuVrua0ZTbvGRNs2yyqcjg==\n-----END CERTIFICATE-----\n",
  "Hongkong Post Root CA 1": "-----BEGIN CERTIFICATE-----\nMIIDMDCCAhigAwIBAgICA+gwDQYJKoZIhvcNAQEFBQAwRzELMAkGA1UEBhMCSEsxFjAUBgNV\nBAoTDUhvbmdrb25nIFBvc3QxIDAeBgNVBAMTF0hvbmdrb25nIFBvc3QgUm9vdCBDQSAxMB4X\nDTAzMDUxNTA1MTMxNFoXDTIzMDUxNTA0NTIyOVowRzELMAkGA1UEBhMCSEsxFjAUBgNVBAoT\nDUhvbmdrb25nIFBvc3QxIDAeBgNVBAMTF0hvbmdrb25nIFBvc3QgUm9vdCBDQSAxMIIBIjAN\nBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArP84tulmAknjorThkPlAj3n54r15/gK97iSS\nHSL22oVyaf7XPwnU3ZG1ApzQjVrhVcNQhrkpJsLj2aDxaQMoIIBFIi1WpztUlVYiWR8o3x8g\nPW2iNr4joLFutbEnPzlTCeqrauh0ssJlXI6/fMN4hM2eFvz1Lk8gKgifd/PFHsSaUmYeSF7j\nEAaPIpjhZY4bXSNmO7ilMlHIhqqhqZ5/dpTCpmy3QfDVyAY45tQM4vM7TG1QjMSDJ8EThFk9\nnnV0ttgCXjqQesBCNnLsak3c78QA3xMYV18meMjWCnl3v/evt3a5pQuEF10Q6m/hq5URX208\no1xNg1vysxmKgIsLhwIDAQABoyYwJDASBgNVHRMBAf8ECDAGAQH/AgEDMA4GA1UdDwEB/wQE\nAwIBxjANBgkqhkiG9w0BAQUFAAOCAQEADkbVPK7ih9legYsCmEEIjEy82tvuJxuC52pF7BaL\nT4Wg87JwvVqWuspube5Gi27nKi6Wsxkz67SfqLI37piol7Yutmcn1KZJ/RyTZXaeQi/cImya\nT/JaFTmxcdcrUehtHJjA2Sr0oYJ71clBoiMBdDhViw+5LmeiIAQ32pwL0xch4I+XeTRvhEgC\nIDMb5jREn5Fw9IBehEPCKdJsEhTkYY2sEJCehFC78JZvRZ+K88psT/oROhUVRsPNH4NbLUES\n7VBnQRM9IauUiqpOfMGx+6fWtScvl6tu4B3i0RwsH0Ti/L6RoZz71ilTc4afU9hDDl3WY4Jx\nHYB0yvbiAmvZWg==\n-----END CERTIFICATE-----\n",
  "SecureSign RootCA11": "-----BEGIN CERTIFICATE-----\nMIIDbTCCAlWgAwIBAgIBATANBgkqhkiG9w0BAQUFADBYMQswCQYDVQQGEwJKUDErMCkGA1UE\nChMiSmFwYW4gQ2VydGlmaWNhdGlvbiBTZXJ2aWNlcywgSW5jLjEcMBoGA1UEAxMTU2VjdXJl\nU2lnbiBSb290Q0ExMTAeFw0wOTA0MDgwNDU2NDdaFw0yOTA0MDgwNDU2NDdaMFgxCzAJBgNV\nBAYTAkpQMSswKQYDVQQKEyJKYXBhbiBDZXJ0aWZpY2F0aW9uIFNlcnZpY2VzLCBJbmMuMRww\nGgYDVQQDExNTZWN1cmVTaWduIFJvb3RDQTExMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB\nCgKCAQEA/XeqpRyQBTvLTJszi1oURaTnkBbR31fSIRCkF/3frNYfp+TbfPfs37gD2pRY/V1y\nfIw/XwFndBWW4wI8h9uuywGOwvNmxoVF9ALGOrVisq/6nL+k5tSAMJjzDbaTj6nU2DbysPyK\nyiyhFTOVMdrAG/LuYpmGYz+/3ZMqg6h2uRMft85OQoWPIucuGvKVCbIFtUROd6EgvanyTgp9\nUK31BQ1FT0Zx/Sg+U/sE2C3XZR1KG/rPO7AxmjVuyIsG0wCR8pQIZUyxNAYAeoni8McDWc/V\n1uinMrPmmECGxc0nEovMe863ETxiYAcjPitAbpSACW22s293bzUIUPsCh8U+iQIDAQABo0Iw\nQDAdBgNVHQ4EFgQUW/hNT7KlhtQ60vFjmqC+CfZXt94wDgYDVR0PAQH/BAQDAgEGMA8GA1Ud\nEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAKChOBZmLqdWHyGcBvod7bkixTgm2E5P\n7KN/ed5GIaGHd48HCJqypMWvDzKYC3xmKbabfSVSSUOrTC4rbnpwrxYO4wJs+0LmGJ1F2FXI\n6Dvd5+H0LgscNFxsWEr7jIhQX5Ucv+2rIrVls4W6ng+4reV6G4pQOh29Dbx7VFALuUKvVaAY\nga1lme++5Jy/xIWrQbJUb9wlze144o4MjQlJ3WN7WmmWAiGovVJZ6X01y8hSyn+B/tlr0/cR\n7SXf+Of5pPpyl4RTDaXQMhhRdlkUbA/r7F+AjHVDg8OFmP9Mni0N5HeDk061lgeLKBObjBmN\nQSdJQO7e5iNEOdyhIta6A/I=\n-----END CERTIFICATE-----\n",
  "ACEDICOM Root": "-----BEGIN CERTIFICATE-----\nMIIFtTCCA52gAwIBAgIIYY3HhjsBggUwDQYJKoZIhvcNAQEFBQAwRDEWMBQGA1UEAwwNQUNF\nRElDT00gUm9vdDEMMAoGA1UECwwDUEtJMQ8wDQYDVQQKDAZFRElDT00xCzAJBgNVBAYTAkVT\nMB4XDTA4MDQxODE2MjQyMloXDTI4MDQxMzE2MjQyMlowRDEWMBQGA1UEAwwNQUNFRElDT00g\nUm9vdDEMMAoGA1UECwwDUEtJMQ8wDQYDVQQKDAZFRElDT00xCzAJBgNVBAYTAkVTMIICIjAN\nBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA/5KV4WgGdrQsyFhIyv2AVClVYyT/kGWbEHV7\nw2rbYgIB8hiGtXxaOLHkWLn709gtn70yN78sFW2+tfQh0hOR2QetAQXW8713zl9CgQr5auOD\nAKgrLlUTY4HKRxx7XBZXehuDYAQ6PmXDzQHe3qTWDLqO3tkE7hdWIpuPY/1NFgu3e3eM+SW1\n0W2ZEi5PGrjm6gSSrj0RuVFCPYewMYWveVqc/udOXpJPQ/yrOq2lEiZmueIM15jO1FillUAK\nt0SdE3QrwqXrIhWYENiLxQSfHY9g5QYbm8+5eaA9oiM/Qj9r+hwDezCNzmzAv+YbX79nuIQZ\n1RXve8uQNjFiybwCq0Zfm/4aaJQ0PZCOrfbkHQl/Sog4P75n/TSW9R28MHTLOO7VbKvU/PQA\ntwBbhTIWdjPp2KOZnQUAqhbm84F9b32qhm2tFXTTxKJxqvQUfecyuB+81fFOvW8XAjnXDpVC\nOscAPukmYxHqC9FK/xidstd7LzrZlvvoHpKuE1XI2Sf23EgbsCTBheN3nZqk8wwRHQ3ItBTu\ntYJXCb8gWH8vIiPYcMt5bMlL8qkqyPyHK9caUPgn6C9D4zq92Fdx/c6mUlv53U3t5fZvie27\nk5x2IXXwkkwp9y+cAS7+UEaeZAwUswdbxcJzbPEHXEUkFDWug/FqTYl6+rPYLWbwNof1K1MC\nAwEAAaOBqjCBpzAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFKaz4SsrSbbXc6GqlPUB\n53NlTKxQMA4GA1UdDwEB/wQEAwIBhjAdBgNVHQ4EFgQUprPhKytJttdzoaqU9QHnc2VMrFAw\nRAYDVR0gBD0wOzA5BgRVHSAAMDEwLwYIKwYBBQUHAgEWI2h0dHA6Ly9hY2VkaWNvbS5lZGlj\nb21ncm91cC5jb20vZG9jMA0GCSqGSIb3DQEBBQUAA4ICAQDOLAtSUWImfQwng4/F9tqgaHtP\nkl7qpHMyEVNEskTLnewPeUKzEKbHDZ3Ltvo/Onzqv4hTGzz3gvoFNTPhNahXwOf9jU8/kzJP\neGYDdwdY6ZXIfj7QeQCM8htRM5u8lOk6e25SLTKeI6RF+7YuE7CLGLHdztUdp0J/Vb77W7tH\n1PwkzQSulgUV1qzOMPPKC8W64iLgpq0i5ALudBF/TP94HTXa5gI06xgSYXcGCRZj6hitoocf\n8seACQl1ThCojz2GuHURwCRiipZ7SkXp7FnFvmuD5uHorLUwHv4FB4D54SMNUI8FmP8sX+g7\ntq3PgbUhh8oIKiMnMCArz+2UW6yyetLHKKGKC5tNSixthT8Jcjxn4tncB7rrZXtaAWPWkFtP\nF2Y9fwsZo5NjEFIqnxQWWOLcpfShFosOkYuByptZ+thrkQdlVV9SH686+5DdaaVbnG0OLLb6\nzqylfDJKZ0DcMDQj3dcEI2bw/FWAp/tmGYI1Z2JwOV5vx+qQQEQIHriy1tvuWacNGHk0vFQY\nXlPKNFHtRQrmjseCNj6nOGOpMCwXEGCSn1WHElkQwg9naRHMTh5+Spqtr0CodaxWkHS4oJyl\neW/c6RrIaQXpuvoDs3zk4E7Czp3otkYNbn5XOmeUwssfnHdKZ05phkOTOPu220+DkdRgfks+\nKzgHVZhepA==\n-----END CERTIFICATE-----\n",
  "Microsec e-Szigno Root CA 2009": "-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgIJAMJ+QwRORz8ZMA0GCSqGSIb3DQEBCwUAMIGCMQswCQYDVQQGEwJI\nVTERMA8GA1UEBwwIQnVkYXBlc3QxFjAUBgNVBAoMDU1pY3Jvc2VjIEx0ZC4xJzAlBgNVBAMM\nHk1pY3Jvc2VjIGUtU3ppZ25vIFJvb3QgQ0EgMjAwOTEfMB0GCSqGSIb3DQEJARYQaW5mb0Bl\nLXN6aWduby5odTAeFw0wOTA2MTYxMTMwMThaFw0yOTEyMzAxMTMwMThaMIGCMQswCQYDVQQG\nEwJIVTERMA8GA1UEBwwIQnVkYXBlc3QxFjAUBgNVBAoMDU1pY3Jvc2VjIEx0ZC4xJzAlBgNV\nBAMMHk1pY3Jvc2VjIGUtU3ppZ25vIFJvb3QgQ0EgMjAwOTEfMB0GCSqGSIb3DQEJARYQaW5m\nb0BlLXN6aWduby5odTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOn4j/NjrdqG\n2KfgQvvPkd6mJviZpWNwrZuuyjNAfW2WbqEORO7hE52UQlKavXWFdCyoDh2Tthi3jCyoz/tc\ncbna7P7ofo/kLx2yqHWH2Leh5TvPmUpG0IMZfcChEhyVbUr02MelTTMuhTlAdX4UfIASmFDH\nQWe4oIBhVKZsTh/gnQ4H6cm6M+f+wFUoLAKApxn1ntxVUwOXewdI/5n7N4okxFnMUBBjjqqp\nGrCEGob5X7uxUG6k0QrM1XF+H6cbfPVTbiJfyyvm1HxdrtbCxkzlBQHZ7Vf8wSN5/PrIJIOV\n87VqUQHQd9bpEqH5GoP7ghu5sJf0dgYzQ0mg/wu1+rUCAwEAAaOBgDB+MA8GA1UdEwEB/wQF\nMAMBAf8wDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBTLD8bfQkPMPcu1SCOhGnqmKrs0aDAf\nBgNVHSMEGDAWgBTLD8bfQkPMPcu1SCOhGnqmKrs0aDAbBgNVHREEFDASgRBpbmZvQGUtc3pp\nZ25vLmh1MA0GCSqGSIb3DQEBCwUAA4IBAQDJ0Q5eLtXMs3w+y/w9/w0olZMEyL/azXm4Q5Dw\npL7v8u8hmLzU1F0G9u5C7DBsoKqpyvGvivo/C3NqPuouQH4frlRheesuCDfXI/OMn74dseGk\nddug4lQUsbocKaQY9hK6ohQU4zE1yED/t+AFdlfBHFny+L/k7SViXITwfn4fs775tyERzAMB\nVnCnEJIeGzSBHq2cGsMEPO0CYdYeBvNfOofyK/FFh+U9rNHHV4S9a67c2Pm2G2JwCz02yULy\nMtd6YebS2z3PyKnJm9zbWETXbzivf3jTo60adbocwTZ8jx5tHMN1Rq41Bab2XD0h7lbwyYIi\nLXpUq3DDfSJlgnCW\n-----END CERTIFICATE-----\n",
  "E-Guven Kok Elektronik Sertifika Hizmet Saglayicisi": "-----BEGIN CERTIFICATE-----\nMIIDtjCCAp6gAwIBAgIQRJmNPMADJ72cdpW56tustTANBgkqhkiG9w0BAQUFADB1MQswCQYD\nVQQGEwJUUjEoMCYGA1UEChMfRWxla3Ryb25payBCaWxnaSBHdXZlbmxpZ2kgQS5TLjE8MDoG\nA1UEAxMzZS1HdXZlbiBLb2sgRWxla3Ryb25payBTZXJ0aWZpa2EgSGl6bWV0IFNhZ2xheWlj\naXNpMB4XDTA3MDEwNDExMzI0OFoXDTE3MDEwNDExMzI0OFowdTELMAkGA1UEBhMCVFIxKDAm\nBgNVBAoTH0VsZWt0cm9uaWsgQmlsZ2kgR3V2ZW5saWdpIEEuUy4xPDA6BgNVBAMTM2UtR3V2\nZW4gS29rIEVsZWt0cm9uaWsgU2VydGlmaWthIEhpem1ldCBTYWdsYXlpY2lzaTCCASIwDQYJ\nKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMMSIJ6wXgBljU5Gu4Bc6SwGl9XzcslwuedLZYDB\nS75+PNdUMZTe1RK6UxYC6lhj71vY8+0qGqpxSKPcEC1fX+tcS5yWCEIlKBHMilpiAVDV6wlT\nL/jDj/6z/P2douNffb7tC+Bg62nsM+3YjfsSSYMAyYuXjDtzKjKzEve5TfL0TW3H5tYmNwjy\n2f1rXKPlSFxYvEK+A1qBuhw1DADT9SN+cTAIJjjcJRFHLfO6IxClv7wC90Nex/6wN1CZew+T\nzuZDLMN+DfIcQ2Zgy2ExR4ejT669VmxMvLz4Bcpk9Ok0oSy1c+HCPujIyTQlCFzz7abHlJ+t\niEMl1+E5YP6sOVkCAwEAAaNCMEAwDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMBAf8w\nHQYDVR0OBBYEFJ/uRLOU1fqRTy7ZVZoEVtstxNulMA0GCSqGSIb3DQEBBQUAA4IBAQB/X7lT\nW2M9dTLn+sR0GstG30ZpHFLPqk/CaOv/gKlR6D1id4k9CnU58W5dF4dvaAXBlGzZXd/aslnL\npRCKysw5zZ/rTt5S/wzw9JKp8mxTq5vSR6AfdPebmvEvFZ96ZDAYBzwqD2fK/A+JYZ1lpTzl\nvBNbCNvj/+27BrtqBrF6T2XGgv0enIu1De5Iu7i9qgi0+6N8y5/NkHZchpZ4Vwpm+Vganf2X\nKWDeEaaQHBkc7gGWIjQ0LpH5t8Qn0Xvmv/uARFoW5evg1Ao4vOSR49XrXMGs3xtqfJ7lddK2\nl4fbzIcrQzqECK+rPNv3PGYxhrCdU3nt+CPeQuMtgvEP5fqX\n-----END CERTIFICATE-----\n",
  "GlobalSign Root CA - R3": "-----BEGIN CERTIFICATE-----\nMIIDXzCCAkegAwIBAgILBAAAAAABIVhTCKIwDQYJKoZIhvcNAQELBQAwTDEgMB4GA1UECxMX\nR2xvYmFsU2lnbiBSb290IENBIC0gUjMxEzARBgNVBAoTCkdsb2JhbFNpZ24xEzARBgNVBAMT\nCkdsb2JhbFNpZ24wHhcNMDkwMzE4MTAwMDAwWhcNMjkwMzE4MTAwMDAwWjBMMSAwHgYDVQQL\nExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMzETMBEGA1UEChMKR2xvYmFsU2lnbjETMBEGA1UE\nAxMKR2xvYmFsU2lnbjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMwldpB5Bngi\nFvXAg7aEyiie/QV2EcWtiHL8RgJDx7KKnQRfJMsuS+FggkbhUqsMgUdwbN1k0ev1LKMPgj0M\nK66X17YUhhB5uzsTgHeMCOFJ0mpiLx9e+pZo34knlTifBtc+ycsmWQ1z3rDI6SYOgxXG71uL\n0gRgykmmKPZpO/bLyCiR5Z2KYVc3rHQU3HTgOu5yLy6c+9C7v/U9AOEGM+iCK65TpjoWc4zd\nQQ4gOsC0p6Hpsk+QLjJg6VfLuQSSaGjlOCZgdbKfd/+RFO+uIEn8rUAVSNECMWEZXriX7613\nt2Saer9fwRPvm2L7DWzgVGkWqQPabumDk3F2xmmFghcCAwEAAaNCMEAwDgYDVR0PAQH/BAQD\nAgEGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFI/wS3+oLkUkrk1Q+mOai97i3Ru8MA0G\nCSqGSIb3DQEBCwUAA4IBAQBLQNvAUKr+yAzv95ZURUm7lgAJQayzE4aGKAczymvmdLm6AC2u\npArT9fHxD4q/c2dKg8dEe3jgr25sbwMpjjM5RcOO5LlXbKr8EpbsU8Yt5CRsuZRj+9xTaGdW\nPoO4zzUhw8lo/s7awlOqzJCK6fBdRoyV3XpYKBovHd7NADdBj+1EbddTKJd+82cEHhXXipa0\n095MJ6RMG3NzdvQXmcIfeg7jLQitChws/zyrVQ4PkX4268NXSb7hLi18YIvDQVETI53O9zJr\nlAGomecsMx86OyXShkDOOyyGeMlhLxS67ttVb9+E7gUJTb0o2HLO02JQZR7rkpeDMdmztcpH\nWD9f\n-----END CERTIFICATE-----\n",
  "TC TrustCenter Universal CA III": "-----BEGIN CERTIFICATE-----\nMIID4TCCAsmgAwIBAgIOYyUAAQACFI0zFQLkbPQwDQYJKoZIhvcNAQEFBQAwezELMAkGA1UE\nBhMCREUxHDAaBgNVBAoTE1RDIFRydXN0Q2VudGVyIEdtYkgxJDAiBgNVBAsTG1RDIFRydXN0\nQ2VudGVyIFVuaXZlcnNhbCBDQTEoMCYGA1UEAxMfVEMgVHJ1c3RDZW50ZXIgVW5pdmVyc2Fs\nIENBIElJSTAeFw0wOTA5MDkwODE1MjdaFw0yOTEyMzEyMzU5NTlaMHsxCzAJBgNVBAYTAkRF\nMRwwGgYDVQQKExNUQyBUcnVzdENlbnRlciBHbWJIMSQwIgYDVQQLExtUQyBUcnVzdENlbnRl\nciBVbml2ZXJzYWwgQ0ExKDAmBgNVBAMTH1RDIFRydXN0Q2VudGVyIFVuaXZlcnNhbCBDQSBJ\nSUkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDC2pxisLlxErALyBpXsq6DFJmz\nNEubkKLF5+cvAqBNLaT6hdqbJYUtQCggbergvbFIgyIpRJ9Og+41URNzdNW88jBmlFPAQDYv\nDIRlzg9uwliT6CwLOunBjvvya8o84pxOjuT5fdMnnxvVZ3iHLX8LR7PH6MlIfK8vzArZQe+f\n/prhsq75U7Xl6UafYOPfjdN/+5Z+s7Vy+EutCHnNaYlAJ/Uqwa1D7KRTyGG299J5KmcYdkht\nWyUB0SbFt1dpIxVbYYqt8Bst2a9c8SaQaanVDED1M4BDj5yjdipFtK+/fz6HP3bFzSreIMUW\nWMv5G/UPyw0RUmS40nZid4PxWJ//AgMBAAGjYzBhMB8GA1UdIwQYMBaAFFbn4VslQ4Dg9ozh\ncbyO5YAvxEjiMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBRW\n5+FbJUOA4PaM4XG8juWAL8RI4jANBgkqhkiG9w0BAQUFAAOCAQEAg8ev6n9NCjw5sWi+e22J\nLumzCecYV42FmhfzdkJQEw/HkG8zrcVJYCtsSVgZ1OK+t7+rSbyUyKu+KGwWaODIl0YgoGhn\nYIg5IFHYaAERzqf2EQf27OysGh+yZm5WZ2B6dF7AbZc2rrUNXWZzwCUyRdhKBgePxLcHsU0G\nDeGl6/R1yrqc0L2z0zIkTO5+4nYES0lT2PLpVDP85XEfPRRclkvxOvIAu2y0+pZVCIgJwcyR\nGSmwIC3/yzikQOEXvnlhgP8HA4ZMTnsGnxGGjYnuJ8Tb4rwZjgvDwxPHLQNjO9Po5KIqwoII\nlBZU8O8fJ5AluA0OKBtHd0e9HKgl8ZS0Zg==\n-----END CERTIFICATE-----\n",
  "Autoridad de Certificacion Firmaprofesional CIF A62634068": "-----BEGIN CERTIFICATE-----\nMIIGFDCCA/ygAwIBAgIIU+w77vuySF8wDQYJKoZIhvcNAQEFBQAwUTELMAkGA1UEBhMCRVMx\nQjBABgNVBAMMOUF1dG9yaWRhZCBkZSBDZXJ0aWZpY2FjaW9uIEZpcm1hcHJvZmVzaW9uYWwg\nQ0lGIEE2MjYzNDA2ODAeFw0wOTA1MjAwODM4MTVaFw0zMDEyMzEwODM4MTVaMFExCzAJBgNV\nBAYTAkVTMUIwQAYDVQQDDDlBdXRvcmlkYWQgZGUgQ2VydGlmaWNhY2lvbiBGaXJtYXByb2Zl\nc2lvbmFsIENJRiBBNjI2MzQwNjgwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDK\nlmuO6vj78aI14H9M2uDDUtd9thDIAl6zQyrET2qyyhxdKJp4ERppWVevtSBC5IsP5t9bpgOS\nL/UR5GLXMnE42QQMcas9UX4PB99jBVzpv5RvwSmCwLTaUbDBPLutN0pcyvFLNg4kq7/DhHf9\nqFD0sefGL9ItWY16Ck6WaVICqjaY7Pz6FIMMNx/Jkjd/14Et5cS54D40/mf0PmbR0/RAz15i\nNA9wBj4gGFrO93IbJWyTdBSTo3OxDqqHECNZXyAFGUftaI6SEspd/NYrspI8IM/hX68gvqB2\nf3bl7BqGYTM+53u0P6APjqK5am+5hyZvQWyIplD9amML9ZMWGxmPsu2bm8mQ9QEM3xk9Dz44\nI8kvjwzRAv4bVdZO0I08r0+k8/6vKtMFnXkIoctXMbScyJCyZ/QYFpM6/EfY0XiWMR+6Kwxf\nXZmtY4laJCB22N/9q06mIqqdXuYnin1oKaPnirjaEbsXLZmdEyRG98Xi2J+Of8ePdG1asuhy\n9azuJBCtLxTa/y2aRnFHvkLfuwHb9H/TKI8xWVvTyQKmtFLKbpf7Q8UIJm+K9Lv9nyiqDdVF\n8xM6HdjAeI9BZzwelGSuewvF6NkBiDkal4ZkQdU7hwxu+g/GvUgUvzlN1J5Bto+WHWOWk9mV\nBngxaJ43BjuAiUVhOSPHG0SjFeUc+JIwuwIDAQABo4HvMIHsMBIGA1UdEwEB/wQIMAYBAf8C\nAQEwDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBRlzeurNR4APn7VdMActHNHDhpkLzCBpgYD\nVR0gBIGeMIGbMIGYBgRVHSAAMIGPMC8GCCsGAQUFBwIBFiNodHRwOi8vd3d3LmZpcm1hcHJv\nZmVzaW9uYWwuY29tL2NwczBcBggrBgEFBQcCAjBQHk4AUABhAHMAZQBvACAAZABlACAAbABh\nACAAQgBvAG4AYQBuAG8AdgBhACAANAA3ACAAQgBhAHIAYwBlAGwAbwBuAGEAIAAwADgAMAAx\nADcwDQYJKoZIhvcNAQEFBQADggIBABd9oPm03cXF661LJLWhAqvdpYhKsg9VSytXjDvlMd3+\nxDLx51tkljYyGOylMnfX40S2wBEqgLk9am58m9Ot/MPWo+ZkKXzR4Tgegiv/J2Wv+xYVxC5x\nhOW1//qkR71kMrv2JYSiJ0L1ILDCExARzRAVukKQKtJE4ZYm6zFIEv0q2skGz3QeqUvVhyj5\neTSSPi5E6PaPT481PyWzOdxjKpBrIF/EUhJOlywqrJ2X3kjyo2bbwtKDlaZmp54lD+kLM5Fl\nClrD2VQS3a/DTg4fJl4N3LON7NWBcN7STyQF82xO9UxJZo3R/9ILJUFI/lGExkKvgATP0H5k\nSeTy36LssUzAKh3ntLFlosS88Zj0qnAHY7S42jtM+kAiMFsRpvAFDsYCA0irhpuF3dvd6qJ2\ngHN99ZwExEWN57kci57q13XRcrHedUTnQn3iV2t93Jm8PYMo6oCTjcVMZcFwgbg4/EMxsvYD\nNEeyrPsiBsse3RdHHF9mudMaotoRsaS8I8nkvof/uZS2+F0gStRf571oe2XyFR7SOqkt6dhr\nJKyXWERHrVkY8SFlcN7ONGCoQPHzPKTDKCOM/iczQ0CgFzzr6juwcqajuUpLXhZI9LK8yIyS\nxZ2frHI2vDSANGupi5LAuBft7HZT9SQBjLMi6Et8Vcad+qMUu2WFbm5PEn4KPJ2V\n-----END CERTIFICATE-----\n",
  "Izenpe.com": "-----BEGIN CERTIFICATE-----\nMIIF8TCCA9mgAwIBAgIQALC3WhZIX7/hy/WL1xnmfTANBgkqhkiG9w0BAQsFADA4MQswCQYD\nVQQGEwJFUzEUMBIGA1UECgwLSVpFTlBFIFMuQS4xEzARBgNVBAMMCkl6ZW5wZS5jb20wHhcN\nMDcxMjEzMTMwODI4WhcNMzcxMjEzMDgyNzI1WjA4MQswCQYDVQQGEwJFUzEUMBIGA1UECgwL\nSVpFTlBFIFMuQS4xEzARBgNVBAMMCkl6ZW5wZS5jb20wggIiMA0GCSqGSIb3DQEBAQUAA4IC\nDwAwggIKAoICAQDJ03rKDx6sp4boFmVqscIbRTJxldn+EFvMr+eleQGPicPK8lVx93e+d5Tz\ncqQsRNiekpsUOqHnJJAKClaOxdgmlOHZSOEtPtoKct2jmRXagaKH9HtuJneJWK3W6wyyQXpz\nbm3benhB6QiIEn6HLmYRY2xU+zydcsC8Lv/Ct90NduM61/e0aL6i9eOBbsFGb12N4E3GVFWJ\nGjMxCrFXuaOKmMPsOzTFlUFpfnXCPCDFYbpRR6AgkJOhkEvzTnyFRVSa0QUmQbC1TR0zvsQD\nyCV8wXDbO/QJLVQnSKwv4cSsPsjLkkxTOTcj7NMB+eAJRE1NZMDhDVqHIrytG6P+JrUV86f8\nhBnp7KGItERphIPzidF0BqnMC9bC3ieFUCbKF7jJeodWLBoBHmy+E60QrLUk9TiRodZL2vG7\n0t5HtfG8gfZZa88ZU+mNFctKy6lvROUbQc/hhqfK0GqfvEyNBjNaooXlkDWgYlwWTvDjovoD\nGrQscbNYLN57C9saD+veIR8GdwYDsMnvmfzAuU8Lhij+0rnq49qlw0dpEuDb8PYZi+17cNcC\n1u2HGCgsBCRMd+RIihrGO5rUD8r6ddIBQFqNeb+Lz0vPqhbBleStTIo+F5HUsWLlguWABKQD\nfo2/2n+iD5dPDNMN+9fR5XJ+HMh3/1uaD7euBUbl8agW7EekFwIDAQABo4H2MIHzMIGwBgNV\nHREEgagwgaWBD2luZm9AaXplbnBlLmNvbaSBkTCBjjFHMEUGA1UECgw+SVpFTlBFIFMuQS4g\nLSBDSUYgQTAxMzM3MjYwLVJNZXJjLlZpdG9yaWEtR2FzdGVpeiBUMTA1NSBGNjIgUzgxQzBB\nBgNVBAkMOkF2ZGEgZGVsIE1lZGl0ZXJyYW5lbyBFdG9yYmlkZWEgMTQgLSAwMTAxMCBWaXRv\ncmlhLUdhc3RlaXowDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYE\nFB0cZQ6o8iV7tJHP5LGx5r1VdGwFMA0GCSqGSIb3DQEBCwUAA4ICAQB4pgwWSp9MiDrAyw6l\nFn2fuUhfGI8NYjb2zRlrrKvV9pF9rnHzP7MOeIWblaQnIUdCSnxIOvVFfLMMjlF4rJUT3sb9\nfbgakEyrkgPH7UIBzg/YsfqikuFgba56awmqxinuaElnMIAkejEWOVt+8Rwu3WwJrfIxwYJO\nubv5vr8qhT/AQKM6WfxZSzwoJNu0FXWuDYi6LnPAvViH5ULy617uHjAimcs30cQhbIHsvm0m\n5hzkQiCeR7Csg1lwLDXWrzY0tM07+DKo7+N4ifuNRSzanLh+QBxh5z6ikixL8s36mLYp//Py\ne6kfLqCTVyvehQP5aTfLnnhqBbTFMXiJ7HqnheG5ezzevh55hM6fcA5ZwjUukCox2eRFekGk\nLhObNA5me0mrZJfQRsN5nXJQY6aYWwa9SG3YOYNw6DXwBdGqvOPbyALqfP2C2sJbUjWumDqt\nujWTI6cfSN01RpiyEGjkpTHCClguGYEQyVB1/OpaFs4R1+7vUIgtYf8/QnMFlEPVjjxOAToZ\npR9GTnfQXeWBIiGH/pR9hNiTrdZoQ0iy2+tzJOeRf1SktoA+naM8THLCV8Sg1Mw4J87VBp6i\nSNnpn86CcDaTmjvfliHjWbcM2pE38P1ZWrOZyGlsQyYBNWNgVYkDOnXYukrZVP/u3oDYLdE4\n1V4tC5h9Pmzb/CaIxw==\n-----END CERTIFICATE-----\n",
  "Chambers of Commerce Root - 2008": "-----BEGIN CERTIFICATE-----\nMIIHTzCCBTegAwIBAgIJAKPaQn6ksa7aMA0GCSqGSIb3DQEBBQUAMIGuMQswCQYDVQQGEwJF\nVTFDMEEGA1UEBxM6TWFkcmlkIChzZWUgY3VycmVudCBhZGRyZXNzIGF0IHd3dy5jYW1lcmZp\ncm1hLmNvbS9hZGRyZXNzKTESMBAGA1UEBRMJQTgyNzQzMjg3MRswGQYDVQQKExJBQyBDYW1l\ncmZpcm1hIFMuQS4xKTAnBgNVBAMTIENoYW1iZXJzIG9mIENvbW1lcmNlIFJvb3QgLSAyMDA4\nMB4XDTA4MDgwMTEyMjk1MFoXDTM4MDczMTEyMjk1MFowga4xCzAJBgNVBAYTAkVVMUMwQQYD\nVQQHEzpNYWRyaWQgKHNlZSBjdXJyZW50IGFkZHJlc3MgYXQgd3d3LmNhbWVyZmlybWEuY29t\nL2FkZHJlc3MpMRIwEAYDVQQFEwlBODI3NDMyODcxGzAZBgNVBAoTEkFDIENhbWVyZmlybWEg\nUy5BLjEpMCcGA1UEAxMgQ2hhbWJlcnMgb2YgQ29tbWVyY2UgUm9vdCAtIDIwMDgwggIiMA0G\nCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCvAMtwNyuAWko6bHiUfaN/Gh/2NdW928sNRHI+\nJrKQUrpjOyhYb6WzbZSm891kDFX29ufyIiKAXuFixrYp4YFs8r/lfTJqVKAyGVn+H4vXPWCG\nhSRv4xGzdz4gljUha7MI2XAuZPeEklPWDrCQiorjh40G072QDuKZoRuGDtqaCrsLYVAGUvGe\nf3bsyw/QHg3PmTA9HMRFEFis1tPo1+XqxQEHd9ZR5gN/ikilTWh1uem8nk4ZcfUyS5xtYBkL\n+8ydddy/Js2Pk3g5eXNeJQ7KXOt3EgfLZEFHcpOrUMPrCXZkNNI5t3YRCQ12RcSprj1qr7V9\nZS+UWBDsXHyvfuK2GNnQm05aSd+pZgvMPMZ4fKecHePOjlO+Bd5gD2vlGts/4+EhySnB8esH\nnFIbAURRPHsl18TlUlRdJQfKFiC4reRB7noI/plvg6aRArBsNlVq5331lubKgdaX8ZSD6e2w\nsWsSaR6s+12pxZjptFtYer49okQ6Y1nUCyXeG0+95QGezdIp1Z8XGQpvvwyQ0wlf2eOKNcx5\nWk0ZN5K3xMGtr/R5JJqyAQuxr1yW84Ay+1w9mPGgP0revq+ULtlVmhduYJ1jbLhjya6BXBg1\n4JC7vjxPNyK5fuvPnnchpj04gftI2jE9K+OJ9dC1vX7gUMQSibMjmhAxhduub+84Mxh2EQID\nAQABo4IBbDCCAWgwEgYDVR0TAQH/BAgwBgEB/wIBDDAdBgNVHQ4EFgQU+SSsD7K1+HnA+mCI\nG8TZTQKeFxkwgeMGA1UdIwSB2zCB2IAU+SSsD7K1+HnA+mCIG8TZTQKeFxmhgbSkgbEwga4x\nCzAJBgNVBAYTAkVVMUMwQQYDVQQHEzpNYWRyaWQgKHNlZSBjdXJyZW50IGFkZHJlc3MgYXQg\nd3d3LmNhbWVyZmlybWEuY29tL2FkZHJlc3MpMRIwEAYDVQQFEwlBODI3NDMyODcxGzAZBgNV\nBAoTEkFDIENhbWVyZmlybWEgUy5BLjEpMCcGA1UEAxMgQ2hhbWJlcnMgb2YgQ29tbWVyY2Ug\nUm9vdCAtIDIwMDiCCQCj2kJ+pLGu2jAOBgNVHQ8BAf8EBAMCAQYwPQYDVR0gBDYwNDAyBgRV\nHSAAMCowKAYIKwYBBQUHAgEWHGh0dHA6Ly9wb2xpY3kuY2FtZXJmaXJtYS5jb20wDQYJKoZI\nhvcNAQEFBQADggIBAJASryI1wqM58C7e6bXpeHxIvj99RZJe6dqxGfwWPJ+0W2aeaufDuV2I\n6A+tzyMP3iU6XsxPpcG1Lawk0lgH3qLPaYRgM+gQDROpI9CF5Y57pp49chNyM/WqfcZjHwj0\n/gF/JM8rLFQJ3uIrbZLGOU8W6jx+ekbURWpGqOt1glanq6B8aBMz9p0w8G8nOSQjKpD9kCk1\n8pPfNKXG9/jvjA9iSnyu0/VU+I22mlaHFoI6M6taIgj3grrqLuBHmrS1RaMFO9ncLkVAO+rc\nf+g769HsJtg1pDDFOqxXnrN2pSB7+R5KBWIBpih1YJeSDW4+TTdDDZIVnBgizVGZoCkaPF+K\nMjNbMMeJL0eYD6MDxvbxrN8y8NmBGuScvfaAFPDRLLmF9dijscilIeUcE5fuDr3fKanvNFNb\n0+RqE4QGtjICxFKuItLcsiFCGtpA8CnJ7AoMXOLQusxI0zcKzBIKinmwPQN/aUv0NCB9szTq\njktk9T79syNnFQ0EuPAtwQlRPLJsFfClI9eDdOTlLsn+mCdCxqvGnrDQWzilm1DefhiYtUU7\n9nm06PcaewaD+9CL2rvHvRirCG88gGtAPxkZumWK5r7VXNM21+9AUiRgOGcEMeyP84LG3rlV\n8zsxkVrctQgVrXYlCg17LofiDKYGvCYQbTed7N14jHyAxfDZd0jQ\n-----END CERTIFICATE-----\n",
  "Global Chambersign Root - 2008": "-----BEGIN CERTIFICATE-----\nMIIHSTCCBTGgAwIBAgIJAMnN0+nVfSPOMA0GCSqGSIb3DQEBBQUAMIGsMQswCQYDVQQGEwJF\nVTFDMEEGA1UEBxM6TWFkcmlkIChzZWUgY3VycmVudCBhZGRyZXNzIGF0IHd3dy5jYW1lcmZp\ncm1hLmNvbS9hZGRyZXNzKTESMBAGA1UEBRMJQTgyNzQzMjg3MRswGQYDVQQKExJBQyBDYW1l\ncmZpcm1hIFMuQS4xJzAlBgNVBAMTHkdsb2JhbCBDaGFtYmVyc2lnbiBSb290IC0gMjAwODAe\nFw0wODA4MDExMjMxNDBaFw0zODA3MzExMjMxNDBaMIGsMQswCQYDVQQGEwJFVTFDMEEGA1UE\nBxM6TWFkcmlkIChzZWUgY3VycmVudCBhZGRyZXNzIGF0IHd3dy5jYW1lcmZpcm1hLmNvbS9h\nZGRyZXNzKTESMBAGA1UEBRMJQTgyNzQzMjg3MRswGQYDVQQKExJBQyBDYW1lcmZpcm1hIFMu\nQS4xJzAlBgNVBAMTHkdsb2JhbCBDaGFtYmVyc2lnbiBSb290IC0gMjAwODCCAiIwDQYJKoZI\nhvcNAQEBBQADggIPADCCAgoCggIBAMDfVtPkOpt2RbQT2//BthmLN0EYlVJH6xedKYiONWwG\nMi5HYvNJBL99RDaxccy9Wglz1dmFRP+RVyXfXjaOcNFccUMd2drvXNL7G706tcuto8xEpw2u\nIRU/uXpbknXYpBI4iRmKt4DS4jJvVpyR1ogQC7N0ZJJ0YPP2zxhPYLIj0Mc7zmFLmY/CDNBA\nspjcDahOo7kKrmCgrUVSY7pmvWjg+b4aqIG7HkF4ddPB/gBVsIdU6CeQNR1MM62X/JcumIS/\nLMmjv9GYERTtY/jKmIhYF5ntRQOXfjyGHoiMvvKRhI9lNNgATH23MRdaKXoKGCQwoze1eqkB\nfSbW+Q6OWfH9GzO1KTsXO0G2Id3UwD2ln58fQ1DJu7xsepeY7s2MH/ucUa6LcL0nn3HAa6x9\nkGbo1106DbDVwo3VyJ2dwW3Q0L9R5OP4wzg2rtandeavhENdk5IMagfeOx2YItaswTXbo6Al\n/3K1dh3ebeksZixShNBFks4c5eUzHdwHU1SjqoI7mjcv3N2gZOnm3b2u/GSFHTynyQbehP9r\n6GsaPMWis0L7iwk+XwhSx2LE1AVxv8Rk5Pihg+g+EpuoHtQ2TS9x9o0o9oOpE9JhwZG7SMA0\nj0GMS0zbaRL/UJScIINZc+18ofLx/d33SdNDWKBWY8o9PeU1VlnpDsogzCtLkykPAgMBAAGj\nggFqMIIBZjASBgNVHRMBAf8ECDAGAQH/AgEMMB0GA1UdDgQWBBS5CcqcHtvTbDprru1U8VuT\nBjUuXjCB4QYDVR0jBIHZMIHWgBS5CcqcHtvTbDprru1U8VuTBjUuXqGBsqSBrzCBrDELMAkG\nA1UEBhMCRVUxQzBBBgNVBAcTOk1hZHJpZCAoc2VlIGN1cnJlbnQgYWRkcmVzcyBhdCB3d3cu\nY2FtZXJmaXJtYS5jb20vYWRkcmVzcykxEjAQBgNVBAUTCUE4Mjc0MzI4NzEbMBkGA1UEChMS\nQUMgQ2FtZXJmaXJtYSBTLkEuMScwJQYDVQQDEx5HbG9iYWwgQ2hhbWJlcnNpZ24gUm9vdCAt\nIDIwMDiCCQDJzdPp1X0jzjAOBgNVHQ8BAf8EBAMCAQYwPQYDVR0gBDYwNDAyBgRVHSAAMCow\nKAYIKwYBBQUHAgEWHGh0dHA6Ly9wb2xpY3kuY2FtZXJmaXJtYS5jb20wDQYJKoZIhvcNAQEF\nBQADggIBAICIf3DekijZBZRG/5BXqfEv3xoNa/p8DhxJJHkn2EaqbylZUohwEurdPfWbU1Rv\n4WCiqAm57OtZfMY18dwY6fFn5a+6ReAJ3spED8IXDneRRXozX1+WLGiLwUePmJs9wOzL9dWC\nkoQ10b42OFZyMVtHLaoXpGNR6woBrX/sdZ7LoR/xfxKxueRkf2fWIyr0uDldmOghp+G9PUIa\ndJpwr2hsUF1Jz//7Dl3mLEfXgTpZALVza2Mg9jFFCDkO9HB+QHBaP9BrQql0PSgvAm11cpUJ\njUhjxsYjV5KTXjXBjfkK9yydYhz2rXzdpjEetrHHfoUm+qRqtdpjMNHvkzeyZi99Bffnt0uY\nlDXA2TopwZ2yUDMdSqlapskD7+3056huirRXhOukP9DuqqqHW2Pok+JrqNS4cnhrG+055F3L\nm6qH1U9OAP7Zap88MQ8oAgF9mOinsKJknnn4SPIVqczmyETrP3iZ8ntxPjzxmKfFGBI/5rso\nM0LpRQp8bfKGeS/Fghl9CYl8slR2iK7ewfPM4W7bMdaTrpmg7yVqc5iJWzouE4gev8CSlDQb\n4ye3ix5vQv/n6TebUB0tovkC7stYWDpxvGjjqsGvHCgfotwjZT+B6q6Z09gwzxMNTxXJhLyn\nSC34MCN32EZLeW32jO06f2ARePTpm67VVMB0gNELQp/B\n-----END CERTIFICATE-----\n",
  "Go Daddy Root Certificate Authority - G2": "-----BEGIN CERTIFICATE-----\nMIIDxTCCAq2gAwIBAgIBADANBgkqhkiG9w0BAQsFADCBgzELMAkGA1UEBhMCVVMxEDAOBgNV\nBAgTB0FyaXpvbmExEzARBgNVBAcTClNjb3R0c2RhbGUxGjAYBgNVBAoTEUdvRGFkZHkuY29t\nLCBJbmMuMTEwLwYDVQQDEyhHbyBEYWRkeSBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eSAt\nIEcyMB4XDTA5MDkwMTAwMDAwMFoXDTM3MTIzMTIzNTk1OVowgYMxCzAJBgNVBAYTAlVTMRAw\nDgYDVQQIEwdBcml6b25hMRMwEQYDVQQHEwpTY290dHNkYWxlMRowGAYDVQQKExFHb0RhZGR5\nLmNvbSwgSW5jLjExMC8GA1UEAxMoR28gRGFkZHkgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp\ndHkgLSBHMjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL9xYgjx+lk09xvJGKP3\ngElY6SKDE6bFIEMBO4Tx5oVJnyfq9oQbTqC023CYxzIBsQU+B07u9PpPL1kwIuerGVZr4oAH\n/PMWdYA5UXvl+TW2dE6pjYIT5LY/qQOD+qK+ihVqf94Lw7YZFAXK6sOoBJQ7RnwyDfMAZiLI\njWltNowRGLfTshxgtDj6AozO091GB94KPutdfMh8+7ArU6SSYmlRJQVhGkSBjCypQ5Yj36w6\ngZoOKcUcqeldHraenjAKOc7xiID7S13MMuyFYkMlNAJWJwGRtDtwKj9useiciAF9n9T521Nt\nYJ2/LOdYq7hfRvzOxBsDPAnrSTFcaUaz4EcCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAO\nBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFDqahQcQZyi27/a9BUFuIMGU2g/eMA0GCSqGSIb3\nDQEBCwUAA4IBAQCZ21151fmXWWcDYfF+OwYxdS2hII5PZYe096acvNjpL9DbWu7PdIxztDhC\n2gV7+AJ1uP2lsdeu9tfeE8tTEH6KRtGX+rcuKxGrkLAngPnon1rpN5+r5N9ss4UXnT3ZJE95\nkTXWXwTrgIOrmgIttRD02JDHBHNA7XIloKmf7J6raBKZV8aPEjoJpL1E/QYVN8Gb5DKj7Tjo\n2GTzLH4U/ALqn83/B2gX2yKQOC16jdFU8WnjXzPKej17CuPKf1855eJ1usV2GDPOLPAvTK33\nsefOT6jEm0pUBsV/fdUID+Ic/n4XuKxe9tQWskMJDE32p2u0mYRlynqI4uJEvlz36hz1\n-----END CERTIFICATE-----\n",
  "Starfield Root Certificate Authority - G2": "-----BEGIN CERTIFICATE-----\nMIID3TCCAsWgAwIBAgIBADANBgkqhkiG9w0BAQsFADCBjzELMAkGA1UEBhMCVVMxEDAOBgNV\nBAgTB0FyaXpvbmExEzARBgNVBAcTClNjb3R0c2RhbGUxJTAjBgNVBAoTHFN0YXJmaWVsZCBU\nZWNobm9sb2dpZXMsIEluYy4xMjAwBgNVBAMTKVN0YXJmaWVsZCBSb290IENlcnRpZmljYXRl\nIEF1dGhvcml0eSAtIEcyMB4XDTA5MDkwMTAwMDAwMFoXDTM3MTIzMTIzNTk1OVowgY8xCzAJ\nBgNVBAYTAlVTMRAwDgYDVQQIEwdBcml6b25hMRMwEQYDVQQHEwpTY290dHNkYWxlMSUwIwYD\nVQQKExxTdGFyZmllbGQgVGVjaG5vbG9naWVzLCBJbmMuMTIwMAYDVQQDEylTdGFyZmllbGQg\nUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgLSBHMjCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAL3twQP89o/8ArFvW59I2Z154qK3A2FWGMNHttfKPTUuiUP3oWmb3ooa/RMg\nnLRJdzIpVv257IzdIvpy3Cdhl+72WoTsbhm5iSzchFvVdPtrX8WJpRBSiUZV9Lh1HOZ/5FSu\nS/hVclcCGfgXcVnrHigHdMWdSL5stPSksPNkN3mSwOxGXn/hbVNMYq/NHwtjuzqd+/x5AJhh\ndM8mgkBj87JyahkNmcrUDnXMN/uLicFZ8WJ/X7NfZTD4p7dNdloedl40wOiWVpmKs/B/pM29\n3DIxfJHP4F8R+GuqSVzRmZTRouNjWwl2tVZi4Ut0HZbUJtQIBFnQmA4O5t78w+wfkPECAwEA\nAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFHwMMh+n\n2TB/xH1oo2Kooc6rB1snMA0GCSqGSIb3DQEBCwUAA4IBAQARWfolTwNvlJk7mh+ChTnUdgWU\nXuEok21iXQnCoKjUsHU48TRqneSfioYmUeYs0cYtbpUgSpIB7LiKZ3sx4mcujJUDJi5DnUox\n9g61DLu34jd/IroAow57UvtruzvE03lRTs2Q9GcHGcg8RnoNAX3FWOdt5oUwF5okxBDgBPfg\n8n/Uqgr/Qh037ZTlZFkSIHc40zI+OIF1lnP6aI+xy84fxez6nH7PfrHxBy22/L/KpL/QlwVK\nvOoYKAKQvVR4CSFx09F9HdkWsKlhPdAKACL8x3vLCWRFCztAgfd9fDL1mMpYjn0q7pBZc2T5\nNnReJaH1ZgUufzkVqSr7UIuOhWn0\n-----END CERTIFICATE-----\n",
  "Starfield Services Root Certificate Authority - G2": "-----BEGIN CERTIFICATE-----\nMIID7zCCAtegAwIBAgIBADANBgkqhkiG9w0BAQsFADCBmDELMAkGA1UEBhMCVVMxEDAOBgNV\nBAgTB0FyaXpvbmExEzARBgNVBAcTClNjb3R0c2RhbGUxJTAjBgNVBAoTHFN0YXJmaWVsZCBU\nZWNobm9sb2dpZXMsIEluYy4xOzA5BgNVBAMTMlN0YXJmaWVsZCBTZXJ2aWNlcyBSb290IENl\ncnRpZmljYXRlIEF1dGhvcml0eSAtIEcyMB4XDTA5MDkwMTAwMDAwMFoXDTM3MTIzMTIzNTk1\nOVowgZgxCzAJBgNVBAYTAlVTMRAwDgYDVQQIEwdBcml6b25hMRMwEQYDVQQHEwpTY290dHNk\nYWxlMSUwIwYDVQQKExxTdGFyZmllbGQgVGVjaG5vbG9naWVzLCBJbmMuMTswOQYDVQQDEzJT\ndGFyZmllbGQgU2VydmljZXMgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgLSBHMjCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANUMOsQq+U7i9b4Zl1+OiFOxHz/Lz58gE20p\nOsgPfTz3a3Y4Y9k2YKibXlwAgLIvWX/2h/klQ4bnaRtSmpDhcePYLQ1Ob/bISdm28xpWriu2\ndBTrz/sm4xq6HZYuajtYlIlHVv8loJNwU4PahHQUw2eeBGg6345AWh1KTs9DkTvnVtYAcMtS\n7nt9rjrnvDH5RfbCYM8TWQIrgMw0R9+53pBlbQLPLJGmpufehRhJfGZOozptqbXuNC66DQO4\nM99H67FrjSXZm86B0UVGMpZwh94CDklDhbZsc7tk6mFBrMnUVN+HL8cisibMn1lUaJ/8viov\nxFUcdUBgF4UCVTmLfwUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC\nAQYwHQYDVR0OBBYEFJxfAN+qAdcwKziIorhtSpzyEZGDMA0GCSqGSIb3DQEBCwUAA4IBAQBL\nNqaEd2ndOxmfZyMIbw5hyf2E3F/YNoHN2BtBLZ9g3ccaaNnRbobhiCPPE95Dz+I0swSdHynV\nv/heyNXBve6SbzJ08pGCL72CQnqtKrcgfU28elUSwhXqvfdqlS5sdJ/PHLTyxQGjhdByPq1z\nqwubdQxtRbeOlKyWN7Wg0I8VRw7j6IPdj/3vQQF3zCepYoUz8jcI73HPdwbeyBkdiEDPfUYd\n/x7H4c7/I9vG+o1VTqkC50cRRj70/b17KSa7qWFiNyi2LSr2EIZkyXCn0q23KXB56jzaYyWf\n/Wi3MOxw+3WKt21gZ7IeyLnp2KhvAotnDU0mV3HaIPzBSlCNsSi6\n-----END CERTIFICATE-----\n",
  "AffirmTrust Commercial": "-----BEGIN CERTIFICATE-----\nMIIDTDCCAjSgAwIBAgIId3cGJyapsXwwDQYJKoZIhvcNAQELBQAwRDELMAkGA1UEBhMCVVMx\nFDASBgNVBAoMC0FmZmlybVRydXN0MR8wHQYDVQQDDBZBZmZpcm1UcnVzdCBDb21tZXJjaWFs\nMB4XDTEwMDEyOTE0MDYwNloXDTMwMTIzMTE0MDYwNlowRDELMAkGA1UEBhMCVVMxFDASBgNV\nBAoMC0FmZmlybVRydXN0MR8wHQYDVQQDDBZBZmZpcm1UcnVzdCBDb21tZXJjaWFsMIIBIjAN\nBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9htPZwcroRX1BiLLHwGy43NFBkRJLLtJJRTW\nzsO3qyxPxkEylFf6EqdbDuKPHx6GGaeqtS25Xw2Kwq+FNXkyLbscYjfysVtKPcrNcV/pQr6U\n6Mje+SJIZMblq8Yrba0F8PrVC8+a5fBQpIs7R6UjW3p6+DM/uO+Zl+MgwdYoic+U+7lF7eNA\nFxHUdPALMeIrJmqbTFeurCA+ukV6BfO9m2kVrn1OIGPENXY6BwLJN/3HR+7o8XYdcxXyl6S1\nyHp52UKqK39c/s4mT6NmgTWvRLpUHhwwMmWd5jyTXlBOeuM61G7MGvv50jeuJCqrVwMiKA1J\ndX+3KNp1v47j3A55MQIDAQABo0IwQDAdBgNVHQ4EFgQUnZPGU4teyq8/nx4P5ZmVvCT2lI8w\nDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQELBQADggEBAFis\n9AQOzcAN/wr91LoWXym9e2iZWEnStB03TX8nfUYGXUPGhi4+c7ImfU+TqbbEKpqrIZcUsd6M\n06uJFdhrJNTxFq7YpFzUf1GO7RgBsZNjvbz4YYCanrHOQnDiqX0GJX0nof5v7LMeJNrjS1Ua\nADs1tDvZ110w/YETifLCBivtZ8SOyUOyXGsViQK8YvxO8rUzqrJv0wqiUOP2O+guRMLbZjip\nM1ZI8W0bM40NjD9gN53Tym1+NH4Nn3J2ixufcv1SNUFFApYvHLKac0khsUlHRUe072o0EclN\nmsxZt9YCnlpOZbWUrhvfKbAW8b8Angc6F2S1BLUjIZkKlTuXfO8=\n-----END CERTIFICATE-----\n",
  "AffirmTrust Networking": "-----BEGIN CERTIFICATE-----\nMIIDTDCCAjSgAwIBAgIIfE8EORzUmS0wDQYJKoZIhvcNAQEFBQAwRDELMAkGA1UEBhMCVVMx\nFDASBgNVBAoMC0FmZmlybVRydXN0MR8wHQYDVQQDDBZBZmZpcm1UcnVzdCBOZXR3b3JraW5n\nMB4XDTEwMDEyOTE0MDgyNFoXDTMwMTIzMTE0MDgyNFowRDELMAkGA1UEBhMCVVMxFDASBgNV\nBAoMC0FmZmlybVRydXN0MR8wHQYDVQQDDBZBZmZpcm1UcnVzdCBOZXR3b3JraW5nMIIBIjAN\nBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtITMMxcua5Rsa2FSoOujz3mUTOWUgJnLVWRE\nZY9nZOIG41w3SfYvm4SEHi3yYJ0wTsyEheIszx6e/jarM3c1RNg1lho9Nuh6DtjVR6FqaYvZ\n/Ls6rnla1fTWcbuakCNrmreIdIcMHl+5ni36q1Mr3Lt2PpNMCAiMHqIjHNRqrSK6mQEubWXL\nviRmVSRLQESxG9fhwoXA3hA/Pe24/PHxI1Pcv2WXb9n5QHGNfb2V1M6+oF4nI979ptAmDgAp\n6zxG8D1gvz9Q0twmQVGeFDdCBKNwV6gbh+0t+nvujArjqWaJGctB+d1ENmHP4ndGyH329JKB\nNv3bNPFyfvMMFr20FQIDAQABo0IwQDAdBgNVHQ4EFgQUBx/S55zawm6iQLSwelAQUHTEyL0w\nDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQEFBQADggEBAIlX\nshZ6qML91tmbmzTCnLQyFE2npN/svqe++EPbkTfOtDIuUFUaNU52Q3Eg75N3ThVwLofDwR1t\n3Mu1J9QsVtFSUzpE0nPIxBsFZVpikpzuQY0x2+c06lkh1QF612S4ZDnNye2v7UsDSKegmQGA\n3GWjNq5lWUhPgkvIZfFXHeVZLgo/bNjR9eUJtGxUAArgFU2HdW23WJZa3W3SAKD0m0i+wzek\nujbgfIeFlxoVot4uolu9rxj5kFDNcFn4J2dHy8egBzp90SxdbBk6ZrV9/ZFvgrG+CJPbFEfx\nojfHRZ48x3evZKiT3/Zpg4Jg8klCNO1aAFSFHBY2kgxc+qatv9s=\n-----END CERTIFICATE-----\n",
  "AffirmTrust Premium": "-----BEGIN CERTIFICATE-----\nMIIFRjCCAy6gAwIBAgIIbYwURrGmCu4wDQYJKoZIhvcNAQEMBQAwQTELMAkGA1UEBhMCVVMx\nFDASBgNVBAoMC0FmZmlybVRydXN0MRwwGgYDVQQDDBNBZmZpcm1UcnVzdCBQcmVtaXVtMB4X\nDTEwMDEyOTE0MTAzNloXDTQwMTIzMTE0MTAzNlowQTELMAkGA1UEBhMCVVMxFDASBgNVBAoM\nC0FmZmlybVRydXN0MRwwGgYDVQQDDBNBZmZpcm1UcnVzdCBQcmVtaXVtMIICIjANBgkqhkiG\n9w0BAQEFAAOCAg8AMIICCgKCAgEAxBLfqV/+Qd3d9Z+K4/as4Tx4mrzY8H96oDMq3I0gW64t\nb+eT2TZwamjPjlGjhVtnBKAQJG9dKILBl1fYSCkTtuG+kU3fhQxTGJoeJKJPj/CihQvL9Cl/\n0qRY7iZNyaqoe5rZ+jjeRFcV5fiMyNlI4g0WJx0eyIOFJbe6qlVBzAMiSy2RjYvmia9mx+n/\nK+k8rNrSs8PhaJyJ+HoAVt70VZVs+7pk3WKL3wt3MutizCaam7uqYoNMtAZ6MMgpv+0GTZe5\nHMQxK9VfvFMSF5yZVylmd2EhMQcuJUmdGPLu8ytxjLW6OQdJd/zvLpKQBY0tL3d770O/Nbua\n2Plzpyzy0FfuKE4mX4+QaAkvuPjcBukumj5Rp9EixAqnOEhss/n/fauGV+O61oV4d7pD6kh/\n9ti+I20ev9E2bFhc8e6kGVQa9QPSdubhjL08s9NIS+LI+H+SqHZGnEJlPqQewQcDWkYtuJfz\nt9WyVSHvutxMAJf7FJUnM7/oQ0dG0giZFmA7mn7S5u046uwBHjxIVkkJx0w3AJ6IDsBz4W9m\n6XJHMD4Q5QsDyZpCAGzFlH5hxIrff4IaC1nEWTJ3s7xgaVY5/bQGeyzWZDbZvUjthB9+pSKP\nKrhC9IK31FOQeE4tGv2Bb0TXOwF0lkLgAOIua+rF7nKsu7/+6qqo+Nz2snmKtmcCAwEAAaNC\nMEAwHQYDVR0OBBYEFJ3AZ6YMItkm9UWrpmVSESfYRaxjMA8GA1UdEwEB/wQFMAMBAf8wDgYD\nVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBDAUAA4ICAQCzV00QYk465KzquByvMiPIs0laUZx2\nKI15qldGF9X1Uva3ROgIRL8YhNILgM3FEv0AVQVhh0HctSSePMTYyPtwni94loMgNt58D2kT\niKV1NpgIpsbfrM7jWNa3Pt668+s0QNiigfV4Py/VpfzZotReBA4Xrf5B8OWycvpEgjNC6C1Y\n91aMYj+6QrCcDFx+LmUmXFNPALJ4fqENmS2NuB2OosSw/WDQMKSOyARiqcTtNd56l+0OOF6S\nL5Nwpamcb6d9Ex1+xghIsV5n61EIJenmJWtSKZGc0jlzCFfemQa0W50QBuHCAKi4HEoCChTQ\nwUHK+4w1IX2COPKpVJEZNZOUbWo6xbLQu4mGk+ibyQ86p3q4ofB4Rvr8Ny/lioTz3/4E2aFo\noC8k4gmVBtWVyuEklut89pMFu+1z6S3RdTnX5yTb2E5fQ4+e0BQ5v1VwSJlXMbSc7kqYA5Yw\nH2AG7hsj/oFgIxpHYoWlzBk0gG+zrBrjn/B7SK3VAdlntqlyk+otZrWyuOQ9PLLvTIzq6we/\nqzWaVYa8GKa1qF60g2xraUDTn9zxw2lrueFtCfTxqlB2Cnp9ehehVZZCmTEJ3WARjQUwfuaO\nRtGdFNrHF+QFlozEJLUbzxQHskD4o55BhrwE0GuWyCqANP2/7waj3VjFhT0+j/6eKeC2uAlo\nGRwYQw==\n-----END CERTIFICATE-----\n",
  "AffirmTrust Premium ECC": "-----BEGIN CERTIFICATE-----\nMIIB/jCCAYWgAwIBAgIIdJclisc/elQwCgYIKoZIzj0EAwMwRTELMAkGA1UEBhMCVVMxFDAS\nBgNVBAoMC0FmZmlybVRydXN0MSAwHgYDVQQDDBdBZmZpcm1UcnVzdCBQcmVtaXVtIEVDQzAe\nFw0xMDAxMjkxNDIwMjRaFw00MDEyMzExNDIwMjRaMEUxCzAJBgNVBAYTAlVTMRQwEgYDVQQK\nDAtBZmZpcm1UcnVzdDEgMB4GA1UEAwwXQWZmaXJtVHJ1c3QgUHJlbWl1bSBFQ0MwdjAQBgcq\nhkjOPQIBBgUrgQQAIgNiAAQNMF4bFZ0D0KF5Nbc6PJJ6yhUczWLznCZcBz3lVPqj1swS6vQU\nX+iOGasvLkjmrBhDeKzQN8O9ss0s5kfiGuZjuD0uL3jET9v0D6RoTFVya5UdThhClXjMNzyR\n4ptlKymjQjBAMB0GA1UdDgQWBBSaryl6wBE1NSZRMADDav5A1a7WPDAPBgNVHRMBAf8EBTAD\nAQH/MA4GA1UdDwEB/wQEAwIBBjAKBggqhkjOPQQDAwNnADBkAjAXCfOHiFBar8jAQr9HX/Vs\naobgxCd05DhT1wV/GzTjxi+zygk8N53X57hG8f2h4nECMEJZh0PUUd+60wkyWs6Iflc9nF9C\na/UHLbXwgpP5WW+uZPpY5Yse42O+tYHNbwKMeQ==\n-----END CERTIFICATE-----\n",
  "Certum Trusted Network CA": "-----BEGIN CERTIFICATE-----\nMIIDuzCCAqOgAwIBAgIDBETAMA0GCSqGSIb3DQEBBQUAMH4xCzAJBgNVBAYTAlBMMSIwIAYD\nVQQKExlVbml6ZXRvIFRlY2hub2xvZ2llcyBTLkEuMScwJQYDVQQLEx5DZXJ0dW0gQ2VydGlm\naWNhdGlvbiBBdXRob3JpdHkxIjAgBgNVBAMTGUNlcnR1bSBUcnVzdGVkIE5ldHdvcmsgQ0Ew\nHhcNMDgxMDIyMTIwNzM3WhcNMjkxMjMxMTIwNzM3WjB+MQswCQYDVQQGEwJQTDEiMCAGA1UE\nChMZVW5pemV0byBUZWNobm9sb2dpZXMgUy5BLjEnMCUGA1UECxMeQ2VydHVtIENlcnRpZmlj\nYXRpb24gQXV0aG9yaXR5MSIwIAYDVQQDExlDZXJ0dW0gVHJ1c3RlZCBOZXR3b3JrIENBMIIB\nIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4/t9o3K6wvDJFIf1awFO4W5AB7ptJ11/\n91sts1rHUV+rpDKmYYe2bg+G0jACl/jXaVehGDldamR5xgFZrDwxSjh80gTSSyjoIF87B6LM\nTXPb865Px1bVWqeWifrzq2jUI4ZZJ88JJ7ysbnKDHDBy3+Ci6dLhdHUZvSqeexVUBBvXQzmt\nVSjF4hq79MDkrjhJM8x2hZ85RdKknvISjFH4fOQtf/WsX+sWn7Et0brMkUJ3TCXJkDhv2/DM\n+44el1k+1WBO5gUo7Ul5E0u6SNsv+XLTOcr+H9g0cvW0QM8xAcPs3hEtF10fuFDRXhmnad4H\nMyjKUJX5p1TLVIZQRan5SQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQI\nds3LB/8k9sXN7buQvOKEN0Z19zAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQEFBQADggEB\nAKaorSLOAT2mo/9i0Eidi15ysHhE49wcrwn9I0j6vSrEuVUEtRCjjSfeC4Jj0O7eDDd5QVsi\nsrCaQVymcODU0HfLI9MA4GxWL+FpDQ3Zqr8hgVDZBqWo/5U30Kr+4rP1mS1FhIrlQgnXdAIv\n94nYmem8J9RHjboNRhx3zxSkHLmkMcScKHQDNP8zGSal6Q10tz6XxnboJ5ajZt3hrvJBW8qY\nVoNzcOSGGtIxQbovvi0TWnZvTuhOgQ4/WwMioBK+ZlgRSssDxLQqKi2WF+A5VLxI03YnnZot\nBqbJ7DnSq9ufmgsnAjUpsUCV5/nonFWIGUbWtzT1fs45mtk48VH3Tyw=\n-----END CERTIFICATE-----\n",
  "Certinomis - Autorité Racine": "-----BEGIN CERTIFICATE-----\nMIIFnDCCA4SgAwIBAgIBATANBgkqhkiG9w0BAQUFADBjMQswCQYDVQQGEwJGUjETMBEGA1UE\nChMKQ2VydGlub21pczEXMBUGA1UECxMOMDAwMiA0MzM5OTg5MDMxJjAkBgNVBAMMHUNlcnRp\nbm9taXMgLSBBdXRvcml0w6kgUmFjaW5lMB4XDTA4MDkxNzA4Mjg1OVoXDTI4MDkxNzA4Mjg1\nOVowYzELMAkGA1UEBhMCRlIxEzARBgNVBAoTCkNlcnRpbm9taXMxFzAVBgNVBAsTDjAwMDIg\nNDMzOTk4OTAzMSYwJAYDVQQDDB1DZXJ0aW5vbWlzIC0gQXV0b3JpdMOpIFJhY2luZTCCAiIw\nDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAJ2Fn4bT46/HsmtuM+Cet0I0VZ35gb5j2CN2\nDpdUzZlMGvE5x4jYF1AMnmHawE5V3udauHpOd4cN5bjr+p5eex7Ezyh0x5P1FMYiKAT5kcOr\nJ3NqDi5N8y4oH3DfVS9O7cdxbwlyLu3VMpfQ8Vh30WC8Tl7bmoT2R2FFK/ZQpn9qcSdIhDWe\nrP5pqZ56XjUl+rSnSTV3lqc2W+HN3yNw2F1MpQiD8aYkOBOo7C+ooWfHpi2GR+6K/OybDnT0\nK0kCe5B1jPyZOQE51kqJ5Z52qz6WKDgmi92NjMD2AR5vpTESOH2VwnHu7XSu5DaiQ3XV8QCb\n4uTXzEIDS3h65X27uK4uIJPT5GHfceF2Z5c/tt9qc1pkIuVC28+BA5PY9OMQ4HL2AHCs8MF6\nDwV/zzRpRbWT5BnbUhYjBYkOjUjkJW+zeL9i9Qf6lSTClrLooyPCXQP8w9PlfMl1I9f09bze\n5N/NgL+RiH2nE7Q5uiy6vdFrzPOlKO1Enn1So2+WLhl+HPNbxxaOu2B9d2ZHVIIAEWBsMsGo\nOBvrbpgT1u449fCfDu/+MYHB0iSVL1N6aaLwD4ZFjliCK0wi1F6g530mJ0jfJUaNSih8hp75\nmxpZuWW/Bd22Ql095gBIgl4g9xGC3srYn+Y3RyYe63j3YcNBZFgCQfna4NH4+ej9Uji29Ynf\nAgMBAAGjWzBZMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBQN\njLZh2kS40RR9w759XkjwzspqsDAXBgNVHSAEEDAOMAwGCiqBegFWAgIAAQEwDQYJKoZIhvcN\nAQEFBQADggIBACQ+YAZ+He86PtvqrxyaLAEL9MW12Ukx9F1BjYkMTv9sov3/4gbIOZ/xWqnd\nIlgVqIrTseYyCYIDbNc/CMf4uboAbbnW/FIyXaR/pDGUu7ZMOH8oMDX/nyNTt7buFHAAQCva\nR6s0fl6nVjBhK4tDrP22iCj1a7Y+YEq6QpA0Z43q619FVDsXrIvkxmUP7tCMXWY5zjKn2BCX\nwH40nJ+U8/aGH88bc62UeYdocMMzpXDn2NU4lG9jeeu/Cg4I58UvD0KgKxRA/yHgBcUn4YQR\nE7rWhh1BCxMjidPJC+iKunqjo3M3NYB9Ergzd0A4wPpeMNLytqOx1qKVl4GbUu1pTP+A5FPb\nVFsDbVRfsbjvJL1vnxHDx2TCDyhihWZeGnuyt++uNckZM6i4J9szVb9o4XVIRFb7zdNIu0eJ\nOqxp9YDG5ERQL1TEqkPFMTFYvZbF6nVsmnWxTfj3l/+WFvKXTej28xH5On2KOG4Ey+HTRRWq\npdEdnV1j6CTmNhTih60bWfVEm/vXd3wfAXBioSAaosUaKPQhA+4u2cGA6rnZgtZbdsLLO7XS\nAPCjDuGtbkD326C00EauFddEwk01+dIL8hf2rGbVJLJP0RyZwG71fet0BLj5TXcJ17TPBzAJ\n8bgAVtkXFhYKK4bfjwEZGuW7gmP/vgt2Fl43N+bYdJeimUV5\n-----END CERTIFICATE-----\n",
  "Root CA Generalitat Valenciana": "-----BEGIN CERTIFICATE-----\nMIIGizCCBXOgAwIBAgIEO0XlaDANBgkqhkiG9w0BAQUFADBoMQswCQYDVQQGEwJFUzEfMB0G\nA1UEChMWR2VuZXJhbGl0YXQgVmFsZW5jaWFuYTEPMA0GA1UECxMGUEtJR1ZBMScwJQYDVQQD\nEx5Sb290IENBIEdlbmVyYWxpdGF0IFZhbGVuY2lhbmEwHhcNMDEwNzA2MTYyMjQ3WhcNMjEw\nNzAxMTUyMjQ3WjBoMQswCQYDVQQGEwJFUzEfMB0GA1UEChMWR2VuZXJhbGl0YXQgVmFsZW5j\naWFuYTEPMA0GA1UECxMGUEtJR1ZBMScwJQYDVQQDEx5Sb290IENBIEdlbmVyYWxpdGF0IFZh\nbGVuY2lhbmEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDGKqtXETcvIorKA3Qd\nyu0togu8M1JAJke+WmmmO3I2F0zo37i7L3bhQEZ0ZQKQUgi0/6iMweDHiVYQOTPvaLRfX9pt\nI6GJXiKjSgbwJ/BXufjpTjJ3Cj9BZPPrZe52/lSqfR0grvPXdMIKX/UIKFIIzFVd0g/bmoGl\nu6GzwZTNVOAydTGRGmKy3nXiz0+J2ZGQD0EbtFpKd71ng+CT516nDOeB0/RSrFOyA8dEJvt5\n5cs0YFAQexvba9dHq198aMpunUEDEO5rmXteJajCq+TA81yc477OMUxkHl6AovWDfgzWyoxV\njr7gvkkHD6MkQXpYHYTqWBLI4bft75PelAgxAgMBAAGjggM7MIIDNzAyBggrBgEFBQcBAQQm\nMCQwIgYIKwYBBQUHMAGGFmh0dHA6Ly9vY3NwLnBraS5ndmEuZXMwEgYDVR0TAQH/BAgwBgEB\n/wIBAjCCAjQGA1UdIASCAiswggInMIICIwYKKwYBBAG/VQIBADCCAhMwggHoBggrBgEFBQcC\nAjCCAdoeggHWAEEAdQB0AG8AcgBpAGQAYQBkACAAZABlACAAQwBlAHIAdABpAGYAaQBjAGEA\nYwBpAPMAbgAgAFIAYQDtAHoAIABkAGUAIABsAGEAIABHAGUAbgBlAHIAYQBsAGkAdABhAHQA\nIABWAGEAbABlAG4AYwBpAGEAbgBhAC4ADQAKAEwAYQAgAEQAZQBjAGwAYQByAGEAYwBpAPMA\nbgAgAGQAZQAgAFAAcgDhAGMAdABpAGMAYQBzACAAZABlACAAQwBlAHIAdABpAGYAaQBjAGEA\nYwBpAPMAbgAgAHEAdQBlACAAcgBpAGcAZQAgAGUAbAAgAGYAdQBuAGMAaQBvAG4AYQBtAGkA\nZQBuAHQAbwAgAGQAZQAgAGwAYQAgAHAAcgBlAHMAZQBuAHQAZQAgAEEAdQB0AG8AcgBpAGQA\nYQBkACAAZABlACAAQwBlAHIAdABpAGYAaQBjAGEAYwBpAPMAbgAgAHMAZQAgAGUAbgBjAHUA\nZQBuAHQAcgBhACAAZQBuACAAbABhACAAZABpAHIAZQBjAGMAaQDzAG4AIAB3AGUAYgAgAGgA\ndAB0AHAAOgAvAC8AdwB3AHcALgBwAGsAaQAuAGcAdgBhAC4AZQBzAC8AYwBwAHMwJQYIKwYB\nBQUHAgEWGWh0dHA6Ly93d3cucGtpLmd2YS5lcy9jcHMwHQYDVR0OBBYEFHs100DSHHgZZu90\nECjcPk+yeAT8MIGVBgNVHSMEgY0wgYqAFHs100DSHHgZZu90ECjcPk+yeAT8oWykajBoMQsw\nCQYDVQQGEwJFUzEfMB0GA1UEChMWR2VuZXJhbGl0YXQgVmFsZW5jaWFuYTEPMA0GA1UECxMG\nUEtJR1ZBMScwJQYDVQQDEx5Sb290IENBIEdlbmVyYWxpdGF0IFZhbGVuY2lhbmGCBDtF5Wgw\nDQYJKoZIhvcNAQEFBQADggEBACRhTvW1yEICKrNcda3FbcrnlD+laJWIwVTAEGmiEi8YPyVQ\nqHxK6sYJ2fR1xkDar1CdPaUWu20xxsdzCkj+IHLtb8zog2EWRpABlUt9jppSCS/2bxzkoXHP\njCpaF3ODR00PNvsETUlR4hTJZGH71BTg9J63NI8KJr2XXPR5OkowGcytT6CYirQxlyric21+\neLj4iIlPsSKRZEv1UN4D2+XFducTZnV+ZfsBn5OHiJ35Rld8TWCvmHMTI6QgkYH60GFmuH3R\nr9ZvHmw96RH9qfmCIoaZM3Fa6hlXPZHNqcCjbgcTpsnt+GijnsNacgmHKNHEc8RzGF9QdRYx\nn7fofMM=\n-----END CERTIFICATE-----\n",
  "A-Trust-nQual-03": "-----BEGIN CERTIFICATE-----\nMIIDzzCCAregAwIBAgIDAWweMA0GCSqGSIb3DQEBBQUAMIGNMQswCQYDVQQGEwJBVDFIMEYG\nA1UECgw/QS1UcnVzdCBHZXMuIGYuIFNpY2hlcmhlaXRzc3lzdGVtZSBpbSBlbGVrdHIuIERh\ndGVudmVya2VociBHbWJIMRkwFwYDVQQLDBBBLVRydXN0LW5RdWFsLTAzMRkwFwYDVQQDDBBB\nLVRydXN0LW5RdWFsLTAzMB4XDTA1MDgxNzIyMDAwMFoXDTE1MDgxNzIyMDAwMFowgY0xCzAJ\nBgNVBAYTAkFUMUgwRgYDVQQKDD9BLVRydXN0IEdlcy4gZi4gU2ljaGVyaGVpdHNzeXN0ZW1l\nIGltIGVsZWt0ci4gRGF0ZW52ZXJrZWhyIEdtYkgxGTAXBgNVBAsMEEEtVHJ1c3QtblF1YWwt\nMDMxGTAXBgNVBAMMEEEtVHJ1c3QtblF1YWwtMDMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw\nggEKAoIBAQCtPWFuA/OQO8BBC4SAzewqo51ru27CQoT3URThoKgtUaNR8t4j8DRE/5TrzAUj\nlUC5B3ilJfYKvUWG6Nm9wASOhURh73+nyfrBJcyFLGM/BWBzSQXgYHiVEEvc+RFZznF/QJuK\nqiTfC0Li21a8StKlDJu3Qz7dg9MmEALP6iPESU7l0+m0iKsMrmKS1GWH2WrX9IWf5DMiJaXl\nyDO6w8dB3F/GaswADm0yqLaHNgBid5seHzTLkDx4iHQF63n1k3Flyp3HaxgtPVxO59X4PzF9\nj4fsCiIvI+n+u33J4PTs63zEsMMtYrWacdaxaujs2e3Vcuy+VwHOBVWf3tFgiBCzAgMBAAGj\nNjA0MA8GA1UdEwEB/wQFMAMBAf8wEQYDVR0OBAoECERqlWdVeRFPMA4GA1UdDwEB/wQEAwIB\nBjANBgkqhkiG9w0BAQUFAAOCAQEAVdRU0VlIXLOThaq/Yy/kgM40ozRiPvbY7meIMQQDbwvU\nB/tOdQ/TLtPAF8fGKOwGDREkDg6lXb+MshOWcdzUzg4NCmgybLlBMRmrsQd7TZjTXLDR8KdC\noLXEjq/+8T/0709GAHbrAvv5ndJAlseIOrifEXnzgGWovR/TeIGgUUw3tKZdJXDRZslo+S4R\nFGjxVJgIrCaSD96JntT6s3kr0qN51OyLrIdTaEJMUVF0HhsnLuP1Hyl0Te2v9+GSmYHovjrH\nF1D2t8b8m7CKa9aIA5GPBnc6hQLdmNVDeD/GMBWsm2vLV7eJUYs66MmEDNuxUCAKGkq6ahq9\n7BvIxYSazQ==\n-----END CERTIFICATE-----\n",
  "TWCA Root Certification Authority": "-----BEGIN CERTIFICATE-----\nMIIDezCCAmOgAwIBAgIBATANBgkqhkiG9w0BAQUFADBfMQswCQYDVQQGEwJUVzESMBAGA1UE\nCgwJVEFJV0FOLUNBMRAwDgYDVQQLDAdSb290IENBMSowKAYDVQQDDCFUV0NBIFJvb3QgQ2Vy\ndGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMDgwODI4MDcyNDMzWhcNMzAxMjMxMTU1OTU5WjBf\nMQswCQYDVQQGEwJUVzESMBAGA1UECgwJVEFJV0FOLUNBMRAwDgYDVQQLDAdSb290IENBMSow\nKAYDVQQDDCFUV0NBIFJvb3QgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQCwfnK4pAOU5qfeCTiRShFAh6d8WWQUe7UREN3+v9XAu1bi\nhSX0NXIP+FPQQeFEAcK0HMMxQhZHhTMidrIKbw/lJVBPhYa+v5guEGcevhEFhgWQxFnQfHgQ\nsIBct+HHK3XLfJ+utdGdIzdjp9xCoi2SBBtQwXu4PhvJVgSLL1KbralW6cH/ralYhzC2gfeX\nRfwZVzsrb+RH9JlF/h3x+JejiB03HFyP4HYlmlD4oFT/RJB2I9IyxsOrBr/8+7/zrX2SYgJb\nKdM1o5OaQ2RgXbL6Mv87BK9NQGr5x+PvI/1ry+UPizgN7gr8/g+YnzAx3WxSZfmLgb4i4RxY\nA7qRG4kHAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBRqOFsmjd6LWvJPelSDGRjjCDWmujANBgkqhkiG9w0BAQUFAAOCAQEAPNV3PdrfibqH\nDAhUaiBQkr6wQT25JmSDCi/oQMCXKCeCMErJk/9q56YAf4lCmtYR5VPOL8zy2gXE/uJQxDqG\nfczafhAJO5I1KlOy/usrBdlsXebQ79NqZp4VKIV66IIArB6nCWlWQtNoURi+VJq/REG6Sb4g\numlc7rh3zc5sH62Dlhh9DrUUOYTxKOkto557HnpyWoOzeW/vtPzQCqVYT0bf+215WfKEIlKu\nD8z7fDvnaspHYcN6+NOSBB+4IIThNlQWx0DeO4pz3N/GCUzf7Nr/1FNCocnyYh0igzyXxfkZ\nYiesZSLX0zzG5Y6yU8xJzrww/nsOM5D77dIUkR8Hrw==\n-----END CERTIFICATE-----\n",
  "Security Communication RootCA2": "-----BEGIN CERTIFICATE-----\nMIIDdzCCAl+gAwIBAgIBADANBgkqhkiG9w0BAQsFADBdMQswCQYDVQQGEwJKUDElMCMGA1UE\nChMcU0VDT00gVHJ1c3QgU3lzdGVtcyBDTy4sTFRELjEnMCUGA1UECxMeU2VjdXJpdHkgQ29t\nbXVuaWNhdGlvbiBSb290Q0EyMB4XDTA5MDUyOTA1MDAzOVoXDTI5MDUyOTA1MDAzOVowXTEL\nMAkGA1UEBhMCSlAxJTAjBgNVBAoTHFNFQ09NIFRydXN0IFN5c3RlbXMgQ08uLExURC4xJzAl\nBgNVBAsTHlNlY3VyaXR5IENvbW11bmljYXRpb24gUm9vdENBMjCCASIwDQYJKoZIhvcNAQEB\nBQADggEPADCCAQoCggEBANAVOVKxUrO6xVmCxF1SrjpDZYBLx/KWvNs2l9amZIyoXvDjChz3\n35c9S672XewhtUGrzbl+dp+++T42NKA7wfYxEUV0kz1XgMX5iZnK5atq1LXaQZAQwdbWQonC\nv/Q4EpVMVAX3NuRFg3sUZdbcDE3R3n4MqzvEFb46VqZab3ZpUql6ucjrappdUtAtCms1FgkQ\nhNBqyjoGADdH5H5XTz+L62e4iKrFvlNVspHEfbmwhRkGeC7bYRr6hfVKkaHnFtWOojnflLhw\nHyg/i/xAXmODPIMqGplrz95Zajv8bxbXH/1KEOtOghY6rCcMU/Gt1SSwawNQwS08Ft1ENCca\ndfsCAwEAAaNCMEAwHQYDVR0OBBYEFAqFqXdlBZh8QIH4D5csOPEK7DzPMA4GA1UdDwEB/wQE\nAwIBBjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBMOqNErLlFsceTfsgL\nCkLfZOoc7llsCLqJX2rKSpWeeo8HxdpFcoJxDjrSzG+ntKEju/Ykn8sX/oymzsLS28yN/HH8\nAynBbF0zX2S2ZTuJbxh2ePXcokgfGT+Ok+vx+hfuzU7jBBJV1uXk3fs+BXziHV7Gp7yXT2g6\n9ekuCkO2r1dcYmh8t/2jioSgrGK+KwmHNPBqAbubKVY8/gA3zyNs8U6qtnRGEmyR7jTV7JqR\n50S+kDFy1UkC9gLl9B/rfNmWVan/7Ir5mUf/NVoCqgTLiluHcSmRvaS0eg29mvVXIwAHIRc/\nSjnRBUkLp7Y3gaVdjKozXoEofKd9J+sAro03\n-----END CERTIFICATE-----\n",
  "EC-ACC": "-----BEGIN CERTIFICATE-----\nMIIFVjCCBD6gAwIBAgIQ7is969Qh3hSoYqwE893EATANBgkqhkiG9w0BAQUFADCB8zELMAkG\nA1UEBhMCRVMxOzA5BgNVBAoTMkFnZW5jaWEgQ2F0YWxhbmEgZGUgQ2VydGlmaWNhY2lvIChO\nSUYgUS0wODAxMTc2LUkpMSgwJgYDVQQLEx9TZXJ2ZWlzIFB1YmxpY3MgZGUgQ2VydGlmaWNh\nY2lvMTUwMwYDVQQLEyxWZWdldSBodHRwczovL3d3dy5jYXRjZXJ0Lm5ldC92ZXJhcnJlbCAo\nYykwMzE1MDMGA1UECxMsSmVyYXJxdWlhIEVudGl0YXRzIGRlIENlcnRpZmljYWNpbyBDYXRh\nbGFuZXMxDzANBgNVBAMTBkVDLUFDQzAeFw0wMzAxMDcyMzAwMDBaFw0zMTAxMDcyMjU5NTla\nMIHzMQswCQYDVQQGEwJFUzE7MDkGA1UEChMyQWdlbmNpYSBDYXRhbGFuYSBkZSBDZXJ0aWZp\nY2FjaW8gKE5JRiBRLTA4MDExNzYtSSkxKDAmBgNVBAsTH1NlcnZlaXMgUHVibGljcyBkZSBD\nZXJ0aWZpY2FjaW8xNTAzBgNVBAsTLFZlZ2V1IGh0dHBzOi8vd3d3LmNhdGNlcnQubmV0L3Zl\ncmFycmVsIChjKTAzMTUwMwYDVQQLEyxKZXJhcnF1aWEgRW50aXRhdHMgZGUgQ2VydGlmaWNh\nY2lvIENhdGFsYW5lczEPMA0GA1UEAxMGRUMtQUNDMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A\nMIIBCgKCAQEAsyLHT+KXQpWIR4NA9h0X84NzJB5R85iKw5K4/0CQBXCHYMkAqbWUZRkiFRfC\nQ2xmRJoNBD45b6VLeqpjt4pEndljkYRm4CgPukLjbo73FCeTae6RDqNfDrHrZqJyTxIThmV6\nPttPB/SnCWDaOkKZx7J/sxaVHMf5NLWUhdWZXqBIoH7nF2W4onW4HvPlQn2v7fOKSGRdghST\n2MDk/7NQcvJ29rNdQlB50JQ+awwAvthrDk4q7D7SzIKiGGUzE3eeml0aE9jD2z3Il3rucO2n\n5nzbcc8tlGLfbdb1OL4/pYUKGbio2Al1QnDE6u/LDsg0qBIimAy4E5S2S+zw0JDnJwIDAQAB\no4HjMIHgMB0GA1UdEQQWMBSBEmVjX2FjY0BjYXRjZXJ0Lm5ldDAPBgNVHRMBAf8EBTADAQH/\nMA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4EFgQUoMOLRKo3pUW/l4Ba0fF4opvpXY0wfwYDVR0g\nBHgwdjB0BgsrBgEEAfV4AQMBCjBlMCwGCCsGAQUFBwIBFiBodHRwczovL3d3dy5jYXRjZXJ0\nLm5ldC92ZXJhcnJlbDA1BggrBgEFBQcCAjApGidWZWdldSBodHRwczovL3d3dy5jYXRjZXJ0\nLm5ldC92ZXJhcnJlbCAwDQYJKoZIhvcNAQEFBQADggEBAKBIW4IB9k1IuDlVNZyAelOZ1Vr/\nsXE7zDkJlF7W2u++AVtd0x7Y/X1PzaBB4DSTv8vihpw3kpBWHNzrKQXlxJ7HNd+KDM3FIUPp\nqojlNcAZQmNaAl6kSBg6hW/cnbw/nZzBh7h6YQjpdwt/cKt63dmXLGQehb+8dJahw3oS7Awa\nboMMPOhyRp/7SNVel+axofjk70YllJyJ22k4vuxcDlbHZVHlUIiIv0LVKz3l+bqeLrPK9HOS\nAgu+TGbrIP65y7WZf+a2E/rKS03Z7lNGBjvGTq2TWoF+bCpLagVFjPIhpDGQh2xlnJ2lYJU6\nUn/10asIbvPuW/mIPX64b24D5EI=\n-----END CERTIFICATE-----\n",
  "Hellenic Academic and Research Institutions RootCA 2011": "-----BEGIN CERTIFICATE-----\nMIIEMTCCAxmgAwIBAgIBADANBgkqhkiG9w0BAQUFADCBlTELMAkGA1UEBhMCR1IxRDBCBgNV\nBAoTO0hlbGxlbmljIEFjYWRlbWljIGFuZCBSZXNlYXJjaCBJbnN0aXR1dGlvbnMgQ2VydC4g\nQXV0aG9yaXR5MUAwPgYDVQQDEzdIZWxsZW5pYyBBY2FkZW1pYyBhbmQgUmVzZWFyY2ggSW5z\ndGl0dXRpb25zIFJvb3RDQSAyMDExMB4XDTExMTIwNjEzNDk1MloXDTMxMTIwMTEzNDk1Mlow\ngZUxCzAJBgNVBAYTAkdSMUQwQgYDVQQKEztIZWxsZW5pYyBBY2FkZW1pYyBhbmQgUmVzZWFy\nY2ggSW5zdGl0dXRpb25zIENlcnQuIEF1dGhvcml0eTFAMD4GA1UEAxM3SGVsbGVuaWMgQWNh\nZGVtaWMgYW5kIFJlc2VhcmNoIEluc3RpdHV0aW9ucyBSb290Q0EgMjAxMTCCASIwDQYJKoZI\nhvcNAQEBBQADggEPADCCAQoCggEBAKlTAOMupvaO+mDYLZU++CwqVE7NuYRhlFhPjz2L5EPz\ndYmNUeTDN9KKiE15HrcS3UN4SoqS5tdI1Q+kOilENbgH9mgdVc04UfCMJDGFr4PJfel3r+0a\ne50X+bOdOFAPplp5kYCvN66m0zH7tSYJnTxa71HFK9+WXesyHgLacEnsbgzImjeN9/E2YEsm\nLIKe0HjzDQ9jpFEw4fkrJxIH2Oq9GGKYsFk3fb7u8yBRQlqD75O6aRXxYp2fmTmCobd0LovU\nxQt7L/DICto9eQqakxylKHJzkUOap9FNhYS5qXSPFEDH3N6sQWRstBmbAmNtJGSPRLIl6s5d\ndAxjMlyNh+UCAwEAAaOBiTCBhjAPBgNVHRMBAf8EBTADAQH/MAsGA1UdDwQEAwIBBjAdBgNV\nHQ4EFgQUppFC/RNhSiOeCKQp5dgTBCPuQSUwRwYDVR0eBEAwPqA8MAWCAy5ncjAFggMuZXUw\nBoIELmVkdTAGggQub3JnMAWBAy5ncjAFgQMuZXUwBoEELmVkdTAGgQQub3JnMA0GCSqGSIb3\nDQEBBQUAA4IBAQAf73lB4XtuP7KMhjdCSk4cNx6NZrokgclPEg8hwAOXhiVtXdMiKahsog2p\n6z0GW5k6x8zDmjR/qw7IThzh+uTczQ2+vyT+bOdrwg3IBp5OjWEopmr95fZi6hg8TqBTnbI6\nnOulnJEWtk2C4AwFSKls9cz4y51JtPACpf1wA+2KIaWuE4ZJwzNzvoc7dIsXRSZMFpGD/md9\nzU1jZ/rzAxKWeAaNsWftjj++n08C9bMJL/NMh98qy5V8AcysNnq/onN694/BtZqhFLKPM58N\n7yLcZnuEvUUXBj08yrl3NI/K6s8/MT7jiOOASSXIl7WdmplNsDz4SgCbZN2fOUvRJ9e4\n-----END CERTIFICATE-----\n",
  "Actalis Authentication Root CA": "-----BEGIN CERTIFICATE-----\nMIIFuzCCA6OgAwIBAgIIVwoRl0LE48wwDQYJKoZIhvcNAQELBQAwazELMAkGA1UEBhMCSVQx\nDjAMBgNVBAcMBU1pbGFuMSMwIQYDVQQKDBpBY3RhbGlzIFMucC5BLi8wMzM1ODUyMDk2NzEn\nMCUGA1UEAwweQWN0YWxpcyBBdXRoZW50aWNhdGlvbiBSb290IENBMB4XDTExMDkyMjExMjIw\nMloXDTMwMDkyMjExMjIwMlowazELMAkGA1UEBhMCSVQxDjAMBgNVBAcMBU1pbGFuMSMwIQYD\nVQQKDBpBY3RhbGlzIFMucC5BLi8wMzM1ODUyMDk2NzEnMCUGA1UEAwweQWN0YWxpcyBBdXRo\nZW50aWNhdGlvbiBSb290IENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAp8bE\npSmkLO/lGMWwUKNvUTufClrJwkg4CsIcoBh/kbWHuUA/3R1oHwiD1S0eiKD4j1aPbZkCkpAW\n1V8IbInX4ay8IMKx4INRimlNAJZaby/ARH6jDuSRzVju3PvHHkVH3Se5CAGfpiEd9UEtL0z9\nKK3giq0itFZljoZUj5NDKd45RnijMCO6zfB9E1fAXdKDa0hMxKufgFpbOr3JpyI/gCczWw63\nigxdBzcIy2zSekciRDXFzMwujt0q7bd9Zg1fYVEiVRvjRuPjPdA1YprbrxTIW6HMiRvhMCb8\noJsfgadHHwTrozmSBp+Z07/T6k9QnBn+locePGX2oxgkg4YQ51Q+qDp2JE+BIcXjDwL4k5RH\nILv+1A7TaLndxHqEguNTVHnd25zS8gebLra8Pu2Fbe8lEfKXGkJh90qX6IuxEAf6ZYGyojnP\n9zz/GPvG8VqLWeICrHuS0E4UT1lF9gxeKF+w6D9Fz8+vm2/7hNN3WpVvrJSEnu68wEqPSpP4\nRCHiMUVhUE4Q2OM1fEwZtN4Fv6MGn8i1zeQf1xcGDXqVdFUNaBr8EBtiZJ1t4JWgw5QHVw0U\n5r0F+7if5t+L4sbnfpb2U8WANFAoWPASUHEXMLrmeGO89LKtmyuy/uE5jF66CyCU3nuDuP/j\nVo23Eek7jPKxwV2dpAtMK9myGPW1n0sCAwEAAaNjMGEwHQYDVR0OBBYEFFLYiDrIn3hm7Ynz\nezhwlMkCAjbQMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAUUtiIOsifeGbtifN7OHCU\nyQICNtAwDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBCwUAA4ICAQALe3KHwGCmSUyIWOYd\niPcUZEim2FgKDk8TNd81HdTtBjHIgT5q1d07GjLukD0R0i70jsNjLiNmsGe+b7bAEzlgqqI0\nJZN1Ut6nna0Oh4lScWoWPBkdg/iaKWW+9D+a2fDzWochcYBNy+A4mz+7+uAwTc+G02UQGRjR\nlwKxK3JCaKygvU5a2hi/a5iB0P2avl4VSM0RFbnAKVy06Ij3Pjaut2L9HmLecHgQHEhb2ryk\nOLpn7VU+Xlff1ANATIGk0k9jpwlCCRT8AKnCgHNPLsBA2RF7SOp6AsDT6ygBJlh0wcBzIm2T\nlf05fbsq4/aC4yyXX04fkZT6/iyj2HYauE2yOE+b+h1IYHkm4vP9qdCa6HCPSXrW5b0KDtst\n842/6+OkfcvHlXHo2qN8xcL4dJIEG4aspCJTQLas/kx2z/uUMsA1n3Y/buWQbqCmJqK4LL7R\nK4X9p2jIugErsWx0Hbhzlefut8cl8ABMALJ+tguLHPPAUJ4lueAI3jZm/zel0btUZCzJJ7VL\nkn5l/9Mt4blOvH+kQSGQQXemOR/qnuOf0GZvBeyqdn6/axag67XH/JJULysRJyU3eExRarDz\nzFhdFPFqSBX/wge2sY0PjlxQRrM9vwGYT7JZVEc+NHt4bVaTLnPqZih4zR0Uv6CPLy64Lo7y\nFIrM6bV8+2ydDKXhlg==\n-----END CERTIFICATE-----\n",
  "Trustis FPS Root CA": "-----BEGIN CERTIFICATE-----\nMIIDZzCCAk+gAwIBAgIQGx+ttiD5JNM2a/fH8YygWTANBgkqhkiG9w0BAQUFADBFMQswCQYD\nVQQGEwJHQjEYMBYGA1UEChMPVHJ1c3RpcyBMaW1pdGVkMRwwGgYDVQQLExNUcnVzdGlzIEZQ\nUyBSb290IENBMB4XDTAzMTIyMzEyMTQwNloXDTI0MDEyMTExMzY1NFowRTELMAkGA1UEBhMC\nR0IxGDAWBgNVBAoTD1RydXN0aXMgTGltaXRlZDEcMBoGA1UECxMTVHJ1c3RpcyBGUFMgUm9v\ndCBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMVQe547NdDfxIzNjpvto8A2\nmfRC6qc+gIMPpqdZh8mQRUN+AOqGeSoDvT03mYlmt+WKVoaTnGhLaASMk5MCPjDSNzoiYYkc\nhU59j9WvezX2fihHiTHcDnlkH5nSW7r+f2C/revnPDgpai/lkQtV/+xvWNUtyd5MZnGPDNcE\n2gfmHhjjvSkCqPoc4Vu5g6hBSLwacY3nYuUtsuvffM/bq1rKMfFMIvMFE/eC+XN5DL7XSxzA\n0RU8k0Fk0ea+IxciAIleH2ulrG6nS4zto3Lmr2NNL4XSFDWaLk6M6jKYKIahkQlBOrTh4/L6\n8MkKokHdqeMDx4gVOxzUGpTXn2RZEm0CAwEAAaNTMFEwDwYDVR0TAQH/BAUwAwEB/zAfBgNV\nHSMEGDAWgBS6+nEleYtXQSUhhgtx67JkDoshZzAdBgNVHQ4EFgQUuvpxJXmLV0ElIYYLceuy\nZA6LIWcwDQYJKoZIhvcNAQEFBQADggEBAH5Y//01GX2cGE+esCu8jowU/yyg2kdbw++BLa8F\n6nRIW/M+TgfHbcWzk88iNVy2P3UnXwmWzaD+vkAMXBJV+JOCyinpXj9WV4s4NvdFGkwozZ5B\nuO1WTISkQMi4sKUraXAEasP41BIy+Q7DsdwyhEQsb8tGD+pmQQ9P8Vilpg0ND2HepZ5dfWWh\nPBfnqFVO76DH7cZEf1T1o+CP8HxVIo8ptoGj4W1OLBuAZ+ytIJ8MYmHVl/9D7S3B2l0pKoU/\nrGXuhg8FjZBf3+6f9L/uHfuY5H+QK4R4EA5sSVPvFVtlRkpdr7r7OnIdzfYliB6XzCGcKQEN\nZetX2fNXlrtIzYE=\n-----END CERTIFICATE-----\n",
  "StartCom Certification Authority G2": "-----BEGIN CERTIFICATE-----\nMIIFYzCCA0ugAwIBAgIBOzANBgkqhkiG9w0BAQsFADBTMQswCQYDVQQGEwJJTDEWMBQGA1UE\nChMNU3RhcnRDb20gTHRkLjEsMCoGA1UEAxMjU3RhcnRDb20gQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgRzIwHhcNMTAwMTAxMDEwMDAxWhcNMzkxMjMxMjM1OTAxWjBTMQswCQYDVQQGEwJJ\nTDEWMBQGA1UEChMNU3RhcnRDb20gTHRkLjEsMCoGA1UEAxMjU3RhcnRDb20gQ2VydGlmaWNh\ndGlvbiBBdXRob3JpdHkgRzIwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQC2iTZb\nB7cgNr2Cu+EWIAOVeq8Oo1XJJZlKxdBWQYeQTSFgpBSHO839sj60ZwNq7eEPS8CRhXBF4EKe\n3ikj1AENoBB5uNsDvfOpL9HG4A/LnooUCri99lZi8cVytjIl2bLzvWXFDSxu1ZJvGIsAQRSC\nb0AgJnooD/Uefyf3lLE3PbfHkffiAez9lInhzG7TNtYKGXmu1zSCZf98Qru23QumNK9LYP5/\nQ0kGi4xDuFby2X8hQxfqp0iVAXV16iulQ5XqFYSdCI0mblWbq9zSOdIxHWDirMxWRST1HFSr\n7obdljKF+ExP6JV2tgXdNiNnvP8V4so75qbsO+wmETRIjfaAKxojAuuKHDp2KntWFhxyKrOq\n42ClAJ8Em+JvHhRYW6Vsi1g8w7pOOlz34ZYrPu8HvKTlXcxNnw3h3Kq74W4a7I/htkxNeXJd\nFzULHdfBR9qWJODQcqhaX2YtENwvKhOuJv4KHBnM0D4LnMgJLvlblnpHnOl68wVQdJVznjAJ\n85eCXuaPOQgeWeU1FEIT/wCc976qUM/iUUjXuG+v+E5+M5iSFGI6dWPPe/regjupuznixL0s\nAA7IF6wT700ljtizkC+p2il9Ha90OrInwMEePnWjFqmveiJdnxMaz6eg6+OGCtP95paV1yPI\nN93EfKo2rJgaErHgTuixO/XWb/Ew1wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MA4GA1Ud\nDwEB/wQEAwIBBjAdBgNVHQ4EFgQUS8W0QGutHLOlHGVuRjaJhwUMDrYwDQYJKoZIhvcNAQEL\nBQADggIBAHNXPyzVlTJ+N9uWkusZXn5T50HsEbZH77Xe7XRcxfGOSeD8bpkTzZ+K2s06Ctg6\nWgk/XzTQLwPSZh0avZyQN8gMjgdalEVGKua+etqhqaRpEpKwfTbURIfXUfEpY9Z1zRbkJ4kd\n+MIySP3bmdCPX1R0zKxnNBFi2QwKN4fRoxdIjtIXHfbX/dtl6/2o1PXWT6RbdejF0mCy2wl+\nJYt7ulKSnj7oxXehPOBKc2thz4bcQ///If4jXSRK9dNtD2IEBVeC2m6kMyV5Sy5UGYvMLD0w\n6dEG/+gyRr61M3Z3qAFdlsHB1b6uJcDJHgoJIIihDsnzb02CVAAgp9KP5DlUFy6NHrgbuxu9\nmk47EDTcnIhT76IxW1hPkWLIwpqazRVdOKnWvvgTtZ8SafJQYqz7Fzf07rh1Z2AQ+4NQ+US1\ndZxAF7L+/XldblhYXzD8AK6vM8EOTmy6p6ahfzLbOOCxchcKK5HsamMm7YnUeMx0HgX4a/6M\nanY5Ka5lIxKVCCIcl85bBu4M4ru8H0ST9tg4RQUh7eStqxK2A6RCLi3ECToDZ2mEmuFZkIoo\nhdVddLHRDiBYmxOlsGOm7XtH/UVVMKTumtTm4ofvmMkyghEpIrwACjFeLQ/Ajulrso8uBtjR\nkcfGEvRM/TAXw8HaOFvjqermobp573PYtlNXLfbQ4ddI\n-----END CERTIFICATE-----\n",
  "Buypass Class 2 Root CA": "-----BEGIN CERTIFICATE-----\nMIIFWTCCA0GgAwIBAgIBAjANBgkqhkiG9w0BAQsFADBOMQswCQYDVQQGEwJOTzEdMBsGA1UE\nCgwUQnV5cGFzcyBBUy05ODMxNjMzMjcxIDAeBgNVBAMMF0J1eXBhc3MgQ2xhc3MgMiBSb290\nIENBMB4XDTEwMTAyNjA4MzgwM1oXDTQwMTAyNjA4MzgwM1owTjELMAkGA1UEBhMCTk8xHTAb\nBgNVBAoMFEJ1eXBhc3MgQVMtOTgzMTYzMzI3MSAwHgYDVQQDDBdCdXlwYXNzIENsYXNzIDIg\nUm9vdCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANfHXvfBB9R3+0Mh9PT1\naeTuMgHbo4Yf5FkNuud1g1Lr6hxhFUi7HQfKjK6w3Jad6sNgkoaCKHOcVgb/S2TwDCo3SbXl\nzwx87vFKu3MwZfPVL4O2fuPn9Z6rYPnT8Z2SdIrkHJasW4DptfQxh6NR/Md+oW+OU3fUl8FV\nM5I+GC911K2GScuVr1QGbNgGE41b/+EmGVnAJLqBcXmQRFBoJJRfuLMR8SlBYaNByyM21cHx\nMlAQTn/0hpPshNOOvEu/XAFOBz3cFIqUCqTqc/sLUegTBxj6DvEr0VQVfTzh97QZQmdiXnfg\nolXsttlpF9U6r0TtSsWe5HonfOV116rLJeffawrbD02TTqigzXsu8lkBarcNuAeBfos4Gzjm\nCleZPe4h6KP1DBbdi+w0jpwqHAAVF41og9JwnxgIzRFo1clrUs3ERo/ctfPYV3Me6ZQ5BL/T\n3jjetFPsaRyifsSP5BtwrfKi+fv3FmRmaZ9JUaLiFRhnBkp/1Wy1TbMz4GHrXb7pmA8y1x1L\nPC5aAVKRCfLf6o3YBkBjqhHk/sM3nhRSP/TizPJhk9H9Z2vXUq6/aKtAQ6BXNVN48FP4YUIH\nZMbXb5tMOA1jrGKvNouicwoN9SG9dKpN6nIDSdvHXx1iY8f93ZHsM+71bbRuMGjeyNYmsHVe\ne7QHIJihdjK4TWxPAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFMmAd+Bi\nkoL1RpzzuvdMw964o605MA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQsFAAOCAgEAU18h\n9bqwOlI5LJKwbADJ784g7wbylp7ppHR/ehb8t/W2+xUbP6umwHJdELFx7rxP462sA20ucS6v\nxOOto70MEae0/0qyexAQH6dXQbLArvQsWdZHEIjzIVEpMMpghq9Gqx3tOluwlN5E40EIosHs\nHdb9T7bWR9AUC8rmyrV7d35BH16Dx7aMOZawP5aBQW9gkOLo+fsicdl9sz1Gv7SEr5AcD48S\naq/v7h56rgJKihcrdv6sVIkkLE8/trKnToyokZf7KcZ7XC25y2a2t6hbElGFtQl+Ynhw/qlq\nYLYdDnkM/crqJIByw5c/8nerQyIKx+u2DISCLIBrQYoIwOula9+ZEsuK1V6ADJHgJgg2SMX6\nOBE1/yWDLfJ6v9r9jv6ly0UsH8SIU653DtmadsWOLB2jutXsMq7Aqqz30XpN69QH4kj3Io6w\npJ9qzo6ysmD0oyLQI+uUWnpp3Q+/QFesa1lQ2aOZ4W7+jQF5JyMV3pKdewlNWudLSDBaGOYK\nbeaP4NK75t98biGCwWg5TbSYWGZizEqQXsP6JwSxeRV0mcy+rSDeJmAc61ZRpqPq5KM/p/9h\n3PFaTWwyI0PurKju7koSCTxdccK+efrCh2gdC/1cacwG0Jp9VJkqyTkaGa9LKkPzY11aWOIv\n4x3kqdbQCtCev9eBCfHJxyYNrJgWVqA=\n-----END CERTIFICATE-----\n",
  "Buypass Class 3 Root CA": "-----BEGIN CERTIFICATE-----\nMIIFWTCCA0GgAwIBAgIBAjANBgkqhkiG9w0BAQsFADBOMQswCQYDVQQGEwJOTzEdMBsGA1UE\nCgwUQnV5cGFzcyBBUy05ODMxNjMzMjcxIDAeBgNVBAMMF0J1eXBhc3MgQ2xhc3MgMyBSb290\nIENBMB4XDTEwMTAyNjA4Mjg1OFoXDTQwMTAyNjA4Mjg1OFowTjELMAkGA1UEBhMCTk8xHTAb\nBgNVBAoMFEJ1eXBhc3MgQVMtOTgzMTYzMzI3MSAwHgYDVQQDDBdCdXlwYXNzIENsYXNzIDMg\nUm9vdCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAKXaCpUWUOOV8l6ddjEG\nMnqb8RB2uACatVI2zSRHsJ8YZLya9vrVediQYkwiL944PdbgqOkcLNt4EemOaFEVcsfzM4fk\noF0LXOBXByow9c3EN3coTRiR5r/VUv1xLXA+58bEiuPwKAv0dpihi4dVsjoT/Lc+JzeOIuOo\nTyrvYLs9tznDDgFHmV0ST9tD+leh7fmdvhFHJlsTmKtdFoqwNxxXnUX/iJY2v7vKB3tvh2PX\n0DJq1l1sDPGzbjniazEuOQAnFN44wOwZZoYS6J1yFhNkUsepNxz9gjDthBgd9K5c/3ATAOux\n9TN6S9ZV+AWNS2mw9bMoNlwUxFFzTWsL8TQH2xc519woe2v1n/MuwU8XKhDzzMro6/1rqy6a\nny2CbgTUUgGTLT2G/H783+9CHaZr77kgxve9oKeV/afmiSTYzIw0bOIjL9kSGiG5VZFvC5F5\nGQytQIgLcOJ60g7YaEi7ghM5EFjp2CoHxhLbWNvSO1UQRwUVZ2J+GGOmRj8JDlQyXr8NYnon\n74Do29lLBlo3WiXQCBJ31G8JUJc9yB3D34xFMFbG02SrZvPAXpacw8Tvw3xrizp5f7NJzz3i\niZ+gMEuFuZyUJHmPfWupRWgPK9Dx2hzLabjKSWJtyNBjYt1gD1iqj6G8BaVmos8bdrKEZLFM\nOVLAMLrwjEsCsLa3AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFEe4zf/l\nb+74suwvTg75JbCOPGvDMA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQsFAAOCAgEAACAj\nQTUEkMJAYmDv4jVM1z+s4jSQuKFvdvoWFqRINyzpkMLyPPgKn9iB5btb2iUspKdVcSQy9sgL\n8rxq+JOssgfCX5/bzMiKqr5qb+FJEMwx14C7u8jYog5kV+qi9cKpMRXSIGrs/CIBKM+GuIAe\nqcwRpTzyFrNHnfzSgCHEy9BHcEGhyoMZCCxt8l13nIoUE9Q2HJLw5QY33KbmkJs4j1xrG0aG\nQ0JfPgEHU1RdZX33inOhmlRaHylDFCfChQ+1iHsaO5S3HWCntZznKWlXWpuTekMwGwPXYshA\npqr8ZORK15FTAaggiG6cX0S5y2CBNOxv033aSF/rtJC8LakcC6wc1aJoIIAE1vyxjy+7SjEN\nSoYc6+I2KSb12tjE8nVhz36udmNKekBlk4f4HoCMhuWG1o8O/FMsYOgWYRqiPkN7zTlgVGr1\n8okmAWiDSKIz6MkEkbIRNBE+6tBDGR8Dk5AM/1E9V/RBbuHLoL7ryWPNbczk+DaqaJ3tvV2X\ncEQNtg413OEMXbugUZTLfhbrES+jkkXITHHZvMmZUldGL1DPvTVp9D0VzgalLA8+9oG6lLvD\nu79leNKGef9JOxqDDPDeeOzI8k1MGt6CKfjBWtrt7uYnXuhF0J0cUahoq0Tj0Itq4/g7u9xN\n12TyUb7mqqta6THuBrxzvxNiCp/HuZc=\n-----END CERTIFICATE-----\n",
  "T-TeleSec GlobalRoot Class 3": "-----BEGIN CERTIFICATE-----\nMIIDwzCCAqugAwIBAgIBATANBgkqhkiG9w0BAQsFADCBgjELMAkGA1UEBhMCREUxKzApBgNV\nBAoMIlQtU3lzdGVtcyBFbnRlcnByaXNlIFNlcnZpY2VzIEdtYkgxHzAdBgNVBAsMFlQtU3lz\ndGVtcyBUcnVzdCBDZW50ZXIxJTAjBgNVBAMMHFQtVGVsZVNlYyBHbG9iYWxSb290IENsYXNz\nIDMwHhcNMDgxMDAxMTAyOTU2WhcNMzMxMDAxMjM1OTU5WjCBgjELMAkGA1UEBhMCREUxKzAp\nBgNVBAoMIlQtU3lzdGVtcyBFbnRlcnByaXNlIFNlcnZpY2VzIEdtYkgxHzAdBgNVBAsMFlQt\nU3lzdGVtcyBUcnVzdCBDZW50ZXIxJTAjBgNVBAMMHFQtVGVsZVNlYyBHbG9iYWxSb290IENs\nYXNzIDMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC9dZPwYiJvJK7genasfb3Z\nJNW4t/zN8ELg63iIVl6bmlQdTQyK9tPPcPRStdiTBONGhnFBSivwKixVA9ZIw+A5OO3yXDw/\nRLyTPWGrTs0NvvAgJ1gORH8EGoel15YUNpDQSXuhdfsaa3Ox+M6pCSzyU9XDFES4hqX2iys5\n2qMzVNn6chr3IhUciJFrf2blw2qAsCTz34ZFiP0Zf3WHHx+xGwpzJFu5ZeAsVMhg02YXP+HM\nVDNzkQI6pn97djmiH5a2OK61yJN0HZ65tOVgnS9W0eDrXltMEnAMbEQgqxHY9Bn20pxSN+f6\ntsIxO0rUFJmtxxr1XV/6B7h8DR/Wgx6zAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wDgYD\nVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBS1A/d2O2GCahKqGFPrAyGUv/7OyjANBgkqhkiG9w0B\nAQsFAAOCAQEAVj3vlNW92nOyWL6ukK2YJ5f+AbGwUgC4TeQbIXQbfsDuXmkqJa9c1h3a0nnJ\n85cp4IaH3gRZD/FZ1GSFS5mvJQQeyUapl96Cshtwn5z2r3Ex3XsFpSzTucpH9sry9uetuUg/\nvBa3wW306gmv7PO15wWeph6KU1HWk4HMdJP2udqmJQV0eVp+QD6CSyYRMG7hP0HHRwA11fXT\n91Q+gT3aSWqas+8QPebrb9HIIkfLzM8BMZLZGOMivgkeGj5asuRrDFR6fUNOuImle9eiPZaG\nzPImNC1qkp2aGtAw4l1OBLBfiyB+d8E9lYLRRpo7PHi4b6HQDWSieB4pTpPDpFQUWw==\n-----END CERTIFICATE-----\n",
  "EE Certification Centre Root CA": "-----BEGIN CERTIFICATE-----\nMIIEAzCCAuugAwIBAgIQVID5oHPtPwBMyonY43HmSjANBgkqhkiG9w0BAQUFADB1MQswCQYD\nVQQGEwJFRTEiMCAGA1UECgwZQVMgU2VydGlmaXRzZWVyaW1pc2tlc2t1czEoMCYGA1UEAwwf\nRUUgQ2VydGlmaWNhdGlvbiBDZW50cmUgUm9vdCBDQTEYMBYGCSqGSIb3DQEJARYJcGtpQHNr\nLmVlMCIYDzIwMTAxMDMwMTAxMDMwWhgPMjAzMDEyMTcyMzU5NTlaMHUxCzAJBgNVBAYTAkVF\nMSIwIAYDVQQKDBlBUyBTZXJ0aWZpdHNlZXJpbWlza2Vza3VzMSgwJgYDVQQDDB9FRSBDZXJ0\naWZpY2F0aW9uIENlbnRyZSBSb290IENBMRgwFgYJKoZIhvcNAQkBFglwa2lAc2suZWUwggEi\nMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIIMDs4MVLqwd4lfNE7vsLDP90jmG7sWLq\nI9iroWUyeuuOF0+W2Ap7kaJjbMeMTC55v6kF/GlclY1i+blw7cNRfdCT5mzrMEvhvH2/UpvO\nbntl8jixwKIy72KyaOBhU8E2lf/slLo2rpwcpzIP5Xy0xm90/XsY6KxX7QYgSzIwWFv9zajm\nofxwvI6Sc9uXp3whrj3B9UiHbCe9nyV0gVWw93X2PaRka9ZP585ArQ/dMtO8ihJTmMmJ+xAd\nTX7Nfh9WDSFwhfYggx/2uh8Ej+p3iDXE/+pOoYtNP2MbRMNE1CV2yreN1x5KZmTNXMWcg+HC\nCIia7E6j8T4cLNlsHaFLAgMBAAGjgYowgYcwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8E\nBAMCAQYwHQYDVR0OBBYEFBLyWj7qVhy/zQas8fElyalL1BSZMEUGA1UdJQQ+MDwGCCsGAQUF\nBwMCBggrBgEFBQcDAQYIKwYBBQUHAwMGCCsGAQUFBwMEBggrBgEFBQcDCAYIKwYBBQUHAwkw\nDQYJKoZIhvcNAQEFBQADggEBAHv25MANqhlHt01Xo/6tu7Fq1Q+e2+RjxY6hUFaTlrg4wCQi\nZrxTFGGVv9DHKpY5P30osxBAIWrEr7BSdxjhlthWXePdNl4dp1BUoMUq5KqMlIpPnTX/dqQG\nE5Gion0ARD9V04I8GtVbvFZMIi5GQ4okQC3zErg7cBqklrkar4dBGmoYDQZPxz5uuSlNDUmJ\nEYcyW+ZLBMjkXOZ0c5RdFpgTlf7727FE5TpwrDdr5rMzcijJs1eg9gIWiAYLtqZLICjU3j2L\nrTcFU3T+bsy8QxdxXvnFzBqpYe73dgzzcvRyrc9yAjYHR8/vGVCJYMzpJJUPwssd8m92kMfM\ndcGWxZ0=\n-----END CERTIFICATE-----\n"
}
/**
 * End File: verifychain/rootcertslist.js
 */

/**
 * File: verifychain/rootcerts.js
 */

'use strict';

var RootCerts = {};

//var certs = require('./rootcerts.json');

// Use hash table for efficiency:
var trusted = Object.keys(certs).reduce(function(trusted, key) {
  var pem = certs[key];
  pem = pem.replace(/-----BEGIN CERTIFICATE-----/g, '');
  pem = pem.replace(/-----END CERTIFICATE-----/g, '');
  pem = pem.replace(/\s+/g, '');
  trusted[pem] = key;
  return trusted;
}, {});

RootCerts.getTrusted = function(pem) {
  pem = RootCerts.parsePEM(pem)[0].pem;
  if (!Object.prototype.hasOwnProperty.call(trusted, pem)) {
    return;
  }
  return trusted[pem];
};

RootCerts.getCert = function(name) {
  name = name.replace(/^s+|s+$/g, '');
  if (!Object.prototype.hasOwnProperty.call(certs, name)) {
    return;
  }
  return certs[name];
};

RootCerts.parsePEM = function(pem) {
  pem = pem + '';
  var concatted = pem.trim().split(/-----BEGIN [^\-\r\n]+-----/);
  if (concatted.length > 2) {
    return concatted.reduce(function(out, pem) {
      if (!pem) {
        return out;
      }
      pem = RootCerts.parsePEM(pem)[0].pem;
      if (pem) {
        out.push(pem);
      }
      return out;
    }, []);
  }
  var type = /-----BEGIN ([^\-\r\n]+)-----/.exec(pem)[1];
  pem = pem.replace(/-----BEGIN [^\-\r\n]+-----/, '');
  pem = pem.replace(/-----END [^\-\r\n]+-----/, '');
  var parts = pem.trim().split(/(?:\r?\n){2,}/);
  var headers = {};
  if (parts.length > 1) {
    headers = parts[0].trim().split(/[\r\n]/).reduce(function(out, line) {
      var parts = line.split(/:[ \t]+/);
      var key = parts[0].trim().toLowerCase();
      var value = (parts.slice(1).join('') || '').trim();
      out[key] = value;
      return out;
    }, {});
    pem = parts.slice(1).join('');
  }
  pem = pem.replace(/\s+/g, '');
  var der = pem ? new Buffer(pem, 'base64') : null;
  return [{
    type: type,
    headers: headers,
    pem: pem,
    der: der,
    body: der || new Buffer([0])
  }];
};

RootCerts.certs = certs;
RootCerts.trusted = trusted;
/**
 * End File: verifychain/rootcerts.js
 */

/**
 * File: verifychain/verifychain.js
 */

'use strict';

var asn1 = require('asn1.js');
var Buffer = require('buffer').Buffer;
var origcerts = certs;

//--------BEGIN copied from https://github.com/indutny/asn1.js/blob/master/rfc/3280/index.js
var AlgorithmIdentifier = asn1.define('AlgorithmIdentifier', function() {
  this.seq().obj(
    this.key('algorithm').objid(),
    this.key('parameters').optional().any()
  );
});

var Certificate = asn1.define('Certificate', function() {
  this.seq().obj(
    this.key('tbsCertificate').use(TBSCertificate),
    this.key('signatureAlgorithm').use(AlgorithmIdentifier),
    this.key('signature').bitstr()
  );
});

var TBSCertificate = asn1.define('TBSCertificate', function() {
  this.seq().obj(
    this.key('version').def('v1').explicit(0).use(Version),
    this.key('serialNumber').use(CertificateSerialNumber),
    this.key('signature').use(AlgorithmIdentifier),
    this.key('issuer').use(Name),
    this.key('validity').use(Validity),
    this.key('subject').use(Name),
    this.key('subjectPublicKeyInfo').use(SubjectPublicKeyInfo),

    // TODO(indutny): validate that version is v2 or v3
    this.key('issuerUniqueID').optional().explicit(1).use(UniqueIdentifier),
    this.key('subjectUniqueID').optional().explicit(2).use(UniqueIdentifier),

    // TODO(indutny): validate that version is v3
    this.key('extensions').optional().explicit(3).use(Extensions)
  );
});

var Version = asn1.define('Version', function() {
  this.int({
    0: 'v1',
    1: 'v2',
    2: 'v3'
  });
});

var CertificateSerialNumber = asn1.define('CertificateSerialNumber',
                                          function() {
  this.int();
});

var Validity = asn1.define('Validity', function() {
  this.seq().obj(
    this.key('notBefore').use(Time),
    this.key('notAfter').use(Time)
  );
});

var Time = asn1.define('Time', function() {
  this.choice({
    utcTime: this.utctime(),
    genTime: this.gentime()
  });
});

var UniqueIdentifier = asn1.define('UniqueIdentifier', function() {
  this.bitstr();
});

var SubjectPublicKeyInfo = asn1.define('SubjectPublicKeyInfo', function() {
  this.seq().obj(
    this.key('algorithm').use(AlgorithmIdentifier),
    this.key('subjectPublicKey').bitstr()
  );
});

var Extensions = asn1.define('Extensions', function() {
  this.seqof(Extension);
});

var Extension = asn1.define('Extension', function() {
  this.seq().obj(
    this.key('extnID').objid(),
    this.key('critical').bool().def(false),
    this.key('extnValue').octstr()
  );
});

var Name = asn1.define('Name', function() {
  this.choice({
    rdn: this.use(RDNSequence)
  });
});

var RDNSequence = asn1.define('RDNSequence', function() {
  this.seqof(RelativeDistinguishedName);
});

var RelativeDistinguishedName = asn1.define('RelativeDistinguishedName',
                                            function() {
  this.setof(AttributeTypeAndValue);
});

var AttributeTypeAndValue = asn1.define('AttributeTypeAndValue', function() {
  this.seq().obj(
    this.key('type').use(AttributeType),
    this.key('value').use(AttributeValue)
  );
});

var AttributeType = asn1.define('AttributeType', function() {
  this.objid();
});

var AttributeValue = asn1.define('AttributeValue', function() {
  this.any();
});
//-----END copied from https://github.com/indutny/asn1.js/blob/master/rfc/3280/index.js


function pem2der(certpem){
	var lines = certpem.split('\n');
	var stripped = ''; //strip ascii armor and newlines
	for(var i = 1; i < lines.length-2; i++){
	  stripped += lines[i];
	}
	stripped = stripped.replace(/\n/g, '');
	var certder = b64decode(stripped);
	return certder;
}


//change the keys from ambigous string that bitpay provides
//to unique subject strings and associated pubkeys
function fixcerts(){
	var tmpcerts = {'trusted_pubkeys':[]};
	var i = 0;
	for (var key in certs){
		i += 1;
		var certpem = certs[key];
		var certder = pem2der(certpem);
		//getfield(certder);
		var subj = getSubjectString(certder, 'own');
		if (tmpcerts.hasOwnProperty(subj)){
		  //Duplicate found. Rename the existing entry and the duplicate
		  //with extended subject
		  //console.log('adding duplicate:', subj);
		  var pem_one = tmpcerts[subj];
		  var der_one = pem2der(pem_one);
		  var subj_one = getSubjectString(der_one, 'own', true);
		  tmpcerts[subj_one] = pem_one;
		  delete tmpcerts[subj];
		  var subj_two = getSubjectString(certder, 'own', true);
		  subj = subj_two;
		}
		tmpcerts[subj] = certpem;
		var pk = getPubkey(certder);
		tmpcerts['trusted_pubkeys'].push(b64encode(ua2ba(pk)));
	}
	certs = tmpcerts;	
}


function getPubkey(cert){
	var c = Certificate.decode(new Buffer(cert), 'der');
	return c.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey.data;
}


//Usually CN=&O= is enough to uniquely identify a CA, however there are 6 certs 
//in rootstore which have the same O&CN and are only distinguished by OU=
function getSubjectString(cert, whose, extended){
	if (typeof(extended) === "undefined"){
		extended = false;
	}
	var c = Certificate.decode(new Buffer(cert), 'der');
	var fields;
	if (whose === 'issuer'){
		fields = c.tbsCertificate.issuer.value;
	}
	else if (whose === 'own'){
		fields = c.tbsCertificate.subject.value;
	}
	var cn_str = '';
	var o_str = '';
	var ou_str = '';
	for(var i=0; i < fields.length; i++){
	  if (fields[i][0].type.toString() === [2,5,4,3].toString()){
		  cn_str = 'CN=' + ba2str(fields[i][0].value.slice(2)) + '/';
	  }
	  if (fields[i][0].type.toString() === [2,5,4,10].toString()){
		  o_str = 'O=' + ba2str(fields[i][0].value.slice(2)) + '/';
	  }
	  if (extended){
		  if (fields[i][0].type.toString() === [2,5,4,11].toString()){
			  ou_str = 'OU=' + ba2str(fields[i][0].value.slice(2)) + '/';
		  }
		  //we have one root CA Autoridad de Certificacion Firmaprofesional CIF A62634068
		  //which is distinguishable only by L=
		  //we put the L= value into OU=
		  if (ou_str === ''){
			  if (fields[i][0].type.toString() === [2,5,4,7].toString()){
				ou_str = 'OU=' + ba2str(fields[i][0].value.slice(2)) + '/';
			}	
		  }
	  }
	}
	if (!cn_str && !o_str){
	  return false;
	}
	return cn_str+o_str+ou_str;
}


//---an adopted copy of PaymentProtocol.verifyCertChain from 
//https://github.com/bitpay/bitcore-payment-protocol/blob/master/lib/browser.js
var verifyCertChain = function(chain) {
	
//Check if there is no root cert in the chain
//and if so, add it (provided that we know such root CA)

//Uniquely identify CAs by the O and CN string and by the pubkey, not by PEM of the cert
//e.g. VeriSign Class 3 Public Primary Certification Authority - G5
//has different PEMs for Fiferox vs Chrome

  var find_in_store = function(rootcert){
	  var subjown = getSubjectString(rootcert, 'own');
	  if (!certs.hasOwnProperty(subjown)){
		  //get extended subject string
		  subjown = getSubjectString(rootcert, 'own', true);
		  if (!certs.hasOwnProperty(subjown)) return false;
	  }
	  var pk = b64encode(ua2ba(getPubkey(rootcert)));
	  if (certs.trusted_pubkeys.indexOf(pk) < 0) return false;
	  return true;
  }
  var found = find_in_store(chain[chain.length-1]);
	  
  if (!found) {
	  //Usually there is no root cert in chain
	  var subj = getSubjectString(chain[chain.length-1], 'issuer');
	  if (!certs.hasOwnProperty(subj)){
		  //get extended subject string
		  subj = getSubjectString(chain[chain.length-1], 'issuer', true);
		  if (!certs.hasOwnProperty(subj)) return false;
	  }
	  chain.push(pem2der(certs[subj]));
  }  
  
	
  return chain.every(function(cert, i) {    
    if (i === chain.length-1){
		//we already checked earlier that this CA's pubkey is in store
		//or we added this CA to the chain ourselves
		return true;
	}
		
	var ncert = chain[i + 1];
    var nder = ba2hex(ncert);
    var npem = KJUR.asn1.ASN1Util.getPEMStringFromHex(nder, 'CERTIFICATE');

    // Get Next Certificate:
    var ndata = new Buffer(nder, 'hex');
    //var ndata = ba2ua(ncert);
    var nc = Certificate.decode(ndata, 'der');
    
    // Get Signature Value from current certificate:
    var data = new Buffer(cert);
    //var data = ba2ua(der);
    var c = Certificate.decode(data, 'der');
    var sig = c.signature.data;
    var alg = c.signatureAlgorithm.algorithm;
    var lastalgbyte = alg[alg.length-1];
    var sigHashAlg;
    //1.2.840.113549.1.1.11 sha256
    //1.2.840.113549.1.1.5  sha1
    //1.2.840.113549.1.1.12  sha384
    if (lastalgbyte	=== 11){
		sigHashAlg = 'SHA256withRSA';
	}
	else if (lastalgbyte === 5){
		sigHashAlg = 'SHA1withRSA';
	}
	else if (lastalgbyte === 12){
		sigHashAlg = 'SHA384withRSA';
	}
	else {return false;}
    
    var npubKey;
    // Get Public Key from next certificate (via KJUR because it's a mess):
	  var js = new KJUR.crypto.Signature({
		alg: sigHashAlg,
		prov: 'cryptojs/jsrsa'
	  });
	  js.initVerifyByCertificatePEM(npem);
	  npubKey = js.pubKey;  

    // Check Validity of Certificates
    var validityVerified = validateCertTime(c, nc);

    // Check the Issuer matches the Subject of the next certificate:
    var issuerVerified = validateCertIssuer(c, nc);

    // Verify current Certificate signature
	  var jsrsaSig = new KJUR.crypto.Signature({
		alg: sigHashAlg,
		prov: 'cryptojs/jsrsa'
	  });
	  jsrsaSig.initVerifyByPublicKey(npubKey);

	  // Get the raw DER TBSCertificate
	  // from the DER Certificate:
	  var tbs = getTBSCertificate(data, c.signature.data.length);

	  jsrsaSig.updateHex(tbs.toString('hex'));

	  var sigVerified = jsrsaSig.verify(sig.toString('hex'));
	  
    return validityVerified && issuerVerified && sigVerified;
  });
};

var X509_ALGORITHM = {
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.113549.1.1.2': 'RSA_MD2',
  '1.2.840.113549.1.1.4': 'RSA_MD5',
  '1.2.840.113549.1.1.5': 'RSA_SHA1',
  '1.2.840.113549.1.1.11': 'RSA_SHA256',
  '1.2.840.113549.1.1.12': 'RSA_SHA384',
  '1.2.840.113549.1.1.13': 'RSA_SHA512',

  '1.2.840.10045.4.3.2': 'ECDSA_SHA256',
  '1.2.840.10045.4.3.3': 'ECDSA_SHA384',
  '1.2.840.10045.4.3.4': 'ECDSA_SHA512'
};

var getAlgorithm = function(value, index) {
  if (Array.isArray(value)) {
    value = value.join('.');
  }
  value = X509_ALGORITHM[value];
  if (typeof(index) !== 'undefined') {
    value = value.split('_');
    if (index === true) {
      return {
        cipher: value[0],
        hash: value[1]
      };
    }
    return value[index];
  }
  return value;
};


//---BEGIN copied from https://github.com/bitpay/bitcore-payment-protocol/blob/master/lib/common.js

// Check Validity of Certificates
var validateCertTime = function(c, nc) {
  var validityVerified = true;
  var now = Date.now();
  var cBefore = c.tbsCertificate.validity.notBefore.value;
  var cAfter = c.tbsCertificate.validity.notAfter.value;
  var nBefore = nc.tbsCertificate.validity.notBefore.value;
  var nAfter = nc.tbsCertificate.validity.notAfter.value;
  if (cBefore > now || cAfter < now || nBefore > now || nAfter < now) {
    validityVerified = false;
  }
  return validityVerified;
};

// Check the Issuer matches the Subject of the next certificate:
var validateCertIssuer = function(c, nc) {
  var issuer = c.tbsCertificate.issuer;
  var subject = nc.tbsCertificate.subject;
  var issuerVerified = issuer.type === subject.type && issuer.value.every(function(issuerArray, i) {
    var subjectArray = subject.value[i];
    return issuerArray.every(function(issuerObject, i) {
      var subjectObject = subjectArray[i];

      var issuerObjectType = issuerObject.type.join('.');
      var subjectObjectType = subjectObject.type.join('.');

      var issuerObjectValue = issuerObject.value.toString('hex');
      var subjectObjectValue = subjectObject.value.toString('hex');

      return issuerObjectType === subjectObjectType && issuerObjectValue === subjectObjectValue;
    });
  });
  return issuerVerified;
};


// Grab the raw DER To-Be-Signed Certificate
// from a DER Certificate to verify
var getTBSCertificate = function(data, siglen) {
  // We start by slicing off the first SEQ of the
  // Certificate (TBSCertificate is its own SEQ).

  // The first 10 bytes usually look like:
  // [ 48, 130, 5, 32, 48, 130, 4, 8, 160, 3 ]
  var start = 0;
  var starts = 0;
  for (start = 0; start < data.length; start++) {
    if (starts === 1 && data[start] === 48) {
      break;
    }
    if (starts < 1 && data[start] === 48) {
      starts++;
    }
  }

  // The bytes *after* the TBS (including the last TBS byte) will look like
  // (note the 48 - the start of the sig, and the 122 - the end of the TBS):
  // [ 122, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 11, 5, 0, 3, ... ]

  // The certificate in these examples has a `start` of 4, and an `end` of
  // 1040. The 4 bytes is the DER SEQ of the Certificate, right before the
  // SEQ of the TBSCertificate.
  var end = 0;
  var ends = 0;
  for (end = data.length - 1 - siglen; end > 0; end--) {
    if (ends === 2 && data[end] === 48) {
      break;
    }
    if (ends < 2 && data[end] === 0) {
      ends++;
    }
  }

  // Return our raw DER TBSCertificate:
  return data.slice(start, end);
};

//---END copied from https://github.com/bitpay/bitcore-payment-protocol/blob/master/lib/common.js

//this must trigger after asn1.js was loaded, so putting this to the bottom
/**
 * File: verifychain/verifychain.js
 */

// End dependencies paste


var random_uid; //we get a new uid for each notarized page
var reliable_sites = []; //read from content/pubkeys.txt
var previous_session_start_time; // used to make sure user doesnt exceed rate limiting
var chosen_notary;
var tdict = {};
var valid_hashes = [];
var browser_init_finished = false; //signal to test script when it can start
var mustVerifyCert = true; //set to false during debugging to be able to work with self-signed certs
var portPopup;
var portManager = null;
var notarization_in_progress = false;
var waiting_for_click = false;
var clickTimeout = null;
var requestBody = null; //will contain POST request's body
var urlToMatch;
var requestIdToMatch;
var is_chrome = true
var appId = null; //Chrome uses to send message to external Chrome app. Firefox uses it's own id
var popupError = null; //set to non-null when there is some error message that must be shown
//via the popup
var testing = false;

const MemoryStorage = {}
const ResultsStorage = {}

var useNode = true


function getPref(pref) {
  return new Promise(function(resolve, reject) {
    if (Object.keys(MemoryStorage).length === 0) {
      resolve('undefined')
      return;
    } else {
      resolve(MemoryStorage[pref])
    }
  })
}

function setPref(pref, value) {
  return new Promise(function(resolve, reject) {
    MemoryStorage[pref] = value
    resolve()
  })
}

// function sendToPopup(data) {
//     console.log('sendToPopup', data)
//   if (is_chrome) {
//     console.log('chrome.runtime.sendMessage', data)
//     chrome.runtime.sendMessage(data);
//   } else {
//     console.log('will postMessage ', data);
//     portPopup.postMessage(data);
//   }
// }


// function openManager() {
//   var prefix = is_chrome ? 'webextension/' : '';
//   var url = chrome.extension.getURL(prefix + 'content/manager.html');
//   //re-focus tab if manager already open
//   chrome.tabs.query({}, function(tabs) {
//     for (var i = 0; i < tabs.length; i++) {
//       if (tabs[i].url === url) {
//         chrome.tabs.update(tabs[i].id, {
//           active: true
//         });
//         return;
//       }
//     }
//     chrome.tabs.create({
//       url: url
//     });
//   });
// }



// function notarizeAfterClickSelected() {
//   var prefix = is_chrome ? 'webextension/' : '';
//   var url = chrome.extension.getURL(prefix + 'content/arrow24.png');
//   chrome.browserAction.setIcon({
//     path: url
//   });
//   waiting_for_click = true;
//   clickTimeout = setTimeout(function() {
//     chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener);
//     loadNormalIcon();
//     waiting_for_click = false;
//     sendAlert({
//       title: 'PageSigner error.',
//       text: 'You haven\'t clicked any https:// links in 30 seconds. Please try again. If this error persists it may mean that the website you are trying to notarize is not compatible with PageSigner.'
//     });
//   }, 30 * 1000);
//
//   //get current tab ID and install listener only for that tab
//   console.log()
//   chrome.tabs.query({
//     active: true
//   }, function(t) {
//     //Note that onBeforeRequest triggers first and only then onBeforeSendHeaders
//     chrome.webRequest.onBeforeRequest.addListener(
//       onBeforeRequestListener, {
//         urls: ["<all_urls>"],
//         tabId: t[0].id,
//         types: ["main_frame", "xmlhttprequest"]
//       }, ["requestBody", "blocking"]);
//   });
// }


// function onBeforeRequestListener(details) {
//   if (waiting_for_click) {
//     clearTimeout(clickTimeout);
//     waiting_for_click = false;
//   }
//   console.log('in onBeforeRequestListener got details', details);
//   if (details.method == 'POST') {
//     //POST payload is only available from onBeforeRequest
//     requestBody = details.requestBody;
//   }
//
//   //kludge: FF wont trigger onBeforeSendHeaders for 127.0.0.1 url
//   //which we use during testing. Also Chrome wont trigger oBSH
//   //when URL contains # that's why we use <all_urls> instead of details.url
//   
//   urlToMatch = details.url;
//   requestIdToMatch = details.requestId;
//   
//   chrome.webRequest.onBeforeSendHeaders.addListener(
//     onBeforeSendHeadersListener, {
//       urls: ['<all_urls>'],
//       tabId: details.tabId,
//       types: [details.type],
//     }, ["requestHeaders", "blocking"]);
//
//
//   chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener);
//   return {
//     'cancel': false
//   };
// }


// function onBeforeSendHeadersListener(details) {
//   console.log('in onBeforeSendHeadersListener got details', details);
//
//   if (details.url !== urlToMatch) return;
//   if (details.requestId !== requestIdToMatch) return;
//   details['requestBody'] = requestBody;
//   var rv = getHeaders(details);
//   console.log('get headers', rv)
//   //we must return fast hence the async invocation
//   setTimeout(function() {
//     console.log('START NOTARIZING', rv.headers, rv.server, rv.port)
//     startNotarizing(rv.headers, rv.server, rv.port);
//   }, 0);
//   var jsRunner = {
//     'code': 'window.stop()'
//   };
//   chrome.tabs.executeScript(details.tabId, jsRunner);
//   chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersListener);
//   return {
//     'cancel': true
//   };
// }


// function notarizeNowSelected() {
//   chrome.tabs.query({
//     active: true
//   }, function(t) {
//     console.log('Notarizing url: ', t[0].url)
//     if (!t[0].url.startsWith('https://')) {
//       sendAlert({
//         'title': 'PageSigner error',
//         'text': 'You can only notarize pages which start with https://'
//       });
//       return;
//     }
//
//     //Note that onBeforeRequest triggers first and only then onBeforeSendHeaders
//     chrome.webRequest.onBeforeRequest.addListener( onBeforeRequestListener, {
//         urls: ["<all_urls>"],
//         tabId: t[0].id,
//         types: ["main_frame"]
//       }, ["requestBody", "blocking"]);
//
//     //reload current tab in order to trigger the HTTP request
//     chrome.tabs.reload(t[0].id);
//   });
// }


function getHeaders(obj) {
  var x = obj.url.split('/');
  var host = x[2].split(':')[0];
  x.splice(0, 3);
  var resource_url = x.join('/');
  var headers = obj.method + " /" + resource_url + " HTTP/1.1" + "\r\n";
  headers += "Host: " + host + "\r\n";
  for (var i = 0; i < obj.requestHeaders.length; i++) {
    var h = obj.requestHeaders[i];
    headers += h.name + ": " + h.value + "\r\n";
  }
  if (obj.method == "GET") {
    headers += "\r\n";
  } else if (obj.method == 'POST') {
    var formData = obj.requestBody.formData;
    var keys = Object.keys(formData);
    var content = '';
    for (var i = 0; i < keys.length; i++) {
      content += keys[i] + '=' + formData[keys[i]];
      if (i + 1 < keys.length) {
        content += '&';
      }
    }
    //Chrome doesn't expose Content-Length which chokes nginx
    headers += 'Content-Length: ' + parseInt(content.length) + '\r\n\r\n';
    headers += content;
  }
  var port = 443;
  if (obj.url.split(':').length === 3) {
    //the port is explicitely provided in URL
    port = parseInt(obj.url.split(':')[2].split('/')[0]);
  }
  return {
    'headers': headers,
    'server': host,
    'port': port
  };
}




// function renamePGSG(dir, newname) {
//   console.log('about to rename');
//   writeFile(dir, 'meta', newname)
//     .then(function() {
//       chrome.storage.local.get(null, function(i) {
//         console.log(i)
//       });
//       populateTable();
//     });
// }


// function deletePGSG(dir) {
//   chrome.storage.local.remove(dir, function() {
//     populateTable();
//   });
//   return;
// }

// function process_message(data) {
//   console.log('')
//   console.log('PROCESSIN MESSAGE', data)
//   console.log('')
//   if (data.destination !== 'extension') return;
//   console.log('ext got msg', data);
//   if (data.message === 'rename') {
//     // renamePGSG(data.args.dir, data.args.newname);
//   } else if (data.message === 'delete') {
//     deletePGSG(data.args.dir);
//   } else if (data.message === 'import') {
//     verify_tlsn_and_show_data(data.args.data, true);
//   } else if (data.message === 'export') {
//     //Not in use: manager is doing the exporting
//   } else if (data.message === 'notarize') {
//     console.log('NOTARIZE!')
//     notarizeNowSelected();
//   } else if (data.message === 'notarizeAfter') {
//     // notarizeAfterClickSelected();
//   } else if (data.message === 'manage') {
//     // openManager();
//   } else if (data.message === 'refresh') {
//     populateTable();
//   } else if (data.message === 'openLink1') {
//     chrome.tabs.create({
//       url: 'https://www.tlsnotary.org'
//     });
//   } else if (data.message === 'donate link') {
//     chrome.tabs.create({
//       url: 'https://www.tlsnotary.org/#Donate'
//     });
//   } else if (data.message === 'viewdata') {
//     openTabs(data.args.dir);
//   } else if (data.message === 'viewraw') {
//     viewRaw(data.args.dir);
//   } else if (data.message === 'file picker') {
//     var prefix = is_chrome ? 'webextension/' : '';
//     // var url = chrome.extension.getURL(prefix + 'content/file_picker.html');
//     // chrome.tabs.create({
//     //   url: url
//     // }, function(t) {
//     //   console.log('tabid of file picker is', t.id);
//     // });
//   } else if (data.message === 'openInstallLink') {
//     // //Chrome only
//     // chrome.tabs.create({
//     //   url: 'https://chrome.google.com/webstore/detail/pagesigner-helper-app/oclohfdjoojomkfddjclanpogcnjhemd'
//     // });
//   } else if (data.message === 'openChromeExtensions') {
//     //Chrome only
//     chrome.tabs.query({
//       url: 'chrome://extensions/*'
//     }, function(tabs) {
//       if (tabs.length === 0) {
//         chrome.tabs.create({
//           url: 'chrome://extensions'
//         });
//         return;
//       }
//       chrome.tabs.update(tabs[0].id, {
//         active: true
//       });
//     });
//   } else if (data.message === 'popup active') {
//     if (notarization_in_progress) {
//       // sendToPopup({
//       //   'destination': 'popup',
//       //   'message': 'notarization_in_progress'
//       // });
//       return;
//     }
//     if (waiting_for_click) {
//       // sendToPopup({
//       //   'destination': 'popup',
//       //   'message': 'waiting_for_click'
//       // });
//       return;
//     }
//     if (!is_chrome) {
//       if (popupError) {
//         // sendToPopup({
//         //   'destination': 'popup',
//         //   'message': 'popup error',
//         //   'data': popupError
//         // });
//         popupError = null;
//         loadNormalIcon();
//       } else {
//         // sendToPopup({
//         //   'destination': 'popup',
//         //   'message': 'show_menu'
//         // });
//       }
//       return;
//     }
//     // else{} the checks below are only for Chrome
//     console.log('appId', appId)
//     console.log(chrome.management)
//     // TODO: Goga edit. Bypass chrome.mamagement.get
//     chrome.runtime.sendMessage({
//       'destination': 'popup',
//       'message': 'show_menu'
//     });
//     // chrome.management.get(appId, function(info) {
//     //   if (!info) {
//     //     chrome.runtime.sendMessage({
//     //       'destination': 'popup',
//     //       'message': 'app_not_installed'
//     //     });
//     //     return;
//     //   }
//     //   if (info.enabled === false) {
//     //     chrome.runtime.sendMessage({
//     //       'destination': 'popup',
//     //       'message': 'app_disabled'
//     //     });
//     //     return;
//     //   }
//     //   if (popupError) {
//     //     chrome.runtime.sendMessage({
//     //       'destination': 'popup',
//     //       'message': 'popup error',
//     //       'data': popupError
//     //     });
//     //     popupError = null;
//     //     loadNormalIcon();
//     //   } else {
//     //     chrome.runtime.sendMessage({
//     //       'destination': 'popup',
//     //       'message': 'show_menu'
//     //     });
//     //   }
//     // });
//   }
// }


// function browser_specific_init() {
//   console.log('browser specific init')
//   // getPref('valid_hashes')
//   //   .then(function(hashes) {
//   //     if (hashes !== 'undefined') {
//   //       valid_hashes = hashes;
//   //     }
//   //   });
//   // //console.log('is_chrome', is_chrome);
//   // if (is_chrome) {
//   //   console.log('initializing chrome listener')
//   //   appId = "pdmbaecancjlfakmnccfjeccdgeccege"; //id of the helper app
//   //   console.log('appId', appId)
//   //   // chrome.runtime.onMessage.addListener(function(data) {
//   //   //   console.log('on message')
//   //   //   // process_message(data);
//   //   // });
//   // } else {
//   //   appId = chrome.runtime.id;
//   //   //console.log('installing listener');
//   //   //Temporary kludge for FF53 to use Ports for communication
//   //   chrome.runtime.onConnect.addListener(function(port) {
//   //     console.log('runtime on connect listener')
//   //     console.log('chrome.runtime.onConnect.addListener with port', port);
//   //     if (port.name == 'popup-to-extension') {
//   //       portPopup = port;
//   //       console.log('in extension port connection from', port.name);
//   //       port.onMessage.addListener(function(data) {
//   //         console.log('listener')
//   //         console.log('in port listener, got', data);
//   //         // process_message(data);
//   //       });
//   //     } else if (port.name == 'filepicker-to-extension') {
//   //       port.onMessage.addListener(function(data) {
//   //         console.log('listener')
//   //         console.log('in filepicker-to-extension got data', data);
//   //         if (data.destination !== 'extension') return;
//   //         if (data.message !== 'import') return;
//   //         verify_tlsn_and_show_data(data.args.data, true);
//   //       });
//   //     } else if (port.name == 'notification-to-extension') {
//   //       port.onMessage.addListener(function(data) {
//   //         console.log('listener')
//   //         console.log('in notification-to-extension got data', data);
//   //         if (data.destination !== 'extension') return;
//   //         if (data.message !== 'viewraw') return;
//   //         // process_message(data);
//   //       });
//   //     } else if (port.name == 'manager-to-extension') {
//   //       portManager = port;
//   //       port.onMessage.addListener(function(data) {
//   //         console.log('listener')
//   //         console.log('in manager-to-extension got data', data);
//   //         console.log('listener')
//   //         if (data.destination !== 'extension') return;
//   //         // process_message(data);
//   //       });
//   //     }
//   //   });
//   // }
//   init()
// }



function init() {
  chosen_notary = oracles[Math.random() * (oracles.length) << 0];
  var oracle_hash = ba2hex(sha256(JSON.stringify(chosen_notary)));
  var was_oracle_verified = false;

  return import_reliable_sites()
  .then(() => getPref('verifiedOracles.' + oracle_hash))
  .then(value => {
    // TODO: Is oracles_intact necessary?
    if (value === true) {
      oracles_intact = true;
    } else {
      //async check oracles and if the check fails, sets a global var
      //which prevents notarization session from running
      console.log('checking oracles')
      return check_oracle(chosen_notary, imageID, snapshotID)
      .then(() => {
        browser_init_finished = true;
        return setPref('verifiedOracles.' + oracle_hash, true)
      })
      .then(function() {
        oracles_intact = true
        console.log('checked oracles')
        return true
      })
     }
  })

}


function import_reliable_sites() {
  return import_resource('pubkeys.txt')
    .then(function(text_ba) {
      const t = parse_reliable_sites(ba2str(text_ba))
      console.log('Reliable sites are: ', t.map(s => s.name))
      return t
    });
}


//we can import chrome:// and file:// URL
function import_resource(filename) {
  console.log('DEBUG1: import resource', filename)
  return new Promise(function(resolve, reject) {
    fs.readFile(`./${filename}`, (err, data) => {
      resolve(ab2ba(data.buffer))
    })
  })
}

// function fetch(url) {
//   return new Promise(function(resolve, reject) {
//     var xhr = new XMLHttpRequest();
//     xhr.responseType = "arraybuffer";
//     xhr.onreadystatechange = function() {
//       if (xhr.readyState != 4)
//         return;
//
//       if (xhr.response) {
//         resolve(ab2ba(xhr.response));
//       }
//     };
//     xhr.open('get', url, true);
//     xhr.send();
//   });
// }

function parse_reliable_sites(text) {
  var lines = text.split('\n');
  var name = "";
  var expires = "";
  var modulus = [];
  var i = -1;
  var x;
  var mod_str;
  var line;
  while (true) {
    i += 1;
    if (i >= lines.length) {
      return reliable_sites
      break;
    }
    x = lines[i];
    if (x.startsWith('#')) {
      continue;
    } else if (x.startsWith('Name=')) {
      name = x.slice('Name='.length);
    } else if (x.startsWith('Expires=')) {
      expires = x.slice('Expires='.length);
    } else if (x.startsWith('Modulus=')) {
      mod_str = '';
      while (true) {
        i += 1;
        if (i >= lines.length) {
          break;
        }
        line = lines[i];
        if (line === '') {
          break;
        }
        mod_str += line;
      }
      modulus = [];
      var bytes = mod_str.split(' ');
      for (var j = 0; j < bytes.length; j++) {
        if (bytes[j] === '') {
          continue;
        }
        modulus.push(hex2ba(bytes[j])[0]);
      }
      //Don't use pubkeys which expire less than 3 months from now
      var ex = expires.split('/');
      var extime = new Date(parseInt(ex[2]), parseInt(ex[0]) - 1, parseInt(ex[1])).getTime();
      var now = new Date().getTime();
      if ((extime - now) < 1000 * 60 * 60 * 24 * 90) {
        continue;
      }
      reliable_sites.push({
        'name': name,
        'port': 443,
        'expires': expires,
        'modulus': modulus
      });
    }
  }
}


function startNotarizing(headers, server, port) {
  console.log('start notarizing')
  if (!oracles_intact) {
    //NotarizeAfterClick already changed the icon at this point, revert to normal
    // loadNormalIcon();
    sendAlert({
      title: 'PageSigner error',
      text: 'Cannot notarize because something is wrong with PageSigner server. Please try again later'
    });
    return;
  }
  var modulus;
  var certsha256;
  var chain;
  // loadBusyIcon();
  console.log('getting server')
  return get_certificate(server, port)
    .then(function(certchain) {
      chain = certchain;
      if (mustVerifyCert && !verifyCert(chain)) {
        sendAlert({
          title: "PageSigner error",
          text: "This website cannot be audited by PageSigner because it presented an untrusted certificate"
        });
        return
      }
      modulus = getModulus(chain[0]);
      certsha256 = sha256(chain[0]);
      random_uid = Math.random().toString(36).slice(-10);
      previous_session_start_time = new Date().getTime();
      //loop prepare_pms 10 times until succeeds
      return new Promise(function(resolve, reject) {
        var tries = 0;
        var loop = function(resolve, reject) {
          tries += 1;
          prepare_pms(modulus, undefined, reliable_sites, chosen_notary, random_uid).then(function(args) {
            resolve(args);
          }).catch(function(error) {
            console.log('caught error', error);
            if (error.startsWith('Timed out')) {
              reject(error);
              return;
            }
            if (error != 'PMS trial failed') {
              reject('in prepare_pms: caught error ' + error);
              return;
            }
            if (tries == 10) {
              reject('Could not prepare PMS after 10 tries');
              return;
            }
            //else PMS trial failed
            loop(resolve, reject);
          });
        };
        loop(resolve, reject);
      });
    })
    .then(function(args) {
      return start_audit(modulus, certsha256, server, port, headers, args[0], args[1], args[2], chosen_notary, random_uid);
    })
    .then(function(args2) {
      return save_session_and_open_data(args2, server);
    })
    .then(function() {
      // FINISHED Succesffully
      console.log('Notarization finished')
      // console.log(ResultsStorage)
      const session = Object.values(ResultsStorage)[0]
      return session
    })
    .catch(function(err) {
      //TODO need to get a decent stack trace
      // loadNormalIcon();
      console.log('There was an error: ' + err);
      if (err === "Server sent alert 2,40") {
        sendAlert({
          title: 'PageSigner error',
          text: 'Pagesigner is not compatible with this website because the website does not use RSA ciphersuites'
        });
      } else if (err.startsWith('Timed out waiting for notary server to respond') &&
        ((new Date().getTime() - previous_session_start_time) < 60 * 1000)) {
        sendAlert({
          title: 'PageSigner error',
          text: 'You are signing pages way too fast. Please retry in 60 seconds'
        });
      } else {
        sendAlert({
          title: 'PageSigner error',
          text: err
        });
      }
    });
}



function save_session_and_open_data(args, server) {
  return new Promise(function(resolve, reject) {
    assert(args.length === 18, "wrong args length");
    var cipher_suite = args[0];
    var client_random = args[1];
    var server_random = args[2];
    var pms1 = args[3];
    var pms2 = args[4];
    var server_certchain = args[5];
    var tlsver = args[6];
    var initial_tlsver = args[7];
    var fullresp_length = args[8];
    var fullresp = args[9];
    var IV_after_finished_length = args[10];
    var IV_after_finished = args[11];
    var notary_modulus_length = args[12];
    var signature = args[13];
    var commit_hash = args[14];
    var notary_modulus = args[15];
    var data_with_headers = args[16];
    var time = args[17];

    var server_chain_serialized = []; //3-byte length prefix followed by cert
    for (var i = 0; i < server_certchain.length; i++) {
      var cert = server_certchain[i];
      server_chain_serialized = [].concat(
        server_chain_serialized,
        bi2ba(cert.length, {
          'fixed': 3
        }),
        cert);
    }

    var pgsg = [].concat(
      str2ba('tlsnotary notarization file\n\n'), [0x00, 0x02],
      bi2ba(cipher_suite, {
        'fixed': 2
      }),
      client_random,
      server_random,
      pms1,
      pms2,
      bi2ba(server_chain_serialized.length, {
        'fixed': 3
      }),
      server_chain_serialized,
      tlsver,
      initial_tlsver,
      bi2ba(fullresp_length, {
        'fixed': 8
      }),
      fullresp,
      bi2ba(IV_after_finished_length, {
        'fixed': 2
      }),
      IV_after_finished,
      bi2ba(notary_modulus_length, {
        'fixed': 2
      }),
      signature,
      commit_hash,
      notary_modulus,
      time);

    var commonName = getCommonName(server_certchain[0]);
    var creationTime = getTime();
    var session_dir = makeSessionDir(commonName, creationTime);
    console.log('SAVING SESSION', session_dir)
    writeFile(session_dir, 'creationTime', creationTime)
      .then(function() {
        console.log('wrote file', data_with_headers, session_dir)
        return writeDatafile(data_with_headers, session_dir)
      })
      .then(function() {
        return writePgsg(pgsg, session_dir, commonName);
      })
      .then(function() {
        // return openTabs(session_dir);
      })
      .then(function() {
        updateCache(sha256(pgsg));
        console.log('POPULATE TABLE')
        // populateTable(); //refresh manager
        resolve();
      });
    
  });
}


//data_with_headers is a string
function writeDatafile(data_with_headers, session_dir) {
  return new Promise(function(resolve, reject) {
    var rv = data_with_headers.split('\r\n\r\n');
    var headers = rv[0];
    var data = rv.splice(1).join('\r\n\r\n');
    var header_lines = headers.split('\r\n');
    var type = 'unknown';
    for (var i = 0; i < header_lines.length; i++) {
      if (header_lines[i].search(/content-type:\s*/i) > -1) {
        type = get_type(header_lines[i]);
        break;
      }
    }
    
    function get_type(line){
      var t;
      var match = line.match('application/|text/|image/');
      if (!match) {
        t = 'unknown';
      }
      else {
        var afterslash = line.slice(match.index + match[0].length);
        //search until either + , ; or <space> is encountered
        var delimiter = afterslash.match(/\+|;| /);
        if (!delimiter) {
          t = afterslash;
        }
        else {
          t = afterslash.slice(0, delimiter.index);
        }
      }
      if (!t.length) t = 'unknown';
      if (t == 'vnd.ms-excel') t = 'xls';
      if (t == 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') t = 'xlsx';
      if (t == 'plain') t = 'txt';
      return t;
    }
    
    
    if (type === "html") {
      //disabling for now because there are no issues displaying without the marker
      //html needs utf-8 byte order mark
      //data = ''.concat(String.fromCharCode(0xef, 0xbb, 0xbf), data);
    }
    console.log('WRITE DATA FILE', type)
    writeFile(session_dir, 'dataType', type).then(function() {
      return writeFile(session_dir, 'data', str2ba(data));
    }).then(function() {
      return writeFile(session_dir, 'raw.txt', data_with_headers);
    }).then(function() {
      console.log('wrote')
      resolve();
    });

  });
}



function writePgsg(pgsg, session_dir, commonName) {
  return new Promise(function(resolve, reject) {

    var dirname = session_dir.split('/').pop();
    var name = commonName.replace(/\*\./g, "");
    writeFile(dirname, 'pgsg.pgsg', pgsg).then(function() {
      return writeFile(dirname, 'meta', name);
    }).then(function() {
      return writeFile(dirname, 'metaDomainName', commonName);
    }).then(function() {
      resolve();
    });
  });
}

// function download_file(data, message){
//     console.log('view file button clicked');
//     //get the Blob and create an invisible download link
//     var ab = ba2ab(data);
//     var exportedBlob = new Blob([ab]);
//     var exportedBlobUrl = URL.createObjectURL(exportedBlob, {
//       type: 'application/octet-stream'
//     });
//     var fauxLink = document.createElement('a');
//     fauxLink.href = exportedBlobUrl;
//     fauxLink.setAttribute('download', message);
//     document.body.appendChild(fauxLink);
//     fauxLink.click();
// }

function writeFile(dirName, fileName, data) {
  // if (!is_chrome) {
  //   //weird that even though chrome.storage.local.get is available in FF53
  //   //it is undefined
  //   chrome = browser;
  // }

  return new Promise(function(resolve, reject) {
    const items = ResultsStorage
    //get the Object, append data and write it back
    var obj = {};
    console.log('OBj', obj, Object.keys(items), Object.keys(ResultsStorage))
    if (Object.keys(items).length > 0) {
      obj = items[dirName];
    }
    console.log('items to write', obj)
    obj[fileName] = data;
    obj['lastModified'] = new Date().toString();
    console.log('WRITING FILE', obj)
    ResultsStorage[dirName] = obj
    console.log('in WriteFile wrote: ', dirName, obj);
    // if(obj['pgsg.pgsg']) {
    //   download_file(obj['pgsg.pgsg'], 'pgsg.pgsg')
    // }
    resolve();
    // chrome.storage.local.set({
    //   [dirName]: obj
    // }, function() {
    //   //lastError undefined on Chrome and null on Firefox
    //   //TODO check error
    //   //if (! chrome.runtime.lastError){
    //   //	console.log('error in storage.local.set: ', chrome.runtime.lastError.message);
    //   //	}
    //   console.log('in WriteFile wrote: ', dirName, obj);
    //   if(obj['pgsg.pgsg']) {
    //     download_file(obj['pgsg.pgsg'], 'pgsg.pgsg')
    //   }
    //   resolve();
    // });
  });
}


//imported_data is an array of numbers
function verify_tlsn(data, from_past) {
  var offset = 0;
  if (ba2str(data.slice(offset, offset += 29)) !== "tlsnotary notarization file\n\n") {
    throw ('wrong header');
  }
  if (data.slice(offset, offset += 2).toString() !== [0x00, 0x02].toString()) {
    throw ('wrong version');
  }
  var cs = ba2int(data.slice(offset, offset += 2));
  var cr = data.slice(offset, offset += 32);
  var sr = data.slice(offset, offset += 32);
  var pms1 = data.slice(offset, offset += 24);
  var pms2 = data.slice(offset, offset += 24);
  var chain_serialized_len = ba2int(data.slice(offset, offset += 3));
  var chain_serialized = data.slice(offset, offset += chain_serialized_len);
  var tlsver = data.slice(offset, offset += 2);
  var tlsver_initial = data.slice(offset, offset += 2);
  var response_len = ba2int(data.slice(offset, offset += 8));
  var response = data.slice(offset, offset += response_len);
  var IV_len = ba2int(data.slice(offset, offset += 2));
  var IV = data.slice(offset, offset += IV_len);
  var sig_len = ba2int(data.slice(offset, offset += 2));
  var sig = data.slice(offset, offset += sig_len);
  var commit_hash = data.slice(offset, offset += 32);
  var notary_pubkey = data.slice(offset, offset += sig_len);
  var time = data.slice(offset, offset += 4);
  assert(data.length === offset, 'invalid .pgsg length');

  offset = 0;
  var chain = []; //For now we only use the 1st cert in the chain
  while (offset < chain_serialized.length) {
    var len = ba2int(chain_serialized.slice(offset, offset += 3));
    var cert = chain_serialized.slice(offset, offset += len);
    chain.push(cert);
  }

  var commonName = getCommonName(chain[0]);
  //verify cert
  if (!verifyCert(chain)) {
    throw ('certificate verification failed');
  }
  var modulus = getModulus(chain[0]);
  //verify commit hash
  if (sha256(response).toString() !== commit_hash.toString()) {
    throw ('commit hash mismatch');
  }
  //verify sig
  var signed_data = sha256([].concat(commit_hash, pms2, modulus, time));
  var signing_key;
  if (from_past) {
    signing_key = notary_pubkey;
  } else {
    signing_key = chosen_notary.modulus;
  }
  if (!verify_commithash_signature(signed_data, sig, signing_key)) {
    throw ('notary signature verification failed');
  }

  //decrypt html and check MAC
  var s = new TLSNClientSession();
  s.__init__();
  s.unexpected_server_app_data_count = response.slice(0, 1);
  s.chosen_cipher_suite = cs;
  s.client_random = cr;
  s.server_random = sr;
  s.auditee_secret = pms1.slice(2, 2 + s.n_auditee_entropy);
  s.initial_tlsver = tlsver_initial;
  s.tlsver = tlsver;
  s.server_modulus = modulus;
  s.set_auditee_secret();
  s.auditor_secret = pms2.slice(0, s.n_auditor_entropy);
  s.set_auditor_secret();
  s.set_master_secret_half(); //#without arguments sets the whole MS
  s.do_key_expansion(); //#also resets encryption connection state
  s.store_server_app_data_records(response.slice(1));
  s.IV_after_finished = IV;
  s.server_connection_state.seq_no += 1;
  s.server_connection_state.IV = s.IV_after_finished;
  html_with_headers = decrypt_html(s);
  return [html_with_headers, commonName, data, notary_pubkey];
}



function makeSessionDir(server, creationTime, is_imported) {

  if (typeof(is_imported) === "undefined") {
    is_imported = false;
  }
  var imported_str = is_imported ? "-IMPORTED" : "";
  var server_sanitized = server;
  if (server.search(/\*/) > -1) {
    var parts = server.split('.');
    server_sanitized = parts[parts.length - 2] + '.' + parts[parts.length - 1];
  }
  var name = 'session-' + creationTime + '-' + server_sanitized + imported_str;
  return name;
}


//imported_data is an array of numbers
function verify_tlsn_and_show_data(imported_data, create) {
  try {
    var a = verify_tlsn(imported_data, create);
  } catch (e) {
    sendAlert({
      title: 'PageSigner failed to import file',
      text: 'The error was: ' + e
    });
    return;
  }
  if (create) {
    var data_with_headers = a[0];
    var commonName = a[1];
    var imported_data = a[2];
    var creationTime = getTime();
    var session_dir = makeSessionDir(commonName, creationTime, true);
    writeFile(session_dir, 'creationTime', creationTime)
      .then(function() {
        return writeDatafile(data_with_headers, session_dir);
      })
      .then(function() {
        console.log('resolved from writeDataFile');
        return writePgsg(imported_data, session_dir, commonName);
      })
      .then(function() {
        console.log('resolved from writePgsg');
        // openTabs(session_dir);
        updateCache(sha256(imported_data));
        // populateTable(); //refresh manager
      })
      .catch(function(error) {
        console.log("got error in vtsh: " + error);
      });
  }
}


// function openTabs(dirname) {
//   var commonName;
//   var dataType;
//   const pathRoot = 'http://localhost:9000/webextension/content/'
//   getFileContent(dirname, "metaDomainName")
//     .then(function(data) {
//       commonName = data;
//       return getFileContent(dirname, "dataType");
//     })
//     .then(function(dt) {
//       dataType = dt;
//       return getFileContent(dirname, 'data');
//     })
//     .then(function(data) {
//       chrome.tabs.create({
//           url: pathRoot + 'viewer.html'
//         },
//         function(t) {
//           setTimeout(function() {
//             chrome.runtime.sendMessage({
//               destination: 'viewer',
//               type: dataType,
//               data: data,
//               sessionId: dirname,
//               serverName: commonName
//             });
//           }, 100);
//         });
//     });
// }



// function viewRaw(dirname) {
//   var commonName;
//   getFileContent(dirname, "metaDomainName")
//     .then(function(data) {
//       commonName = data;
//       return getFileContent(dirname, "raw.txt");
//     })
//     .then(function(data) {
//       var prefix = is_chrome ? 'webextension/' : '';
//       var url = chrome.extension.getURL(prefix + 'content/viewer.html');
//       chrome.tabs.create({
//           url: url
//         },
//         function(t) {
//           setTimeout(function() {
//             chrome.runtime.sendMessage({
//               destination: 'viewer',
//               data: data,
//               type: 'raw',
//               sessionId: dirname,
//               serverName: commonName
//             });
//           }, 100);
//         });
//     })
// }




// function getFileContent(dirname, filename) {
//   return new Promise(function(resolve, reject) {
//
//     chrome.storage.local.get(dirname, function(items) {
//       //TODO check if dirname filename exist
//       console.log('in getFileContent got', items);
//       resolve(items[dirname][filename]);
//     });
//   });
// }


function populateTable() {
  var prev_tdict = tdict;
  tdict = {};
  //get all sessions from storage
  const items = ResultsStorage
  var newEntries = [];
  var keys = Object.keys(items);
  for (var i = 0; i < keys.length; i++) {
    if (!keys[i].startsWith('session')) continue;
    if (!prev_tdict.hasOwnProperty(keys[i])) {
      newEntries.push(keys[i]);
      continue;
    }
    if (prev_tdict[keys[i]]['lastModified'] != items[keys[i]]['lastModified']) {
      newEntries.push(keys[i]);
      continue;
    }
    tdict[keys[i]] = prev_tdict[keys[i]];
  }
  console.log('new etries', newEntries)
  console.log(newEntries)
  // processNewEntries(newEntries).then(function() {
    // sendTable();
  // });
}


// function processNewEntries(dirnames) {
//   return new Promise(function(resolve, reject) {
//     console.log('dirnames', dirnames)
//     chrome.storage.local.get(dirnames, function(items) {
//       console.log("items!", items)
//       var keys = Object.keys(items);
//       for (var i = 0; i < keys.length; i++) {
//         var imported = false;
//         if (keys[i].match("-IMPORTED$") == "-IMPORTED") {
//           imported = true;
//         }
//         tdict[keys[i]] = {
//           'name': items[keys[i]]['meta'],
//           'imported': imported,
//           'hash': sha256(items[keys[i]]['pgsg.pgsg']),
//           'pgsg': items[keys[i]]['pgsg.pgsg'],
//           'lastModified': items[keys[i]]['lastModified'],
//           'creationTime': items[keys[i]]['creationTime'],
//           'dir': keys[i]
//         };
//       }
//       resolve();
//     });
//   });
// }


//Also check validity of pgsg before sending
function sendTable() {
  var rows = [];
  for (var key in tdict) {
    var row = tdict[key];
    var is_valid = false;
    if (valid_hashes.indexOf(row.hash.toString()) > -1) {
      is_valid = true;
    } else { //e.g. for some reason the cache was flushed
      try {
        verify_tlsn(row.pgsg, true);
        //if it doesnt throw - the check passed
        is_valid = true;
        updateCache(row.hash);
      } catch (e) {
        is_valid = false;
      }
    }
    rows.push({
      'name': row.name,
      'imported': row.imported,
      'valid': is_valid,
      'verifier': 'tlsnotarygroup4',
      'creationTime': row.creationTime,
      'dir': row.dir
    });
  }
  console.log('rows', rows)
  // sendToManager(rows);
}


function sendToManager(data) {
  console.log('sending sendToManager ', data);
  // if (is_chrome) {
  //   chrome.runtime.sendMessage({
  //     'destination': 'manager',
  //     'payload': data
  //   });
  // } else {
  //   console.log('will use portManager ', portManager);
  //   //the manager may not have loaded yet
  //   function do_send() {
  //     console.log('do_send.count', do_send.count);
  //     do_send.count++;
  //     if (do_send.count > 30) return;
  //     if (!portManager) { //null if manager was never active
  //       setTimeout(do_send, 100);
  //     } else {
  //       portManager.postMessage({
  //         'destination': 'manager',
  //         'payload': data
  //       });
  //     }
  //   }
  //   do_send.count = 0;
  //   do_send();
  // }
}


function getModulus(cert) {
  var c = Certificate.decode(new Buffer(cert), 'der');
  var pk = c.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey.data;
  var pkba = ua2ba(pk);
  //expected modulus length 256, 384, 512
  var modlen = 256;
  if (pkba.length > 384) modlen = 384;
  if (pkba.length > 512) modlen = 512;
  var modulus = pkba.slice(pkba.length - modlen - 5, pkba.length - 5);
  return modulus;
}


function getCommonName(cert) {
  var c = Certificate.decode(new Buffer(cert), 'der');
  var fields = c.tbsCertificate.subject.value;
  for (var i = 0; i < fields.length; i++) {
    if (fields[i][0].type.toString() !== [2, 5, 4, 3].toString()) continue;
    //first 2 bytes are DER-like metadata
    return ba2str(fields[i][0].value.slice(2));
  }
  return 'unknown';
}


function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}


function verifyCert(chain) {
  var chainperms = permutator(chain);
  for (var i = 0; i < chainperms.length; i++) {
    if (verifyCertChain(chainperms[i])) {
      return true;
    }
  }
  return false;
}



function updateCache(hash) {
  if (!(hash.toString() in valid_hashes)) {
    valid_hashes.push(hash.toString());
    MemoryStorage['valid_hashes'] = valid_hashes
    // chrome.storage.local.set({
    //   'valid_hashes': valid_hashes
    // });
  }
}





function sendAlert(alertData) {
  console.error(alertData)
}


// function loadBusyIcon() {
//   const prefix = 'http://localhost:9000/webextension/'
//   var url = prefix + 'content/icon_spin.gif'
//   chrome.browserAction.setIcon({
//     path: url
//   });
//   notarization_in_progress = true;
// }

// function loadNormalIcon() {
//   console.log('load normal icon')
//   const prefix = 'http://localhost:9000/webextension/'
//   var url = chrome.extension.getURL(prefix + 'content/icon.png');
//   chrome.browserAction.setIcon({
//     path: url
//   });
//   notarization_in_progress = false;
// }


function initNotarization() {
  const notarizeDetails = {"frameId":0,"method":"GET","parentFrameId":-1,"requestHeaders":[{"name":"Upgrade-Insecure-Requests","value":"1"},{"name":"User-Agent","value":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36"},{"name":"Sec-Fetch-Mode","value":"navigate"},{"name":"Sec-Fetch-User","value":"?1"},{"name":"DNT","value":"1"},{"name":"Accept","value":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"}],"requestId":"10228","tabId":425,"timeStamp":1569675481867.121,"type":"main_frame","url":"https://graph.facebook.com/v4.0/me?fields=id%2Cname&access_token=EAAFTXg7DaVIBANhZAgZBIVOeo92pUl3OtsCsoFtIrpiivo40kmuG5ve9Gor0LC8dADbp9pYmJzC0WgpfFz6sqVleKQhQZBrZAnbf4r69CrMZBGDvXdcuekZCsNYgtLZBJWNnN7kaVkjYCGA1g2sdSke4OEB3UcUeqgFDLYYA2AaeuVDl7d5ZC7I80ZAJ2mppHvIMZD","requestBody":null}
  var rv = getHeaders(notarizeDetails);
  //we must return fast hence the async invocation
  console.log('START NOTARIZING', rv.headers, rv.server, rv.port)
  return startNotarizing(rv.headers, rv.server, rv.port);
}

//This must be at the bottom, otherwise we'd have to define each function
//before it gets used.
fixcerts()
init()
.then(res => {
  console.log('initialized')
  initNotarization()
  .then(results => {
    console.log('NOTARIZED SUCCESSFULLY')
    fs.writeFile('notarize1.pgsg', new Buffer(results['pgsg.pgsg']), console.log)
  })
})
