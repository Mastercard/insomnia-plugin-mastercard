const { KJUR } = require("jsrsasign");

function jwsSign(payload, KID, privateKeyPEM, algo) {

const header = {     "alg": algo,    "kid": KID,    "crit": [        "iat"    ],    "iat": KJUR.jws.IntDate.get("now").toString()};
const jws = KJUR.jws.JWS.sign(null, header, payload, privateKeyPEM);
 const jwsParts = jws.split(".");
 const jwsHeaders = jwsParts[0];
 const jwsSignature = jwsParts[2];
 const detachedJWS = jwsHeaders + '..' + jwsSignature;

  return detachedJWS;
}

function jwsVerify(jws, expectedPayload, publicKeyPEM, algo) {
  const stringPyalod = JSON.stringify(expectedPayload);
const body =  Buffer.from(stringPyalod, 'binary').toString('base64');
 const jwsPayload =  body.split('=')[0];
 const jwsParts = jws.split(".");
 const jwsHeaders = jwsParts[0];
 const jwsSignature = jwsParts[2];
 const jwsSign = jwsHeaders + '.' + jwsPayload + '.' + jwsSignature;
 const isVerified = KJUR.jws.JWS.verify(jwsSign, publicKeyPEM, [algo]);
return isVerified;
}

module.exports = { jwsSign, jwsVerify };
