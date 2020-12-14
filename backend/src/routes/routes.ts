import { Application, NextFunction, Request, Response } from 'express';
import { BootstrapData, InviteRequest, InviteResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import invite from '../api/invite/invite';
import renderPage from '../page/page';

// Install the routes in an Express app.
export default function installRoutes(app: Application): void {
  // Set up the route for the home page.
  app.get('/', (request: Request, response: Response) => {
    const bootstrapData: BootstrapData = {
      type: 'NotLoggedIn',
    };

    renderPage(response, bootstrapData);
  });

  // The API endpoints
  app.post(
    '/api/invite',
    (request: Request, response: Response, next: NextFunction) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { body } = request;

      if (InviteRequest.guard(body)) {
        invite(body)
          .then((apiResponse: Static<typeof InviteResponse>) => {
            response.status(200).send(apiResponse);
          })
          .catch(next);
      } else {
        response.status(400).send('Bad Request');
      }
    },
  );
}
