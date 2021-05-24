# Kubernetes K6 Load Testing

## Pre-Req

* K3d
* K6

## K3s Kubernetes Cluster + Nginx

```zsh
# Spin up a Kubernetes cluster
k3d cluster create k6-load-testing \
  --api-port 6550 \
  -p "8081:80@loadbalancer" \
  --agents 3 \
  --k3s-server-arg '--kube-apiserver-arg=feature-gates=EphemeralContainers=true'

kubectl cluster-info

# Create a nginx deployment
kubectl create deployment nginx --image=nginx

# Create a ClusterIP service for it
kubectl create service clusterip nginx --tcp=80:80

# Create an Ingress
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx
  annotations:
    ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx
            port:
              number: 80
EOF

# Test the nginx service
curl localhost:8081/
```

Running the K6 tests:

```zsh
k6 run perf-tests/load-test.js
```

## Prometheus + Grafana

```zsh
# Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

```

```zsh
kubectl apply -f manifests/montioring/namespace.yaml
kubectl apply -R -f manifests/montioring

kubectl create deployment grafana -n monitoring --image=docker.io/grafana/grafana:latest
kubectl create service clusterip grafana --tcp=3000:3000 -n monitoring

cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx
  namespace: monitoring
  annotations:
    ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: grafana
            port:
              number: 3000
EOF
```

## References

* [how-to-autoscale-kubernetes-pods-with-keda-testing-with-k6-4nl9](https://dev.to/k6/how-to-autoscale-kubernetes-pods-with-keda-testing-with-k6-4nl9)
* [setup-prometheus-monitoring-on-kubernetes](https://devopscube.com/setup-prometheus-monitoring-on-kubernetes/)
* [https://k3d.io/faq/faq/](https://k3d.io/faq/faq/)
* [https://computingforgeeks.com/install-grafana-on-kubernetes-for-monitoring/](https://computingforgeeks.com/install-grafana-on-kubernetes-for-monitoring/)