# CodeAssess — Performance Fix, Judge-Quality Input Handling & Admin Portal Prompt

## ROLE

You are a senior full-stack engineer who specializes in two things: (1) **online judge / competitive-programming platform engineering** (the exact discipline behind LeetCode, HackerRank, Codeforces judges — structured stdin/stdout handling, sandboxed multi-language execution, and low-latency grading), and (2) **web performance debugging** (diagnosing slow renders, laggy timers, and unresponsive UI in React apps). Apply both specialties to this codebase. Treat correctness, speed, and data integrity as more important than visual changes — the professor is actively using this to assess real students, so silent bugs (blank test cases, a frozen timer) directly undermine the assessment.

## BUG 1 — Timer is stuck / updates too slowly

**Evidence:** the timer in the top bar shows `--:--:--` and does not appear to be counting down during a live session (see attached screenshot).

Diagnose and fix the root cause — likely one of:
- The timer's countdown state is driven by a `setInterval`/`setTimeout` that was never started, is being cleared immediately after being set (e.g., a dependency array bug in a `useEffect` causing the interval to be torn down and restarted every render), or is blocked by a re-render loop elsewhere on the page.
- The initial "start time" / "duration" value is undefined or not yet loaded from the backend when the timer component first mounts, so it never has a valid value to count down from — add a proper loading state so the timer only starts once the session's start time/duration has actually been fetched.
- The countdown should be computed from an absolute end-timestamp (`sessionStartedAt + durationSeconds`) recalculated each tick, not by decrementing a counter every render — this avoids drift and avoids the timer "slowing down" if the tab throttles background timers or renders are delayed.
- Confirm the timer keeps correct time even if the tab was backgrounded (recompute from the absolute end-timestamp on visibility return, not by continuing to decrement from wherever the counter last was).
- Once the timer hits zero, it must trigger the same auto-submit/lock behavior already specified for the assessment (do not let it just freeze at `00:00:00`).

## BUG 2 — General site/app slowness

Investigate systematically rather than guessing at one fix:
- Profile the frontend (React DevTools Profiler / browser Performance tab) for unnecessary re-renders — especially the Workspace page, since the editor, timer, and test-case panels are all likely re-rendering together on every keystroke if state isn't properly scoped/memoized. Wrap independent panels in `React.memo` and move frequently-changing state (like the timer) into its own component so it doesn't force the Monaco editor or problem panel to re-render every second.
- Check for unnecessary network requests firing on every keystroke or every render (e.g., an API call inside a `useEffect` with a missing/incorrect dependency array causing repeated fetches).
- Check backend response times for `/api/run` and `/api/submit` — if the sandboxed execution step is slow (cold-starting a container per request, for example), consider keeping a warm pool of language runtime containers, or switching to a lighter-weight sandbox strategy, so grading feels closer to instant like on LeetCode/HackerRank.
- Check for large unoptimized assets (fonts, icons, unminified bundles) inflating initial load time.
- After fixing, verify: typing in the editor is smooth with no input lag, switching tabs (Testcase/Result/Description) is instant, and Run/Submit results appear within a couple of seconds for simple correct code.

## BUG 3 — Test cases showing blank / misaligned

**Evidence:** in the attached screenshots, some Testcase panels are empty (e.g., "Case 2" and "Case 3" show no input at all), and displayed test cases don't consistently match the problem's actual input format.

Fix required:
- Every sample/visible test case rendered in the Testcase tab must have real, non-empty input and output data pulled from the database — audit the seed data for each of the three problems and remove/replace any test case row that has a missing or empty `input`/`expectedOutput` field.
- Test case **alignment/formatting must be internally consistent** for a given problem: if Binary Search's input format is "target on the first line, array on the second line," every single test case (visible and hidden) for Binary Search must follow that exact same two-line format — no mixing formats between cases.
- Add a validation check in the seed script (or a startup sanity check) that throws a clear error if any test case for any problem has a blank input or output, so this class of bug can't silently ship again.

## BUG 4 — Input handling must match real judge conventions (HackerRank/LeetCode-style)

Currently the input format is ad hoc (e.g., a single space-separated line with the target first). Replace this with a standard competitive-programming stdin format per problem, and make each language's boilerplate read from stdin accordingly — mirroring how HackerRank/LeetCode structure input:

- **Binary Search** — stdin, two lines:
  ```
  Line 1: space-separated sorted array elements
  Line 2: the key (target) to search for
  ```
  Program prints a single line: the index if found, or `-1` if not found.

- **Quick Sort** — stdin, one line:
  ```
  Line 1: space-separated array elements to sort
  ```
  Program prints one line: the space-separated sorted array.

- **Matrix Multiplication** — stdin, structured as:
  ```
  Line 1: r1 c1 (rows and columns of Matrix A)
  Next r1 lines: c1 space-separated integers each (Matrix A)
  Line: r2 c2 (rows and columns of Matrix B)
  Next r2 lines: c2 space-separated integers each (Matrix B)
  ```
  Program prints the resulting matrix, one row per line, space-separated integers.

