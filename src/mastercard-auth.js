const MasterCardAPI = require('mastercard-api-core');
const URL = require('url');

module.exports = function (context) {
  const url = context.request.getUrl();
  if (isMastercard(url)) {
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
      }
      catch (err) {
        alert(err.message);
      }
    }
    else {
      alert(`Environment variable 'mastercard' is not set.`);
    }
  }
};

function isMastercard (url) {
  return url.startsWith('https://sandbox.api.mastercard.com')
    || url.startsWith('https://api.mastercard.com')
    || url.startsWith('https://sandbox.proxy.api.mastercard.com');
}