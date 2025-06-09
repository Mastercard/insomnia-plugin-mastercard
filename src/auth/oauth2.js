const { OAuth2 } = require('oauth2-client');
const MastercardContext = require('../mastercard-context');
const { validateAuthConfig, getSigningKey } = require('./helpers');

async function getAuthorizationHeaders(mcContext) {
  const insomnia = mcContext.insomnia;
  const config = mcContext.config;
  const signingKey = getSigningKey(config);

  const tokenUrl = (config.oauth2 || {}).tokenUrl

  const oauth2Client = await OAuth2.clientCredentialsClient({
    clientId: config.consumerKey,
    privateKey: signingKey,
    tokenUrl
  })

  return oauth2Client.getAuthHeaders({
    url: mcContext.url,
    httpMethod: insomnia.request.getMethod()
  });
}


module.exports = async (context) => {
  const mcContext = new MastercardContext(context);

  if (mcContext.isMastercardRequest()) {
    if(!mcContext.isOAuth2Request()) {
      return
    }
    
    try {
      const config = mcContext.config;
      validateAuthConfig(config)

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
