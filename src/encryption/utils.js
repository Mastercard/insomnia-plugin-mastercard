const forge = require('node-forge');
const fs = require('fs');
const clientEncryption = require('mastercard-client-encryption');

/**
 * Electron is based on BoringSSL and it doesn't support PKCS#8, hence converting it to PKCS#1.
 * @param certificate
 * @returns {string}
 */
module.exports.pkcs8to1 = function(certificate) {
  const certificateContent = fs.readFileSync(certificate);
  const forgeCert = forge.pki.certificateFromPem(certificateContent);
  let publicKey = forge.pki.publicKeyToPem(forgeCert.publicKey);
  publicKey = publicKey.replace('-----BEGIN PUBLIC KEY-----', '');
  publicKey = publicKey.replace('-----END PUBLIC KEY-----', '');
  let decoded = new Buffer(publicKey, 'base64');
  decoded = decoded.subarray(24, decoded.length);
  return '-----BEGIN RSA PUBLIC KEY-----\n' +
    decoded.toString('base64') +
    '\n-----END RSA PUBLIC KEY-----';
};

/**
 *
 * @param config The mastercard config object
 * @returns {JweEncryption|FieldLevelEncryption}
 */
module.exports.cryptoService = function(config) {
  return this.isJWE(config) ?
    new clientEncryption.JweEncryption(config) :
    new clientEncryption.FieldLevelEncryption(config);
};

/**
 * @param config The mastercard config object
 * @returns {boolean} True if mode is JWE
 */
module.exports.isJWE = function(config) {
  return config && config.mode === 'JWE';
};
