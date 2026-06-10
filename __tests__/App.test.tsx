import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import App from "../App";

// Mock the services used by App
jest.mock("../src/services/DatabaseService", () => ({
  init: jest.fn(() => Promise.resolve()),
}));

jest.mock("../src/services/AuthService", () => ({
  getCurrentUser: jest.fn(() => Promise.resolve(null)),
  getUserByUsername: jest.fn(() => Promise.resolve(null)),
  logout: jest.fn(() => Promise.resolve()),
}));

jest.mock("../src/services/StorageService", () => ({
  setCurrentUsername: jest.fn(),
  getUserProfile: jest.fn(() => Promise.resolve(null)),
  createInitialProfile: jest.fn(() => Promise.resolve({})),
  setSyncCallback: jest.fn(),
}));

jest.mock("../src/services/SupabaseSyncService", () => ({
  syncUserProfile: jest.fn(),
  syncPendingChanges: jest.fn(),
}));

// Mock navigation components
jest.mock("../src/navigation/StackNavigator", () => {
  const { Text } = require("react-native");
  return function MockStackNavigator() {
    return <Text>StackNavigator</Text>;
  };
});

jest.mock("../src/context/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("App", () => {
  it("muestra el indicador de carga inicialmente", () => {
    const { getByTestId, UNSAFE_getAllByType } = render(<App />);
    // El ActivityIndicator debe estar visible durante la carga
    const indicators = UNSAFE_getAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThan(0);
  });

  it("renderiza sin errores después de la inicialización", async () => {
    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("StackNavigator")).toBeTruthy();
    });
  });
});
