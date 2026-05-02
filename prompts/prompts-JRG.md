## Prompt v1 — Jest Testing Environment Setup

```
You are a Senior Software Engineer and Jest testing expert with deep knowledge of TypeScript, Node.js testing architectures, and test automation best practices.

### CONTEXT

This repository is a full-stack application called LTI - Talent Tracking System.

#### Backend
The backend is a Node.js + Express application written in TypeScript, using Prisma as an ORM. It follows a layered architecture:

- `application/` — application logic (services, validators)
- `domain/` — domain models (Candidate, Education, Resume, WorkExperience)
- `presentation/` — controllers
- `routes/` — Express route definitions

Relevant existing configuration:
- `tsconfig.json` targets `es5`, uses `commonjs` modules, with `strict` and `esModuleInterop` enabled.
- `package.json` already includes the following in `devDependencies`: `jest`, `ts-jest`, `@types/jest`, and `typescript`.
- A `"test": "jest"` script already exists in `package.json`.
- No `jest.config.ts` or `jest.config.js` file exists yet.

Important Prisma note: every domain model (`Candidate`, `Education`, `WorkExperience`, `Resume`) instantiates its own `PrismaClient` at module level via `const prisma = new PrismaClient()`. There is no shared singleton. Tests must intercept the `@prisma/client` module itself so that every `new PrismaClient()` call returns a controlled mock — without modifying any production code.

#### Frontend
The frontend is a React 18 application bootstrapped with Create React App (CRA), written in a mix of `.js` and `.tsx` files. It intentionally runs Jest in standalone mode (not via `react-scripts test`).

Relevant existing configuration:
- `package.json` already includes in `dependencies`: `@testing-library/jest-dom@^5`, `@testing-library/react@^13`, `@testing-library/user-event@^13`, and `@types/jest@^27`.
- The `"test"` script is already set to `jest --config jest.config.js`.
- No `jest.config.js` exists yet, and `jest` is not an explicit direct dependency.
- `typescript@^4.9.5` is present; the app has both `.js` and `.tsx` source files.

---

### TASK

Set up a complete, production-quality Jest unit testing environment for **both the backend and the frontend**. Follow these two steps in order:

---

**STEP 1 — Propose the toolchain (do NOT install anything yet)**

Present two separate tables — one for the backend and one for the frontend. For each library include:
1. Package name (exact npm name)
2. Whether it is a `dependency` or `devDependency`
3. Its specific purpose in this project's testing stack
4. Why you chose it over common alternatives (if applicable)

Clearly mark any package that is already present so it is obvious what net-new installs are required.

Wait for my approval before proceeding to Step 2.

---

**STEP 2 — Provide the setup commands (only after approval)**

Provide two clearly separated sections of copy-paste-ready terminal commands — one for `backend/` and one for `frontend/`.

For the **backend**, cover:
1. Install any missing Jest + TypeScript prerequisites
2. Install `ts-jest` and required peer packages
3. Run `ts-jest config:init` to generate `jest.config.js`
4. Set up the Prisma mock infrastructure:
   - Create `src/__mocks__/prismaClient.ts` that uses `mockDeep<PrismaClient>` from `jest-mock-extended` as a singleton; the mock `PrismaClient` constructor must always return that singleton so every `new PrismaClient()` call in production models gets the same controllable instance. Include a `beforeEach` that calls `mockReset` to ensure test isolation. Re-export the real `Prisma` namespace via `jest.requireActual` so `instanceof Prisma.PrismaClientInitializationError` checks still work.
   - Add a `moduleNameMapper` entry to `jest.config.js` that redirects `@prisma/client` to the mock file above.
5. Confirm the final `"test"` script

For the **frontend**, cover:
1. Install `jest` and any missing prerequisites
2. Install the Babel transformation stack required for JSX and TypeScript in standalone Jest (not `react-scripts`)
3. Install `jest-environment-jsdom` (required for DOM testing outside CRA)
4. Create a `jest.config.js` that configures `jsdom` environment, the Babel transformer, and `@testing-library/jest-dom` setup
5. Confirm the final `"test"` script

For each command, prefix it with a one-line comment explaining what it does.

---

### CONSTRAINTS

- Respect all existing `tsconfig.json` settings in both packages; do not alter them unless strictly required, and explain why if you must.
- All new packages must be installed as `devDependencies` (use `--save-dev`). Do not move existing packages.
- Prefer minimal, purposeful additions — do not add libraries that are not clearly justified.
- Do not generate example test files unless asked.
- Backend: use versions compatible with `typescript@^4.9.5` and `jest@^29`.
- Frontend: use versions compatible with the existing `@testing-library/*@^13`/`^5` and `@types/jest@^27` baseline.
```

### PROMPT v2: Accept the Plan

- Proceed with the configuration artifact for both backend and frontend.
- Backend tests will be located in `src/__tests__/` to avoid modifying `tsconfig.json`.
- Frontend tests will also be located in `src/__tests__/` for consistency.
- Regarding the suggested additional libraries for both packages, install them and make the necessary changes without modifying production code.
- Set up the Prisma mock infrastructure for the backend: create the `src/__mocks__/prismaClient.ts` singleton mock and wire `moduleNameMapper` in `jest.config.js`.
- Update any documentation in the project to include all changes done.