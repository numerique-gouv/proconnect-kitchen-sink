//
// Inspired by
// from https://github.com/panva/oauth4webapi/blob/v2.17.0/examples/public.ts
//

import * as oauth from "oauth4webapi";

// Prerequisites

let issuer = new URL("https://fca.integ01.dev-agentconnect.fr/api/v2"); // Authorization server's Issuer Identifier URL
let algorithm = "oidc" as const;
let client_id = "74b409f6-a364-4a9b-bd6f-42b549e99d72";

document.getElementById("login")?.addEventListener("click", login);

/**
 * Value used in the authorization request as redirect_uri pre-registered at the Authorization
 * Server.
 */
let redirect_uri!: string;

// End of prerequisites

const as = await oauth
  .discoveryRequest(issuer, { algorithm })
  .then((response) => oauth.processDiscoveryResponse(issuer, response));

const client: oauth.Client = {
  client_id,
  token_endpoint_auth_method: "none",
};

const code_challenge_method = "S256";
/**
 * The following MUST be generated for every redirect to the authorization_endpoint. You must store
 * the code_verifier and nonce in the end-user session such that it can be recovered as the user
 * gets redirected from the authorization server back to your application.
 */
const code_verifier = oauth.generateRandomCodeVerifier();
const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);
let state: string | undefined;

async function login() {
  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint!);
  authorizationUrl.searchParams.set("client_id", client.client_id);
  authorizationUrl.searchParams.set("redirect_uri", redirect_uri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "api:read");
  authorizationUrl.searchParams.set("code_challenge", code_challenge);
  authorizationUrl.searchParams.set(
    "code_challenge_method",
    code_challenge_method,
  );

  /**
   * We cannot be sure the AS supports PKCE so we're going to use state too. Use of PKCE is
   * backwards compatible even if the AS doesn't support it which is why we're using it regardless.
   */
  if (as.code_challenge_methods_supported?.includes("S256") !== true) {
    state = oauth.generateRandomState();
    authorizationUrl.searchParams.set("state", state);
  }

  // now redirect the user to authorizationUrl.href
  window.location.href = authorizationUrl.href;
}

// one eternity later, the user lands back on the redirect_uri
// Authorization Code Grant Request & Response
async function handle_authorization_code_grant_response() {
  let access_token: string;
  const currentUrl: URL = new URL(location.href);
  const params = oauth.validateAuthResponse(as, client, currentUrl, state);
  if (oauth.isOAuth2Error(params)) {
    console.error("Error Response", params);
    throw new Error(); // Handle OAuth 2.0 redirect error
  }

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    params,
    redirect_uri,
    code_verifier,
  );

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined;
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error("WWW-Authenticate Challenge", challenge);
    }
    throw new Error(); // Handle WWW-Authenticate Challenges as needed
  }

  const result = await oauth.processAuthorizationCodeOAuth2Response(
    as,
    client,
    response,
  );
  if (oauth.isOAuth2Error(result)) {
    console.error("Error Response", result);
    throw new Error(); // Handle OAuth 2.0 response body error
  }

  console.log("Access Token Response", result);
  ({ access_token } = result);
}

// Protected Resource Request
async function handle_protected_resource_request() {
  let access_token!: string;
  const response = await oauth.protectedResourceRequest(
    access_token,
    "GET",
    new URL("https://rs.example.com/api"),
  );

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined;
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error("WWW-Authenticate Challenge", challenge);
    }
    throw new Error(); // Handle WWW-Authenticate Challenges as needed
  }

  console.log("Protected Resource Response", await response.json());
}
