# Example Configurations

Example configurations for Insomnia. Make sure to remove the comments before using.

- [Authentication](#authentication)
  * [OAuth 2.0](#oauth-20)
  * [OAuth 1.0a](#oauth-10a)
  * [Legacy OAuth 1.0a (deprecated)](#legacy-oauth-10a-deprecated)
- [Mastercard Encryption](#mastercard-encryption)
  * [Real world example](#mastercard-encryption-real-world-example)
- [JWE Encryption](#jwe-encryption)
  * [Real world example](#jwe-encryption-real-world-example)
- [Notes](#notes)

## Authentication

The authentication mode is determined by which key is present in your `mastercard` config — `oAuth2`, `oAuth1`, or neither (legacy). Only one may be configured at a time. `oAuthDisabled` and `appliesTo` are always at the top `mastercard` level.

### OAuth 2.0

```json
{
  "mastercard": {
    "oAuth2": {
      "clientId": "KvoCuUOVXyL8Epl5UC...EOFMXd-3uq5lzWsns9d58add6",
      "kid": "c714fa1407134ac...388e4b597e0000000000000000",
      "keystoreP12Path": "/path/to/keystore.p12",
      "keyAlias": "keyalias",
      "keystorePassword": "keystorepassword",
      "tokenEndpoint": "https://api.mastercard.com/oauth/token",
      "issuer": "https://api.mastercard.com",
      "scopes": ["service:scope1", "service:scope2"]
    },
    
    // domains to which this config should be applied to
    "appliesTo": [
      "mastercard.com"
    ]
  }
}
```

### OAuth 1.0a

```json
{
  "mastercard": {
    "oAuth1": {
      "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
      "keyAlias": "keyalias",
      "keystoreP12Path": "/path/to/auth-keystore.p12",
      "keystorePassword": "keystorepassword"
    },

    // domains to which this config should be applied to
    "appliesTo": [
      "mastercard.com"
    ]
  }
}
```

### Legacy OAuth 1.0a (deprecated)

> **Deprecated.** Root-level OAuth 1.0a fields are still accepted for backwards compatibility but will be removed in a future release. Migrate to the `oAuth1` nested format shown above.

```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "/path/to/auth-keystore.p12",
    "keystorePassword": "keystorepassword",

    // domains to which this config should be applied to
    "appliesTo": [
      "mastercard.com"
    ]
  }
}
```

## Mastercard Encryption
```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "/path/to/auth-keystore.p12",
    "keystorePassword": "keystorepassword",

    // domains to which this config should be applied to.
    "appliesTo": [
      "mastercard.com"
    ],

    "encryptionConfig": {
      "paths": [
        {
          "path": "/*",
          "toEncrypt": [
            {
              // path to the element to be encrypted in request JSON.
              // use "$" for encrypting the whole request.
              "element": "path.to.element.to.be.encrypted",
              // path to object where encryption fields are to be stored in request JSON.
              // use "$" for the root of the JSON object.
              "obj": "path.to.encrypted.output.element"
            }
          ],
          "toDecrypt": [
            {
              // path to object with encryption fields in response JSON.
              // use "$" for the root of the JSON.
              "element": "path.to.element.to.be.decrypted", 

              // path to element where decrypted fields are to be stored in the response JSON.
              // use "$" for the root of the JSON object.
              "obj": "path.to.decryption.output"
            }
          ]
        }
      ],
      "oaepPaddingDigestAlgorithm": "SHA-256",
      "dataEncoding": "hex",  // "hex" or "base64"
      "ivFieldName": "iv",
      "encryptedKeyFieldName": "encryptedKey",
      "encryptedValueFieldName": "encryptedValue",
      "oaepHashingAlgorithmFieldName": "oaepHashingAlgorithm",
      "publicKeyFingerprintFieldName": "publicKeyFingerprint",
      "publicKeyFingerprintType": "certificate", // "certificate" or "publicKey"
      "publicKeyFingerprint": "0000000000000000000000000000000000000000000000000000000000000000",
      "encryptionCertificate": "/path/to/encryption-certificate.pem",
      "keyStore": "/path/to/decryption-keystore.p12",
      "keyStoreAlias": "decryption-keyalias",
      "keyStorePassword": "decryption-keystorepassword"
    }
  }
}
```
### Mastercard Encryption Real world example  

This is a real world example for an API which uses Mastercard Encryption.
```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "/path/to/auth-keystore.p12",
    "keystorePassword": "keystorepassword",
    "encryptionConfig": {
      "paths": [
        {
          "path": "$",
          "toEncrypt": [
            {
              "element": "$",
              "obj": "$"
            }
          ],
          "toDecrypt": [
            {
              "element": "$",
              "obj": "$"
            }
          ]
        }
      ],
      "oaepPaddingDigestAlgorithm": "SHA-256",
      "dataEncoding": "base64",
      "ivFieldName": "iv",
      "encryptedKeyFieldName": "encryptedKey",
      "encryptedValueFieldName": "encryptedValue",
      "oaepHashingAlgorithmFieldName": "oaepPaddingDigestAlgorithm",
      "publicKeyFingerprintFieldName": "publicKeyFingerprint",
      "publicKeyFingerprintType": "certificate",
      "publicKeyFingerprint": "0000000000000000000000000000000000000000000000000000000000000000",
      "encryptionCertificate": "/path/to/encryption-certificate.pem",
      "keyStore": "/path/to/decryption-keystore.p12",
      "keyStoreAlias": "decryption-keyalias",
      "keyStorePassword": "decryption-keystorepassword"
    }
  }
}
```

## JWE Encryption
```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "/path/to/auth-keystore.p12",
    "keystorePassword": "keystorepassword",

    // domains to which this config should be applied to.
    "appliesTo": [
      "mastercard.com"
    ],

    "encryptionConfig": {
      "paths": [
        {
          "path": "/*",
          "toEncrypt": [
            {
              // path to the element to be encrypted in request JSON.
              // use "$" for encrypting the whole request.
              "element": "path.to.element.to.be.encrypted",
              // path to object where encryption fields are to be stored in request JSON.
              // use "$ for the root of the JSON object.
              "obj": "path.to.encrypted.output.element"
            }
          ],
          "toDecrypt": [
            {
              // path to object with encryption fields in response JSON.
              // use "$ for the root of the JSON.
              "element": "path.to.element.to.be.decrypted", 

              // path to element where decrypted fields are to be stored in the response JSON.
              // use "$" for the root of the JSON object.
              "obj": "path.to.decryption.output"
            }
          ]
        }
      ],
      "mode": "JWE",
      "encryptedValueFieldName": "encryptedData",
      "encryptionCertificate": "/path/to/encryption-certificate.pem",
      "keyStore": "/path/to/decryption-keystore.p12",
      "keyStoreAlias": "decryption-keyalias",
      "keyStorePassword": "decryption-keystorepassword"
    }
  }
}
```

### JWE Encryption Real World Example
This is a real world example for an API which uses JWE Encryption.
```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "/path/to/auth-keystore.p12",
    "keystorePassword": "keystorepassword",
    "appliesTo": [
      "mastercard.com"
    ],
    "encryptionConfig": {
      "paths": [
        {
          "path": "/*",
          "toEncrypt": [
            {
              "element": "sensitiveData",
              "obj": "encryptedValue"
            }
          ],
          "toDecrypt": [
            {
              "element": "encryptedValue",
              "obj": "sensitiveData"
            }
          ]
        }
      ],
      "mode": "JWE",
      "encryptedValueFieldName": "encryptedValue",
      "encryptionCertificate": "/path/to/encryption-certificate.pem",
      "keyStore": "/path/to/decryption-keystore.p12",
      "keyStoreAlias": "keyalias",
      "keyStorePassword": "keystorepassword"
    }
  }
}
```

## Notes
Instead of providing the `keyStore`, `keyStoreAlias` and `keyStorePassword`,
```json
{
  "mastercard": {
    // ... //
    "encryptionConfig": {
      // ... //
      "encryptionCertificate": "/path/to/encryption-certificate.pem",
      "keyStore": "/path/to/decryption-keystore.p12",
      "keyStoreAlias": "decryption-keyalias",
      "keyStorePassword": "decryption-keystorepassword"
    }
  }
}
```
you can also directly provide the `privateKey` from the decryption key store:
```json
{
  "mastercard": {
    // ... //
    "encryptionConfig": {
      // ... //
      "encryptionCertificate": "/path/to/encryption-certificate.pem",
      "privateKey": "/path/to/private/key"
    }
  }
}
```

