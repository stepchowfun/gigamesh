import React from 'react';
import { Response } from 'express';
import { BootstrapData, Main } from 'frontend-lib';
import { minify } from 'html-minifier';
import { readFileSync } from 'fs';
import { ServerStyleSheet } from 'styled-components';
import { renderToString } from 'react-dom/server';

// eslint-disable-next-line no-undef
interface Global extends NodeJS.Global {
  // See the following pages for an explanation of this magic variable:
  // - https://webpack.js.org/guides/csp/
  // - https://github.com/styled-components/styled-components/issues/887
  // eslint-disable-next-line camelcase
  __webpack_nonce__: string;
}

declare const global: Global;

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

// Render HTML to a given response object based on the given bootstrap data.
export default function renderPage(
  response: Response,
  bootstrapData: BootstrapData,
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
      .status(bootstrapData.type === 'PageNotFound' ? 404 : 200)
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
