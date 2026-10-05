// Dynamic part of the Expo config. Everything else lives in app.json.
// CI sets BUILD_NUMBER to the workflow run number, so every store upload gets a higher build number
// (Google Play and App Store Connect reject a build number they have already seen).
// Local builds keep the numbers from app.json.
module.exports = ({ config }) => {
  const raw = process.env.BUILD_NUMBER;
  const build = raw === undefined ? undefined : Number(raw);
  if (raw !== undefined && !(Number.isInteger(build) && build > 0 && build < 2100000000)) {
    throw new Error(`BUILD_NUMBER must be a positive integer, got "${raw}"`);
  }
  if (build === undefined) return config;
  return {
    ...config,
    android: { ...config.android, versionCode: build },
    ios: { ...config.ios, buildNumber: String(build) },
  };
};
