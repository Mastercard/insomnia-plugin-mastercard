export declare const getJoiner: (url: string) => "?" | "&";
/**
 * Join querystring to URL
 */
export declare const joinUrlAndQueryString: (url: string, qs: string) => string;
/**
 * Extract querystring from URL
 */
export declare const extractQueryStringFromUrl: (url: string) => string;
/**
 * Build a querystring parameter from a param object
 */
export declare const buildQueryParameter: (param: {
    name?: string;
    value?: string | number;
}, strict?: boolean | undefined) => string;
/**
 * Build a querystring from a list of name/value pairs
 */
export declare const buildQueryStringFromParams: (parameters: {
    name: string;
    value?: string;
}[], strict?: boolean | undefined) => string;
/**
 * Deconstruct a querystring to name/value pairs
 * @param [qs] {string}
 * @param [strict=true] {boolean} - allow empty names and values
 * @returns {{name: string, value: string}[]}
 */
export declare const deconstructQueryStringToParams: (qs: string, strict?: boolean | undefined) => {
    name: string;
    value: string;
}[];
/**
 * Automatically encode the path and querystring components
 * @param url url to encode
 * @param encode enable encoding
 */
export declare const smartEncodeUrl: (url: string, encode?: boolean | undefined) => string;
/**
 * URL encode a string in a flexible way
 * @param str string to encode
 * @param ignore characters to ignore
 */
export declare const flexibleEncodeComponent: (str?: string, ignore?: string) => string;
//# sourceMappingURL=querystring.d.ts.map