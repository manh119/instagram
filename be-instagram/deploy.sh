#!/bin/bash
set -e

IMAGE="ghcr.io/manh119/be-instagram:latest"
CONTAINER_NAME="be-instagram-spring-app-1"

echo "Stopping old container..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

echo "Pulling latest image..."
docker pull $IMAGE

echo "Starting new container..."
cd ~/instagram/be-instagram
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
echo "Deployment completed."