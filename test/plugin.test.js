const { expect } = require('chai');
const sinon = require('sinon');

describe('plugin', () => {
  let sandbox;
  let plugin;
  let encryptionRequestStub, encryptionResponseStub;
  let jwsRequestStub, jwsResponseStub;
  let authRequestStub;
  let configValidatorStub;

  const REQUEST_ID = 'test-request-id';

  function makeContext(id = REQUEST_ID) {
    // Only the fields plugin.js and MastercardContext constructor actually use.
    // Downstream hooks (encryption, jws, auth) are stubbed so their internals never run.
    return {
      request: {
        getId: () => id,
        getUrl: () => 'https://api.mastercard.com/test',
        getEnvironmentVariable: () => null,
        getMethod: () => 'POST',
        getHeader: () => null,
        getParameters: () => [],
      },
      response: { getRequestId: () => id },
    };
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Stubs must be set on cached modules BEFORE requiring plugin —
    // plugin.js captures function references (via createHook) at load time.
    const encryption = require('../src/encryption/client-encryption');
    const jws = require('../src/signature/jws-signature');
    const auth = require('../src/auth');
    const validator = require('../src/utils/validator');

    encryptionRequestStub = sandbox.stub(encryption, 'request').resolves();
    encryptionResponseStub = sandbox.stub(encryption, 'response').resolves();
    jwsRequestStub = sandbox.stub(jws, 'request').resolves();
    jwsResponseStub = sandbox.stub(jws, 'response').resolves();
    authRequestStub = sandbox.stub(auth, 'request').resolves();
    configValidatorStub = sandbox.stub(validator, 'configValidator');

    // Delete from cache so each test starts with an empty validationFailed Set.
    delete require.cache[require.resolve('../src/plugin')];
    plugin = require('../src/plugin');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('structure', () => {
    it('exports 4 request hooks', () => {
      expect(plugin.request).to.have.length(4);
      plugin.request.forEach(h => expect(h).to.be.a('function'));
    });

    it('exports 3 response hooks', () => {
      expect(plugin.response).to.have.length(3);
      plugin.response.forEach(h => expect(h).to.be.a('function'));
    });
  });

  describe('request hooks', () => {
    it('calls downstream hooks when validation passes', async () => {
      const ctx = makeContext();
      for (const hook of plugin.request) await hook(ctx);

      expect(configValidatorStub.calledOnce).to.be.true;
      expect(encryptionRequestStub.calledOnce).to.be.true;
      expect(jwsRequestStub.calledOnce).to.be.true;
      expect(authRequestStub.calledOnce).to.be.true;
    });

    it('skips downstream hooks when validation fails', async () => {
      configValidatorStub.throws(new Error('invalid config'));
      const ctx = makeContext();
      for (const hook of plugin.request) await hook(ctx);

      expect(configValidatorStub.calledOnce).to.be.true;
      expect(encryptionRequestStub.called).to.be.false;
      expect(jwsRequestStub.called).to.be.false;
      expect(authRequestStub.called).to.be.false;
    });

    it('downstream hooks receive a MastercardContext instance', async () => {
      const MastercardContext = require('../src/mastercard-context');
      const ctx = makeContext();
      for (const hook of plugin.request) await hook(ctx);

      const [mcCtx] = encryptionRequestStub.firstCall.args;
      expect(mcCtx).to.be.instanceOf(MastercardContext);
    });

    it('clears any previously failed state for the ID before running validation', async () => {
      const ctx = makeContext();

      // First run: validation fails, ID is added to the failed set
      configValidatorStub.throws(new Error('invalid config'));
      for (const hook of plugin.request) await hook(ctx);
      expect(encryptionRequestStub.called).to.be.false;

      // Second run: validation passes — ID must have been removed from the set first
      configValidatorStub.resetBehavior();
      for (const hook of plugin.request) await hook(ctx);
      expect(encryptionRequestStub.calledOnce).to.be.true;
    });
  });

  describe('response hooks', () => {
    it('calls response hooks when request validation passed', async () => {
      const ctx = makeContext();
      for (const hook of plugin.request) await hook(ctx);
      for (const hook of plugin.response) await hook(ctx);

      expect(jwsResponseStub.calledOnce).to.be.true;
      expect(encryptionResponseStub.calledOnce).to.be.true;
    });

    it('skips response hooks when request validation failed', async () => {
      configValidatorStub.throws(new Error('invalid config'));
      const ctx = makeContext();
      for (const hook of plugin.request) await hook(ctx);
      for (const hook of plugin.response) await hook(ctx);

      expect(configValidatorStub.calledOnce).to.be.true;
      expect(jwsResponseStub.called).to.be.false;
      expect(encryptionResponseStub.called).to.be.false;
    });

    it('cleanup removes the failed ID so a subsequent request with the same ID is not blocked', async () => {
      configValidatorStub.throws(new Error('invalid config'));
      const ctx = makeContext();
      for (const hook of plugin.request) await hook(ctx);
      for (const hook of plugin.response) await hook(ctx);

      // Second request: validation now passes
      configValidatorStub.resetBehavior();
      for (const hook of plugin.request) await hook(ctx);
      expect(encryptionRequestStub.calledOnce).to.be.true;
    });

    it('cleanup runs without error when request was not in the failed set', async () => {
      const ctx = makeContext();
      for (const hook of plugin.request) await hook(ctx);
      // response[2] is the cleanup hook — should not throw on the happy path
      await plugin.response[2](ctx);
    });
  });
});
