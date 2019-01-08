const {buildQueryStringFromParams, joinUrlAndQueryString, smartEncodeUrl} = require('insomnia-url');
const MasterCardAPI = require('mastercard-api-core');
const url = require('url');

module.exports = function (context) {  
  //handling for comma values because the gateway expects it to be percent encoded
  context.request.getParameters().forEach( (entry) => {
    context.request.setParameter(entry.name, entry.value.replace(/,/g, "%25252C"));    
  });
  
  const qs = buildQueryStringFromParams(context.request.getParameters());
  const fullUrl = joinUrlAndQueryString(context.request.getUrl(), qs);
  const url = smartEncodeUrl(fullUrl, true);

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
