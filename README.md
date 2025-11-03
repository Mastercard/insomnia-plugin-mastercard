# insomnia-plugin-mastercard 
[![](https://developer.mastercard.com/_/_/src/global/assets/svg/mcdev-logo-dark.svg)](https://developer.mastercard.com/)

[![](https://github.com/Mastercard/insomnia-plugin-mastercard/workflows/Sonar/badge.svg)](https://github.com/Mastercard/insomnia-plugin-mastercard/actions?query=workflow%3ASonar)
[![](https://github.com/Mastercard/insomnia-plugin-mastercard/workflows/broken%20links%3F/badge.svg)](https://github.com/Mastercard/insomnia-plugin-mastercard/actions?query=workflow%3A%22broken+links%3F%22)
[![](http://img.shields.io/npm/v/insomnia-plugin-mastercard.svg)](http://www.npmjs.com/package/insomnia-plugin-mastercard)
[![](https://img.shields.io/badge/license-Apache%202.0-yellow.svg)](https://github.com/Mastercard/insomnia-plugin-mastercard/blob/master/LICENSE)
[![](https://img.shields.io/badge/insomnia-install%20workspace-purple.svg?color=6a57d5)](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/master/workspace/mastercard-apis-insomnia-workspace.json)

## Table of Contents
- [Overview](#overview)
  * [Compatibility](#compatibility)
  * [References](#references)
- [Usage](#usage)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Configuration](#configuration)
  * [Authenticated Requests](#authenticated-requests)
  * [Encryption](#encryption)
- [Further Reading](#further-reading)

## Overview <a name="overview"></a>
A plugin for consuming Mastercard APIs with support for authentication and encryption. 
This plugin computes and adds an `Authorization` header to requests sent from [Insomnia REST Client](https://insomnia.rest/) 
and it can be configured to automatically encrypt request and/or decrypt response payloads.

### Compatibility <a name="compatibility"></a>
Insomnia v5.15.0+

### References <a name="references"></a>
* [Using OAuth 1.0a to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/security-and-authentication/using-oauth-1a-to-access-mastercard-apis/)
* [Securing Sensitive Data Using Payload Encryption](https://developer.mastercard.com/platform/documentation/security-and-authentication/securing-sensitive-data-using-payload-encryption/)
* [A Mastercard Plugin for Insomnia REST Client](https://developer.mastercard.com/blog/a-mastercard-plugin-for-insomnia-rest-client)

## Usage <a name="usage"></a>

### Prerequisites <a name="prerequisites"></a>
Before using this library, you will need to set up a project in the [Mastercard Developers Portal](https://developer.mastercard.com). 

As part of this set up, you'll receive credentials for your app:
* A consumer key (displayed on the Mastercard Developer Portal)
* A private request signing key (matching the public certificate displayed on the Mastercard Developer Portal)

### Installation <a name="installation"></a>

#### 1. One-Click Installation
1. Go to https://insomnia.rest/plugins/insomnia-plugin-mastercard
2. Click the "Install Plugin" button
3. Click "Open Insomnia" and "Install"

#### 2. Manual Installation
1. Download "insomnia-plugin-mastercard-{version}.zip" from [Releases > Assets](https://github.com/Mastercard/insomnia-plugin-mastercard/releases)
2. Go to Application > Preferences > Plugins
3. Click "Reveal Plugins Folder"
4. Extract the ZIP file from step 1 to the "plugins" folder
5. Click "Reload Plugins"

![](https://user-images.githubusercontent.com/3964455/67882595-66a0cd00-fb3a-11e9-8909-f2188f9a94da.gif)

### Configuration <a name="configuration"></a>

#### One-Click Import
To import two ready to be used "sandbox" and "production" environments:
1. Depending on your use case, click either of these:
   - No encryption: 
 [![](https://img.shields.io/badge/insomnia-install%20workspace-purple.svg?color=6a57d5)](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/master/workspace/mastercard-apis-insomnia-workspace.json) 

   - Mastercard Encryption: 
 [![](https://img.shields.io/badge/insomnia-install%20workspace-purple.svg?color=6a57d5)](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/master/workspace/mastercard-apis-with-mastercard-encryption-insomnia-workspace.json)  

   - JWE Encryption: 
 [![](https://img.shields.io/badge/insomnia-install%20workspace-purple.svg?color=6a57d5)](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/master/workspace/mastercard-apis-with-jwe-encryption-insomnia-workspace.json)  
2. Click "Run Import Mastercard Workspace"

Alternatively, you can:
1. Go to Application > Preferences > Data
2. Click "Import Data"
3. Click "From URL"
4. Input either of these depending on your use case:  
    - No encryption: https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/master/workspace/mastercard-apis-insomnia-workspace.json
    - Mastercard encryption: https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/master/workspace/mastercard-apis-with-mastercard-encryption-insomnia-workspace.json
    - JWE encryption: https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard/master/workspace/mastercard-apis-with-jwe-encryption-insomnia-workspace.json
5. Click "Fetch and Import"

![](https://user-images.githubusercontent.com/3964455/68041294-2d966300-fcc8-11e9-887a-cfadf183c4c1.gif)

#### Manual Configuration
Update your [environment](https://support.insomnia.rest/article/18-environment-variables):
1. Click "Manage Environments"
2. Create a "mastercard" environment variable with your credentials:

Linux/macOS
```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "/path/to/sandbox-signing-key.p12",
    "keystorePassword": "keystorepassword",
    "OauthDisabled": "false",
    "appliesTo": [
      "mastercard.com",
      "api.ethocaweb.com"
    ]
  }
}
```
Windows
```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "C:\\path\\to\\sandbox-signing-key.p12",
    "keystorePassword": "keystorepassword",
    "OauthDisabled": "false",
    "appliesTo": [
      "mastercard.com",
      "api.ethocaweb.com"
    ]
  }
}
```

The `OauthDisabled` parameter is optional within the configuration settings. By default, its value is implicitly set to false, indicating that OAuth-based authorization is enabled unless explicitly specified otherwise.
If the application do not require the use of an authorization header for secure access, this parameter must be explicitly set to true to disable OAuth functionality. In the absence of this parameter, the system assumes OAuth is enabled and proceeds accordingly.
### Authenticated Requests <a name="authenticated-requests"></a>
From now on, an `Authorization` header will be automatically added to every request sent to Mastercard:

![](https://user-images.githubusercontent.com/3964455/68042376-a72f5080-fcca-11e9-85d9-d60cdd2da920.gif)

### Encryption <a name="encryption"></a>
This plugin can take care of encrypting requests and/or decrypting response payloads. To enable encryption support, 
you need to configure in the environment the `encryptionConfig` property.    

Here's a quick example for Mastercard Encryption:  

```jsonc
{
  "mastercard": {
    
    // ... // 
    
    "encryptionConfig": {
      "paths": [
        {
          "path": "/tokenize",
          "toEncrypt": [
            {
              "element": "cardInfo.encryptedData",
              "obj": "cardInfo"
            },
            {
              "element": "fundingAccountInfo.encryptedPayload.encryptedData",
              "obj": "fundingAccountInfo.encryptedPayload"
            }
          ],
          "toDecrypt": [
            {
              "element": "tokenDetail",
              "obj": "tokenDetail.encryptedData"
            }
          ]
        }
      ],
      "oaepPaddingDigestAlgorithm": "SHA-512",
      "ivFieldName": "iv",
      "encryptedKeyFieldName": "encryptedKey",
      "encryptedValueFieldName": "encryptedData",
      "oaepHashingAlgorithmFieldName": "oaepHashingAlgorithm",
      "publicKeyFingerprintFieldName": "publicKeyFingerprint",
      "publicKeyFingerprintType": "certificate",
      "dataEncoding": "hex",
      "encryptionCertificate": "/path/to/the/encryption/certificate",
      "privateKey": "/path/to/private/key"
    }
  }
}
```
As an alternative to providing the `privateKey` in the `encryptionConfig`, you can configure the keystore along with alias and password as shown below:
```jsonc
{
  "mastercard": {
    "encryptionConfig": {

      // ... //

      "encryptionCertificate": "/path/to/the/encryption/certificate",
      "keyStore": "/path/to/the/keystore",
      "keyStoreAlias": "keystorealias",
      "keyStorePassword": "keystorepassword",
    }
  }
}
```
### SIGNATURE <a name="signature"></a>
This plugin can take care of generating jws signature creation and/or jws signature verification. To enable jws signing support,
you need to configure in the environment the `signatureConfig` property.

Here's a quick example for Mastercard Encryption:

```jsonc
{
  "mastercard": {
    
    // ... // 
    
    "signatureConfig": {
      "paths": [
        {
          "path": "/tokenize",
          "signatureGenerationEnabled": "true",
          "signatureVerificationEnabled": "true"
        }
      ],
     "signPrivateKey": "/path/to/private/key",
     "signKeyId": "signatureKID",
     "signVerificationCertificate": "/path/to/the/signing/certificate",
     "signAlgorithm": "RS256"
    }
  }
}
```


[See more examples here](docs/configuration-examples.md).

Both Mastercard encryption and JWE encryption are supported.   
For more details on the encryption configurations, checkout these links:  
 - [Mastercard Encryption](https://github.com/Mastercard/client-encryption-nodejs/blob/main/README.md#configuring-the-field-level-encryption)
 - [JWE Encryption](https://github.com/Mastercard/client-encryption-nodejs/blob/main/README.md#configuring-the-jwe-encryption)


## Further Reading <a name="further-reading"></a>

* [oauth1-signer-nodejs](https://github.com/Mastercard/oauth1-signer-nodejs) — A zero dependency library for generating a Mastercard API compliant OAuth signature
* [client-encryption-nodejs](https://github.com/Mastercard/client-encryption-nodejs) — Library for Mastercard API compliant payload encryption/decryption.
* [Insomnia Plugins](https://support.insomnia.rest/article/26-plugins)
* [The Insomnia Plugin Hub](https://insomnia.rest/plugins)
