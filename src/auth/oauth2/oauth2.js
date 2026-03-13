const { extractKeysFromP12 } = require('./keys');
const {
  OAuth2ClientBuilder,
  FetchHttpAdapter,
  StaticDPoPKeyProvider,
  StaticScopeResolver
} = require('@mastercard/oauth2-client-js');

async function getOAuth2Headers(mcContext) {
  const config = mcContext.config.oAuth2;
  const insomnia = mcContext.insomnia;

  const { privateKey, publicKey } = await extractKeysFromP12(
    config.keystoreP12Path,
    config.keyAlias,
    config.keystorePassword
  );

  const scopes = config.scopes;

  const oauth2Client = new OAuth2ClientBuilder()
    .clientId(config.clientId)
    .kid(config.kid)
    .clientKey(privateKey)
    .httpAdapter(new FetchHttpAdapter())
    .tokenEndpoint(config.tokenEndpoint)
    .issuer(config.issuer)
    .dPoPKeyProvider(new StaticDPoPKeyProvider(privateKey, publicKey))
    .clockSkewTolerance(60)
    .scopeResolver(new StaticScopeResolver(scopes))
    .build();

  const method = insomnia.request.getMethod();
  const url = mcContext.url;

  const headers = await oauth2Client.getOAuth2Headers(method, url);

  return { headers, oauth2Client };
}

module.exports.request = async (mcContext) => {
  try {
    const { headers } = await getOAuth2Headers(mcContext);

    Object.entries(headers).forEach(([name, value]) => {
      mcContext.insomnia.request.setHeader(name, value);
    });
  } catch (err) {
    window.alert(err.message); // eslint-disable-line no-undef
    throw new Error(err);
  }
};
