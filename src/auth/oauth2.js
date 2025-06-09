const { OAuth2 } = require('oauth2-client');
const MastercardContext = require('../mastercard-context');

async function getAuthorizationHeaders(mcContext) {
  const insomnia = mcContext.insomnia;
  const config = mcContext.config;

  // config validation has been done by utils/validator.js already
  const oauth2Client = await OAuth2.clientCredentialsClient(config.oAuth2)
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
