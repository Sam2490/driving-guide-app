/**
 * Release hardening applied at `expo prebuild` (android/ and ios/ are generated, never edited by hand).
 *
 * Android
 *  - Release builds are signed with the private upload key when ANDROID_UPLOAD_STORE_FILE and the related
 *    variables are set (CI reads them from GitHub secrets). Without them the build falls back to the debug key,
 *    and CI labels that build "debug-signed, testing only".
 * iOS
 *  - Removes permission texts the app never uses ("Always" location, Motion).
 *  - Asks for approximate location by default (NSLocationDefaultAccuracyReduced).
 *  - Removes NSAllowsLocalNetworking (only needed to load the dev server). Set EXPO_DEV_LOCAL_NETWORK=1 to keep it
 *    for local debug builds.
 */
const { withAppBuildGradle, withInfoPlist, createRunOncePlugin } = require('expo/config-plugins');

const RELEASE_SIGNING = `
        release {
            if (System.getenv('ANDROID_UPLOAD_STORE_FILE')) {
                storeFile file(System.getenv('ANDROID_UPLOAD_STORE_FILE'))
                storePassword System.getenv('ANDROID_UPLOAD_STORE_PASSWORD')
                keyAlias System.getenv('ANDROID_UPLOAD_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_UPLOAD_KEY_PASSWORD')
            }
        }`;

function applyReleaseSigning(gradle) {
  if (gradle.includes("System.getenv('ANDROID_UPLOAD_STORE_FILE')")) return gradle;
  const sc = gradle.indexOf('signingConfigs {');
  if (sc < 0) throw new Error('withReleaseHardening: signingConfigs block not found in app/build.gradle');
  gradle = gradle.slice(0, sc + 'signingConfigs {'.length) + RELEASE_SIGNING + gradle.slice(sc + 'signingConfigs {'.length);
  const bt = gradle.indexOf('buildTypes {');
  const rel = gradle.indexOf('release {', bt);
  const line = gradle.indexOf('signingConfig signingConfigs.debug', rel);
  if (bt < 0 || rel < 0 || line < 0) throw new Error('withReleaseHardening: release buildType not found in app/build.gradle');
  return (
    gradle.slice(0, line) +
    "signingConfig System.getenv('ANDROID_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug" +
    gradle.slice(line + 'signingConfig signingConfigs.debug'.length)
  );
}

const UNUSED_IOS_KEYS = ['NSLocationAlwaysAndWhenInUseUsageDescription', 'NSLocationAlwaysUsageDescription', 'NSMotionUsageDescription'];

function applyIosHardening(plist, env = process.env) {
  for (const k of UNUSED_IOS_KEYS) delete plist[k];
  plist.NSLocationDefaultAccuracyReduced = true;
  const ats = plist.NSAppTransportSecurity;
  if (ats && env.EXPO_DEV_LOCAL_NETWORK !== '1') {
    delete ats.NSAllowsLocalNetworking;
    ats.NSAllowsArbitraryLoads = false;
  }
  return plist;
}

const withReleaseHardening = (config) => {
  config = withAppBuildGradle(config, (c) => {
    c.modResults.contents = applyReleaseSigning(c.modResults.contents);
    return c;
  });
  config = withInfoPlist(config, (c) => {
    c.modResults = applyIosHardening(c.modResults);
    return c;
  });
  return config;
};

module.exports = createRunOncePlugin(withReleaseHardening, 'with-release-hardening', '1.0.0');
module.exports.applyReleaseSigning = applyReleaseSigning;
module.exports.applyIosHardening = applyIosHardening;
