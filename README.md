# Driving Guide (دليل القيادة)

React Native (Expo) app for preparing for the Saudi driving theory test: trainee guide, 192 traffic signs, a 30-question mock exam, a level challenge and a driving-school finder. Migrated from the single-file React web app. Arabic, English and Urdu; light and dark.

It is an educational practice app, not an official government app.

## Run it

```bash
npm install
npx expo start          # scan the QR code with Expo Go, or press "a" for an Android emulator
npm test                # unit + screen tests
npm run typecheck
npx expo lint
```

## Get an APK to install on a phone

Push to `main` (or run the **Android test APK** workflow by hand in the Actions tab). GitHub builds a release APK and publishes it under **Releases** as `driving-guide-<version>-build<N>.apk`. Open that link on the phone, download and install (allow "install unknown apps" for the browser when Android asks).

These test APKs are signed with the debug key. For Google Play, create an upload key and build an `.aab` (see `docs/RELEASE_CHECKLIST.md`).

## Project layout

```
src/app/            screens (Expo Router): (tabs)/index, guide, signs, test, schools; exam, result, review, level/[n], settings, about
src/components/     UI kit (Text, Card, Button, Segmented, Dialog, PickerSheet, OptionButton, SchoolCard, Journey, Icon, Media)
src/features/       quiz engine, level engine, school search (pure TypeScript, unit-tested)
src/services/       location (one-time, foreground only), maps links, validated local storage
src/data/           generated content: 661 questions, 192 signs, guide, steps, tips, schools, cities
src/i18n/           ar, en, ur strings
src/theme/          colours and fonts from the web app
assets/             question images, sign images, fonts are loaded from @expo-google-fonts
scripts/            one-off extraction from the web app (exam.html)
```

See `docs/` for architecture, security, testing and the release checklist.
