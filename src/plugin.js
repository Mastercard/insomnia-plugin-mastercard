const MastercardContext = require('./mastercard-context');
const auth = require('./auth');
const { configValidator } = require('./utils/validator');

const validationFailed = new Set();

function createHook(hookFn) {
  return async (context) => {
    if (validationFailed.has(context.request.getId())) return;
    return hookFn(new MastercardContext(context));
  };
}

module.exports = {
  request: [
    async (context) => {
      const id = context.request.getId();
      validationFailed.delete(id);
      try {
        configValidator(new MastercardContext(context));
      } catch {
        validationFailed.add(id);
      }
    },
    createHook(require('./encryption/client-encryption').request),
    createHook(require('./signature/jws-signature').request),
    createHook(auth.request)
  ],
  response: [
    createHook(require('./signature/jws-signature').response),
    createHook(require('./encryption/client-encryption').response),
    async (context) => {
      validationFailed.delete(context.response.getRequestId()); // cleanup
    },
  ]
};
