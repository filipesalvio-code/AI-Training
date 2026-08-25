# LLM Wiki in Open Knowledge Format

This directory combines the LLM Wiki standard described by Andrej Karpathy with
the Open Knowledge Format (OKF) v0.2 specification:

- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

## Core idea

Maintain a persistent Markdown wiki between the user and their sources. Instead
of rebuilding knowledge from raw documents for every question, read the
sources, extract what matters, and integrate that content into the existing
wiki.

The wiki should accumulate value: new sources and new questions can update
existing pages, connections, comparisons, and syntheses.

The user selects sources, explores content, and asks questions. The agent
maintains the wiki: summarizes, organizes, creates relationships, updates
pages, and preserves consistency.

## Architecture

### `raw/`

Curated collection of source documents, such as articles, papers, images, and
data files.

- It is the source of truth.
- The agent may read its files, but must never modify them.
- It is not part of the OKF bundle and, therefore, its files do not need to
  follow the concept document format.

### `wiki/`

OKF v0.2 knowledge bundle and directory of Markdown files generated and
maintained by the agent. It may contain summaries, entity pages, concept pages,
comparisons, overviews, and syntheses.

- The agent creates and updates pages.
- The agent maintains cross-references and consistency between them.
- The user and any OKF-compatible consumer query the result.
- The bundle root is `wiki/`; links that start with `/` are relative to it.

### `wiki/output/`

Exclusive area for artifacts generated as a result of wiki queries or
operations. Use it for images, landing pages, HTML, CSS, JavaScript, charts,
presentations, canvases, PDFs, spreadsheets, exports, and other files that are
not concept documents indexed by OKF.

- Every generated artifact must be placed inside its own operation folder in
  `wiki/output/`, using the format `YYYY-MM-DD-<slug>/`. The prefix must be the
  operation date in ISO 8601 format (`YYYY-MM-DD`) and `<slug>` must be
  descriptive in `kebab-case`, for example
  `wiki/output/2026-08-03-landing-page-nexoerp/`.
- Never create artifacts directly in the root of `wiki/output/`; the only
  exception is a possible `wiki/output/index.md`. Auxiliary files that belong
  to the same result, such as HTML and CSS, must remain together in the same
  folder.
- Do not mix results from different operations in the same folder. If a new
  operation produces a variation, use a new folder with the operation date and
  an appropriate slug.
- Files in `wiki/output/` do not represent concepts, do not need YAML
  frontmatter, and do not go into `wiki/index.md` as wiki pages.
- A `wiki/output/index.md` may exist only as an operational inventory of
  artifacts, without concept frontmatter. It must point to files in dated
  folders, not to old paths or loose files. It is not an OKF index and must not
  be used to turn listed files into concepts.
- When an artifact has durable value, record the operation in `wiki/log.md`
  and, if necessary, separately create a concept document that explains the
  knowledge. The artifact remains in its dated folder inside `wiki/output/`.
- Do not confuse `wiki/output/` with `raw/`: output contains agent-generated
  derivatives; raw contains preserved sources and is never modified.

### `AGENTS.md`

Operational schema used by Codex. It defines the structure, conventions, and
flows followed by the agent. It may evolve through use, in collaboration with
the user. It is not part of the OKF bundle.

## OKF concept documents

Every `.md` file inside `wiki/`, except the reserved names `index.md` and
`log.md` and all content under `wiki/output/`, represents exactly one concept.
The path without the `.md` extension is that concept’s stable identifier.
Prefer descriptive filenames in `kebab-case` and do not change paths without
updating inbound links.

LINT treats as the concept set all Markdown files outside `wiki/output/`.
Content in `wiki/output/`, including its possible `index.md`, is outside
validation for frontmatter, orphans, index entries, and OKF document
conformance.

Each concept document must be UTF-8 and begin with YAML frontmatter:

```markdown
---
type: Concept
title: Human-readable concept name
description: One-sentence concept summary.
resource: https://example.com/canonical-resource
tags: [topic, context]
generated:
  by: human:user
  at: 2026-07-23T12:00:00-03:00
sources:
  - id: main-source
    resource: https://example.com/source
    title: Main source
---

# Overview

Structured content connected to [another concept](/concepts/other.md),
according to the [main source][^main-source].

[^main-source]: Main source

```

Frontmatter rules:

- `type` is required and must be a short, non-empty, self-explanatory string.
- `title`, `description`, `resource`, and `tags` are recommended when their
  values are known.
- `generated` is recommended to record how the current content was produced and
  when its last significant change occurred.
