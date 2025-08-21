const { OAuth2 } = require('oauth2-client');
const MastercardContext = require('../mastercard-context');
const { extractPrivateKeyFromP12 } = require('./helper');
const { deepEqual } = require('fast-equals')


// scope the client at the module level so it can make use of the token cache.
let oAuth2Client;
let lastUsedConfig;

async function getAuthorizationHeaders(mcContext) {
  const insomnia = mcContext.insomnia;
  const config = mcContext.config.oAuth2;

  // re-instantiate the client if this is the first time or if the config has changed
  if(!oAuth2Client || hasConfigChanged(lastUsedConfig, config)) {
    // config validation has been done by utils/validator.js already
    lastUsedConfig = config;
    const signingKey = extractPrivateKeyFromP12(config.keystoreP12Path, config.keyAlias, config.keystorePassword)
    oAuth2Client = await OAuth2.clientCredentialsClient({
      keyId: config.keyId,
			clientId: config.clientId,
			privateKey: signingKey,
			tokenUrl: config.tokenUrl,
      signingAlgorithm: config.signingAlgorithm,
      tokenFetchTimeout: config.tokenFetchTimeout,
      tokenCache: config.tokenCache
  })
  }
  return oAuth2Client.getAuthHeaders({
    url: mcContext.url,
    httpMethod: insomnia.request.getMethod(),
    scope: config.scope
  });
}

function hasConfigChanged(oldConfig, newConfig) {
  return !deepEqual(oldConfig, newConfig);
}


module.exports = async (context) => {
  const mcContext = new MastercardContext(context);

  if (mcContext.isMastercardRequest() && mcContext.isOAuth2Request()) {
    try {
      const { Authorization, DPoP } = await getAuthorizationHeaders(mcContext)
      context.request.setHeader('Authorization', Authorization);
      context.request.setHeader('DPoP', DPoP);
    } catch (err) {
      if (err.code === 'ENOENT') {
        err.message = `No P12 file found at location: ${err.path}`;
      }
      window.alert(err.message); // eslint-disable-line no-undef
      throw Error(err);
    }
  }
};
