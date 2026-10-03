# iOS version

The app is one codebase for Android and iOS. Every push builds the iOS app for the Simulator
(`.github/workflows/ios-build.yml`) to prove it compiles.

## Try it on an iPhone today (free)

1. Install **Expo Go** from the App Store.
2. On a computer with Node.js: `npm install` then `npx expo start` in this folder.
3. Scan the QR code with the iPhone camera. The phone and computer must be on the same Wi-Fi.

## Install a real build on iPhones (TestFlight / App Store)

Apple only allows signed apps on iPhones, so this needs an **Apple Developer Program** account (USD 99 per year).

1. Enrol at developer.apple.com and create the app in App Store Connect with bundle ID `sa.drivingguide.app`.
2. Create a free account at expo.dev, then run `npx eas-cli build -p ios --profile production` and let EAS create the certificates.
3. `npx eas-cli submit -p ios` uploads the build to TestFlight. Invite testers by email; they install with the TestFlight app.

Already configured for iOS: bundle ID, display name دليل القيادة, location "when in use" purpose text (English/Arabic), privacy manifest (no tracking), no background modes, iPhone only.
