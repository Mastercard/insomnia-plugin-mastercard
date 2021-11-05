module.exports = {
  requestHooks: require('./src/plugin').request,
  responseHooks: require('./src/plugin').response
};
