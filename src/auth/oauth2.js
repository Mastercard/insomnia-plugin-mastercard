const { OAuth2 } = require('oauth2-client');
const MastercardContext = require('../mastercard-context');
const { extractPrivateKeyFromP12 } = require('./helper');
const { deepEqual } = require('fast-equals')
const { stat } = require('fs/promises')


// scope the client at the module level so it can make use of the token cache.
let oAuth2Client;
let lastUsedConfig;
let lastUsedP12FileModifiedTime;

async function getAuthorizationHeaders(mcContext, dPopNonce = null) {
  const insomnia = mcContext.insomnia;
  const config = mcContext.config.oAuth2;

  // re-instantiate the client if this is the first time or if the config has changed
  if(!oAuth2Client || await hasConfigChanged(lastUsedConfig, config, lastUsedP12FileModifiedTime)) {
    // config validation has been done by utils/validator.js already
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

  lastUsedConfig = config;
  lastUsedP12FileModifiedTime = await getFileModifiedTime(config.keystoreP12Path)
  }
  return oAuth2Client.getAuthHeaders({
    url: mcContext.url,
    httpMethod: insomnia.request.getMethod(),
    scope: config.scope,
    resourceServerDPopNonce: dPopNonce
  });
}

async function hasConfigChanged(oldConfig, newConfig, lastP12FileModifiedTime) {
  // config has definitely changed
  if(!deepEqual(oldConfig, newConfig)) {
    true
  }

  // the config itself hasn't changed, so check if the file has been replaced.
  return lastP12FileModifiedTime !== await getFileModifiedTime(newConfig.keystoreP12Path)
}

async function getFileModifiedTime(filePath) {
  try {
    const stats = await stat(filePath)
    return stats.mtimeMs
  } catch(e) {
    console.error('error fetching file stat')
  }

  // unabel to determine modified time, so return an invalid value
  return -1;
}

const fetchNonce = async (context, mcContext) => {

  const { Authorization, DPoP } = await getAuthorizationHeaders(mcContext)
  
  const headers = context.request.getHeaders();
  const headersForFetch = {};
  for(const header of headers) {
    headersForFetch[header.name] = header.value
  }

  Object.assign(headersForFetch, { Authorization, DPoP })

  const response = await fetch(context.request.getUrl(),{
    method: context.request.getMethod(),
    headers: headersForFetch,
    body: JSON.parse(context.request.getBody()?.text) || null
  })

  if(
    ![400/* remove 400 once the resource server bug is fixed */, 401].includes(response.status) ||
    !response.headers.get('www-authenticate')?.includes('use_dpop_nonce') ||
    !response.headers.get('dpop-nonce')
  ) {

    let errorMsg = ''
    try {
      errorMsg = await response.json()
    } catch(e) {
      errorMsg = e?.message ?? "Unknown error"
    }

    throw new Error('Expected dpop nonce, but did not receive it. Error ' + errorMsg)
  }

  return response.headers.get('dpop-nonce')
}


module.exports.request = async (context) => {
  const mcContext = new MastercardContext(context);

  if (mcContext.isMastercardRequest() && mcContext.isOAuth2Request()) {
    try {
      
      const dpopNonce = await fetchNonce(context, mcContext);

      const { Authorization, DPoP } = await getAuthorizationHeaders(mcContext, dpopNonce)
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
