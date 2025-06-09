const fs = require('fs');
const forge = require('node-forge');

function extractPrivateKeyFromP12(keyFilePath, keyAlias, keyStorePassword) {
    const p12Content = fs.readFileSync(keyFilePath, 'binary');
      const p12Asn1 = forge.asn1.fromDer(p12Content, false);
      const p12 = forge.pkcs12.pkcs12FromAsn1(
        p12Asn1,
        false,
        keyStorePassword
      );
    
      const keyObj = p12.getBags({
        friendlyName: keyAlias,
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
      }).friendlyName[0];
    
      return forge.pki.privateKeyToPem(keyObj.key);
}

module.exports = {
    extractPrivateKeyFromP12
}