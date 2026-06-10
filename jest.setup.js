// Jest setup file
// Mock expo-sqlite to avoid native module errors in tests
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(() => []),
    getFirstAsync: jest.fn(() => null),
    runAsync: jest.fn(),
  })),
}));

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock @react-native-community/netinfo
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));
