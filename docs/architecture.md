# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- **Presentation tier decision:** Use React components and the shared API client in `octofit-tracker/frontend/src` to display data from the backend. Each page should handle loading, empty, success, and error states. Error messages should be accessible through an element with `role="alert"`.

- **Logic tier decision:** Use Express and TypeScript routes/services in `octofit-tracker/backend/src` to implement the documented API contracts. Validate request data and return appropriate HTTP status codes instead of allowing invalid input to cause server errors.

- **Data tier decision:** Use the existing Mongoose models and seed script to store and retrieve application data from MongoDB. Validate IDs and confirm that referenced users and teams exist before creating activity records.

- **Activity tracking approach:** Implement activity listing and creation. Validate `userId`, `teamId`, `type`, and `minutes`. Store the referenced user and team, activity type, minutes, computed points, and occurrence time. Return a deliberate 4xx response for invalid IDs or missing references.

- **Team management approach:** Implement team listing and creation. Preserve the submitted team name and mascot, include team members as required by the existing contract, and return HTTP 400 when the team name is missing.

- **Leaderboard approach:** Calculate the total activity points for each team, sort teams from highest to lowest total, and return `teamName`, `totalPoints`, and a 1-based `rank` for each entry.

- **Workout suggestions approach:** Find the user by email and use recent activity patterns or the user's goal to recommend relevant workouts. Include a reason for each recommendation, ensure the first suggestion matches the user's goal or recent activity, and return a deliberate 4xx response when the email does not match a user.

## Test plan

Run the following commands and record the actual results. A failing test identifies behavior that needs investigation; it does not automatically mean the implementation is wrong.

- **Data-tier command:** `npm run test:data --prefix octofit-tracker/backend` — checks data models, persistence, and data-related behavior. Failures may indicate problems with schemas, references, or database operations.

- **API command:** `npm run test:api --prefix octofit-tracker/backend` — checks API routes, request validation, response status codes, and returned data. Failures may indicate missing endpoints or incorrect API behavior.

- **Frontend command:** `npm test --prefix octofit-tracker/frontend` — checks page behavior and API integration. The initial test output showed 15 failing tests in `tests/app.contract.test.tsx`. The pages displayed "Implementation pending" instead of the expected empty states and accessible error messages. Rerun this command after implementation and record the updated results.

- **Backend build command:** `npm run build --prefix octofit-tracker/backend` — checks whether the backend TypeScript code compiles successfully.

- **Frontend build command:** `npm run build --prefix octofit-tracker/frontend` — checks whether the frontend builds successfully.

- **Test execution order:** Run the baseline tests before editing code. Implement and test the data tier first, followed by the API and frontend. Finish by running all tests and both build commands again. Record the command, result, and any remaining failures after each run.

### Baseline test results

- **Data tests:** 1 passed, 4 failed. The User, Team, Activity, and Workout model validation rules need implementation.
- **API tests:** 4 failed. Activity and team validation return HTTP 501 instead of HTTP 400, the leaderboard returns an empty list, and workout suggestions are missing the expected `reason`.
- **Frontend tests:** 15 failed in the initial run. The pages display "Implementation pending" instead of the expected page content and error states.

These results were collected before implementation. Rerun the tests after making changes and update the results.