# Frontend: Stripe Checkout Demo (React + Vite)

This README explains how to run the frontend locally. The backend is assumed to already exist and expose `/create-checkout-session`.

Quick start

1. Install dependencies

```bash
cd stripe-react-frontend
npm install
```

2. (Optional) Create a `.env` to override defaults

Create `stripe-react-frontend/.env` if you want to override the defaults:

```
VITE_BACKEND_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Note: Vite loads `import.meta.env` at startup — restart the dev server after creating or editing `.env`.

3. Run the dev server

```bash
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

What the frontend does
- Sends a POST to `${VITE_BACKEND_URL || 'http://localhost:3000'}/create-checkout-session` with the cart items.
- Expects JSON `{ sessionId: "..." }` in response.
- Uses Stripe.js (loaded in the app HTML) and calls `stripe.redirectToCheckout({ sessionId })` to redirect the user to Stripe Checkout.

Debug checklist (if redirect fails)
- Network: Confirm the POST to `/create-checkout-session` returns 200 and body `{ sessionId: 'cs_...' }`.
- Console: Verify `window.Stripe` exists (open DevTools Console and run `!!window.Stripe`).
- CORS: If the request is blocked, enable CORS on your backend for the frontend origin.
- Env: If you set `VITE_BACKEND_URL` or `VITE_STRIPE_PUBLISHABLE_KEY`, restart Vite.

That's it — the frontend can be run independently as long as the backend endpoint exists.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
