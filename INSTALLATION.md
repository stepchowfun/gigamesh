# Installation

- If you want to use the public hosted version of Gigamesh, head on over to [gigamesh.io](https://www.gigamesh.io/).
- If you want to run and manage your own instance of Gigamesh, below are instructions for doing so with Google Cloud Platform. These instructions will assume you own a domain name that you want to use for the website (e.g., `www.gigamesh.io`), as well as another domain or subdomain for the API (e.g., `api.gigamesh.io`).
  - Sign into the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
  - Install the [Google Cloud SDK](https://cloud.google.com/sdk/install) and run `gcloud init` to configure and authorize the SDK tools.
  - Set up the frontend.
    - Create a Cloud Storage bucket for serving the website and a separate staging bucket that will assist in the deploy process. You must be [authorized to use the domain](https://cloud.google.com/storage/docs/domain-name-verification#who-can-create) for this to succeed.

      ```sh
      export STAGING_BUCKET=gigamesh-staging # Change this to some unique name.
      export PRODUCTION_BUCKET=www.gigamesh.io # Change this to your domain.
      export GCP_PROJECT=gigamesh-293109 # Change this to your project ID.
      export GCS_LOCATION=us # Feel free to change this to a different location.

      # Staging bucket
      gsutil mb -p "$GCP_PROJECT" -b on -c standard -l "$GCS_LOCATION" "gs://$STAGING_BUCKET"

      # Production bucket
      gsutil mb -p "$GCP_PROJECT" -b on -c standard -l "$GCS_LOCATION" "gs://$PRODUCTION_BUCKET"
      gsutil web set -m index.html "gs://$PRODUCTION_BUCKET"
      gsutil iam ch allUsers:objectViewer "gs://$PRODUCTION_BUCKET"
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
        - **Host and path rules:** Use an "Advanced host and path rule", and choose "Redirect the client to a different host/path". Set the "Host redirect" to the appropriate domain (with `www`) and configure an empty "Prefix redirect". Set the response code to 301 and enable "HTTPS redirect".
        - **Frontend configuration:** We'll set up two rules, one for HTTP and one for HTTPS. Create a new static IP address (different from the one you created earlier) and use it for both. For the HTTPS rule, use the certificate you created above for the first load balancer (1).
    - For the DNS configuration (e.g., in Google Domains): Create two A records, one for the root (`@`) and one for `www`. Use the appropriate IP addresses for the load balancers you created above.
  - Set up the backend.
    - Enable the necessary APIs:

      ```sh
      gcloud services enable --project "$GCP_PROJECT" artifactregistry.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" cloudbuild.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" run.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" secretmanager.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" sqladmin.googleapis.com
      ```
    - Set up the database.
      - Provision up a PostgreSQL database instance via the [Cloud Console](https://console.cloud.google.com/sql/create-instance-postgres).
        - **Instance ID:** Use `gigamesh`.
        - **Default password:** Choose a secure password (or let the Cloud Console generate one for you). Store it in Secrets Manager as follows:

          ```sh
          echo -n 'THE SECRET' | gcloud secrets create postgres \
            --project "$GCP_PROJECT" \
            --replication-policy=automatic \
            --data-file=-
          ```
        - **Region:** Choose a region that corresponds to the location of the Cloud Storage bucket you created above.
        - **Zone:** `Any` is fine.
        - **Database version:** Use `PostgreSQL 12`.
      - Secure the database instance in the `Connections` pane for the instance.
        - Add an authorized network that you can access.
        - Create server and client certificates. Store the certificate files in a safe place.
        - Click the "Only allow SSL connections" button.
      - Initialize the database.
        - Connect to the database using a command like the following:

          ```sh
          psql 'sslmode=verify-ca sslrootcert=server-ca.pem sslcert=client-cert.pem sslkey=client-key.pem hostaddr=35.223.233.124 port=5432 user=postgres'
          ```
        - Log in using the password you created for the `postgres` user above.
        - Enter the following:

          ```sql
          CREATE DATABASE gigamesh;
          ```
    - Create a [SendGrid](https://sendgrid.com/) account and follow SendGrid's instructions to configure the domain for sending emails. Create an API key with the permission to send mail. Store the key in Secrets Manager as follows:

      ```sh
      echo -n 'THE SECRET' | gcloud secrets create sendgrid \
        --project "$GCP_PROJECT" \
        --replication-policy=automatic \
        --data-file=-
      ```
    - Create a service account [here](https://console.cloud.google.com/apis/credentials/serviceaccountkey) for the API. On the secrets created above, add the service account as a member with the `Secret Manager Secret Accessor` role. On the project, add the service account as a member with the `Cloud SQL Client` role.
  - Set up manual deployment.
    - Clone this repository.
    - Update the constants in [`constants.ts`](https://github.com/stepchowfun/gigamesh/blob/master/shared/src/constants/constants.ts) as appropriate.
    - Install [Toast](https://github.com/stepchowfun/toast), our automation tool of choice.
    - Create a Docker repository in Artifact Registry named `gigamesh`.
    - Create a service account [here](https://console.cloud.google.com/apis/credentials/serviceaccountkey) for deployment (e.g., to be used by the CI system). Store the credentials file for the next step.
      - On the project, add the service account as a member with the `Cloud Build Editor`, `Cloud Run Admin`, and `Storage Admin` roles.
      - On the Artifact Registry repository, add the service account as a member with the `Artifact Registry Repository Administrator` role.
      - On the API service account, add the deployment service account as a member with the `Service Account User` role.
    - Run the following command to build and deploy the service:

      ```sh
      export DATABASE_INSTANCE_CONNECTION_NAME=gigamesh-293109:us-central1:gigamesh
      export GAR_REGION=us-central1
      export GCP_DEPLOY_CREDENTIALS="$(cat credentials.json)"
      export GCP_PROJECT=gigamesh-293109
      export GCR_REGION=us-central1
      export GCR_SERVICE_ACCOUNT=gigamesh-api@gigamesh-293109.iam.gserviceaccount.com
      export PRODUCTION_BUCKET=www.gigamesh.io
      export STAGING_BUCKET=gigamesh-staging

      toast deploy
      ```

      You should modify the environment variables as appropriate.
    - In the Cloud Run UI in the Cloud Console, set up a domain mapping for the newly created API service. You'll need to update your DNS configuration accordingly.
  - Set up continuous integration. This repository has a [GitHub action](https://github.com/stepchowfun/gigamesh/blob/master/.github/workflows/ci.yml) configured to build and deploy the service, with deploys only happening on the `master` branch. Follow the steps below to make this work.
    - Create a new Docker repository on [Docker Hub](https://hub.docker.com/). You'll need to create a Docker ID if you don't already have one.
    - Update the workflow in `.github/workflows/ci.yml`:
      - Change the `username` field of the Docker login action to match your Docker ID.
      - Change the `repo` field(s) of both of the Toast actions to point to the Docker repository you just created.
      - Change the `env` field(s) of the second Toast action to set the correct environment variables for the deploy step (see the `toast deploy` command above).
    - Set up two secrets in the repository settings on GitHub:
      - `DOCKER_PASSWORD`: This is your Docker ID password. Toast will use it to cache intermediate Docker images when performing builds.
      - `GCP_DEPLOY_CREDENTIALS`: This should contain the contents of the credentials file for the deployment service account you created earlier. It's used to authorize the CI job to deploy the website.
