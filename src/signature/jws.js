const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Load jsrsasign
const jsrsasignPath = path.resolve(__dirname, '../lib/jsrsasign-all-min.js');
const jsrsasignCode = fs.readFileSync(jsrsasignPath, 'utf8');

vm.runInThisContext(jsrsasignCode);

function jwsSign(payload, KID, privateKeyPEM, algo) {

const header = {     "alg": algo,    "kid": KID,    "crit": [        "iat"    ],    "iat": KJUR.jws.IntDate.get("now").toString()};
const jws = KJUR.jws.JWS.sign(null, header, payload, privateKeyPEM);
 var jwsParts = jws.split(".");
 var jwsHeaders = jwsParts[0];
 var jwsSignature = jwsParts[2];
 var detachedJWS = jwsHeaders + '..' + jwsSignature;

  return detachedJWS;
}

function jwsVerify(jws, expectedPayload, publicKeyPEM, algo) {
  const stringPyalod = JSON.stringify(expectedPayload);
const body =  Buffer.from(stringPyalod, 'binary').toString('base64');
 var jwsPayload = body.replace(/=+$/, '');
 var jwsParts = jws.split(".");
 var jwsHeaders = jwsParts[0];
 var jwsSignature = jwsParts[2];
 var jws = jwsHeaders + '.' + jwsPayload + '.' + jwsSignature;
 var isVerified = KJUR.jws.JWS.verify(jws, publicKeyPEM, [algo]);
  if (!isVerified) {
    return false;
}
return true;
}

module.exports = { jwsSign, jwsVerify };
