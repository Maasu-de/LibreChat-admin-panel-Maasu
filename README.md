# LibreChat Admin Panel

A browser-based management interface for [LibreChat](https://github.com/danny-avila/LibreChat). It connects to the same database as the main application and provides a GUI for tasks that would otherwise require editing `librechat.yaml` directly.

## AIMO branding and governed deployment

This repository is the dedicated AIMO-branded fork of LibreChat Admin Panel. The
branding is limited to the document title, favicon and web manifest, sidebar
logo, and login card; authentication, permissions, and administrative features
remain upstream implementations. `src/branding.ts` holds the panel name and
base-path-aware asset URLs. To update the brand, change that file, the English
strings in `src/locales/en/translation.json`, and the SVGs in `public/`.
`aimo-logo.svg` is copied from `LibreChat-Maasu/client/public/assets/logo.svg`.
Keep it in sync with the approved AIMO artwork when updating the brand.

For governed development, clone this fork as `LibreChat-admin-panel-Maasu`
beside `ai-governance-gateway` and `LibreChat-Maasu`. The gateway's
`deploy/compose.yaml` builds this checkout through
`LIBRECHAT_ADMIN_BUILD_CONTEXT` and tags the result with
`LIBRECHAT_ADMIN_IMAGE`. From the gateway repository, run:

```bash
docker compose --env-file .env -f deploy/compose.yaml up -d --no-deps --build librechat-admin
```

The gateway on `http://localhost:3090/` requires Governance/Keycloak login;
use an account with the `governance-admin` realm role. The direct admin port is
not published. For server deployments, check out the reviewed admin-fork
revision alongside the gateway before running `deploy/scripts/deploy.sh`.
See the gateway's `deploy/README.md` for environment and SSO setup. No
container-side patching is needed.

## Features

- **Configuration management** — View and edit all LibreChat settings through a dynamic, schema-driven form. New fields added to the schema appear automatically.
- **Role and group overrides** — Apply configuration overrides scoped to specific roles or groups, with a priority-based cascade that determines the final resolved value for each user.
- **User and group administration** — Create and manage groups, assign roles, and control access.
- **Authentication** — Supports username/password login and OpenID SSO when enabled on the LibreChat instance.
- **Localization** — Full multi-language support for all UI strings.
- **Accessibility** — Keyboard navigable with ARIA regions, focus management, and screen reader support.

## Getting started

### Local development

```bash
cp .env.example .env   # then edit .env
bun install
bun dev                 # http://localhost:3000
```

### Docker

```bash
cp .env.example .env
# Set SESSION_SECRET (min 32 chars)
# Set VITE_API_BASE_URL=http://host.docker.internal:3080

docker compose up -d    # builds and starts on http://localhost:3000
docker compose down     # stop
```

> **Note:** Inside Docker, `localhost` refers to the container, not your machine.
> Use `http://host.docker.internal:3080` for `VITE_API_BASE_URL` to reach
> LibreChat running on the host.

#### Environment variables

| Variable                        | Required                            | Default                                                                          | Description                                                                                     |
| ------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `PORT`                          | No                                  | `3000`                                                                           | Port the admin panel listens on                                                                 |
| `SESSION_SECRET`                | **Yes** (always required in Docker) | Dev fallback only when running `bun dev` locally; no default in the Docker image | Encryption key for sessions (min 32 chars)                                                      |
| `VITE_API_BASE_URL`             | **Yes** (Docker)                    | `http://localhost:3080` (local dev only)                                         | LibreChat API server URL; use `http://host.docker.internal:<port>` in Docker                    |
| `VITE_BASE_PATH`                | No                                  | `/`                                                                              | URL subpath to serve the panel under (e.g., `/adminpanel`). Must match at build time and runtime |
| `API_SERVER_URL`                | No                                  | Falls back to `VITE_API_BASE_URL`                                                | Server-side LibreChat API URL when the container reaches LibreChat differently than the browser |
| `ADMIN_SSO_ONLY`                | No                                  | `false`                                                                          | Hide email/password form, SSO only                                                              |
| `ADMIN_SSO_ENABLED`             | No                                  | `true`                                                                           | Set `false` to hide the SSO button (and auto-redirect) while keeping email/password login       |
| `GOVERNANCE_PILOT_ENABLED`      | No                                  | `false`                                                                          | Set to exactly `true` to enable governance pilot mode; all other values leave it disabled       |
| `ADMIN_SESSION_IDLE_TIMEOUT_MS` | No                                  | `1800000` (30 min)                                                               | Session idle timeout in ms                                                                      |
| `SESSION_COOKIE_SECURE`         | No                                  | `true` in production, `false` otherwise                                          | Set `false` only for plain-HTTP deployments so the browser keeps the admin session cookie       |

For OpenID SSO, the admin panel stores a short-lived PKCE verifier in the
`admin-session` cookie before redirecting to LibreChat. If the admin panel is
served over plain HTTP while running in production mode, browsers reject a
`Secure` session cookie and the callback cannot complete the PKCE exchange. In
that deployment shape, set `SESSION_COOKIE_SECURE=false` on the admin panel.
Set the same override on LibreChat itself when LibreChat is also reached over
plain HTTP, so its OAuth and auth cookies are not dropped either.

#### Standalone Docker build

```bash
docker build -t librechat-admin-panel .
docker run -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e SESSION_SECRET=your-secret-here-at-least-32-characters \
  -e VITE_API_BASE_URL=http://host.docker.internal:3080 \
  -e SESSION_COOKIE_SECURE=false \
  librechat-admin-panel

# To serve under a subpath (e.g., /adminpanel):
docker build -t librechat-admin-panel --build-arg VITE_BASE_PATH=/adminpanel .
docker run -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e SESSION_SECRET=your-secret-here-at-least-32-characters \
  -e VITE_API_BASE_URL=http://host.docker.internal:3080 \
  -e VITE_BASE_PATH=/adminpanel \
  librechat-admin-panel
```
