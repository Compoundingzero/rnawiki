# Legal and ethical gate — Track A1 and A2

Generated 2026-09-03T14:53:09.042Z by `scripts/design-study/legal-gate.ts`. User agent: `RNAWiki-design-study/1.0 (+https://rnawiki.com; design research; contact felix360506@gmail.com)`.
Fetched per site: robots.txt, the terms-of-service page, and for A2 sites the API root or API
documentation page plus the one listing or API query needed to pick a single public content page.
No forum thread was fetched. Every request is logged in `data/design-study/legal/requests.log`.
Every decision below is **proposed by the legal gate** and awaits the orchestrator's independent confirmation.

| site | robots index/content | terms URL | what the terms say | API + licence | decision |
| --- | --- | --- | --- | --- | --- |
| wikiwand.com | allowed / allowed | none found | No terms document could be read: both registry candidates (/terms and /en/terms-of-service) and the index page returned HTTP 403 to this gate, the index as a 5,671-byte challenge page, so what the terms permit for a person-operated browser rendering public pages and saving screenshots for private study is unestablished. | not investigated; licence: none stated | **blocked** |
| stripe.com/docs | allowed / allowed | https://stripe.com/en-sg/legal/consumer | The document reached from the registry's first candidate is Stripe's Consumer Terms of Service (it redirected to /en-sg/legal/consumer), which governs Stripe's consumer payment services rather than reading docs.stripe.com; it contains no clause about automated access, crawling, rendering or screenshots, and its only automation language defines payment "Agents". | not investigated; licence: none stated | **capture** |
| vercel.com/docs | allowed / allowed | https://vercel.com/legal/terms | Vercel's terms are a subscription agreement for using the Vercel platform: the restrictions attach to the Services and to the licence a customer receives, not to reading vercel.com/docs. | not investigated; licence: none stated | **capture** |
| linear.app/method | allowed / allowed | https://linear.app/terms | Linear's terms are a customer subscription agreement for the Linear product; the use restrictions attach to the Service and its Software (no modifying, copying, reverse engineering), not to reading the public /method pages. | not investigated; licence: none stated | **capture** |
| quantamagazine.org | allowed / allowed | https://www.quantamagazine.org/terms-conditions/ | The terms permit use of the Site for personal, non-commercial use only and then forbid two things this phase would do: reproducing or storing the material on the Site, and conducting systematic or automated data collection on it. A scripted browser saving page images is automated collection and the saved image is a reproduction, so the clauses are taken literally rather than read around. | not investigated; licence: none stated | **link-only** |
| theverge.com | allowed / allowed | https://www.voxmedia.com/terms-of-use/ | Vox Media's terms forbid using any "robot", "spider", "rover", "scraper" or any other data-mining technology or automatic or manual process to monitor, cache, frame, mask, extract data from, copy or distribute any data from the Services, and separately say the Content may not be copied, reproduced or republished without prior written permission. | not investigated; licence: none stated | **link-only** |
| smashingmagazine.com | allowed / allowed | https://www.smashingmagazine.com/privacy-policy/ | No terms-of-service document exists at the registry's candidate — /terms-of-use/ returns HTTP 404 and the index page exposes no anchor matching terms, conditions or legal — so the only policy document reachable was the privacy notice recorded here; it is a privacy notice, not terms, and the excerpts come from it. | not investigated; licence: none stated | **capture** |
| pudding.cool | allowed / allowed | https://pudding.cool/about/ | The Pudding publishes no terms-of-service document: /terms/ returns HTTP 404 and the index exposes no anchor matching terms, conditions or legal, so the page recorded here is the About page the registry named, and the single matching sentence in it is about sponsored posts. Nothing readable restricts automated access, rendering or screenshots. | not investigated; licence: none stated | **capture** |
| atlasobscura.com | unknown / unknown | none found | Nothing could be read: robots.txt returned HTTP 403 and all three terms attempts returned HTTP 403 to this gate's user agent — /terms, /terms-of-use, and /terms again after following the index page's own "Terms and Conditions" link. The index page itself returned HTTP 200, so the host is reachable, but neither the crawl rules nor the terms could be established. | not investigated; licence: none stated | **blocked** |
| awwwards.com | allowed / allowed | https://www.awwwards.com/terms/ | The terms reserve all rights in the site's material and prohibit unauthorized use or reproduction outright, and separately bar commercial use of the content without express authorization. A saved screenshot is a reproduction of that material and no authorization exists, so the terms forbid what this phase requires and the clause is not read around. | not investigated; licence: none stated | **link-only** |
| openhumans.org | allowed / allowed | https://www.openhumans.org/terms/ | Open Humans' terms govern accounts, member data and the licence a member grants for their own uploaded content; nothing in the saved text restricts automated access, crawling, rendering or screenshots, so rendering the two public pages and keeping screenshots for private study is not forbidden. | not investigated (https://www.openhumans.org/api-docs/); licence: none stated site-wide; the terms say only that for some content "alternative licenses or public domain dedications may allow more permissive use" (per item, not site-wide) | **capture** |
| biohackrxiv (osf.io) | allowed / allowed | https://github.com/CenterForOpenScience/cos.io/blob/master/TERMS_OF_USE.md | The Center for Open Science terms of use grant every user a licence to use content marked "public" — by "use" they mean sublicense, reproduce, store, transmit, distribute and publicly display it, for non-commercial and commercial uses — and place no restriction on automated access, crawling, rendering or screenshots. | yes (https://api.osf.io/v2/); licence: CC-By Attribution 4.0 International (the licence the OSF API states for the selected preprint); the OSF software itself is Apache 2.0; other content carries whatever licence its depositor identified | **capture** |
| wiki.biohack.me | allowed / allowed | https://wiki.biohack.me/doku.php?id=start | There is no terms-of-service document: both registry candidates are MediaWiki URLs that now redirect to a DokuWiki start page titled "start [HumanAug Wiki]" — the old wiki has been replaced — and the index exposes no anchor matching terms, conditions or legal. | no (https://wiki.biohack.me/api.php?action=query&meta=siteinfo&siprop=general%7Crightsinfo&format=json); licence: CC Attribution-Noncommercial-Share Alike 4.0 International (stated in the wiki footer) | **capture** |
| longevity wiki (url to verify) | allowed / allowed | none found | The wiki publishes no terms-of-service document — the registry lists no candidate and the verified index page exposes no anchor matching terms, conditions or legal — and robots.txt (HTTP 200) has no rule matching the verified path for a generic user agent, so nothing forbids rendering public pages and keeping screenshots for private study. | yes (https://en.longevitywiki.org/api.php); licence: Creative Commons Attribution-ShareAlike, https://creativecommons.org/licenses/by-sa/4.0/ (MediaWiki rightsinfo) | **capture** |
| forum.quantifiedself.com | allowed / allowed | https://forum.quantifiedself.com/tos | The forum's terms of service contain no clause on automated access, crawling, robots, spiders or screenshots; the restrictions concern accounts, what a member posts, and copyright complaints. Rendering the index and the /latest listing in a browser and keeping screenshots for private information-design study is therefore not forbidden, and robots.txt has no rule matching either path. | yes (https://forum.quantifiedself.com/about.json); licence: user contributions: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported; the terms document itself: CC-BY-SA | **capture** |
| longecity.org | allowed / allowed | none found | No terms document was located: both registry candidates return HTTP 404 and the index page (HTTP 200, 261,147 bytes) exposes no anchor whose text matches terms, conditions or legal, so no clause restricting automated access, rendering or screenshots was found — and unlike the two sites blocked here, none was refused to the gate either. | not investigated; licence: none stated | **capture** |
| experiment.com | allowed / allowed | none found | No terms document was located: /terms and /legal/terms both return HTTP 404 and the index page exposes no anchor matching terms, conditions or legal, so there is no clause restricting rendering or screenshots to read. robots.txt is explicit for both the index and the selected project page. | not investigated; licence: none stated | **capture** |
| zenodo.org | allowed / allowed | https://about.zenodo.org/terms/ | Zenodo's terms are short and permissive about reading: use of Zenodo denotes agreement with them, users must respect the licence conditions that apply to each item, and downloading transfers no intellectual property rights. | yes (https://zenodo.org/api/records); licence: per record; the selected record states cc-by-4.0. Zenodo's terms state only that "Users of content (“Users”) shall respect applicable license conditions." | **capture** |
| sphere.diybio.org | allowed / allowed | https://sphere.diybio.org/about/terms-of-use/ | The DIYbiosphere terms of use, reached by following the index page's own "Terms of Use" link, dedicate the rendered site to the public domain and place the repository files under the MIT License, with logos excepted. | not investigated; licence: rendered pages at sphere.diybio.org: CC0 public domain dedication; repository files at DIYbiosphere/sphere: MIT License; logos excluded from the CC0 dedication | **capture** |

## Per-site notes

### wikiwand.com (A1)
- Index: https://www.wikiwand.com/
- Content: https://www.wikiwand.com/en/articles/Metformin
- robots.txt: https://www.wikiwand.com/robots.txt — HTTP 200; index path `/` allowed, content path `/en/articles/Metformin` allowed.
- Verbatim robots lines relied on:
  - `User-agent: * -> Allow: /`
- Terms: none reached; 0 relevant verbatim excerpts saved to `nothing saved`.
- Every terms URL tried, in order: https://www.wikiwand.com/terms → HTTP 403; https://www.wikiwand.com/en/terms-of-service → HTTP 403.
- What the terms say about what this phase requires: No terms document could be read: both registry candidates (/terms and /en/terms-of-service) and the index page returned HTTP 403 to this gate, the index as a 5,671-byte challenge page, so what the terms permit for a person-operated browser rendering public pages and saving screenshots for private study is unestablished. robots.txt itself was served (HTTP 200) and its only rule for a generic user agent is `Allow: /`, which would permit both study paths. Because every terms candidate returned an error, the gate does not authorise a capture; the mandate's separate real-browser retry for this site is a question for the orchestrator, not a permission this gate can grant.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **blocked** — Blocked because every terms candidate returned an error to this gate: HTTP 403 at https://www.wikiwand.com/terms, HTTP 403 at https://www.wikiwand.com/en/terms-of-service and HTTP 403 (5,671 bytes) at the index page, so no clause could be read, even though robots.txt is readable and says "User-agent: * -> Allow: /" — proposed by legal gate
- Verbatim clauses relied on:
  - "User-agent: * -> Allow: /"
- Gate notes:
  - The index page exposed no anchor whose text matches /terms|conditions|legal/i.
### stripe.com/docs (A1)
- Index: https://docs.stripe.com/payments
- Content: https://docs.stripe.com/api/charges
- robots.txt: https://docs.stripe.com/robots.txt — HTTP 200; index path `/payments` allowed, content path `/api/charges` allowed; Sitemap https://docs.stripe.com/sitemap.xml.
- Verbatim robots lines relied on:
  - `User-agent: * -> Allow: /`
- Terms: https://stripe.com/en-sg/legal/consumer — HTTP 200; 15 relevant verbatim excerpts saved to `data/design-study/legal/stripe_com_docs.terms.txt`.
- Every terms URL tried, in order: https://stripe.com/legal/consumer → HTTP 200.
- What the terms say about what this phase requires: The document reached from the registry's first candidate is Stripe's Consumer Terms of Service (it redirected to /en-sg/legal/consumer), which governs Stripe's consumer payment services rather than reading docs.stripe.com; it contains no clause about automated access, crawling, rendering or screenshots, and its only automation language defines payment "Agents". Nothing in it restricts a person-operated browser opening the two public documentation pages or keeping screenshots for private design study. No site-wide website terms-of-use document was reached through the permitted candidate list, and that limit is recorded here rather than read as permission.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **capture** — robots.txt at docs.stripe.com allows both study paths and no clause in the saved terms text restricts rendering public pages or keeping screenshots; the robots rule relied on is "User-agent: * -> Allow: /" — proposed by legal gate
- Verbatim clauses relied on:
  - "User-agent: * -> Allow: /"
### vercel.com/docs (A1)
- Index: https://vercel.com/docs
- Content: https://vercel.com/docs/deployments
- robots.txt: https://vercel.com/robots.txt — HTTP 200; index path `/docs` allowed, content path `/docs/deployments` allowed; Sitemap https://vercel.com/sitemap.xml.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 17 rule(s), none matching these two paths; e.g. Allow: /api/og/* | Allow: /api/docs-og* | Allow: /api/product-og*`
- Terms: https://vercel.com/legal/terms — HTTP 200; 23 relevant verbatim excerpts saved to `data/design-study/legal/vercel_com_docs.terms.txt`.
- Every terms URL tried, in order: https://vercel.com/legal/terms → HTTP 200.
- What the terms say about what this phase requires: Vercel's terms are a subscription agreement for using the Vercel platform: the restrictions attach to the Services and to the licence a customer receives, not to reading vercel.com/docs. The saved text contains no mention of crawling, scraping, robots, spiders, data mining, automated access or screenshots, so a person-operated browser rendering the two public docs pages and keeping screenshots for private study is neither addressed nor forbidden. No content licence is stated.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **capture** — robots.txt (HTTP 200) has no rule matching /docs or /docs/deployments for a generic user agent, and no clause in the saved terms text restricts rendering or screenshots; the nearest clause reserves product and trademark rights only: "Any rights not expressly granted herein are reserved and no license or right to use any trademark of Vercel or any third-party is granted to you in connection with the Services." — proposed by legal gate
- Verbatim clauses relied on:
  - "Any rights not expressly granted herein are reserved and no license or right to use any trademark of Vercel or any third-party is granted to you in connection with the Services."
### linear.app/method (A1)
- Index: https://linear.app/method
- Content: https://linear.app/method/introduction
- robots.txt: https://linear.app/robots.txt — HTTP 200; index path `/method` allowed, content path `/method/introduction` allowed; Sitemap https://linear.app/sitemap.xml.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 3 rule(s), none matching these two paths; e.g. Disallow: /api/ | Disallow: /cdn-cgi/ | Allow: /api/og/`
- Terms: https://linear.app/terms — HTTP 200; 22 relevant verbatim excerpts saved to `data/design-study/legal/linear_app_method.terms.txt`.
- Every terms URL tried, in order: https://linear.app/terms → HTTP 200.
- What the terms say about what this phase requires: Linear's terms are a customer subscription agreement for the Linear product; the use restrictions attach to the Service and its Software (no modifying, copying, reverse engineering), not to reading the public /method pages. The saved text contains no clause on crawling, scraping, robots, automated access or screenshots, so rendering the two public pages and keeping screenshots for private study is not forbidden. No content licence is stated.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **capture** — robots.txt (HTTP 200) has no rule matching /method or /method/introduction for a generic user agent, and the only use restriction in the saved terms text is scoped to the Service software rather than to reading public pages: "Customer agrees that it will not, and will not allow Users or third parties to, directly or indirectly (a) modify, translate, copy or create derivative works based on the Service, (b) reverse assemble, reverse compile, reverse engineer, decompile or otherwise attempt to discover the object code, so…" — proposed by legal gate
- Verbatim clauses relied on:
  - "Customer agrees that it will not, and will not allow Users or third parties to, directly or indirectly (a) modify, translate, copy or create derivative works based on the Service, (b) reverse assemble, reverse compile, reverse engineer, decompile or otherwise attempt to discover the object code, source code, non-public APIs or underlying ideas or algorithms of the Service, except as and only…"
### quantamagazine.org (A1)
- Index: https://www.quantamagazine.org/
- Content: https://www.quantamagazine.org/genome-duplication-is-a-radical-evolutionary-gamble-20260902/
- robots.txt: https://www.quantamagazine.org/robots.txt — HTTP 200; index path `/` allowed, content path `/genome-duplication-is-a-radical-evolutionary-gamble-20260902/` allowed; Sitemap https://www.quantamagazine.org/sitemap.xml.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 2 rule(s), none matching these two paths; e.g. Disallow: /wp-admin/ | Allow: /wp-admin/admin-ajax.php`
- Terms: https://www.quantamagazine.org/terms-conditions/ — HTTP 200; 17 relevant verbatim excerpts saved to `data/design-study/legal/quantamagazine_org.terms.txt`.
- Every terms URL tried, in order: https://www.quantamagazine.org/terms-conditions/ → HTTP 200.
- What the terms say about what this phase requires: The terms permit use of the Site for personal, non-commercial use only and then forbid two things this phase would do: reproducing or storing the material on the Site, and conducting systematic or automated data collection on it. A scripted browser saving page images is automated collection and the saved image is a reproduction, so the clauses are taken literally rather than read around. No content licence is offered, so Quanta is linked to and nothing is kept.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **link-only** — The terms forbid reproduction and automated collection outright: "You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site, other than as permitted by law." "You must not conduct any systematic or automated data collection activities (including, without limitation, scraping, data mining, data extraction and data harvesting) on or in relation to our Site;" — proposed by legal gate
- Verbatim clauses relied on:
  - "You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Site, other than as permitted by law."
  - "You must not conduct any systematic or automated data collection activities (including, without limitation, scraping, data mining, data extraction and data harvesting) on or in relation to our Site;"
### theverge.com (A1)
- Index: https://www.theverge.com/
- Content: https://www.theverge.com/tech/988265/anker-sleep-earbuds-4-pro-price-date-specs
- robots.txt: https://www.theverge.com/robots.txt — HTTP 200; index path `/` allowed, content path `/tech/988265/anker-sleep-earbuds-4-pro-price-date-specs` allowed; Sitemap https://www.theverge.com/sitemaps/google_news, https://www.theverge.com/sitemaps.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 2 rule(s), none matching these two paths; e.g. Disallow: /wp-admin/ | Allow: /wp-admin/admin-ajax.php`
  - `# applicable group "User-agent: *" holds 15 rule(s), none matching these two paths; e.g. Allow: /sp/ | Disallow: /admin | Disallow: /newfanshot`
- Terms: https://www.voxmedia.com/terms-of-use/ — HTTP 200; 39 relevant verbatim excerpts saved to `data/design-study/legal/theverge_com.terms.txt`.
- Every terms URL tried, in order: https://www.voxmedia.com/legal/terms-of-use → HTTP 200.
- What the terms say about what this phase requires: Vox Media's terms forbid using any "robot", "spider", "rover", "scraper" or any other data-mining technology or automatic or manual process to monitor, cache, frame, mask, extract data from, copy or distribute any data from the Services, and separately say the Content may not be copied, reproduced or republished without prior written permission. A browser driven by a script that saves page images is such an automatic process, so the capture this phase requires is forbidden. No content licence is offered.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **link-only** — The terms forbid automated access and reproduction outright: "(g) use any "robot," "spider," "rover," "scraper" or any other data-mining technology or automatic or manual process to monitor, cache, frame, mask, extract data from, copy or distribute any data from the Services, our network or databases;" "(a) the Content may not be copied, modified, reproduced, republished, posted, transmitted, sold, offered for sale, or redistributed in any way without our prior written permission and that of our applicable licensors; and (b) you must abide by all copyright notices, information, or restrictions con…" — proposed by legal gate
- Verbatim clauses relied on:
  - "(g) use any "robot," "spider," "rover," "scraper" or any other data-mining technology or automatic or manual process to monitor, cache, frame, mask, extract data from, copy or distribute any data from the Services, our network or databases;"
  - "(a) the Content may not be copied, modified, reproduced, republished, posted, transmitted, sold, offered for sale, or redistributed in any way without our prior written permission and that of our applicable licensors; and (b) you must abide by all copyright notices, information, or restrictions contained in or attached to any Content."
### smashingmagazine.com (A1)
- Index: https://www.smashingmagazine.com/
- Content: https://www.smashingmagazine.com/2026/08/rethinking-data-visualisation-ux-approach-dashboards/
- robots.txt: https://www.smashingmagazine.com/robots.txt — HTTP 200; index path `/` allowed, content path `/2026/08/rethinking-data-visualisation-ux-approach-dashboards/` allowed; Sitemap https://www.smashingmagazine.com/sitemap.xml.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 191 rule(s), none matching these two paths; e.g. Disallow: /wp-admin/ | Disallow: /wp-includes/ | disallow: /wp-content/uploads/demos/BarGraph/index.html`
- Terms: https://www.smashingmagazine.com/privacy-policy/ — HTTP 200; 12 relevant verbatim excerpts saved to `data/design-study/legal/smashingmagazine_com.terms.txt`.
- Every terms URL tried, in order: https://www.smashingmagazine.com/terms-of-use/ → HTTP 404; https://www.smashingmagazine.com/privacy-policy/ → HTTP 200 (HTTP 200 but neither the URL nor the <title> "Privacy Notice — Smashing Magazine" identifies it as a terms, conditions, legal, copyright or disclaimer document; kept looking and held it only as a fallback).
- What the terms say about what this phase requires: No terms-of-service document exists at the registry's candidate — /terms-of-use/ returns HTTP 404 and the index page exposes no anchor matching terms, conditions or legal — so the only policy document reachable was the privacy notice recorded here; it is a privacy notice, not terms, and the excerpts come from it. It says nothing about automated access, crawling, screenshots or reproduction of articles; its only "automated" language is the GDPR right not to be subject to automated decision-making. robots.txt is served and no rule in it matches either study path for a generic user agent, so nothing that could be read forbids a person-operated browser rendering the two public pages and keeping screenshots for private study.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **capture** — No terms document exists (HTTP 404 at /terms-of-use/, and the index exposes no terms, conditions or legal anchor) and robots.txt has no rule matching either study path; the only automation clause in the privacy notice that was reachable concerns automated decision-making, not access: "You will have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you." — proposed by legal gate
- Verbatim clauses relied on:
  - "You will have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you."
- Gate notes:
  - The index page exposed no anchor whose text matches /terms|conditions|legal/i.
  - No terms-of-service document was reached. The closest page kept as a fallback is https://www.smashingmagazine.com/privacy-policy/; it is not a terms document, and its text is what the excerpts below come from.
### pudding.cool (A1)
- Index: https://pudding.cool/
- Content: https://pudding.cool/2026/07/essential-words
- robots.txt: https://pudding.cool/robots.txt — HTTP 404; index path `/` allowed, content path `/2026/07/essential-words` allowed.
- Verbatim robots lines relied on: none matched these paths.
- Terms: https://pudding.cool/about/ — HTTP 200; 1 relevant verbatim excerpts saved to `data/design-study/legal/pudding_cool.terms.txt`.
- Every terms URL tried, in order: https://pudding.cool/about/ → HTTP 200 (HTTP 200 but neither the URL nor the <title> "About Us" identifies it as a terms, conditions, legal, copyright or disclaimer document; kept looking and held it only as a fallback); https://pudding.cool/terms/ → HTTP 404.
- What the terms say about what this phase requires: The Pudding publishes no terms-of-service document: /terms/ returns HTTP 404 and the index exposes no anchor matching terms, conditions or legal, so the page recorded here is the About page the registry named, and the single matching sentence in it is about sponsored posts. Nothing readable restricts automated access, rendering or screenshots. robots.txt returns HTTP 404, so no crawl rules exist and neither study path is disallowed.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **capture** — No terms document exists (HTTP 404 at /terms/, no terms anchor on the index) and no robots.txt is served (HTTP 404), so no rule and no clause restricts rendering or screenshots; the only sentence in the About page that the scan matched is: "The only time a brand finds its way on The Pudding is through sponsored posts, like this one we just did about congressional tweets with Saleforce’s Einstein API or this one about Dear Abby letters with IBM Watson." — proposed by legal gate
- Verbatim clauses relied on:
  - "The only time a brand finds its way on The Pudding is through sponsored posts, like this one we just did about congressional tweets with Saleforce’s Einstein API or this one about Dear Abby letters with IBM Watson."
- Gate notes:
  - The index page exposed no anchor whose text matches /terms|conditions|legal/i.
  - No terms-of-service document was reached. The closest page kept as a fallback is https://pudding.cool/about/; it is not a terms document, and its text is what the excerpts below come from.
### atlasobscura.com (A1)
- Index: https://www.atlasobscura.com/
- Content: https://www.atlasobscura.com/articles/all-places-in-the-atlas-on-one-map
- robots.txt: https://www.atlasobscura.com/robots.txt — HTTP 403; index path `/` unknown, content path `/articles/all-places-in-the-atlas-on-one-map` unknown.
- Verbatim robots lines relied on: none matched these paths.
- Terms: none reached; 0 relevant verbatim excerpts saved to `nothing saved`.
- Every terms URL tried, in order: https://www.atlasobscura.com/terms → HTTP 403; https://www.atlasobscura.com/terms-of-use → HTTP 403; https://www.atlasobscura.com/terms → HTTP 403 (discovered on the index page).
- What the terms say about what this phase requires: Nothing could be read: robots.txt returned HTTP 403 and all three terms attempts returned HTTP 403 to this gate's user agent — /terms, /terms-of-use, and /terms again after following the index page's own "Terms and Conditions" link. The index page itself returned HTTP 200, so the host is reachable, but neither the crawl rules nor the terms could be established. With robots.txt unreadable, the condition for capture — robots allowing both study paths — cannot be satisfied, so the gate does not authorise a capture.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **blocked** — Blocked because robots.txt returned HTTP 403 and every terms candidate returned HTTP 403 to this gate (https://www.atlasobscura.com/robots.txt 403; /terms 403; /terms-of-use 403; /terms 403 again after following the index page's "Terms and Conditions" link), so neither the crawl rules nor any clause could be read — proposed by legal gate
- Verbatim clauses relied on: none — either no terms text was readable, or none of it restricts this phase; the HTTP statuses and robots lines above are the evidence.
- Gate notes:
  - No terms candidate returned usable text, so the index page was fetched once and the first anchor whose text matches /terms|conditions|legal/i was followed: "Terms and Conditions" -> https://www.atlasobscura.com/terms.
### awwwards.com (A1)
- Index: https://www.awwwards.com/
- Content: https://www.awwwards.com/websites/
- robots.txt: https://www.awwwards.com/robots.txt — HTTP 200; index path `/` allowed, content path `/websites/` allowed; Sitemap https://www.awwwards.com/sitemap.xml.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 27 rule(s), none matching these two paths; e.g. Disallow: /feed | Disallow: /vote/ | Disallow: /tag/`
- Terms: https://www.awwwards.com/terms/ — HTTP 200; 8 relevant verbatim excerpts saved to `data/design-study/legal/awwwards_com.terms.txt`.
- Every terms URL tried, in order: https://www.awwwards.com/terms-of-use/ → HTTP 404; https://www.awwwards.com/terms/ → HTTP 200.
- What the terms say about what this phase requires: The terms reserve all rights in the site's material and prohibit unauthorized use or reproduction outright, and separately bar commercial use of the content without express authorization. A saved screenshot is a reproduction of that material and no authorization exists, so the terms forbid what this phase requires and the clause is not read around. robots.txt has no rule matching either study path, but that does not displace the terms; the site is linked to and nothing is kept.
- API: not investigated. Licence as stated: none stated. not investigated: A1 site, screenshot study only
- Decision: **link-only** — The terms forbid reproduction outright: "All rights are reserved and any unauthorized use or reproduction is strictly prohibited." "Our content may not be used for commercial purposes unless expressly authorized by Awwwards." — proposed by legal gate
- Verbatim clauses relied on:
  - "All rights are reserved and any unauthorized use or reproduction is strictly prohibited."
  - "Our content may not be used for commercial purposes unless expressly authorized by Awwwards."
### openhumans.org (A2)
- Index: https://www.openhumans.org/
- Content: https://www.openhumans.org/explore-share/
- robots.txt: https://www.openhumans.org/robots.txt — HTTP 404; index path `/` allowed, content path `/explore-share/` allowed.
- Verbatim robots lines relied on: none matched these paths.
- Terms: https://www.openhumans.org/terms/ — HTTP 200; 8 relevant verbatim excerpts saved to `data/design-study/legal/openhumans_org.terms.txt`.
- Every terms URL tried, in order: https://www.openhumans.org/terms/ → HTTP 200.
- What the terms say about what this phase requires: Open Humans' terms govern accounts, member data and the licence a member grants for their own uploaded content; nothing in the saved text restricts automated access, crawling, rendering or screenshots, so rendering the two public pages and keeping screenshots for private study is not forbidden. For A2 extraction the terms grant no site-wide content licence — they say only that some content carries alternative licences or public domain dedications — so structured content should be linked rather than copied unless a specific page states its own licence. Whether a public API exists was not established: the documented API documentation URL returned HTTP 404 and no API link appears on the pages already fetched, and nothing further was fetched. No robots.txt is served (HTTP 404), so no crawl rule disallows either path.
- API: not investigated — https://www.openhumans.org/api-docs/. Licence as stated: none stated site-wide; the terms say only that for some content "alternative licenses or public domain dedications may allow more permissive use" (per item, not site-wide). the documented API documentation URL https://www.openhumans.org/api-docs/ returned HTTP 404 and no anchor matching "API" appears on the pages already fetched, so the existence of a public API is not established; nothing further was fetched
- Decision: **capture** — No robots.txt is served (HTTP 404) so no path is disallowed, and no clause in the saved terms text restricts automated access, rendering or screenshots; the licence position, which limits extraction rather than viewing, is stated only as (the terms text is hard-wrapped, so these are the lines verbatim): "For some content, alternative licenses or public domain dedications may" "This license lets you use Open Humans solely as" — proposed by legal gate
- Verbatim clauses relied on:
  - "For some content, alternative licenses or public domain dedications may"
  - "This license lets you use Open Humans solely as"
- Gate notes:
  - API probe https://www.openhumans.org/api-docs/ -> 404.
### biohackrxiv (osf.io) (A2)
- Index: https://osf.io/preprints/biohackrxiv
- Content: https://osf.io/preprints/biohackrxiv/5psfj_v2
- How the content page was chosen: Selected through the OSF API (https://api.osf.io/v2/preprints/?filter%5Bprovider%5D=biohackrxiv&page%5Bsize%5D=5&sort=-date_published&embed=license): the most recently published public BiohackrXiv preprint, id 5psfj_v2, titled "Towards Federated Learning Across Biobanks: Prototype Software from the 2026 Carnegie Mellon University–NVIDIA Hackathon"; the API states its licence is CC-By Attribution 4.0 International.
- robots.txt: https://osf.io/robots.txt — HTTP 200; index path `/preprints/biohackrxiv` allowed, content path `/preprints/biohackrxiv/5psfj_v2` allowed; Crawl-delay 10.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 2 rule(s), none matching these two paths; e.g. Disallow: /api/* | Disallow: *?view_only=`
- Terms: https://github.com/CenterForOpenScience/cos.io/blob/master/TERMS_OF_USE.md — HTTP 200; 40 relevant verbatim excerpts saved to `data/design-study/legal/biohackrxiv.terms.txt`.
- Every terms URL tried, in order: https://github.com/CenterForOpenScience/cos.io/blob/master/TERMS_OF_USE.md → HTTP 200.
- What the terms say about what this phase requires: The Center for Open Science terms of use grant every user a licence to use content marked "public" — by "use" they mean sublicense, reproduce, store, transmit, distribute and publicly display it, for non-commercial and commercial uses — and place no restriction on automated access, crawling, rendering or screenshots. Rendering the BiohackrXiv index and the one selected public preprint in a browser and keeping screenshots for private study is therefore permitted, and extracting structured content for citation and linking is permitted for public content under the licence its depositor identified; the prohibition the pattern scan flagged concerns harvesting personal data for commercial purposes and unsolicited advertising, not reading preprints. osf.io's robots.txt allows both study paths and asks for a 10-second crawl delay. Recorded honestly: the gate's own three requests to api.osf.io were disallowed by that host's robots.txt (`User-agent: * / Disallow: /`), so no further API request may be made there and the preprint page selected from that response is the last thing taken from it.
- API: exists — https://api.osf.io/v2/. Licence as stated: CC-By Attribution 4.0 International (the licence the OSF API states for the selected preprint); the OSF software itself is Apache 2.0; other content carries whatever licence its depositor identified. the OSF Public API root returned HTTP 200, but api.osf.io/robots.txt disallows every path for a generic user agent (`User-agent: * / Disallow: /`); the gate had already made three requests there before it audited that host, which is reported in the self-audit and must not be repeated
- Decision: **capture** — robots.txt on osf.io allows both study paths (Crawl-delay 10) and the terms of use grant a licence to use public content rather than restricting it; the flagged prohibition is about personal-data harvesting and advertising, not reading: "In addition, the COS grants you a license to use any Content marked "public," subject to patent, copyright and trademark law and these Terms of Use, including the limits described in the section governing Limitations on Use below." "By "use" we mean sublicense, reproduce, store, transmit, distribute, and publicly display the Content for non-commercial and commercial uses." "You are further prohibited from harvesting addresses, email addresses, or other personal data for commercial purposes and from sending unsolicited or unauthorized advertising, promotional materials, or other unsolicited communications to other users of the Websites or Services." — proposed by legal gate
- Verbatim clauses relied on:
  - "In addition, the COS grants you a license to use any Content marked "public," subject to patent, copyright and trademark law and these Terms of Use, including the limits described in the section governing Limitations on Use below."
  - "By "use" we mean sublicense, reproduce, store, transmit, distribute, and publicly display the Content for non-commercial and commercial uses."
  - "You are further prohibited from harvesting addresses, email addresses, or other personal data for commercial purposes and from sending unsolicited or unauthorized advertising, promotional materials, or other unsolicited communications to other users of the Websites or Services."
### wiki.biohack.me (A2)
- Index: https://wiki.biohack.me/
- Content: https://wiki.biohack.me/doku.php?id=biology
- How the content page was chosen: Registry candidate https://wiki.biohack.me/index.php?title=Magnets redirects to the wiki start page, so that article does not exist, and this wiki serves no MediaWiki API (api.php returned HTTP 404). Replaced with the first article link on a page already fetched (link text "Biology"): https://wiki.biohack.me/doku.php?id=biology.
- robots.txt: https://wiki.biohack.me/robots.txt — HTTP 404; index path `/` allowed, content path `/doku.php?id=biology` allowed.
- Verbatim robots lines relied on: none matched these paths.
- Terms: https://wiki.biohack.me/doku.php?id=start — HTTP 200; 2 relevant verbatim excerpts saved to `data/design-study/legal/wiki_biohack_me.terms.txt`.
- Every terms URL tried, in order: https://wiki.biohack.me/index.php?title=Biohack.me_Wiki:General_disclaimer → HTTP 200 (HTTP 200 (redirected to https://wiki.biohack.me/doku.php?id=start) but neither the URL nor the <title> "start [HumanAug Wiki]" identifies it as a terms, conditions, legal, copyright or disclaimer document; kept looking and held it only as a fallback); https://wiki.biohack.me/index.php?title=Biohack.me_Wiki:Copyrights → HTTP 200 (HTTP 200 (redirected to https://wiki.biohack.me/doku.php?id=start) but neither the URL nor the <title> "start [HumanAug Wiki]" identifies it as a terms, conditions, legal, copyright or disclaimer document; kept looking and held it only as a fallback).
- What the terms say about what this phase requires: There is no terms-of-service document: both registry candidates are MediaWiki URLs that now redirect to a DokuWiki start page titled "start [HumanAug Wiki]" — the old wiki has been replaced — and the index exposes no anchor matching terms, conditions or legal. The page that was reached states the site's licence in its footer, and nothing readable restricts automated access, rendering or screenshots, so rendering public pages and keeping screenshots for private study is not forbidden; extraction for citation is permitted under that licence, with attribution, share-alike and non-commercial use. No robots.txt is served (HTTP 404), and api.php returns HTTP 404, so this wiki has no MediaWiki API.
- API: none reachable — https://wiki.biohack.me/api.php?action=query&meta=siteinfo&siprop=general%7Crightsinfo&format=json. Licence as stated: CC Attribution-Noncommercial-Share Alike 4.0 International (stated in the wiki footer). api.php returns HTTP 404: the site is now DokuWiki, not MediaWiki, so no MediaWiki API exists; no other API URL was discoverable on the pages already fetched
- Decision: **capture** — No robots.txt is served (HTTP 404) and no terms document exists (both registry candidates redirect to the wiki start page); the only governing statement reachable is the footer licence: "Except where otherwise noted, content on this wiki is licensed under the following license:" "CC Attribution-Noncommercial-Share Alike 4.0 International" — proposed by legal gate
- Verbatim clauses relied on:
  - "Except where otherwise noted, content on this wiki is licensed under the following license:"
  - "CC Attribution-Noncommercial-Share Alike 4.0 International"
- Gate notes:
  - The index page exposed no anchor whose text matches /terms|conditions|legal/i.
  - No terms-of-service document was reached. The closest page kept as a fallback is https://wiki.biohack.me/doku.php?id=start; it is not a terms document, and its text is what the excerpts below come from.
  - API probe https://wiki.biohack.me/api.php?action=query&meta=siteinfo&siprop=general%7Crightsinfo&format=json -> 404.
  - Candidate article https://wiki.biohack.me/index.php?title=Magnets -> HTTP 200 but redirected to https://wiki.biohack.me/doku.php?id=start, so that article does not exist; picking another article.
  - MediaWiki allpages -> HTTP 404; no MediaWiki API exists here.
### longevity wiki (url to verify) (A2)
- Index: https://en.longevitywiki.org/wiki/Longevity_Wiki
- Content: https://en.longevitywiki.org/wiki/Longevity_Wiki
- How the content page was chosen: Host verified by the legal gate: https://en.longevitywiki.org/wiki/Longevity_Wiki returned HTTP 200 with <title> "Longevity Wiki". Index and content point at the verified host; a content article is chosen by the capture pass only if the gate allows capture.
- robots.txt: https://en.longevitywiki.org/robots.txt — HTTP 200; index path `/wiki/Longevity_Wiki` allowed, content path `/wiki/Longevity_Wiki` allowed.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 1 rule(s), none matching these two paths; e.g. Disallow: /index.php`
- Terms: none reached; 0 relevant verbatim excerpts saved to `nothing saved`.
- Every terms URL tried, in order: none — the registry lists no terms candidate for this site.
- What the terms say about what this phase requires: The wiki publishes no terms-of-service document — the registry lists no candidate and the verified index page exposes no anchor matching terms, conditions or legal — and robots.txt (HTTP 200) has no rule matching the verified path for a generic user agent, so nothing forbids rendering public pages and keeping screenshots for private study. The MediaWiki API states the site's rights, which permits extraction for citation with attribution and share-alike. The canonical host was verified: https://longevitywiki.org/ redirects to https://en.longevitywiki.org/wiki/Longevity_Wiki, HTTP 200, <title> "Longevity Wiki", MediaWiki 1.41.0; that URL is now recorded as both the index and the content page, and a content article will be chosen only if the capture is confirmed.
- API: exists — https://en.longevitywiki.org/api.php. Licence as stated: Creative Commons Attribution-ShareAlike, https://creativecommons.org/licenses/by-sa/4.0/ (MediaWiki rightsinfo). MediaWiki 1.41.0 action API; siteinfo and rightsinfo returned HTTP 200 and en.longevitywiki.org/robots.txt allows /api.php
- Decision: **capture** — robots.txt (HTTP 200) has no rule matching the verified path, no terms document exists, and the site's own API states its content licence: ""rightsinfo":{"url":"https://creativecommons.org/licenses/by-sa/4.0/","text":"Creative Commons Attribution-ShareAlike"}" — proposed by legal gate
- Verbatim clauses relied on:
  - ""rightsinfo":{"url":"https://creativecommons.org/licenses/by-sa/4.0/","text":"Creative Commons Attribution-ShareAlike"}"
- Gate notes:
  - Host verification: https://longevitywiki.org/ -> https://en.longevitywiki.org/wiki/Longevity_Wiki HTTP 200, <title> "Longevity Wiki".
  - The index page exposed no anchor whose text matches /terms|conditions|legal/i.
### forum.quantifiedself.com (A2)
- Index: https://forum.quantifiedself.com/
- Content: https://forum.quantifiedself.com/latest
- robots.txt: https://forum.quantifiedself.com/robots.txt — HTTP 200; index path `/` allowed, content path `/latest` allowed; Sitemap https://forum.quantifiedself.com/sitemap.xml.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 15 rule(s), none matching these two paths; e.g. Disallow: /admin/ | Disallow: /auth/ | Disallow: /assets/browser-update*.js`
- Terms: https://forum.quantifiedself.com/tos — HTTP 200; 13 relevant verbatim excerpts saved to `data/design-study/legal/forum_quantifiedself_com.terms.txt`.
- Every terms URL tried, in order: https://forum.quantifiedself.com/tos → HTTP 200.
- What the terms say about what this phase requires: The forum's terms of service contain no clause on automated access, crawling, robots, spiders or screenshots; the restrictions concern accounts, what a member posts, and copyright complaints. Rendering the index and the /latest listing in a browser and keeping screenshots for private information-design study is therefore not forbidden, and robots.txt has no rule matching either path. User contributions carry a stated Creative Commons licence, so attributed non-commercial quotation with share-alike would be permitted — but the mandate treats forums as screenshot-only, so no thread was fetched here and nothing is extracted.
- API: exists — https://forum.quantifiedself.com/about.json. Licence as stated: user contributions: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported; the terms document itself: CC-BY-SA. Discourse JSON endpoints exist and about.json returned HTTP 200 (site metadata only); robots.txt allows it. No thread, topic or post JSON was fetched, and none may be: this site is screenshot-only.
- Decision: **capture** — robots.txt has no rule matching either path and no clause in the terms of service restricts automated access, rendering or screenshots; the licence the terms do state is: "User contributions are licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License ." "This document is CC-BY-SA." — proposed by legal gate
- Verbatim clauses relied on:
  - "User contributions are licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License ."
  - "This document is CC-BY-SA."
### longecity.org (A2)
- Index: https://www.longecity.org/forum/
- Content: https://www.longecity.org/forum/forum/3-supplements/
- robots.txt: https://www.longecity.org/robots.txt — HTTP 404; index path `/forum/` allowed, content path `/forum/forum/3-supplements/` allowed.
- Verbatim robots lines relied on: none matched these paths.
- Terms: none reached; 0 relevant verbatim excerpts saved to `nothing saved`.
- Every terms URL tried, in order: https://www.longecity.org/forum/terms/ → HTTP 404; https://www.longecity.org/forum/page/terms → HTTP 404.
- What the terms say about what this phase requires: No terms document was located: both registry candidates return HTTP 404 and the index page (HTTP 200, 261,147 bytes) exposes no anchor whose text matches terms, conditions or legal, so no clause restricting automated access, rendering or screenshots was found — and unlike the two sites blocked here, none was refused to the gate either. No robots.txt is served (HTTP 404), so no crawl rule disallows the forum index or the supplements category listing. No content licence is stated anywhere the gate could read, and nothing is extracted: this is a forum, so the study is screenshots only and no thread was fetched.
- API: not investigated. Licence as stated: none stated. not investigated: no permitted API probe for this host; forum, screenshot-only study, extract nothing
- Decision: **capture** — No robots.txt is served (HTTP 404) so no path is disallowed, and no terms document exists to read (https://www.longecity.org/forum/terms/ 404, https://www.longecity.org/forum/page/terms 404, and the index page exposes no terms, conditions or legal anchor), so no clause forbids rendering public listing pages and keeping screenshots; extraction is excluded separately by the mandate's forum rule — proposed by legal gate
- Verbatim clauses relied on: none — either no terms text was readable, or none of it restricts this phase; the HTTP statuses and robots lines above are the evidence.
- Gate notes:
  - The index page exposed no anchor whose text matches /terms|conditions|legal/i.
### experiment.com (A2)
- Index: https://experiment.com/
- Content: https://experiment.com/projects/algorithms-and-news-trust-why-independents-may-be-left-behind
- How the content page was chosen: Selected from the public listing page https://experiment.com/discover: first project anchor in the server-rendered markup (link text "You're a backer!"). No API documentation URL was discoverable, so a listing page was used.
- robots.txt: https://experiment.com/robots.txt — HTTP 200; index path `/` allowed, content path `/projects/algorithms-and-news-trust-why-independents-may-be-left-behind` allowed; Sitemap http://sitemap.experiment.com/index.xml.gz.
- Verbatim robots lines relied on:
  - `User-agent: * -> Allow: /`
- Terms: none reached; 0 relevant verbatim excerpts saved to `nothing saved`.
- Every terms URL tried, in order: https://experiment.com/terms → HTTP 404; https://experiment.com/legal/terms → HTTP 404.
- What the terms say about what this phase requires: No terms document was located: /terms and /legal/terms both return HTTP 404 and the index page exposes no anchor matching terms, conditions or legal, so there is no clause restricting rendering or screenshots to read. robots.txt is explicit for both the index and the selected project page. No content licence is stated and no documented API URL was discoverable from the pages already fetched, so for A2 purposes the project page should be linked rather than extracted.
- API: not investigated. Licence as stated: none stated. no documented API URL was discoverable from the terms or index page already fetched; not probed
- Decision: **capture** — No terms document exists (HTTP 404 at /terms and /legal/terms; no terms anchor on the index), and robots.txt allows both the index and the selected project page: "User-agent: * -> Allow: /" — proposed by legal gate
- Verbatim clauses relied on:
  - "User-agent: * -> Allow: /"
- Gate notes:
  - The index page exposed no anchor whose text matches /terms|conditions|legal/i.
### zenodo.org (A2)
- Index: https://zenodo.org/
- Content: https://zenodo.org/records/22273492
- How the content page was chosen: Selected through the Zenodo REST API (https://zenodo.org/api/records?q=longevity&size=5&sort=mostrecent): the most recent open record matching "longevity", id 22273492, titled "Interactive Effects of Health Expenditure and Income Inequality on Under-five Mortality in Sub-Saharan Africa", record licence cc-by-4.0.
- robots.txt: https://zenodo.org/robots.txt — HTTP 200; index path `/` allowed, content path `/records/22273492` allowed; Crawl-delay 10.
- Verbatim robots lines relied on:
  - `# applicable group "User-agent: *" holds 11 rule(s), none matching these two paths; e.g. Disallow: /search | Disallow: /api | Disallow: /administration`
- Terms: https://about.zenodo.org/terms/ — HTTP 200; 4 relevant verbatim excerpts saved to `data/design-study/legal/zenodo_org.terms.txt`.
- Every terms URL tried, in order: https://about.zenodo.org/terms/ → HTTP 200.
- What the terms say about what this phase requires: Zenodo's terms are short and permissive about reading: use of Zenodo denotes agreement with them, users must respect the licence conditions that apply to each item, and downloading transfers no intellectual property rights. There is no clause on automated access, crawling, robots or screenshots, so rendering the index and one public record page in a browser and keeping screenshots for private study is not forbidden; robots.txt allows both of those paths and asks for a 10-second crawl delay. Extraction for citation and linking is permitted subject to each record's own licence — the record selected here states cc-by-4.0. Recorded honestly: the gate's own three requests to zenodo.org/api were disallowed by robots.txt (`User-agent: * / Disallow: /api`), so no further API request may be made and the record page selected from that response is the last thing taken from it.
- API: exists — https://zenodo.org/api/records. Licence as stated: per record; the selected record states cc-by-4.0. Zenodo's terms state only that "Users of content (“Users”) shall respect applicable license conditions.". the Zenodo REST API exists and returned HTTP 200, but zenodo.org/robots.txt disallows /api for a generic user agent (`Disallow: /api`, with a narrow `Allow: /api/records/*/files`); the gate had already made three requests there before it audited the host, which is reported in the self-audit and must not be repeated
- Decision: **capture** — robots.txt allows the index and the selected record page (Crawl-delay 10; only /search, /api and account paths are disallowed) and the terms contain no clause on automated access, rendering or screenshots, only a duty to respect item licences: "Use of Zenodo, both the uploading and downloading of data, denotes agreement with the following terms:" "Users of content (“Users”) shall respect applicable license conditions." "Download and use of content from Zenodo does not transfer any intellectual property rights in the content to the User." — proposed by legal gate
- Verbatim clauses relied on:
  - "Use of Zenodo, both the uploading and downloading of data, denotes agreement with the following terms:"
  - "Users of content (“Users”) shall respect applicable license conditions."
  - "Download and use of content from Zenodo does not transfer any intellectual property rights in the content to the User."
### sphere.diybio.org (A2)
- Index: https://sphere.diybio.org/
- Content: https://sphere.diybio.org/
- robots.txt: https://sphere.diybio.org/robots.txt — HTTP 200; index path `/` allowed, content path `/` allowed; Sitemap https://sphere.diybio.org/sitemap.xml.
- Verbatim robots lines relied on:
  - `# no group in this robots.txt applies to our user agent or to *`
- Terms: https://sphere.diybio.org/about/terms-of-use/ — HTTP 200 (found by following a terms link on the index page, fetched once); 10 relevant verbatim excerpts saved to `data/design-study/legal/sphere_diybio_org.terms.txt`.
- Every terms URL tried, in order: https://sphere.diybio.org/terms → HTTP 404; https://diybio.org/terms → HTTP 404; https://sphere.diybio.org/about/terms-of-use → HTTP 200 (discovered on the index page).
- What the terms say about what this phase requires: The DIYbiosphere terms of use, reached by following the index page's own "Terms of Use" link, dedicate the rendered site to the public domain and place the repository files under the MIT License, with logos excepted. Nothing restricts automated access, rendering or screenshots, so capture is permitted; extraction for citation and linking is permitted for the rendered pages under CC0, and attribution is still the honest practice even where the licence does not demand it. robots.txt is served but contains only a Sitemap line — no group applies to any user agent — so no path is disallowed. No project or group page was discoverable in the index's server-rendered markup, so the content page stays the index and is recorded as such.
- API: not investigated. Licence as stated: rendered pages at sphere.diybio.org: CC0 public domain dedication; repository files at DIYbiosphere/sphere: MIT License; logos excluded from the CC0 dedication. no documented API URL was discoverable from the terms or index page already fetched, so no API probe was made and the existence of an API is not established
- Decision: **capture** — robots.txt contains no user-agent group at all (only a Sitemap line), so nothing is disallowed, and the terms of use dedicate the rendered pages to the public domain: "Website the rendered webpages at: sphere.diybio.org , are dedicated to the Public Domain with CC0 License ." "Repository the raw files at: DIYbiosphere/sphere are shared under the MIT License ." "Except where otherwise noted, content on this site is dedicated to the public domain" — proposed by legal gate
- Verbatim clauses relied on:
  - "Website the rendered webpages at: sphere.diybio.org , are dedicated to the Public Domain with CC0 License ."
  - "Repository the raw files at: DIYbiosphere/sphere are shared under the MIT License ."
  - "Except where otherwise noted, content on this site is dedicated to the public domain"
- Gate notes:
  - No terms candidate returned usable text, so the index page was fetched once and the first anchor whose text matches /terms|conditions|legal/i was followed: "Terms of Use" -> https://sphere.diybio.org/about/terms-of-use.
  - sphere.diybio.org index exposed no project/group anchor in server-rendered markup; content page stays the index.
## Self-audit of the gate's own requests

Every request the gate made was checked against the robots.txt of the host it went to (50 distinct host+path pairs; see `data/design-study/legal/host-audit.json`). 6 request(s) the gate had already made were disallowed by that host's robots.txt, reported here rather than left unrecorded:

- api.osf.io/v2/ — disallowed by that host's robots.txt: User-agent: * -> Disallow: /
- api.osf.io/v2/preprints/?filter%5Bprovider%5D=biohackrxiv&page%5Bsize%5D=5&sort=-date_published — disallowed by that host's robots.txt: User-agent: * -> Disallow: /
- api.osf.io/v2/preprints/?filter%5Bprovider%5D=biohackrxiv&page%5Bsize%5D=5&sort=-date_published&embed=license — disallowed by that host's robots.txt: User-agent: * -> Disallow: /
- zenodo.org/api/ — disallowed by that host's robots.txt: User-agent: * -> Disallow: /api
- zenodo.org/api/records?q=longevity&size=5&sort=mostrecent — disallowed by that host's robots.txt: User-agent: * -> Disallow: /api
- zenodo.org/api/records?size=1 — disallowed by that host's robots.txt: User-agent: * -> Disallow: /api

