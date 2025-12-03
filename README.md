# TOTP Storage Application

A simple web application for storing and generating Time-based One-Time Passwords (TOTP).

## Features

- Add new TOTP keys with optional issuer and label
- List stored TOTP keys with pagination
- Generate and copy current TOTP tokens to clipboard
- Simple, unauthenticated access

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [otplib](https://www.npmjs.com/package/otplib) - TOTP generation
- [qrcode](https://www.npmjs.com/package/qrcode) - QR code generation

## Getting Started

### Prerequisites

- Node.js (version specified in `.npmrc`)
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Visit `http://localhost:5173` to view the application.

### Building for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## API Endpoints

- `POST /api/totp` - Add a new TOTP entry
- `GET /api/totp/list` - List TOTP entries (paginated)
- `GET /api/totp/[id]` - Get a specific TOTP entry
- `GET /api/totp/[id]/token` - Generate current token for a TOTP entry

## Usage

1. Add a new TOTP key by filling in the issuer and label (both optional)
2. The application generates a new secret and stores it
3. View your stored keys in the list
4. Click "Copy Token" to generate and copy the current TOTP token to your clipboard

## Security Note

This is a demonstration application that stores TOTP keys in memory. In a production environment, you would want to:

- Implement proper authentication and authorization
- Use a persistent, secure database
- Encrypt stored secrets
- Implement rate limiting
- Add audit logging