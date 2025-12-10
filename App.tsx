import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import StackNavigator from "./src/navigation/StackNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import StorageService from "./src/services/StorageService";
import SupabaseSyncService from "./src/services/SupabaseSyncService";
import AuthService from "./src/services/AuthService";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<"Login" | "Home">("Login");

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Configurar sincronización automática
        StorageService.setSyncCallback((profile) => {
          SupabaseSyncService.syncUserProfile(profile).catch((error) => {
            console.error("Error en sincronización automática:", error);
          });
        });

        console.log("Sistema de sincronización inicializado");

        // 2. Verificar si hay una sesión activa
        const hasSession = await AuthService.hasActiveSession();

        if (hasSession) {
          console.log("Sesión activa encontrada");
          setInitialRoute("Home");
        } else {
          console.log("No hay sesión activa");
          setInitialRoute("Login");
        }
      } catch (error) {
        console.error("Error al inicializar app:", error);
        setInitialRoute("Login");
      } finally {
        // Pequeño delay para evitar flash
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    // Ejecutar la inicialización
    initializeApp();
  }, []);

  // Mostrar splash screen mientras carga
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
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default App;
