#!/usr/bin/env bash
# setup-vps.sh — one job: install the systemd unit and nginx config on the VPS.
# Idempotent: safe to re-run after every deploy or config change.
#
# Usage: sudo ./scripts/setup-vps.sh
set -euo pipefail

SERVICE_NAME="denogenesis"
NGINX_CONF="denogenesis.com.conf"
DOMAIN="denogenesis.com"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
CERTBOT_WEBROOT="/var/www/certbot"

# Resolve the repo root from this script's location so it works from any cwd.
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

say() { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

require_root() {
  [[ $EUID -eq 0 ]] || die "Run with sudo: sudo $0"
}

check_sources() {
  [[ -f "${REPO_DIR}/systemd/${SERVICE_NAME}.service" ]] ||
    die "Missing ${REPO_DIR}/systemd/${SERVICE_NAME}.service"
  [[ -f "${REPO_DIR}/nginx/${NGINX_CONF}" ]] ||
    die "Missing ${REPO_DIR}/nginx/${NGINX_CONF}"
  command -v nginx >/dev/null || die "nginx is not installed (apt install nginx)"
}

install_systemd_unit() {
  say "Installing systemd unit → /etc/systemd/system/${SERVICE_NAME}.service"
  install -m 0644 "${REPO_DIR}/systemd/${SERVICE_NAME}.service" \
    "/etc/systemd/system/${SERVICE_NAME}.service"
  systemctl daemon-reload
  say "Enabling and (re)starting ${SERVICE_NAME}"
  systemctl enable "${SERVICE_NAME}" >/dev/null
  systemctl restart "${SERVICE_NAME}"
  systemctl --no-pager --lines=0 status "${SERVICE_NAME}" || die "${SERVICE_NAME} failed to start"
}

install_nginx_conf() {
  say "Installing nginx config → /etc/nginx/sites-available/${NGINX_CONF}"
  install -m 0644 "${REPO_DIR}/nginx/${NGINX_CONF}" \
    "/etc/nginx/sites-available/${NGINX_CONF}"
  mkdir -p "${CERTBOT_WEBROOT}"

  if [[ ! -f "${CERT_DIR}/fullchain.pem" ]]; then
    warn "No certificate at ${CERT_DIR} — nginx config installed but NOT enabled."
    warn "Issue one, then re-run this script:"
    warn "  certbot certonly --webroot -w ${CERTBOT_WEBROOT} -d ${DOMAIN} -d www.${DOMAIN}"
    return 0
  fi

  ln -sf "/etc/nginx/sites-available/${NGINX_CONF}" \
    "/etc/nginx/sites-enabled/${NGINX_CONF}"
  say "Testing and reloading nginx"
  nginx -t
  systemctl reload nginx
}

smoke_test() {
  say "Smoke test: http://127.0.0.1:8004/healthz"
  if command -v curl >/dev/null; then
    curl -fsS --max-time 5 http://127.0.0.1:8004/healthz && echo
  else
    warn "curl not found; skipping smoke test"
  fi
}

require_root
check_sources
install_systemd_unit
install_nginx_conf
smoke_test
say "Done."
