module.exports = {
  request: [
    require('./utils/validator').configValidator,
    require('./encryption/client-encryption').request,
    require('./auth/oauth'),
    require('./auth/oauth2')
  ],
  response: [
    require('./encryption/client-encryption').response
  ]
};
