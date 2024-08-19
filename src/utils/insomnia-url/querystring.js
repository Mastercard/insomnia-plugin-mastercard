"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flexibleEncodeComponent = exports.smartEncodeUrl = exports.deconstructQueryStringToParams = exports.buildQueryStringFromParams = exports.buildQueryParameter = exports.extractQueryStringFromUrl = exports.joinUrlAndQueryString = exports.getJoiner = void 0;
const url_1 = require("url");
const protocol_1 = require("./protocol");
const ESCAPE_REGEX_MATCH = /[-[\]/{}()*+?.\\^$|]/g;
/** see list of allowed characters https://datatracker.ietf.org/doc/html/rfc3986#section-2.2 */
const RFC_3986_GENERAL_DELIMITERS = ':@'; // (unintentionally?) missing: /?#[]
/** see list of allowed characters https://datatracker.ietf.org/doc/html/rfc3986#section-2.2 */
const RFC_3986_SUB_DELIMITERS = '$+,;='; // (unintentionally?) missing: !&'()*
/** see list of allowed characters https://datatracker.ietf.org/doc/html/rfc3986#section-2.2 */
const URL_PATH_CHARACTER_WHITELIST = `${RFC_3986_GENERAL_DELIMITERS}${RFC_3986_SUB_DELIMITERS}`;
const getJoiner = (url) => {
    url = url || '';
    return url.indexOf('?') === -1 ? '?' : '&';
};
exports.getJoiner = getJoiner;
/**
 * Join querystring to URL
 */
const joinUrlAndQueryString = (url, qs) => {
    if (!qs) {
        return url;
    }
    if (!url) {
        return qs;
    }
    const [base, ...hashes] = url.split('#');
    // TODO: Make this work with URLs that have a #hash component
    const baseUrl = base || '';
    const joiner = (0, exports.getJoiner)(base);
    const hash = hashes.length ? `#${hashes.join('#')}` : '';
    return `${baseUrl}${joiner}${qs}${hash}`;
};
exports.joinUrlAndQueryString = joinUrlAndQueryString;
/**
 * Extract querystring from URL
 */
