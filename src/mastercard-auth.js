const {buildQueryStringFromParams, joinUrlAndQueryString, smartEncodeUrl} = require('insomnia-url');
const MasterCardAPI = require('mastercard-api-core');
const URL = require('url');

module.exports = function (context) {
  const qs = buildQueryStringFromParams(context.request.getParameters());
  const fullUrl = joinUrlAndQueryString(context.request.getUrl(), qs);
  const url = smartEncodeUrl(fullUrl, true);

  const mastercard = context.request.getEnvironmentVariable('mastercard');
  if (mastercard) {
    try {
      const oauth = new MasterCardAPI.OAuth(
        mastercard.consumerKey,
        mastercard.keystoreP12Path,
        mastercard.keyAlias,
        mastercard.keystorePassword);
      const authHeader = oauth.sign(URL.parse(url), context.request.getMethod(), context.request.getBodyText());
      context.request.setHeader('Authorization', authHeader);
    } catch (err) {
      alert(err.message);
    }
  }
};
