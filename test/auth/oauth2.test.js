const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const oauth2 = require('../../src/auth/oauth2/oauth2');
const { OAuth2ClientBuilder } = require('@mastercard/oauth2-client-js');

const VALID_P12_PATH = path.resolve('test/__res__/test_key_container.p12');
const MISSING_P12_PATH = '/no/such/file.p12';

function makeMcContext(overrides = {}) {
  const setHeaderSpy = sinon.spy();
  return {
    isMastercardRequest: () => true,
    config: {
      oAuth2: {
        clientId: 'test-client-id',
        kid: 'test-kid',
        keystoreP12Path: VALID_P12_PATH,
        keyAlias: 'mykeyalias',
        keystorePassword: 'Password1',
        tokenEndpoint: 'https://auth.mastercard.com/oauth2/token',
        issuer: 'https://auth.mastercard.com',
        scopes: ['openid']
      }
    },
    url: 'https://api.mastercard.com/resource',
    insomnia: {
      request: {
        getMethod: () => 'POST',
        setHeader: setHeaderSpy
      }
    },
    ...overrides
  };
}

describe('oauth2.request', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('sets all headers returned by the OAuth2 client on success', async () => {
    const mockHeaders = {
      Authorization: 'Bearer mock-access-token',
      DPoP: 'mock-dpop-proof'
    };
    sandbox.stub(OAuth2ClientBuilder.prototype, 'build').returns({
      getOAuth2Headers: sinon.stub().resolves(mockHeaders)
    });

    const mcContext = makeMcContext();
    await oauth2.request(mcContext);

    const calls = mcContext.insomnia.request.setHeader.args;
    const headerMap = Object.fromEntries(calls);
    assert.strictEqual(headerMap['Authorization'], 'Bearer mock-access-token');
    assert.strictEqual(headerMap['DPoP'], 'mock-dpop-proof');
  });

  it('shows window.alert with the original message and throws error', async () => {
    let alertMessage;
    window = { alert: (msg) => { alertMessage = msg; } }; // eslint-disable-line no-undef

    const authError = new Error('Token endpoint unreachable');
    sandbox.stub(OAuth2ClientBuilder.prototype, 'build').returns({
      getOAuth2Headers: sinon.stub().rejects(authError)
    });

    const mcContext = makeMcContext();

    await assert.rejects(() => oauth2.request(mcContext));

    assert.strictEqual(alertMessage, 'Token endpoint unreachable');
  });
});
