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
