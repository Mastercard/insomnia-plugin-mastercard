const assert = require('assert');
const { v4: uuidv4 } = require('uuid');
const plugin = require('../../index');
const sinon = require('sinon');
const { mastercard: config } = require('../__res__/config.json');
const context = require('../test/helper').context;

describe('OAuth', () => {

  const oauthHookPosition = 2;

  it('should sign the request and set the Authorization header', async () => {
    let name, value;
    let ctx = context();
    ctx.request.setHeader = (_name, _value) => {
      name = _name;
      value = _value;
    };

    await plugin.requestHooks[oauthHookPosition](ctx); // signer

    assert.strictEqual(name, 'Authorization');
    assert.match(value, /^OAuth oauth_body_hash=.*,oauth_consumer_key=.*,oauth_nonce=.*,oauth_signature_method=.*,oauth_timestamp=.*,oauth_version=.*,oauth_signature=.*$/);
  });

  it('should not intercept non Mastercard requests', async () => {
    let ctx = context({ url: 'https://api.foo.com/bar' });
    const setHeader = sinon.spy(ctx.request, 'setHeader');

    await plugin.requestHooks[oauthHookPosition](ctx); // signer

    assert(setHeader.notCalled);
  });

  it('should throw Error when using default p12s', async () => {
    window = {
      alert: () => {
      }
    };
    const config = { ...require('../__res__/config.json').mastercard };
    for (const item of ['/path/to/sandbox-signing-key.p12', '/path/to/production-signing-key.p12']) {
      config.keystoreP12Path = '/path/to/sandbox-signing-key.p12';
      const ctx = context({ config });
      await assert.rejects(
        async () => {
          await plugin.requestHooks[oauthHookPosition](ctx);
        },
        {
          name: 'Error',
          message: 'Error: Please update the keystoreP12Path property from the default in the Mastercard environment settings'
        }
      );
    }
  });

  it('should throw Error when using default consumerKey', async () => {
    window = {
      alert: () => {
      }
    };
    const config = { ...require('../__res__/config.json').mastercard };
    config.consumerKey = '000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000';
    const ctx = context({ config });
    await assert.rejects(
      async () => {
        await plugin.requestHooks[oauthHookPosition](ctx);
      },
      {
        name: 'Error',
        message: 'Error: Please update the consumerKey property from the default in the Mastercard environment settings'
      }
    );
  });

  it('should throw Error when p12 not found', async () => {
    window = {
      alert: () => {
      }
    };
    const config = { ...require('../__res__/config.json').mastercard };
    const path = `/path/foo/bar/${uuidv4()}`;
    config.keystoreP12Path = path;
    const ctx = context({ config });
    await assert.rejects(
      async () => {
        await plugin.requestHooks[oauthHookPosition](ctx);
      },
      {
        name: 'Error',
        message: `Error: No P12 file found at location: ${path}`
      }
    );
  });

  it('should not intercept when mastercard env not set', async () => {
    const ctx = context({ config: null });
    const setHeader = sinon.spy(ctx.request, 'setHeader');

    await plugin.requestHooks[oauthHookPosition](ctx);

    assert(setHeader.notCalled);
  });
});
