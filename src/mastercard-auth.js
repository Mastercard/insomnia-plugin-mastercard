const {buildQueryStringFromParams, joinUrlAndQueryString, smartEncodeUrl} = require('insomnia-url');
const oauth = require('mastercard-oauth1-signer');
const forge = require('node-forge');
const fs = require('fs');
const URL = require('url');

module.exports = function (context) {
  
  const qs = buildQueryStringFromParams(context.request.getParameters());
  const fullUrl = joinUrlAndQueryString(context.request.getUrl(), qs);
  const commaDecodedUrl = smartEncodeUrl(fullUrl, true);

  //OAuth requires all , as %2C
  //In the above functions (at insomnia-url/src/queryString.js:72) all %2C gets decoded
  url = commaDecodedUrl.replace(/,/g, "%2C");

  const mastercard = context.request.getEnvironmentVariable('mastercard');

  if (mastercard) {
    try {
      const p12Content = fs.readFileSync(mastercard.keystoreP12Path, 'binary');
      const p12Asn1 = forge.asn1.fromDer(p12Content, false);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, mastercard.keystorePassword);
      const keyObj = p12.getBags({
                      friendlyName: mastercard.keyAlias,
                           bagType: forge.pki.oids.pkcs8ShroudedKeyBag
                            }).friendlyName[0];
      const signingKey = forge.pki.privateKeyToPem(keyObj.key);
      const authHeader = oauth.getAuthorizationHeader(URL.parse(url), context.request.getMethod(), context.request.getBodyText(), mastercard.consumerKey, signingKey);

      context.request.setHeader('Authorization', authHeader);
    } catch (err) {
      alert(err.message);
    }
  }
};
