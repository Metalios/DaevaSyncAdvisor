# DaevaArchitect Sync Stone Advisor v0.10

AION 2 Global community beta. Choose class, build focus, equipment slot, actual equipment family and whether Soul Fuse is unlocked. No arbitrary line count. Kromede and Ludra long-reach weapons have 3 ordinary lines, standard Unique gear 4, crafted Dragon Lord gear 5; Soul Fuse adds exactly one. Family presets are not an exhaustive item database and other items have no inferred capacity. Nonweapon slots offer standard and crafted families, only when the actual item matches. Source: https://aion2vault.com/builds/soul-binding/ (updated November 22, 2026); https://aion2.run/en/astuces/gravure-pierres-de-mana.

The BiS list shows ordinary targets plus a clearly labeled, provisional extra candidate if fused. The single-stat calculator still models one ordinary Sync attempt; fuse eligibility and probabilities are unverified. Existing stat exclusions are not modeled. Use a known per-attempt rate or opt into the inherited provisional base estimate. Changing capacity clears the rate to avoid reusing a conditional probability. Recommendations and weight data are inherited, not fully validated. No existing-stat form, multiple targets or allocation optimizer. Journal uses gear families rather than line count, stores locally, exports CSV, and preserves legacy reports. No central reporting.

## Run

Node 22.12+; `npm install`, `npm test`, `npm run dev`. `npm run build` outputs `dist/`. For a standalone website, the separately packaged standalone HTML can be renamed to index.html and hosted directly.

## Discord

Copy `.env.example` to `.env`, set `VITE_DISCORD_CLIENT_ID`, build and host dist on an HTTPS host such as Cloudflare Pages. In Discord Developer Portal enable Activities and map `/` to the hosting domain; test as an authorized tester before public distribution. SDK live integration and production build are not verified in this revision. No OAuth or bot backend needed for local calculations.
