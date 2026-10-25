---
name: analytics-and-conversions
description: >-
  Use this skill when designing, auditing, or implementing lead conversion
  tracking for quote forms, locality submissions, click-to-call buttons, or
  WhatsApp enquiry links on the Karali Fabrication website.
---

# Analytics & Conversion Tracking Skill

## Metadata & Provenance

- **Original Source Repository:** `coreyhaines31/marketingskills` (https://github.com/coreyhaines31/marketingskills — `skills/conversion-tracking/SKILL.md` v1.0.0, MIT License)
- **Purpose:** Ensure lead-generation events (form submissions, click-to-call taps, WhatsApp taps) are tracked accurately, privately, and strictly on confirmed completion rather than unvalidated button clicks.
- **Installation & Usage:** Installed project-locally at `.agents/skills/analytics-and-conversions/SKILL.md`. Activate whenever wiring analytics events, GTM/GA4/Cloudflare Web Analytics, or Supabase lead-capture telemetry.
- **Required Dependencies & Credentials:** None until an external analytics property ID (e.g. GA4 / GTM / Cloudflare Web Analytics) is supplied by the owner.
- **Antigravity Compatibility:** Native workspace skill discovered from `.agents/skills/analytics-and-conversions/SKILL.md`.
- **Verification Command:** Confirm file presence with `Test-Path ".agents/skills/analytics-and-conversions/SKILL.md"`.

---

## 1. Golden Rules of Karali Fabrication Conversion Tracking

1. **Fire Form Conversions ONLY on Confirmed Database Success:**
   - Never fire a lead conversion event on `submit` click or before validation.
   - A form conversion (`locality_submitted` or `quote_requested`) must fire **only** inside the `if (result.ok)` branch after Supabase returns a confirmed `201 Created` (`error === null`).
2. **Track High-Intent Direct Contact Actions Separately:**
   - Many industrial buyers prefer immediate phone or WhatsApp contact over forms.
   - Track outbound contact clicks as distinct micro-conversions:
     - `contact_call_click` (`#header-call-link`, `#call-button`, `#footer-call-link`)
     - `contact_whatsapp_click` (`#whatsapp-button`, `#footer-whatsapp-link`)
3. **CSP & Privacy Compliance:**
   - [`public/_headers`](../../../public/_headers) enforces a strict `Content-Security-Policy` (`default-src 'self'; connect-src 'self' https://smdxbjkeruhjerbrdply.supabase.co`).
   - Any external analytics script added in the future requires an explicit, reviewed update to `public/_headers` and the page's privacy notice.
   - Never include personal data (names, phone numbers, emails) in URL query parameters or analytics event payloads.
