import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { BootstrapData } from 'frontend-lib';
import { randomBytes } from 'crypto';

import installRoutes from '../routes/routes';
import logger from '../logger/logger';
import renderPage from '../page/page';
import { isProduction } from '../constants/constants';

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

// Populate the `cookies` field of incoming requests.
app.use(cookieParser());

// Serve static files.
app.use(
  express.static('static', {
    etag: false,
    index: false,
    lastModified: false,
    setHeaders: (response, path) => {
      if (path.includes('fingerprint')) {
        // Cache fingerprinted files for a week.
        response.set('Cache-Control', 'public, max-age=604800, immutable');
      } else {
        // Cache non-fingerprinted files for a day.
        response.set('Cache-Control', 'public, max-age=86400');
      }
    },
  }),
);

// Log incoming requests.
app.use((request: Request, response: Response, next: NextFunction) => {
  logger.info({ request });
  next();
});

// Don't compute ETags for dynamic responses since the CSP nonces would cause
// them to change on every request anyway.
app.set('etag', false);

// Set up the routes, excluding those for static files (configured above).
installRoutes(app);

// Render a 404 page when the URL doesn't match a route.
app.use((request: Request, response: Response) => {
  const bootstrapData: BootstrapData = {
    type: 'BootstrapPageNotFound',
  };

  renderPage(response, bootstrapData);
});

// Start the server.
app.listen(port, host, () => {
  if (isProduction) {
    logger.info('Running in production mode.');
  } else {
    logger.info('Not running in production mode.');
  }

  logger.info(`Server started on port ${port}.`);
});
