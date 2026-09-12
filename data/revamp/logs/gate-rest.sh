set -e
cd "/Users/admin/ClaudeRepo/Claude Projects/Project RNAwiki/RNAwiki-corpus-completion"
for s in check:medicine-content audit:denial-corpus agents:check agents:import:check check:agent-datasets \
         check:four-audience-coverage check:source-consensus-snapshot check:dataset-export check:seo format; do
  echo "@@@ $s"
  npm run "$s" || { echo "@@@ FAILED $s"; exit 1; }
done
echo "@@@ drizzle-kit check"
npx drizzle-kit check || { echo "@@@ FAILED drizzle-kit"; exit 1; }
echo "@@@ test:unit"
npm run test:unit || { echo "@@@ FAILED test:unit"; exit 1; }
echo "@@@ test:integration"
npm run test:integration || { echo "@@@ FAILED test:integration"; exit 1; }
echo "@@@ build"
npm run build || { echo "@@@ FAILED build"; exit 1; }
echo "@@@ test:e2e"
npm run test:e2e || { echo "@@@ FAILED test:e2e"; exit 1; }
echo "@@@ ALL GREEN"
