#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const server = read('server.js');
const db = read('db.js');
const app = read('site/app.js');
const styles = read('site/styles.css');
const plan = read('site/plan.html');
const sitemap = read('site/sitemap.xml');
const discoveryDocs = ['site/az.html', 'site/browse.html'].map((file) => [file, read(file)]);
const fatLossGoalDoc = read('site/goal/fatloss.html');
const toxicDoc = read('site/c/2-4-dinitrophenol-dnp.html');
const failures = [];
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) failures.push(label);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) failures.push(label);
};

// Safety/privacy features must require an explicit environment opt-in.
for (const pair of [
  ['RESEARCH_COLLECTION', 'research collection'],
  ['PUBLIC_COMMUNITY', 'public community'],
  ['PUBLIC_PROFILES', 'public profiles'],
  ['PUBLIC_OUTCOME_AGGREGATES', 'public outcome aggregates'],
  ['SHARED_PLANS', 'shared plans'],
]) requireText(server, `process.env.${pair[0]} === '1'`, `${pair[1]} is not fail-closed`);
requireText(server, "!FEATURES.researchCollection && seg[0] === 'experiments'", 'legacy personal-observation writes remain live when research is off');
requireText(server, "!FEATURES.publicOutcomeAggregates && seg[0] === 'ledger'", 'legacy result-ledger aggregates remain public when outcome aggregates are off');
requireText(server, 'if (!FEATURES.publicCommunity || !userId || !db.enabled) return;', 'reward ledger still accrues while the community product is off');
requireText(app, "if (!featureOn('publicCommunity')) return;", 'the client still requests or wires public voting while community is off');
if ((app.match(/if \(!featureOn\('publicCommunity'\)\) return;/g) || []).length < 3) failures.push('one or more protocol-request entry points bypass the public-community kill switch');
requireText(app, "const requestBlock = featureOn('publicCommunity')", 'Find still renders the protocol-request module while community is off');
requireText(app, "const request = featureOn('publicCommunity')", 'the zero-match state still renders a protocol-request button while community is off');
requireText(app, 'solveQPanel(q, rankProblems(q), solveGuidance(q))', 'live Find input bypasses urgent and professional-review routing');
requireText(app, "document.querySelector('.q-panel[data-on]')", 'live Find states can accumulate instead of replacing the previous result');
requireText(styles, '.vote-foot{display:none;', 'the contained community vote strip is visible before config is known');
requireText(styles, 'html[data-community-on] .vote-foot{display:flex}', 'the vote strip has no explicit server-configured reveal state');
for (const rootName of ['edits', 'proposals', 'rootcause-changes', 'foods', 'protocol-requests']) {
  requireText(server, `'${rootName}'`, `${rootName} is absent from the fail-closed community surface`);
}

// Discoverability is allowed for a toxic/no-safe-dose record; product-like evidence scoring is
// not. Lock the actual generated documents because the compound detail page can be correct while
// an index or goal page quietly reintroduces the stars.
for (const [file, html] of discoveryDocs) {
  const start = html.indexOf('/c/2-4-dinitrophenol-dnp');
  if (start < 0) { failures.push(`${file} no longer keeps DNP discoverable`); continue; }
  const end = html.indexOf('</li>', start);
  const row = html.slice(start, end < 0 ? start + 600 : end + 5);
  if (!/Toxic · no safe dose/i.test(row)) failures.push(`${file} does not replace DNP's score with its toxic/no-safe-dose risk label`);
  if (/[★☆]/.test(row)) failures.push(`${file} still renders an efficacy-star score for DNP`);
  if (/Controlled/i.test(row)) failures.push(`${file} still reduces DNP to a generic Controlled label`);
}
if (fatLossGoalDoc.includes('/c/2-4-dinitrophenol-dnp')) failures.push('the fat-loss efficacy ranking still presents DNP as a goal option');
requireText(app, 'const list = saved.filter((c) => !isToxicNoSafeDose(c));', 'legacy toxic stack entries still enter ordinary combination analysis');
requireText(app, 'class="stack-toxic-quarantine" role="alert"', 'legacy toxic stack entries have no exposure/emergency quarantine');
requireText(app, 'const safeForkStack = forkStack.filter((x) => !isToxicNoSafeDose(byId[x]));', 'community-stack cloning can still import toxic/no-safe-dose entries');
if (/class="[^"]*pagetoc/.test(toxicDoc)) failures.push('the prerendered toxic page inserts generic navigation before emergency guidance');
const toxicStopAt = toxicDoc.indexOf('class="toxic-stop"');
const toxicEmergencyAt = toxicDoc.indexOf('class="toxic-emergency"');
if (toxicStopAt < 0 || toxicEmergencyAt < 0 || toxicStopAt > toxicEmergencyAt) failures.push('the prerendered toxic page does not lead with stop guidance followed by emergency action');

