const { KJUR } = require("jsrsasign");

function jwsSign(payload, KID, privateKeyPEM, algo) {

  const header = { "alg": algo, "kid": KID, "crit": ["iat"], "iat": KJUR.jws.IntDate.get("now").toString() };
  const jws = KJUR.jws.JWS.sign(null, header, payload, privateKeyPEM);
  const jwsParts = jws.split(".");
  const jwsHeaders = jwsParts[0];
  const jwsSignature = jwsParts[2];
  return jwsHeaders + '..' + jwsSignature;
}

function jwsVerify(jws, expectedPayload, publicKeyPEM, signExpirationSeconds, signAlgorithmConstraints) {
  const stringPayload = JSON.stringify(expectedPayload);
  const jwsPayload = Buffer.from(stringPayload, 'utf-8').toString('base64url');
  const jwsParts = jws.split(".");
  if (jwsParts.length !== 3) {
    throw new Error('Invalid JWS header')
  }
  const jwsHeaders = jwsParts[0];
  const jwsSignature = jwsParts[2];
  const jwsSign = jwsHeaders + '.' + jwsPayload + '.' + jwsSignature;
  const jwsHeaderDecoded = Buffer.from(jwsHeaders, 'base64url').toString('utf-8');
  const { crit, iat, alg } = JSON.parse(jwsHeaderDecoded);
  const allowedAlgorithms = new Set(signAlgorithmConstraints);

  if(!allowedAlgorithms.has(alg)) {
    throw Error('Unsupported Signature verification algorithm');
  }

  // crit has exactly one element, and it must be "iat"
  if (!Array.isArray(crit) || crit.length !== 1 || crit[0] !== "iat") {
    throw new Error('Header crit of JWS Signature must contain only iat');
  }

  // ---- Validate `iat` presence and type ----
  if (iat === undefined || iat === null) {
    throw new Error('Missing header iat in JWS signature');
  }
  // Accept number or numeric string; reject non-finite values
  const iatNum = typeof iat === "number" ? iat : Number(iat);
  if (!Number.isInteger(iatNum)) {
    throw new Error('Header iat of JWS Signature must be a valid timestamp');
  }

  checkExpiredIat(iatNum, signExpirationSeconds);

  return KJUR.jws.JWS.verify(jwsSign, publicKeyPEM, [alg]);
}

function checkExpiredIat(iatNum, signExpirationSeconds){
  const iatMs = iatNum * 1000;
  const expiresAt = new Date(iatMs + signExpirationSeconds * 1000);
  const nowUtc = new Date();
  if (expiresAt < nowUtc) {
    throw new Error('The signature has expired');
  }
}

module.exports = { jwsSign, jwsVerify };
