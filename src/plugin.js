module.exports = {
  request: [
    require('./encryption/client-encryption').request,
    require('./auth/oauth')
  ],
  response: [
    require('./encryption/client-encryption').response
  ]
};
