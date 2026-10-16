# Legal and launch facts

The legal copy covers the current application and site, rather than unimplemented
advertising or data collection. The app has local gameplay storage and locally
scheduled optional notifications. The website uses no analytics or marketing
cookies; fonts and images are served locally. A chosen share destination or email
provider is outside the app's control.

Publisher identity, address, country and public contact email must be supplied
in site.config.json. The public deployment stays disabled until these are complete.
Add registration/representative/VAT details where applicable to the actual publisher.
Do not claim the brand name is a registered legal entity without verification.

Revisit privacy and store Data safety before AdMob/UMP, analytics or cloud sync are added.
The supplied AdMob rewarded unit is planned to grant 250 points; this release does not
yet load ads. No obsolete EU online-dispute-resolution platform link is included.

## Official references consulted
- Google Play privacy policy requirements: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play icon specification: https://developer.android.com/distribute/google-play/resources/icon-design-specifications
- AdMob seller file: https://support.google.com/admob/answer/9363762
- GitHub privacy: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- EU GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- German provider information, if applicable: https://www.gesetze-im-internet.de/ddg/__5.html

## Checklist
- Confirm publisher data and final hosting domain.
- Review current app functionality against all policies.
- Enable GitHub Pages and verify every legal URL works without login.
- Set the Play Console privacy/support URLs to the deployed pages.
- Serve app-ads.txt at the domain root before activating AdMob.
- Replace the prerelease download message only once the Play listing is actually live.
