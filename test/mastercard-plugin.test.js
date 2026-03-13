const assert = require('assert');
const plugin = require('../index');

describe('Plugin Hook', () => {
  it('plugin should load and provide request signer and encryption functions', () => {
    assert.strictEqual(plugin.requestHooks.length, 4);
    assert.ok(plugin.requestHooks[0] instanceof Function);
    assert.ok(plugin.requestHooks[1] instanceof Function);
    assert.ok(plugin.requestHooks[2] instanceof Function);
    assert.ok(plugin.requestHooks[3] instanceof Function);
  });

  it('plugin should load and provide response encryption function', () => {
    assert.strictEqual(plugin.responseHooks.length, 2);
    assert.ok(plugin.responseHooks[0] instanceof Function);
    assert.ok(plugin.responseHooks[1] instanceof Function);
  });
});
