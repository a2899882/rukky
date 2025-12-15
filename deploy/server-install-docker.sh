#!/usr/bin/env bash
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo bash deploy/server-install-docker.sh"
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl gnupg

VERSION_CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"

install_docker_ce() {
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

install_docker_debian() {
  apt-get update
  apt-get install -y docker.io
  if apt-cache show docker-compose-plugin >/dev/null 2>&1; then
    apt-get install -y docker-compose-plugin
  else
    apt-get install -y docker-compose
  fi
}

echo "Installing Docker... (Debian codename: ${VERSION_CODENAME})"
if install_docker_ce; then
  echo "Docker CE installed."
else
  echo "Docker CE install failed (or not available). Falling back to Debian packages (docker.io)."
  rm -f /etc/apt/sources.list.d/docker.list
  install_docker_debian
fi

systemctl enable --now docker

docker --version
if docker compose version >/dev/null 2>&1; then
  docker compose version
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose version
else
  echo "ERROR: Docker installed but Compose not found. Please install docker-compose or docker-compose-plugin."
  exit 1
fi

echo "Docker installed successfully."
