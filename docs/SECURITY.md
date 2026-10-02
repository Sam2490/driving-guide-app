# Security and privacy review

| Area | Status |
| --- | --- |
| Permissions | Android: `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` (plus `INTERNET`, `VIBRATE` added by Expo). Background location, audio, overlay and storage permissions are explicitly blocked. iOS: when-in-use location only, with a purpose string. |
| Location | Asked only after the user taps Find nearby and reads an in-app explanation. One reading, used in memory to sort schools, never stored, logged or sent. App works fully without it. |
| Data storage | AsyncStorage holds language, theme and level progress only. Values are validated on read; bad data falls back to defaults. No personal data, IDs or accounts. |
| Network | No API calls. Release builds do not allow cleartext HTTP (Expo default; cleartext only in debug builds). iOS App Transport Security unchanged. |
| Secrets | None in the app. |
| Links | Only fixed URLs: Absher (`https://www.absher.sa`) and map searches built from bundled school names (URL-encoded). No WebView. |
| Deep links | Scheme `drivingguide://` from Expo Router; routes only show bundled content, and unknown ids show an empty state. |
| Dependencies | Official Expo / React Native packages only (router, location, image, font, haptics, splash, svg, async-storage, safe-area, screens). Run `npm audit` before each release. |
| Android release | Not debuggable. Test APKs are signed with the debug key; Play builds need a private upload key kept outside the repo. |

**Limits that cannot be removed:** the question bank ships inside the app, so anyone can read it by unpacking the APK. That is acceptable for a practice simulator; this app must not be presented as a secure or official exam. The app cannot be described as "100% secure".
