import Main, { BootstrapData } from 'frontend-lib';
import React from 'react';
import compression from 'compression';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { ServerStyleSheet } from 'styled-components';
import { minify } from 'html-minifier';
import { readFileSync } from 'fs';
import { renderToNodeStream } from 'react-dom/server';

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
      </head>
      <body>
        <div id="root">${placeholder}</div>

        <script>
          window.bootstrapData = ${placeholder};
        </script>

        <script src="${javascriptFileName}"></script>
      </body>
    </html>
  `,
  { collapseWhitespace: true, minifyJS: true, removeComments: true },
).split(placeholder, 3);

// This function renders HTML to a given response object based on the given
// bootstrap data.
function renderPage(
  response: Response,
  bootstrapData: BootstrapData,
  statusCode: number,
  isPublic: boolean,
  maxAgeSeconds: number,
): void {
  response
    .status(statusCode)
    .set('Content-Type', 'text/html')
    .set(
      'Cache-Control',
      `${
        isPublic ? 'public' : 'private'
      }, max-age=${maxAgeSeconds}, must-revalidate`,
    )
    .write(htmlParts[0]);

  const sheet = new ServerStyleSheet();

  try {
    const jsx = sheet.collectStyles(<Main bootstrapData={bootstrapData} />);
    const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx));

    stream.pipe(response, { end: false });
    stream.on('end', () => {
      response.write(htmlParts[1]);
      response.write(JSON.stringify(bootstrapData));
      response.end(htmlParts[2]);
    });
  } finally {
    sheet.seal();
  }
}

// Construct the Express app.
const app = express();

// Use Helmet to configure various security-related headers.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        objectSrc: ["'none'"],
        requireTrustedTypesFor: ["'script'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'unsafe-inline'"],
      },
    },
  }),
);

// Enable gzip compression.
app.use(compression());

// Populate the `body` field of incoming requests.
app.use(express.json());

// Serve static files.
app.use(
  express.static('static', {
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

// Set up the route for the home page.
app.get('/', (request: Request, response: Response) => {
  const bootstrapData = Math.random();

  renderPage(response, bootstrapData, 200, true, 60 * 5);
});

// Set up the route for another page.
app.get('/:number', (request: Request, response: Response) => {
  // Warning: `request.params.number` has type `any`.
  const bootstrapDataExtended = Number(request.params.number);
  const bootstrapData = Number.isFinite(bootstrapDataExtended)
    ? bootstrapDataExtended
    : null;

  renderPage(
    response,
    bootstrapData,
    bootstrapData === null ? 404 : 200,
    true,
    bootstrapData === null ? 0 : 60 * 5,
  );
});

// Start the server.
app.listen(port, host, () => {
  // The server has started.
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${port}.`);
});