const extractQueryStringFromUrl = (url) => {
    if (!url) {
        return '';
    }
    // NOTE: This only splits on first ? sign. '1=2=3' --> ['1', '2=3']
    const things = url.split('?');
    if (things.length === 1) {
        return '';
    }
    else {
        const qsWithHash = things.slice(1).join('?');
        return qsWithHash.replace(/#.*/, '');
    }
};
exports.extractQueryStringFromUrl = extractQueryStringFromUrl;
/**
 * Build a querystring parameter from a param object
 */
const buildQueryParameter = (param, 
/** allow empty names and values */
strict) => {
    strict = strict === undefined ? true : strict;
    // Skip non-name ones in strict mode
    if (strict && !param.name) {
        return '';
    }
    // Cast number values to strings
    if (typeof param.value === 'number') {
        param.value = String(param.value);
    }
    if (!strict || param.value) {
        // Don't encode ',' in values
        const value = (0, exports.flexibleEncodeComponent)(param.value || '').replace(/%2C/gi, ',');
        const name = (0, exports.flexibleEncodeComponent)(param.name || '');
        return `${name}=${value}`;
    }
    else {
        return (0, exports.flexibleEncodeComponent)(param.name);
    }
};
exports.buildQueryParameter = buildQueryParameter;
/**
 * Build a querystring from a list of name/value pairs
 */
const buildQueryStringFromParams = (parameters, 
/** allow empty names and values */
strict) => {
    strict = strict === undefined ? true : strict;
    const items = [];
    for (const param of parameters) {
        const built = (0, exports.buildQueryParameter)(param, strict);
        if (!built) {
            continue;
        }
        items.push(built);
    }
    return items.join('&');
};
exports.buildQueryStringFromParams = buildQueryStringFromParams;
/**
 * Deconstruct a querystring to name/value pairs
 * @param [qs] {string}
 * @param [strict=true] {boolean} - allow empty names and values
 * @returns {{name: string, value: string}[]}
 */
const deconstructQueryStringToParams = (qs, 
/** allow empty names and values */
strict) => {
    strict = strict === undefined ? true : strict;
    const pairs = [];
    if (!qs) {
        return pairs;
    }
    const stringPairs = qs.split('&');
    for (const stringPair of stringPairs) {
        // NOTE: This only splits on first equals sign. '1=2=3' --> ['1', '2=3']
        const [encodedName, ...encodedValues] = stringPair.split('=');
        const encodedValue = encodedValues.join('=');
        let name = '';
        try {
            name = decodeURIComponent(encodedName || '');
        }
        catch (error) {
            // Just leave it
            name = encodedName;
        }
        let value = '';
        try {
            value = decodeURIComponent(encodedValue || '');
        }
        catch (error) {
            // Just leave it
            value = encodedValue;
        }
        if (strict && !name) {
            continue;
        }
        pairs.push({ name, value });
    }
    return pairs;
};
exports.deconstructQueryStringToParams = deconstructQueryStringToParams;
/**
 * Automatically encode the path and querystring components
 * @param url url to encode
 * @param encode enable encoding
 */
const smartEncodeUrl = (url, encode) => {
    // Default autoEncode = true if not passed
    encode = encode === undefined ? true : encode;
    const urlWithProto = (0, protocol_1.setDefaultProtocol)(url);
    if (!encode) {
        return urlWithProto;
    }
    else {
        // Parse the URL into components
        const parsedUrl = (0, url_1.parse)(urlWithProto);
        // ~~~~~~~~~~~ //
        // 1. Pathname //
        // ~~~~~~~~~~~ //
        if (parsedUrl.pathname) {
            const segments = parsedUrl.pathname.split('/');
            parsedUrl.pathname = segments
                .map(s => (0, exports.flexibleEncodeComponent)(s, URL_PATH_CHARACTER_WHITELIST))
                .join('/');
        }
        // ~~~~~~~~~~~~~~ //
        // 2. Querystring //
        // ~~~~~~~~~~~~~~ //
        if (parsedUrl.query) {
            const qsParams = (0, exports.deconstructQueryStringToParams)(parsedUrl.query);
            const encodedQsParams = [];
            for (const { name, value } of qsParams) {
                encodedQsParams.push({
                    name: (0, exports.flexibleEncodeComponent)(name),
                    value: (0, exports.flexibleEncodeComponent)(value),
                });
            }
            parsedUrl.query = (0, exports.buildQueryStringFromParams)(encodedQsParams);
            parsedUrl.search = `?${parsedUrl.query}`;
        }
        return (0, url_1.format)(parsedUrl);
    }
};
exports.smartEncodeUrl = smartEncodeUrl;
/**
 * URL encode a string in a flexible way
 * @param str string to encode
 * @param ignore characters to ignore
 */
const flexibleEncodeComponent = (str = '', ignore = '') => {
    // Sometimes spaces screw things up because of url.parse
    str = str.replace(/%20/g, ' ');
    // Handle all already-encoded characters so we don't touch them
    str = str.replace(/%([0-9a-fA-F]{2})/g, '__ENC__$1');
    // Do a special encode of ignored chars, so they aren't touched.
    // This first pass, surrounds them with a special tag (anything unique
    // will work), so it can change them back later
    // Example: will replace %40 with __LEAVE_40_LEAVE__, and we'll change
    // it back to %40 at the end.
    for (const c of ignore) {
        const code = encodeURIComponent(c).replace('%', '');
        const escaped = c.replace(ESCAPE_REGEX_MATCH, '\\$&');
        const re2 = new RegExp(escaped, 'g');
        str = str.replace(re2, `__RAW__${code}`);
    }
    // Encode it
    str = encodeURIComponent(str);
    // Put back the raw version of the ignored chars
    for (const match of str.match(/__RAW__([0-9a-fA-F]{2})/g) || []) {
        const code = match.replace('__RAW__', '');
        str = str.replace(match, decodeURIComponent(`%${code}`));
    }
    // Put back the encoded version of the ignored chars
    for (const match of str.match(/__ENC__([0-9a-fA-F]{2})/g) || []) {
        const code = match.replace('__ENC__', '');
        str = str.replace(match, `%${code}`);
    }
    return str;
};
exports.flexibleEncodeComponent = flexibleEncodeComponent;
//# sourceMappingURL=querystring.js.map