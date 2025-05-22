#!/usr/bin/env bash
set -euo pipefail

REGISTRY="${1:-localhost:5000}"
TAG="${2:-latest}"

# Build & push api_gateway
echo "Building api_gateway  ${REGISTRY}/api_gateway:${TAG}"
docker build -t "${REGISTRY}/api_gateway:${TAG}" ./api_gateway
docker push "${REGISTRY}/api_gateway:${TAG}"
echo

# Build & push fixtures_runner
echo "Building fixtures_runner  ${REGISTRY}/fixtures_runner:${TAG}"
docker build -t "${REGISTRY}/fixtures_runner:${TAG}" ./fixtures
docker push "${REGISTRY}/fixtures_runner:${TAG}"
echo

# Build & push all micro-services
for svc in services/*; do
  [[ -d "$svc" ]] || continue
  name=$(basename "$svc")
  image="${REGISTRY}/${name}:${TAG}"
  echo "Building ${name}  ${image}"
  docker build -t "${image}" "${svc}"
  docker push "${image}"
  echo
done

echo "All images built and pushed to ${REGISTRY} (tag=${TAG})."