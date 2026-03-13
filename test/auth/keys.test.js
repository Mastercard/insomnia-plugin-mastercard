const assert = require('assert');
const path = require('path');
const { extractKeysFromP12 } = require('../../src/auth/oauth2/keys');

const P12_PATH = path.resolve('test/__res__/test_key_container.p12');
const KEY_ALIAS = 'mykeyalias';
const PASSWORD = 'Password1';

describe('extractKeysFromP12', () => {
  it('returns a CryptoKey privateKey and publicKey from a valid P12 file', async () => {
    const { privateKey, publicKey } = await extractKeysFromP12(
      P12_PATH,
      KEY_ALIAS,
      PASSWORD
    );

    assert.ok(privateKey, 'privateKey should be defined');
    assert.ok(publicKey, 'publicKey should be defined');
    assert.strictEqual(privateKey.type, 'private');
    assert.strictEqual(publicKey.type, 'public');
    assert.deepStrictEqual(privateKey.usages, ['sign']);
    assert.deepStrictEqual(publicKey.usages, ['verify']);
  });

  it('throws with ENOENT code when the P12 file does not exist', async () => {
    await assert.rejects(
      () => extractKeysFromP12('/nonexistent/path.p12', KEY_ALIAS, PASSWORD),
      { code: 'ENOENT' }
    );
  });

  it('throws when the wrong password is provided', async () => {
    await assert.rejects(
      () => extractKeysFromP12(P12_PATH, KEY_ALIAS, 'wrong-password')
    );
  });

  it('throws when the key alias is not found in the P12', async () => {
    // No matching alias → privateKeyPem stays undefined → importPEMPrivateKey(undefined) throws
    await assert.rejects(
      () => extractKeysFromP12(P12_PATH, 'no-such-alias', PASSWORD)
    );
  });
});
