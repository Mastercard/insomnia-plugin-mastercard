const { OAuth2 } = require('oauth2-client');
const MastercardContext = require('../mastercard-context');
const { validateAuthConfig, getSigningKey } = require('./helpers');

async function getAuthorizationHeaders(mcContext) {
  const insomnia = mcContext.insomnia;
  const config = mcContext.config;
  const signingKey = getSigningKey(config);

  const oauth2Client = await OAuth2.clientCredentialsClient({
    clientId: config.consumerKey,
    privateKey: signingKey,
    tokenUrl: "http://localhost:3000/oidc/token"
  })

  return oauth2Client.getAuthHeaders({
    url: mcContext.url,
    httpMethod: insomnia.request.getMethod()
  });
}


module.exports = async (context) => {
  const mcContext = new MastercardContext(context);

  if (mcContext.isMastercardRequest()) {
    const config = mcContext.config;
    if(config.authMode !== 'oauth2') {
      return
    }
    
    try {
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
