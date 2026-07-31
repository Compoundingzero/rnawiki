#!/usr/bin/env node
// Build-time precompression for site/ static assets. No npm dependency — node:zlib only.
//
// WHY THIS IS A BUILD STEP AND NOT A REQUEST HANDLER
// -------------------------------------------------
// Measured on this machine, 2026-08-01, on the real site/data.js (11,662,047 B):
//
//     brotli q5   2,858,657 B     247 ms
//     brotli q9   2,624,244 B     691 ms
//     brotli q10  2,449,927 B   6,547 ms
//     brotli q11  2,391,843 B  15,922 ms      <- what this script writes
//     gzip  -9    3,450,414 B     ~700 ms
//
// Compressing data.js at q11 inside a request handler would block the event loop for sixteen
// seconds. Compressing it at q5 on every request would burn 247 ms of CPU per reader for a copy
// 466,814 B worse than the one we can compute once, at deploy time, for free. So it happens here,
// once, and server.js just reads the sibling off disk.
//
// WHAT PRODUCTION ACTUALLY DOES TODAY (measured, not assumed — W0 open question 2)
// -------------------------------------------------------------------------------
// `curl -H 'Accept-Encoding: br' https://rnawiki.com/data.js` returns `content-encoding: br` and
// 3,268,924 bytes on the wire: Cloudflare IS compressing, on the fly, at its own quality setting.
// So the W0 finding "8.80 MB saving per load, not taken" is only true of the origin. Two things
// are still true and still cost real bytes:
//   1. The edge's on-the-fly brotli is 3,268,924 B against 2,391,843 B here — 877,081 B per
//      uncached load that no reader has to pay.
//   2. `cf-cache-status: EXPIRED` on every fetch, because the origin ships no ETag and no
//      Last-Modified, so the edge has nothing to revalidate against and re-pulls all 11,662,047
//      uncompressed bytes from Railway each time. With a sibling on disk that pull is 2.39 MB.
// And anything that is not behind Cloudflare — the Railway origin URL, a local dev server, a
// self-hosted copy — gets no compression at all today.
//
// HTML IS DELIBERATELY NOT PRECOMPRESSED. server.js rewrites every HTML response at send time
// (versionAssets() injects ?v=<hash> and window.__V, and / and /protocol/* patch meta tags), so a
// .br built from the file on disk would not match the bytes actually served. HTML is compressed on
// the fly instead — it is small (max 122,267 B across all 617 files) and memoised by ETag.
//
// Rerun cost: a sibling is rebuilt only when it is older than its source, so a restart that
// changes nothing is a few stat() calls.

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const DIR = path.join(__dirname, '..', 'site');
// Text formats only. .glb / .png / .ico are already compressed — brotli would spend seconds to
// make them slightly larger, which is how "we enabled compression" turns into a regression.
const EXT = new Set(['.js', '.css', '.json', '.svg', '.xml', '.txt']);
// Below ~1 KB the framing overhead and the extra round of disk I/O outweigh the saving.
const MIN_BYTES = 1024;

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && EXT.has(path.extname(e.name))) out.push(p);
  }
  return out;
}

// Whole SECONDS, not milliseconds. utimesSync() rounds a Date to whole ms while the source's own
// mtimeMs carries sub-ms precision on APFS (site/app.js measured 1785463887253.0027 against its
// sibling's 1785463887253), so a strict ms comparison called every sibling stale and recompressed
// the entire corpus on every run. Second granularity is also what HTTP Last-Modified uses, so the
// server-side staleness check below agrees with this one by construction.
function sec(ms) { return Math.floor(ms / 1000); }
function fresh(sib, srcStat) {
  try { return sec(fs.statSync(sib).mtimeMs) >= sec(srcStat.mtimeMs); } catch (e) { return false; }
}

(function main() {
  let files;
  try { files = walk(DIR, []); } catch (e) {
    console.error('[precompress] cannot read ' + DIR + ': ' + e.message);
    process.exit(1);
  }
  const t0 = Date.now();
  let done = 0, skipped = 0, raw = 0, br = 0, gz = 0;
  for (const f of files) {
    const st = fs.statSync(f);
    if (st.size < MIN_BYTES) continue;
    const bp = f + '.br', gp = f + '.gz';
    if (fresh(bp, st) && fresh(gp, st)) {
      skipped++; raw += st.size; br += fs.statSync(bp).size; gz += fs.statSync(gp).size;
      continue;
    }
    const buf = fs.readFileSync(f);
    const b = zlib.brotliCompressSync(buf, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
        // 16 MB window. data.js is 11.66 MB of highly repetitive JSON; the default 4 MB window
        // cannot reference back across the whole file and gives up a measurable chunk of the ratio.
        [zlib.constants.BROTLI_PARAM_LGWIN]: 24,
      },
    });
    // gzip too, because `Accept-Encoding: gzip` with no `br` is still what some corporate proxies
    // and older clients send, and falling back to 11.66 MB identity for them is the whole defect.
    const g = zlib.gzipSync(buf, { level: 9 });
    // Write to a temp name and rename: a half-written .br served mid-build is a corrupt asset.
    fs.writeFileSync(bp + '.tmp', b); fs.renameSync(bp + '.tmp', bp);
    fs.writeFileSync(gp + '.tmp', g); fs.renameSync(gp + '.tmp', gp);
    // Match mtimes to the source so `fresh()` above and server.js's staleness check agree.
    fs.utimesSync(bp, st.atime, st.mtime); fs.utimesSync(gp, st.atime, st.mtime);
    done++; raw += buf.length; br += b.length; gz += g.length;
  }
  const pct = raw ? (100 - (br / raw) * 100).toFixed(1) : '0.0';
  console.log(`[precompress] ${done} compressed, ${skipped} already current · ${raw} B raw -> ${br} B br / ${gz} B gz (${pct}% smaller over brotli) · ${Date.now() - t0} ms`);
})();
