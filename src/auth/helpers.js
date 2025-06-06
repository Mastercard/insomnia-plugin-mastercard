const fs = require('fs');
const forge = require('node-forge');

const defaultKeystoreP12PathSandbox = '/path/to/sandbox-signing-key.p12';
const defaultKeystoreP12PathProd = '/path/to/production-signing-key.p12';
const defaultConsumerKey = '000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000';

function validateAuthConfig(config) {
   if (
        config.keystoreP12Path === defaultKeystoreP12PathSandbox ||
        config.keystoreP12Path === defaultKeystoreP12PathProd
      ) {
        // noinspection ExceptionCaughtLocallyJS
        throw Error(
          'Please update the keystoreP12Path property from the default in the Mastercard environment settings'
        );
      }
      if (config.consumerKey === defaultConsumerKey) {
        // noinspection ExceptionCaughtLocallyJS
        throw Error(
          'Please update the consumerKey property from the default in the Mastercard environment settings'
        );
      }
}

function getSigningKey(config) {
      const p12Content = fs.readFileSync(config.keystoreP12Path, 'binary');
      const p12Asn1 = forge.asn1.fromDer(p12Content, false);
      const p12 = forge.pkcs12.pkcs12FromAsn1(
        p12Asn1,
        false,
        config.keystorePassword
      );
    
      const keyObj = p12.getBags({
        friendlyName: config.keyAlias,
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
      }).friendlyName[0];
    
     return forge.pki.privateKeyToPem(keyObj.key);
}

module.exports = {
    validateAuthConfig,
    getSigningKey
}
