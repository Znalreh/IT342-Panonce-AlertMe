# Frontend Test Results

## Command Executed
```bash
cd "c:\Users\Mirby\Downloads\Latest Final\IT342-Panonce-AlertMe\web"
npm test
```

## Actual Results
- Test runner: `vitest` v1.6.1
- Total test files executed: 4
- Test suites passing: 3
- Test suites failing: 1
- Total tests executed: 22
- Total passed: 20
- Total failed: 2
- Exit code: `1`

## Failed Tests
- `src/app/pages/DashboardPage.test.tsx > DashboardPage > renders dashboard statistics and recent alerts`
- `src/app/pages/DashboardPage.test.tsx > DashboardPage > filters alerts by search input`

## Passing Coverage
### Login Form Validation
- `src/app/pages/LoginPage.test.tsx` passed 5 tests
- Verified:
  - login form fields render correctly
  - email format validation
  - password required validation
  - successful login flow calls `loginUser` and `saveAuthToken`
  - login error message display

### Alert Submission Form
- `src/app/pages/ReportAlertPage.test.tsx` passed 4 tests
- Verified:
  - submission form fields render correctly
  - location validation triggers an error when missing
  - successful alert submission calls `createAlert`
  - file upload input is present and accepts files

### Protected Routes
- `src/app/routes.test.ts` passed 10 tests
- Verified:
  - auth route guard redirects when unauthenticated
  - student dashboard access logic
  - admin access logic
  - OAuth callback and redirect loader behavior

## Dashboard Rendering Coverage Status
- `src/app/pages/DashboardPage.test.tsx` currently has 2 failing tests
- Passing tests in this suite: 1
- Failing assertions are related to alert text selection and filtering behavior

## Evidence Details
Use these artifacts for evidence capture once tests are stable:

1. **Terminal screenshot**
   - Show the `npm test` command and the Vitest summary output
   - Include the failing test names and suite counts

2. **Test log output**
   - Record the full Vitest output from the terminal
   - Include the lines showing `Failed Tests` and test names

3. **Coverage report**
   - Run `npm run coverage` only after fixing failing tests
   - Capture `coverage/lcov-report/index.html` and the `text` summary in the terminal

4. **Result summary**
   - Total tests run: `22`
   - Passed: `20`
   - Failed: `2`
   - Suite status: `3 passed`, `1 failed`

## Notes
- The current test suite is mostly green, but the dashboard assertions need adjustment.
- Coverage reports were not generated because `npm test` exited with failures.
- Once the dashboard tests are fixed, rerun `npm test` and then `npm run coverage`.
