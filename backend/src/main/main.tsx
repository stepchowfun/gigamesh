import Main, { BootstrapData } from 'frontend-lib';
import React from 'react';
import compression from 'compression';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { ServerStyleSheet } from 'styled-components';
import { minify } from 'html-minifier';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { renderToString } from 'react-dom/server';

import logger from '../logger/logger';

// eslint-disable-next-line no-undef
interface Global extends NodeJS.Global {
  // See the following pages for an explanation of this magic variable:
  // - https://webpack.js.org/guides/csp/
  // - https://github.com/styled-components/styled-components/issues/887
  // eslint-disable-next-line camelcase
  __webpack_nonce__: string;
}

declare const global: Global;

// Read the `HOST` environment variable.
const hostRaw = process.env.HOST;
let host: string;
if (hostRaw === undefined) {
  throw new Error('Please set the `HOST` environment variable.');
} else {
  host = hostRaw;
}

// Read the `PORT` environment variable.
const portRaw = process.env.PORT;
let port: number;
if (portRaw === undefined) {
  throw new Error('Please set the `PORT` environment variable.');
} else {
  port = parseInt(portRaw, 10);
}

// Read the manifest to determine the name of the fingerprinted JavaScript
// file.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const manifest: { 'main.js': string } = JSON.parse(
  readFileSync('static/manifest.json', 'utf8'),
);
const javascriptFileName = manifest['main.js'];

// Pre-compute the static part of the HTML.
const placeholder = 'PLACEHOLDER';
const htmlParts = minify(
  `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Gigamesh</title>
        <meta name="description" content="A home for all your notes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="apple-mobile-web-app-title" content="Gigamesh" />
        <meta name="application-name" content="Gigamesh" />
        <meta name="msapplication-TileColor" content="#ffc40d" />
        <meta name="theme-color" content="#ffffff" />

        ${placeholder}
      </head>
      <body>
        <div id="root">${placeholder}</div>

        <script nonce="${placeholder}">
          window.bootstrapData = ${placeholder}; <!-- [tag:window_bootstrap_data] -->
          window.nonce = ${placeholder}; <!-- [tag:window_nonce] -->
        </script>

        <script nonce="${placeholder}" src="${javascriptFileName}"></script>
      </body>
    </html>
  `,
  { collapseWhitespace: true, minifyJS: true, removeComments: true },
).split(placeholder);

// This function renders HTML to a given response object based on the given
// bootstrap data.
function renderPage(
  response: Response,
  bootstrapData: BootstrapData,
  statusCode: number,
): void {
  const sheet = new ServerStyleSheet();

  try {
    const nonce = response.locals.nonce as string;

    // eslint-disable-next-line no-underscore-dangle
    global.__webpack_nonce__ = nonce;

    const html = renderToString(
      sheet.collectStyles(<Main bootstrapData={bootstrapData} />),
    );

    const styles = sheet.getStyleTags();

    response
      .status(statusCode)
      .set({ 'Cache-Control': 'no-store' })
      .send(
        `${htmlParts[0]}${styles}${htmlParts[1]}${html}${htmlParts[2]}${nonce}${
          htmlParts[3]
        }${JSON.stringify(bootstrapData)}${htmlParts[4]}${JSON.stringify(
          nonce,
        )}${htmlParts[5]}${nonce}${htmlParts[6]}`,
      );
  } finally {
    sheet.seal();
  }
}

// Construct the Express app.
const app = express();

// Use Helmet to configure various security-related headers.
app.use((request, response, next) => {
  const nonce = randomBytes(16).toString('base64');
  response.locals.nonce = nonce;

  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        scriptSrc: [`'nonce-${nonce}'`],
        styleSrc: [`'nonce-${nonce}'`],
        objectSrc: ["'none'"],
        requireTrustedTypesFor: ["'script'"],
        blockAllMixedContent: [],
      },
    },
  })(request, response, next);
});

// Enable gzip compression.
app.use(compression());

// Populate the `body` field of incoming requests.
app.use(express.json());

// Serve static files.
app.use(
  express.static('static', {
    etag: false,
    index: false,
    lastModified: false,
    setHeaders: (response, path) => {
      if (path.includes('fingerprint')) {
        response.set('Cache-Control', 'public, max-age=604800, immutable');
      } else {
        response.set('Cache-Control', 'public, max-age=3600');
      }
    },
  }),
);

// Don't compute ETags for dynamic responses since the CSP nonces would cause
// them to change on every request anyway.
app.set('etag', false);

// Set up the route for the home page.
app.get('/', (request: Request, response: Response) => {
  logger.info({ request });

  const bootstrapData = Math.random();

  renderPage(response, bootstrapData, 200);
});

// Set up the route for another page.
app.get('/:number', (request: Request, response: Response) => {
  logger.info({ request });

  // Warning: `request.params.number` has type `any`.
  const requestNumber = Number(request.params.number);
  const bootstrapData = Number.isFinite(requestNumber) ? requestNumber : null;

  renderPage(response, bootstrapData, bootstrapData === null ? 404 : 200);
});

// Start the server.
app.listen(port, host, () => {
  // The server has started.
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${port}.`);
});
