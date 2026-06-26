# Sections

This file is the section registry for the `nodejs-project` skill. It defines
the stable numbering, headings, impact levels, and reference files for Node.js
project rules.

Use this registry as the canonical place to discover which rule areas exist.
Preserve existing numbers and headings when adding future sections so links and
references stay stable.

## 1. Dependencies management

**Impact:** CRITICAL

This section covers dependency-related rules for Node.js projects, including
package manager selection, dependency classification, workspace targeting,
runtime availability, and safe reuse of installed packages.

### 1.1 Installation of dependencies

**Impact:** CRITICAL

Read `installation-of-dependencies.md` before installing, removing, upgrading,
or manually editing dependencies.

### 1.2 Use of dependencies

**Impact:** CRITICAL

Read `use-of-dependencies.md` before adding imports, using installed packages,
or implementing behavior that might already exist in available dependencies.
