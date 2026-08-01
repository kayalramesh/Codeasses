# Engineering Decisions for CodeAssess

This document logs engineering decisions made during the development of CodeAssess, especially where the specification left room for interpretation.

### Execution Sandbox: Piston API
**Decision:** Instead of requiring a local Docker daemon and manually provisioning per-language containers (which is brittle for arbitrary execution environments and requires setup), the application uses the **Piston Code Execution API** (an open-source multi-language execution engine). 
**Reason:** Piston natively supports resource constraints, timeouts, and network isolation, ensuring security without maintaining complex local Docker-in-Docker setups. The public API (`https://emacs.piston.rs/api/v2/execute`) allows instant testing of Python, Java, C, and C++ out-of-the-box.

### Database: SQLite with Prisma
**Decision:** The application uses SQLite via the Prisma ORM for the first version.
**Reason:** The prompt allows falling back to SQLite if PostgreSQL isn't available. For an isolated build and demo, SQLite avoids requiring the user to run a Postgres service locally. Prisma makes it trivial to swap to Postgres later (just a one-line configuration change).

### Language Implementations
**Decision:**
- **Python 3**: Piston alias `python`
- **Java 17+**: Piston alias `java`
- **C**: Piston alias `c`
- **C++**: Piston alias `cpp`
**Reason:** These align exactly with the prompt's language requirements.

### Test Case Matching
**Decision:** String comparisons will trim all trailing whitespace and blank lines. No robust AST or array comparisons are performed outside of string normalization for simplicity unless required. If array representations differ per language (e.g., Python `[1, 2, 3]` vs Java `[1, 2, 3]`), the testcases and starter code will enforce a specific output format, or the string comparison will strip formatting like brackets and spaces.
**Reason:** Output format can vary widely between languages. The simplest way to handle this is standardizing the output structure (e.g. printing space-separated values).

### Frontend Routing
**Decision:** `react-router-dom` is used for client-side routing.
**Reason:** Industry standard for Vite + React SPAs.
