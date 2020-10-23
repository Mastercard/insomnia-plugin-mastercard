# insomnia-plugin-mastercard-auth

[![](https://github.com/Mastercard/insomnia-plugin-mastercard-auth/workflows/broken%20links%3F/badge.svg)](https://github.com/Mastercard/insomnia-plugin-mastercard-auth/actions?query=workflow%3A%22broken+links%3F%22)
[![](https://img.shields.io/npm/v/insomnia-plugin-mastercard-auth.svg)](https://www.npmjs.com/package/insomnia-plugin-mastercard-auth)
[![](https://img.shields.io/badge/license-Apache%202.0-yellow.svg)](https://github.com/Mastercard/insomnia-plugin-mastercard-auth/blob/master/LICENSE)
[![](https://img.shields.io/badge/insomnia-workspace-purple.svg?color=6a57d5)](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard-auth/master/workspace/mastercard-apis-insomnia-workspace.json)

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
* [Using OAuth 1.0a to Access Mastercard APIs](https://developer.mastercard.com/platform/documentation/security-and-authentication/using-oauth-1a-to-access-mastercard-apis/)
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

#### One-Click Import
To import two ready to be used "sandbox" and "production" environments:
1. Click [![](https://img.shields.io/badge/insomnia-workspace-purple.svg?color=6a57d5)](https://insomnia.rest/run/?label=Import%20Mastercard%20Workspace&uri=https://raw.githubusercontent.com/Mastercard/insomnia-plugin-mastercard-auth/master/workspace/mastercard-apis-insomnia-workspace.json)
2. Click "Run Import Mastercard Workspace"

Alternatively, you can:
1. Go to Application > Preferences > Data
2. Click "Import Data"
3. Click "From URL"
4. Type "https://github.com/Mastercard/insomnia-plugin-mastercard-auth/releases/latest/download/mastercard-apis-insomnia-workspace.json"
5. Click "Fetch and Import"

![](https://user-images.githubusercontent.com/3964455/68041294-2d966300-fcc8-11e9-887a-cfadf183c4c1.gif)

#### Manual Configuration
Update your [environment](https://support.insomnia.rest/article/18-environment-variables):
1. Click "Manage Environments"
2. Create a "mastercard" environment variable with your credentials:

Linux/MacOS
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
Windows
```
{
  "mastercard": {
    "consumerKey": "000000000000000000000000000000000000000000000000!000000000000000000000000000000000000000000000000",
    "keyAlias": "keyalias",
    "keystoreP12Path": "C:\\path\\to\\keystore.p12",
    "keystorePassword": "keystorepassword"
  }
}
```


### Authenticated Requests <a name="authenticated-requests"></a>
From now on, an `Authorization` header will be automatically added to every request sent to Mastercard:

![](https://user-images.githubusercontent.com/3964455/68042376-a72f5080-fcca-11e9-85d9-d60cdd2da920.gif)

## Further Reading <a name="further-reading"></a>
* [Insomnia Plugins](https://support.insomnia.rest/article/26-plugins)
* [oauth1-signer-nodejs](https://github.com/Mastercard/oauth1-signer-nodejs) — A zero dependency library for generating a Mastercard API compliant OAuth signature
