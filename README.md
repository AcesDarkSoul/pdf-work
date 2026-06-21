# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Firebase (optional)

This project can connect to Firebase to store user data or enable authentication.

### Setup

1. Create a Firebase project at https://console.firebase.google.com.
2. Add a new Web app and copy the config values.
3. Enable **Anonymous** sign-in under **Authentication > Sign-in method** (or configure your preferred provider).
4. Copy the values into a `.env` (or `.env.local`) file based on the `.env.example` provided.

Example `.env` values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### How it works

- The app initializes Firebase in `src/firebase.js`.
- **Automatic setup**: On app start, `initializeFirestoreData()` creates default documents if they don't exist.
- The login screen uses anonymous auth and stores a `users/{uid}` document in Firestore.
- UPI payment details are stored in `payment/upi` document (auto-created with defaults).
- Pro pricing is stored in `config/pricing` document (auto-created with defaults).
- Users can upgrade to Pro via UPI Intent or QR code payment using dynamic pricing.
- You can now extend the app to read/write data from Firestore (e.g., tasks, rewards, settings).
