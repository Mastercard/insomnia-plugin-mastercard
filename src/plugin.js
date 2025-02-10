module.exports = {
  request: [
    require('./utils/validator').configValidator,
    require('./encryption/client-encryption').request,
    require('./auth/oauth')
  ],
  response: [
    require('./encryption/client-encryption').response
  ]
};
