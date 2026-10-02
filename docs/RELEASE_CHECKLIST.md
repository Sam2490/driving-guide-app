# Production checklist

- [x] Android test APK (GitHub Actions, debug-signed)
- [ ] Android release build for Google Play (`.aab`, upload key)
- [ ] iOS release build (Apple Developer account, EAS or Xcode)
- [x] App icon and splash screen (first version)
- [x] App permissions reviewed (location when in use only)
- [ ] Privacy policy page (public URL, required by Google Play)
- [ ] Store listing: name, descriptions in Arabic and English, screenshots, category Education
- [ ] Android signing: create upload key, enrol in Play App Signing
- [ ] iOS signing
- [x] Production API configuration: not needed (no API)
- [x] Dependency audit (`npm audit`) — repeat before release
- [x] Security review (`docs/SECURITY.md`)
- [ ] Performance check on a low-end Android phone
- [ ] Accessibility pass with TalkBack and large fonts
- [x] Offline check of content (bundled)
- [ ] Location check on a real device (allow, deny, GPS off)
- [ ] Confirm content licences: sign artwork attribution (CC BY-SA 4.0) shown in About; permission for third-party question material
