module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // zod v4's package source uses `export * as core from '...'`, which
  // Metro's default RN babel preset doesn't transform on its own —
  // without this plugin, bundling fails with "Export namespace should be
  // first transformed by @babel/plugin-transform-export-namespace-from".
  plugins: ['@babel/plugin-transform-export-namespace-from'],
};
