const { KJUR } = require("jsrsasign");

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
 var jwsPayload =  body.split('=')[0];
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
