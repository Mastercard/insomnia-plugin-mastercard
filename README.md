# insomnia-plugin-mastercard-auth

[![](https://img.shields.io/npm/v/insomnia-plugin-mastercard-auth.svg)](https://www.npmjs.com/package/insomnia-plugin-mastercard-auth)
[![](https://img.shields.io/badge/license-Apache%202.0-yellow.svg)](https://github.com/Mastercard/insomnia-plugin-mastercard-auth/blob/master/LICENSE)

## Table of Contents
- [Overview](#overview)
  * [Compatibility](#compatibility)
  * [References](#references)
- [Usage](#usage)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Configuration](#configuration)
  * [Authenticated Requests](#authenticated-requests)
- [Further Reading](#further-reading)

## Overview <a name="overview"></a>
A plugin for handling Mastercard API authentication. This plugin computes and adds an `Authorization` header to requests sent from [Insomnia REST Client](https://insomnia.rest/).

### Compatibility <a name="compatibility"></a>
Insomnia v5.15.0+

### References <a name="references"></a>
* [Using OAuth 1.0a to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/using-oauth-1a-to-access-mastercard-apis/)
* [A Mastercard Plugin for Insomnia REST Client](https://developer.mastercard.com/blog/a-mastercard-plugin-for-insomnia-rest-client)

## Usage <a name="usage"></a>

### Prerequisites <a name="prerequisites"></a>
Before using this library, you will need to set up a project in the [Mastercard Developers Portal](https://developer.mastercard.com). 

As part of this set up, you'll receive credentials for your app:
* A consumer key (displayed on the Mastercard Developer Portal)
* A private request signing key (matching the public certificate displayed on the Mastercard Developer Portal)

### Installation <a name="installation"></a>

#### From the Plugins Tab
1. Open Insomnia
2. Go to Application > Preferences > Plugins
3. Type "insomnia-plugin-mastercard-auth"
4. Click "Install Plugin"

![](https://user-images.githubusercontent.com/3964455/67882592-66a0cd00-fb3a-11e9-9e57-15736b605396.gif)

#### Manual Installation
1. Download "insomnia-plugin-mastercard-auth.zip" from [Releases > Assets](https://github.com/Mastercard/insomnia-plugin-mastercard-auth/releases)
2. Go to Application > Preferences > Plugins
3. Click "Show Plugins Folder"
4. Extract the zip from step 1 to the "plugins" folder
5. Click "Reload Plugin List"

![](https://user-images.githubusercontent.com/3964455/67882595-66a0cd00-fb3a-11e9-8909-f2188f9a94da.gif)

### Configuration <a name="configuration"></a>

Update your [environment](https://support.insomnia.rest/article/18-environment-variables):
1. Click "Manage Environments"
2. Create a "mastercard" environment variable with your credentials:

```json
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "/path/to/sandbox-signing-key.p12",
    "keystorePassword": "keystorepassword"
  }
}
```
![](https://user-images.githubusercontent.com/3964455/66712916-d32a7680-ed9b-11e9-934b-4aaddc418dff.gif)

### Authenticated Requests <a name="authenticated-requests"></a>
From now on, an `Authorization` header will be automatically added to every request sent to Mastercard:

![](https://user-images.githubusercontent.com/3964455/66712915-d32a7680-ed9b-11e9-8047-7571be2d3cd8.gif)

## Further Reading <a name="further-reading"></a>
* [Insomnia Plugins](https://support.insomnia.rest/article/26-plugins)
* [oauth1-signer-nodejs](https://github.com/Mastercard/oauth1-signer-nodejs) — A zero dependency library for generating a Mastercard API compliant OAuth signature
