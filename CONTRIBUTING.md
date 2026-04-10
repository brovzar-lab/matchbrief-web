# Contributing Guidelines

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | React Query (server state) + Zustand (client state) |
| Backend/Auth | Firebase (Auth, Firestore, Storage, Functions) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier |
| Monorepo | Turborepo + npm workspaces |

## Project Structure

```
/
├── apps/           # Individual applications
│   └── <app-name>/
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── packages/       # Shared packages
│   └── shared/     # Shared utilities, types, constants
├── .github/
│   └── workflows/  # CI/CD pipelines
├── package.json    # Root workspace config
├── turbo.json      # Turborepo config
├── tsconfig.base.json
├── .eslintrc.json
└── .prettierrc
```

## Creating a New App

```bash
cd apps
npm create vite@latest <app-name> -- --template react-ts
cd <app-name>
# Update package.json name to match directory
# Extend tsconfig from ../../tsconfig.base.json
```

## Coding Conventions

### TypeScript
- Use strict mode (enabled in base tsconfig)
- Prefer `type` over `interface` for object shapes
- Always type function return values explicitly
- Use `const` assertions where applicable
- No `any` — use `unknown` and narrow where needed

### React
- Functional components only
- Custom hooks for reusable logic (prefix with `use`)
- Keep components small and focused (< 200 lines)
- Co-locate component tests with components (`Component.test.tsx`)

### Naming
- Components: `PascalCase`
- Hooks: `camelCase` with `use` prefix
- Files: `kebab-case` for utilities, `PascalCase` for components
- Constants: `SCREAMING_SNAKE_CASE`

### Git Workflow
- Branch from `develop` for features: `feature/<ticket-id>-short-desc`
- Branch from `main` for hotfixes: `hotfix/<ticket-id>-short-desc`
- Commit messages: `<type>(<scope>): <short summary>` (conventional commits)
  - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- PRs require at least 1 approval before merging
- Squash merge to keep history clean

### Firebase
- Use Firebase Emulators locally — never test against production
- Firestore rules must be reviewed before any schema change
- Environment config via `.env.local` (never commit secrets)

## Environment Setup

```bash
# Install dependencies
npm install

# Copy env template for an app
cp apps/<app-name>/.env.example apps/<app-name>/.env.local

# Start dev (all apps)
npm run dev

# Build all
npm run build

# Lint all
npm run lint
```
