module.exports = {
  request: [
    require('./utils/validator').configValidator,
    require('./encryption/client-encryption').request,
    require('./signature/jws-signature').request,
    require('./auth/oauth')
  ],
  response: [
    require('./signature/jws-signature').response,
    require('./encryption/client-encryption').response
  ]
};
