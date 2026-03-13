const MastercardContext = require('./mastercard-context');
const auth = require('./auth');
const { configValidator } = require('./utils/validator');

function createHook(hookFn) {
  return async (context) => {
    if (context.__validationFailed) return;
    return hookFn(new MastercardContext(context));
  };
}

module.exports = {
  request: [
    async (context) => {
      try {
        configValidator(new MastercardContext(context));
      } catch (e) {
        context.__validationFailed = true;
      }
    },
    createHook(require('./encryption/client-encryption').request),
    createHook(require('./signature/jws-signature').request),
    createHook(auth.request)
  ],
  response: [
    createHook(require('./signature/jws-signature').response),
    createHook(require('./encryption/client-encryption').response)
  ]
};
