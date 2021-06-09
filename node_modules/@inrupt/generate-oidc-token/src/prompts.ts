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

import {
  IDENTITY_PROVIDER_INRUPT_PROD_COMPAT,
  IDENTITY_PROVIDER_INRUPT_PROD,
} from "./constants";
import inquirer from "inquirer";

const PROMPT_IDP_LIST = {
  type: "list",
  message: "What Solid Identity Provider do you want to log in to?",
  name: "identityProvider",
  choices: [
    { name: IDENTITY_PROVIDER_INRUPT_PROD },
    { name: IDENTITY_PROVIDER_INRUPT_PROD_COMPAT },
    {
      name:
        "My Solid Identity provider is not on the list - please contact 'developer-support@inrupt.com' if you'd like to discuss adding a new provider.",
      value: undefined,
    },
  ],
};

const PROMPT_IDP_CUSTOM_INPUT = {
  type: "input",
  message:
    "What is the URL of the Solid Identity Provider you wish to log in to?",
  name: "solidIdentityProvider",
  default: "",
};

export async function promptSolidIdentityProvider(): Promise<string> {
  let { identityProvider: solidIdentityProvider } = await inquirer.prompt([
    PROMPT_IDP_LIST,
  ]);
  if (solidIdentityProvider === undefined) {
    solidIdentityProvider = (await inquirer.prompt([PROMPT_IDP_CUSTOM_INPUT]))
      .solidIdentityProvider;
  }
  return solidIdentityProvider;
}

const PROMPT_REGISTRATION_TYPE = {
  type: "list",
  message:
    "Has your app been pre-registered by the administrator of the Pod server you are signing in to?",
  name: "registrationType",
  choices: [
    {
      name: "No.",
      value: "dynamic",
    },
    {
      name: "Yes, and I have received a client ID and client secret.",
      value: "static",
    },
  ],
  default: "dynamic",
};

export const promptRegistrationType = async () =>
  (await inquirer.prompt([PROMPT_REGISTRATION_TYPE])).registrationType;

const PROMPT_CLIENT_NAME = {
  type: "input",
  message: "What is the name of the application you are registering?",
  name: "clientName",
  default: undefined,
};

export const promptApplicationName = async () =>
  (await inquirer.prompt([PROMPT_CLIENT_NAME])).clientName;

const PROMPT_PORT = {
  type: "number",
  message:
    "@inrupt/generate-oidc-token will start a local web server, to which the Solid Identity Provider can redirect the user back after they log in. On what port do you want to run this server?",
  name: "port",
  default: 3001,
  validate: async (input: unknown) => {
    if (!input || (input as number) < 0 || (input as number) >= 65536) {
      return `The port must be a number between 0 and 65536, we received [${input}].`;
    }
    return true;
  },
};

export const promptPort = async () =>
  parseInt((await inquirer.prompt([PROMPT_PORT])).port);

const PROMPT_CLIENT_INFO = [
  {
    type: "input",
    message: "What is your registered client ID?",
    name: "clientId",
  },
  {
    type: "input",
    message: "What is your registered client secret?",
    name: "clientSecret",
  },
];
export const promptStaticClientInfo = async () =>
  inquirer.prompt(PROMPT_CLIENT_INFO);
