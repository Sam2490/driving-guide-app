# Security and privacy review

Last reviewed: 5 October 2026 (audit F-01 to F-18 and re-audit N-01 to N-08 addressed; see the audit report).

| Area | Status |
| --- | --- |
| Permissions | Android: `ACCESS_COARSE_LOCATION` only (plus `INTERNET`, `VIBRATE` added by Expo). Precise, background location, activity recognition, audio, overlay and storage permissions are explicitly blocked. iOS: approximate when-in-use location only (`NSLocationDefaultAccuracyReduced`), purpose text in 5 languages; no Always or Motion keys. CI fails if this drifts (`.github/scripts/check-native-config.js`). |
| Location | Asked only after the user taps Find nearby and reads an in-app explanation. One low-accuracy reading, used in memory to sort schools by distance to town centres, never stored, logged or sent. App works fully without it. |
| Data storage | AsyncStorage holds language, theme, level progress and the exam in progress (`exam.v1`: question ids, option order, answers, times — no text). All values are validated on read; bad or expired data falls back to defaults. No personal data, IDs or accounts. |
| Backup | `allowBackup` stays on by decision: it only carries settings and XP, and lets players keep progress on a new phone. |
| Network | No API calls. Release builds do not allow cleartext HTTP. iOS: `NSAllowsArbitraryLoads` false and `NSAllowsLocalNetworking` removed for builds (set `EXPO_DEV_LOCAL_NETWORK=1` for local debug only). |
| Secrets | None in the app or repo. The Android upload key lives only in GitHub secrets and the owner's offline backup. `.gitignore` covers `.env*`, keystores and key files. |
| Links | Only fixed HTTPS URLs (Absher, the privacy policy) and map searches built from bundled school names (URL-encoded). No WebView. |
| Deep links | Scheme `drivingguide://`. `src/app/+native-intent.tsx` drops links over 512 characters or with malformed / excessive percent-encoding before the router parses them (mitigates GHSA-vcc3-ghjq-m6fr in `decode-uri-component` until Expo SDK 58). Unknown ids show an empty state; unknown routes show a translated not-found screen. |
| Errors | Root `ErrorBoundary` shows a translated message with no technical details. Nothing is logged. |
| Dependencies | Official Expo / React Native packages only. `npm audit --omit=dev` runs in CI (report only). Remaining advisories are in build tools or transitive (see audit F-08, F-09); fix with the Expo SDK upgrade, never `npm audit fix --force`. Dependabot watches actions and npm. |
| Android release | Not debuggable. R8 and resource shrinking on. Signed with the private upload key when the secrets are set; CI labels any debug-signed build "testing only" and fails if the secrets are set but the APK still has the debug certificate. |
| CI | Third-party actions pinned to commit SHAs (Node 24 versions); `ubuntu-24.04` pinned; Gradle cache uses the open-source `basic` provider. Only the release job has `contents: write`. Build numbers come from the workflow run number (`app.config.js`, checked after prebuild). |
| Updates | Dependabot groups action updates and minor/patch npm updates. Packages pinned by the Expo SDK and major versions of build/test tools are ignored and move with the SDK upgrade. |
| Signing key | The upload key and password were shared once through the setup chat: keep them in a password manager and delete downloaded copies. If they may have leaked, ask Google Play to reset the upload key (Play App Signing keeps the app signing key). |

**Limits that cannot be removed:** the question bank ships inside the app, so anyone can read it by unpacking the APK. That is acceptable for a practice simulator; this app must not be presented as a secure or official exam. The app cannot be described as "100% secure".
