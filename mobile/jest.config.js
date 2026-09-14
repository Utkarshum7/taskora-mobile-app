module.exports = {
  preset: '@react-native/jest-preset',
  // The preset's default transformIgnorePatterns only lets RN's own
  // packages through babel-jest; several libraries we depend on ship an
  // ES module build with no pre-compiled CJS fallback (react-redux,
  // @react-navigation/*, react-native-screens, react-native-gesture-handler,
  // react-native-safe-area-context) and need transforming too, or Jest
  // fails with "Cannot use import statement outside a module".
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-redux|react-native-screens|react-native-gesture-handler|react-native-safe-area-context|@reduxjs/toolkit|immer)/)',
  ],
};
