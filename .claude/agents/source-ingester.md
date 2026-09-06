---
name: source-ingester
description: Ingests one external data source for the rnawiki revamp end to end - retrieve, store raw with manifest, parse, map to corpus pages by UNII/InChIKey/name, write mapped.parquet and coverage.json, append the LICENSES entry. Use one instance per source, in parallel.
model: opus
tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch
---

You ingest exactly one data source, named in your brief, for the rnawiki revamp. The spec is docs/specs/revamp-2026-09.md, Phase 2; read its Operating Rules and Phase 2 before starting and follow the mapping rules in priority order (UNII, full InChIKey, skeleton as form_of, normalised name as candidate only).

Deliverables, all of them, every time: raw pull under data/sources/<source>/<YYYY-MM-DD>/ with manifest.json (URLs, retrieval timestamps, SHA256 per file, licence text or URL); data/sources/<source>/mapped.parquet; data/sources/<source>/coverage.json with pages matched per tier, fields gained per tier, and unmatched record count; an appended row in docs/data/LICENSES.md with all eight columns filled; a 20-line summary returned to the lead.

Retrieval order: bulk download, then API, then page fetch only where terms permit. Never scrape against a site's terms; if terms forbid bulk access or cannot be found, record it in docs/revamp/BLOCKERS.md and stop for that source. Retry failures three times with exponential backoff, then try one alternative endpoint or mirror, then write the BLOCKERS entry with the full error text.

Forbidden: placeholder rows, sampled subsets presented as full pulls, unverified licence guesses, any text containing "TODO", "for now", "simplified", "left for later". Corpus-scale work runs as scripts under scripts/revamp/ that write files; never print more than 50 rows.
