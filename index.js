// Below snippet is from https://eslint.org/docs/rules/no-undef to ignore the undef error
/* global module require:true */
/* eslint no-undef: "error" */

module.exports.requestHooks = [
  require('./src/mastercard-auth')
];
