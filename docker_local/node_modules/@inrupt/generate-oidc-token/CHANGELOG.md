# Changelog

This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

The following changes have been implemented but not released yet:

## [Unreleased]

### Bugfix

- Redirect IRI normalization now uses the `URL` constructor instead of a basic concatenation.

The following sections document changes that have been released already:

## 0.1.0 - 2020-02-10

### New features

- The result is now displayed as a JSON snippet that may directly be pasted as the
  input of `@inrupt/solid-client-authn-node` `Session::login` function.

## 0.0.1 - 2020-12-18

### New features

- `@inrupt/generate-oidc-token` can now be used with `npx`.
- An interactive prompt helps the user provide the relevant options.
