// The release-hardening config plugin edits generated native files; these tests pin its behaviour.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- the plugin is a CommonJS module run by Expo at prebuild
const { applyReleaseSigning, applyIosHardening } = require('../../plugins/withReleaseHardening');

const GRADLE = `android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            signingConfig signingConfigs.debug
            minifyEnabled enableMinifyInReleaseBuilds
        }
    }
}`;

describe('release signing', () => {
  it('signs release builds with the upload key when it is provided, and keeps debug builds on the debug key', () => {
    const out = applyReleaseSigning(GRADLE);
    expect(out).toContain("storeFile file(System.getenv('ANDROID_UPLOAD_STORE_FILE'))");
    expect(out).toContain("signingConfig System.getenv('ANDROID_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug");
    const debugBlock = out.slice(out.indexOf('buildTypes {'), out.indexOf('release {', out.indexOf('buildTypes {')));
    expect(debugBlock).toContain('signingConfig signingConfigs.debug');
  });
  it('is idempotent', () => {
    const once = applyReleaseSigning(GRADLE);
    expect(applyReleaseSigning(once)).toBe(once);
  });
  it('fails loudly if the template changes', () => {
    expect(() => applyReleaseSigning('android {}')).toThrow(/signingConfigs/);
  });
});

describe('iOS hardening', () => {
  const plist = () => ({
    NSLocationWhenInUseUsageDescription: 'x',
    NSLocationAlwaysUsageDescription: 'x',
    NSLocationAlwaysAndWhenInUseUsageDescription: 'x',
    NSMotionUsageDescription: 'x',
    NSAppTransportSecurity: { NSAllowsArbitraryLoads: false, NSAllowsLocalNetworking: true },
  });
  it('removes unused permission texts and local networking, and reduces location accuracy', () => {
    const out = applyIosHardening(plist(), {});
    expect(Object.keys(out)).toEqual(['NSLocationWhenInUseUsageDescription', 'NSAppTransportSecurity', 'NSLocationDefaultAccuracyReduced']);
    expect(out.NSAppTransportSecurity).toEqual({ NSAllowsArbitraryLoads: false });
    expect(out.NSLocationDefaultAccuracyReduced).toBe(true);
  });
  it('keeps local networking for local debug builds when asked', () => {
    expect(applyIosHardening(plist(), { EXPO_DEV_LOCAL_NETWORK: '1' }).NSAppTransportSecurity.NSAllowsLocalNetworking).toBe(true);
  });
});
