const MastercardContext = require('../mastercard-context');
const fs = require('fs');
const { jwsSign, jwsVerify } = require('./jws');
const { UserFeedback } = require('../utils/user-feedback');
const utils = require('./utils');

module.exports.request = async (context) => {
  try {
    const mcContext = new MastercardContext(context);
    const body = mcContext.requestBody();
    const requestPath = mcContext.commaDecodedUrl;

    let payload;
    if (mcContext.getRequestType() === 'GET') {
      // Use endpoint as payload for GET requests
      const url = new URL(requestPath, 'https://dummy'); // base needed for URL parsing
      payload = url.pathname + url.search;
    } else {
      // Use current logic for other methods (e.g., POST)
      payload = body.text ? body.text : undefined;
    }

      const fleConfig = utils.hasConfig(mcContext.signatureConfig, mcContext.url);

    if (
        mcContext.isMastercardRequest(context) &&
        mcContext.signatureConfig &&
        payload &&
        payload !== '' &&
        fleConfig?.signatureGenerationEnabled === 'true'
      ) {
      const privateKey = fs.readFileSync(mcContext.signatureConfig.signPrivateKey, 'utf8');
      const KID = mcContext.signatureConfig.signKeyId;
      const algo = mcContext.signatureConfig.signAlgorithm;
      const jws = jwsSign(payload, KID, privateKey, algo);
      await context.request.setHeader('x-jws-signature', jws);
    }
  } catch (e) {
    UserFeedback.logError('Error signing request', e);
    UserFeedback.showUnexpectedError(context, 'Error signing request', e);
  }
};


module.exports.response = async (context) => {
  try {
    const mcContext = new MastercardContext(context);
    const body = mcContext.responseBody();
    const fleConfig = utils.hasConfig(mcContext.signatureConfig, mcContext.url);

    if (
       mcContext.isMastercardRequest(context) &&
       body &&
       mcContext.isJsonResponse() &&
       mcContext.signatureConfig &&
       fleConfig?.signatureVerificationEnabled === 'true'
      ) {
      const jws = mcContext.getSignatureHeader();
      const payload = JSON.parse(fs.readFileSync(body.path));
      const publicKey = fs.readFileSync(mcContext.signatureConfig.signVerificationCertificate, 'utf8');
      const algo = mcContext.signatureConfig.signAlgorithm;
      const result = jwsVerify(jws, payload, publicKey, algo);

      if (result) {
        console.log('Signature verification successful');
      } else {
        throw new Error('JWS signature verification failed');
      }
    }
  } catch (e) {
    UserFeedback.logError('response signature verification', e);
    UserFeedback.showUnexpectedError(context, 'response signature verification', e);
  }
};
