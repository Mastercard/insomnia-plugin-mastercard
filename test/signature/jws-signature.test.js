const sinon = require('sinon');
const fs = require('fs');
const helper = require('../test/helper');
const plugin = require('../../index');
const assert = require('assert');

describe('JWS', () => {

  const contextJWS = helper.contextJWS({
    url: 'https://api.mastercard.com/service/api/resource',
    body: "body"
  });

    const contextJWSDisabled = helper.contextJWSDisabled({
      url: 'https://api.mastercard.com/service/api/resource',
      body: "body"
    });

  const requestHookPosition = 2;
  const responseHookPosition = 0;

  const originalDocument = global.document;
  before(() => {
    global.document = {
      createElement: () => ({
        style: {},
        appendChild: () => {},
        innerHTML: '',
        textContent: '',
      })
    }
  })

  after(() => {
    global.document = originalDocument;
  })

  it('should sign the request', async () => {
    const setHeader = sinon.spy(contextJWS.request, 'setHeader');

    await plugin.requestHooks[requestHookPosition](contextJWS); // sign
    assert(setHeader.called);

  });

    it('should not sign the request when flag is false', async () => {
      const setHeader = sinon.spy(contextJWSDisabled.request, 'setHeader');

      await plugin.requestHooks[requestHookPosition](contextJWSDisabled); // sign
      assert(setHeader.notCalled);

    });
});