- `verified`, `status`, and `stale_after` are optional and should be used when
  confirmation, lifecycle needs, or update policy exists.
- `sources` is recommended when the concept derives from identifiable sources.
- `description` must contain a single sentence useful for indexes and search.
- `resource` identifies the canonical resource described by the page; omit it
  for abstract concepts without a corresponding resource.
- `tags` must be a YAML list of short strings.
- `generated.by` must follow the actor convention: `<producer>/<version>` for
  agents and tools, `human:<id>` for people, and `process:<id>` for automated
  processes.
- `generated.at` and `verified[].at` must use ISO 8601 date and time.
- `verified` is a list of verification events, each with `by` and `at`.
  A single event may also be written as a mapping without a list.
- `status` accepts `draft`, `stable`, or `deprecated`; when absent, the concept
  is considered `stable`.
- `stale_after` is an absolute date in `YYYY-MM-DD` format; the concept becomes
  stale when the current date is equal to or later than it.
- Additional fields are allowed when justified by the domain. Preserve unknown
  fields when editing a page.
- Do not invent missing metadata just to fill frontmatter.

There is no universal type taxonomy. Use a small set of consistent and
self-explanatory values, such as `Source Summary`, `Entity`, `Concept`,
`Comparison`, `Synthesis`, `Playbook`, `Attested Computation`, or
domain-specific types.

### Provenance and trust

When a concept is derived from external material or another concept, use
`sources` in frontmatter:

~~~yaml
sources:
  - id: main-source
    resource: https://example.com/source
    title: Main source
    author: human:author
    usage_count: 42
    last_modified: 2026-07-23
usage_window:
  from: 2026-07-01
  to: 2026-07-31
~~~

Each `sources` entry must have `resource`. `id`, `title`, `author`,
`usage_count`, and `last_modified` are optional. `usage_window` is a sibling of
`sources` and contextualizes `usage_count` values; a source may override it
locally.

To attribute a specific claim to a source, use a footnote with the same
identifier as `sources[].id`:

```markdown
Processing happens daily.[^main-source]

[^main-source]: Main source
```

Do not use a generic `# Citations` list as the primary convention. It may be
interpreted as OKF v0.1 legacy, but new documents should prefer `sources` and
per-claim footnotes.

## Body, links, and citations

- Use structural Markdown: headings, lists, tables, and code blocks.
- Prefer bundle-relative absolute links, such as
  `[Concept](/concepts/concept.md)`. Relative links are also valid.
- Explain the relationship in the surrounding text; the link alone does not
  type the relationship.
- Broken links are tolerated by OKF, but should be reported in `LINT` and fixed
  when they do not represent still-pending knowledge.
- Claims derived from external material should point to an entry in `sources`;
  when attribution is per-claim, use a footnote whose label matches
  `sources[].id`.
- When citing a local file in `raw/`, use a Markdown link relative to that
  file. When citing a web source, prefer the canonical URL.
- `# Schema`, `# Examples`, and `# Computation` have conventional meaning in
  OKF and should be used when appropriate for the concept.

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


[continued in next message — translate this part only, do not summarize]

## Operations

### INGEST

When processing a new source added to `raw/`:

1. Read the source without modifying it.
2. Discuss with the user the main points extracted.
3. Create or update the affected concept documents, including a source summary
   when it has standalone value.
4. Fill in OKF frontmatter for every created document and update
   `generated.at` only on significant changes. Preserve `generated.by`
   when the content origin does not change.
5. Add links between related concepts and citations to sources.
6. Update `wiki/index.md` and the affected subdirectory indexes, if they exist.
7. Update other affected entity, concept, and synthesis pages.
8. If the operation produces images, HTML/CSS pages, charts, or any other
   artifact, save it in a new folder using the format
   `wiki/output/YYYY-MM-DD-<slug>/`. Keep all auxiliary output files in that
   folder. Do not create these files directly in `wiki/output/`, in `wiki/`,
   in `wiki/concepts/`, or at the project root.
9. Record the operation in `wiki/log.md`.

A source may affect many pages. The flow can process one source at a time with
user follow-up, or multiple sources in batch, according to the preference
recorded in this schema.

### QUERY

When receiving a question about the wiki:

1. Read `wiki/index.md` to locate relevant pages.
2. Navigate subdirectory indexes and links before doing a broader search.
3. Search and read the relevant concept documents.
4. Synthesize an answer with citations.
5. Produce the format appropriate to the question. If the result is an artifact
   — such as an image, landing page, HTML/CSS, presentation, chart, or canvas —
   save it in a new folder using the format `wiki/output/YYYY-MM-DD-<slug>/`;
   do not treat it as a concept document.
