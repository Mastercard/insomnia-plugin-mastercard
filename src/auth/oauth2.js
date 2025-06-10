const { OAuth2 } = require('oauth2-client');
const MastercardContext = require('../mastercard-context');
const { extractPrivateKeyFromP12 } = require('./helper');

async function getAuthorizationHeaders(mcContext) {
  const insomnia = mcContext.insomnia;
  const config = mcContext.config.oAuth2;

  // config validation has been done by utils/validator.js already
  const signingKey = extractPrivateKeyFromP12(config.keystoreP12Path, config.keyAlias, config.keystorePassword)
  const oauth2Client = await OAuth2.clientCredentialsClient({
      keyId: config.keyId,
			clientId: config.clientId,
			privateKey: signingKey,
			tokenUrl: config.tokenUrl,
      signingAlgorithm: config.signingAlgorithm
  })
  return oauth2Client.getAuthHeaders({
    url: mcContext.url,
    httpMethod: insomnia.request.getMethod()
  });
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
