# React + TypeScript + Vite

## Production deployment

Deploy the frontend and backend as separate services. The frontend is a static Vite build and the backend is the Node server in `backend/`.

Frontend environment variable:

```text
VITE_API_URL=https://api.example.com
```

Backend environment variables:

```text
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
MONGODB_DATABASE=restaurantos
ACCESS_TOKEN_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<different-long-random-secret>
FRONTEND_URL=https://app.example.com
```

The backend health checks are `/health` and `/ready`. The refresh session is stored in an `HttpOnly`, `Secure` cookie in production, so the backend must allow credentialed CORS requests from the exact frontend origin.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
