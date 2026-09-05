# BLOCKERS — items only Felix can resolve

Each entry: the step, the exact command or input that needs it, the full error or missing input, the retries made, the alternative tried, and what would unblock it. The run continues with everything that does not depend on the entry.

## [2026-09-05T05:14:24+00:00] Credentials absent at session start (checked with `[ -n "$VAR" ]` for each name)

### B2/R2 credentials for DVC (Phase 6.4)
- Needs: `B2_KEY_ID` and `B2_APP_KEY` (Backblaze B2) or `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` (Cloudflare R2) in the environment of the shell that runs `dvc push`.
- Found: none of the four names set.
- What the run does instead: Phase 6.4 initialises DVC, configures the remote by name, commits the `.dvc` files, and writes the exact `dvc remote modify` and `dvc push` commands here; 6.4 is then BLOCKED-WITH-EVIDENCE until you run them.

### Search Console (Phase 0.4 and 6.6)
- Needs: `GSC_SERVICE_ACCOUNT_JSON` (path to a service-account key with read access to the rnawiki.com property), or the two CSV exports named in the 0.4 entry below once written.
- Found: not set.
- What the run does instead: `scripts/revamp/gsc_ingest.py` reads the exports; the click path to produce them is recorded under 0.4; 0.4 is BLOCKED-WITH-EVIDENCE.

### data.gov.sg API key (Phase 2, source 11)
- Needs: `DATA_GOV_SG_API_KEY` only if the HSA listing dataset rate-limits the unauthenticated API.
- Found: not set. The ingester tries unauthenticated first and records here if it is limited.

### DDInter 2.0 non-commercial gate (Phase 2 source 18, Phase 4.1)
- Needs: your written confirmation that CC BY-NC-SA data may be used for validation of a commercial site's predictions (validation only; never rendered, never in the corpus or release).
- Until then: validation runs against openFDA `drug_interactions` and the Inxight DDI dataset only. DDInter is retrieved into `data/validation/ddinter/` and joined to nothing.

### Release-candidate upload (Phase 6.5)
- Needs: your Zenodo or Hugging Face account to upload `data/release/` once built; the exact steps are written in the 6.5 entry when the tarball exists.
