const Joi = require("joi");
const { UserFeedback } = require("./user-feedback");
const fs = require("fs");

const commonEncryptionSchema = Joi.object({
  paths: Joi.array().items(
    Joi.object({
      path: Joi.string(),
      toEncrypt: Joi.array().items(
        Joi.object({
          element: Joi.string(),
          obj: Joi.string(),
        }).unknown(false)
      ),
      toDecrypt: Joi.array().items(
        Joi.object({
          element: Joi.string(),
          obj: Joi.string(),
        }).unknown(false)
      ),
    }).unknown(false)
  ),
  mode: Joi.string().valid("JWE"),
  encryptionCertificate: Joi.string(),
  encryptedValueFieldName: Joi.string(),
  publicKeyFingerprint: Joi.string(),
  publicKeyFingerprintType: Joi.string().valid("certificate", "publicKey"),
  dataEncoding: Joi.string().valid("base64", "hex"),
  privateKey: Joi.string(),
  keyStore: Joi.string(),
  keyStoreAlias: Joi.string(),
  keyStorePassword: Joi.string(),
})
  .without("privateKey", "keyStore") // if privateKey is present, keyStore shouldn't be
  .without("publicKeyFingerprint", "publicKeyFingerprintType") // if publicKeyFingerprint is present, publicKeyFingerprintType shouldn't be
  .with("keyStoreAlias", "keyStorePassword") // both should be present together. never alone
  .with("keyStorePassword", "keyStoreAlias"); // both should be present together. never alone

const mastercardEncryptionSpecificSchema = Joi.object({
  publicKeyFingerprintFieldName: Joi.string(),
  oaepHashingAlgorithmFieldName: Joi.string(),
  oaepPaddingDigestAlgorithm: Joi.string(),
  ivFieldName: Joi.string(),
  encryptedKeyFieldName: Joi.string(),
  ivHeaderName: Joi.string(),
  encryptedKeyHeaderName: Joi.string(),
  oaepHashingAlgorithmHeaderName: Joi.string(),
  publicKeyFingerprintHeaderName: Joi.string(),
  useCertificateContent: Joi.boolean(),
});

const validOAuth2SigningAlgorithms = Joi.string().valid('RS256', 'PS256');

const oAuth2Schema = Joi.object({
  keyId: Joi.string().optional(),
  clientId: Joi.string().required(),
  keystoreP12Path: Joi.string().required(),
  keyAlias: Joi.string().required(),
  keystorePassword: Joi.string().required(),
  /** either "signingAlgorithm": "RS256" or "signingAlgorithm": { "clientAssertionAlg": "RS256",  "dPopAlg": "RS256"}  */
  signingAlgorithm: Joi.alternatives().try( validOAuth2SigningAlgorithms, Joi.object({
    clientAssertion: validOAuth2SigningAlgorithms,
    dPop: validOAuth2SigningAlgorithms,
  })).optional(),
  tokenUrl: Joi.string().optional(),
  tokenFetchTimeout: Joi.number().optional(),
  tokenCache: Joi.object({
    enabled: Joi.boolean().optional(),
    tokenCacheExpiryBuffer: Joi.number().optional()
  }).optional()
}).required().unknown(false)
.with("keyStoreAlias", "keyStorePassword") // both should be present together. never alone
.with("keyStorePassword", "keyStoreAlias"); // both should be present together. never alone;

const warningsConfig = [
  {
    type: "object.unknown",
    buildMessage: (context) => `Found unknown config: ${(context && context.label) || "unknown"}. Will be ignored`,
  },
  {
    type: "object.without",
    buildMessage: (context) => {
      const field1 = (context && context.mainWithLabel) || "unknown";
      const field2 = (context && context.peerWithLabel) || "unknown";
      return `${field1} and ${field2} were specified together, only one of them should be`;
    },
  },
  {
    type: "object.with",
    buildMessage: (context) => {
      const field1 = (context && context.mainWithLabel) || "unknown";
      const field2 = (context && context.peerWithLabel) || "unknown";
      return `${field1} and ${field2} should be specified together, only one of them was found`;
    },
  },
];

function getConfigSchema(encryptionMode, isOAuth2) {
  const encryptionSchema =
    encryptionMode !== "JWE"
      ? commonEncryptionSchema.concat(mastercardEncryptionSpecificSchema)
      : commonEncryptionSchema;
  encryptionSchema.unknown(false);

  if(isOAuth2) {
    return Joi.object({
      oAuth2: oAuth2Schema,
      appliesTo: Joi.array().items(Joi.string()),
      encryptionConfig: encryptionSchema,
    }).unknown(false)
  }

  // oauth1
  return Joi.object({
    consumerKey: Joi.string(),
    keyAlias: Joi.string(),
    keystoreP12Path: Joi.string(),
    keystorePassword: Joi.string(),
    appliesTo: Joi.array().items(Joi.string()),
    encryptionConfig: encryptionSchema,
  }).unknown(false);
}

module.exports.configValidator = (context) => {
  const config = context.request.getEnvironmentVariable("mastercard");
  if (!config || Array.isArray(config) || typeof config !== "object") {
    // eslint-disable-next-line no-console
    console.log("No mastercard config object found. Skipping validation.");
    return;
  }

  const isOAuth2 = config.oAuth2 != null;

  const { encryptionCertificate, privateKey, keyStore } = config.encryptionConfig || {};
  const missingFiles = Object.entries({
    ...(isOAuth2 ? {"config.oAuth2.keystoreP12Path" : config.oAuth2.keystoreP12Path} : {keystoreP12Path: config.keystoreP12Path}),
    encryptionCertificate,
    privateKey,
    keyStore,
  }).filter(([, path]) => path != null && !fs.existsSync(path)); // eslint-disable-line eqeqeq

  const schema = getConfigSchema(config && config.encryptionConfig && config.encryptionConfig.mode, isOAuth2);
  const result = schema.validate(config, { abortEarly: false });

  const errorDetails = (result.error && result.error.details) || [];

  const warningTypes = warningsConfig.map((w) => w.type);
  const errors = errorDetails
    .filter((e) => !warningTypes.includes(e.type))
    .map((e) => ({ field: e.context && e.context.label, message: e.message }));

  const warnings = warningsConfig.flatMap((c) =>
    errorDetails
      .filter((e) => e.type === c.type)
      .map((e) => ({ field: e.context && e.context.label, message: c.buildMessage(e.context) }))
  );

  warnings.forEach((w) => UserFeedback.logWarning(w.message));
  errors.forEach((e) => UserFeedback.logError(e.message));

  if (errors.length || missingFiles.length) {
    UserFeedback.showValidationErrors(context, "Errors/Warnings found in Mastercard config:", {
      errors,
      missingFiles,
      warnings,
    });
    throw new Error("invalid config");
  }
};
