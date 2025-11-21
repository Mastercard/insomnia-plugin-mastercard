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
 const stringPayload = JSON.stringify(expectedPayload);
 const jwsPayload =  Buffer.from(stringPayload, 'binary').toString('base64url');
 const jwsParts = jws.split(".");
  if(jwsParts.length !== 3) {
      throw new Error('Invalid JWS header')
   }
 const jwsHeaders = jwsParts[0];
 const jwsSignature = jwsParts[2];
 const jwsSign = jwsHeaders + '.' + jwsPayload + '.' + jwsSignature;
 const isVerified = KJUR.jws.JWS.verify(jwsSign, publicKeyPEM, [algo]);
return isVerified;
}

module.exports = { jwsSign, jwsVerify };