6. When an answer, comparison, analysis, or connection has lasting value,
   incorporate the knowledge into the wiki as an OKF concept document and
   update the index and log. If there is an associated artifact, keep it in its
   dated folder within `wiki/output/` and record the full path in the log or in
   the concept document when that helps discovery.

Useful queries should also contribute to knowledge accumulation, rather than
remaining only in conversation history.

### LINT

Periodically, perform a health and compliance review of the wiki. Check:

- whether every concept document outside `wiki/output/` has parseable YAML
  frontmatter and a non-empty `type`;
- whether `index.md` and `log.md` are used only with their reserved meanings;
- whether `generated.at` and `verified[].at` are ISO 8601 and known metadata is
  consistent;
- whether `generated`, `verified`, `status`, `stale_after`, and `sources`
  follow their conventions when present;
- whether actors use the prefixes `human:`, `process:`, or `<producer>/<version>`;
- whether attribution footnotes resolve to a `sources[].id`;
- contradictions between pages;
- older claims superseded by newer sources;
- orphan pages with no incoming links;
- broken internal links or relationships without context;
- important concepts that are mentioned but have no dedicated page;
- missing cross-references and citations;
- missing or outdated entries in indexes;
- whether generated artifacts exist outside `wiki/output/` — for example,
  images, HTML, CSS, JavaScript, charts, PDFs, presentations, canvases,
  spreadsheets, or exports — and report them as non-compliant, moving them to a
  dated folder in `wiki/output/`;
- whether artifacts exist directly in the root of `wiki/output/` beyond the
  optional `index.md`, or folders that do not follow `YYYY-MM-DD-<slug>/`;
- whether files inside `wiki/output/` are being incorrectly treated as
  concepts, requiring frontmatter or an entry in `wiki/index.md`;
- whether the `wiki/output/index.md` inventory points to artifacts in dated
  folders and whether relative links between an artifact and its auxiliary files
  within the same folder resolve, when such links exist;
- gaps that could be filled by new sources or web research.

Also report questions that deserve investigation and sources that would be
useful to add. A broken link does not make the bundle invalid under OKF, but it
may still indicate a maintenance issue.

## Indexes and log

### `wiki/index.md`

Root bundle index and entry point for progressive discovery. It is the only
`index.md` that may have frontmatter, exclusively to declare
`okf_version: "0.2"`.

Organize entries by categories that emerge from the content. Each entry should
use a relative link and, when available, the concept’s `description`:

```markdown
# Concepts

- [Name](concepts/name.md) - One-sentence summary of the concept.
```

An `index.md` may also exist in subdirectories. In those cases, do not use
frontmatter, list content with relative links, and include relevant
subdirectories. Update indexes on every ingestion that affects their scope. The
exception is `wiki/output/index.md`, which is only an artifact inventory and
should not be included in `wiki/index.md` as conceptual content; its links
should point to the corresponding `YYYY-MM-DD-<slug>/` folders.

### `wiki/log.md`

Bundle change history, grouped by date with the most recent dates first. Old
entries are immutable; new entries must be inserted into the corresponding date
group, without rewriting history.

Use ISO 8601 dates and a highlighted operation type:

```markdown
# Update log

## 2026-07-23

- **Ingestion**: Added [concept name](/concepts/name.md).
- **Query**: Incorporated a durable comparison into the wiki.
- **Lint**: Fixed links and inconsistent metadata.
```

Record queries only when they produce a durable change or a decision relevant
to wiki maintenance.

## Compliance and evolution

The bundle is compliant with OKF v0.2 when:

1. each non-reserved `.md` outside `wiki/output/` has parseable YAML
   frontmatter;
2. each frontmatter contains a non-empty `type`;
3. each `index.md` and `log.md` in the bundle follows its reserved structure;
4. generated artifacts are in `wiki/output/YYYY-MM-DD-<slug>/` folders, with at
   most the operational inventory `wiki/output/index.md` directly in the root,
   and are not required as concepts or OKF index entries.

Missing optional families, unknown types, additional fields, broken links, and
missing indexes in subdirectories do not invalidate the bundle. A concept
without `verified` is consumable, but must be treated as unverified; a consumer
must not reject it for that reason. Do not add complexity before it is needed:
OKF standardizes exchange, not taxonomy, database, search engine, SDK, or
platform.

If the target specification changes, first update `okf_version` in the root
index and then this operational schema. At moderate scale, indexes may be
sufficient; if the wiki grows, a local search tool can be added.
