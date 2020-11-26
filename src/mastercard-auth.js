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
  const url = commaDecodedUrl.replace(/,/g, "%2C");

  const mastercard = context.request.getEnvironmentVariable('mastercard');

  if (mastercard && commaDecodedUrl.includes('api.mastercard.com')) {
    try {
      if(mastercard.keystoreP12Path === defaultKeystoreP12PathSandbox || mastercard.keystoreP12Path === defaultKeystoreP12PathProd){
        throw Error("Please update the keystoreP12Path property from the default in the Mastercard environment settings")
      }
      if(mastercard.consumerKey === defaultConsumerKey){
        throw Error("Please update the consumerKey property from the default in the Mastercard environment settings")
      }

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
      if (err.code === 'ENOENT') {
        err.message = "No P12 file found at location: " + err.path
      }
      alert(err.message);
      throw Error(err)
    }
  }
};

const defaultKeystoreP12PathSandbox = "/path/to/sandbox-signing-key.p12"
const defaultKeystoreP12PathProd = "/path/to/production-signing-key.p12"
const defaultConsumerKey = "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000";
