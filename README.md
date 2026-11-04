# AlphaCI order desk: pass

[![Strict preflight](https://github.com/St-Peter-Sandbox/alphaci-demo-pass/actions/workflows/ci.yml/badge.svg)](https://github.com/St-Peter-Sandbox/alphaci-demo-pass/actions/workflows/ci.yml)

This is the correct implementation. Its strict checks must pass before calling the demo ready.


## What this repository is

A copy-source demo with a React frontend in `frontend/` and a .NET 10 API in `backend/`. It is not registered as an AlphaCI project. CI builds and tests code on temporary GitHub runners. It does not publish images, register a release, deploy to the Windows Server, create promotion PRs, or call AlphaCI reporting endpoints.

The source implements an order quote. Orders of ten or more get a 10% discount and free delivery. Smaller orders have a ₱50 delivery fee. All calculations use integer cents. A ten-item order at ₱250 per item must total ₱2,250.

## Checks

The GitHub workflow calls AlphaCI's published reusable workflows at commit `b107b06612c698fba7fd17463b2ffb3b575a87ee`, the verified `v1` revision when this demo was prepared. The same strict workflow is used for both examples, including warnings-as-errors and a 95% unit-coverage requirement. No gate is skipped to manufacture a pass.

Checks cover React/Jest, coverage, ESLint, TypeScript, npm's high/critical vulnerability policy, Playwright, .NET/xUnit and HTTP tests, coverage, format, analyzers, NuGet audit, Gitleaks, license inventory, SBOM, and blocking SonarCloud analysis for both languages. A separate job runs the real Bruno collection against an API process on the temporary runner. Once quality checks pass, both Dockerfiles are built and their containers smoke-tested on the runner. This is build validation, not deployment to a customer environment.

Only the React bootstrap `src/main.tsx` and its declaration file are excluded from frontend unit coverage. The UI, API client, validation and calculation logic are measured. Backend coverage excludes SDK-generated files under `obj/`, including generated OpenAPI documentation helpers; all application source is measured. Backend tests include HTTP tests of health, OpenAPI, input validation and quotes.

GitHub Actions requires working runner capacity and access to package registries and SonarCloud. A green sample run proves this commit and its checks; it does not prove tomorrow's AlphaCI deployment credentials, access gate, callbacks, promotion approvals or host readiness.

## Copy during the live demo

1. Create the real project in AlphaCI during the presentation. Select **React frontend**, **.NET backend**, **Node 24**, and **.NET 10**. Use separate frontend/backend repositories with each application at the repository root.
2. Clone those newly generated repositories. Keep their generated `.github/`, project metadata, Sonar configuration and credentials.
3. Clone this sample repository separately.
4. Preview the copy in PowerShell from this sample's root:

```powershell
.\Copy-Demo.ps1 -FrontendRepository C:\Demo\new-project-fe -BackendRepository C:\Demo\new-project-be -ReplaceStarter -WhatIf
```

5. Run the same command without `-WhatIf`. The script requires clean Git clones. It replaces starter source/tests and conflicting build configuration, including old .NET solution files. It preserves the target's `.git/`, `.github/`, README and existing Sonar/editor configuration.
6. Review `git diff`, commit on the working branch, and push through AlphaCI's normal branch/PR flow. Do not copy this sample's top-level `.github/` into the real project. That workflow is a standalone preflight, not the generated project pipeline.

You can also copy `frontend/` into the frontend repository root and `backend/` into the backend repository root by hand. Remove the replaced starter source/tests and old solution/config files first so duplicate configurations do not remain.

To show a failure then recovery, first copy the failing source and let the tests fail. Then replace it with the passing source, commit, and rerun. The tests and workflow remain unchanged.

## Run locally

Frontend, with Node 24 or newer:

```text
cd frontend
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm test -- --coverage
npm run build
npx playwright install chromium
npm run test:e2e
```

The UI works as a local preview by default. To use server-side quotes, set `VITE_API_BASE_URL` to the backend's origin before building the frontend. This is a public API address, never a secret. Add the frontend origin to the backend's `CORS_ORIGINS` setting. Both containers expose port 8080 internally; publish them on different host ports for local use.

Backend, with the .NET 10 SDK:

```text
cd backend
dotnet restore
dotnet format --verify-no-changes --severity warn --no-restore
dotnet build -c Release --no-restore -warnaserror
dotnet test -c Release --no-build --collect:"XPlat Code Coverage"
dotnet run --project src/OrderDesk/OrderDesk.csproj --urls http://localhost:8081
```

Health is `/health`, OpenAPI is `/openapi/v1.json`, and the API accepts `POST /api/quotes` with `{"quantity":10,"unitPriceCents":25000}`. The Bruno collection lives in `backend/tests/api`.

## Standalone CI secrets

The sample's GitHub Actions secrets are configured by the maintainer: `SONAR_TOKEN`, `SONAR_ORGANIZATION`, `FRONTEND_SONAR_PROJECT_KEY`, and `BACKEND_SONAR_PROJECT_KEY`. Values are never committed. Automatic Analysis is disabled on these four SonarCloud projects because CI performs the analysis. These sample keys are not credentials or settings for the real AlphaCI project created during the demo.
