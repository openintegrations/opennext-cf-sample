# OpenNext Cloudflare debug Example

This is a repo to act as a reference for the issues we've encountered with OpenNext Cloudflare's experimental branch (Dec 25 2024).

## Dependencies

- "@opennextjs/cloudflare": "https://pkg.pr.new/@opennextjs/cloudflare@2ab976f" (experimental branch, albeit this occurs in main)
- "next": "14.2.13",
- "pg": "8.13.1",

## Build

```
pnpm run build:next && pnpm run build:worker && pnpm run dev:worker
```

## Issue 1: /api/db

Fetches data from a local postgres instance using drizzle & postgresjs. Gets stuck and doesn't return a response.

```
Error: The script will never generate a response.
    at async Object.fetch (xx/node_modules/.pnpm/miniflare@3.20241205.0/node_modules/miniflare/dist/src/workers/core/entry.worker.js:1029:22)
```

Only by moving to 'node-pg' does it work, as long as we patch the missing index.js cloudflare-pg file described here:
https://github.com/brianc/node-postgres/issues/3349#issuecomment-2561969479

## Issue 2: /api/body

Body parsing gets stuck and returns a 500 error

```
curl 'http://localhost:4000/api/db' -H 'Accept: application/json' --data-raw '{"foo": "mii"}' -X POST
```

[wrangler:inf] GET /api/db 500 Internal Server Error (41ms)

```
 const handlerMjsPath = path.resolve(
    __dirname,
    '.open-next/server-functions/default/apps/web/handler.mjs',
)

let handlerCode = fs.readFileSync(handlerMjsPath, 'utf8')
const insertionMarker = '                const request2 = _nextrequest.NextRequestAdapter.fromBaseNextRequest(req, (0, _nextrequest.signalFromNodeResponse)(res.originalResponse));'
const insertionLine = `                  req = { ...req, body: await new Promise((resolve) => { let body = ''; req.body.on('data', (chunk) => (body += chunk)); req.body.on('end', () => resolve(body)); }) };`
```

## Issue 3: TRPC errors not being returned

These objects are not being returned as JSON
https://trpc.io/docs/server/error-handling

Instead, we get a 500 error with a html page

```
<!DOCTYPE html>
<html>
    <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width"/>
        <title>500: Internal Server Error</title>
        <meta name="next-head-count" content="3"/>
        <noscript data-n-css=""></noscript>
        <script defer="" nomodule="" src="/_next/static/chunks/polyfills-42372ed130431b0a.js"></script>
        <script src="/_next/static/chunks/webpack-73ba21a5ec4f6697.js" defer=""></script>
        <script src="/_next/static/chunks/framework-e4c547bf1d05f43d.js" defer=""></script>
        <script src="/_next/static/chunks/main-b5c92671c9f74dbf.js" defer=""></script>
        <script src="/_next/static/chunks/pages/_app-fa5769f7cdab348e.js" defer=""></script>
        <script src="/_next/static/chunks/pages/_error-67b143933d1ae103.js" defer=""></script>
        <script src="/_next/static/bWzZviwrYtC10xgoJZnQF/_buildManifest.js" defer=""></script>
        <script src="/_next/static/bWzZviwrYtC10xgoJZnQF/_ssgManifest.js" defer=""></script>
    </head>
    <body>
```
