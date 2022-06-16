const MastercardContext = require('../mastercard-context');
const clientEncryption = require('mastercard-client-encryption');
const fs = require('fs');

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

    const fle = new clientEncryption.FieldLevelEncryption(
      mcContext.encryptionConfig
    );
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
    const fle = new clientEncryption.FieldLevelEncryption(
      mcContext.encryptionConfig
    );

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
