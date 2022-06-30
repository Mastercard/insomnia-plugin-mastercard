const MastercardContext = require('../mastercard-context');
const fs = require('fs');
const utils = require('./utils');

module.exports.request = async (context) => {
  const mcContext = new MastercardContext(context);

  const body = mcContext.requestBody();

  if (
    mcContext.isMastercardRequest(context) &&
    body.text &&
    mcContext.isJsonRequest() &&
    mcContext.encryptionConfig
  ) {
    const headers = mcContext.requestHeader();

    const fle = utils.cryptoService(mcContext.encryptionConfig);

    if (utils.isJWE(mcContext.encryptionConfig)) {
      // Convert cert
      fle.crypto.encryptionCertificate = utils.pkcs8to1(mcContext.encryptionConfig.encryptionCertificate);
    }

    const encrypted = fle.encrypt(
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
};

module.exports.response = async (context) => {
  const mcContext = new MastercardContext(context);
  const body = mcContext.responseBody();

  if (
    mcContext.isMastercardRequest(context) &&
    body &&
    mcContext.isJsonResponse() &&
    mcContext.encryptionConfig
  ) {
    const fle = utils.cryptoService(mcContext.encryptionConfig);

    const response = JSON.parse(fs.readFileSync(body.path));
    const decryptedBody = fle.decrypt({
      body: response,
      header: mcContext.responseHeader(),
      request: {
        url: mcContext.url
      }
    });
    context.response.setBody(JSON.stringify(decryptedBody));
  }
};
