#!/usr/bin/env node
/**
 * Fails the build if the generated native projects drift from the audited release configuration.
 * Usage: node .github/scripts/check-native-config.js android|ios   (run after `expo prebuild`)
 */
const fs = require('fs');
const path = require('path');

const platform = process.argv[2];
const errors = [];
const must = (ok, msg) => ok || errors.push(msg);

function grantedPermissions(manifest) {
  return [...manifest.matchAll(/<uses-permission\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => !/tools:node="remove"/.test(tag))
    .map((tag) => (tag.match(/android:name="([^"]+)"/) || [])[1]);
}

if (platform === 'android') {
  const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
  const perms = grantedPermissions(manifest);
  const allowed = ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.INTERNET', 'android.permission.VIBRATE'];
  for (const p of perms) must(allowed.includes(p), `Unexpected Android permission: ${p}`);
  must(!/usesCleartextTraffic="true"/.test(manifest), 'Release manifest allows cleartext traffic');
  must(!/android:debuggable="true"/.test(manifest), 'Release manifest is debuggable');
  const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
  must(gradle.includes("System.getenv('ANDROID_UPLOAD_STORE_FILE') ? signingConfigs.release"), 'Release signing hook missing from app/build.gradle');
  if (process.env.BUILD_NUMBER) {
    const vc = (gradle.match(/versionCode\s+(\d+)/) || [])[1];
    must(vc === process.env.BUILD_NUMBER, `versionCode is ${vc}, expected BUILD_NUMBER ${process.env.BUILD_NUMBER}`);
  }
  const props = fs.readFileSync('android/gradle.properties', 'utf8');
  must(/android\.enableMinifyInReleaseBuilds=true/.test(props), 'R8 minify is off');
  must(/android\.enableShrinkResourcesInReleaseBuilds=true/.test(props), 'Resource shrinking is off');
} else if (platform === 'ios') {
  const dir = fs.readdirSync('ios').find((d) => fs.existsSync(path.join('ios', d, 'Info.plist')));
  const plist = fs.readFileSync(path.join('ios', dir, 'Info.plist'), 'utf8');
  for (const k of ['NSLocationAlwaysUsageDescription', 'NSLocationAlwaysAndWhenInUseUsageDescription', 'NSMotionUsageDescription', 'NSAllowsLocalNetworking', 'UIBackgroundModes']) {
    must(!plist.includes(`<key>${k}</key>`), `Info.plist must not contain ${k}`);
  }
  must(/<key>NSLocationDefaultAccuracyReduced<\/key>\s*<true\/>/.test(plist), 'NSLocationDefaultAccuracyReduced should be true');
  if (process.env.BUILD_NUMBER) {
    const bn = (plist.match(/<key>CFBundleVersion<\/key>\s*<string>([^<]+)<\/string>/) || [])[1];
    must(bn === process.env.BUILD_NUMBER, `CFBundleVersion is ${bn}, expected BUILD_NUMBER ${process.env.BUILD_NUMBER}`);
  }
  for (const lang of ['ar', 'en', 'ur', 'hi', 'bn']) {
    const f = path.join('ios', dir, 'Supporting', `${lang}.lproj`, 'InfoPlist.strings');
    must(fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('NSLocationWhenInUseUsageDescription'), `Missing translated location prompt for ${lang}`);
  }
} else {
  console.error('Usage: check-native-config.js android|ios');
  process.exit(2);
}

if (errors.length) {
  for (const e of errors) console.log(`::error::${e}`);
  process.exit(1);
}
console.log(`${platform}: native release configuration OK`);
