const { Issuer } = require('openid-client');
const crypto     = require('crypto');

let uwIssuer = null;

async function init(config) {
  if (!uwIssuer) {
    await Issuer.discover(config.oidc.idpURL)
      .then((issuer) => {
        uwIssuer = issuer;
        console.log(`Discovered issuer ${uwIssuer.issuer}`);
        // console.log('Discovered issuer %s %O', uwIssuer.issuer, uwIssuer.metadata);
      });
  }

  const client = new uwIssuer.Client({
    client_id: config.oidc.clientID,
    client_secret: config.oidc.clientSecret,
    redirect_uris: [`${config.oidc.baseURL}/callback`],
    response_types: ['code']
  });

  // extra authorization request parameters go here
  const params = {
    scope: config.oidc.scope,
    // for CSRF protection
    state: crypto.randomBytes(64).toString('hex'),
    // binds the OIDC Id token to the users session
    nonce: crypto.randomBytes(64).toString('hex')
  };

  return {
    client,
    params,
    passReqToCallback: true
  };
}

module.exports.init = init;
