# Installation

- If you want to use the public hosted version of Gigamesh, head on over to [gigamesh.io](https://www.gigamesh.io/).
- If you want to run and manage your own instance of Gigamesh, below are instructions for doing so with Google Cloud Platform. These instructions will assume you own a domain name that you want to use for the website (e.g., `www.gigamesh.io`), as well as another domain or subdomain for the API service (e.g., `api.gigamesh.io`).
  - Sign into the [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
  - Install the [Google Cloud SDK](https://cloud.google.com/sdk/install) and run `gcloud init` to configure and authorize the SDK tools.
  - Set up the frontend.
    - Create a [Cloud Storage](https://cloud.google.com/storage) bucket for serving the website from your domain and a separate staging bucket that will assist in the deploy process. You must be [authorized to use the domain](https://cloud.google.com/storage/docs/domain-name-verification#who-can-create) for this to succeed.

      ```sh
      GCP_PROJECT=gigamesh # Your Google Cloud Platform project ID
      GCS_LOCATION=us # A Cloud Storage location close to your users
      PRODUCTION_BUCKET=www.gigamesh.io # Your domain for the website
      STAGING_BUCKET=gigamesh-staging # Any unique Cloud Storage bucket name

      # Create the staging bucket.
      gsutil mb \
        -p "$GCP_PROJECT" \
        -b on \
        -c standard \
        -l "$GCS_LOCATION" \
        "gs://$STAGING_BUCKET"

      # Create the production bucket.
      gsutil mb \
        -p "$GCP_PROJECT" \
        -b on \
        -c standard \
        -l "$GCS_LOCATION" \
        "gs://$PRODUCTION_BUCKET"

      # Configure the production bucket for serving a public web site.
      gsutil web set -m index.html "gs://$PRODUCTION_BUCKET"
      gsutil iam ch allUsers:objectViewer "gs://$PRODUCTION_BUCKET"
      ```
    - Reserve IP addresses for the load balancers. If you want to serve the website on a subdomain (e.g., `www.gigamesh.io`) and also redirect the apex domain (e.g., `gigamesh.io`) to that subdomain, you'll need two IP addresses.

      ```sh
      # Reserve an IP address for `www.gigamesh.io`.
      gcloud compute addresses create gigamesh-www \
        --project "$GCP_PROJECT" \
        --global

      # Reserve an IP address for `gigamesh.io`.
      gcloud compute addresses create gigamesh-apex \
        --project "$GCP_PROJECT" \
        --global
      ```

      You should create the corresponding A records in your DNS configuration. To get the actual IP addresses that were just reserved, use these commands:

      ```sh
      # Get the IP address for `www.gigamesh.io`.
      gcloud compute addresses describe gigamesh-www \
        --project "$GCP_PROJECT" \
        --global \
        --format 'get(address)'

      # Get the IP address for `gigamesh.io`.
      gcloud compute addresses describe gigamesh-apex \
        --project "$GCP_PROJECT" \
        --global \
        --format 'get(address)'
      ```
    - Create a TLS certificate. If you want to serve the website on a subdomain (e.g., `www.gigamesh.io`) and also redirect the apex domain (e.g., `gigamesh.io`) to that subdomain, be sure to include both domains in this command.

      ```sh
      gcloud compute ssl-certificates create gigamesh-www \
        --project "$GCP_PROJECT" \
        --global \
        --domains www.gigamesh.io,gigamesh.io
      ```
    - Set up the main [load balancer](https://cloud.google.com/load-balancing) for the website. This load balancer will be responsible for TLS termination and serving requests using the production bucket created in the previous step. For the public hosted version of Gigamesh, this is the load balancer that serves [https://www.gigamesh.io/](https://www.gigamesh.io/).

      ```sh
      # Create a backend.
      gcloud compute backend-buckets create gigamesh-www \
        --project "$GCP_PROJECT" \
        --gcs-bucket-name "$PRODUCTION_BUCKET" \
        --enable-cdn

      # Create a URL map.
      gcloud compute url-maps create gigamesh-www \
        --project "$GCP_PROJECT" \
        --global \
        --default-backend-bucket gigamesh-www

      # Create a target proxy.
      gcloud compute target-https-proxies create gigamesh-www \
        --project "$GCP_PROJECT" \
        --global \
        --url-map gigamesh-www \
        --ssl-certificates gigamesh-www

      # Create a forwarding rule.
      gcloud compute forwarding-rules create gigamesh-www \
        --project "$GCP_PROJECT" \
        --global \
        --address gigamesh-www \
        --target-https-proxy gigamesh-www \
        --ports 443
      ```
    - You probably want to redirect HTTP traffic to use the HTTPS protocol. You can do that with a second load balancer.

      ```sh
      # Create a URL map.
      gcloud compute url-maps import gigamesh-www-http-to-https \
        --project "$GCP_PROJECT" \
        --global << EOF
      kind: compute#urlMap
      name: gigamesh-www-http-to-https
      defaultUrlRedirect:
         redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
         httpsRedirect: True
      EOF

      # Create a target proxy.
      gcloud compute target-http-proxies create gigamesh-www-http-to-https \
        --project "$GCP_PROJECT" \
        --global \
        --url-map gigamesh-www-http-to-https

      # Create a forwarding rule.
      gcloud compute forwarding-rules create gigamesh-www-http-to-https \
        --project "$GCP_PROJECT" \
        --global \
        --address gigamesh-www \
        --target-http-proxy gigamesh-www-http-to-https \
        --ports 80
      ```
    - If you are serving the website from a subdomain (e.g., `www`) rather than the apex domain, you probably want to redirect requests to the apex domain to the subdomain. You can do that with a third load balancer.

      ```sh
      # Create a URL map.
      gcloud compute url-maps import gigamesh-apex-to-www \
        --project "$GCP_PROJECT" \
        --global \
        --global << EOF
      kind: compute#urlMap
      name: gigamesh-apex-to-www
      defaultUrlRedirect:
        hostRedirect: www.gigamesh.io
        httpsRedirect: true
        redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
        stripQuery: false
      EOF

      # Create an HTTP target proxy.
      gcloud compute target-http-proxies create gigamesh-apex-to-www \
        --project "$GCP_PROJECT" \
        --global \
        --url-map gigamesh-apex-to-www

      # Create an HTTPS target proxy.
      gcloud compute target-https-proxies create gigamesh-apex-to-www \
        --project "$GCP_PROJECT" \
        --global \
        --url-map gigamesh-apex-to-www \
        --ssl-certificates gigamesh-www

      # Create a forwarding rule for HTTP traffic.
      gcloud compute forwarding-rules create gigamesh-apex-to-www-http \
        --project "$GCP_PROJECT" \
        --global \
        --address gigamesh-apex \
        --target-http-proxy gigamesh-apex-to-www \
        --ports 80

      # Create a forwarding rule for HTTPS traffic.
      gcloud compute forwarding-rules create gigamesh-apex-to-www-https \
        --project "$GCP_PROJECT" \
        --global \
        --address gigamesh-apex \
        --target-https-proxy gigamesh-apex-to-www \
        --ports 443
      ```
  - Set up the backend.
    - Enable the necessary APIs:

      ```sh
      gcloud services enable --project "$GCP_PROJECT" artifactregistry.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" cloudbuild.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" run.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" secretmanager.googleapis.com
      gcloud services enable --project "$GCP_PROJECT" sqladmin.googleapis.com
      ```
    - Set up the database in [Cloud SQL](https://cloud.google.com/sql).
      - Provision up a PostgreSQL database instance. The cheapest way to do so is the following:

        ```sh
        AUTHORIZED_NETWORKS=123.123.123.123/32 # Allow yourself to connect to the database
        POSTGRES_USER_PASSWORD=abc123 # A secure password for the default user
        DATABASE_INSTANCE=gigamesh # A name for the database instance
        DATABASE_REGION=us-central # A Cloud SQL region

        gcloud sql instances create "$DATABASE_INSTANCE" \
          --project "$GCP_PROJECT" \
          --database-version POSTGRES_12 \
          --tier db-f1-micro \
          --no-backup \
          --region "$DATABASE_REGION" \
          --assign-ip \
          --require-ssl \
          --authorized-networks "$AUTHORIZED_NETWORKS" \
          --root-password "$POSTGRES_USER_PASSWORD"
        ```

        **Tip:** A good way to generate a password is:

        ```sh
        openssl rand -base64 32
        ```

        For production, you should consider configuring high availability, provisioning more CPU and memory, enabling backups, adding read replicas, etc.

        Generate a client certificate:

        ```sh
        CLIENT_CERTIFICATE_NAME=ops # A name for the client certificate

        gcloud sql ssl client-certs create "$CLIENT_CERTIFICATE_NAME" client-key.pem \
          --project "$GCP_PROJECT" \
          --instance "$DATABASE_INSTANCE"
        ```

        Download the public key for that client certificate:

        ```sh
        gcloud sql ssl client-certs describe "$CLIENT_CERTIFICATE_NAME" \
          --project "$GCP_PROJECT" \
          --instance "$DATABASE_INSTANCE" \
          --format 'value(cert)' \
          > client-cert.pem
        ```

        Download the server certificate:

        ```sh
        gcloud sql instances describe "$DATABASE_INSTANCE" \
          --project "$GCP_PROJECT" \
          --format 'value(serverCaCert.cert)' \
          > server-ca.pem
        ```
      - Create the database.
        - Connect to the database instance using a command like the following:

          ```sh
          DATABASE_IP=35.223.233.124 # The IP address of your database instance

          psql "sslmode=verify-ca sslrootcert=server-ca.pem sslcert=client-cert.pem sslkey=client-key.pem hostaddr=$DATABASE_IP port=5432 user=postgres"
          ```
        - Log in using the password you created for the `postgres` user above.
        - Enter the following:

          ```sql
          CREATE DATABASE gigamesh;
          ```
      - Create the tables.
        - Connect to the database instance again, but this time with the newly created `gigamesh` database:

          ```sh
          psql "sslmode=verify-ca sslrootcert=server-ca.pem sslcert=client-cert.pem sslkey=client-key.pem hostaddr=$DATABASE_IP port=5432 user=postgres dbname=gigamesh"
          ```
        - Log in using the password you created for the `postgres` user above.
        - Enter the following:

          ```sql
          CREATE TABLE employees (id SERIAL PRIMARY KEY, name TEXT);
          ```

          Keep the database connection open for the next step.
      - The default `postgres` user is too powerful. Create a more restricted user for the API service and grant them access to the tables created above.

        ```sql
        -- Create the user.
        CREATE USER api LOGIN;

        -- Create a password for the user. This will prompt you for it interactively.
        \password api;

        -- Grant the privileges. Note that `UPDATE` and `DELETE` is not granted.
        -- This user cannot change existing data.
        GRANT SELECT, INSERT, REFERENCES on employees TO api;
        ```

        Store the password in [Secret Manager](https://cloud.google.com/secret-manager) as follows:

          ```sh
          echo -n 'THE PASSWORD' | gcloud secrets create postgres-api \
            --project "$GCP_PROJECT" \
            --replication-policy automatic \
            --data-file -
          ```
    - Create a [SendGrid](https://sendgrid.com/) account and follow SendGrid's instructions to configure the domain for sending emails. Create an API key with the permission to send mail. Store the key in Secret Manager as follows:

      ```sh
      echo -n 'THE API KEY' | gcloud secrets create sendgrid \
        --project "$GCP_PROJECT" \
        --replication-policy automatic \
        --data-file -
      ```
    - Create a service account [here](https://console.cloud.google.com/iam-admin/serviceaccounts) for the API service.

      ```sh
      # Create the service account.
      gcloud iam service-accounts create gigamesh-api --project "$GCP_PROJECT"

      # Give the service account access to the PostgreSQL password.
      gcloud secrets add-iam-policy-binding postgres-api \
        --project "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-api@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/secretmanager.secretAccessor

      # Give the service account access to the SendGrid API key.
      gcloud secrets add-iam-policy-binding sendgrid \
        --project "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-api@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/secretmanager.secretAccessor

      # Give the service account permission to connect to the Cloud SQL instance.
      gcloud projects add-iam-policy-binding "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-api@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/cloudsql.client
      ```
  - Perform the first deploy.
    - Clone this repository.
    - Update the constants [here](https://github.com/stepchowfun/gigamesh/blob/master/frontend/src/constants/constants.ts) and [here](https://github.com/stepchowfun/gigamesh/blob/master/backend/src/constants/constants.ts) as appropriate.
    - Install [Toast](https://github.com/stepchowfun/toast), our automation tool of choice.
    - Create a Docker repository in [Artifact Registry](https://cloud.google.com/artifact-registry).

      ```sh
      GAR_LOCATION=us-central1 # The Artifact Registry location (not particularly important)

      gcloud beta artifacts repositories create gigamesh \
        --project "$GCP_PROJECT" \
        --repository-format docker \
        --location "$GAR_LOCATION"
      ```
    - Create a service account [here](https://console.cloud.google.com/iam-admin/serviceaccounts) for deployment (e.g., to be used by the CI system). Store the credentials file for the next step.

      ```sh
      # Create the service account.
      gcloud iam service-accounts create gigamesh-deployer --project "$GCP_PROJECT"

      # Give the service account permission to create Cloud Run services.
      # This is only needed for the first deploy and will be removed in a later step.
      gcloud projects add-iam-policy-binding "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/run.admin

      # Give the service account permission to create builds.
      gcloud projects add-iam-policy-binding "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/cloudbuild.builds.editor

      # Give the service account permission to access the production bucket.
      gsutil iam ch \
        "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com:roles/storage.objectAdmin" \
        "gs://$PRODUCTION_BUCKET"

      # Give the service account permission to access the staging bucket.
      gsutil iam ch \
        "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com:roles/storage.admin" \
        "gs://$STAGING_BUCKET"

      # Give the service account permission to impersonate the other service
      # account for the API Service. This is needed to deploy the service.
      gcloud iam service-accounts add-iam-policy-binding \
        gigamesh-api@${GCP_PROJECT}.iam.gserviceaccount.com \
        --project "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/iam.serviceAccountUser

      # Give the service account permission to access the Docker image repository.
      gcloud beta artifacts repositories add-iam-policy-binding gigamesh \
        --project "$GCP_PROJECT" \
        --location "$GAR_LOCATION" \
        --member "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/artifactregistry.repoAdmin

      # Create and download a service account key.
      gcloud iam service-accounts keys create deploy-credentials.json \
        --project "$GCP_PROJECT" \
        --iam-account "gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com"
      ```
    - Run the following command to build and deploy the service:

      ```sh
      export DATABASE_INSTANCE_CONNECTION_NAME=gigamesh:us-central1:gigamesh # Database connection info
      export GAR_LOCATION=us-central1 # The Artifact Registry location (not particularly important)
      export GCP_DEPLOY_CREDENTIALS="$(cat deploy-credentials.json)" # Credentials for the deployment service account
      export GCP_PROJECT=gigamesh # Your Google Cloud Platform project ID
      export GCR_REGION=us-central1 # A Cloud Run region close to your users
      export GCR_SERVICE_ACCOUNT=gigamesh-api@gigamesh.iam.gserviceaccount.com # The API service account
      export PRODUCTION_BUCKET=www.gigamesh.io # A bucket we created earlier
      export STAGING_BUCKET=gigamesh-staging # A bucket we created earlier

      toast deploy
      ```
    - On the newly deployed [Cloud Run](https://cloud.google.com/run) service, add the service account as a member with the `Cloud Run Admin` role. Remove the corresponding policy from the project.

      ```
      # Give the service account permission to update the API service.
      gcloud run services add-iam-policy-binding api \
        --project "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/run.admin \
        --platform managed \
        --region "$GCR_REGION"

      # Revoke the permission to create new Cloud Run services.
      gcloud projects remove-iam-policy-binding "$GCP_PROJECT" \
        --member "serviceAccount:gigamesh-deployer@${GCP_PROJECT}.iam.gserviceaccount.com" \
        --role roles/cloudbuild.builds.editor
      ```
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
