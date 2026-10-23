# Marthington

This repository contains the existing static site at the repository root, a React/Parcel client, and an Express/Mongoose API.

## Local development

### Client

```sh
cd client
npm install
npm start
```

Parcel serves the client at `http://localhost:1234`.
Copy `client/.env.example` to `client/.env` if the API is hosted at a different address. `API_URL` is public client configuration, not a place for secrets.

### API

```sh
cd server
npm install
```

Copy `.env.example` to `.env`, configure `MONGODB_URI` and a random `JWT_SECRET` with at least 32 characters, then run:

```sh
npm run dev
```

The API starts on port `5000` by default. Set `CLIENT_ORIGINS` to a comma-separated list of exact permitted client origins when deploying.

### Provision accounts

There is no public account registration or role-selection endpoint. Set `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD` in the local server `.env` and run `npm run create-super-admin` once to create the owner account. The password must be 12-72 UTF-8 bytes. For additional `admin` or `agent` users, set `STAFF_NAME`, `STAFF_EMAIL`, `STAFF_PASSWORD`, and `STAFF_ROLE`, then run `npm run create-staff-user`. Remove provisioning credentials from the environment after each command. Never set them on the running API service.

## Implemented API

- `POST /api/auth/login` and `GET /api/auth/me` issue and validate short-lived bearer tokens.
- `GET /api/admin/configuration` is super-admin-only and reports configuration readiness without returning secret values.
- `GET /api/services` is public; service creation and updates require `superAdmin`.
- `POST /api/appointments` accepts a service selection and future preferred time as a booking request. Admins can list requests and update their status; submitted times are not automatically confirmed or checked against a live availability calendar.
- `POST /api/leads` captures an enquiry, optional referral code, and an explicit tips opt-in choice. Admins can view leads.
- Admins can update lead status (`new`, `contacted`, or `converted`) through `PATCH /api/leads/:id`.
- Agent accounts receive a unique referral code when provisioned. `GET /api/agents/me/stats` returns only aggregate counts for that agent's leads; the agent dashboard shows a shareable referral URL and never returns individual lead contact details.
- Admins and super admins can list and create basic contacts and update allowed contact fields/status through `/api/patients`.
- Admins and super admins can create and update campaign records through `/api/campaigns`.
- The staff growth workspace lists enquiries and campaign drafts. Super admins can create, edit, publish, and hide service catalogue entries. Campaign status changes are planning-only and never dispatch messages.
- The responsive collapsible sidebar shows a logo mark when minimized and the logo, company name, and tagline when expanded. Super admins can update the company name, tagline, and PNG/JPEG/WebP logo (maximum 256 KB) in **System settings**. Branding is stored in MongoDB and updates the browser tab title and favicon.
- The collapsible website sidebar and browser-tab favicon use super-admin-managed public branding. Company name, tagline, and a PNG/JPEG/WebP logo (up to 256 KB) are stored in MongoDB and shown on the public website. The uploaded logo is also used as the browser favicon.
- Login and public lead intake are rate limited. Patient/lead endpoints only return basic contact and consent-choice fields, not clinical notes.

The staff screen signs in against the API and keeps its access token only in memory; reloading the page requires signing in again. WhatsApp links are only offered when a contact's WhatsApp permission checkbox is selected. Opening a WhatsApp link does not send or record delivery of a message.

## Deployment environment settings

The super-admin practice dashboard includes **System settings** for a safe runtime health check. It shows whether the API has `MONGODB_URI` and `JWT_SECRET`, whether MongoDB is connected, and basic non-secret runtime details. It never returns secret values.

Change server environment variables in the Render API service's **Environment** settings, then restart or redeploy the API. Change the public client `API_URL` in the Vercel project's **Settings → Environment Variables**, then redeploy the client. Do not enter MongoDB URIs, passwords, or signing secrets into the application UI or client-side environment variables. A MongoDB URI change takes effect after restarting the API process.

## Scope and safety

This is an initial implementation, not a production-ready clinical system. Appointment requests are not connected to a calendar and do not prevent double-booking. It does not yet include staff-account management in the UI, consent evidence/withdrawal records, audit logging, message delivery/follow-up automation, patient portal, chatbot/AI, or security/privacy compliance review. Do not enter real patient health information or rely on it for care delivery until the relevant safeguards, legal requirements, and operational procedures have been independently reviewed. Configure secrets through the hosting provider and never commit `.env` files.

Run the focused API tests with `cd server && npm test`. Build the client with `cd client && npm run build`.
