const sinon = require("sinon");
const { configValidator } = require("../../src/utils/validator");
const { expect } = require("chai");
const { UserFeedback } = require("../../src/utils/user-feedback");
const path = require("path");
const { JSDOM } = require("jsdom");

describe(`${configValidator.name}()`, () => {
  const validCert = path.resolve("test", "__res__", "test_certificate.cert");
  const originalDocument = global.document;
  before(() => {
    global.document = new JSDOM("<!DOCTYPE html><html><body></body></html>").window.document;
  });

  after(() => {
    global.document = originalDocument;
  });

  let sandbox;

  let consoleErrorStub, consoleWarnStub;
  let showValidationErrorsStub, logWarningStub, logErrorStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();

    consoleErrorStub = sandbox.stub(console, "error");
    consoleWarnStub = sandbox.stub(console, "warn");
    showValidationErrorsStub = sandbox.stub(UserFeedback, "showValidationErrors");

    logWarningStub = sandbox.stub(UserFeedback, "logWarning");
    logErrorStub = sandbox.stub(UserFeedback, "logError");
  });

  afterEach(() => {
    sandbox.restore();
  });

  const mockContext = (mastercardConfig) => ({
    request: {
      getEnvironmentVariable: () => mastercardConfig,
    },
    app: {
      dialog: () => {},
    },
  });

  it("does nothing if mastercard config object does not exist", () => {
    [undefined, null, "", 10, true, []].forEach((nonExistentConfig) => {
      const context = mockContext(nonExistentConfig);
      expect(() => configValidator(context)).not.to.throw();
      expect(consoleErrorStub.called).to.be.false;
      expect(consoleWarnStub.called).to.be.false;
    });
  });

  [
    [null, null, null, null],
    [10, 10, 10, 10],
    [true, true, true, "invalid-boolean"],
    [{ key: "val" }, "a-string", { key: "val" }, { key: "val" }],
    [["anArray"], ["anArray"], "a-string", ["anArray"]],
  ].forEach(([invalidString, invalidObject, invalidArray, invalidBoolean]) => {
    it("should produce error for invalid config fields", () => {
      const context = mockContext({
        consumerKey: invalidString,
        keyAlias: invalidString,
        keystoreP12Path: invalidString,
        keystorePassword: invalidString,
        appliesTo: invalidArray,
        encryptionConfig: {
          paths: [
            {
              path: invalidString,
              toEncrypt: [
                {
                  element: invalidString,
                  obj: invalidString,
                },
                invalidObject,
              ],
              toDecrypt: [
                {
                  element: invalidString,
                  obj: invalidString,
                },
                invalidObject,
              ],
            },
            {
              path: invalidString,
              toEncrypt: invalidArray,
              toDecrypt: invalidArray,
            },
            invalidObject,
          ],
          mode: invalidString,
          encryptionCertificate: invalidString,
          encryptedValueFieldName: invalidString,
          publicKeyFingerprint: invalidString,
          publicKeyFingerprintType: invalidString,
          dataEncoding: invalidString,
          privateKey: invalidString,
          keyStore: invalidString,
          keyStoreAlias: invalidString,
          keyStorePassword: invalidString,

          // mastercard encryption fields
          publicKeyFingerprintFieldName: invalidString,
          oaepHashingAlgorithmFieldName: invalidString,
          oaepPaddingDigestAlgorithm: invalidString,
          ivFieldName: invalidString,
          encryptedKeyFieldName: invalidString,
          ivHeaderName: invalidString,
          encryptedKeyHeaderName: invalidString,
          oaepHashingAlgorithmHeaderName: invalidString,
          publicKeyFingerprintHeaderName: invalidString,
          useCertificateContent: invalidBoolean,
        },
      });

      expect(() => configValidator(context)).to.throw("invalid config");
      expect(showValidationErrorsStub.calledOnce).to.be.true;

      const [, , { errors }] = showValidationErrorsStub.firstCall.args;
      const verify = (fields, message) => {
        fields.forEach((field) => {
          const error = errors.find((e) => e.field === field && e.message.includes(message));
          expect(error).not.to.be.undefined;
        });
      };

      expect(errors.length).to.equal(39);
      verify(
        [
          "consumerKey",
          "keyAlias",
          "keystoreP12Path",
          "keystorePassword",
          "encryptionConfig.paths[0].path",
          "encryptionConfig.paths[0].toEncrypt[0].element",
          "encryptionConfig.paths[0].toEncrypt[0].obj",
          "encryptionConfig.paths[0].toDecrypt[0].element",
          "encryptionConfig.paths[0].toDecrypt[0].obj",
          "encryptionConfig.paths[1].path",
          "encryptionConfig.mode",
          "encryptionConfig.mode",
          "encryptionConfig.encryptionCertificate",
          "encryptionConfig.encryptedValueFieldName",
          "encryptionConfig.publicKeyFingerprint",
          "encryptionConfig.publicKeyFingerprintType",
          "encryptionConfig.publicKeyFingerprintType",
          "encryptionConfig.dataEncoding",
          "encryptionConfig.dataEncoding",
          "encryptionConfig.privateKey",
          "encryptionConfig.keyStore",
          "encryptionConfig.keyStoreAlias",
          "encryptionConfig.keyStorePassword",
          "encryptionConfig.publicKeyFingerprintFieldName",
          "encryptionConfig.oaepHashingAlgorithmFieldName",
          "encryptionConfig.oaepPaddingDigestAlgorithm",
          "encryptionConfig.ivFieldName",
          "encryptionConfig.encryptedKeyFieldName",
          "encryptionConfig.ivHeaderName",
          "encryptionConfig.encryptedKeyHeaderName",
          "encryptionConfig.oaepHashingAlgorithmHeaderName",
          "encryptionConfig.publicKeyFingerprintHeaderName",
        ],
        "must be a string"
      );

      verify(
        ["appliesTo", "encryptionConfig.paths[1].toEncrypt", "encryptionConfig.paths[1].toDecrypt"],
        "must be an array"
      );

      verify(
        [
          "encryptionConfig.paths[0].toEncrypt[1]",
          "encryptionConfig.paths[0].toDecrypt[1]",
          "encryptionConfig.paths[2]",
        ],
        "must be of type object"
      );

      verify(["encryptionConfig.useCertificateContent"], "must be a boolean");
    });
  });

  [
    ["valid-value", null, 0, 0, 0], // valid config
    [null, null, 0, 1, 1], // error only
    ["valid-value", "extra-val", 1, 0, 0], // warning only
    [null, "extra-val", 1, 1, 1], // error & warning
  ].forEach(([consumerKey, extraneousField, expectedWarnings, expectedErrors, dialogCount]) => {
    it("logs warnings, errors and shows error dialog as expected", () => {
      const context = mockContext({ consumerKey, ...(extraneousField && { extraneousField }) });

      try {
        configValidator(context);
      } catch (e) {
        // expected, ignore it
      }

      expect(logWarningStub.callCount).to.equal(expectedWarnings);
      expect(logErrorStub.callCount).to.equal(expectedErrors);
      expect(showValidationErrorsStub.callCount).to.equal(dialogCount);
    });
  });

  [
    ["invalidPath", , , , 1, ["keystoreP12Path"]],
    [, "invalidPath", , , 1, ["encryptionCertificate"]],
    [, , "invalidPath", , 1, ["privateKey"]],
    [, , , "invalidPath", 1, ["keyStore"]],
    ["invalidPath", "invalidPath", , , 2, ["keystoreP12Path", "encryptionCertificate"]],
  ].forEach(([keystoreP12Path, encryptionCertificate, privateKey, keyStore, expectedMissingFiles, expectedKeys]) => {
    it("should produce error when a file path is invalid", () => {
      const context = mockContext({
        keystoreP12Path,
        encryptionConfig: {
          encryptionCertificate,
          privateKey,
          keyStore,
        },
      });

      try {
        configValidator(context);
      } catch (e) {
        // expected
      }
      const [, , { missingFiles }] = showValidationErrorsStub.firstCall.args;
      expect(missingFiles.length).to.equal(expectedMissingFiles);
      expect(missingFiles.map((f) => f[0])).to.deep.equal(expectedKeys);
    });
  });

  [
    [validCert, , ,],
    [, validCert, ,],
    [, , validCert],
    [, , , validCert],
  ].forEach(([keystoreP12Path, encryptionCertificate, privateKey, keyStore]) => {
    it("should not produce error when file paths are valid", () => {
      const context = mockContext({
        keystoreP12Path,
        encryptionConfig: {
          encryptionCertificate,
          privateKey,
          keyStore,
        },
      });

      configValidator(context);
      expect(showValidationErrorsStub.called).to.be.false;
    });
  });

  [
    ["a-private-key", "a-key-store", , , "privateKey and keyStore were specified together, only one of them should be"],
    [
      ,
      ,
      "the-public-key-fingerprint",
      "certificate",
      "publicKeyFingerprint and publicKeyFingerprintType were specified together, only one of them should be",
    ],
  ].forEach(([privateKey, keyStore, publicKeyFingerprint, publicKeyFingerprintType, expectedMessage]) =>
    it("should produce warning when mutually exclusive fields are used together", () => {
      const context = mockContext({
        consumerKey: null,
        encryptionConfig: {
          privateKey,
          keyStore,
          publicKeyFingerprint,
          publicKeyFingerprintType,
        },
      });

      expect(() => configValidator(context)).to.throw("invalid config");
      expect(showValidationErrorsStub.calledOnce).to.be.true;
      expect(logWarningStub.calledOnce).to.be.true;

      const [, , { warnings }] = showValidationErrorsStub.firstCall.args;

      expect(logWarningStub.calledWith(expectedMessage)).to.be.true;
      expect(warnings).to.have.length(1);
      expect(warnings[0].field).to.equal("encryptionConfig");
      expect(warnings[0].message).to.include(expectedMessage);
    })
  );

  [
    [
      "an-alias",
      undefined,
      "keyStoreAlias and keyStorePassword should be specified together, only one of them was found",
    ],
    [
      undefined,
      "a-password",
      "keyStorePassword and keyStoreAlias should be specified together, only one of them was found",
    ],
  ].forEach(([keyStoreAlias, keyStorePassword, expectedMessage]) =>
    it("should produce warning if keyStoreAlias is specified and keyStorePassword is not or vice versa", () => {
      const context = mockContext({
        consumerKey: null,
        encryptionConfig: { keyStoreAlias, keyStorePassword },
      });

      expect(() => configValidator(context)).to.throw("invalid config");
      expect(showValidationErrorsStub.calledOnce).to.be.true;
      expect(logWarningStub.calledOnce).to.be.true;

      const [, , { warnings }] = showValidationErrorsStub.firstCall.args;

      expect(logWarningStub.calledWith(expectedMessage)).to.be.true;
      expect(warnings).to.have.length(1);
      expect(warnings[0].field).to.equal("encryptionConfig");
      expect(warnings[0].message).to.include(expectedMessage);
    })
  );

  it("when mode === JWE, should mark mastercard encryption config fields as extraneous", () => {
    const mastercardEncryptionConfig = {
      publicKeyFingerprintFieldName: "val",
      oaepHashingAlgorithmFieldName: "val",
      oaepPaddingDigestAlgorithm: "val",
      ivFieldName: "val",
      encryptedKeyFieldName: "val",
      ivHeaderName: "val",
      encryptedKeyHeaderName: "val",
      oaepHashingAlgorithmHeaderName: "val",
      publicKeyFingerprintHeaderName: "val",
      useCertificateContent: false,
    };
    const context = mockContext({
      consumerKey: null,
      encryptionConfig: {
        mode: "JWE",
        ...mastercardEncryptionConfig,
      },
    });

    const expectedNumberOfWarnings = Object.keys(mastercardEncryptionConfig).length;
    expect(() => configValidator(context)).to.throw("invalid config");
    expect(showValidationErrorsStub.calledOnce).to.be.true;
    expect(logWarningStub.callCount).to.equal(expectedNumberOfWarnings);

    const [, , { warnings }] = showValidationErrorsStub.firstCall.args;
    expect(warnings).to.have.length(expectedNumberOfWarnings);

    Object.keys(mastercardEncryptionConfig).forEach((k) => {
      expect(logWarningStub.args.flat()).to.include(`Found unknown config: encryptionConfig.${k}. Will be ignored`);
      expect(
        warnings.find(
          (w) =>
            w.field === `encryptionConfig.${k}` &&
            w.message === `Found unknown config: encryptionConfig.${k}. Will be ignored`
        )
      ).not.to.be.undefined;
    });
  });

  it("when mode !== JWE, should not mark mastercard encryption config fields as extraneous", () => {
    const mastercardEncryptionConfig = {
      publicKeyFingerprintFieldName: "val",
      oaepHashingAlgorithmFieldName: "val",
      oaepPaddingDigestAlgorithm: "val",
      ivFieldName: "val",
      encryptedKeyFieldName: "val",
      ivHeaderName: "val",
      encryptedKeyHeaderName: "val",
      oaepHashingAlgorithmHeaderName: "val",
      publicKeyFingerprintHeaderName: "val",
      useCertificateContent: false,
    };
    const context = mockContext({
      consumerKey: null,
      encryptionConfig: {
        mode: "not-JWE",
        ...mastercardEncryptionConfig,
      },
    });

    const expectedNumberOfWarnings = 0;
    expect(() => configValidator(context)).to.throw("invalid config");
    expect(showValidationErrorsStub.calledOnce).to.be.true;
    expect(logWarningStub.callCount).to.equal(expectedNumberOfWarnings);

    const [, , { warnings }] = showValidationErrorsStub.firstCall.args;
    expect(warnings).to.have.length(expectedNumberOfWarnings);
  });

  it("should not produce any errors for a valid config", () => {
    const context = mockContext({
      consumerKey: "valid-string",
      keyAlias: "valid-string",
      keystoreP12Path: validCert,
      keystorePassword: "valid-string",
      appliesTo: ["valid-string"],
      encryptionConfig: {
        paths: [
          {
            path: "valid-string",
            toEncrypt: [
              {
                element: "valid-string",
                obj: "valid-string",
              },
            ],
            toDecrypt: [
              {
                element: "valid-string",
                obj: "valid-string",
              },
            ],
          },
        ],
        mode: "JWE",
        encryptionCertificate: validCert,
        encryptedValueFieldName: "valid-string",
        publicKeyFingerprint: "valid-string",
        publicKeyFingerprintType: "certificate",
        dataEncoding: "hex",
        privateKey: validCert,
        keyStore: validCert,
        keyStoreAlias: "valid-string",
        keyStorePassword: "valid-string",

        // mastercard encryption fields
        publicKeyFingerprintFieldName: "valid-string",
        oaepHashingAlgorithmFieldName: "valid-string",
        oaepPaddingDigestAlgorithm: "valid-string",
        ivFieldName: "valid-string",
        encryptedKeyFieldName: "valid-string",
        ivHeaderName: "valid-string",
        encryptedKeyHeaderName: "valid-string",
        oaepHashingAlgorithmHeaderName: "valid-string",
        publicKeyFingerprintHeaderName: "valid-string",
        useCertificateContent: false,
      },
    });

    expect(() => configValidator(context)).not.to.throw();
    expect(showValidationErrorsStub.called).to.be.false;
    expect(consoleErrorStub.called).to.be.false;
  });
});
