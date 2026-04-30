import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./src/context/ThemeContext";
import StackNavigator from "./src/navigation/StackNavigator";
import AuthService from "./src/services/AuthService";
import StorageService from "./src/services/StorageService";
import SupabaseSyncService from "./src/services/SupabaseSyncService";
import SQLiteStorageService from "./src/services/SQLiteStorageService";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<"Login" | "Home">("Login");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Verifica si hay una sesión activa al iniciar la app
   */
  const checkAuthStatus = async () => {
    try {
      console.log("Verificando sesión activa...");

      // Inicializar base de datos SQLite
      await SQLiteStorageService.initDatabase();
      console.log("SQLite inicializado");

      // Verificar si hay una sesión activa
      const currentUser = await AuthService.getCurrentUser();

      if (!currentUser) {
        console.log("No hay sesión activa, ir a Login");
        setInitialRoute("Login");
        setIsLoading(false);
        return;
      }

      console.log("Sesión activa encontrada:", currentUser);

      // Verificar que el usuario todavía existe en el sistema
      const userExists = await AuthService.getUserByUsername(currentUser);

      if (!userExists) {
        console.log("El usuario ya no existe en el sistema, cerrando sesión");
        await AuthService.logout();
        StorageService.setCurrentUsername(null);
        setInitialRoute("Login");
        setIsLoading(false);
        return;
      }

      // Establecer el usuario actual en StorageService
      StorageService.setCurrentUsername(currentUser);

      // Verificar que el perfil exista
      let profile = await StorageService.getUserProfile(currentUser);

      if (!profile) {
        console.log("No se encontró perfil, creando uno nuevo");
        profile = await StorageService.createInitialProfile(currentUser);
      } else {
        console.log("Perfil cargado para:", currentUser);
      }

      // Configurar callback de sincronización
      StorageService.setSyncCallback((profile) => {
        SupabaseSyncService.syncUserProfile(profile);
      });

      // Intentar sincronizar datos pendientes si hay conexión
      SupabaseSyncService.syncPendingChanges();

      // Ir al Home
      setInitialRoute("Home");
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      // En caso de error, cerrar sesión por seguridad
      await AuthService.logout();
      StorageService.setCurrentUsername(null);
      setInitialRoute("Login");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#142646" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StackNavigator initialRoute={initialRoute} />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
