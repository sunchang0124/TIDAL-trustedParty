# generate-oidc-token

This small app generates a token which can be used to login to a Solid Pod.

You will be prompted for information about the app you want to get a token for, then redirected to a web page. After logging in to the web page your terminal console will show a snippet of JSON containing the token and other related data. This JSON can be used as the argument for a call to login().

## Usage

    npx @inrupt/generate-oidc-token
