import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-worklets', () => {
  const handler = {
    get: function(target, prop) {
      if (prop === 'Worklets') {
        return {
          createRunInJsFn: jest.fn(),
          createRunInWorkletFn: jest.fn(),
          createSharedValue: jest.fn(() => ({ value: 0 })),
          createContext: jest.fn(),
        };
      }
      if (prop === 'serializableMappingCache') {
        return { set: jest.fn(), get: jest.fn(), delete: jest.fn() };
      }
      return jest.fn();
    }
  };
  return new Proxy({}, handler);
});
