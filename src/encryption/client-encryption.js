const fs = require('fs');
const utils = require('./utils');
const { UserFeedback } = require('../utils/user-feedback');

module.exports.request = async (mcContext) => {
  try {

  const body = mcContext.requestBody();

  if (
    mcContext.isMastercardRequest() &&
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
        mcContext.insomnia.request.setHeader(name, value);
      }

      // replace body
      mcContext.insomnia.request.setBodyText(JSON.stringify(encrypted.body));
  }
} catch (e) {
    UserFeedback.logError("Error encrypting request", e);
    UserFeedback.showUnexpectedError(mcContext.insomnia, 'Error encrypting request', e);
  }
};

module.exports.response = async (mcContext) => {
  try {
  const body = mcContext.responseBody();

  if (
    mcContext.isMastercardRequest() &&
    body &&
    mcContext.isJsonResponse() &&
    mcContext.encryptionConfig
  ) {
    const cryptoService = utils.cryptoService(mcContext.encryptionConfig);

    const response = JSON.parse(fs.readFileSync(body.path));
      const decryptedBody = cryptoService.decrypt({
        body: response,
        header: mcContext.encryptionResponseHeader(),
        request: {
          url: mcContext.url
        }
      });
    mcContext.insomnia.response.setBody(JSON.stringify(decryptedBody));
  }
} catch(e) {
  UserFeedback.logError("Error decrypting response", e);
  UserFeedback.showUnexpectedError(mcContext.insomnia, "Error decrypting response", e);
}
};
