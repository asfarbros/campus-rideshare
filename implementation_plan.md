# Transitioning to Full Clerk Authentication

Even when using Clerk for authentication, we still need a `User` record in MongoDB. This is because your application has relationships between users and other data. For example, a `Ride` needs to know who its `driver` is, and it expects a reference to a MongoDB `User` document so it can easily pull their `name` and `email` for the frontend. 

Instead of dealing with passwords in MongoDB, we will use a concept called **Data Synchronization**. We will let Clerk handle all the security and session tokens, but we will store a matching `User` profile in MongoDB linked by a `clerkId`.

Here is the plan to move away from the custom JWT tokens and rely 100% on Clerk's session tokens across the entire stack.

## Proposed Changes

### Backend Migration

We will install `@clerk/clerk-sdk-node` to verify Clerk session tokens securely on your backend.

#### [MODIFY] `package.json`
- Run `npm install @clerk/clerk-sdk-node` in the backend to install the Clerk SDK.

#### [MODIFY] `models/User.js`
- Add `clerkId` as a unique string.
- Make the `password` field optional, as Clerk manages this securely.

#### [MODIFY] `middleware/authMiddleware.js`
- Replace the custom `jsonwebtoken` logic with Clerk's verification.
- When a valid Clerk token is received, the middleware will find the corresponding user in MongoDB using their `clerkId` and attach their MongoDB `_id` to `req.user`. This ensures none of your other controllers (like `rideController.js`) break.

#### [MODIFY] `controllers/authController.js`
- Delete the old `login` and `register` functions.
- Update `clerkAuth` (which `/sync-clerk` calls) to expect the `clerkId`, `email`, and `name`. It will either find the user by `clerkId` or create a new user without a password. It will no longer generate or return a custom JWT token.

### Frontend Migration

We will stop using `localStorage.getItem("token")` and configure Axios to automatically attach the Clerk session token to every API request.

#### [MODIFY] `src/services/api.js`
- Remove the interceptor that reads the custom token from `localStorage`.

#### [MODIFY] `src/App.jsx`
- Add a new `<ApiSetup>` wrapper component inside your router. This component will use Clerk's `useAuth().getToken()` to fetch the active session token and automatically inject it into all Axios requests.

#### [MODIFY] `src/pages/SyncClerk.jsx`
- Update the payload sent to `/auth/clerk-auth` to include the user's `clerkId`.
- Remove the logic that saves a token to `localStorage`.

## Verification Plan

### Manual Verification
1. I will start the frontend and backend servers.
2. We can log out and log back in through the frontend UI.
3. We will verify that requests to protected routes (like fetching "My Posted Rides" or creating a ride) succeed and are authenticated purely via Clerk tokens.

## Open Questions

> [!NOTE]
> Please review the plan above. If everything looks good, click **Proceed** and I will implement these changes!
