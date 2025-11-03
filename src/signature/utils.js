module.exports.hasConfig = function(config, endpoint) {
  if (config && endpoint) {
    endpoint = endpoint.split("?").shift();
    const conf = config.paths.find((elem) => {
      const regex = new RegExp(elem.path, "g");
      return endpoint.match(regex);
    });
    return conf ? conf : null;
  }
  return null;
};
