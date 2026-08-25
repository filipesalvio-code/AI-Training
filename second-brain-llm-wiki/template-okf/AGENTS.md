# LLM Wiki in Open Knowledge Format

This directory combines the LLM Wiki pattern described by Andrej Karpathy with
the Open Knowledge Format (OKF) v0.2 specification:

- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

## Core idea

Keep a persistent Markdown wiki between the user and their sources. Instead of
rebuilding knowledge from raw documents for every question, read the sources,
extract what matters, and integrate that content into the existing wiki.

The wiki should accumulate value: new sources and new questions can update
existing pages, connections, comparisons, and syntheses.

The user selects sources, explores content, and asks questions. The agent
maintains the wiki: summarizes, organizes, creates relationships, updates
pages, and ensures consistency.

## Architecture

### `raw/`

Curated collection of source documents, such as articles, papers, images, and
data files.

- It is the source of truth.
- The agent may read its files, but must never modify them.
- It is not part of the OKF bundle, so its files do not need to follow the
  concept document format.

### `wiki/`

OKF v0.2 knowledge bundle and directory of Markdown files generated and
maintained by the agent. It may contain summaries, entity pages, concept pages,
comparisons, overviews, and syntheses.

- The agent creates and updates pages.
- The agent maintains cross-references and consistency across them.
- The user and any OKF-compatible consumer query the result.
- The bundle root is `wiki/`; links starting with `/` are relative to it.

### `AGENTS.md`

Operational schema used by Codex. It defines the structure, conventions, and
flows followed by the agent. It may evolve through use, in collaboration with
the user. It is not part of the OKF bundle.

## OKF concept documents

Every `.md` file inside `wiki/`, except the reserved names `index.md` and
`log.md`, represents exactly one concept. The path without the `.md` extension
is that concept’s stable identifier. Prefer descriptive filenames in
`kebab-case` and do not change paths without updating inbound links.

Each concept document must be UTF-8 and start with YAML frontmatter:

```markdown
---
type: Concept
title: Human-readable concept name
description: One-sentence summary of the concept.
resource: https://example.com/canonical-resource
tags: [topic, context]
generated:
  by: human:user
  at: 2026-07-23T12:00:00-03:00
sources:
  - id: primary-source
    resource: https://example.com/source
    title: Primary source
---

# Overview

Structured content connected to [another concept](/concepts/other.md),
according to the [primary source][^primary-source].

[^primary-source]: Primary source

```

Frontmatter rules:

- `type` is required; it must be a short, non-empty, self-explanatory string.
- `title`, `description`, `resource`, and `tags` are recommended when their
  values are known.
- `generated` is recommended to record how the current content was produced and
  when its last significant change occurred.
- `verified`, `status`, and `stale_after` are optional and should be used when
  confirmation, lifecycle needs, or refresh policy is required.
- `sources` is recommended when the concept derives from identifiable sources.
- `description` must contain a single sentence useful for indexes and search.
- `resource` identifies the canonical resource described by the page; omit it
  for abstract concepts with no corresponding resource.
- `tags` must be a YAML list of short strings.
- `generated.by` must follow the actor convention: `<producer>/<version>` for
  agents and tools, `human:<id>` for people, and `process:<id>` for automated
  processes.
- `generated.at` and `verified[].at` must use ISO 8601 date-time.
- `verified` is a list of verification events, each with `by` and `at`.
  A single event can also be written as a mapping without a list.
- `status` accepts `draft`, `stable`, or `deprecated`; when absent, the concept
  is considered `stable`.
- `stale_after` is an absolute date in `YYYY-MM-DD` format; the concept becomes
  stale when the current date is equal to or later than it.
- Additional fields are allowed when justified by the domain. Preserve unknown
  fields when editing a page.
- Do not invent missing metadata just to fill frontmatter.

There is no universal type taxonomy. Use a small set of consistent,
self-explanatory values, such as `Source Summary`, `Entity`, `Concept`,
`Comparison`, `Synthesis`, `Playbook`, `Attested Computation`, or
domain-specific types.

### Provenance and trust

When a concept is derived from external material or another concept, use
`sources` in frontmatter:

~~~yaml
sources:
  - id: primary-source
    resource: https://example.com/source
    title: Primary source
    author: human:author
    usage_count: 42
    last_modified: 2026-07-23
usage_window:
  from: 2026-07-01
  to: 2026-07-31
~~~

Each `sources` entry must include `resource`. `id`, `title`, `author`,
`usage_count`, and `last_modified` are optional. `usage_window` is a sibling of
`sources` and contextualizes `usage_count` values; a source may override it
locally.

To attribute a specific claim to a source, use a footnote with the same
identifier as `sources[].id`:

```markdown
Processing occurs daily.[^primary-source]

[^primary-source]: Primary source
```

Do not use a generic `# Citations` list as the primary convention. It may be
interpreted as OKF v0.1 legacy, but new documents should prefer `sources` and
per-claim footnotes.

## Body, links, and citations

- Use structural Markdown: headings, lists, tables, and code blocks.
- Prefer absolute bundle-relative links, such as
  `[Concept](/concepts/concept.md)`. Relative links are also valid.
- Explain the relationship in the surrounding text; the link alone does not
  type the relationship.
- Broken links are tolerated by OKF, but should be reported in `LINT` and
  fixed when they do not represent knowledge that is still pending.
