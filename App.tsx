import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import StorageService from "./src/services/StorageService";
import SupabaseSyncService from "./src/services/SupabaseSyncService";

const App: React.FC = () => {
  useEffect(() => {
    // Configurar sincronización automática
    initializeSync();
  }, []);

  /**
   * Inicializa la sincronización entre StorageService y SupabaseSyncService
   * Esto evita importaciones circulares
   */
  const initializeSync = () => {
    // Configurar callback para sincronización automática
    StorageService.setSyncCallback((profile) => {
      // Sincronizar en background sin bloquear la UI
      SupabaseSyncService.syncUserProfile(profile).catch((error) => {
        console.error("Error en sincronización automática:", error);
      });
    });

    console.log("Sistema de sincronización inicializado");
  };

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
