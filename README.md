# Pet Connect

A hybrid mobile app that connects **pet owners** with **pet sitters**. Owners add their pets and post listings for the period when they need someone to look after them; sitters browse open listings and apply, and owners accept or reject the applications.

Built with **Ionic 8 + Angular 20** (TypeScript) and **Capacitor**, with **Firebase Authentication** and **Firebase Realtime Database** as the backend.

> Academic project for the *Mobile Computing* course at the Faculty of Organizational Sciences, University of Belgrade (2026). The app's interface is in Serbian.

## Features

**Pets**
- Add, edit and delete your pets: name, species (dog or cat), breed, age, description and photo.

**Listings**
- Create, edit and delete listings for one or more of your pets, with dates, price and a note.
- Close a listing once you have found a sitter.
- Explore all open listings and open their details.

**Applications**
- Apply to a listing as a sitter, with an optional message.
- As an owner, see who applied (name and e-mail) and accept or reject each application.
- Track the status of your own applications (*pending*, *accepted*, *rejected*) and withdraw them.

**Accounts**
- Registration and login; the session is kept on the device and restored automatically on the next start.
- Route guards keep the app's tabs available only to logged-in users.

## Technical highlights

- **Firebase over plain REST.** Following the course requirements, the app uses no Firebase SDK. Authentication goes through the Firebase Auth REST API (Identity Toolkit), and all data is read and written with Angular's `HttpClient` against the Realtime Database REST API, using the user's ID token.
- **Server-side security rules** ([`firebase-rules.json`](firebase-rules.json)): only authenticated users can read data, users can change only their own pets and listings, and only the sitter or the listing owner can change an application. Indexes on `ownerId`, `listingId` and `sitterId` keep queries efficient.
- **Reactive state** with RxJS: services expose observables that pages subscribe to, so lists refresh as soon as data changes.
- **Standalone components and lazy-loaded routes**, with a tab layout (Explore, My pets, My listings, My applications).

## Tech stack

| Layer | Technologies |
|---|---|
| Mobile / UI | Ionic 8, Angular 20 (standalone components), TypeScript, RxJS |
| Native runtime | Capacitor |
| Backend | Firebase Authentication, Firebase Realtime Database (REST API) |

## Project structure

```
src/app/
├── auth/          login, registration, auth service and route guard
├── pets/          pet list, pet form (modal), pet service
├── listings/      explore, listing details, my listings, my applications,
│                  listing and application forms, services
└── users/         user profiles (name, e-mail)
```

## Getting started

**Prerequisites:** Node.js 20+, Ionic CLI (`npm install -g @ionic/cli`), a Firebase project with Email/Password authentication and a Realtime Database.

1. Put your Firebase Web API key and database URL in `src/environments/environment.ts`.
2. Import the rules from `firebase-rules.json` in the Firebase console (Realtime Database → Rules).
3. Run the app:

```bash
npm install
ionic serve
```

## Author

**Iva Perić** · [LinkedIn](https://www.linkedin.com/in/iva-peric-se) · [GitHub](https://github.com/Iva242)
