const fs = require('fs');
const forge = require('node-forge');
const oauth = require('mastercard-oauth1-signer');
const URL = require('url');
const MastercardContext = require('../mastercard-context');
const { extractPrivateKeyFromP12 } = require('./helper');

function signRequest(mcContext) {
  const config = mcContext.config;
  const insomnia = mcContext.insomnia;
  
  const signingKey = extractPrivateKeyFromP12(config.keystoreP12Path, config.keyAlias, config.keystorePassword)

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
