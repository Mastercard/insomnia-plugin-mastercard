const assert = require('assert');
const plugin = require('../../index');
const sinon = require('sinon');
const fs = require('fs');
const helper = require('../test/helper');

describe('Encryption', () => {

  const body = JSON.stringify({
    elem1: {
      encryptedData: {
        accountNumber: '5123456789012345'
      }
    },
    foo: 'bar'
  });

  const bodyWithHeader = JSON.stringify({
    encrypted_payload: {
      data: {
        accountNumber: '5123456789012345'
      }
    }
  });

  const context = helper.context({
    url: 'https://api.mastercard.com/service/api/resource',
    body: body
  });
  
  const contextPatch = helper.contextPatch({
    url: 'https://api.mastercard.com/service/api/resource',
    body: body
  });
  const contextWithHeader = helper.context({
    url: 'https://api.mastercard.com/service/api/resource',
    body: bodyWithHeader,
    config: require('../__res__/config-with-header.json').mastercard
  });

  const contextJWE = helper.contextJWE({
    url: 'https://api.mastercard.com/service/api/resource',
    body: body
  });

  const contextJWEPatch = helper.contextJWEPatch({
    url: 'https://api.mastercard.com/service/api/resource',
    body: body
  });
  const contextWithRootElem = helper.context({
    url: 'https://api.mastercard.com/service/api/resource',
    body: body,
    config: require('../__res__/config-root-element.json').mastercard
  });

  const mockResponse = (_path) => {
    const readFileSync = fs.readFileSync;
    const fn = (path, options) => {
      if (path === 'mocked-response-path') {
        path = _path;
      }
      return readFileSync(path, options);
    };
    sinon.stub(fs, 'readFileSync').callsFake(fn);
  };

  it('should encrypt the request', async () => {

    sinon.spy(context.request, 'setBodyText');

    await plugin.requestHooks[0](context); // encrypt

    const body = context.request.setBodyText.getCall(0).args[0];
    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.ok(json.elem1);
    assert.ok(json.elem1.encryptedData);
    assert.ok(json.elem1.iv);
    assert.ok(json.elem1.encryptedKey);
    assert.strictEqual(json.elem1.publicKeyFingerprint, '80810fc13a8319fcf0e2ec322c82a4c304b782cc3ce671176343cfe8160c2279');
    assert.strictEqual(json.elem1.oaepHashingAlgorithm, 'SHA512');
    assert.strictEqual(json.foo, 'bar');
  });

  it('should JWE encrypt the request', async () => {

    sinon.spy(contextJWE.request, 'setBodyText');

    await plugin.requestHooks[0](contextJWE); // JWE encrypt

    const body = contextJWE.request.setBodyText.getCall(0).args[0];
    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.ok(json.elem1);
    assert.ok(json.elem1.encryptedData);
    assert.strictEqual(json.foo, 'bar');
  });

  it('should decrypt the response', async () => {
    mockResponse('./test/__res__/mock-response.json');

    sinon.spy(context.response, 'setBody');
    sinon.mock(context.response).expects('getHeader').returns('application/json');
    sinon.mock(context.response).expects('getBodyStream').returns({ path: 'mocked-response-path' });

    await plugin.responseHooks[0](context); // decrypt

    const body = context.response.setBody.getCall(0).args[0];
    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.strictEqual(json.foo.accountNumber, '5123456789012345');
    fs.readFileSync.restore();
  });

  it('should decrypt the response with merge-patch+json content type', async () => {
    mockResponse('./test/__res__/mock-response.json');

    sinon.spy(contextPatch.response, 'setBody');
    sinon.mock(contextPatch.response).expects('getHeader').returns('application/merge-patch+json');
    sinon.mock(contextPatch.response).expects('getBodyStream').returns({ path: 'mocked-response-path' });

    await plugin.responseHooks[0](contextPatch); // decrypt

    const body = contextPatch.response.setBody.getCall(0).args[0];
    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.strictEqual(json.foo.accountNumber, '5123456789012345');
    fs.readFileSync.restore();
  });

  it('should JWE decrypt the response', async () => {
    mockResponse('./test/__res__/mock-jwe-response.json');

    sinon.spy(contextJWE.response, 'setBody');
    sinon.mock(contextJWE.response).expects('getHeader').returns('application/json');
    sinon.mock(contextJWE.response).expects('getBodyStream').returns({ path: 'mocked-response-path' });

    await plugin.responseHooks[0](contextJWE); // decrypt

    const body = contextJWE.response.setBody.getCall(0).args[0];
    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.strictEqual(json.foo.accountNumber, '5123456789012345');
    fs.readFileSync.restore();
  });

  it('should JWE decrypt the response with merge-patch+json content type', async () => {
    mockResponse('./test/__res__/mock-jwe-response.json');

    sinon.spy(contextJWEPatch.response, 'setBody');
    sinon.mock(contextJWEPatch.response).expects('getHeader').returns('application/merge-patch+json');
    sinon.mock(contextJWEPatch.response).expects('getBodyStream').returns({ path: 'mocked-response-path' });

    await plugin.responseHooks[0](contextJWEPatch); // decrypt

    const body = contextJWEPatch.response.setBody.getCall(0).args[0];
    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.strictEqual(json.foo.accountNumber, '5123456789012345');
    fs.readFileSync.restore();
  });

  it('should encrypt the request with header', async () => {

    sinon.spy(contextWithHeader.request, 'setBodyText');
    const setHeader = sinon.spy(contextWithHeader.request, 'setHeader');

    await plugin.requestHooks[0](contextWithHeader); // encrypt

    const body = contextWithHeader.request.setBodyText.getCall(0).args[0];

    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.ok(json.encrypted_payload);

    assert.ok(setHeader.called);
    assert.ok(setHeader.calledWith('foo', 'bar'));
    assert.ok(setHeader.calledWith('x-oaep-hashing-algorithm', 'SHA512'));
    assert.ok(setHeader.calledWith('x-public-key-fingerprint', '80810fc13a8319fcf0e2ec322c82a4c304b782cc3ce671176343cfe8160c2279'));

    assert.strictEqual(setHeader.getCall(1).args[0], 'x-encrypted-key');
    assert.ok(setHeader.getCall(1).args[1]);

    assert.strictEqual(setHeader.getCall(2).args[0], 'x-iv');
    assert.ok(setHeader.getCall(2).args[1]);
  });

  it('should decrypt response with header', async () => {
    mockResponse('./test/__res__/mock-response-header.json');
    const headers = (key) => require('../__res__/mock-header.json')[key];

    sinon.spy(contextWithHeader.response, 'setBody');
    sinon.mock(contextWithHeader.response).expects('getBodyStream').returns({ path: 'mocked-response-path' });
    sinon.stub(contextWithHeader.response, 'getHeader').callsFake(headers);

    await plugin.responseHooks[0](contextWithHeader); // decrypt

    const body = contextWithHeader.response.setBody.getCall(0).args[0];
    const json = JSON.parse(body);
    assert.ok(body);
    assert.ok(json);
    assert.strictEqual(json.accountNumber, '5123456789012345');

    fs.readFileSync.restore();
  });

  it('should not intercept non Mastercard requests', async () => {
    let ctx = helper.context({ url: 'https://api.foo.com/bar' });
    const setHeader = sinon.spy(ctx.request, 'setHeader');
    const setBodyText = sinon.spy(ctx.request, 'setBodyText');

    await plugin.requestHooks[0](ctx); // encrypt

    assert(setHeader.notCalled);
    assert(setBodyText.notCalled);
  });

  it('should not intercept when body is not defined', async () => {
    let ctx = helper.context({ body: null });
    const setHeader = sinon.spy(ctx.request, 'setHeader');
    const setBodyText = sinon.spy(ctx.request, 'setBodyText');

    await plugin.requestHooks[0](ctx); // encrypt

    assert(setHeader.notCalled);
    assert(setBodyText.notCalled);
  });

  it('should not intercept when non json request', async () => {
    let ctx = helper.context({ header: 'application/html' });
    const setHeader = sinon.spy(ctx.request, 'setHeader');
    const setBodyText = sinon.spy(ctx.request, 'setBodyText');

    await plugin.requestHooks[0](ctx); // encrypt

    assert(setHeader.notCalled);
    assert(setBodyText.notCalled);
  });

  it('should not intercept when encryption config not defined', async () => {
    const config = { ...require('../__res__/config.json').mastercard };
    config.encryptionConfig = null;
    const ctx = helper.context({ config: config, body: '{}' });

    const setHeader = sinon.spy(ctx.request, 'setHeader');
    const setBodyText = sinon.spy(ctx.request, 'setBodyText');

    await plugin.requestHooks[0](ctx); // encrypt

    assert(setHeader.notCalled);
    assert(setBodyText.notCalled);
  });

  it('should not intercept non Mastercard responses', async () => {
    let ctx = helper.context({ url: 'https://api.foo.com/bar' });
    const setBody = sinon.spy(ctx.response, 'setBody');

    await plugin.responseHooks[0](ctx); // decrypt

    assert(setBody.notCalled);
  });

  it('should not intercept when body is not defined in response', async () => {
    let ctx = helper.context({ body: null });
    const setBody = sinon.spy(ctx.response, 'setBody');

    await plugin.responseHooks[0](ctx); // decrypt

    assert(setBody.notCalled);
  });

  it('should not intercept when non json response', async () => {
    let ctx = helper.context({ header: 'application/html', body: '{}' });
    sinon.mock(ctx.response).expects('getBodyStream').returns('{}');

    const setBody = sinon.spy(ctx.response, 'setBody');

    await plugin.responseHooks[0](ctx); // decrypt

    assert(setBody.notCalled);
  });

  it('should not intercept when encryption config not defined', async () => {
    const config = { ...require('../__res__/config.json').mastercard };
    config.encryptionConfig = null;
    const ctx = helper.context({ config: config, body: '{}' });
    sinon.mock(ctx.response).expects('getBodyStream').returns('{}');

    const setBody = sinon.spy(ctx.response, 'setBody');

    await plugin.responseHooks[0](ctx); // decrypt

    assert(setBody.notCalled);
  });

  it('should not override response if decryption fails', async () => {
    mockResponse('./test/__res__/mock-response-error.json');
    sinon.spy(contextWithRootElem.response, 'setBody');
    sinon.mock(contextWithRootElem.response).expects('getHeader').returns('application/json');
    sinon.mock(contextWithRootElem.response).expects('getBodyStream').returns({ path: 'mocked-response-path' });

    await plugin.responseHooks[0](contextWithRootElem); // decrypt

    sinon.assert.notCalled(contextWithRootElem.response.setBody);

    fs.readFileSync.restore();
  });

  it('should not ovveride request if encryption fails', async () => {
    let ctx = helper.context({ body: "invalid json" });
    const setHeader = sinon.spy(ctx.request, 'setHeader');
    const setBodyText = sinon.spy(ctx.request, 'setBodyText');

    await plugin.requestHooks[0](ctx); // encrypt

    assert(setHeader.notCalled);
    assert(setBodyText.notCalled);
  });


});
