### [PENDING-TIMESTAMP] Phase 4 — measure v9 (after fix round 4)

The same ruler as measures v6, v7 and v8, on the fix-round-4 render, every check against one build
and one at a time.

**Commands, in order.**

```
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --text-dir data/revamp/render-v9/text \
    --with-furniture-text-dir data/revamp/render-v9/text-with-furniture \
    --out data/revamp/thresholds-v9.json
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --text-dir data/revamp/render-v9/text-with-furniture \
    --out data/revamp/thresholds-v9-with-furniture.json
.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v9/text \
    data/revamp/render-v9/text-with-furniture data/corpus-20k/render/text \
    --out data/revamp/common-line-share-v9.json
npx tsx scripts/with-disposable-database.ts -- bash <driver>
    # npm run db:migrate
    # pg_restore --data-only --no-owner --no-privileges -L <drugs, inventory_resolutions> \
    #     rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom
    # npm run build after rm -rf .next/cache
    # materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v9.json \
    #     --no-checkpoint      (redirect plan v5, trial reassignments v5, duplicate holds)
    # scripts/revamp/hubs_load.ts
    # npx next start -p 3199
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3199 \
    --sample 1000 --seed 20260905 --csv data/revamp/rendered-dups-v9.csv \
    --summary data/revamp/rendered-dups-v9-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3199 \
    --sample 1000 --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v9-prior-set.csv \
    --summary data/revamp/rendered-dups-v9-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3199 \
    --out data/revamp/redirect-check-v9-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3199 \
    --out data/revamp/hubs/link-graph-v9.json
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3199 \
    --out data/revamp/browser-checks-v9.json
.venv-corpus/bin/python scripts/revamp/jsonld_check.py --base-url http://127.0.0.1:3199 \
    --sample 20 --seed 20260912 --out data/revamp/jsonld-v9.json
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3199 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-v9.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3199 \
    --seed 20260912 --per-tier 20 --text-dir data/revamp/render-v9/text \
    --out-dir data/revamp/slop-draws/draw-6
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3199 \
    --seed 20260913 --per-tier 20 --text-dir data/revamp/render-v9/text \
    --out-dir data/revamp/slop-draws/draw-7
```

Server stopped, disposable database dropped, `.next/cache` and `data/revamp/rendered-text` deleted.

