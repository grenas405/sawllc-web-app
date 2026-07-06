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

# Catch unit/host mismatches (wrong user, missing deno, wrong repo path)
# before systemd fails with an opaque 217/USER or 203/EXEC.
check_unit_matches_host() {
  local unit="${REPO_DIR}/systemd/${SERVICE_NAME}.service"
  local unit_user unit_exec unit_wd

  unit_user="$(sed -n 's/^User=//p' "${unit}")"
  unit_exec="$(sed -n 's/^ExecStart=\([^ ]*\).*/\1/p' "${unit}")"
  unit_wd="$(sed -n 's/^WorkingDirectory=//p' "${unit}")"

  getent passwd "${unit_user}" >/dev/null ||
    die "Unit runs as User=${unit_user}, but that user does not exist on this host"
  [[ -x "${unit_exec}" ]] ||
    die "Unit ExecStart binary not found or not executable: ${unit_exec}"
  [[ -d "${unit_wd}" ]] ||
    die "Unit WorkingDirectory does not exist: ${unit_wd}"
  [[ "${unit_wd}" == "${REPO_DIR}" ]] ||
    warn "Unit WorkingDirectory (${unit_wd}) is not this checkout (${REPO_DIR})"
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
check_unit_matches_host
install_systemd_unit
install_nginx_conf
smoke_test
say "Done."
