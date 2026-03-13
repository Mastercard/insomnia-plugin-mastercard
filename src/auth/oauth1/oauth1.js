const fs = require('fs');
const forge = require('node-forge');
const oauth = require('mastercard-oauth1-signer');
const URL = require('url');

function signRequest(mcContext, authConfig) {
  const insomnia = mcContext.insomnia;
  const p12Content = fs.readFileSync(authConfig.keystoreP12Path, 'binary');
  const p12Asn1 = forge.asn1.fromDer(p12Content, false);
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    p12Asn1,
    false,
    authConfig.keystorePassword
  );

  const keyObj = p12.getBags({
    friendlyName: authConfig.keyAlias,
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag
  }).friendlyName[0];

  const signingKey = forge.pki.privateKeyToPem(keyObj.key);

  return oauth.getAuthorizationHeader(
    URL.parse(mcContext.url),
    insomnia.request.getMethod(),
    mcContext.requestBody().text,
    authConfig.consumerKey,
    signingKey
  );
}


module.exports = async (mcContext) => {
  const config = mcContext.config;
  const authConfig = config.oAuth1 || config;
  try {
    if (
      authConfig.keystoreP12Path === defaultKeystoreP12PathSandbox ||
      authConfig.keystoreP12Path === defaultKeystoreP12PathProd
    ) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(
        'Please update the keystoreP12Path property from the default in the Mastercard environment settings'
      );
    }
    if (authConfig.consumerKey === defaultConsumerKey) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(
        'Please update the consumerKey property from the default in the Mastercard environment settings'
      );
    }

    mcContext.insomnia.request.setHeader('Authorization', signRequest(mcContext, authConfig));
  } catch (err) {
    if (err.code === 'ENOENT') {
      err.message = `No P12 file found at location: ${err.path}`;
    }
    window.alert(err.message); // eslint-disable-line no-undef
    throw new Error(err);
  }
};

const defaultKeystoreP12PathSandbox = '/path/to/sandbox-signing-key.p12';
const defaultKeystoreP12PathProd = '/path/to/production-signing-key.p12';
const defaultConsumerKey = '000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000';
