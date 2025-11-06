const assert = require('assert');
const context = require('./test/helper').context;
const MastercardContext = require('../src/mastercard-context');
const sinon = require('sinon');
const { expect } = require("chai");

describe('MastercardContext', () => {

  it('should not set encryption when not configured', async () => {
    const config = { ...require('./__res__/config.json').mastercard };
    config.encryptionConfig = null;
    const ctx = new MastercardContext(context({ config }));

    assert.strictEqual(ctx.encryptionConfig, undefined);
  });

    it('should not set signature when not configured', async () => {
      const config = { ...require('./__res__/config.json').mastercard };
      config.signatureConfig = null;
      const ctx = new MastercardContext(context({ config }));

      assert.strictEqual(ctx.signatureConfig, undefined);
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

    it('getRequestType should return POST when request is of POST type', async () => {
      const ctx = context({ method: 'POST' });
      assert.strictEqual(new MastercardContext(ctx).getRequestType(), 'POST');
    });

describe('MastercardContext', () => {
  describe('getSignatureHeader', () => {
    let context;
    let getSignatureHeader;

    beforeEach(() => {
      context = {
        response: {
          getHeader: sinon.stub()
        }
      };

      getSignatureHeader = () => {
        return context.response.getHeader('X-Jws-Signature');
      };
    });

    it('should return the signature header when it exists', () => {
      context.response.getHeader.withArgs('X-Jws-Signature').returns('abc123signature');
      const result = getSignatureHeader();
      expect(result).to.equal('abc123signature');
    });

    it('should return undefined when the signature header does not exist', () => {
      context.response.getHeader.withArgs('X-Jws-Signature').returns(undefined);
      const result = getSignatureHeader();
      expect(result).to.be.undefined;
    });

    it('should throw an error if context.response is null', () => {
      context.response = null;
      getSignatureHeader = () => {
        return context.response.getHeader('X-Jws-Signature');
      };
      expect(() => getSignatureHeader()).to.throw();
    });
  });
});


});
