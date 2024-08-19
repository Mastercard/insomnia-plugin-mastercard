"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultProtocol = void 0;
/**
 * Set a default protocol for a URL
 * @param url URL to set protocol on
 * @param [defaultProto='http:'] default protocol
 */
const setDefaultProtocol = (url, defaultProto) => {
    const trimmedUrl = url.trim();
    defaultProto = defaultProto || 'http:';
    // If no url, don't bother returning anything
    if (!trimmedUrl) {
        return '';
    }
    // Default the proto if it doesn't exist
    if (trimmedUrl.indexOf('://') === -1) {
        return `${defaultProto}//${trimmedUrl}`;
    }
    return trimmedUrl;
};
exports.setDefaultProtocol = setDefaultProtocol;
//# sourceMappingURL=protocol.js.map