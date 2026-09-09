set -euo pipefail
cd "/Users/admin/ClaudeRepo/Claude Projects/Project RNAwiki/RNAwiki-corpus-completion"
echo "=== render v10 (furniture-free)"
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v10
echo "=== render v10 (with furniture)"
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v10
echo "=== DONE pipeline4"
