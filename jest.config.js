module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-redux|reselect|@reduxjs/toolkit|immer|@react-navigation|react-native-(screens|safe-area-context|gesture-handler|reanimated|worklets|vector-icons|masked-view|drawer-layout)|@react-native-async-storage/async-storage|@react-native-community/datetimepicker)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/backend/'],
};