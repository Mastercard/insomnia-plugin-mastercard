mockContext = (method, url, params, contentTypeHeader, getHeaders, body, mockHeader, configJson) => {
  return {
    request: {
      getParameters: () => params,
      getUrl: () => url,
      getEnvironmentVariable: () => configJson,
      getMethod: () => method,
      getBody: () => {
        return { text: body };
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
    }
  };
};

module.exports = {
  context: (
    {
      url = 'https://api.mastercard.com/service/api',
      config = require('../__res__/config.json').mastercard,
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
  )
};
