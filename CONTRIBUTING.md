# Contributing

Thank you for your interest in contributing to Gigamesh! You can contribute by
filing [issues](https://github.com/stepchowfun/gigamesh/issues) and submitting
[pull requests](https://github.com/stepchowfun/gigamesh/pulls). Please observe
our
[code of conduct](https://github.com/stepchowfun/gigamesh/blob/main/CODE_OF_CONDUCT.md).

If you submit a pull request, please ensure your change passes the
[GitHub Actions](https://github.com/stepchowfun/gigamesh/actions) CI checks.
This will be apparent from the required status check(s) in the pull request.

## Development

Here is how to run Gigamesh in development:

- Based on the installation instructions
  [here](https://github.com/stepchowfun/gigamesh/blob/main/INSTALLATION.md),
  create a Google Cloud Platform project, a PostgreSQL database instance within
  that project, a service account with permission to access that instance, and a
  SendGrid account.
- Install [Toast](https://github.com/stepchowfun/toast), our automation tool of
  choice.
- Once you have Toast installed, run `toast development` to start the
  development servers. Toast will inform you about which environment variables
  you need to set.
- With the previous command running, point your browser to
  [http://localhost:8080/](http://localhost:8080/).

Before committing any changes, run `toast check`. Formatting errors can be fixed
with `toast format`.

## Production

To run Gigamesh in production, follow the installation instructions
[here](https://github.com/stepchowfun/gigamesh/blob/main/INSTALLATION.md).

# Project organization

Gigamesh is composed of several packages:

- `frontend-lib`: A library that exports a React component for the frontend.
  This library also contains any assets needed by the frontend, such as images.
  Note that the bundle produced by this library does not include dependencies,
  since they are listed as `peerDependencies` (rather than `dependencies`) in
  its `package.json`. This is so for two reasons:
  - The `frontend` and `backend` packages (described below), which depend on
    this library, share some dependencies with this library (e.g., React). For
    obvious performance reasons, we don't want to accidentally ship multiple
    copies of such libraries to clients.
  - In some cases, it's important that the `frontend` and `backend` packages use
    the exact same copy of a dependency as `frontend-lib`. For example, both
    `frontend` and `backend` use React to render a component from
    `frontend-lib`, and a React component from one copy React cannot be rendered
    with another copy of React (due to some implementation details of React),
    even if both copies of React have the same version.
- `frontend`: A package that produces the final optimized JavaScript for
  distribution. This package contains logic for hydrating the page with
  `frontend-lib`.
- `backend`: A package for the server code, which includes logic for server-side
  rendering using `frontend-lib`. This package produces a bundle which includes
  the optimized `frontend` distribution as well as the additional assets (e.g.,
  images) from `frontend-lib`.
- A top-level `gigamesh` package which contains some helpful scripts for
  orchestrating builds as well as code formatting.

It's worth noting how we handle dependencies between these packages—in
particular, the dependency on `frontend-lib` from `frontend` and `backend`. The
most straightforward way to implement this would be to have `frontend` and
`backend` refer to `frontend-lib` directly:

```json
"dependencies": {
  "frontend-lib": "file:../frontend-lib",
}
```

However, this doesn't work because Webpack will bundle the dependencies in
`frontend-lib/node_modules` (if that directory exists), even though they are
redundant with the dependencies in `frontend/node_modules` and
`backend/node_modules`. This leads to the problems noted above.

A simple fix would be to delete `frontend-lib/node_modules` before every build
of `frontend` or `backend`, but that would be frustrating for local development.

Another approach would be to use `npm link`. But this has the same problem:
packages would be loaded from `frontend-lib/node_modules` (if that directory
exists).

A third approach would be to use `npm pack` to produce a tarball distribution
for `frontend-lib` which would not contain the dependencies, and then link to
that from `frontend` and `backend` as follows:

```json
"dependencies": {
  "frontend-lib": "file:../frontend-lib/frontend-lib-1.0.0.tgz",
}
```

However, this would require bumping the version every time a change is made to
`frontend-lib`, which would also be frustrating for local development.

The final solution we adopted is to produce a tarball with `npm pack`, but then
extract that tarball to a different location (`.build/frontend-lib`). That
effectively creates a copy of `frontend-lib` without its `node_modules`. We then
reference it from `backend` and `frontend` as follows:

```json
"dependencies": {
  "frontend-lib": "file:../.build/frontend-lib",
}
```

Note that having local dependencies like this results in symlinks in
`node_modules`, which can break the resolution of `peerDependencies` for various
tools without additional configuration. So we need to set
`resolve: { symlinks: false }` for Webpack, `preserveSymlinks: true` for
TypeScript, and `--preserve-symlinks` for Node.

# Dependency versions

In general, Gigamesh aims to use the latest versions of its dependencies. The
following exceptions apply:

- We are stuck one `styled-components` v5.2.0, because later versions have
  [this bug](https://github.com/styled-components/styled-components/issues/3571).
  When that bug is fixed, we should try upgrading.
