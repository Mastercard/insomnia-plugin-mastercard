# Example Configurations

Example configurations for Insomnia. Make sure to remove the comments before using.

- [Authentication](#authentication)  
- [Mastercard Encryption](#mastercard-encryption)  
  * [Real world example](#mastercard-encryption-real-world-example)
- [JWE Encryption](#jwe-encryption)
  * [Real world example](#jwe-encryption-real-world-example)
- [Notes](#notes)

## Authentication

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

