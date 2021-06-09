/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// The only import we need from the Node AuthN library is the Session class.
import {
  Session,
  InMemoryStorage,
  ILoginInputOptions,
} from "@inrupt/solid-client-authn-node";
import express from "express";

import {
  promptApplicationName,
  promptSolidIdentityProvider,
  promptPort,
  promptRegistrationType,
  promptStaticClientInfo,
} from "./prompts";

type InputOptions = {
  solidIdentityProvider?: string;
  applicationName?: string;
  registrationType?: "static" | "dynamic";
};

type ValidatedOptions = {
  solidIdentityProvider: string;
  applicationName?: string;
  registrationType: "static" | "dynamic";
};

async function main(): Promise<void> {
  // Get CLI arguments
  const argv = require("yargs/yargs")(process.argv.slice(2))
    .describe(
      "solidIdentityProvider",
      "The identity provider at which the user should authenticate."
    )
    .alias("idp", "solidIdentityProvider")
    .describe(
      "applicationName",
      "The name of the client application you whish to register."
    )
    .describe(
      "registration",
      "[static] if you want to manually register the client, [dynamic] otherwise."
    )
    .describe(
      "port",
      "@inrupt/generate-oidc-token will start a local web server, in order for the Solid Identity Provider to redirect the user back after they log in. This  is the port number to which this local server will be bound."
    )
    .locale("en")
    .help().argv;

  const inputOptions: InputOptions = {
    ...argv,
    clientName: argv.applicationName,
  };
  // Complete CLI arguments with user prompt
  const validatedOptions: ValidatedOptions = {
    solidIdentityProvider:
      inputOptions.solidIdentityProvider ??
      (await promptSolidIdentityProvider()),
    registrationType:
      inputOptions.registrationType ?? (await promptRegistrationType()),
    applicationName:
      inputOptions.applicationName ?? (await promptApplicationName()),
  };
  const port = argv.port ?? (await promptPort());

  const app = express();
  const iriBase = `http://localhost:${port}`;
  const storage = new InMemoryStorage();

  const session: Session = new Session({
    insecureStorage: storage,
    secureStorage: storage,
  });

  const server = app.listen(port, async () => {
    console.log(`Listening at: [${iriBase}].`);
    const loginOptions: ILoginInputOptions = {
      clientName: validatedOptions.applicationName,
      oidcIssuer: validatedOptions.solidIdentityProvider,
      redirectUrl: iriBase,
      tokenType: "DPoP",
      handleRedirect: (url) => {
        console.log(`\nPlease visit ${url} in a web browser.\n`);
      },
    };
    let clientInfo;
    if (validatedOptions.registrationType === "static") {
      console.log(
        `An admin of the server should have registered your app with a redirect URL of [${iriBase}],`
      );
      console.log("and have provided you with a client ID and secret.");
      clientInfo = await promptStaticClientInfo();
      loginOptions.clientId = clientInfo.clientId;
      loginOptions.clientSecret = clientInfo.clientSecret;
    }

    console.log(
      `Logging in to Solid Identity Provider  ${validatedOptions.solidIdentityProvider} to get a refresh token.`
    );
    session.login(loginOptions).catch((e) => {
      throw new Error(
        `Logging in to Solid Identity Provider [${
          validatedOptions.solidIdentityProvider
        }] failed: ${e.toString()}`
      );
    });
  });

  app.get("/", async (_req, res) => {
    const redirectIri = new URL(_req.url, iriBase).href;
    console.log(
      `Login into the Identity Provider successful, receiving request to redirect IRI [${redirectIri}].`
    );
    await session.handleIncomingRedirect(redirectIri);
    // NB: This is a temporary approach, and we have work planned to properly
    // collect the token. Please note that the next line is not part of the public
    // API, and is therefore likely to break on non-major changes.
    const rawStoredSession = await storage.get(
      `solidClientAuthenticationUser:${session.info.sessionId}`
    );
    if (rawStoredSession === undefined) {
      throw new Error(
        `Cannot find session with ID [${session.info.sessionId}] in storage.`
      );
    }
    const storedSession = JSON.parse(rawStoredSession);
    console.log(`
These are your login credentials:
{
  "refreshToken" : "${storedSession.refreshToken}",
  "clientId"     : "${storedSession.clientId}",
  "clientSecret" : "${storedSession.clientSecret}",
  "oidcIssuer"   : "${storedSession.issuer}",
}
`);
    res.send(
      "The tokens have been sent to @inrupt/generate-oidc-token. You can close this window."
    );
    server.close();
  });
}

// Asynchronous operations are required to get user prompt, and top-level await
// are not supported yet, which is why an async main is used.
void main();
