function MastercardContext(context) {
  const {
    buildQueryStringFromParams,
    joinUrlAndQueryString,
    smartEncodeUrl
  } = require('./utils/insomnia-url');

  const qs = buildQueryStringFromParams(context.request.getParameters());
  const fullUrl = joinUrlAndQueryString(context.request.getUrl(), qs);

  this.commaDecodedUrl = smartEncodeUrl(fullUrl, true);
  this.config = context.request.getEnvironmentVariable('mastercard');
  this.insomnia = context;

  if (this.config && this.config.encryptionConfig) {
    this.encryptionConfig = this.config.encryptionConfig;
  }

    if (this.config && this.config.signatureConfig) {
    this.signatureConfig = this.config.signatureConfig;
  }

  // OAuth requires all, as %2C
  // In the above functions (at insomnia-url/src/queryString.js:72) all %2C gets decoded
  this.url = this.commaDecodedUrl.replace(/,/g, '%2C');

  this.isMastercardRequest = () => {
    const appliesTo = (this.config && this.config.appliesTo)
      ? this.config.appliesTo
      : ['mastercard.com', 'api.ethocaweb.com'];
    const isMastercardDomain = appliesTo.some((it) => {
      return this.commaDecodedUrl.includes(it);
    });
    return !(!this.config) && isMastercardDomain;
  };

  this.isJsonHeader = (header) => {
    if(header) {
      if (header.toLowerCase().includes('application/json'))
        return true;
      else if (header.toLowerCase().includes('application/merge-patch+json'))
        return true;
    }
    return false;
  };

  this.isJsonRequest = () => {
    const header = context.request.getHeader('content-type');
    return this.isJsonHeader(header);
  };

  this.isJsonResponse = () => {
    const header = context.response.getHeader('content-type');
    return this.isJsonHeader(header);
  };


  this.requestBody = () => {
    return context.request.getBody();
  };

  this.responseBody = () => {
    return context.response.getBodyStream();
  };

  this.requestHeader = () => {
    return toObj(context.request.getHeaders());
  };

  this.responseHeader = () => {
    const iv = this.encryptionConfig.ivHeaderName;
    const oaep = this.encryptionConfig.oaepHashingAlgorithmHeaderName;
    const key = this.encryptionConfig.encryptedKeyHeaderName;
    if (
      iv &&
      oaep &&
      key &&
      context.response.hasHeader(iv) &&
      context.response.hasHeader(oaep) &&
      context.response.hasHeader(key)
    ) {
      return {
        [iv]: context.response.getHeader(iv),
        [oaep]: context.response.getHeader(oaep),
        [key]: context.response.getHeader(key)
      };
    } else return null;
  };

  const toObj = (headers) => {
    return headers.reduce((a, b) => {
      a[b.name] = b.value;
      return a;
    }, {});
  };

  this.getRequestType = () => {
  const method = context.request.getMethod() && context.request.getMethod();
  if (method === 'GET') return 'GET';
  if (method === 'POST') return 'POST';
  return method; // returns the actual method if not GET or POST
};

  this.getSignatureHeader = () => {
    return context.response.getHeader('X-Jws-Signature');
  };
}

module.exports = MastercardContext;
