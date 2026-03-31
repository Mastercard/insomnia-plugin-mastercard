/**
 * Builds a mock Insomnia context with body shaped by the provided content type.
 * For `application/json*` headers, `body` should be a string (returned as `{ text: body }`).
 * For `application/x-www-form-urlencoded*` headers, `body` should be an array of param objects
 * (`[{ name, value, disabled? }]`, returned as `{ params: body }`).
 * For all other content types, the mock returns an empty object.
 * @param {string} method HTTP method to mock.
 * @param {string} url Request URL.
 * @param {Array} params Query parameters returned by `getParameters`.
 * @param {string} contentTypeHeader Content-Type header used to shape the mocked body.
 * @param {Function} getHeaders Function returning the request headers array.
 * @param {string|Array|null} body Raw body input, interpreted based on `contentTypeHeader`.
 * @param {Function} mockHeader Callback used when setting headers.
 * @param {Object} configJson Environment configuration object.
 */
mockContext = (method, url, params, contentTypeHeader, getHeaders, body, mockHeader, configJson) => {
  return {
    request: {
      getParameters: () => params,
      getUrl: () => url,
      getEnvironmentVariable: () => configJson,
      getMethod: () => method,
      getBody: () => {
        if(contentTypeHeader.includes('application/json')) {
          return { text: body };
        }
        
        if(contentTypeHeader.includes('application/x-www-form-urlencoded')) {
          return { params: body };
        }

        return {};

      },
      setHeader: (name, value) => mockHeader(name, value),
      getHeader: () => contentTypeHeader,
      getHeaders: () => getHeaders(),
      setBodyText: () => {
      }
    },
    response: {
      getBodyStream: () => {
      },
      getHeader: () => contentTypeHeader,
      setBody: () => {
      },
      hasHeader: () => true
    },
    app: {
      dialog: () => {}
    }
  };
};

module.exports = {
  context: (
    {
     method = 'POST',
      url = 'https://api.mastercard.com/service/api',
      config = require('../__res__/config.json').mastercard,
      body = null,
      header = 'application/json;charset=UTF-8'
    } = {}
  ) => mockContext(
    method,
    url,
    [{ name: 'name', value: 'value' }],
    header,
    () => [{ name: 'foo', value: 'bar' }],
    body,
    () => {
    },
    config
  ),
  contextPatch: (
    {
      url = 'https://api.mastercard.com/service/api',
      config = require('../__res__/config.json').mastercard,
      body = null,
      header = 'application/merge-patch+json;charset=UTF-8'
    } = {}
  ) => mockContext(
    'PATCH',
    url,
    [{ name: 'name', value: 'value' }],
    header,
    () => [{ name: 'foo', value: 'bar' }],
    body,
    () => {
    },
    config
  ),
  contextJWE: (
    {
      url = 'https://api.mastercard.com/service/api',
      config = require('../__res__/config-jwe.json').mastercard,
      body = null,
      header = 'application/json;charset=UTF-8'
    } = {}
  ) => mockContext(
    'POST',
    url,
    [{ name: 'name', value: 'value' }],
    header,
    () => [{ name: 'foo', value: 'bar' }],
    body,
    () => {
    },
    config
  ),
  contextJWEPatch: (
    {
      url = 'https://api.mastercard.com/service/api',
      config = require('../__res__/config-jwe.json').mastercard,
      body = null,
      header = 'application/merge-patch+json;charset=UTF-8'
    } = {}
  ) => mockContext(
    'PATCH',
    url,
    [{ name: 'name', value: 'value' }],
    header,
    () => [{ name: 'foo', value: 'bar' }],
    body,
    () => {
    },
    config
  ),
    contextJWS: (
      {
        url = 'https://api.mastercard.com/service/api',
        config = require('../__res__/config-sign.json').mastercard,
        body = null,
        header = 'application/json;charset=UTF-8'
      } = {}
    ) => mockContext(
      'POST',
      url,
      [{ name: 'name', value: 'value' }],
      header,
      () => [{ name: 'foo', value: 'bar' }],
      body,
      () => {
      },
      config
    ),
     contextJWSDisabled: (
          {
            url = 'https://api.mastercard.com/service/api',
            config = require('../__res__/config-sign-disabled.json').mastercard,
            body = null,
            header = 'application/json;charset=UTF-8'
          } = {}
        ) => mockContext(
          'POST',
          url,
          [{ name: 'name', value: 'value' }],
          header,
          () => [{ name: 'foo', value: 'bar' }],
          body,
          () => {
          },
          config
        ),
};
