
# Deploying Seera POS Application to Minikube

This guide provides step-by-step instructions to deploy the Seera POS Next.js application to a local Minikube Kubernetes cluster.

## Prerequisites

*   **Minikube:** Ensure Minikube is installed and running. Start it with `minikube start`.
*   **Docker:** Docker Desktop or Docker Engine must be installed and running.
*   **kubectl:** The Kubernetes command-line tool, `kubectl`, must be installed and configured to communicate with your Minikube cluster. (Minikube usually sets this up for you).

## Deployment Steps

1.  **Navigate to Your Project Directory:**
    Open your terminal and change to the root directory of your Seera POS application.
    ```bash
    cd /path/to/your/seera-pos-app
    ```

2.  **Build Your Docker Image:**

    *   **Option A (Recommended for Minikube): Point Docker CLI to Minikube's Docker daemon.**
        This method builds the image directly within Minikube's Docker environment, so you don't need to push it to an external registry.
        ```bash
        eval $(minikube -p minikube docker-env)
        ```
        *   To revert this and point Docker CLI back to your host's Docker daemon (if needed later), you can use: `eval $(minikube -p minikube docker-env -u)`
        *   Then, build the image:
        ```bash
        docker build -t seera-pos-app:latest .
        ```

    *   **Option B: Build and push to a public/private Docker registry (e.g., Docker Hub).**
        If you choose this option, you'll need to replace `your-dockerhub-username` with your actual Docker Hub username or the path to your private registry.
        ```bash
        docker build -t your-dockerhub-username/seera-pos-app:latest .
        docker push your-dockerhub-username/seera-pos-app:latest
        ```
        **Important:** If you use Option B, you **MUST** update the `image:` field in `k8s/deployment.yaml` from `seera-pos-app:latest` to `your-dockerhub-username/seera-pos-app:latest`.

3.  **Prepare and Apply Kubernetes Secrets (`k8s/secret.yaml`):**
    Secrets are used to store sensitive information like API keys and credentials.

    *   **Encode your `AI_PROVIDER_API_KEY`:**
        Run the following command in your terminal, replacing `YOUR_ACTUAL_AI_PROVIDER_KEY` with your real key:
        ```bash
        echo -n "YOUR_ACTUAL_AI_PROVIDER_KEY" | base64
        ```
        Copy the resulting base64 encoded string.

    *   **Encode your Google Service Account JSON credentials:**
        Your Google Service Account JSON key file needs to be base64 encoded. It's best if the JSON content is on a single line before encoding. You can minify it using an online tool or `jq` if you have it:
        ```bash
        # Example using jq to minify and then base64 encode
        # cat /path/to/your/service-account-file.json | jq -c . | base64 -w 0
        # OR, if already minified:
        cat /path/to/your/service-account-file.json | base64 -w 0
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
        *   If you used **Option B** for building your Docker image, ensure the `spec.template.spec.containers[0].image` field is updated to point to your Docker Hub image (e.g., `your-dockerhub-username/seera-pos-app:latest`). If you used Option A, `seera-pos-app:latest` should be correct.
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

    *   **Get the access URL:**
        ```bash
        minikube service seera-pos-service --url
        ```
        This command will output a URL (e.g., `http://192.168.49.2:30007`).

    *   **Open the URL in your browser** to access your Seera POS application.

## Updating the Application

If you make changes to your application code:

1.  **Re-build your Docker image** (Step 2). If using Minikube's Docker daemon, ensure you re-run `eval $(minikube -p minikube docker-env)` if you opened a new terminal.
2.  Kubernetes will not automatically pull a new image if the tag is `latest` by default (`imagePullPolicy: IfNotPresent`). To force an update, you can either:
    *   Delete the existing pods to make the deployment recreate them (which will pull the image if it's different and `imagePullPolicy` allows):
        ```bash
        kubectl delete pods -l app=seera-pos
        ```
    *   Or, more robustly, update your image tag (e.g., `seera-pos-app:v1.1`), update `k8s/deployment.yaml`, and re-apply:
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

To stop Minikube:
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

This completes the guide for deploying your Seera POS application to Minikube!