Update the starter boilerplate for **all four languages** (Python, Java, C, C++) for all three problems so each one correctly reads this exact stdin shape and prints the exact expected stdout shape — this is what actually needs to match between "Your Output" and "Expected Output," so get the format locked down first and keep it identical across every language's template.

## FEATURE — Updated Problem Statements & Test Cases (replace existing seed data)

Replace the current "About"/problem description and sample test cases for these three problems with the exact data below. Use the first case listed for each problem as the visible sample shown to students; the remaining three (per problem) can be used as part of the hidden grading set (recall from the earlier scoring spec: 4 hidden test cases per problem, 25 marks each, 100 total — these can be the same 4 rows below, reformatted into the stdin/stdout shape defined in Bug 4).

### Binary Search
| Test Case | Input (Sorted Array, Key) | Expected Output |
|---|---|---|
| 1 | Array = [2, 5, 8, 12, 16, 23, 38], Key = 12 | Element found at index 3 |
| 2 | Array = [1, 3, 5, 7, 9, 11], Key = 1 | Element found at index 0 |
| 3 | Array = [10, 20, 30, 40, 50], Key = 50 | Element found at index 4 |
| 4 | Array = [4, 8, 15, 16, 23, 42], Key = 10 | Element not found (-1) |

### Quick Sort
| Test Case | Input Array | Expected Sorted Output |
|---|---|---|
| 1 | [64, 34, 25, 12, 22, 11, 90] | [11, 12, 22, 25, 34, 64, 90] |
| 2 | [5, 1, 4, 2, 8] | [1, 2, 4, 5, 8] |
| 3 | [10, 7, 8, 9, 1, 5] | [1, 5, 7, 8, 9, 10] |
| 4 | [3, 3, 2, 1, 5, 4, 4] | [1, 2, 3, 3, 4, 4, 5] |

### Matrix Multiplication
| Test Case | Matrix A | Matrix B | Expected Output |
|---|---|---|---|
| 1 | [[1,2],[3,4]] | [[5,6],[7,8]] | [[19,22],[43,50]] |
| 2 | [[2,0],[1,3]] | [[4,1],[2,5]] | [[8,2],[10,16]] |
| 3 | [[1,2,3],[4,5,6]] | [[7,8],[9,10],[11,12]] | [[58,64],[139,154]] |
| 4 | [[3,1],[2,4]] | [[1,2],[3,4]] | [[6,10],[14,20]] |

Convert each row above into the stdin/stdout format defined in Bug 4 when seeding the database (e.g., Binary Search case 1 becomes stdin `"2 5 8 12 16 23 38\n12"` and expected stdout `"3"`; Matrix case 1 becomes stdin `"2 2\n1 2\n3 4\n2 2\n5 6\n7 8"` and expected stdout `"19 22\n43 50"`).

## FEATURE — Separate Student / Admin Login (reconfirm and complete if not already done)

- Distinct login entry points: `/login` for students, `/admin/login` for staff.
- `User.role` field (`"student"` | `"admin"`), enforced server-side on every admin route and API call — a student token must get `403` on any admin endpoint.
- Admin accounts are provisioned separately (seed script or a protected admin-creation endpoint) — never exposed on the public student registration form.

## FEATURE — Admin Dashboard: View & Export Results (Excel only, specific columns)

- Admin Dashboard shows a table with **exactly these columns**: Username, Email, Marks (total /100 per problem or overall — pick one and be consistent, e.g. one row per student per problem, or one row per student with a column per problem, and document the choice), and a **Violation** column/flag showing whether that attempt was auto-submitted due to tab-switching (from the `autoSubmitted` field specified earlier).
- **"Download as Excel"** button/endpoint (e.g. `GET /api/admin/results/excel`) exporting exactly those columns — Username, Email, Marks, Violation — as a real `.xlsx` file (use `exceljs` or the `xlsx` package on the backend), one row per student (or per student-per-problem, matching whatever layout you used in the dashboard table).
- No PDF requirement here — Excel is the required export format for the admin view specifically (a student's own individual PDF result, if still wanted from the earlier spec, remains a separate, student-facing feature).

## ACCEPTANCE CRITERIA

- [ ] Timer counts down correctly and visibly from the moment a session starts, survives tab backgrounding without drifting, and triggers auto-submit at zero.
- [ ] Typing, tab-switching between Description/Testcase/Result, and Run/Submit all feel responsive — no visible lag or freeze.
- [ ] Every visible test case shown to students has real, non-empty input and output — no blank cases.
- [ ] All test cases for a given problem use one consistent input/output format; all four language boilerplates for a given problem read/write that same format correctly.
- [ ] Binary Search, Quick Sort, and Matrix Multiplication use the exact test case data provided above, correctly converted into stdin/stdout form.
- [ ] Students log in at `/login`; staff log in at `/admin/login`; role is enforced server-side everywhere.
- [ ] Admin Dashboard displays Username, Email, Marks, and Violation for every student, and can export exactly those columns as a real, correctly formatted `.xlsx` file.