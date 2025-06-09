const fs = require('fs');
const forge = require('node-forge');
const oauth = require('mastercard-oauth1-signer');
const URL = require('url');
const MastercardContext = require('../mastercard-context');

function signRequest(mcContext) {
  const config = mcContext.config;
  const insomnia = mcContext.insomnia;
  const p12Content = fs.readFileSync(config.keystoreP12Path, 'binary');
  const p12Asn1 = forge.asn1.fromDer(p12Content, false);
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    p12Asn1,
    false,
    config.keystorePassword
  );

  const keyObj = p12.getBags({
    friendlyName: config.keyAlias,
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag
  }).friendlyName[0];

  const signingKey = forge.pki.privateKeyToPem(keyObj.key);

  return oauth.getAuthorizationHeader(
    URL.parse(mcContext.url),
    insomnia.request.getMethod(),
    mcContext.requestBody().text,
    config.consumerKey,
    signingKey
  );
}


module.exports = async (context) => {
  const mcContext = new MastercardContext(context);

  if (mcContext.isMastercardRequest() && !mcContext.isOAuth2Request()) {
    const config = mcContext.config;
    try {
      if (
        config.keystoreP12Path === defaultKeystoreP12PathSandbox ||
        config.keystoreP12Path === defaultKeystoreP12PathProd
      ) {
        // noinspection ExceptionCaughtLocallyJS
        throw Error(
          'Please update the keystoreP12Path property from the default in the Mastercard environment settings'
        );
      }
      if (config.consumerKey === defaultConsumerKey) {
        // noinspection ExceptionCaughtLocallyJS
        throw Error(
          'Please update the consumerKey property from the default in the Mastercard environment settings'
        );
      }

      context.request.setHeader('Authorization', signRequest(mcContext));
    } catch (err) {
      if (err.code === 'ENOENT') {
        err.message = `No P12 file found at location: ${err.path}`;
      }
      window.alert(err.message); // eslint-disable-line no-undef
      throw Error(err);
    }
  }
};

const defaultKeystoreP12PathSandbox = '/path/to/sandbox-signing-key.p12';
const defaultKeystoreP12PathProd = '/path/to/production-signing-key.p12';
const defaultConsumerKey = '000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000';
