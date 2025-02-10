const MastercardContext = require('../mastercard-context');
const fs = require('fs');
const utils = require('./utils');
const { UserFeedback } = require('../utils/user-feedback');

module.exports.request = async (context) => {
  try {
  const mcContext = new MastercardContext(context);

  const body = mcContext.requestBody();

  if (
    mcContext.isMastercardRequest(context) &&
    body.text &&
    mcContext.isJsonRequest() &&
    mcContext.encryptionConfig
  ) {
    const headers = mcContext.requestHeader();

    const cryptoService = utils.cryptoService(mcContext.encryptionConfig);

    if (utils.isJWE(mcContext.encryptionConfig)) {
      // Convert cert
      cryptoService.crypto.encryptionCertificate = utils.pkcs8to1(mcContext.encryptionConfig.encryptionCertificate);
    }
      const encrypted = cryptoService.encrypt(
        mcContext.url,
        headers,
        JSON.parse(body.text)
      );

      // override header
      for (const [name, value] of Object.entries(encrypted.header)) {
        context.request.setHeader(name, value);
      }

      // replace body
      context.request.setBodyText(JSON.stringify(encrypted.body));
  }
} catch (e) {;
    UserFeedback.logError("Error encrypting request", e);
    UserFeedback.showUnexpectedError(context, 'Error encrypting request', e);
  }
};

module.exports.response = async (context) => {
  try {
  const mcContext = new MastercardContext(context);
  const body = mcContext.responseBody();

  if (
    mcContext.isMastercardRequest(context) &&
    body &&
    mcContext.isJsonResponse() &&
    mcContext.encryptionConfig
  ) {
    const cryptoService = utils.cryptoService(mcContext.encryptionConfig);

    const response = JSON.parse(fs.readFileSync(body.path));
      const decryptedBody = cryptoService.decrypt({
        body: response,
        header: mcContext.responseHeader(),
        request: {
          url: mcContext.url
        }
      });
      context.response.setBody(JSON.stringify(decryptedBody));
  }
} catch(e) {
  UserFeedback.logError("Error decrypting response", e);
  UserFeedback.showUnexpectedError(context, "Error decrypting response", e);
}
};
