# Handoff prompt: continue the COS brief site + text delivery

Paste everything between the lines into a new Claude Desktop (Code tab) session with this repo open.

---
We are continuing work on Stephanie Hart's Brown Sugar Bakery Chief of Staff (COS) brief. Read `agent/chief-of-staff.md` (the agent's full prompt), `agent/PROMPT-CHANGES.md`, `agent/desktop-start.md` and `README.md` first.

## What exists
- **Site** (this repo, Next.js on Vercel, Brown Sugar Bakery design): https://chiefofstaff-bay.vercel.app. Password login (`SITE_PASSWORD`, signed cookie with `SESSION_SECRET`). `/` is the latest brief, `/search` is searchable history with run filters, `/b/<id>` is one brief. Briefs render in a sandboxed iframe.
- **Ingest:** `POST /api/briefs` with `Authorization: Bearer $INGEST_SECRET` and JSON `{run, headline, html}`. Verified working by hand against Vercel.
- **Storage:** Supabase, the COS project. Table `cos_briefs` (SQL in `supabase/001_cos_briefs.sql`, already run). Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Without them the site falls back to `.data/briefs.json` (local only).
- **Publish tool:** `node scripts/publish-brief.mjs --run MORNING|MIDDAY|EVENING|TEST --headline "..." --html file.html`. Needs `SITE_URL` and `INGEST_SECRET` in the environment. It prints the link and the exact text to send.
- **Text format:** `COS Update · AM|Midday|End of Day · Day Mon D, h:mm AM/PM CT`, then the headline, then the link. AM = MORNING, Midday = MIDDAY, End of Day = EVENING. Sent with RingCentral `send_sms` (sender (331) 255-1877, SMS-capable). A test text to (630) 632-7291 was delivered.
- **Local runner:** `scripts/run-local.sh TEST <phone>`.
- **Branch:** `claude/serene-johnson-k73bw5` on `bakershart2-creator/chiefofstaff`. `main` is empty; production needs the branch merged into `main` or set as Vercel's production branch.
- Resend email delivery was removed. It did not work.

## Rules that still apply
- The agent never emails customers or vendors; it drafts only. Brief and alert content goes only by text to numbers in the `rules` table. Operator notices to Robert (rdawson@strategicdataproducts.com) stay email.
- Never print or store the INGEST_SECRET, passwords or phone numbers in reports, drafts, memory or commits. Do not paste secrets in chat.
- Never invent a number. Sales come only from Sales_Database.
- Send no text without showing me the exact wording and number first, unless I have already approved it.

## Open items, in order
1. Replace the `INGEST_SECRET` that was shared in chat earlier: new value in Vercel, redeploy, update `.env.local`.
2. Put the production code on `main` (pull request from the branch) or set the production branch in Vercel.
3. The `cos-brief-design` skill may still send through Resend: turn its send step off (I will paste the skill text if you need it edited).
4. Add recipient phone numbers to the `rules` table (Stephanie first).
5. Run a TEST end to end: `scripts/run-local.sh TEST 6306327291` with `SITE_URL` set to the Vercel address, confirm the brief appears on the site, the text arrives, and `sms_status` says Delivered.
6. Move the agent prompt into the scheduled harness once the TEST passes (section 3 run times).
7. Later: broaden the history site (threads, deadlines, drafts from the COS database) with Postgres full-text search.

Start by checking which of these are done, then ask me what to do first.
---
