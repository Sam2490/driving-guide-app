// Build numbers come from CI so every store upload is higher than the last (audit N-01).
// eslint-disable-next-line @typescript-eslint/no-require-imports -- app.config.js is a CommonJS file read by Expo
const appConfig = require('../../app.config.js');
const base = require('../../app.json').expo;

describe('app.config.js build number', () => {
  const env = process.env.BUILD_NUMBER;
  afterEach(() => {
    if (env === undefined) delete process.env.BUILD_NUMBER;
    else process.env.BUILD_NUMBER = env;
  });
  it('keeps app.json numbers for local builds', () => {
    delete process.env.BUILD_NUMBER;
    expect(appConfig({ config: base })).toBe(base);
  });
  it('uses the CI run number on both platforms', () => {
    process.env.BUILD_NUMBER = '57';
    const out = appConfig({ config: base });
    expect(out.android.versionCode).toBe(57);
    expect(out.ios.buildNumber).toBe('57');
    expect(out.android.package).toBe(base.android.package);
    expect(out.ios.bundleIdentifier).toBe(base.ios.bundleIdentifier);
  });
  it('rejects a bad value instead of building with it', () => {
    for (const bad of ['abc', '0', '-3', '1.5']) {
      process.env.BUILD_NUMBER = bad;
      expect(() => appConfig({ config: base })).toThrow(/BUILD_NUMBER/);
    }
  });
});
