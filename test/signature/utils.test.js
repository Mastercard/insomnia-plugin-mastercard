const hasConfig = require("../../src/signature/utils").getRequestConfig;
const { expect } = require('chai');

describe('hasConfig', () => {
  const config = {
    paths: [
      { path: '^/api/v1/users$', value: 'userConfig' },
      { path: '^/api/v1/orders$', value: 'orderConfig' },
      { path: '^/api/v1', value: 'broadConfig' }
    ]
  };

  it('should return matching config for exact endpoint', () => {
    const result = hasConfig(config, '/api/v1/users');
    expect(result).to.deep.equal({ path: '^/api/v1/users$', value: 'userConfig' });
  });

  it('should return matching config ignoring query params', () => {
    const result = hasConfig(config, '/api/v1/orders?sort=desc');
    expect(result).to.deep.equal({ path: '^/api/v1/orders$', value: 'orderConfig' });
  });

  it('should return null for non-matching endpoint', () => {
    const result = hasConfig(config, '/api/products');
    expect(result).to.be.undefined;
  });

  it('should return null if config is null', () => {
    const result = hasConfig(null, '/api/v1/users');
    expect(result).to.be.null;
  });

  it('should return null if endpoint is null', () => {
    const result = hasConfig(config, null);
    expect(result).to.be.null;
  });

  it('should return null if both config and endpoint are null', () => {
    const result = hasConfig(null, null);
    expect(result).to.be.null;
  });

  it('should handle empty config.paths array', () => {
    const emptyConfig = { paths: [] };
    const result = hasConfig(emptyConfig, '/api/v1/users');
    expect(result).to.be.undefined;
  });

  it('should match multiple paths if regex is broad', () => {
    const result = hasConfig(config, '/api/v1/users');
    expect(result).to.deep.equal({ path: '^/api/v1/users$', value: 'userConfig' });
  });
});
