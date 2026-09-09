set -e
cd "/Users/admin/ClaudeRepo/Claude Projects/Project RNAwiki/RNAwiki-corpus-completion"
echo "@@@ typecheck"; npm run typecheck
echo "@@@ lint"; npm run lint
echo "@@@ format"; npm run format
echo "@@@ drizzle-kit check"; npx drizzle-kit check
echo "@@@ test:unit"; npm run test:unit || { echo "@@@ FAILED test:unit"; exit 1; }
echo "@@@ test:integration"; npm run test:integration || { echo "@@@ FAILED test:integration"; exit 1; }
echo "@@@ build"; npm run build || { echo "@@@ FAILED build"; exit 1; }
echo "@@@ test:e2e"; npm run test:e2e || { echo "@@@ FAILED test:e2e"; exit 1; }
echo "@@@ ALL GREEN"
