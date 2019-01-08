const {buildQueryStringFromParams, joinUrlAndQueryString, smartEncodeUrl} = require('insomnia-url');
const MasterCardAPI = require('mastercard-api-core');
const url = require('url');

module.exports.insomniaOAuth = function ( context ) {
  const qs = buildQueryStringFromParams( context.request.getParameters() );
  const fullUrl = joinUrlAndQueryString( context.request.getUrl(), qs );
  const encodedUrl = smartEncodeUrl( fullUrl, true );

  const mastercard = context.request.getEnvironmentVariable( 'mastercard' );
  if ( mastercard ) {
    try {
      const oauth = new MasterCardAPI.OAuth(
        mastercard.consumerKey,
        mastercard.keystoreP12Path,
        mastercard.keyAlias,
        mastercard.keystorePassword );
      const authHeader = oauth.sign(url.parse(encodedUrl), context.request.getMethod(), context.request.getBodyText());
      context.request.setHeader( 'Authorization', authHeader );
    } catch ( err ) {
      alert( err.message );
    }
  }
};
