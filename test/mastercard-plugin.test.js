const assert = require('assert');

describe('Plugin Hook', () => {

  it('plugin should load and provide request signer and encryption functions', () => {
    const plugin = require('../index');

    assert.strictEqual(plugin.requestHooks.length, 3);
    assert.ok(plugin.requestHooks[0] instanceof Function);
    assert.ok(plugin.requestHooks[1] instanceof Function);
    assert.ok(plugin.requestHooks[2] instanceof Function);
  });
//test
  it('plugin should load and provide response encryption function', () => {
    const plugin = require('../index');

    assert.strictEqual(plugin.responseHooks.length, 1);
    assert.ok(plugin.responseHooks[0] instanceof Function);
  });
});
