# Installation

- If you want to use the public hosted version of Gigamesh, head on over to
  [gigamesh.io](https://www.gigamesh.io/).
- If you want to run and manage your own instance of Gigamesh, below are
  instructions for doing so with Google Cloud Platform. These instructions will
  assume you own a domain name that you want to use for the website (e.g.,
  `www.gigamesh.io`), as well as another domain or subdomain for the API service
  (e.g., `api.gigamesh.io`).

  - Install the [Google Cloud SDK](https://cloud.google.com/sdk/install) and run
    `gcloud init` to configure and authorize the SDK tools.
  - Create a project.

    ```sh
    GCP_PROJECT_ID=gigamesh # A unique project ID
    gcloud projects create "$GCP_PROJECT_ID"
    ```

  - Link the project to a billing account in the
    [Cloud Console](https://console.cloud.google.com/), creating one if needed.

  - Enable the necessary APIs.

    ```sh
    gcloud services enable --project "$GCP_PROJECT_ID" artifactregistry.googleapis.com
    gcloud services enable --project "$GCP_PROJECT_ID" cloudbuild.googleapis.com
    gcloud services enable --project "$GCP_PROJECT_ID" run.googleapis.com
    gcloud services enable --project "$GCP_PROJECT_ID" secretmanager.googleapis.com
    gcloud services enable --project "$GCP_PROJECT_ID" sqladmin.googleapis.com
    ```

  - Create a service account for production and for deployment.

    ```sh
    gcloud iam service-accounts create --project "$GCP_PROJECT_ID" production
    gcloud iam service-accounts create --project "$GCP_PROJECT_ID" deployer
    ```

  - Set up the database in [Cloud SQL](https://cloud.google.com/sql).

    - Provision up a PostgreSQL database instance. The cheapest way to do so is
      the following:

      ```sh
      MY_IP="$(dig +short myip.opendns.com @resolver1.opendns.com)" # Your IP address
      AUTHORIZED_NETWORKS="$MY_IP/32" # Allow yourself to connect to the database
      DATABASE_PASSWORD_ROOT=abc123 # A secure password for the default `postgres` user
      DATABASE_INSTANCE=gigamesh # A name for the database instance
      DATABASE_REGION=us-central # A Cloud SQL region

      gcloud sql instances create "$DATABASE_INSTANCE" \
        --project "$GCP_PROJECT_ID" \
        --database-version POSTGRES_13 \
        --tier db-f1-micro \
        --no-backup \
        --region "$DATABASE_REGION" \
        --assign-ip \
        --require-ssl \
        --authorized-networks "$AUTHORIZED_NETWORKS" \
        --root-password "$DATABASE_PASSWORD_ROOT"
      ```

      **Tip:** A good way to generate a password is:

      ```sh
      openssl rand -base64 32
      ```

      For production, you should consider configuring high availability,
      provisioning more CPU and memory, enabling backups, adding read replicas,
      etc.

      Generate a client certificate.

      ```sh
      CLIENT_CERTIFICATE_NAME=client-cert # A name for the client certificate

      gcloud sql ssl client-certs create "$CLIENT_CERTIFICATE_NAME" client-key.pem \
        --project "$GCP_PROJECT_ID" \
        --instance "$DATABASE_INSTANCE"
      ```

      Download the public key for that client certificate.

      ```sh
      gcloud sql ssl client-certs describe "$CLIENT_CERTIFICATE_NAME" \
        --project "$GCP_PROJECT_ID" \
        --instance "$DATABASE_INSTANCE" \
        --format 'value(cert)' \
        > client-cert.pem
      ```

      Download the server certificate.

      ```sh
      gcloud sql instances describe "$DATABASE_INSTANCE" \
        --project "$GCP_PROJECT_ID" \
        --format 'value(serverCaCert.cert)' \
        > server-ca.pem
      ```

    - Create the database.

      - Connect to the database instance using a command like the following:

        ```sh
        DATABASE_IP=123.123.123.123 # The IP address of your database instance

        psql "sslmode=verify-ca sslrootcert=server-ca.pem sslcert=client-cert.pem sslkey=client-key.pem hostaddr=$DATABASE_IP port=5432 user=postgres"
        ```

      - Log in using the password you created for the `postgres` user above.
      - Create the database.

        ```sql
        CREATE DATABASE gigamesh_production;
        ```

    - Create the tables.

      - Connect to the database instance again, but this time with the newly
        created `gigamesh_production` database.

        ```sh
        psql "sslmode=verify-ca sslrootcert=server-ca.pem sslcert=client-cert.pem sslkey=client-key.pem hostaddr=$DATABASE_IP port=5432 user=postgres dbname=gigamesh_production"
        ```

      - Log in using the password you created for the `postgres` user above.
      - Install the `pgcrypto` extension for UUID support.

        ```sql
        CREATE EXTENSION pgcrypto;
        ```

        Keep the database connection open for the next step.

      - Enter the following:

        ```sql
        CREATE TABLE previous_user_email (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          email TEXT NOT NULL,
          normalized_email TEXT NOT NULL,
          previous_user_email_id UUID
            REFERENCES "previous_user_email" ON DELETE RESTRICT
        );

        CREATE INDEX ON previous_user_email (normalized_email);

        CREATE TABLE "user" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          email TEXT,
          normalized_email TEXT UNIQUE,
          previous_user_email_id UUID
            REFERENCES "previous_user_email" ON DELETE RESTRICT,
          deleted BOOLEAN NOT NULL DEFAULT false,

          CHECK (
            (
              NOT deleted AND
              email IS NOT NULL AND
              normalized_email IS NOT NULL
            ) OR (
              deleted AND
              email IS NULL AND
              normalized_email IS NULL AND
              previous_user_email_id IS NOT NULL
            )
          )
        );

        CREATE TABLE signup_proposal (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Secret
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          email TEXT NOT NULL
        );

        CREATE TABLE login_proposal (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Secret
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id UUID NOT NULL REFERENCES "user" ON DELETE RESTRICT
        );

        CREATE INDEX ON login_proposal (user_id);

        CREATE TABLE session (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Secret
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          refreshed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id UUID NOT NULL REFERENCES "user" ON DELETE RESTRICT,

          CHECK (refreshed_at >= created_at)
        );

        CREATE INDEX ON session (user_id);

        CREATE TABLE email_change_proposal (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Secret
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id UUID NOT NULL REFERENCES "user" ON DELETE RESTRICT,
          new_email TEXT NOT NULL
        );

        CREATE INDEX ON email_change_proposal (user_id);
        ```

        Keep the database connection open for the next step.

    - The default `postgres` user is too powerful. Create a more restricted user
      for the API service and grant them access to the tables created above.

      ```sql
      -- Create the user.
      CREATE USER production LOGIN;

      -- Create a password for the user. This will prompt you for it interactively.
      \password production;

      -- Grant privileges to the user.
      GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES on "user" TO production;
      GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES on previous_user_email TO production;
      GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES on signup_proposal TO production;
      GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES on login_proposal TO production;
      GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES on session TO production;
      GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES on email_change_proposal TO production;
      ```

      Store the password in
      [Secret Manager](https://cloud.google.com/secret-manager) as follows:

      ```sh
      echo -n 'THE_PASSWORD' | gcloud secrets create postgres-production \
        --project "$GCP_PROJECT_ID" \
        --replication-policy automatic \
        --data-file -
      ```

    - For development purposes, create a copy of the database and API user. You
      may create a new Cloud SQL instance (possibly in an entirely different GCP
      project) for this, or you may decide to reuse the same instance depending
      on your budget and isolation requirements.

      ```sql
      CREATE DATABASE gigamesh_development;
      ```

      Connect to the newly created database.

      ```sh
      psql "sslmode=verify-ca sslrootcert=server-ca.pem sslcert=client-cert.pem sslkey=client-key.pem hostaddr=$DATABASE_IP port=5432 user=postgres dbname=gigamesh_development"
      ```

      Continue setting up the database and API user.

      ```sql
      CREATE EXTENSION pgcrypto;

      CREATE TABLE ...;
      ...

      CREATE INDEX ...;
      ...

      CREATE USER development LOGIN;

      \password development;

      GRANT ... TO development;
      ...
      ```

      Keep the password for the `development` user for your development machine.

    - Grant the appropriate permissions to the production service account.

      ```sh
      # Give the service account access to the PostgreSQL password.
      gcloud secrets add-iam-policy-binding postgres-production \
        --project "$GCP_PROJECT_ID" \
        --member "serviceAccount:production@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/secretmanager.secretAccessor

      # Give the service account permission to connect to the Cloud SQL instance.
      gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
        --member "serviceAccount:production@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/cloudsql.client
      ```

  - Set up [SendGrid](https://sendgrid.com/) for sending emails.

    - Create a [SendGrid](https://sendgrid.com/) account and follow SendGrid's
      instructions to configure the domain for sending emails. You may wish to
      configure the
      [Tracking Settings](https://app.sendgrid.com/settings/tracking) to suit
      your needs; the default configuration causes emails to be modified by
      SendGrid in some ways.
    - In the SendGrid UI, create an API key with full permissions; we'll refine
      them later. Store the key in Secret Manager as follows:

      ```sh
      SENDGRID_PRODUCTION_API_KEY=THE_API_KEY # Your API key

      echo -n "$SENDGRID_PRODUCTION_API_KEY" | gcloud secrets create sendgrid-production \
        --project "$GCP_PROJECT_ID" \
        --replication-policy automatic \
        --data-file -
      ```

      Configure SendGrid to require the recipient to support TLS. It's important
      that emails are encrypted because login tokens are delivered via email.

      ```sh
      curl --request PATCH \
        --url https://api.sendgrid.com/v3/user/settings/enforced_tls \
        --header "authorization: Bearer $SENDGRID_PRODUCTION_API_KEY" \
        --header 'content-type: application/json' \
        --data '{ "require_tls": true, "require_valid_cert": true }'
      ```

      In the SendGrid UI, remove all permissions from this API key except the
      ability to send mail.

      Create a second API key for development. Keep it for your development
      machine; it doesn't need to be stored in Secret Manager.

    - Grant the appropriate permissions to the production service account.

      ```sh
      # Give the service account access to the SendGrid API key.
      gcloud secrets add-iam-policy-binding sendgrid-production \
        --project "$GCP_PROJECT_ID" \
        --member "serviceAccount:production@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/secretmanager.secretAccessor
      ```

  - Perform the first deploy.

    - Clone this repository.

    - Install [Toast](https://github.com/stepchowfun/toast), our automation tool
      of choice.
    - Create a Docker repository in
      [Artifact Registry](https://cloud.google.com/artifact-registry).

      ```sh
      ARTIFACT_REGISTRY_LOCATION=us-central1 # The Artifact Registry location (not particularly important)

      gcloud beta artifacts repositories create gigamesh \
        --project "$GCP_PROJECT_ID" \
        --repository-format docker \
        --location "$ARTIFACT_REGISTRY_LOCATION"
      ```

      - Grant the appropriate permissions to the deployer service account.

        ```sh
        gcloud beta artifacts repositories add-iam-policy-binding gigamesh \
          --project "$GCP_PROJECT_ID" \
          --location "$ARTIFACT_REGISTRY_LOCATION" \
          --member "serviceAccount:deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
          --role roles/artifactregistry.repoAdmin
        ```

    - Create a [Cloud Storage](https://cloud.google.com/storage) bucket that
      will assist in the deploy process.

      ```sh
      GCS_LOCATION=us # A Cloud Storage location
      STAGING_BUCKET=gigamesh-staging # Any unique Cloud Storage bucket name

      gsutil mb \
        -p "$GCP_PROJECT_ID" \
        -b on \
        -c standard \
        -l "$GCS_LOCATION" \
        "gs://$STAGING_BUCKET"
      ```

    - Grant additional permissions to the deployer service account.

      ```sh
      # Give the service account permission to create Cloud Run services.
      # This is only needed for the first deploy and will be removed in a later step.
      gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
        --member "serviceAccount:deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/run.admin

      # Give the service account permission to access the staging bucket.
      gsutil iam ch \
        "serviceAccount:deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com:roles/storage.admin" \
        "gs://$STAGING_BUCKET"

      # Give the service account permission to create builds.
      gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
        --member "serviceAccount:deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/cloudbuild.builds.editor

      # Give the service account permission to impersonate the other service
      # account for the API Service. This is needed to deploy the service.
      gcloud iam service-accounts add-iam-policy-binding \
        production@${GCP_PROJECT_ID}.iam.gserviceaccount.com \
        --project "$GCP_PROJECT_ID" \
        --member "serviceAccount:deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/iam.serviceAccountUser

      # Create and download a service account key.
      gcloud iam service-accounts keys create deployer-credentials.json \
        --project "$GCP_PROJECT_ID" \
        --iam-account "deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
      ```

    - Run the following to build and deploy the service:

      ```sh
      export DATABASE_INSTANCE_CONNECTION_NAME=gigamesh:us-central1:gigamesh # Database connection info
      export ARTIFACT_REGISTRY_LOCATION=us-central1 # The Artifact Registry location
      export GCP_DEPLOY_CREDENTIALS="$(cat deploy-credentials.json)" # Credentials for the deployment service account
      export GCP_PROJECT_ID=gigamesh # Your Google Cloud Platform project ID
      export CLOUD_RUN_REGION=us-central1 # A Cloud Run region close to your users
      export CLOUD_RUN_SERVICE_ACCOUNT=production@gigamesh.iam.gserviceaccount.com # The API service account
      export STAGING_BUCKET=gigamesh-staging # A bucket we created earlier

      toast deploy
      ```

    - Add the service account as a member on the newly deployed
      [Cloud Run](https://cloud.google.com/run) service with the
      `Cloud Run Admin` role and remove the corresponding policy from the
      project.

      ```sh
      # Give the service account permission to update the service.
      gcloud run services add-iam-policy-binding www \
        --project "$GCP_PROJECT_ID" \
        --member "serviceAccount:deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/run.admin \
        --platform managed \
        --region "$CLOUD_RUN_REGION"

      # Revoke the permission to create new Cloud Run services.
      gcloud projects remove-iam-policy-binding "$GCP_PROJECT_ID" \
        --member "serviceAccount:deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
        --role roles/run.admin
      ```

    - Set up the load balancers.

      - Reserve IP addresses for the load balancers. If you want to serve the
        website on a subdomain (e.g., `www.gigamesh.io`) and also redirect the
        apex domain (e.g., `gigamesh.io`) to that subdomain, you'll need two IP
        addresses.

        ```sh
        # Reserve an IP address for `www.gigamesh.io`.
        gcloud compute addresses create www \
          --project "$GCP_PROJECT_ID" \
          --global

        # Reserve an IP address for `gigamesh.io`.
        gcloud compute addresses create apex \
          --project "$GCP_PROJECT_ID" \
          --global
        ```

        You should create the corresponding A records in your DNS configuration.
        To get the actual IP addresses that were just reserved, use these
        commands:

        ```sh
        # Get the IP address for `www.gigamesh.io`.
        gcloud compute addresses describe www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --format 'get(address)'

        # Get the IP address for `gigamesh.io`.
        gcloud compute addresses describe apex \
          --project "$GCP_PROJECT_ID" \
          --global \
          --format 'get(address)'
        ```

      - Create a TLS certificate. If you want to serve the website on a
        subdomain (e.g., `www.gigamesh.io`) and also redirect the apex domain
        (e.g., `gigamesh.io`) to that subdomain, be sure to include both domains
        in this command.

        ```sh
        gcloud compute ssl-certificates create www-apex \
          --project "$GCP_PROJECT_ID" \
          --global \
          --domains www.gigamesh.io,gigamesh.io
        ```

      - Set up the main [load balancer](https://cloud.google.com/load-balancing)
        for the website. This load balancer will be responsible for TLS
        termination and serving requests using the production bucket created in
        the previous step. For the public hosted version of Gigamesh, this is
        the load balancer that serves
        [https://www.gigamesh.io/](https://www.gigamesh.io/).

        ```sh
        # Create a network endpoint group (NEG).
        gcloud compute network-endpoint-groups create www \
          --project "$GCP_PROJECT_ID" \
          --region "$CLOUD_RUN_REGION" \
          --network-endpoint-type serverless \
          --cloud-run-service www

        # Create a backend service.
        gcloud compute backend-services create www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --enable-cdn

        # Add the NEG to the backend service.
        gcloud compute backend-services add-backend www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --network-endpoint-group www \
          --network-endpoint-group-region "$CLOUD_RUN_REGION"

        # Create a URL map.
        gcloud compute url-maps create www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --default-service www

        # Create a target proxy.
        gcloud compute target-https-proxies create www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --url-map www \
          --ssl-certificates www-apex

        # Create a forwarding rule.
        gcloud compute forwarding-rules create www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --address www \
          --target-https-proxy www \
          --ports 443
        ```

      - You probably want to redirect HTTP traffic to use the HTTPS protocol.
        You can do that with a second load balancer.

        ```sh
        # Create a URL map.
        gcloud compute url-maps import www-http-to-https \
          --project "$GCP_PROJECT_ID" \
          --global << EOF
        kind: compute#urlMap
        name: www-http-to-https
        defaultUrlRedirect:
           redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
           httpsRedirect: True
        EOF

        # Create a target proxy.
        gcloud compute target-http-proxies create www-http-to-https \
          --project "$GCP_PROJECT_ID" \
          --global \
          --url-map www-http-to-https

        # Create a forwarding rule.
        gcloud compute forwarding-rules create www-http-to-https \
          --project "$GCP_PROJECT_ID" \
          --global \
          --address www \
          --target-http-proxy www-http-to-https \
          --ports 80
        ```

      - If you are serving the website from a subdomain (e.g., `www`) rather
        than the apex domain, you probably want to redirect requests to the apex
        domain to the subdomain. You can do that with a third load balancer.

        ```sh
        # Create a URL map.
        gcloud compute url-maps import apex-to-www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --global << EOF
        kind: compute#urlMap
        name: apex-to-www
        defaultUrlRedirect:
          hostRedirect: www.gigamesh.io
          httpsRedirect: true
          redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
          stripQuery: false
        EOF

        # Create an HTTP target proxy.
        gcloud compute target-http-proxies create apex-to-www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --url-map apex-to-www

        # Create an HTTPS target proxy.
        gcloud compute target-https-proxies create apex-to-www \
          --project "$GCP_PROJECT_ID" \
          --global \
          --url-map apex-to-www \
          --ssl-certificates www-apex

        # Create a forwarding rule for HTTP traffic.
        gcloud compute forwarding-rules create apex-to-www-http \
          --project "$GCP_PROJECT_ID" \
          --global \
          --address apex \
          --target-http-proxy apex-to-www \
          --ports 80

        # Create a forwarding rule for HTTPS traffic.
        gcloud compute forwarding-rules create apex-to-www-https \
          --project "$GCP_PROJECT_ID" \
          --global \
          --address apex \
          --target-https-proxy apex-to-www \
          --ports 443
        ```

  - Set up continuous integration. This repository has a
    [GitHub action](https://github.com/stepchowfun/gigamesh/blob/main/.github/workflows/ci.yml)
    configured to build and deploy the service, with deploys only happening on
    the `main` branch. Follow the steps below to make this work.
    - Create a new Docker repository on [Docker Hub](https://hub.docker.com/).
      You'll need to create a Docker ID if you don't already have one.
    - Set up two secrets in the repository settings on GitHub.
      - `DOCKER_PASSWORD`: This is your Docker ID password. Toast will use it to
        cache intermediate Docker images when performing builds.
      - `GCP_DEPLOY_CREDENTIALS`: This should contain the contents of the
        credentials file for the deployment service account you created earlier.
    - Update the workflow in `.github/workflows/ci.yml`.
      - Change the `username` field of the Docker login action to match your
        Docker ID.
      - Change the `repo` field of both of the Toast actions to point to the
        Docker repository you just created.
      - Change the `env` field(s) of the second Toast action to set the correct
        environment variables for the deploy step (see the `toast deploy`
        command above).
