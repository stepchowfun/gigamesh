# Gigamesh

[![Build status](https://github.com/stepchowfun/gigamesh/workflows/Continuous%20integration/badge.svg?branch=master)](https://github.com/stepchowfun/gigamesh/actions?query=branch%3Amaster)

_Gigamesh_ is a personal information manager.

## Installation

If you want to use the public hosted version of Gigamesh, head on over to [gigamesh.io](https://www.gigamesh.io/).

If you want to run and manage your own instance of Gigamesh, here are instructions for doing so with Google Cloud Platform:

- Sign into the Google Cloud Console and create a new project.
- Install the [Google Cloud SDK](https://cloud.google.com/sdk/install).
- Run `gcloud init` to configure and authorize Google Cloud SDK tools.
- Set up a Cloud Storage bucket for serving the website.

  ```sh
  export DOMAIN=www.gigamesh.io # Change this to your domain.
  gsutil mb -b on -c standard -l us-east1 "gs://$DOMAIN" # Feel free to change `us-east1` to something else.
  gsutil iam ch allUsers:objectViewer "gs://$DOMAIN"
  gsutil web set -m index.html "gs://$DOMAIN"
  ```

- Set up one or more load balancers. The number of load balancers you need depends on your domain and protocol. For example, the public hosted Gigamesh uses three load balancers: (1) the main one which serves `https://www.gigamesh.io`, (2) one to redirect `http://www.gigamesh.io` to `https://www.gigamesh.io`, and one to redirect `http(s)://gigamesh.io` to `https://www.gigamesh.io`. These instructions will assume you are following the same scheme.
  - You can create load balancers from the [Cloud Console](https://console.cloud.google.com/net-services/loadbalancing/list). All three load balancers will be HTTP(S) load balancers (as opposed to TCP load balancers or UDP load balancers).
  - Set up the main load balancer (1).
    - **Backend configuration:** Set up a backend bucket that points to the Cloud Storage bucket you created earlier. Enable Cloud CDN.
    - **Host and path rules:** Use the default settings.
    - **Frontend configuration:** Set the protocol to HTTPS, create a new static IP address, and create a single certificate configured for both the apex and the `www` subdomain.
  - Set up a load balancer (2) to redirect HTTP traffic to HTTPS.
    - **Backend configuration:** None.
    - **Host and path rules:** Use an "Advanced host and path rule", and choose "Redirect the client to a different host/path" with an empty "Host redirect" and "Prefix redirect". Set the response code to 301 and enable "HTTPS redirect".
    - **Frontend configuration:** Choose the IP address created for the previous load balancer (1).
  - Set up a load balancer (2) to redirect apex traffic to `www`.
    - **Backend configuration:** None.
    - **Host and path rules:** Use an "Advanced host and path rule", and choose "Redirect the client to a different host/path". Set the "Host redirect" to the appropriate domain and configure an empty "Prefix redirect". Set the response code to 301 and enable "HTTPS redirect".
    - **Frontend configuration:** We'll set up two rules, one for HTTP and one for HTTPS. Create a new static IP address (different from the one you created earlier) and use it for both. For the HTTPS rule, use the certificate you created above for the first load balancer (1).
- For the DNS configuration (e.g., in Google Domains): Create two A records, one for the root (`@`) and one for `www`. Use the appropriate IP addresses for the load balancers you created above.
- Clone this repository.
- Deploying manually:
  - Create a service account [here](https://console.cloud.google.com/apis/credentials/serviceaccountkey). Export the `GCP_CREDENTIALS` environment variable to the contents of the credentials file. Grant the `Cloud Functions Developer`, `Service Account User`, and `Storage Object Admin` roles.
  - Install [Toast](https://github.com/stepchowfun/toast), our automation tool of choice.
  - Once you have Toast installed, run `toast deploy` to build and deploy the service.
- Continuous integration: This repository has a [GitHub action](https://github.com/stepchowfun/gigamesh/blob/master/.github/workflows/ci.yml) configured to build and deploy the service, with deploys only happening on the `master` branch. Follow the steps below to make this work.
  - Create a new Docker repository on [Docker Hub](https://hub.docker.com/). You'll need to create a Docker ID if you don't already have one.
  - You'll need to change the `repo` field of the GitHub action in `.github/workflows/ci.yml` to point to the Docker repository you just created.
  - Set up two secrets in the repository settings on GitHub:
    - `DOCKER_PASSWORD`: This is your Docker ID password. Toast will use it to cache intermediate Docker images when performing builds.
    - `GCP_CREDENTIALS`: This should contain the contents of the credentials file for the GCP service account you created earlier. It's used to authorize the CI job to deploy the website.

## Contributing

For information about how to contribute to Gigamesh, see our [contributing guide](https://github.com/stepchowfun/gigamesh/blob/master/CONTRIBUTING.md). Please observe our [code of conduct](https://github.com/stepchowfun/gigamesh/blob/master/CODE_OF_CONDUCT.md).

## Licensing

- Gigamesh is released under the MIT license, which can be found [here](https://github.com/stepchowfun/gigamesh/blob/master/LICENSE.md).
- The Hind font was created by Indian Type Foundry. It was obtained from [here](https://www.fontsquirrel.com/fonts/hind), was converted to the WOFF 2 format using the [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator), and is used in compliance with the [SIL Open Font License](https://www.fontsquirrel.com/license/hind).
