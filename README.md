# insomnia-plugin-mastercard-auth

Mastercard API authentication plugin for Insomnia REST Client.

## Installation

Install the `insomnia-plugin-mastercard-auth` plugin from Preferences > Plugins.

## Usage

Add Mastercard API keys by setting a `mastercard` environment variable.

```json
{
	"mastercard": {
		"consumerKey": "[YOUR CONSUMER KEY]",
		"keyAlias": "[YOUR KEY ALIAS]",
		"keystoreP12Path": "[YOUR KEYSTORE .P12 PATH]",
		"keystorePassword": "[YOUR KEYSTORE PASSWORD]"
	}
}
```

## Testing

All tests exist in the `tests` directory.  Unit tests have the `-ut` suffix and integration tests have the `-it` suffix.

### Frameworks

- [Ava](https://github.com/avajs/ava) (Unit testing)
- [Selenium](https://www.seleniumhq.org/projects/webdriver/) (Integration testing)
