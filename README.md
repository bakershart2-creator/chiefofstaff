# COS Brief site

Mobile site for Stephanie's Chief of Staff briefs (Next.js on Vercel, Brown Sugar Bakery design).

- `/` newest brief · `/search` searchable history (filter by run) · `/b/<id>` one brief
- Login: single password (`SITE_PASSWORD`), signed 30-day cookie.
- `POST /api/briefs` with `Authorization: Bearer $INGEST_SECRET` and JSON
  `{ "run": "MORNING", "headline": "...", "moneyStatus": "On track", "html": "<full brief html>" }`
  returns `{ id, url, latestUrl }`.

## Vercel setup
1. Import this repo in Vercel.
2. Run `supabase/001_cos_briefs.sql` in the COS Supabase project (SQL editor).
3. Set `SITE_PASSWORD`, `SESSION_SECRET`, `INGEST_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`).

Without the Supabase variables the site stores briefs in `.data/briefs.json` (local development only).

## Agent prompt changes (replace the Resend email step)
After the skill renders and checks the brief:
1. POST it to `/api/briefs` (needs an HTTP-capable tool and `INGEST_SECRET`; never put the secret in a report or memory).
2. Text Stephanie with RingCentral `send_sms`, using the returned `url`, e.g.
   `Sunday MORNING brief: revenue on track, 3 need you. <url>`
3. Recipient phone numbers live in the `rules` table (the agent cannot read Vercel env vars). Update section 8 and the "approved recipients" rule to say texts go to the numbers in `rules`.
4. Urgent alerts (section 9) can use the same `send_sms`, with a link to `/` or a short plain message.
5. If the POST fails, retry once, then text without a link ("Brief ready but the site is down") and tell Robert.
