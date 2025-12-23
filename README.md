# Chirra

> Chirra is in very early development and is not ready for any production use.

Chirra (`/ˈkʲira/`) is a full-stack Next.js chat service, powered by WebSockets.

## Stack

- Bun
- Next.js 16 (App Router)
- Tailwind CSS
- Zustand
- React Query
- Elysia
- Eden Treaty
- Lucia
- PostgreSQL
- Prisma
- React Email
- Nodemailer
- Biome

## Setup

You'll need Bun and PostgreSQL installed.

```bash
# Install deps
bun install

# Copy env file and fill it out
cp .env.example .env

# Set up the database
bunx prisma generate
bunx prisma db push

# Start dev server
bun run dev
```

Make sure to update the `.env` file with your actual database credentials and SMTP settings.

## Scripts

```bash
bun run dev       # Development server
bun run build     # Production build
bun run start     # Start production server
bun run lint      # Lint with Biome
bun run format    # Format code
bun run email:dev # Email preview server
```

## Roadmap

- [x] API routes: login, register, verify email
- [x] Session management
- [x] User profiles
- [x] Argon2 password hashing
- [ ] WebSocket communication, live updates
- [ ] Chat system: database schema, message storage
- [ ] Scaffold frontend: login/registration, email verification
- [ ] Create frontend for chat interface 
- [x] Password reset
- [ ] Profile settings page
- [x] Rate limiting
- [ ] Tests
- [ ] Production deployment

## License

Chirra is licensed under AGPL-3.0  (see [LICENSE](LICENSE)). Feel free to modify and use it in accordance with your requirements.
