const {buildQueryStringFromParams, joinUrlAndQueryString, smartEncodeUrl} = require('insomnia-url');
const oauth = require('mastercard-oauth1-signer');
const forge = require('node-forge');
const fs = require('fs');
const URL = require('url');

module.exports = function (context) {
  
  //handling for comma values because the gateway expects it to be percent encoded
  context.request.getParameters().forEach( (entry) => {
    context.request.setParameter(entry.name, entry.value.replace(/,/g, "%25252C"));    
  });

  const qs = buildQueryStringFromParams(context.request.getParameters());
  const fullUrl = joinUrlAndQueryString(context.request.getUrl(), qs);
  const url = smartEncodeUrl(fullUrl, true);
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
