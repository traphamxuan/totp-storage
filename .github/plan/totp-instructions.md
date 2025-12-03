## Plan: SvelteKit TOTP Webapp (Public & Private)

Design and implement a SvelteKit full-stack webapp for TOTP generation, supporting both public and private user flows. Public secrets can be fully open or protected by a challenge key; private secrets require user authentication via Clerk OAuth. Cloudflare Turnstile captcha is used for public secret operations to prevent abuse. Users choose their preferred security level, with clear guidance provided.

### Steps
1. **Requirements & Documentation**
   - Document user flows, secret types, and security trade-offs in `README.md` and onboarding UI.
2. **Backend API Design (`src/routes/api/totp/`)**
   - Endpoints for:
     - Fully public secrets (list, add, import, filter)
     - Challenge-protected secrets (require key/password for access)
     - Private secrets (CRUD, per-user, requires Clerk OAuth)
   - Integrate Cloudflare Turnstile captcha for public secret actions.
   - Enforce access logic and secure storage for all secret types.
3. **Authentication**
   - Implement Clerk OAuth for private user login and session management.
   - Ensure private endpoints are protected and only accessible to authenticated users.
4. **Frontend Implementation**
   - Build onboarding/dashboard UI for user choice (public/private).
   - Public dashboard: list all fully public secrets, access challenge-protected secrets (prompt for key/password).
   - Private dashboard: manage secrets, view OTPs, CRUD operations.
   - OTP display: generate and refresh codes client-side.
   - Integrate captcha above submit buttons for public secret forms.
5. **Security & UX**
   - Store private secrets securely (e.g., encrypted at rest).
   - Display clear info/tooltips about security options and trade-offs.
   - Test captcha placement for accessibility and usability.

### Further Considerations
1. Challenge key generation/management for public secrets.
2. Rate limiting and abuse prevention for public endpoints.
3. Document security model and user guidance in onboarding and help sections.
