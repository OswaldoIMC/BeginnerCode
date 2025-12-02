import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys para AsyncStorage
const THEME_KEY = "@BeginnerCode:theme";

/**
 * Colores del tema claro
 */
export const lightTheme = {
  primary: "#142646",
  secondary: "#03dac6",
  background: "#f5f5f5",
  surface: "#ffffff",
  error: "#b00020",
  success: "#4CAF50",
  warning: "#FF9800",
  text: "#000000",
  textSecondary: "#777777",
  card: "#f9f9f9",
  border: "#E0E0E0",
};

/**
 * Colores del tema oscuro
 */
export const darkTheme = {
  primary: "#4A90E2",
  secondary: "#03dac6",
  background: "#121212",
  surface: "#1E1E1E",
  error: "#CF6679",
  success: "#66BB6A",
  warning: "#FFA726",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  card: "#2C2C2C",
  border: "#3A3A3A",
};

/**
 * Interface para el contexto del tema
 */
interface ThemeContextType {
  isDarkMode: boolean;
  theme: typeof lightTheme;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

/**
 * Crear el contexto
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider del tema
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  /**
   * Cargar preferencia de tema al iniciar
   */
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Cargar la preferencia guardada
   */
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error al cargar preferencia de tema:", error);
    }
  };

  /**
   * Guardar la preferencia de tema
   */
  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    } catch (error) {
      console.error("Error al guardar preferencia de tema:", error);
    }
  };

  /**
   * Alternar entre modo claro y oscuro
   */
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    saveThemePreference(newMode);
  };

  /**
   * Establecer modo oscuro directamente
   */
  const setDarkMode = (value: boolean) => {
    setIsDarkMode(value);
    saveThemePreference(value);
  };

  /**
   * Obtener el tema actual
   */
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, theme, toggleTheme, setDarkMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook para usar el tema
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
