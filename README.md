# EdgeAPIServer (Node.js + TypeScript)

Simple REST API demo server ported from the original C# self-hosted version.

## Requirements

- Node.js 22+ (verified on Node 24)

## Install from GitHub

```bash
npm install <githuburl>
```

This package exposes a CLI command named `startserver`.

## Run

```bash
npx startserver
```

Optional arguments:

```bash
npx startserver <port>
npx startserver <port> json
npx startserver <port> xml
npx startserver <port> accept
npx startserver .
```

Examples:

```bash
npx startserver 2002
npx startserver 2002 json
npx startserver 2002 xml
npx startserver 2002 accept
```

## Response format behavior

- Default mode (`startserver` or `startserver <port>`):
  - Same as Force mode `json`.
- Force mode `json`:
  - Always returns JSON, even if `Accept: application/xml` is sent.
- Force mode `xml`:
  - Always returns XML, even if `Accept: application/json` is sent.
- Negotiated mode `accept`:
  - Returns JSON by default.
  - Returns XML when request includes `Accept: application/xml`.

## Endpoints

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

- `GET /api/users` (Basic Auth required)
- `GET /api/users/:id` (Basic Auth required)
- `POST /api/users` (Basic Auth required)
- `DELETE /api/users/:id` (Basic Auth required)

## Basic Auth

`/api/users` routes require:

- Username: `edge`
- Password: `edgewords`

Example header:

```text
Authorization: Basic ZWRnZTplZGdld29yZHM=
```

## Static file serving

- Serves files from `Assets/` at server root.
- Root URL serves `Assets/index.html` when present.
- Includes a directory listing fallback for folders.
- Custom response header `Company: Edgewords Ltd` is set on API and static responses.

## Local development

```bash
npm install
npm run dev
```

Build and run compiled output:

```bash
npm run build
npm run start
```
