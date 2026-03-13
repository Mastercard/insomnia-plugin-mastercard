const oauth1 = require('./oauth1/oauth1');
const oauth2 = require('./oauth2/oauth2');
const { extractKeysFromP12 } = require('./oauth2/keys');

module.exports.request = async (mcContext) => {
  if (!mcContext.isMastercardRequest() || mcContext.config.oAuthDisabled) {
    return;
  }
  const config = mcContext.config;

  if (config.oAuth2 && typeof config.oAuth2 === 'object') {
    return oauth2.request(mcContext);
  } else {
    return oauth1(mcContext);
  }
};

module.exports.extractKeysFromP12 = extractKeysFromP12;
