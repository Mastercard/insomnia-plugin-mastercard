const fs = require('fs');
const forge = require('node-forge');
const oauth = require('mastercard-oauth1-signer');
const URL = require('url');
const MastercardContext = require('../mastercard-context');
const { validateAuthConfig, getSigningKey } = require('./helpers');

function signRequest(mcContext) {
  const config = mcContext.config;
  const insomnia = mcContext.insomnia;

  return oauth.getAuthorizationHeader(
    URL.parse(mcContext.url),
    insomnia.request.getMethod(),
    mcContext.requestBody().text,
    config.consumerKey,
    getSigningKey
  );
}


module.exports = async (context) => {
  const mcContext = new MastercardContext(context);

  if (mcContext.isMastercardRequest()) {
    if(mcContext.isOAuth2Request()) {
      return
    }
    
    try {
      const config = mcContext.config;
      validateAuthConfig(config)

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
