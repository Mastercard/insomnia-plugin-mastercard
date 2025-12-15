const MastercardContext = require('../mastercard-context');
const fs = require('fs');
const { jwsSign, jwsVerify } = require('./jws');
const { UserFeedback } = require('../utils/user-feedback');
const utils = require('./utils');

module.exports.request = async (context) => {
  try {
    const mcContext = new MastercardContext(context);
    const requestConfig = utils.getRequestConfig(mcContext.signatureConfig, mcContext.url);

       if (!requestConfig) {
      return
    }
    const body = mcContext.requestBody();
    const requestUrl = mcContext.commaDecodedUrl;
    const hasBody = body && body.text

    let payload;
    if (!hasBody) {
      const url = new URL(requestUrl);
      payload = url.pathname + url.search;
    } else {
      payload = body.text;
    }

    if (
      mcContext.isMastercardRequest(context) &&
      mcContext.signatureConfig &&
      payload &&
      requestConfig &&
      requestConfig.signatureGenerationEnabled
    ) {
      const privateKey = fs.readFileSync(mcContext.signatureConfig.signPrivateKey, 'utf8');
      const KID = mcContext.signatureConfig.signKeyId;
      const algo = mcContext.signatureConfig.signAlgorithm;
      const signAlgorithmConstraints = new Set(mcContext.signatureConfig.signAlgorithmConstraints);
      if(!signAlgorithmConstraints.has(algo)){
        throw Error('Unsupported Signature algorithm');
      }
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
    const requestConfig = utils.getRequestConfig(mcContext.signatureConfig, mcContext.url);
    if (!requestConfig) {
      return
    }
    const body = mcContext.responseBody();


    if (
      mcContext.isMastercardRequest(context) &&
      body &&
      mcContext.isJsonResponse() &&
      mcContext.signatureConfig &&
      requestConfig &&
      requestConfig.signatureVerificationEnabled
    ) {
      const jws = mcContext.getSignatureHeader();
      if (!jws || !body.path) {
        throw new Error('Invalid JWS header or response body');
      }
      const payload = JSON.parse(fs.readFileSync(body.path));
      const publicKey = fs.readFileSync(mcContext.signatureConfig.signVerificationCertificate, 'utf8');
      const signExpirationSeconds = mcContext.signatureConfig.signExpirationSeconds !== undefined
        ? mcContext.signatureConfig.signExpirationSeconds
        : 300;
      const signAlgorithmConstraints = mcContext.signatureConfig.signAlgorithmConstraints;

      const result = jwsVerify(jws, payload, publicKey, signExpirationSeconds, signAlgorithmConstraints);

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
