# RNAwiki — translate the code of human performance into real results

**DNA is the blueprint; RNA is the builder.** A goal-first wiki of the health, fitness & longevity compound universe — approved and non-approved. Pick the problem to fix or goal to reach, get a root-cause Move·Fuel·Stack protocol, see the compounds that actually help (ranked by human evidence), and get the real mechanism plus the honest catch, in plain English.

🌐 **Live site:** https://rnawiki.com
📚 **~220 compounds · 102 molecular targets · 16 pathways · ~150 gene-target links**

> Educational content only — **not medical advice**. Non-approved and controlled substances are documented for completeness and harm-reduction, not endorsement.

---

## This repository is the source of truth

The **cloud copy on GitHub is the canonical, most up-to-date version.** The live site deploys from this repo. Anyone can read it, fork it, and propose changes.

### How to edit the content (no coding needed)

All content lives in three Markdown files under [`content/`](content/):

| File | What it is |
|------|-----------|
| [`content/COMPENDIUM.md`](content/COMPENDIUM.md) | Every compound (the ~220 entries, in 20 categories) |
| [`content/FOUNDATIONS.md`](content/FOUNDATIONS.md) | The learn-it-properly curriculum (5 modules) |
| [`content/PATHWAYS.md`](content/PATHWAYS.md) | The 16 master pathways |

**To edit directly in your browser:** open a file above on GitHub, click the ✏️ pencil, make your change, and commit (or open a Pull Request). That's it — the site rebuilds from the Markdown.

**Compound entry format** (keep these three fields on every entry):
```
### Compound Name  🟡 ⭐⭐⭐⭐⭐
**Goals:** Build muscle · Strength
**Technical mechanism:** …name the receptor/enzyme/gene…
**Molecular target:** [GENE (NCBI Gene)](https://www.ncbi.nlm.nih.gov/gene/XXXX) · [Compound (PubChem)](https://pubchem.ncbi.nlm.nih.gov/compound/XXXX)
**In plain English:** …the same thing for a non-scientist…
**Protocol:** … **Watch out:** … **Bottom line:** …
```
Badges: 🟢 FDA-approved · 🟡 OTC supplement · 🔵 prescription · 🟠 off-label · 🔴 not approved · ⚫ controlled.
Evidence stars are **human** evidence; animal-only compounds are capped at ⭐⭐.

### Editorial rules
1. Describe mechanisms faithfully to the biology — no lifestyle/marketing spin.
2. Human evidence earns the stars; label animal-only data.
3. Every molecular claim links to an official source (NCBI Gene, PubChem, PMC, FDA).
4. Harm-reduction framing for non-approved compounds; never encourage use.

---

## How it works (architecture)

Markdown is the source of truth. A build step parses it into the site's data; the frontend is dependency-free vanilla JS (no framework).

```
content/*.md                    ← you edit these
   │  node build/parse.js       ← parses markdown → structured data
   ▼
site/data.js                    ← generated (window.PBSWIKI_DATA)
site/index.html + app.js + styles.css   ← the site (hash-router SPA)
server.js                       ← tiny zero-dependency static server (for hosting)
```

The parser also **auto-derives the molecular-target graph** (one target → many compounds, e.g. the Androgen Receptor links 11 compounds) and **tags each compound to the 16 pathways** — no manual wiring.

### Run or rebuild locally
```bash
node build/parse.js     # regenerate site/data.js from the markdown
npm start               # serve at http://localhost:3000
# or just open site/index.html directly in a browser
```

### Deploy
Pushing to `main` deploys the live site automatically (via GitHub → Railway). No laptop required — you can edit the Markdown on GitHub and the site updates itself.

---

## Contributing
Spotted a missing compound, an error, or new evidence? Edit the relevant `content/*.md` file and open a Pull Request, or [open an issue](../../issues). All improvements welcome.