// A public repository must never contain a usable production session fallback.
forbidText(server, "'dev-secret-change-me'", 'the forgeable development session secret returned');
requireText(server, 'CONFIGURED_SECRET.length < 32', 'production does not refuse a short SESSION_SECRET');

// Research consent is an explicit, append-only decision and legacy auto-consent cannot count.
requireText(db, 'CREATE TABLE IF NOT EXISTS consent_records', 'append-only consent_records table is missing');
requireText(server, "purpose='research' ORDER BY created_at DESC", 'research writes do not read the latest explicit consent decision');
requireText(server, "'user_action'", 'consent decisions do not record their source');
forbidText(server, "INSERT INTO user_consent(user_id,consent_research,version,consented_at) VALUES($1,true", 'registration silently grants research consent');
if ((server.match(/adultConfirmed !== true/g) || []).length < 3) failures.push('one or more account entry paths bypass the interim 18+ confirmation');
requireText(app, 'class="adult-confirm"', 'account UI does not disclose and collect the interim 18+ confirmation');

// Legacy accounts cannot become public just because they already have a username.
requireText(db, 'public_profile_enabled BOOLEAN NOT NULL DEFAULT false', 'legacy profiles are not private by default');
requireText(server, 'public_profile_enabled=true', 'public profile lookup ignores explicit activation');
forbidText(app, 'plus a line for this protocol on your public page', 'publish disclosure promises a public account page that users cannot enable');
forbidText(app, 'Your public page — the protocols you chose to publish', 'private account page promises a public account page that users cannot enable');
requireText(app, 'Publishing makes four things public on this protocol’s link:', 'publish disclosure no longer names the actual public surface');
requireText(server, "if (seg[0] === 'account' && !seg[1] && method === 'DELETE')", 'full account deletion endpoint is missing');
requireText(app, 'deleteAccount()', 'full account deletion is not reachable from account data controls');

// One item is not a combination. The interaction surface must not frighten a reader with a
// fabricated "0 exact pairs" warning or ask them to confirm a combination that does not exist.
requireText(app, "pairCov.total === 0\n          ? '<span class=\"ixn-verdict\">Only one compound here, so there is no pairing to check.</span>'", 'single-compound stack has no explicit no-pair state');
requireText(app, '${pairCov.total ? `<p class="ixn-foot">Narrow authored guidance covers', 'single-compound stack still renders the combination-confirmation footer');

// Today is a personal utility surface, not sitemap content.
requireText(plan, '<meta name="robots" content="noindex,follow">', 'Today prerender is indexable');
if (/\/plan(?:<|\/?$)/m.test(sitemap)) failures.push('Today remains in sitemap.xml');
requireText(app, "const UTILITY_NOINDEX_ROUTES = ['plan']", 'hydrated Today page can revert to indexable');

// No personal health state is encoded into a share URL. Legacy stack links are scrubbed rather
// than imported, and all personalized share affordances fail closed with SHARED_PLANS.
forbidText(app, '#/stack?ids=', 'compound selections are still encoded in a stack URL');
requireText(app, "if (QS.has('ids'))", 'legacy stack URL state is not detected');
requireText(app, "QS.delete('ids')", 'legacy stack URL state is not scrubbed');
requireText(server, "qp.has('ids')", 'server does not redirect legacy stack query state');
if ((app.match(/if \(!featureOn\('sharedPlans'\)\) return;/g) || []).length < 4) failures.push('one or more personalized sharing functions bypass the shared-plans kill switch');
forbidText(app, 'id="stack-share"', 'Stack still exposes a personal share-link control');
forbidText(app, 'id="stack-wrapped"', 'Stack still exposes a personal share-image control');

// The release navigation has one plain-language entry for discovery and one for execution.
requireText(read('site/index.html'), '>Find</a>', 'application shell has no Find entry');
requireText(read('site/index.html'), '>Today</a>', 'application shell has no Today entry');

if (failures.length) {
  console.error('\nContainment gate failed:');
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('Containment gate passed — explicit consent, private defaults, secret checks, Today indexing and release navigation are intact.');
