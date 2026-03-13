const fs = require('fs');
const forge = require('node-forge');
const cryptoModule = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto : require('crypto').webcrypto;

async function extractKeysFromP12(
  p12Path,
  keyAlias,
  keystorePassword
) {
  const p12Content = fs.readFileSync(p12Path, 'binary');
  const p12Asn1 = forge.asn1.fromDer(p12Content, false);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, keystorePassword);

  const keyBags = p12.getBags({
    friendlyName: keyAlias,
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag
  });

  let privateKeyPem;
  let certificate;

  if (keyBags.friendlyName && keyBags.friendlyName.length > 0) {
    const keyObj = keyBags.friendlyName[0];
    if (keyObj && keyObj.key) {
      const privateKeyInfo = forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(keyObj.key));
      privateKeyPem = forge.pki.privateKeyInfoToPem(privateKeyInfo);
    }
  }

  const certBags = p12.getBags({
    bagType: forge.pki.oids.certBag
  });

  const certBagTypeKey = forge.pki.oids.certBag;
  const certBags2 = certBags[certBagTypeKey];
  if (certBags2 && certBags2.length > 0) {
    const certObj = certBags2[0];
    if (certObj && certObj.cert) {
      certificate = certObj.cert;
    }
  }

  const privateKey = await importPEMPrivateKey(privateKeyPem);

  let publicKey;
  if (certificate) {
    const publicKeyPem = forge.pki.publicKeyToPem(certificate.publicKey);
    publicKey = await importPEMPublicKey(publicKeyPem);
  }

  return {
    privateKey,
    publicKey
  };
}

async function importPEMPrivateKey(pemKey) {
  const keyData = pemToBinary(pemKey);

  return await cryptoModule.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'RSA-PSS',
      hash: 'SHA-256'
    },
    true,
    ['sign']
  );
}

async function importPEMPublicKey(pemKey) {
  const keyData = pemToBinary(pemKey);
  return await cryptoModule.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-PSS',
      hash: 'SHA-256'
    },
    true,
    ['verify']
  );
}

function pemToBinary(pem) {
  const base64 = pem
    .replace(/-----BEGIN.*-----/g, '')
    .replace(/-----END.*-----/g, '')
    .replace(/\s/g, '');

  const buffer = Buffer.from(base64, 'base64');
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

module.exports = { extractKeysFromP12 };
