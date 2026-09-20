# Dossier research scope — read-only inventory, 19 September 2026

This is a research-workload audit, not a content-completion claim. The queries below only counted local database rows; they did not validate any field's medical meaning or source.

## Counts

- `corpus_pages`: **28,833** records.
- `indexable = true AND suppressed = false`: **342** records: 333 tagged `longevity`, 8 `clinical`, 1 `withdrawn`.
- Those 342 records contain **4,274** `page_fields` rows marked `present`; **3,198** of those have a non-null `source_url`. A URL alone does not make a claim correct, current, or applicable to a particular use.
- A cursory indexable sample includes two Acarbose slugs and category-like entries such as Acetylcholine, Ammonia, and Antioxidant. Identity and page-purpose reconciliation must precede medical prose.

## Reproducible read-only queries

```sql
SELECT count(*) AS total,
       count(*) FILTER (WHERE indexable AND NOT suppressed) AS indexable
FROM corpus_pages;

SELECT p.page_type, p.tier, count(*) AS pages
FROM corpus_pages p
WHERE p.indexable AND NOT p.suppressed
GROUP BY p.page_type, p.tier;

SELECT count(f.*) FILTER (WHERE f.state = 'present') AS present_fields,
       count(f.*) FILTER (WHERE f.state = 'present' AND f.source_url IS NOT NULL) AS sourced_fields
FROM corpus_pages p
LEFT JOIN page_fields f ON f.key = p.key
WHERE p.indexable AND NOT p.suppressed;
```

## What the scale-up actually requires

1. Resolve the entity: ingredient vs product vs mixture vs class; retain exact aliases, route, and jurisdiction. Do not attach a study to the wrong form.
2. For each _use_, search the original trials, registers, regulator labels, systematic reviews, and safety references—not only the existing `page_fields` rows.
3. Record population, comparison, measured outcome, duration, numerical result, uncertainty, exclusions, harms, product form, and what the source does _not_ support. Flag contradictions inside a source, as the magnesium sleep paper has in its discontinuation wording.
4. Write one beginner-facing answer per useful reader question, with an exact link. If research genuinely cannot answer it, state the precise unresolved question and search boundary; do not fill it with generic caution text.
5. Test identity, source reachability, claim scope, readability, and mobile/accessibility rendering per page before enabling its researched reader layer. Keep a provenance record distinct from the public copy.

The magnesium glycinate preview is **one worked example**, not evidence that the other 341 indexable pages—or the larger non-indexable catalogue—have passed this process. A mass-generated rewrite from the present database would recreate the filler problem.
