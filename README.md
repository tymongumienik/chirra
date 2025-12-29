<div align="center">
  <img src="https://raw.githubusercontent.com/tymongumienik/chirra/refs/heads/main/public/logo-hd.png" alt="Logo (by off.777 on Discord)" width="200">
  <br>
  <h1>Chirra</h1>
</div>

Chirra (`/ˈkʲira/`) is a full-stack Next.js chat service, powered by WebSockets.

> Chirra is in very early development and is not ready for any production use.

## Stack

- Bun
- Next.js 16 (App Router) & next-ws
- Tailwind CSS
- Zustand
- React Query
- Elysia (Eden Treaty)
- SuperJSON (for API/WS responses)
- Prisma (with PostgreSQL)
- Lucia
- React Email & Nodemailer
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
- [x] WebSocket communication, live updates
- [ ] Chat system: database schema, message storage
- [x] Scaffold frontend: login/registration, email verification
- [x] Create frontend for chat interface 
- [x] Password reset
- [ ] Profile settings page
- [x] Rate limiting
- [ ] Tests
- [ ] Production deployment

## License

Chirra is licensed under AGPL-3.0  (see [LICENSE](LICENSE)). Feel free to modify and use it in accordance with your requirements.
