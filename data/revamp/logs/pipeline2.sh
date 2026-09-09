set -euo pipefail
cd "/Users/admin/ClaudeRepo/Claude Projects/Project RNAwiki/RNAwiki-corpus-completion"
echo "=== derive questions"
npx tsx scripts/corpus-20k/questions/derive.ts --fields data/revamp/fields-v2 \
    --seeds data/revamp/derived-v2 --out data/revamp/questions-v2 \
    --suppression data/revamp/suppression/assignments-v2.ndjson
echo "=== render v10 (furniture-free)"
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v10
echo "=== render v10 (with furniture)"
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v10
echo "=== hubs_build"
./.venv-corpus/bin/python scripts/revamp/hubs_build.py
echo "=== hubs_text"
./.venv-corpus/bin/python scripts/revamp/hubs_text.py
echo "=== presence-applicable v10"
./.venv-corpus/bin/python scripts/revamp/derive_threshold.py --applicability-only \
    --fields-dir data/revamp/fields-v2 --out data/revamp/thresholds-v10.json
echo "=== DONE pipeline2"
