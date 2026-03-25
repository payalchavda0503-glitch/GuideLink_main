/**
 * Required for RN Gradle autolinking (RNGP) — exposes Android applicationId to the CLI.
 */
module.exports = {
  project: {
    android: {
      packageName: 'com.app.guidelinked',
    },
  },
};
