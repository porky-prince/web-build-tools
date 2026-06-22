---
name: nodejs-project
description: Use when working in a Node.js project, including application code,
  packages, workspaces, scripts, dependencies, module imports, tests, build
  tooling, runtime behavior, publishing, or deployment-related project rules.
license: MIT
metadata:
  author: porky-prince
  version: '1.0.0'
---

# Node.js project

This skill defines the coding standards that AI agents must follow in Node.js
projects. Treat it as a general, expandable rule index for Node.js project work.

## Activation

Apply this skill when the project is a Node.js project, such as when the
repository or package contains `package.json`, uses a Node.js package manager,
or depends on a Node.js runtime or build toolchain.

Use it before making any Node.js project change, including source code,
configuration, package metadata, dependency management, module resolution,
scripts, tests, build tooling, publishing, or deployment behavior.

## Scope

This skill can cover any durable convention that affects how AI agents work in
Node.js repositories. Common areas include package metadata, dependency
management, workspace boundaries, module systems, Node.js built-in APIs,
TypeScript and JavaScript source conventions, scripts, tests, build tooling,
runtime configuration, publishing, and deployment.

The `Table of Contents` is the stable index for those rule areas. Add future
Node.js project rules to that index and keep detailed guidance in focused
reference files.

## How to use this skill

Start from the `Table of Contents`, then read only the sections that match the
task. If a task touches multiple areas, apply every relevant section. When a
future section is added, preserve the numbering and hierarchy so references stay
stable.

## Table of Contents

1. [Dependencies Management](references/_sections.md#1-dependencies-management)
   — **CRITICAL**
   - 1.1
     [Installation of Dependencies](references/installation-of-dependencies.md)
     — CRITICAL
   - 1.2 [Use of Dependencies](references/use-of-dependencies.md) — CRITICAL

## Extension rules

Keep this file as the entry point for the skill. Put detailed rules in
`references/`, then link them from the `Table of Contents`.

When adding new rules:

1. Add or update the matching section in `references/_sections.md`.
2. Add the detailed reference file under `references/` when the rule needs more
   than a short summary.
3. Preserve existing section numbers and headings unless the user explicitly
   asks for a restructure.
4. Mark the impact level clearly, such as `CRITICAL`, `HIGH`, or `MEDIUM`.
5. Keep the body concise so agents can quickly choose the relevant reference.
