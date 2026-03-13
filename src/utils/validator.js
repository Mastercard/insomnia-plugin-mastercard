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


const commonSignatureSchema = Joi.object({
  paths: Joi.array().items(
    Joi.object({
      path: Joi.string().required(),
      signatureGenerationEnabled: Joi.boolean().default(false),
      signatureVerificationEnabled: Joi.boolean().default(false),
    }).unknown(false)
  ).required(),
  signPrivateKey: Joi.string().required(),
  signKeyId: Joi.string().required(),
  signVerificationCertificate: Joi.string().required(),
  signAlgorithm: Joi.string().required(),
  signExpirationSeconds: Joi.number(),
  signAlgorithmConstraints: Joi.array().items(Joi.string()).unique().required(),
}).with("signPrivateKey", "signKeyId"); // if privateKey is present, keyId should be

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

const oAuth1Schema = Joi.object({
  consumerKey: Joi.string(),
  keyAlias: Joi.string(),
  keystoreP12Path: Joi.string(),
  keystorePassword: Joi.string(),
}).unknown(false);

const oAuth2Schema = Joi.object({
  clientId: Joi.string(),
  kid: Joi.string(),
  keystoreP12Path: Joi.string(),
  keyAlias: Joi.string(),
  keystorePassword: Joi.string(),
  tokenEndpoint: Joi.string(),
  issuer: Joi.string(),
  scopes: Joi.array().items(Joi.string()),
}).unknown(false);

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

function getConfigSchema(encryptionMode, authMode) {
  const encryptionSchema =
    encryptionMode !== "JWE"
      ? commonEncryptionSchema.concat(mastercardEncryptionSpecificSchema)
      : commonEncryptionSchema;
  encryptionSchema.unknown(false);

  const sharedAuthConfig = {
    oAuthDisabled: Joi.boolean().default(false),
    appliesTo: Joi.array().items(Joi.string()),
    encryptionConfig: encryptionSchema,
    extensions: Joi.object({
      signatureConfig: commonSignatureSchema.unknown(false),
    }).unknown(false),
  };

  const legacyFields = {
    consumerKey: Joi.any(),
    keyAlias: Joi.any(),
    keystoreP12Path: Joi.any(),
    keystorePassword: Joi.any(),
  };

  if (authMode === "oAuth2") {
    return Joi.object({
      oAuth2: oAuth2Schema,
      ...legacyFields,
      ...sharedAuthConfig,
    }).unknown(false);
  }

  if (authMode === "oAuth1") {
    return Joi.object({
      oAuth1: oAuth1Schema,
      ...legacyFields,
      ...sharedAuthConfig,
    }).unknown(false);
  }

  return Joi.object({
    consumerKey: Joi.string(),
    keyAlias: Joi.string(),
    keystoreP12Path: Joi.string(),
    keystorePassword: Joi.string(),
    ...sharedAuthConfig,
  }).unknown(false);
}

module.exports.configValidator = (mcContext) => {
  const config = mcContext.config;
  if (!config || Array.isArray(config) || typeof config !== "object") {
    // eslint-disable-next-line no-console
    console.log("No mastercard config object found. Skipping validation.");
    return;
  }

  const hasOAuth1 = config.oAuth1 !== undefined;
  const hasOAuth2 = config.oAuth2 !== undefined;

  const authMode = hasOAuth2 ? "oAuth2" : hasOAuth1 ? "oAuth1" : "legacy";

  if (hasOAuth1 && hasOAuth2) {
    UserFeedback.logError("oAuth1 and oAuth2 cannot be used together");
    UserFeedback.showValidationErrors(mcContext.insomnia, "Errors/Warnings found in Mastercard config:", {
      errors: [{ field: "mastercard", message: "Remove either oAuth1 or oAuth2 — only one can be configured at a time." }],
      missingFiles: [],
      warnings: [],
    });
    throw new Error("invalid config");
  }

  const keystoreP12Path =
    authMode === "oAuth2"
      ? undefined
      : authMode === "oAuth1"
      ? config.oAuth1 && config.oAuth1.keystoreP12Path
      : config.keystoreP12Path;

  const { encryptionCertificate, privateKey, keyStore } = config.encryptionConfig || {};
  const { signPrivateKey, signVerificationCertificate } = (config.extensions && config.extensions.signatureConfig) || {};

  const missingFiles = Object.entries({
    keystoreP12Path,
    encryptionCertificate,
    privateKey,
    keyStore,
    signPrivateKey,
    signVerificationCertificate,
  }).filter(([, path]) => path != null && !fs.existsSync(path)); // eslint-disable-line eqeqeq

  const schema = getConfigSchema(config && config.encryptionConfig && config.encryptionConfig.mode, authMode);
  const result = schema.validate(config, { abortEarly: false });

  const errorDetails = (result.error && result.error.details) || [];

  const warningTypes = warningsConfig.map((w) => w.type);
  const errors = [
    ...errorDetails
      .filter((e) => !warningTypes.includes(e.type))
      .map((e) => ({ field: e.context && e.context.label, message: e.message })),
  ];

  const warnings = warningsConfig.flatMap((c) =>
    errorDetails
      .filter((e) => e.type === c.type)
      .map((e) => ({ field: e.context && e.context.label, message: c.buildMessage(e.context) }))
  );

  warnings.forEach((w) => UserFeedback.logWarning(w.message));
  errors.forEach((e) => UserFeedback.logError(e.message));

  if (errors.length || missingFiles.length) {
    UserFeedback.showValidationErrors(mcContext.insomnia, "Errors/Warnings found in Mastercard config:", {
      errors,
      missingFiles,
      warnings,
    });
    throw new Error("invalid config");
  }
};