- Claims derived from external material must point to an entry in `sources`;
  when attribution is per claim, use a footnote label that matches
  `sources[].id`.
- When citing a local `raw/` file, use a Markdown link relative to the file.
  When citing a web source, prefer the canonical URL.
- `# Schema`, `# Examples`, and `# Computation` have conventional meaning in
  OKF and should be used when appropriate to the concept.

## Attested computations

When a concept needs to declare a sanctioned way to compute a value, use
`type: Attested Computation`. Frontmatter may include `runtime`, `parameters`,
`computation`, `executor`, and `attester`; the body should use the
`# Computation` section to record the executable definition. OKF describes the
computation and how to verify it, but does not execute code or define its
package or runtime environment.

Minimal example:

~~~yaml
---
type: Attested Computation
title: Annual revenue
runtime: bigquery
parameters:
  - name: year
    type: integer
    required: true
executor:
  resource: /skills/run-query.md
  receipt: [job_id, executed_sql, result]
attester:
  resource: /attesters/sql-equality.py
generated:
  by: human:user
  at: 2026-08-03T12:00:00-03:00
---

# Computation

```sql
SELECT SUM(amount) AS revenue
FROM finance.recognized_revenue
WHERE fiscal_year = @year
```
~~~

## Operations

### INGEST

When processing a new source added to `raw/`:

1. Read the source without modifying it.
2. Discuss the main extracted points with the user.
3. Create or update affected concept documents, including a source summary when
   it has standalone value.
4. Fill OKF frontmatter for every created document and update `generated.at`
   only for significant changes. Preserve `generated.by` when content origin
   does not change.
5. Add links between related concepts and citations to sources.
6. Update `wiki/index.md` and affected subdirectory indexes, if present.
7. Update other affected entity, concept, and synthesis pages.
8. Record the operation in `wiki/log.md`.

A source may affect many pages. The flow can process one source at a time with
user follow-up, or multiple sources in batch, according to the preference
recorded in this schema.

### QUERY

When receiving a question about the wiki:

1. Read `wiki/index.md` to locate relevant pages.
2. Navigate subdirectory indexes and links before running a broader search.
3. Search and read relevant concept documents.
4. Synthesize an answer with citations.
5. Produce the format appropriate to the question, which may be a Markdown
   page, comparison table, presentation, chart, or canvas.
6. When an answer, comparison, analysis, or connection has durable value,
   incorporate it into the wiki as an OKF concept document and update index and
   log.

Useful queries should also contribute to knowledge accumulation, rather than
remaining only in conversation history.

### LINT

Periodically perform a health and compliance review of the wiki. Check:

- whether every concept document has parseable YAML frontmatter and a non-empty
  `type`;
- whether `index.md` and `log.md` are used only with their reserved meanings;
- whether `generated.at` and `verified[].at` are ISO 8601 and known metadata is
  consistent;
- whether `generated`, `verified`, `status`, `stale_after`, and `sources`
  follow their conventions when present;
- whether actors use the `human:`, `process:`, or `<producer>/<version>`
  prefixes;
- whether attribution footnotes resolve to a `sources[].id`;
- contradictions between pages;
- outdated claims superseded by newer sources;
- orphan pages with no inbound links;
- broken internal links or relationships without context;
- important concepts that are mentioned but lack their own page;
- missing cross-references and citations;
- missing or outdated entries in indexes;
- gaps that could be filled by new sources or web research.

Also report questions that deserve investigation and sources that would be
useful to add. A broken link does not make the bundle invalid under OKF, but it
may still indicate a maintenance problem.

## Indexes and log

### `wiki/index.md`

Root bundle index and entry point for progressive discovery. It is the only
`index.md` that may have frontmatter, exclusively to declare
`okf_version: "0.2"`.

Organize entries by categories that emerge from the content. Each entry should
use a relative link and, when available, the concept’s `description`:

```markdown
# Concepts

- [Name](concepts/name.md) - One-sentence concept summary.
```

An `index.md` may also exist in subdirectories. In those cases, do not use
frontmatter; list contents with relative links and include relevant
subdirectories. Update indexes after each ingestion that affects their scope.

### `wiki/log.md`

Bundle change history, grouped by date with most recent dates first. Older
entries are immutable; new entries must be inserted under the corresponding date
group, without rewriting history.

Use ISO 8601 dates and a highlighted operation type:

```markdown
# Update log

## 2026-07-23

- **INGEST**: Added [concept name](/concepts/name.md).
- **QUERY**: Incorporated a durable comparison into the wiki.
- **LINT**: Fixed links and inconsistent metadata.
```

Record queries only when they produce a durable change or a decision relevant to
wiki maintenance.

## Compliance and evolution

The bundle is compliant with OKF v0.2 when:

1. every non-reserved `.md` under `wiki/` has parseable YAML frontmatter;
2. every frontmatter contains a non-empty `type`;
3. every `index.md` and `log.md` follows its reserved structure.

Missing optional families, unknown types, additional fields, broken links, and
missing subdirectory indexes do not invalidate the bundle. A concept without
`verified` is consumable, but must be treated as unverified; a consumer should
not reject it for that reason. Do not add complexity before it is needed: OKF
standardizes exchange, not taxonomy, database, search engine, SDK, or platform.

If the target specification changes, first update `okf_version` in the root
index and then this operational schema. At moderate scale, indexes may be
enough; if the wiki grows, a local search tool can be added.
