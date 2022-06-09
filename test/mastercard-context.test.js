const assert = require('assert');
const context = require('./test/helper').context;
const MastercardContext = require('../src/mastercard-context');

describe('MastercardContext', () => {

  it('should not set encryption when not configured', async () => {
    const config = { ...require('./__res__/config.json').mastercard };
    config.encryptionConfig = null;
    const ctx = new MastercardContext(context({ config }));

    assert.strictEqual(ctx.encryptionConfig, undefined);
  });

  it('should not fail when mastercard configuration is not set in the env', async () => {
    const c = context({ config: null });
    const ctx = new MastercardContext(c);

    assert.notStrictEqual(ctx, null);
    assert.notStrictEqual(ctx, undefined);
  });

  it('isMastercardRequest should return false when configuration is not set in the env', async () => {
    const c = context({ config: null });
    const ctx = new MastercardContext(c);

    assert.strictEqual(ctx.isMastercardRequest(), false);
  });

  it('isMastercardRequest should return false when not Mastercard URL', async () => {
    const ctx = new MastercardContext(context({ url: 'https://foo.bar.com/service/api' }));

    assert.strictEqual(ctx.isMastercardRequest(), false);
  });

  it('isMastercardRequest should return true when Mastercard URL (0)', async () => {
    const ctx = new MastercardContext(context({ url: 'https://api.mastercard.com/service/api' }));

    assert.strictEqual(ctx.isMastercardRequest(), true);
  });

  it('isMastercardRequest should return true when Mastercard URL (1)', async () => {
    const ctx = new MastercardContext(context({ url: 'https://api.ethocaweb.com/service/api' }));

    assert.strictEqual(ctx.isMastercardRequest(), true);
  });

  it('isMastercardRequest should return true when Mastercard URL (2)', async () => {
    const ctx = new MastercardContext(context({ url: 'https://sandbox.api.mastercard.com/service/api' }));

    assert.strictEqual(ctx.isMastercardRequest(), true);
  });

  it('isMastercardRequest should return true when URL is in appliesTo', async () => {
    const config = { ...require('./__res__/config.json').mastercard };
    config.appliesTo = ['api.new-mastercard.com'];
    const ctx = context({ config });
    ctx.request.getUrl = () => 'https://api.new-mastercard.com/service/api';

    assert.strictEqual(new MastercardContext(ctx).isMastercardRequest(), true);
  });

  it('isMastercardRequest should return false when URL is not in appliesTo', async () => {
    const config = { ...require('./__res__/config.json').mastercard };
    config.appliesTo = ['api.new-mastercard.com'];
    const ctx = context({ config });
    ctx.request.getUrl = () => 'https://api.mastercard.com/service/api';

    assert.strictEqual(new MastercardContext(ctx).isMastercardRequest(), false);
  });

  it('isJsonRequest/Response should return false when Content-Type header not set', async () => {
    const ctx = context({ header: null });

    assert.strictEqual(new MastercardContext(ctx).isJsonRequest(), false);
    assert.strictEqual(new MastercardContext(ctx).isJsonResponse(), false);
  });

  it('isJsonRequest/Response should return false when Content-Type header is not JSON', async () => {
    const ctx = context({ header: 'application/html' });

    assert.strictEqual(new MastercardContext(ctx).isJsonRequest(), false);
    assert.strictEqual(new MastercardContext(ctx).isJsonResponse(), false);
  });


  it('isJsonRequest/Response should return true when Content-Type header is JSON', async () => {
    const ctx = context({ header: 'application/json' });

    assert.strictEqual(new MastercardContext(ctx).isJsonRequest(), true);
    assert.strictEqual(new MastercardContext(ctx).isJsonResponse(), true);
  });

});
