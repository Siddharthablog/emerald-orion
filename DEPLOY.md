# Deployment Guide

This project is a Next.js application configured for deployment using Docker.

## Server Requirements

To host this application, your server needs:

1.  **Docker Engine**: Version 20.10.0 or newer recommended.
2.  **Docker Compose** (Optional but recommended): For easier container management.
3.  **RAM**: At least 1GB (2GB recommended for build process if building on server).
4.  **CPU**: 1 vCPU minimum.
5.  **Disk Space**: ~1GB for the container image and logs.

## Files to Work On

For deployment, you typically don't need to edit the source code (`src/`). The important files are:

-   `Dockerfile`: Defines how the application is built and run.
-   `next.config.mjs`: Contains the `output: 'standalone'` configuration which is crucial for the Docker build.
-   `package.json`: Defines dependencies.

## How to Deploy

### Option 1: Using Docker (Recommended)

1.  **Build the image:**
    ```bash
    docker build -t emerald-orion .
    ```

2.  **Run the container:**
    ```bash
    docker run -p 3000:3000 emerald-orion
    ```

    The application will be available at `http://localhost:3000` (or your server's IP).

### Option 2: Manual Deployment (Node.js)

If you cannot use Docker, ensure your server has **Node.js 18+** installed.

1.  **Install dependencies:**
    ```bash
    npm ci
    ```

2.  **Build the application:**
    ```bash
    npm run build
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```

    Use a process manager like `pm2` to keep the application running:
    ```bash
    npm install -g pm2

## Project Size Analysis

-   **Current Directory Size**: ~850MB (mostly `node_modules` and `.next` cache).
-   **Git Repository Size**: Will be very small (< 5MB) because `node_modules` and `.next` are ignored in `.gitignore`.
-   **Free Tier Eligibility**: **YES**. This project is well within the limits of free tiers for Vercel, Netlify, and Google Cloud Run (Free Tier).

---

## Step-by-Step Hosting Guide

### Part 1: Push to GitHub

1.  **Initialize Git** (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Create a Repository on GitHub**:
    -   Go to [GitHub.com](https://github.com) and sign in.
    -   Click the **+** icon in the top right -> **New repository**.
    -   Name it `emerald-orion` (or similar).
    -   Do **NOT** check "Initialize with README" or .gitignore (you already have them).
    -   Click **Create repository**.

3.  **Push Code**:
    -   Copy the commands under "…or push an existing repository from the command line". They will look like this:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/emerald-orion.git
    git branch -M main
    git push -u origin main
    ```

### Part 2: Deploy to Vercel (Recommended - Easiest & Free)

Vercel is the creators of Next.js, so it offers the best experience.

1.  Go to [Vercel.com](https://vercel.com) and sign up with **GitHub**.
2.  Click **"Add New..."** -> **"Project"**.
3.  Find your `emerald-orion` repository and click **Import**.
4.  Leave all settings as default (Framework Preset: Next.js).
    > **Note:** If you get an error saying "The specified name is already used", simply change the **Project Name** field to something unique (e.g., `emerald-orion-v2` or `emerald-orion-yourname`).
5.  Click **Deploy**.
6.  Wait ~1 minute. Your site is now live!

### Part 3: Deploy to Google Cloud Run (Advanced)

If you specifically want to use Google Cloud (GCP), Cloud Run is the best "Serverless" option that can run your Docker container.

**Prerequisites:**
-   Google Cloud Account (Free trial available).
-   `gcloud` CLI installed on your machine.

**Steps:**

1.  **Login to Google Cloud:**
    ```bash
    gcloud auth login
    gcloud config set project YOUR_PROJECT_ID
    ```

2.  **Enable Services:**
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com
    ```

3.  **Build & Push Image:**
    (Replace `YOUR_PROJECT_ID` with your actual project ID)
    ```bash
    # Tag the image for Google Container Registry (GCR)
    docker build -t gcr.io/YOUR_PROJECT_ID/emerald-orion .

    # Push the image
    docker push gcr.io/YOUR_PROJECT_ID/emerald-orion
    ```

4.  **Deploy to Cloud Run:**
    ```bash
    gcloud run deploy emerald-orion \
      --image gcr.io/YOUR_PROJECT_ID/emerald-orion \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

5.  **Done!** The command will output a URL where your app is live.

### Part 4: Internal Server Deployment (IP Address)

If you are deploying to a company server (e.g., `192.168.1.50`), follow these steps.

**Prerequisites:**
-   SSH access to the server.
-   Docker installed on the server (Recommended).

**Steps:**

1.  **Connect to the Server:**
    ```bash
    ssh user@YOUR_SERVER_IP
    ```

2.  **Get the Code:**
    *   **Option A (Git):** If the server has internet access:
        ```bash
        git clone https://github.com/YOUR_USERNAME/emerald-orion.git
        cd emerald-orion
        ```
    *   **Option B (SCP):** If no internet, copy files from your machine:
        ```bash
        # Run this from your LOCAL machine, not the server
        scp -r . user@YOUR_SERVER_IP:~/emerald-orion
        ```

3.  **Run with Docker:**
    ```bash
    cd emerald-orion
    docker build -t emerald-orion .
    docker run -d -p 3000:3000 --restart always --name emerald-orion emerald-orion
    ```

4.  **Access the App:**
    -   Open your browser and go to: `http://YOUR_SERVER_IP:3000`
    -   **Troubleshooting:** If it doesn't load, check the firewall:
        ```bash
        # Ubuntu/Debian
        sudo ufw allow 3000
        ```

