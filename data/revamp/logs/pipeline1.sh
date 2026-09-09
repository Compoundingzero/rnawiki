set -euo pipefail
cd "/Users/admin/ClaudeRepo/Claude Projects/Project RNAwiki/RNAwiki-corpus-completion"
PY=./.venv-corpus/bin/python
MODELS=data/revamp/tiers/model-assignment-v2.ndjson
echo "=== interactions_build"
$PY scripts/revamp/interactions_build.py --run-date 2026-09-06
echo "=== counterpart_artefacts"
$PY scripts/revamp/counterpart_artefacts.py
echo "=== identity_apply"
$PY scripts/revamp/identity_apply.py
echo "=== identity_relations_v6"
$PY scripts/revamp/identity_relations_v6.py
echo "=== controlled_suppression"
$PY scripts/revamp/controlled_suppression.py --fields-dir data/revamp/fields-v2 \
    --assignments data/corpus-20k/suppression/assignments.ndjson \
    --models $MODELS \
    --out data/revamp/suppression/assignments-v2.ndjson \
    --summary data/revamp/suppression/controlled-suppression.json
echo "=== derived compute"
$PY scripts/corpus-20k/derived/compute.py --fields data/revamp/fields-v2 \
    --registry data/corpus-20k/registry --assignments data/revamp/suppression/assignments-v2.ndjson \
    --out data/revamp/derived-v2 --as-of 2026-09-06
echo "=== build_blocks"
$PY scripts/revamp/build_blocks.py --fields-dir data/revamp/fields-v2 \
    --models $MODELS \
    --relations data/revamp/identity/relations-v6.parquet --out-dir data/revamp/blocks
echo "=== tier3_sections"
$PY scripts/revamp/tier3_sections.py
echo "=== page_blocks"
$PY scripts/revamp/page_blocks.py
echo "=== DONE pipeline1"
