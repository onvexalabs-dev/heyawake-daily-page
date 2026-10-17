# Heyawake Daily — game website

Companion marketing site, playable 4×4 puzzle demo, and legal/support pages.
Source: src/. Build output: dist/. No production Node packages or remote fonts.

## Preview
python tools/build_site.py
python tools/validate_site.py
python -m http.server 4173 --directory dist

## Publish
GitHub Actions builds the site on pushes to main. Public deployment is enabled only
when site.config.json has confirmed publisher details and legal_ready is true.
Complete legal_name, address_lines, country, and the public support/privacy email;
also add registration and VAT information if applicable. Do not invent these fields.
Set base_url to the final HTTPS website URL. Google Play is not yet advertised as live.

Run python tools/build_site.py --release and python tools/validate_site.py --release
before enabling public publication. GitHub Pages must use GitHub Actions as its source.

## Assets
src/assets contains shared AI-generated brand artwork, the round named app identity,
openly licensed self-hosted fonts, and actual Android screenshots. Example player
progress in screenshots is a deterministic test fixture; no ratings or reviews are invented.

The browser demo is a real verified puzzle from the game's catalogue. Its state
stays only in memory and is cleared on reload. No analytics, cookies or account.

## Legal facts
Policies describe Android build 0.5.0 with optional Google Mobile Ads and UMP consent.
All gameplay remains offline. Ages 13–15 receive no ads; ages 16+ may opt in.
Debug uses test IDs. Release live ads remain gated pending dashboard setup and device testing.
There is no cloud sync, separate analytics SDK or in-app purchase system.
Source references and launch checklist are in docs/legal-and-launch.md.

## app-ads.txt
The build includes the authorized seller record for publisher pub-9404893474354911.
AdMob crawls the hostname root, not a project subpath. The default GitHub project URL
therefore also needs the same file at https://onvexalabs-dev.github.io/app-ads.txt,
or use a dedicated domain/subdomain with this site at its root. Do not treat a file
only under /heyawake-daily-page/ as verified by AdMob.
