
# Deploying Seera POS Application to Minikube (on an Ubuntu Server with Docker Driver)

This guide provides step-by-step instructions to deploy the Seera POS Next.js application to a local Minikube Kubernetes cluster running on your Ubuntu server with the Docker driver.

## Prerequisites

*   **Ubuntu Server:** Your Ubuntu server where Minikube will run.
*   **Docker Installation on Ubuntu:** Docker Engine must be installed and running on your Ubuntu server. Minikube will use Docker as its driver. If not installed, follow the [official Docker installation guide for Ubuntu](https://docs.docker.com/engine/install/ubuntu/).
    *   **Network for Docker:** Ensure Docker containers on your Ubuntu server have internet access (e.g., can resolve and reach `registry.yarnpkg.com` for package installation). Check DNS settings and firewall rules (e.g., `ufw`) on the Ubuntu host if builds fail with network errors during `yarn install`.
*   **Minikube Installation on Ubuntu:** Minikube must be installed on your Ubuntu server. If not installed, follow the [official Minikube documentation](https://minikube.sigs.k8s.io/docs/start/).
*   **Minikube Running with Docker Driver:** Ensure Minikube is started, explicitly using the Docker driver if it's not the default on your system:
    ```bash
    minikube start --driver=docker
    ```
*   **kubectl:** The Kubernetes command-line tool, `kubectl`, must be installed and configured to communicate with your Minikube cluster. (Minikube usually sets this up for you).
*   **Sudo access:** You'll likely need `sudo` for installing Docker, Minikube, and potentially for running some Minikube or Docker commands if your user isn't in the `docker` group.

## Deployment Steps

1.  **Navigate to Your Project Directory:**
    Open your terminal on the Ubuntu server (or wherever you manage your project files) and change to the **root directory** of your Seera POS application (the directory containing `Dockerfile`, `package.json`, `src`, etc.).
    ```bash
    cd /path/to/your/seera-pos-app
    ```

2.  **Build Your Docker Image into Minikube's Docker Daemon:**
    This is the recommended method when using Minikube with the Docker driver. It builds the image directly within Minikube's Docker environment, so you don't need to push it to an external registry.

    *   **Point your Docker CLI to Minikube's Docker daemon:**
        ```bash
        eval $(minikube -p minikube docker-env)
        ```
        *   To revert this later and point Docker CLI back to your host's Docker daemon (if needed), you can use: `eval $(minikube -p minikube docker-env -u)`

    *   **Build the image using the `Dockerfile`:**
        ```bash
        docker build -t seera-pos-app:latest -f Dockerfile .
        ```
        *   **Troubleshooting Build Errors:**
            *   **Module not found (e.g., `Can't resolve '@/components/...'`):**
                *   Ensure you are running the `docker build` command from the **project root**.
                *   Check if you have a `.dockerignore` file that might be excluding `tsconfig.json` or the `src` directory.
                *   Verify `baseUrl: "."` and `"paths": { "@/*": ["./src/*"] }` are correctly set in `tsconfig.json`. The `Dockerfile` includes diagnostic `ls` commands; examine their output to see if files are present as expected in `/app` during the build.
            *   **Network errors during `yarn install` (e.g., `ETIMEDOUT` to `registry.yarnpkg.com`):**
                *   This indicates the Docker build environment on your Ubuntu server cannot access the internet or specific resources.
                *   Check firewall settings on your Ubuntu server (`sudo ufw status`).
                *   Verify Docker's DNS configuration (e.g., in `/etc/docker/daemon.json`).
                *   If behind a proxy, configure Docker to use it.

    *   **(Alternative) Build and push to a registry:** If you prefer to use an external Docker registry (e.g., Docker Hub), you can build and push as usual:
        ```bash
        # docker build -t your-dockerhub-username/seera-pos-app:latest -f Dockerfile .
        # docker push your-dockerhub-username/seera-pos-app:latest
        ```
        If you choose this alternative, you **MUST** update the `image:` field in `k8s/deployment.yaml` from `seera-pos-app:latest` to `your-dockerhub-username/seera-pos-app:latest`.

3.  **Prepare and Apply Kubernetes Secrets (`k8s/secret.yaml`):**
    Secrets are used to store sensitive information like API keys and credentials.

    *   **Encode your `AI_PROVIDER_API_KEY`:**
        Run the following command in your terminal, replacing `YOUR_ACTUAL_AI_PROVIDER_KEY` with your real key:
        ```bash
        echo -n "YOUR_ACTUAL_AI_PROVIDER_KEY" | base64
        ```
        Copy the resulting base64 encoded string.

    *   **Encode your Google Service Account JSON credentials:**
        Your Google Service Account JSON key file needs to be base64 encoded. It's best if the JSON content is on a single line before encoding. You can minify it using `jq` or ensure it's a single line manually.
        ```bash
        # Example using jq to minify and then base64 encode (recommended):
        # cat /path/to/your/service-account-file.json | jq -c . | base64 -w 0
        # OR, if already minified and on a single line:
        # cat /path/to/your/service-account-file.json | base64 -w 0
        ```
        *(Note: The `-w 0` flag for GNU `base64` prevents line wrapping. For macOS `base64`, it's just `base64` without `-w 0`.)*
        Copy the resulting base64 encoded string.

    *   **Edit `k8s/secret.yaml`:**
        Open the `k8s/secret.yaml` file.
        *   Replace `YOUR_BASE64_ENCODED_AI_KEY_HERE` with the base64 encoded string of your AI Provider Key.
        *   Replace `YOUR_BASE64_ENCODED_GOOGLE_CREDS_HERE` with the base64 encoded string of your Google Service Account JSON credentials.

    *   **Apply the secret to your Minikube cluster:**
        ```bash
        kubectl apply -f k8s/secret.yaml
        ```

4.  **Update and Apply Kubernetes Deployment (`k8s/deployment.yaml`):**
    The deployment manifest tells Kubernetes how to run your application.

    *   **Edit `k8s/deployment.yaml`:**
        Open the `k8s/deployment.yaml` file.
        *   Ensure the `spec.template.spec.containers[0].image` field is `seera-pos-app:latest` (if you built into Minikube's daemon) or your external registry path if you used that alternative.
        *   **Crucially, replace `YOUR_GOOGLE_SHEET_ID_HERE`** in the `env` section with your actual Google Sheet ID.

    *   **Apply the deployment to your Minikube cluster:**
        ```bash
        kubectl apply -f k8s/deployment.yaml
        ```

5.  **Apply Kubernetes Service (`k8s/service.yaml`):**
    The service manifest exposes your application so you can access it.
    ```bash
    kubectl apply -f k8s/service.yaml
    ```

6.  **Check Deployment Status:**
    Allow a minute or two for the pods to initialize and start.

    *   **Check deployments:**
        ```bash
        kubectl get deployments
        ```
        You should see `seera-pos-deployment` with `READY` matching `AVAILABLE` (e.g., `1/1`).

    *   **Check pods:**
        ```bash
        kubectl get pods
        ```
        You should see a pod named like `seera-pos-deployment-...` with a `STATUS` of `Running`.

    *   **View pod logs (if troubleshooting):**
        If a pod is not `Running` or you encounter issues, check its logs. First, get the full pod name using `kubectl get pods`, then:
        ```bash
        kubectl logs <your-full-pod-name>
        ```
        For example: `kubectl logs seera-pos-deployment-abcdef1234-xyz98`

7.  **Access Your Application:**
    Minikube provides a command to easily access services of type `NodePort`.

    *   **Get the access URL (from the Ubuntu server):**
        ```bash
        minikube service seera-pos-service --url
        ```
        This command will output a URL (e.g., `http://192.168.49.2:30007`). This URL is accessible *from the Ubuntu server itself*.

    *   **To access from your local machine (different from the Ubuntu server):**
        You will need to use the **Ubuntu server's actual IP address** and the **NodePort** number (the port after the colon in the URL above, e.g., `30007`).
        For example: `http://<UBUNTU_SERVER_IP>:30007`.
        *   Ensure your Ubuntu server's firewall allows incoming connections on this NodePort (e.g., `sudo ufw allow 30007/tcp`).
    *   **Alternative Access with `minikube tunnel`:**
        In a separate terminal **on the Ubuntu server**, you can run:
        ```bash
        minikube tunnel
        ```
        This command creates a network route on your Ubuntu host to services. It might provide a different way to access the service, potentially via an external IP or `localhost` on the Ubuntu server, depending on your Minikube and network setup. Keep this terminal running while you need access.

## Updating the Application

If you make changes to your application code:

1.  **Re-build your Docker image** (Step 2). Ensure you re-run `eval $(minikube -p minikube docker-env)` if you opened a new terminal or if the environment variables are no longer set.
2.  Kubernetes will not automatically pull a new image if the tag is `latest` and `imagePullPolicy` is `IfNotPresent` (the default for locally built images). To force an update, you can either:
    *   Delete the existing pods to make the deployment recreate them (which will pull the image if it's different):
        ```bash
        kubectl delete pods -l app=seera-pos
        ```
    *   Or, more robustly, update your image tag (e.g., `seera-pos-app:v1.1`), update `k8s/deployment.yaml` with the new tag, and re-apply:
        ```bash
        kubectl apply -f k8s/deployment.yaml
        ```

## Cleaning Up

To remove the deployed application from Minikube:

```bash
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/secret.yaml
```

To stop Minikube on your Ubuntu server:
```bash
minikube stop
```
To delete the Minikube cluster entirely:
```bash
minikube delete
```
Remember to unset the Minikube Docker environment if you set it:
```bash
eval $(minikube docker-env -u)
```

This completes the guide for deploying your Seera POS application to Minikube running on an Ubuntu server with the Docker driver!
